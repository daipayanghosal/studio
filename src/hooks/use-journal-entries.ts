
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
  serverTimestamp,
  Timestamp,
  getDocs,
} from 'firebase/firestore';
import { type JournalEntry, type JournalEntryData } from '@/types';

const GUEST_ENTRIES_KEY = 'guest-journal-entries';

const createDefaultEntries = (): JournalEntry[] => [
    {
        id: 'default-1',
        title: 'First Day of Spring',
        content: '<p>Today was a beautiful day. The sun was shining and the birds were singing. I went for a long walk in the park and felt so refreshed. It feels like a new beginning.</p>',
        color: '#A8D0E6',
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        id: 'default-2',
        title: 'A New Recipe',
        content: '<p>I tried cooking a new pasta recipe today. It was a bit challenging, but the result was delicious! <b>I should definitely make it again.</b> My family loved it too.</p>',
        color: '#FADADD',
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        id: 'default-3',
        title: 'Project Brainstorm',
        content: '<p>Had a great brainstorming session for my new project. I have so many ideas now. <i>Feeling very inspired and motivated to start working on it.</i></p>',
        color: '#E6E6FA',
        createdAt: new Date(),
        updatedAt: new Date(),
    },
];


export function useJournalEntries(userId: string | undefined, isGuest: boolean) {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDefault, setIsDefault] = useState(false);
  
  const getGuestEntriesFromStorage = useCallback((): JournalEntry[] => {
    if (typeof window === 'undefined') return [];
    try {
      const localData = localStorage.getItem(GUEST_ENTRIES_KEY);
      if (localData) {
        const parsedData = JSON.parse(localData) as any[];
        return parsedData.map((e): JournalEntry => ({
          ...e,
          createdAt: new Date(e.createdAt),
          updatedAt: new Date(e.updatedAt),
        }));
      }
    } catch (error) {
      console.error("Error reading guest entries from localStorage", error);
    }
    return [];
  }, []);

  useEffect(() => {
    let unsubscribe: () => void = () => {};

    const migrateGuestEntries = async (uid: string) => {
        const guestEntries = getGuestEntriesFromStorage();
        if (guestEntries.length === 0) return;
        
        const defaultEntries = createDefaultEntries();
        const defaultEntryIds = defaultEntries.map(e => e.id).sort().join(',');
        const guestEntryIds = guestEntries.map(e => e.id).sort().join(',');
        if (defaultEntryIds === guestEntryIds) return;
        
        const collectionRef = collection(db, 'users', uid, 'entries');
        const batch = writeBatch(db);

        guestEntries.forEach((entry: JournalEntry) => {
            const { id, ...entryData } = entry;
            const newDocRef = doc(collectionRef);
            batch.set(newDocRef, {
                ...entryData,
                createdAt: Timestamp.fromDate(entry.createdAt instanceof Date ? entry.createdAt : (entry.createdAt as Timestamp).toDate()),
                updatedAt: Timestamp.fromDate(entry.updatedAt instanceof Date ? entry.updatedAt : (entry.updatedAt as Timestamp).toDate()),
            });
        });

        try {
            await batch.commit();
            localStorage.removeItem(GUEST_ENTRIES_KEY);
        } catch (error) {
            console.error("Failed to migrate guest entries:", error);
        }
    };


    const loadData = async () => {
        setLoading(true);
        if (isGuest) {
            const guestEntries = getGuestEntriesFromStorage();
            if (guestEntries && guestEntries.length > 0) {
                setEntries(guestEntries);
                setIsDefault(false);
            } else {
                setEntries(createDefaultEntries());
                setIsDefault(true);
            }
            setLoading(false);
        } else if (userId) {
            await migrateGuestEntries(userId);
            
            const collectionRef = collection(db, 'users', userId, 'entries');
            const q = query(collectionRef, orderBy('updatedAt', 'desc'));

            unsubscribe = onSnapshot(q, (snapshot) => {
                if (snapshot.empty) {
                    setEntries(createDefaultEntries());
                    setIsDefault(true);
                } else {
                    const serverEntries: JournalEntry[] = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...(doc.data() as Omit<JournalEntry, 'id'>),
                    }));
                    setEntries(serverEntries);
                    setIsDefault(false);
                }
                setLoading(false);
            }, (error) => {
                console.error("Error fetching journal entries:", error);
                setEntries(createDefaultEntries());
                setIsDefault(true);
                setLoading(false);
            });
        } else {
            setLoading(false);
            setEntries([]);
        }
    };
    
    loadData();

    return () => unsubscribe();
  }, [userId, isGuest, getGuestEntriesFromStorage]);
  
  useEffect(() => {
    if (isGuest && !loading) {
       if (typeof window !== 'undefined') {
          if (!isDefault) {
            localStorage.setItem(GUEST_ENTRIES_KEY, JSON.stringify(entries));
          } else {
            localStorage.removeItem(GUEST_ENTRIES_KEY);
          }
       }
    }
  }, [entries, isGuest, isDefault, loading]);

  const addEntry = async (entry: JournalEntryData) => {
    if (isGuest) {
      const newEntry: JournalEntry = { 
          ...entry,
          id: new Date().toISOString(),
          createdAt: new Date(),
          updatedAt: new Date(),
      };
      setEntries(prev => (isDefault ? [newEntry] : [newEntry, ...prev]));
      setIsDefault(false);
      return;
    }
    
    if(userId) {
        try {
            const collectionRef = collection(db, 'users', userId, 'entries');
            if(isDefault) {
                const existingEntriesSnapshot = await getDocs(collectionRef);
                const batch = writeBatch(db);
                existingEntriesSnapshot.forEach(doc => {
                    batch.delete(doc.ref);
                });
                await batch.commit();
            }
            await addDoc(collectionRef, {
              ...entry,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
        } catch (error) {
            console.error("Error adding entry: ", error);
        }
    }
  };

  const updateEntry = async (entry: JournalEntry) => {
    const { id, ...dataToUpdate } = entry;
      
    if (isGuest) {
        setEntries(prev => prev.map(e => (e.id === entry.id ? {...entry, updatedAt: new Date()} : e)));
        setIsDefault(false);
        return;
    }
    if (userId) {
        const entryRef = doc(db, 'users', userId, 'entries', entry.id);
        try {
            await updateDoc(entryRef, {
              ...dataToUpdate,
              updatedAt: serverTimestamp(),
            });
        } catch (error) {
            console.error("Error updating entry: ", error);
        }
    }
  };

  const deleteEntry = async (id: string) => {
    if (isGuest) {
      const newEntries = entries.filter(e => e.id !== id);
      setEntries(newEntries);
      if (newEntries.length === 0) {
        setIsDefault(true);
        setEntries(createDefaultEntries());
      }
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
