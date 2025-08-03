"use client";

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { UserButton } from '@/components/auth/user-button';
import { type JournalEntry } from '@/types';
import EntryCard from './entry-card';
import EntryEditor from './entry-editor';
import EntryViewer from './entry-viewer';
import { useAuth } from '../auth/auth-provider';

const initialEntries: JournalEntry[] = [
    {
        id: '1',
        title: 'First Day of Spring',
        content: '<p>Today was a beautiful day. The sun was shining and the birds were singing. I went for a long walk in the park and felt so refreshed. It feels like a new beginning.</p>',
        color: '#A8D0E6',
        createdAt: new Date('2024-03-20T10:00:00Z'),
        updatedAt: new Date('2024-03-20T10:00:00Z'),
    },
    {
        id: '2',
        title: 'A New Recipe',
        content: '<p>I tried cooking a new pasta recipe today. It was a bit challenging, but the result was delicious! <b>I should definitely make it again.</b> My family loved it too.</p>',
        color: '#FADADD',
        createdAt: new Date('2024-03-22T18:30:00Z'),
        updatedAt: new Date('2024-03-22T19:00:00Z'),
    },
    {
        id: '3',
        title: 'Project Brainstorm',
        content: '<p>Had a great brainstorming session for my new project. I have so many ideas now. <i>Feeling very inspired and motivated to start working on it.</i></p>',
        color: '#E6E6FA',
        createdAt: new Date('2024-03-25T14:15:00Z'),
        updatedAt: new Date('2024-03-25T14:15:00Z'),
    },
];


export default function JournalDashboard() {
  const { isGuest, user } = useAuth();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [viewingEntry, setViewingEntry] = useState<JournalEntry | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (isGuest) {
        const guestEntries = localStorage.getItem('guest-journal-entries');
        if (guestEntries) {
          try {
            const parsedEntries = JSON.parse(guestEntries).map((entry: any) => ({
              ...entry,
              createdAt: new Date(entry.createdAt),
              updatedAt: new Date(entry.updatedAt),
            }));
            setEntries(parsedEntries);
          } catch (e) {
            console.error("Failed to parse guest entries:", e);
            setEntries([]);
          }
        } else {
            setEntries(initialEntries);
        }
      } else if (user) {
        // Here you would fetch user's entries from Firestore
        // For now, we'll clear guest entries and show empty state
        const guestEntriesRaw = localStorage.getItem('guest-journal-entries');
        if (guestEntriesRaw) {
          // You might want to merge these with user's saved entries.
          // For now, we just clear them.
          localStorage.removeItem('guest-journal-entries');
        }
        setEntries([]); // Show empty list for logged in users for now
      }
    }
  }, [isGuest, user]);

  useEffect(() => {
    if (isGuest && typeof window !== 'undefined') {
      // Don't save initial entries to local storage
      if (JSON.stringify(entries) !== JSON.stringify(initialEntries)) {
        localStorage.setItem('guest-journal-entries', JSON.stringify(entries));
      }
    }
  }, [entries, isGuest]);

  const handleNewEntry = () => {
    setEditingEntry(null);
    setIsEditorOpen(true);
  };
  
  const handleEditEntry = (entry: JournalEntry) => {
    setEditingEntry(entry);
    setIsViewerOpen(false); // Close viewer if open
    setIsEditorOpen(true);
  };
  
  const handleDeleteEntry = (id: string) => {
    setEntries(entries.filter(entry => entry.id !== id));
  };
  
  const handleSaveEntry = (entryToSave: JournalEntry) => {
    const now = new Date();
    const newEntry = {
      ...entryToSave,
      id: entryToSave.id || now.toISOString(),
      updatedAt: now,
      createdAt: editingEntry ? entryToSave.createdAt : now,
    };
    
    if (editingEntry) {
      setEntries(entries.map(entry => (entry.id === newEntry.id ? newEntry : entry)));
    } else {
      setEntries([newEntry, ...entries]);
    }
  };

  const handleViewEntry = (entry: JournalEntry) => {
    setViewingEntry(entry);
    setIsViewerOpen(true);
  }
  
  const getEntriesToShow = () => {
    if (isGuest) return entries;
    if (user) {
      // TODO: Replace with user's actual entries from Firestore
      return entries;
    }
    return [];
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 font-headline">ChronoCanvas</h1>
          <div className="flex items-center gap-4">
            <Button onClick={handleNewEntry} className="hidden sm:flex">
              <PlusCircle className="mr-2 h-4 w-4" />
              New Entry
            </Button>
            <UserButton />
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 sm:p-6 md:p-8">
        {getEntriesToShow().length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {getEntriesToShow().map(entry => (
              <EntryCard 
                key={entry.id} 
                entry={entry}
                onClick={() => handleViewEntry(entry)}
                onEdit={() => handleEditEntry(entry)}
                onDelete={() => handleDeleteEntry(entry.id)} 
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 p-12 text-center h-[50vh]">
            <h2 className="text-xl font-medium text-gray-700 dark:text-gray-300">Your journal is empty</h2>
            <p className="mt-2 text-sm text-muted-foreground">Start by creating your first entry.</p>
            <Button onClick={handleNewEntry} className="mt-6">
              <PlusCircle className="mr-2 h-4 w-4" />
              Create New Entry
            </Button>
          </div>
        )}
      </main>

      <Button onClick={handleNewEntry} variant="default" className="sm:hidden fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg">
        <PlusCircle className="h-6 w-6" />
        <span className="sr-only">New Entry</span>
      </Button>

      <EntryEditor
        isOpen={isEditorOpen}
        setIsOpen={setIsEditorOpen}
        entry={editingEntry}
        onSave={handleSaveEntry}
      />
      
      {viewingEntry && (
        <EntryViewer
          isOpen={isViewerOpen}
          setIsOpen={setIsViewerOpen}
          entry={viewingEntry}
          onEdit={() => handleEditEntry(viewingEntry)}
        />
      )}
    </div>
  );
}
