"use client";

import { useState, useEffect } from 'react';
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

      unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const serverEntries: JournalEntry[] = snapshot.docs.map((docSnapshot) => {
            const data = docSnapshot.data();
            return {
              id: docSnapshot.id,
              title: data.title || '',
              content: data.content || '',
              color: data.color || '#77BEF0',
              tags: data.tags || [],
              folder: data.folder || 'Personal',
              isPinned: Boolean(data.isPinned),
              isFavorite: Boolean(data.isFavorite),
              isArchived: Boolean(data.isArchived),
              isTrashed: Boolean(data.isTrashed),
              language: data.language || 'en',
              fontStyle: data.fontStyle || 'sans',
              wordCount: data.wordCount || 0,
              createdAt: data.createdAt || new Date(),
              updatedAt: data.updatedAt || new Date(),
            };
          });
          setEntries(serverEntries);
          setLoading(false);
        },
        (error) => {
          console.error('Error fetching journal entries:', error);
          setEntries([]);
          setLoading(false);
        }
      );
    } else {
      setEntries([]);
      setLoading(false);
    }

    return () => unsubscribe();
  }, [userId]);

  const stripUndefined = <T extends Record<string, unknown>>(obj: T): Record<string, unknown> => {
    const clean: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj)) {
      if (v !== undefined) clean[k] = v;
    }
    return clean;
  };

  const addEntry = async (entry: JournalEntryData): Promise<string | undefined> => {
    if (!userId) return undefined;
    try {
      const collectionRef = collection(db, 'users', userId, 'entries');
      const cleanEntry = stripUndefined(entry as unknown as Record<string, unknown>);
      const docRef = await addDoc(collectionRef, {
        ...cleanEntry,
        isPinned: entry.isPinned ?? false,
        isFavorite: entry.isFavorite ?? false,
        isArchived: entry.isArchived ?? false,
        isTrashed: entry.isTrashed ?? false,
        tags: entry.tags ?? [],
        language: entry.language ?? 'en',
        fontStyle: entry.fontStyle ?? 'sans',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding entry: ', error);
      return undefined;
    }
  };

  const updateEntry = async (entry: JournalEntry) => {
    if (!userId) return;
    const { id, createdAt, ...dataToUpdate } = entry;
    const cleanData = stripUndefined(dataToUpdate as unknown as Record<string, unknown>);
    const entryRef = doc(db, 'users', userId, 'entries', id);
    try {
      await updateDoc(entryRef, {
        ...cleanData,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating entry: ', error);
    }
  };

  const deleteEntry = async (id: string) => {
    // Soft delete to trash for safety
    if (!userId) return;
    const entryRef = doc(db, 'users', userId, 'entries', id);
    try {
      await updateDoc(entryRef, {
        isTrashed: true,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error moving entry to trash: ', error);
    }
  };

  const restoreEntry = async (id: string) => {
    if (!userId) return;
    const entryRef = doc(db, 'users', userId, 'entries', id);
    try {
      await updateDoc(entryRef, {
        isTrashed: false,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error restoring entry: ', error);
    }
  };

  const permanentDeleteEntry = async (id: string) => {
    if (!userId) return;
    try {
      await deleteDoc(doc(db, 'users', userId, 'entries', id));
    } catch (error) {
      console.error('Error permanently deleting entry: ', error);
    }
  };

  const togglePin = async (id: string, isPinned: boolean) => {
    if (!userId) return;
    const entryRef = doc(db, 'users', userId, 'entries', id);
    try {
      await updateDoc(entryRef, {
        isPinned: !isPinned,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error toggling pin: ', error);
    }
  };

  const toggleFavorite = async (id: string, isFavorite: boolean) => {
    if (!userId) return;
    const entryRef = doc(db, 'users', userId, 'entries', id);
    try {
      await updateDoc(entryRef, {
        isFavorite: !isFavorite,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error toggling favorite: ', error);
    }
  };

  const toggleArchive = async (id: string, isArchived: boolean) => {
    if (!userId) return;
    const entryRef = doc(db, 'users', userId, 'entries', id);
    try {
      await updateDoc(entryRef, {
        isArchived: !isArchived,
        isPinned: false,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error toggling archive: ', error);
    }
  };

  const emptyTrash = async () => {
    if (!userId) return;
    const trashed = entries.filter((e) => e.isTrashed);
    await Promise.all(trashed.map((e) => permanentDeleteEntry(e.id)));
  };

  const duplicateEntry = async (entry: JournalEntry) => {
    if (!userId) return;
    const { id, createdAt, updatedAt, ...copyData } = entry;
    await addEntry({
      ...copyData,
      title: `${entry.title || 'Untitled'} (Copy)`,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  };

  return {
    entries,
    addEntry,
    updateEntry,
    deleteEntry,
    restoreEntry,
    permanentDeleteEntry,
    togglePin,
    toggleFavorite,
    toggleArchive,
    emptyTrash,
    duplicateEntry,
    loading,
  };
}
