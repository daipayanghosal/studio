"use client";

import React, { useState, useEffect } from 'react';
import {
  MoreHorizontal,
  Edit,
  Trash2,
  Pin,
  Heart,
  Copy,
  Download,
  Code2,
  RotateCcw,
} from 'lucide-react';
import { format } from 'date-fns';
import type { Timestamp } from 'firebase/firestore';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { type JournalEntry, type ViewMode } from '@/types';
import { cn } from '@/lib/utils';
import { Skeleton } from '../ui/skeleton';
import { stripHtmlToText, hasCodeBlock, exportAsMarkdown } from '@/lib/note-utils';
import { useApp } from '@/components/providers/app-provider';

interface EntryCardProps {
  entry: JournalEntry;
  viewMode?: ViewMode;
  onClick: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onTogglePin?: (id: string, isPinned: boolean) => void;
  onToggleFavorite?: (id: string, isFavorite: boolean) => void;
  onDuplicate?: (entry: JournalEntry) => void;
  onRestore?: (id: string) => void;
}

export default function EntryCard({
  entry,
  viewMode = 'grid',
  onClick,
  onEdit,
  onDelete,
  onTogglePin,
  onToggleFavorite,
  onDuplicate,
  onRestore,
}: EntryCardProps) {
  const { t } = useApp();
  const [isClient, setIsClient] = useState(false);
  const [contentPreview, setContentPreview] = useState('');
  const [containsCode, setContainsCode] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if (entry.content) {
      const plain = stripHtmlToText(entry.content);
      setContentPreview(plain.slice(0, 140));
      setContainsCode(hasCodeBlock(entry.content));
    } else {
      setContentPreview('');
      setContainsCode(false);
    }
  }, [entry.content]);

  const toDate = (date: Date | Timestamp | undefined): Date => {
    if (!date) return new Date();
    return (date as Timestamp)?.toDate ? (date as Timestamp).toDate() : (date as Date);
  };

  const formattedDate = entry.createdAt
    ? format(toDate(entry.createdAt), "MMM d, yyyy")
    : '';

  const isBengali =
    entry.language === 'bn' ||
    /[\u0980-\u09FF]/.test(entry.title || '') ||
    /[\u0980-\u09FF]/.test(contentPreview);

  // List View Rendering
  if (viewMode === 'list') {
    return (
      <div
        onClick={onClick}
        className={cn(
          "group relative flex items-center justify-between p-4 rounded-xl dream-card cursor-pointer border-l-4 transition-all",
          entry.isPinned && "ring-1 ring-amber-400/40 bg-amber-500/[0.03]"
        )}
        style={{ borderLeftColor: entry.color || '#77BEF0' }}
      >
        <div className="flex-1 min-w-0 pr-4">
          <div className="flex items-center gap-2 mb-1">
            {entry.isPinned && (
              <Pin className="h-3.5 w-3.5 text-amber-500 fill-amber-500 shrink-0" />
            )}
            <h3
              className={cn(
                "text-base font-semibold truncate text-foreground group-hover:text-primary transition-colors",
                isBengali ? 'font-bengali' : 'font-headline'
              )}
            >
              {entry.title || 'Untitled Note'}
            </h3>
            {containsCode && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <Code2 className="h-3 w-3" />
                code
              </span>
            )}
            {entry.isFavorite && (
              <Heart className="h-3 w-3 text-rose-500 fill-rose-500 shrink-0" />
            )}
          </div>
          <p className="text-xs text-muted-foreground truncate">
            {contentPreview || <span className="italic opacity-60">No additional text</span>}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {entry.tags && entry.tags.length > 0 && (
            <div className="hidden sm:flex items-center gap-1">
              {entry.tags.slice(0, 2).map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-muted/60 text-muted-foreground"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          <span className="text-xs text-muted-foreground/80 hidden md:inline">
            {formattedDate}
          </span>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Options</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()} className="w-48 font-body">
              <DropdownMenuItem onClick={onEdit}>
                <Edit className="mr-2 h-4 w-4" />
                {t.editNote}
              </DropdownMenuItem>
              {onTogglePin && (
                <DropdownMenuItem onClick={() => onTogglePin(entry.id, Boolean(entry.isPinned))}>
                  <Pin className="mr-2 h-4 w-4" />
                  {entry.isPinned ? 'Unpin' : 'Pin to top'}
                </DropdownMenuItem>
              )}
              {onToggleFavorite && (
                <DropdownMenuItem onClick={() => onToggleFavorite(entry.id, Boolean(entry.isFavorite))}>
                  <Heart className="mr-2 h-4 w-4" />
                  {entry.isFavorite ? 'Remove Favorite' : 'Favorite'}
                </DropdownMenuItem>
              )}
              {onDuplicate && (
                <DropdownMenuItem onClick={() => onDuplicate(entry)}>
                  <Copy className="mr-2 h-4 w-4" />
                  Duplicate
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => exportAsMarkdown(entry.title, entry.content)}>
                <Download className="mr-2 h-4 w-4" />
                Export Markdown
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {entry.isTrashed && onRestore ? (
                <DropdownMenuItem onClick={() => onRestore(entry.id)} className="text-emerald-500">
                  <RotateCcw className="mr-2 h-4 w-4" />
                  {t.restore}
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={onDelete} className="text-destructive focus:text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  {t.delete}
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    );
  }

  // Grid View Rendering
  return (
    <div
      onClick={onClick}
      className={cn(
        "group relative flex flex-col justify-between p-5 rounded-2xl dream-card cursor-pointer border-t-[5px] min-h-[220px] transition-all overflow-hidden",
        entry.isPinned && "ring-1 ring-amber-400/40 bg-amber-500/[0.02]"
      )}
      style={{ borderTopColor: entry.color || '#77BEF0' }}
    >
      {/* Top Bar: Title & Menu */}
      <div>
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1">
              {entry.isPinned && (
                <span
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded"
                  title="Pinned"
                >
                  <Pin className="h-3 w-3 fill-amber-500" />
                  Pinned
                </span>
              )}
              {containsCode && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  <Code2 className="h-3 w-3" />
                  code
                </span>
              )}
              {entry.language === 'bn' && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bengali font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                  বাংলা
                </span>
              )}
            </div>

            <h3
              className={cn(
                "text-lg font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug",
                isBengali ? 'font-bengali' : 'font-headline'
              )}
            >
              {entry.title || 'Untitled Note'}
            </h3>
          </div>

          <div className="flex items-center gap-0.5 -mr-1.5">
            {onToggleFavorite && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground/60 hover:text-rose-500 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite(entry.id, Boolean(entry.isFavorite));
                }}
                title={entry.isFavorite ? 'Remove Favorite' : 'Favorite'}
              >
                <Heart
                  className={cn(
                    "h-4 w-4",
                    entry.isFavorite ? 'text-rose-500 fill-rose-500' : 'hover:scale-110'
                  )}
                />
              </Button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">More options</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()} className="w-48 font-body">
                <DropdownMenuItem onClick={onEdit}>
                  <Edit className="mr-2 h-4 w-4" />
                  {t.editNote}
                </DropdownMenuItem>
                {onTogglePin && (
                  <DropdownMenuItem onClick={() => onTogglePin(entry.id, Boolean(entry.isPinned))}>
                    <Pin className="mr-2 h-4 w-4" />
                    {entry.isPinned ? 'Unpin' : 'Pin to top'}
                  </DropdownMenuItem>
                )}
                {onDuplicate && (
                  <DropdownMenuItem onClick={() => onDuplicate(entry)}>
                    <Copy className="mr-2 h-4 w-4" />
                    Duplicate
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => exportAsMarkdown(entry.title, entry.content)}>
                  <Download className="mr-2 h-4 w-4" />
                  Export Markdown
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {entry.isTrashed && onRestore ? (
                  <DropdownMenuItem onClick={() => onRestore(entry.id)} className="text-emerald-500">
                    <RotateCcw className="mr-2 h-4 w-4" />
                    {t.restore}
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem onClick={onDelete} className="text-destructive focus:text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    {t.delete}
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Snippet Preview */}
        <p
          className={cn(
            "text-xs text-muted-foreground/80 line-clamp-4 leading-relaxed",
            isBengali ? 'font-bengali' : 'font-body'
          )}
        >
          {isClient ? (
            contentPreview || <span className="italic opacity-50">Empty note...</span>
          ) : (
            <Skeleton className="h-14 w-full" />
          )}
        </p>
      </div>

      {/* Bottom Footer: Tags & Date */}
      <div className="pt-4 mt-2 border-t border-border/40 flex items-center justify-between text-[11px] text-muted-foreground/70">
        <div className="flex flex-wrap items-center gap-1 max-w-[65%]">
          {entry.tags && entry.tags.length > 0 ? (
            entry.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-primary/10 text-primary truncate max-w-[90px]"
              >
                #{tag}
              </span>
            ))
          ) : (
            <span>Personal</span>
          )}
          {entry.tags && entry.tags.length > 2 && (
            <span className="text-[10px] text-muted-foreground">
              +{entry.tags.length - 2}
            </span>
          )}
        </div>

        <span>{formattedDate}</span>
      </div>
    </div>
  );
}
