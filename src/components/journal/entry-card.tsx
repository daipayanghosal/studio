
"use client";

import { useState, useEffect } from 'react';
import { MoreHorizontal, Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";
import type { Timestamp } from "firebase/firestore";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { type JournalEntry } from "@/types";
import { cn } from "@/lib/utils";

interface EntryCardProps {
  entry: JournalEntry;
  onClick: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export default function EntryCard({ entry, onClick, onEdit, onDelete }: EntryCardProps) {
  const [contentPreview, setContentPreview] = useState('');
  const [formattedDate, setFormattedDate] = useState('');

  useEffect(() => {
    // This effect runs only on the client, preventing SSR errors.
    const stripHtml = (html: string) => {
      // DOMParser is a browser API, so it must be used in useEffect.
      const doc = new DOMParser().parseFromString(html, 'text/html');
      return doc.body.textContent || "";
    }
    
    if (entry.content) {
      const preview = stripHtml(entry.content).substring(0, 100);
      setContentPreview(preview);
    }

    if (entry.createdAt) {
      const toDate = (date: Date | Timestamp): Date => {
        return (date as Timestamp)?.toDate ? (date as Timestamp).toDate() : (date as Date);
      }
      setFormattedDate(format(toDate(entry.createdAt), "MMMM d, yyyy"));
    }
  }, [entry.content, entry.createdAt]);

  return (
    <Card 
      className="flex flex-col overflow-hidden transition-all hover:shadow-xl cursor-pointer"
      style={{ borderTop: `4px solid ${entry.color}` }}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-start justify-between">
        <div className="grid gap-1.5">
          <CardTitle className={cn("font-headline")}>{entry.title}</CardTitle>
          {formattedDate && (
            <CardDescription>
                {formattedDate}
            </CardDescription>
          )}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">More options</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
            <DropdownMenuItem onClick={onEdit}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDelete} className="text-destructive focus:text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className={cn("text-sm text-muted-foreground")}>
            {contentPreview}{entry.content && entry.content.length > 100 && '...'}
        </p>
      </CardContent>
    </Card>
  );
}
