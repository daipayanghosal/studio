
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
import { Skeleton } from '../ui/skeleton';

interface EntryCardProps {
  entry: JournalEntry;
  onClick: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export default function EntryCard({ entry, onClick, onEdit, onDelete }: EntryCardProps) {
    const [isClient, setIsClient] = useState(false);
    const [contentPreview, setContentPreview] = useState('');

    useEffect(() => {
        setIsClient(true);
        if (entry.content) {
            const doc = new DOMParser().parseFromString(entry.content, 'text/html');
            const preview = doc.body.textContent || "";
            setContentPreview(preview.substring(0, 100));
        }
    }, [entry.content]);


  const toDate = (date: Date | Timestamp): Date => {
    return (date as Timestamp)?.toDate ? (date as Timestamp).toDate() : (date as Date);
  }
  
  const formattedDate = entry.createdAt ? format(toDate(entry.createdAt), "MMMM d, yyyy") : '';


  return (
    <Card 
      className="flex flex-col overflow-hidden transition-all hover:shadow-xl cursor-pointer"
      style={{ borderTop: `4px solid ${entry.color}` }}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-start justify-between">
        <div className="grid gap-1.5">
          <CardTitle className={cn("font-headline")}>{entry.title}</CardTitle>
          {isClient ? (
            <CardDescription>
                {formattedDate}
            </CardDescription>
          ) : <Skeleton className="h-5 w-24" />}
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
        {isClient ? (
            <p className={cn("text-sm text-muted-foreground")}>
                {contentPreview}{entry.content && contentPreview.length >= 100 && '...'}
            </p>
        ) : (
            <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
            </div>
        )}
      </CardContent>
    </Card>
  );
}
