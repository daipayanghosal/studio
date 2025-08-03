
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
  const [contentPreview, setContentPreview] = useState<string | null>(null);
  const [formattedDate, setFormattedDate] = useState<string | null>(null);

  useEffect(() => {
    // This effect runs only on the client, preventing SSR errors.
    const stripHtml = (html: string) => {
      if (typeof window === 'undefined') return '';
      const doc = new DOMParser().parseFromString(html, 'text/html');
      return doc.body.textContent || "";
    }

    const toDate = (date: Date | Timestamp): Date => {
      return (date as Timestamp)?.toDate ? (date as Timestamp).toDate() : (date as Date);
    }
    
    if (entry.content) {
      const preview = stripHtml(entry.content).substring(0, 100);
      setContentPreview(preview);
    } else {
      setContentPreview('');
    }

    if (entry.createdAt) {
      setFormattedDate(format(toDate(entry.createdAt), "MMMM d, yyyy"));
    } else {
        setFormattedDate('');
    }
  }, [entry]);

  return (
    <Card 
      className="flex flex-col overflow-hidden transition-all hover:shadow-xl cursor-pointer"
      style={{ borderTop: `4px solid ${entry.color}` }}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-start justify-between">
        <div className="grid gap-1.5">
          <CardTitle className={cn("font-headline")}>{entry.title}</CardTitle>
          {formattedDate !== null ? (
            <CardDescription>
                {formattedDate}
            </CardDescription>
          ) : <div className="h-5 w-24 bg-muted rounded animate-pulse" />}
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
        {contentPreview !== null ? (
            <p className={cn("text-sm text-muted-foreground")}>
                {contentPreview}{entry.content && contentPreview.length >= 100 && '...'}
            </p>
        ) : (
            <div className="space-y-2">
                <div className="h-4 w-full bg-muted rounded animate-pulse" />
                <div className="h-4 w-2/3 bg-muted rounded animate-pulse" />
            </div>
        )}
      </CardContent>
    </Card>
  );
}
