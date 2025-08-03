
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { UserButton } from '@/components/auth/user-button';
import { type JournalEntry } from '@/types';
import EntryCard from './entry-card';
import EntryEditor from './entry-editor';
import EntryViewer from './entry-viewer';
import { useAuth } from '../auth/auth-provider';
import { useJournalEntries } from '@/hooks/use-journal-entries';

export default function JournalDashboard() {
  const { isGuest, user } = useAuth();
  const {
    entries,
    addEntry,
    updateEntry,
    deleteEntry,
    loading,
  } = useJournalEntries(user?.uid, isGuest);

  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [viewingEntry, setViewingEntry] = useState<JournalEntry | null>(null);

  const handleNewEntry = () => {
    setEditingEntry(null);
    setIsEditorOpen(true);
  };
  
  const handleEditEntry = (entry: JournalEntry) => {
    setEditingEntry(entry);
    setIsViewerOpen(false);
    setIsEditorOpen(true);
  };
  
  const handleDeleteEntry = (id: string) => {
    deleteEntry(id);
  };
  
  const handleSaveEntry = (entryToSave: JournalEntry) => {
    if (editingEntry) {
      updateEntry(entryToSave);
    } else {
      addEntry(entryToSave);
    }
  };

  const handleViewEntry = (entry: JournalEntry) => {
    setViewingEntry(entry);
    setIsViewerOpen(true);
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
        {loading ? (
           <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 p-12 text-center h-[50vh]">
             <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
             <p className="mt-4 text-muted-foreground">Loading your journal...</p>
           </div>
        ) : entries.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {entries.map(entry => (
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
