"use client";

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
import { type JournalEntry } from '@/types';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Edit } from 'lucide-react';

interface EntryViewerProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  entry: JournalEntry;
  onEdit: () => void;
}

export default function EntryViewer({ isOpen, setIsOpen, entry, onEdit }: EntryViewerProps) {
  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className={cn("font-headline font-bengali text-3xl")}>{entry.title}</DialogTitle>
          <DialogDescription>
            {format(entry.createdAt, "MMMM d, yyyy 'at' h:mm a")}
          </DialogDescription>
        </DialogHeader>
        <div 
          className="flex-grow overflow-y-auto pr-4 -mx-4 px-6 prose dark:prose-invert max-w-none font-bengali whitespace-pre-wrap"
          dangerouslySetInnerHTML={{ __html: entry.content }}
        />
        <DialogFooter className="mt-4">
          <DialogClose asChild>
            <Button type="button" variant="outline">
                Close
            </Button>
          </DialogClose>
          <Button type="button" onClick={onEdit}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
