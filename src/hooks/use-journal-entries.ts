
"use client";

import { useState, useEffect, useCallback } from 'react';
import { db } from '@/lib/firebase';
import {
  collection,
  query,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  writeBatch,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { type JournalEntry, type JournalEntryData } from '@/types';

const GUEST_ENTRIES_KEY = 'guest-journal-entries';

const defaultEntries: JournalEntryData[] = [
    {
        title: 'First Day of Spring',
        content: '<p>Today was a beautiful day. The sun was shining and the birds were singing. I went for a long walk in the park and felt so refreshed. It feels like a new beginning.</p>',
        color: '#A8D0E6',
    },
    {
        title: 'A New Recipe',
        content: '<p>I tried cooking a new pasta recipe today. It was a bit challenging, but the result was delicious! <b>I should definitely make it again.</b> My family loved it too.</p>',
        color: '#FADADD',
    },
    {
        title: 'Project Brainstorm',
        content: '<p>Had a great brainstorming session for my new project. I have so many ideas now. <i>Feeling very inspired and motivated to start working on it.</i></p>',
        color: '#E6E6FA',
    },
];

export function useJournalEntries(userId: string | undefined, isGuest: boolean) {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const getGuestEntries = useCallback((): JournalEntry[] => {
    try {
        const localData = localStorage.getItem(GUEST_ENTRIES_KEY);
        if (localData) {
            const parsedData = JSON.parse(localData);
            if (Array.isArray(parsedData) && parsedData.length > 0) {
                return parsedData;
            }
        }
    } catch (error) {
        console.error("Error reading guest entries from localStorage", error);
    }
    // If no local data, return default entries with random IDs
    return defaultEntries.map(e => ({ ...e, id: Math.random().toString(36).substring(2, 15) }));
  }, []);


  const migrateGuestEntries = useCallback(async (uid: string) => {
    const guestEntries = getGuestEntries();
    const guestEntryIds = guestEntries.map((e: JournalEntry) => e.id).sort();
    const defaultEntryIds = defaultEntries.map((e, index) => guestEntries[index]?.id).sort();
    
    const areDefault = guestEntryIds.length === defaultEntryIds.length && guestEntryIds.every((value, index) => value === defaultEntryIds[index]);

    if (guestEntries.length === 0 || areDefault) {
      return; 
    }

    const collectionRef = collection(db, 'users', uid, 'entries');
    const batch = writeBatch(db);

    guestEntries.forEach((entry: JournalEntry) => {
      const { id, ...entryData } = entry;
      const newDocRef = doc(collectionRef);
      batch.set(newDocRef, entryData);
    });

    try {
      await batch.commit();
      localStorage.removeItem(GUEST_ENTRIES_KEY);
    } catch (error) {
      console.error("Failed to migrate guest entries:", error);
    }
  }, [getGuestEntries]);

  useEffect(() => {
    let unsubscribe: () => void = () => {};

    const loadData = async () => {
      setLoading(true);
      if (isGuest) {
        setEntries(getGuestEntries());
        setLoading(false);
      } else if (userId) {
        await migrateGuestEntries(userId);
        
        const collectionRef = collection(db, 'users', userId, 'entries');
        const q = query(collectionRef);

        unsubscribe = onSnapshot(q, (snapshot) => {
          if (snapshot.empty) {
             setEntries(defaultEntries.map(e => ({ ...e, id: Math.random().toString(36).substring(2, 15) })));
          } else {
            const serverEntries: JournalEntry[] = snapshot.docs.map(doc => ({
              id: doc.id,
              ...(doc.data() as JournalEntryData),
            }));
            setEntries(serverEntries);
          }
          setLoading(false);
        }, (error) => {
          console.error("Error fetching journal entries:", error);
          setEntries(defaultEntries.map(e => ({ ...e, id: Math.random().toString(36).substring(2, 15) }))); // Fallback to default on error
          setLoading(false);
        });
      } else {
        setEntries([]);
        setLoading(false);
      }
    };
    
    loadData();

    return () => unsubscribe();
  }, [userId, isGuest, getGuestEntries, migrateGuestEntries]);
  
  useEffect(() => {
    if (isGuest) {
       localStorage.setItem(GUEST_ENTRIES_KEY, JSON.stringify(entries));
    }
  }, [entries, isGuest]);

  const addEntry = async (entry: JournalEntryData) => {
    if (isGuest) {
      const newEntry: JournalEntry = { 
          ...entry, 
          id: new Date().toISOString(),
      };
      setEntries(prev => {
        const isDefault = prev.length === defaultEntries.length;
        if(isDefault) {
          return [newEntry];
        }
        return [newEntry, ...prev];
      });
      return;
    }
    
    if(userId) {
        try {
            const collectionRef = collection(db, 'users', userId, 'entries');
            const isDefault = entries.length === defaultEntries.length;

            if(isDefault) {
              const batch = writeBatch(db);
              entries.forEach(entryToDelete => {
                const docRef = doc(db, 'users', userId, 'entries', entryToDelete.id);
                batch.delete(docRef);
              });
              await batch.commit();
            }

            await addDoc(collectionRef, entry);
        } catch (error) {
            console.error("Error adding entry: ", error);
        }
    }
  };

  const updateEntry = async (entry: JournalEntry) => {
    if (isGuest) {
        setEntries(prev => prev.map(e => (e.id === entry.id ? entry : e)));
        return;
    }
    if (userId) {
        const entryRef = doc(db, 'users', userId, 'entries', entry.id);
        const { id, ...dataToUpdate } = entry;
        try {
            await updateDoc(entryRef, dataToUpdate);
        } catch (error) {
            console.error("Error updating entry: ", error);
        }
    }
  };

  const deleteEntry = async (id: string) => {
    if (isGuest) {
        setEntries(prev => prev.filter(e => e.id !== id));
        return;
    }

    if(userId) {
        try {
            await deleteDoc(doc(db, 'users', userId, 'entries', id));
        } catch (error) {
            console.error("Error deleting entry: ", error);
        }
    }
  };

  return { entries, addEntry, updateEntry, deleteEntry, loading };
}
