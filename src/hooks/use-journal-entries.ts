
"use client";

import { useState, useEffect, useCallback } from 'react';
import { db } from '@/lib/firebase';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  writeBatch,
  Timestamp,
  serverTimestamp,
} from 'firebase/firestore';
import { type JournalEntry, type JournalEntryData } from '@/types';

const GUEST_ENTRIES_KEY = 'guest-journal-entries';

const initialEntries: Omit<JournalEntry, 'createdAt' | 'updatedAt'>[] = [
    {
        id: '1',
        title: 'First Day of Spring',
        content: '<p>Today was a beautiful day. The sun was shining and the birds were singing. I went for a long walk in the park and felt so refreshed. It feels like a new beginning.</p>',
        color: '#A8D0E6',
    },
    {
        id: '2',
        title: 'A New Recipe',
        content: '<p>I tried cooking a new pasta recipe today. It was a bit challenging, but the result was delicious! <b>I should definitely make it again.</b> My family loved it too.</p>',
        color: '#FADADD',
    },
    {
        id: '3',
        title: 'Project Brainstorm',
        content: '<p>Had a great brainstorming session for my new project. I have so many ideas now. <i>Feeling very inspired and motivated to start working on it.</i></p>',
        color: '#E6E6FA',
    },
].map((entry, index) => ({
    ...entry,
    createdAt: new Date(Date.now() - index * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - index * 24 * 60 * 60 * 1000).toISOString(),
}));


const convertTimestamps = (entry: JournalEntryData & { id: string }): JournalEntry => ({
  ...entry,
  createdAt: (entry.createdAt as Timestamp).toDate(),
  updatedAt: (entry.updatedAt as Timestamp).toDate(),
});

export function useJournalEntries(userId: string | undefined, isGuest: boolean) {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const getGuestEntries = useCallback(() => {
    const localData = localStorage.getItem(GUEST_ENTRIES_KEY);
    if (localData) {
      try {
        return JSON.parse(localData).map((entry: any) => ({
          ...entry,
          createdAt: new Date(entry.createdAt),
          updatedAt: new Date(entry.updatedAt),
        }));
      } catch {
        return initialEntries.map(e => ({...e, createdAt: new Date(e.createdAt), updatedAt: new Date(e.updatedAt)}));
      }
    }
    return initialEntries.map(e => ({...e, createdAt: new Date(e.createdAt), updatedAt: new Date(e.updatedAt)}));
  }, []);

  const migrateGuestEntries = useCallback(async (uid: string) => {
    const guestEntries = getGuestEntries();
    const defaultEntries = initialEntries.map(e => ({...e, createdAt: new Date(e.createdAt), updatedAt: new Date(e.updatedAt)}));

    if (guestEntries.length === 0 || JSON.stringify(guestEntries) === JSON.stringify(defaultEntries)) {
      return; 
    }

    const collectionRef = collection(db, 'users', uid, 'entries');
    const batch = writeBatch(db);

    guestEntries.forEach((entry: JournalEntry) => {
      const { id, ...entryData } = entry;
      const newDocRef = doc(collectionRef);
      batch.set(newDocRef, {
        ...entryData,
        createdAt: Timestamp.fromDate(new Date(entry.createdAt)),
        updatedAt: Timestamp.fromDate(new Date(entry.updatedAt)),
      });
    });

    try {
      await batch.commit();
      localStorage.removeItem(GUEST_ENTRIES_KEY);
    } catch (error) {
      console.error("Failed to migrate guest entries:", error);
    }
  }, [getGuestEntries]);


  useEffect(() => {
    if (isGuest) {
      setEntries(getGuestEntries());
      setLoading(false);
      return;
    }
    
    if (userId) {
      setLoading(true);
      
      migrateGuestEntries(userId).then(() => {
        const collectionRef = collection(db, 'users', userId, 'entries');
        const q = query(collectionRef, orderBy('createdAt', 'desc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
          if (snapshot.empty && !localStorage.getItem(GUEST_ENTRIES_KEY)) {
             const defaultEntries = initialEntries.map(e => ({...e, createdAt: new Date(e.createdAt), updatedAt: new Date(e.updatedAt)}));
             setEntries(defaultEntries);
          } else {
            const serverEntries = snapshot.docs.map(doc => convertTimestamps({ id: doc.id, ...(doc.data() as JournalEntryData) }));
            setEntries(serverEntries);
          }
          setLoading(false);
        }, (error) => {
          console.error("Error fetching journal entries:", error);
          setLoading(false);
        });

        return () => unsubscribe();
      });
    } else {
        setLoading(false);
    }
  }, [userId, isGuest, getGuestEntries, migrateGuestEntries]);
  
  useEffect(() => {
    if (isGuest) {
        const defaultEntries = initialEntries.map(e => ({...e, createdAt: new Date(e.createdAt), updatedAt: new Date(e.updatedAt)}));
        if (JSON.stringify(entries) !== JSON.stringify(defaultEntries)) {
           localStorage.setItem(GUEST_ENTRIES_KEY, JSON.stringify(entries));
        }
    }
  }, [entries, isGuest]);

  const addEntry = async (entry: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date();
    const newEntry: JournalEntry = { 
        ...entry, 
        id: now.toISOString(), // Temporary ID
        createdAt: now, 
        updatedAt: now 
    };

    if (isGuest) {
      setEntries(prev => {
        const defaultEntries = initialEntries.map(e => ({...e, createdAt: new Date(e.createdAt), updatedAt: new Date(e.updatedAt)}));
        if(JSON.stringify(prev) === JSON.stringify(defaultEntries)) {
          return [newEntry]
        }
        return [newEntry, ...prev]
      });
      return;
    }
    
    if(userId) {
        await addDoc(collection(db, 'users', userId, 'entries'), {
            ...entry,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });
    }
  };

  const updateEntry = async (entry: JournalEntry) => {
    if (isGuest) {
        const updatedEntry = { ...entry, updatedAt: new Date() };
        setEntries(prev => prev.map(e => (e.id === entry.id ? updatedEntry : e)));
        return;
    }
    if (userId) {
        const entryRef = doc(db, 'users', userId, 'entries', entry.id);
        const { id, createdAt, ...dataToUpdate } = entry;
        await updateDoc(entryRef, {
            ...dataToUpdate,
            updatedAt: serverTimestamp(),
        });
    }
  };

  const deleteEntry = async (id: string) => {
    if (isGuest) {
        setEntries(prev => prev.filter(e => e.id !== id));
        return;
    }

    if(userId) {
        await deleteDoc(doc(db, 'users', userId, 'entries', id));
    }
  };

  return { entries, addEntry, updateEntry, deleteEntry, loading };
}
