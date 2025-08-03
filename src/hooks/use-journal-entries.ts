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
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { type JournalEntry, type JournalEntryData } from '@/types';

export function useJournalEntries(userId: string | undefined) {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribe: () => void = () => {};

    if (userId) {
      setLoading(true);
      const collectionRef = collection(db, 'users', userId, 'entries');
      const q = query(collectionRef, orderBy('updatedAt', 'desc'));

      unsubscribe = onSnapshot(q, (snapshot) => {
        const serverEntries: JournalEntry[] = snapshot.docs.map(doc => ({
          id: doc.id,
          ...(doc.data() as Omit<JournalEntry, 'id'>),
        }));
        setEntries(serverEntries);
        setLoading(false);
      }, (error) => {
        console.error("Error fetching journal entries:", error);
        setEntries([]);
        setLoading(false);
      });
    } else {
      setEntries([]);
      setLoading(false);
    }

    return () => unsubscribe();
  }, [userId]);

  const addEntry = async (entry: JournalEntryData) => {
    if(userId) {
        try {
            const collectionRef = collection(db, 'users', userId, 'entries');
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
    if (userId) {
        const { id, ...dataToUpdate } = entry;
        const entryRef = doc(db, 'users', userId, 'entries', id);
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
