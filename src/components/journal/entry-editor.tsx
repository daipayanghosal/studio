
"use client";

import { useEffect, useRef, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { type JournalEntry, type JournalEntryData } from '@/types';
import EditorToolbar from './editor-toolbar';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '../ui/skeleton';

interface EntryEditorProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  entry: JournalEntry | null;
  onSave: (entry: JournalEntry | JournalEntryData) => void;
}

const entryColors = [
  '#A8D0E6', '#FADADD', '#E6E6FA', '#FFDDC1', '#D4F0F0',
  '#FEE1E8', '#E0BBE4', '#D2F8B0', '#FEEAA1', '#B9E2A0',
];

export default function EntryEditor({ isOpen, setIsOpen, entry, onSave }: EntryEditorProps) {
  const [title, setTitle] = useState('');
  const [color, setColor] = useState(entryColors[0]);
  const [isLoading, setIsLoading] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      if (entry) {
        setIsLoading(true);
        setTitle(entry.title);
        setColor(entry.color);
        // Directly set the content of the editor when it loads
        if (editorRef.current) {
          editorRef.current.innerHTML = entry.content;
        }
        setIsLoading(false);
      } else {
        // Reset for new entry
        setTitle('');
        setColor(entryColors[0]);
        if (editorRef.current) {
          editorRef.current.innerHTML = '';
        }
        setIsLoading(false);
      }
    }
  }, [entry, isOpen]);

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
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{entry ? 'Edit Entry' : 'New Entry'}</DialogTitle>
          <DialogDescription>
            {entry ? 'Make changes to your journal entry.' : "Create a new journal entry. Click save when you're done."}
          </DialogDescription>
        </DialogHeader>
        <div className="flex-grow overflow-y-auto pr-2 space-y-4 py-4">
            <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                {isLoading ? (
                  <Skeleton className="h-10 w-full" />
                ) : (
                  <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="A new day's thoughts"
                  />
                )}
            </div>
            <div className="space-y-2">
              <Label>Content</Label>
                {isLoading ? (
                  <Skeleton className="h-[248px] w-full rounded-md" />
                ) : (
                  <div className="rounded-md border border-input">
                    <EditorToolbar editorRef={editorRef} />
                    <div
                        ref={editorRef}
                        id="editor"
                        contentEditable
                        suppressContentEditableWarning={true}
                        className="prose dark:prose-invert max-w-none min-h-[200px] p-4 focus:outline-none overflow-y-auto"
                    />
                  </div>
                )}
            </div>
            <div className="space-y-2">
                <Label>Entry Color</Label>
                 <RadioGroup value={color} onValueChange={setColor} className="flex flex-wrap gap-2 pt-2">
                    {entryColors.map((c) => (
                        <RadioGroupItem
                            key={c}
                            value={c}
                            id={`color-${c}`}
                            className="h-8 w-8 rounded-full border-2"
                            style={{ backgroundColor: c, borderColor: c === color ? 'hsl(var(--ring))' : 'transparent' }}
                            aria-label={c}
                        >
                            <span className="sr-only">{c}</span>
                        </RadioGroupItem>
                    ))}
                </RadioGroup>
            </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
                Cancel
            </Button>
          </DialogClose>
          <Button type="button" onClick={handleSave} disabled={isLoading}>
            {isLoading ? 'Loading...' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
