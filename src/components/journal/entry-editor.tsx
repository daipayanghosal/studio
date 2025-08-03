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
import { type JournalEntry } from '@/types';
import EditorToolbar from './editor-toolbar';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { useToast } from '@/hooks/use-toast';

interface EntryEditorProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  entry: JournalEntry | null;
  onSave: (entry: JournalEntry | Omit<JournalEntry, 'id'>) => void;
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
    if (isOpen) {
      const initialContent = entry ? entry.content : '<p><br></p>';
      setTitle(entry ? entry.title : '');
      setContent(initialContent);
      setColor(entry ? entry.color : entryColors[0]);
      
      if (editorRef.current) {
        editorRef.current.innerHTML = initialContent;
      }
    }
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

    const savedEntry: Omit<JournalEntry, 'id'> = {
      title,
      content,
      color,
    };

    if (entry) {
        onSave({ ...savedEntry, id: entry.id });
    } else {
        onSave(savedEntry);
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
