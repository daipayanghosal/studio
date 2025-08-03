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

interface EntryCardProps {
  entry: JournalEntry;
  onEdit: () => void;
  onDelete: () => void;
}

export default function EntryCard({ entry, onEdit, onDelete }: EntryCardProps) {
    
  const stripHtml = (html: string) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || "";
  }
  
  const contentPreview = stripHtml(entry.content).substring(0, 100);

  return (
    <Card 
      className="flex flex-col overflow-hidden transition-all hover:shadow-xl"
      style={{ borderTop: `4px solid ${entry.color}` }}
    >
      <CardHeader className="flex flex-row items-start justify-between">
        <div className="grid gap-1.5">
          <CardTitle className={cn("font-headline font-bengali")}>{entry.title}</CardTitle>
          <CardDescription>
            {format(entry.createdAt, "MMMM d, yyyy")}
          </CardDescription>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">More options</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
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
        <p className={cn("text-sm text-muted-foreground font-bengali")}>
            {contentPreview}{contentPreview.length === 100 && '...'}
        </p>
      </CardContent>
    </Card>
  );
}
