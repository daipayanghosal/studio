
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
  const [content, setContent] = useState('');
  const [color, setColor] = useState(entryColors[0]);
  const editorRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    // We need a timeout to ensure the editorRef is available after the dialog animation
    const timer = setTimeout(() => {
      if (isOpen) {
        if (entry) {
          setTitle(entry.title);
          setContent(entry.content);
          setColor(entry.color);
          if (editorRef.current) {
            editorRef.current.innerHTML = entry.content;
          }
        } else {
          // Reset for new entry
          const initialContent = '<p><br></p>';
          setTitle('');
          setContent(initialContent);
          setColor(entryColors[0]);
          if (editorRef.current) {
            editorRef.current.innerHTML = initialContent;
          }
        }
      }
    }, 0);
  
    return () => clearTimeout(timer);
  }, [entry, isOpen]);
  
  const handleContentChange = () => {
    if(editorRef.current) {
        setContent(editorRef.current.innerHTML);
    }
  }

  const handleSave = () => {
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
      content,
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
            updatedAt: new a Date(),
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
            {entry ? 'Make changes to your journal entry.' : 'Create a new journal entry. Click save when you\'re done.'}
          </DialogDescription>
        </DialogHeader>
        <div className="flex-grow overflow-y-auto pr-2 space-y-4 py-4">
            <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="A new day's thoughts"
                />
            </div>
            <div className="space-y-2">
              <Label>Content</Label>
              <div className="rounded-md border border-input">
                <EditorToolbar editorRef={editorRef} />
                <div
                    ref={editorRef}
                    id="editor"
                    contentEditable
                    onInput={handleContentChange}
                    className="prose dark:prose-invert max-w-none min-h-[200px] p-4 focus:outline-none overflow-y-auto"
                />
              </div>
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
          <Button type="button" onClick={handleSave}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
