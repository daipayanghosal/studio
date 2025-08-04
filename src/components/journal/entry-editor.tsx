
"use client";

import { useEffect, useRef, useState, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { type JournalEntry, type JournalEntryData } from '@/types';
import EditorToolbar from './editor-toolbar';
import { useToast } from '@/hooks/use-toast';
import { Save, X, Palette } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '../ui/skeleton';

interface EntryEditorProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  entry: JournalEntry | null;
  onSave: (entry: JournalEntry | JournalEntryData) => void;
}

const entryColors = [
  '#77BEF0', '#FFCB61', '#FF894F', '#EA5B6F', '#A8D0E6',
  '#FADADD', '#E6E6FA', '#FFDDC1', '#D4F0F0', '#FEE1E8',
];

export default function EntryEditor({ isOpen, setIsOpen, entry, onSave }: EntryEditorProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [color, setColor] = useState(entryColors[0]);
  const [isLoading, setIsLoading] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const setCursorToEnd = (element: HTMLElement) => {
    const range = document.createRange();
    const selection = window.getSelection();
    range.selectNodeContents(element);
    range.collapse(false);
    if (selection) {
      selection.removeAllRanges();
      selection.addRange(range);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      if (entry) {
        setTitle(entry.title);
        setContent(entry.content);
        setColor(entry.color);
      } else {
        setTitle('');
        setContent('');
        setColor(entryColors[0]);
      }
      setIsLoading(false);
    }
  }, [entry, isOpen]);

  useEffect(() => {
    if (!isLoading && editorRef.current) {
        editorRef.current.innerHTML = content;
        if (entry) {
            setCursorToEnd(editorRef.current);
        }
    }
  }, [isLoading, content, entry]);


  const handleSave = () => {
    const currentContent = editorRef.current?.innerHTML || '';
    if (!title.trim()) {
      toast({
        title: "Title is required",
        description: "Please enter a title for your journal entry.",
        variant: "destructive",
      });
      return;
    }

    const savedEntryData: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'> = {
      title,
      content: currentContent,
      color,
    };
    
    if (entry) {
        const updatedEntry: JournalEntry = {
            ...entry,
            ...savedEntryData,
            updatedAt: new Date(),
        }
        onSave(updatedEntry);
    } else {
        const newEntry: JournalEntryData = {
            ...savedEntryData,
            createdAt: new Date(),
            updatedAt: new Date(),
        }
        onSave(newEntry);
    }
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="w-full h-full max-w-full max-h-full sm:max-w-4xl sm:max-h-[90vh] flex flex-col p-0 gap-0">
        <div className="flex items-center justify-between p-4 border-b">
            <DialogHeader className="flex-row items-center gap-4">
              <Palette className="h-6 w-6 text-muted-foreground" />
              <DialogTitle className="text-lg font-medium">{entry ? 'Edit Entry' : 'New Entry'}</DialogTitle>
            </DialogHeader>
            <div className="flex items-center gap-2">
                 <Button type="button" onClick={handleSave} disabled={isLoading}>
                    <Save className="mr-2 h-4 w-4" />
                    {isLoading ? 'Saving...' : 'Save'}
                </Button>
                <DialogClose asChild>
                    <Button type="button" variant="ghost" size="icon">
                        <X className="h-5 w-5" />
                        <span className="sr-only">Close</span>
                    </Button>
                </DialogClose>
            </div>
        </div>

        <div className="flex-grow flex flex-col md:flex-row min-h-0">
          <main className="flex-grow flex flex-col p-4 md:p-8 overflow-y-auto">
            {isLoading ? (
                <div className='space-y-6'>
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-64 w-full" />
                </div>
            ) : (
                <>
                    <div className="mb-6">
                        <input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Your Title Here..."
                            className="text-3xl md:text-4xl font-extrabold tracking-tight w-full bg-transparent focus:outline-none"
                        />
                    </div>

                    <div className="flex-grow">
                        <EditorToolbar editorRef={editorRef} />
                        <div
                            ref={editorRef}
                            id="editor"
                            contentEditable
                            suppressContentEditableWarning={true}
                            className="prose dark:prose-invert max-w-none min-h-[40vh] p-4 focus:outline-none rounded-b-md border-x border-b border-input"
                            style={{borderColor: color}}
                        />
                    </div>
                </>
            )}
          </main>

          <aside className="w-full md:w-64 border-t md:border-t-0 md:border-l bg-muted/50 p-4 space-y-4 overflow-y-auto">
             <h3 className="font-semibold text-foreground">Entry Color</h3>
             <div className="grid grid-cols-5 md:grid-cols-4 gap-2">
                {entryColors.map((c) => (
                    <button
                        key={c}
                        type="button"
                        onClick={() => setColor(c)}
                        className={cn(
                            "h-10 w-full rounded-md border-2 transition-all",
                            color === c ? 'ring-2 ring-ring ring-offset-2 ring-offset-background' : 'border-transparent'
                        )}
                        style={{ backgroundColor: c }}
                        aria-label={`Set color to ${c}`}
                    />
                ))}
            </div>
          </aside>
        </div>

      </DialogContent>
    </Dialog>
  );
}
