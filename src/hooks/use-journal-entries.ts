"use client";

import { useState, useEffect, useCallback } from 'react';
import { db } from '@/lib/firebase';
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  writeBatch,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { type JournalEntry, type JournalEntryData } from '@/types';

const GUEST_STORAGE_KEYS = ['chrono_guest_entries', 'guest-journal-entries'];

function parseDate(val: any): Date {
  if (!val) return new Date();
  if (val instanceof Date) return val;
  if (typeof val.toDate === 'function') return val.toDate();
  if (typeof val.toMillis === 'function') return new Date(val.toMillis());
  if (typeof val === 'number') return new Date(val);
  const parsed = new Date(val);
  return isNaN(parsed.getTime()) ? new Date() : parsed;
}

export function useJournalEntries(userId: string | undefined, isGuest = false) {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Helper to read local guest entries
  const getGuestEntries = useCallback((): JournalEntry[] => {
    if (typeof window === 'undefined') return [];
    for (const key of GUEST_STORAGE_KEYS) {
      try {
        const raw = localStorage.getItem(key);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed.map((item: any) => ({
              ...item,
              createdAt: parseDate(item.createdAt),
              updatedAt: parseDate(item.updatedAt || item.createdAt),
            }));
          }
        }
      } catch (err) {
        console.warn('Error reading guest entries:', err);
      }
    }
    return [];
  }, []);

  // Save guest entries to localStorage
  const saveGuestEntries = useCallback((newEntries: JournalEntry[]) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('chrono_guest_entries', JSON.stringify(newEntries));
    } catch (err) {
      console.warn('Error saving guest entries to localStorage:', err);
    }
  }, []);

  // Migrate local guest entries to Firestore when user logs in
  const migrateLocalEntriesToFirestore = useCallback(
    async (uid: string) => {
      const localNotes = getGuestEntries();
      if (localNotes.length === 0) return;

      try {
        const collectionRef = collection(db, 'users', uid, 'entries');
        const batch = writeBatch(db);

        localNotes.forEach((note) => {
          const { id, ...data } = note;
          const newDoc = doc(collectionRef);
          batch.set(newDoc, {
            ...data,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        });

        await batch.commit();

        // Clear local storage after successful migration
        GUEST_STORAGE_KEYS.forEach((k) => localStorage.removeItem(k));
      } catch (err) {
        console.warn('Could not migrate guest entries to Firestore:', err);
      }
    },
    [getGuestEntries]
  );

  useEffect(() => {
    let unsubscribe: () => void = () => {};

    if (userId) {
      setLoading(true);

      // Attempt migration of any local guest notes
      migrateLocalEntriesToFirestore(userId).finally(() => {
        const collectionRef = collection(db, 'users', userId, 'entries');

        // Query the collection directly without strict index filters so ALL old notes are loaded
        unsubscribe = onSnapshot(
          collectionRef,
          (snapshot) => {
            const serverEntries: JournalEntry[] = snapshot.docs.map((docSnapshot) => {
              const data = docSnapshot.data();
              return {
                id: docSnapshot.id,
                title: data.title || 'Untitled Note',
                content: data.content || '',
                color: data.color || '#77BEF0',
                tags: Array.isArray(data.tags) ? data.tags : [],
                folder: data.folder || 'Personal',
                isPinned: Boolean(data.isPinned),
                isFavorite: Boolean(data.isFavorite),
                isArchived: Boolean(data.isArchived),
                isTrashed: Boolean(data.isTrashed),
                language: data.language || 'en',
                fontStyle: data.fontStyle || 'sans',
                wordCount: typeof data.wordCount === 'number' ? data.wordCount : 0,
                createdAt: parseDate(data.createdAt || data.updatedAt),
                updatedAt: parseDate(data.updatedAt || data.createdAt),
              };
            });

            // Sort safely in memory
            serverEntries.sort((a, b) => {
              const timeA = parseDate(a.updatedAt || a.createdAt).getTime();
              const timeB = parseDate(b.updatedAt || b.createdAt).getTime();
              return timeB - timeA;
            });

            setEntries(serverEntries);
            setLoading(false);
          },
          (error) => {
            console.error('Error fetching journal entries from Firestore:', error);
            // Fallback to local cache if Firestore encounters permission or network issues
            const fallbackNotes = getGuestEntries();
            setEntries(fallbackNotes);
            setLoading(false);
          }
        );
      });
    } else {
      // Guest / Offline Mode
      const localEntries = getGuestEntries();
      setEntries(localEntries);
      setLoading(false);
    }

    return () => unsubscribe();
  }, [userId, isGuest, getGuestEntries, migrateLocalEntriesToFirestore]);

  const stripUndefined = <T extends Record<string, unknown>>(obj: T): Record<string, unknown> => {
    const clean: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj)) {
      if (v !== undefined) clean[k] = v;
    }
    return clean;
  };

  const addEntry = async (entry: JournalEntryData): Promise<string | undefined> => {
    const now = new Date();
    const cleanData: Omit<JournalEntry, 'id'> = {
      title: entry.title || 'Untitled Note',
      content: entry.content || '',
      color: entry.color || '#77BEF0',
      tags: entry.tags || [],
      folder: entry.folder || 'Personal',
      isPinned: Boolean(entry.isPinned),
      isFavorite: Boolean(entry.isFavorite),
      isArchived: Boolean(entry.isArchived),
      isTrashed: Boolean(entry.isTrashed),
      language: entry.language || 'en',
      fontStyle: entry.fontStyle || 'sans',
      wordCount: entry.wordCount || 0,
      createdAt: now,
      updatedAt: now,
    };

    if (userId) {
      try {
        const collectionRef = collection(db, 'users', userId, 'entries');
        const cleanPayload = stripUndefined(cleanData as unknown as Record<string, unknown>);
        const docRef = await addDoc(collectionRef, {
          ...cleanPayload,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        return docRef.id;
      } catch (error) {
        console.error('Error adding entry to Firestore: ', error);
      }
    }

    // Guest / Local update
    const localId = `local-${Date.now()}`;
    const newLocalEntry: JournalEntry = {
      id: localId,
      ...cleanData,
    };
    const updated = [newLocalEntry, ...entries];
    setEntries(updated);
    saveGuestEntries(updated);
    return localId;
  };

  const updateEntry = async (entry: JournalEntry) => {
    const now = new Date();
    if (userId) {
      const { id, createdAt, ...dataToUpdate } = entry;
      const cleanData = stripUndefined(dataToUpdate as unknown as Record<string, unknown>);
      const entryRef = doc(db, 'users', userId, 'entries', id);
      try {
        await updateDoc(entryRef, {
          ...cleanData,
          updatedAt: serverTimestamp(),
        });
        return;
      } catch (error) {
        console.error('Error updating entry in Firestore: ', error);
      }
    }

    // Guest / Local update
    const updated = entries.map((e) =>
      e.id === entry.id ? { ...entry, updatedAt: now } : e
    );
    setEntries(updated);
    saveGuestEntries(updated);
  };

  const deleteEntry = async (id: string) => {
    if (userId) {
      const entryRef = doc(db, 'users', userId, 'entries', id);
      try {
        await updateDoc(entryRef, {
          isTrashed: true,
          updatedAt: serverTimestamp(),
        });
        return;
      } catch (error) {
        console.error('Error moving entry to trash in Firestore: ', error);
      }
    }

    // Guest / Local update
    const updated = entries.map((e) => (e.id === id ? { ...e, isTrashed: true } : e));
    setEntries(updated);
    saveGuestEntries(updated);
  };

  const restoreEntry = async (id: string) => {
    if (userId) {
      const entryRef = doc(db, 'users', userId, 'entries', id);
      try {
        await updateDoc(entryRef, {
          isTrashed: false,
          updatedAt: serverTimestamp(),
        });
        return;
      } catch (error) {
        console.error('Error restoring entry in Firestore: ', error);
      }
    }

    const updated = entries.map((e) => (e.id === id ? { ...e, isTrashed: false } : e));
    setEntries(updated);
    saveGuestEntries(updated);
  };

  const permanentDeleteEntry = async (id: string) => {
    if (userId) {
      try {
        await deleteDoc(doc(db, 'users', userId, 'entries', id));
        return;
      } catch (error) {
        console.error('Error permanently deleting entry: ', error);
      }
    }

    const updated = entries.filter((e) => e.id !== id);
    setEntries(updated);
    saveGuestEntries(updated);
  };

  const togglePin = async (id: string, isPinned: boolean) => {
    if (userId) {
      const entryRef = doc(db, 'users', userId, 'entries', id);
      try {
        await updateDoc(entryRef, {
          isPinned: !isPinned,
          updatedAt: serverTimestamp(),
        });
        return;
      } catch (error) {
        console.error('Error toggling pin in Firestore: ', error);
      }
    }

    const updated = entries.map((e) => (e.id === id ? { ...e, isPinned: !isPinned } : e));
    setEntries(updated);
    saveGuestEntries(updated);
  };

  const toggleFavorite = async (id: string, isFavorite: boolean) => {
    if (userId) {
      const entryRef = doc(db, 'users', userId, 'entries', id);
      try {
        await updateDoc(entryRef, {
          isFavorite: !isFavorite,
          updatedAt: serverTimestamp(),
        });
        return;
      } catch (error) {
        console.error('Error toggling favorite in Firestore: ', error);
      }
    }

    const updated = entries.map((e) => (e.id === id ? { ...e, isFavorite: !isFavorite } : e));
    setEntries(updated);
    saveGuestEntries(updated);
  };

  const toggleArchive = async (id: string, isArchived: boolean) => {
    if (userId) {
      const entryRef = doc(db, 'users', userId, 'entries', id);
      try {
        await updateDoc(entryRef, {
          isArchived: !isArchived,
          isPinned: false,
          updatedAt: serverTimestamp(),
        });
        return;
      } catch (error) {
        console.error('Error toggling archive in Firestore: ', error);
      }
    }

    const updated = entries.map((e) =>
      e.id === id ? { ...e, isArchived: !isArchived, isPinned: false } : e
    );
    setEntries(updated);
    saveGuestEntries(updated);
  };

  const emptyTrash = async () => {
    const trashed = entries.filter((e) => e.isTrashed);
    await Promise.all(trashed.map((e) => permanentDeleteEntry(e.id)));
  };

  const duplicateEntry = async (entry: JournalEntry) => {
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
