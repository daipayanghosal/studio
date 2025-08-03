
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
} from 'firebase/firestore';
import { type JournalEntry, type JournalEntryData } from '@/types';

const GUEST_ENTRIES_KEY = 'guest-journal-entries';

const defaultEntries: JournalEntry[] = [
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
];

const convertToJournalEntry = (docData: JournalEntryData & { id: string }): JournalEntry => ({
  ...docData,
});

export function useJournalEntries(userId: string | undefined, isGuest: boolean) {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const getGuestEntriesFromStorage = useCallback((): JournalEntry[] => {
    const localData = localStorage.getItem(GUEST_ENTRIES_KEY);
    if (localData) {
      try {
        const parsedData = JSON.parse(localData);
        // Basic validation to ensure it's an array
        if (Array.isArray(parsedData)) {
            return parsedData;
        }
      } catch {
        // If parsing fails, fall back to default
        return defaultEntries;
      }
    }
    // If no local data, return default
    return defaultEntries;
  }, []);

  const migrateGuestEntries = useCallback(async (uid: string) => {
    const guestEntries = getGuestEntriesFromStorage();
    
    // Avoid migration if entries are default or empty
    const guestEntryIds = guestEntries.map((e: JournalEntry) => e.id).sort().join(',');
    const defaultEntryIds = defaultEntries.map((e: JournalEntry) => e.id).sort().join(',');

    if (guestEntries.length === 0 || guestEntryIds === defaultEntryIds) {
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
  }, [getGuestEntriesFromStorage]);

  useEffect(() => {
    let unsubscribe: () => void = () => {};

    if (isGuest) {
      setEntries(getGuestEntriesFromStorage());
      setLoading(false);
    } else if (userId) {
      setLoading(true);
      
      migrateGuestEntries(userId).then(() => {
        const collectionRef = collection(db, 'users', userId, 'entries');
        const q = query(collectionRef);

        unsubscribe = onSnapshot(q, (snapshot) => {
          if (snapshot.empty) {
             setEntries(defaultEntries);
          } else {
            const serverEntries = snapshot.docs.map(doc => convertToJournalEntry({ id: doc.id, ...(doc.data() as JournalEntryData) }));
            setEntries(serverEntries);
          }
          setLoading(false);
        }, (error) => {
          console.error("Error fetching journal entries:", error);
          setEntries(defaultEntries); // Fallback to default on error
          setLoading(false);
        });
      });
    } else {
        setEntries([]);
        setLoading(false);
    }

    return () => unsubscribe();
  }, [userId, isGuest, getGuestEntriesFromStorage, migrateGuestEntries]);
  
  useEffect(() => {
    if (isGuest) {
        const guestEntryIds = entries.map((e: JournalEntry) => e.id).sort().join(',');
        const defaultEntryIds = defaultEntries.map((e: JournalEntry) => e.id).sort().join(',');
        
        // Only save to local storage if entries are not the default ones.
        if (entries.length > 0 && guestEntryIds !== defaultEntryIds) {
           localStorage.setItem(GUEST_ENTRIES_KEY, JSON.stringify(entries));
        }
    }
  }, [entries, isGuest]);

  const addEntry = async (entry: Omit<JournalEntry, 'id'>) => {
    if (isGuest) {
      const newEntry: JournalEntry = { 
          ...entry, 
          id: new Date().toISOString(), // Temporary ID for client-side
      };
      setEntries(prev => {
        const prevIds = prev.map((e: JournalEntry) => e.id).sort().join(',');
        const defaultIds = defaultEntries.map((e: JournalEntry) => e.id).sort().join(',');
        if(prev.length === defaultEntries.length && prevIds === defaultIds) {
          return [newEntry];
        }
        return [newEntry, ...prev];
      });
      return;
    }
    
    if(userId) {
        try {
            await addDoc(collection(db, 'users', userId, 'entries'), entry);
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
