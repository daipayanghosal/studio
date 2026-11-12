"use client";

import React, { useEffect, useRef, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { type JournalEntry } from '@/types';
import { cn } from '@/lib/utils';
import {
  Edit,
  Download,
  Copy,
  Check,
  Printer,
  Clock,
  Pin,
  Heart,
  FileText,
  X,
  Code2,
} from 'lucide-react';
import { format } from 'date-fns';
import type { Timestamp } from 'firebase/firestore';
import { useApp } from '@/components/providers/app-provider';
import {
  exportAsMarkdown,
  exportAsText,
  exportAsHtml,
  getWordAndCharStats,
} from '@/lib/note-utils';
import hljs from 'highlight.js';

interface EntryViewerProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  entry: JournalEntry;
  onEdit: () => void;
  onTogglePin?: (id: string, isPinned: boolean) => void;
  onToggleFavorite?: (id: string, isFavorite: boolean) => void;
}

export default function EntryViewer({
  isOpen,
  setIsOpen,
  entry,
  onEdit,
  onTogglePin,
  onToggleFavorite,
}: EntryViewerProps) {
  const { t } = useApp();
  const contentRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  const toDate = (date: Date | Timestamp | undefined): Date => {
    if (!date) return new Date();
    return (date as Timestamp)?.toDate ? (date as Timestamp).toDate() : (date as Date);
  };

  const formattedDate = entry?.createdAt
    ? format(toDate(entry.createdAt), "MMMM d, yyyy 'at' h:mm a")
    : '';

  const stats = getWordAndCharStats(entry?.content || '');

  // Highlight any code blocks inside viewer and attach copy buttons
  useEffect(() => {
    if (isOpen && contentRef.current) {
      const codeBlocks = contentRef.current.querySelectorAll('pre code');
      codeBlocks.forEach((block) => {
        try {
          hljs.highlightElement(block as HTMLElement);
        } catch {}
      });
    }
  }, [isOpen, entry?.content]);

  if (!isOpen || !entry) return null;

  const fontClass =
    entry.fontStyle === 'bengali'
      ? 'font-style-bengali'
      : entry.fontStyle === 'serif'
      ? 'font-style-serif'
      : entry.fontStyle === 'mono'
      ? 'font-style-mono'
      : 'font-body';

  const handleCopyNote = async () => {
    try {
      const plain = `${entry.title}\n\n${contentRef.current?.innerText || ''}`;
      await navigator.clipboard.writeText(plain);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {}
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="w-full h-full max-w-full max-h-full sm:max-w-4xl sm:max-h-[90vh] flex flex-col p-0 gap-0 dream-glass sm:rounded-2xl overflow-hidden shadow-2xl border-border/80">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border/60 bg-background/70 backdrop-blur-md select-none">
          <div className="flex items-center gap-2.5 min-w-0">
            <span
              className="h-3 w-3 rounded-full shrink-0 ring-2 ring-white/60 shadow-sm"
              style={{ backgroundColor: entry.color }}
            />
            <div className="truncate">
              <span className="text-xs uppercase font-bold tracking-wider text-muted-foreground/80">
                {entry.language === 'bn' ? 'বাংলা নোট' : 'ChronoCanvas Note'}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {onTogglePin && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => onTogglePin(entry.id, Boolean(entry.isPinned))}
                className={cn(
                  "h-8 w-8 transition-colors",
                  entry.isPinned ? 'text-amber-500 bg-amber-500/10' : 'text-muted-foreground hover:text-foreground'
                )}
                title={entry.isPinned ? 'Pinned' : 'Pin'}
              >
                <Pin className={cn("h-4 w-4", entry.isPinned && 'fill-amber-500')} />
              </Button>
            )}

            {onToggleFavorite && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => onToggleFavorite(entry.id, Boolean(entry.isFavorite))}
                className={cn(
                  "h-8 w-8 transition-colors",
                  entry.isFavorite ? 'text-rose-500 bg-rose-500/10' : 'text-muted-foreground hover:text-foreground'
                )}
                title={entry.isFavorite ? 'Favorite' : 'Add favorite'}
              >
                <Heart className={cn("h-4 w-4", entry.isFavorite && 'fill-rose-500')} />
              </Button>
            )}

            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleCopyNote}
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              title="Copy Note Text"
            >
              {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
            </Button>

            {/* Export Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  title={t.exportNote}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52 font-body">
                <DropdownMenuItem onClick={() => exportAsMarkdown(entry.title, entry.content)}>
                  <FileText className="h-4 w-4 mr-2" />
                  {t.exportMarkdown}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportAsText(entry.title, entry.content)}>
                  <FileText className="h-4 w-4 mr-2" />
                  {t.exportTxt}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportAsHtml(entry.title, entry.content)}>
                  <FileText className="h-4 w-4 mr-2" />
                  {t.exportHtml}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => window.print()}>
                  <Printer className="h-4 w-4 mr-2" />
                  {t.exportPdf}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Edit Button */}
            <Button
              type="button"
              onClick={onEdit}
              size="sm"
              className="h-8 px-3 gap-1.5 text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
            >
              <Edit className="h-3.5 w-3.5" />
              <span>{t.editNote}</span>
            </Button>

            {/* Close */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto px-6 sm:px-10 py-6 min-h-0 space-y-4">
          <DialogHeader className="space-y-1.5 text-left border-b border-border/40 pb-4">
            <DialogTitle
              className={cn(
                "text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground",
                entry.language === 'bn' ? 'font-bengali' : 'font-headline'
              )}
            >
              {entry.title || 'Untitled Note'}
            </DialogTitle>
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground pt-1">
              {formattedDate && <DialogDescription>{formattedDate}</DialogDescription>}
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {stats.words} {t.wordCount} ({stats.readTimeMinutes} {t.minuteRead})
              </span>
              {entry.language && (
                <>
                  <span>•</span>
                  <span className="uppercase text-[10px] px-1.5 py-0.5 rounded bg-muted/60 font-semibold">
                    {entry.language}
                  </span>
                </>
              )}
            </div>

            {/* Tags in viewer */}
            {entry.tags && entry.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-2">
                {entry.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </DialogHeader>

          {/* Rendered HTML */}
          <div
            ref={contentRef}
            className={cn(
              "chrono-prose prose prose-sm sm:prose-base dark:prose-invert max-w-none pt-2",
              fontClass
            )}
            dangerouslySetInnerHTML={{ __html: entry.content }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
