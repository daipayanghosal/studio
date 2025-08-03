
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
import { cn } from '@/lib/utils';
import { Edit } from 'lucide-react';
import { format } from 'date-fns';
import type { Timestamp } from 'firebase/firestore';

interface EntryViewerProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  entry: JournalEntry;
  onEdit: () => void;
}

export default function EntryViewer({ isOpen, setIsOpen, entry, onEdit }: EntryViewerProps) {
  if (!isOpen) return null;

  const toDate = (date: Date | Timestamp): Date => {
    return (date as Timestamp)?.toDate ? (date as Timestamp).toDate() : (date as Date);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className={cn("font-headline text-3xl")}>{entry.title}</DialogTitle>
          {entry.createdAt && (
            <DialogDescription>
                {format(toDate(entry.createdAt), "MMMM d, yyyy 'at' h:mm a")}
            </DialogDescription>
          )}
        </DialogHeader>
        <div 
          className="flex-grow overflow-y-auto pr-4 -mx-4 px-6 prose dark:prose-invert max-w-none whitespace-pre-wrap"
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
