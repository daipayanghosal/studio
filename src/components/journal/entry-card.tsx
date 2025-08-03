"use client";

import { MoreHorizontal, Edit, Trash2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { format } from 'date-fns';
import { cn } from "@/lib/utils";
import { Timestamp } from "firebase/firestore";

interface EntryCardProps {
  entry: JournalEntry;
  onClick: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export default function EntryCard({ entry, onClick, onEdit, onDelete }: EntryCardProps) {
    
  const stripHtml = (html: string) => {
    if (typeof window === 'undefined') {
      return html.replace(/<[^>]*>?/gm, '');
    }
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || "";
  }

  const getDate = (date: Date | Timestamp) => {
    if (date instanceof Timestamp) {
      return date.toDate();
    }
    return date;
  }
  
  const contentPreview = stripHtml(entry.content).substring(0, 100);

  return (
    <Card 
      className="flex flex-col overflow-hidden transition-all hover:shadow-xl cursor-pointer"
      style={{ borderTop: `4px solid ${entry.color}` }}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-start justify-between">
        <div className="grid gap-1.5">
          <CardTitle className={cn("font-headline")}>{entry.title}</CardTitle>
          <CardDescription>
            {format(getDate(entry.createdAt), "MMMM d, yyyy")}
          </CardDescription>
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
            {contentPreview}{contentPreview.length === 100 && '...'}
        </p>
      </CardContent>
    </Card>
  );
}
