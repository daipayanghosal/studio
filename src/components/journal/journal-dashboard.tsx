"use client";

import React, { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  PlusCircle,
  Search,
  LayoutGrid,
  List as ListIcon,
  Pin,
  Heart,
  Code2,
  Archive,
  Trash2,
  Sparkles,
  Sun,
  Moon,
  ArrowUpDown,
  BookOpen,
  Languages,
  CheckCircle2,
  RotateCcw,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { UserButton } from '@/components/auth/user-button';
import {
  JournalEntry,
  JournalEntryData,
  SidebarFilter,
  SortBy,
  ViewMode,
  DreamAura,
} from '@/types';
import EntryCard from './entry-card';
import EntryEditor from './entry-editor';
import EntryViewer from './entry-viewer';
import DeleteConfirmationDialog from './delete-confirmation-dialog';
import DreamBackdrop from '@/components/ui/dream-backdrop';
import { useAuth } from '../auth/auth-provider';
import { useJournalEntries } from '@/hooks/use-journal-entries';
import { useApp } from '@/components/providers/app-provider';
import { hasCodeBlock, stripHtmlToText } from '@/lib/note-utils';
import { cn } from '@/lib/utils';
import type { Timestamp } from 'firebase/firestore';

export default function JournalDashboard() {
  const { user, isGuest } = useAuth();
  const { t, locale, toggleLocale, theme, toggleTheme, aura, setAura } = useApp();

  const {
    entries,
    addEntry,
    updateEntry,
    deleteEntry,
    restoreEntry,
    permanentDeleteEntry,
    togglePin,
    toggleFavorite,
    duplicateEntry,
    emptyTrash,
    loading,
  } = useJournalEntries(user?.uid, isGuest);

  // UI State
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<SidebarFilter>('all');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortBy>('updatedAt');

  // Modals
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [viewingEntry, setViewingEntry] = useState<JournalEntry | null>(null);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [deletingEntryId, setDeletingEntryId] = useState<string | null>(null);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Focus search on '/' when not in input
      if (
        e.key === '/' &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA' &&
        !document.activeElement?.getAttribute('contenteditable')
      ) {
        e.preventDefault();
        document.getElementById('note-search-input')?.focus();
      }
      // New note on Ctrl/Cmd + Alt + N or Ctrl + N
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        document.getElementById('note-search-input')?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Compute all unique tags from active notes
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    entries
      .filter((e) => !e.isTrashed)
      .forEach((e) => {
        if (e.tags && Array.isArray(e.tags)) {
          e.tags.forEach((t) => tagSet.add(t));
        }
      });
    return Array.from(tagSet);
  }, [entries]);

  // Filter counts
  const counts = useMemo(() => {
    const active = entries.filter((e) => !e.isTrashed && !e.isArchived);
    return {
      all: active.length,
      pinned: active.filter((e) => e.isPinned).length,
      favorites: active.filter((e) => e.isFavorite).length,
      code: active.filter((e) => hasCodeBlock(e.content)).length,
      archived: entries.filter((e) => !e.isTrashed && e.isArchived).length,
      trash: entries.filter((e) => e.isTrashed).length,
    };
  }, [entries]);

  // Filtered & Sorted Entries
  const filteredEntries = useMemo(() => {
    let result = entries;

    // Filter by Tab
    if (activeFilter === 'trash') {
      result = result.filter((e) => e.isTrashed);
    } else {
      result = result.filter((e) => !e.isTrashed);

      if (activeFilter === 'archived') {
        result = result.filter((e) => e.isArchived);
      } else {
        // Exclude archived from normal views
        result = result.filter((e) => !e.isArchived);

        if (activeFilter === 'pinned') {
          result = result.filter((e) => e.isPinned);
        } else if (activeFilter === 'favorites') {
          result = result.filter((e) => e.isFavorite);
        } else if (activeFilter === 'code') {
          result = result.filter((e) => hasCodeBlock(e.content));
        }
      }
    }

    // Filter by Tag
    if (selectedTag) {
      result = result.filter((e) => e.tags && e.tags.includes(selectedTag));
    }

    // Filter by Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((e) => {
        const titleMatch = (e.title || '').toLowerCase().includes(q);
        const contentMatch = stripHtmlToText(e.content || '').toLowerCase().includes(q);
        const tagMatch = (e.tags || []).some((t) => t.toLowerCase().includes(q));
        return titleMatch || contentMatch || tagMatch;
      });
    }

    // Sorting
    const toTime = (date: Date | Timestamp | undefined): number => {
      if (!date) return 0;
      if ((date as Timestamp)?.toMillis) return (date as Timestamp).toMillis();
      if ((date as Date)?.getTime) return (date as Date).getTime();
      return new Date(date as any).getTime() || 0;
    };

    result.sort((a, b) => {
      // In active views, always keep pinned on top unless sorting by title
      if (activeFilter !== 'trash' && activeFilter !== 'archived') {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
      }

      if (sortBy === 'title') {
        return (a.title || '').localeCompare(b.title || '');
      } else if (sortBy === 'createdAt') {
        return toTime(b.createdAt) - toTime(a.createdAt);
      } else {
        // updatedAt
        return toTime(b.updatedAt) - toTime(a.updatedAt);
      }
    });

    return result;
  }, [entries, activeFilter, selectedTag, searchQuery, sortBy]);

  // Handlers
  const handleNewEntry = () => {
    setEditingEntry(null);
    setIsEditorOpen(true);
  };

  const handleEditEntry = (entry: JournalEntry) => {
    setEditingEntry(entry);
    setIsViewerOpen(false);
    setIsEditorOpen(true);
  };

  const handleViewEntry = (entry: JournalEntry) => {
    setViewingEntry(entry);
    setIsViewerOpen(true);
  };

  const handleDeleteRequest = (id: string) => {
    setDeletingEntryId(id);
    setIsDeleteAlertOpen(true);
  };

  const handleConfirmDelete = () => {
    if (deletingEntryId) {
      if (activeFilter === 'trash') {
        permanentDeleteEntry(deletingEntryId);
      } else {
        deleteEntry(deletingEntryId);
      }
    }
    setIsDeleteAlertOpen(false);
    setDeletingEntryId(null);
  };

  const handleSaveEntry = (entryToSave: JournalEntry | JournalEntryData) => {
    if ('id' in entryToSave) {
      updateEntry(entryToSave as JournalEntry);
      if (viewingEntry && viewingEntry.id === entryToSave.id) {
        setViewingEntry(entryToSave as JournalEntry);
      }
    } else {
      addEntry(entryToSave as JournalEntryData);
    }
  };

  return (
    <div className="min-h-screen relative overflow-x-hidden font-body text-foreground">
      {/* Ambient Dreamy Background Orbs */}
      <DreamBackdrop />

      {/* Main Ethereal Header */}
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/70 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6 gap-3">
          {/* Logo & Brand Title */}
          <div className="flex items-center gap-3">
            <div className="relative group cursor-pointer" onClick={() => setActiveFilter('all')}>
              <Image
                src="/appicon.png"
                alt="ChronoCanvas Logo"
                width={38}
                height={38}
                className="rounded-xl shadow-md transition-transform group-hover:scale-105"
                priority
              />
              <span className="absolute -inset-0.5 rounded-xl bg-gradient-to-tr from-purple-500/20 to-sky-400/20 blur-sm -z-10 opacity-70 group-hover:opacity-100 transition-opacity" />
            </div>

            <div>
              <h1 className="text-xl sm:text-2xl font-bold font-headline tracking-tight bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
                {t.appName}
              </h1>
              <p className="text-[11px] text-muted-foreground hidden sm:block tracking-wide">
                {t.appTagline}
              </p>
            </div>
          </div>

          {/* Center Search Input */}
          <div className="flex-1 max-w-md mx-2 hidden md:block">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/70" />
              <input
                id="note-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`${t.searchPlaceholder} (Press /)`}
                className="w-full pl-10 pr-9 py-2 text-xs rounded-xl border border-border/70 bg-muted/40 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-transparent transition-all shadow-inner"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* New Note Button */}
            <Button
              onClick={handleNewEntry}
              size="sm"
              className="hidden sm:inline-flex gap-2 rounded-xl h-9 px-4 font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-md transition-all hover:scale-[1.02]"
            >
              <PlusCircle className="h-4 w-4" />
              <span>{t.newNote}</span>
            </Button>

            {/* Language Switcher (EN / বাংলা) */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleLocale}
              className="h-9 px-2.5 rounded-xl text-xs font-semibold hover:bg-primary/10 gap-1.5"
              title="Switch language / ভাষা পরিবর্তন"
            >
              <Languages className="h-4 w-4 text-primary" />
              <span className={cn(locale === 'bn' && 'font-bengali')}>
                {locale === 'en' ? 'বাংলা' : 'English'}
              </span>
            </Button>

            {/* Dream Aura Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-xl text-muted-foreground hover:text-foreground hover:bg-primary/10"
                  title={t.dreamAura}
                >
                  <Sparkles className="h-4 w-4 text-purple-500" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 font-body">
                <DropdownMenuItem
                  onClick={() => setAura('aurora')}
                  className={cn(aura === 'aurora' && 'font-bold text-primary')}
                >
                  🌌 {t.auraAurora}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setAura('nebula')}
                  className={cn(aura === 'nebula' && 'font-bold text-primary')}
                >
                  🔮 {t.auraNebula}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setAura('sunset')}
                  className={cn(aura === 'sunset' && 'font-bold text-primary')}
                >
                  🌅 {t.auraSunset}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setAura('mint')}
                  className={cn(aura === 'mint' && 'font-bold text-primary')}
                >
                  🍃 {t.auraMint}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="h-9 w-9 rounded-xl text-muted-foreground hover:text-foreground hover:bg-primary/10"
              title="Toggle Light / Dark mode"
            >
              {theme === 'dark' ? (
                <Sun className="h-4 w-4 text-amber-300" />
              ) : (
                <Moon className="h-4 w-4 text-indigo-500" />
              )}
            </Button>

            <UserButton />
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="px-4 pb-3 md:hidden">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full pl-9 pr-8 py-1.5 text-xs rounded-xl border border-border/80 bg-muted/40 focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Canvas Workspace */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 md:py-8 space-y-6">
        {/* Guest Mode Indicator Banner */}
        {isGuest && !user && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 px-4 rounded-2xl border border-primary/20 bg-primary/[0.05] backdrop-blur-md text-xs shadow-sm">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400 animate-pulse shrink-0" />
              <span className="font-medium text-foreground">
                Guest Mode: Your notes are preserved locally. Sign in with Google anytime to automatically sync them to Cloud Firestore.
              </span>
            </div>
            <a
              href="/login"
              className="px-3.5 py-1.5 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all text-center shrink-0 shadow-sm"
            >
              Sign in with Google
            </a>
          </div>
        )}

        {/* Navigation Tabs Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/50">
          {/* Navigation Pill Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <button
              type="button"
              onClick={() => {
                setActiveFilter('all');
                setSelectedTag(null);
              }}
              className={cn(
                "inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0",
                activeFilter === 'all'
                  ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/30'
                  : 'bg-muted/40 text-muted-foreground hover:text-foreground hover:bg-muted/70'
              )}
            >
              <BookOpen className="h-3.5 w-3.5" />
              <span>{t.allNotes}</span>
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-black/10 dark:bg-white/10">
                {counts.all}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveFilter('pinned');
                setSelectedTag(null);
              }}
              className={cn(
                "inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0",
                activeFilter === 'pinned'
                  ? 'bg-amber-500 text-white shadow-sm shadow-amber-500/30'
                  : 'bg-muted/40 text-muted-foreground hover:text-foreground hover:bg-muted/70'
              )}
            >
              <Pin className="h-3.5 w-3.5" />
              <span>{t.pinnedNotes}</span>
              {counts.pinned > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-black/10 dark:bg-white/10">
                  {counts.pinned}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveFilter('favorites');
                setSelectedTag(null);
              }}
              className={cn(
                "inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0",
                activeFilter === 'favorites'
                  ? 'bg-rose-500 text-white shadow-sm shadow-rose-500/30'
                  : 'bg-muted/40 text-muted-foreground hover:text-foreground hover:bg-muted/70'
              )}
            >
              <Heart className="h-3.5 w-3.5" />
              <span>{t.favorites}</span>
              {counts.favorites > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-black/10 dark:bg-white/10">
                  {counts.favorites}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveFilter('code');
                setSelectedTag(null);
              }}
              className={cn(
                "inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0",
                activeFilter === 'code'
                  ? 'bg-purple-600 text-white shadow-sm shadow-purple-600/30'
                  : 'bg-muted/40 text-muted-foreground hover:text-foreground hover:bg-muted/70'
              )}
            >
              <Code2 className="h-3.5 w-3.5" />
              <span>{t.codeSnippets}</span>
              {counts.code > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-black/10 dark:bg-white/10">
                  {counts.code}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveFilter('trash');
                setSelectedTag(null);
              }}
              className={cn(
                "inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0",
                activeFilter === 'trash'
                  ? 'bg-destructive text-destructive-foreground shadow-sm'
                  : 'bg-muted/40 text-muted-foreground hover:text-foreground hover:bg-muted/70'
              )}
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>{t.trash}</span>
              {counts.trash > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-black/10 dark:bg-white/10">
                  {counts.trash}
                </span>
              )}
            </button>
          </div>

          {/* Right Toolbar Controls (Sort & View Mode) */}
          <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
            {activeFilter === 'trash' && counts.trash > 0 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={emptyTrash}
                className="h-8 text-xs rounded-xl"
              >
                Empty Trash
              </Button>
            )}

            {/* Sort Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2.5 rounded-xl text-xs font-medium text-muted-foreground hover:text-foreground gap-1.5 bg-muted/40"
                >
                  <ArrowUpDown className="h-3.5 w-3.5 text-primary" />
                  <span>
                    {sortBy === 'updatedAt'
                      ? t.sortUpdated
                      : sortBy === 'createdAt'
                      ? t.sortCreated
                      : t.sortTitle}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 font-body">
                <DropdownMenuItem onClick={() => setSortBy('updatedAt')}>
                  {t.sortUpdated}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('createdAt')}>
                  {t.sortCreated}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('title')}>
                  {t.sortTitle}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* View Mode Toggle (Grid / List) */}
            <div className="flex items-center bg-muted/50 p-0.5 rounded-xl border border-border/50">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={cn(
                  "p-1.5 rounded-lg transition-colors",
                  viewMode === 'grid'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
                title={t.gridView}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={cn(
                  "p-1.5 rounded-lg transition-colors",
                  viewMode === 'list'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
                title={t.listView}
              >
                <ListIcon className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Tag Filters Ribbon */}
        {allTags.length > 0 && activeFilter !== 'trash' && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider shrink-0 mr-1">
              {t.tags}:
            </span>
            <button
              type="button"
              onClick={() => setSelectedTag(null)}
              className={cn(
                "px-2.5 py-1 rounded-full text-xs font-medium transition-colors shrink-0",
                selectedTag === null
                  ? 'bg-primary/20 text-primary font-semibold'
                  : 'bg-muted/50 text-muted-foreground hover:text-foreground'
              )}
            >
              {t.allTags}
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                className={cn(
                  "px-2.5 py-1 rounded-full text-xs font-medium transition-colors shrink-0",
                  selectedTag === tag
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'bg-muted/50 text-muted-foreground hover:text-foreground'
                )}
              >
                #{tag}
              </button>
            ))}
          </div>
        )}

        {/* Notes Grid / List Rendering */}
        {loading ? (
          <div className="flex flex-col items-center justify-center dream-glass rounded-2xl p-16 text-center min-h-[45vh]">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent shadow-lg" />
            <p className="mt-4 text-sm text-muted-foreground font-medium">
              Awakening your notes from the cloud...
            </p>
          </div>
        ) : filteredEntries.length > 0 ? (
          viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredEntries.map((entry) => (
                <EntryCard
                  key={entry.id}
                  entry={entry}
                  viewMode="grid"
                  onClick={() => handleViewEntry(entry)}
                  onEdit={() => handleEditEntry(entry)}
                  onDelete={() => handleDeleteRequest(entry.id)}
                  onTogglePin={togglePin}
                  onToggleFavorite={toggleFavorite}
                  onDuplicate={duplicateEntry}
                  onRestore={restoreEntry}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredEntries.map((entry) => (
                <EntryCard
                  key={entry.id}
                  entry={entry}
                  viewMode="list"
                  onClick={() => handleViewEntry(entry)}
                  onEdit={() => handleEditEntry(entry)}
                  onDelete={() => handleDeleteRequest(entry.id)}
                  onTogglePin={togglePin}
                  onToggleFavorite={toggleFavorite}
                  onDuplicate={duplicateEntry}
                  onRestore={restoreEntry}
                />
              ))}
            </div>
          )
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center dream-glass rounded-3xl p-12 sm:p-16 text-center min-h-[48vh] space-y-4">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-primary/20 via-purple-500/15 to-pink-500/20 flex items-center justify-center text-primary shadow-inner">
              <Sparkles className="h-8 w-8" />
            </div>

            <div className="space-y-1.5 max-w-md">
              <h2 className="text-xl sm:text-2xl font-bold font-headline text-foreground">
                {searchQuery ? t.emptySearch : t.emptyTitle}
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {searchQuery
                  ? 'Try searching with another keyword, tag, or language.'
                  : t.emptyDesc}
              </p>
            </div>

            {!searchQuery && (
              <Button
                onClick={handleNewEntry}
                className="mt-2 rounded-xl px-5 h-10 font-semibold gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg transition-transform hover:scale-105"
              >
                <PlusCircle className="h-4 w-4" />
                <span>{t.createFirstNote}</span>
              </Button>
            )}
          </div>
        )}
      </main>

      {/* Floating Action Button (Mobile) */}
      <Button
        onClick={handleNewEntry}
        className="sm:hidden fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-2xl bg-primary text-primary-foreground flex items-center justify-center"
      >
        <PlusCircle className="h-7 w-7" />
        <span className="sr-only">{t.newNote}</span>
      </Button>

      {/* Note Editor Modal */}
      <EntryEditor
        isOpen={isEditorOpen}
        setIsOpen={setIsEditorOpen}
        entry={editingEntry}
        onSave={handleSaveEntry}
      />

      {/* Note Viewer Modal */}
      {viewingEntry && (
        <EntryViewer
          isOpen={isViewerOpen}
          setIsOpen={setIsViewerOpen}
          entry={viewingEntry}
          onEdit={() => handleEditEntry(viewingEntry)}
          onTogglePin={togglePin}
          onToggleFavorite={toggleFavorite}
        />
      )}

      {/* Delete / Permanent Delete Confirmation Alert */}
      <DeleteConfirmationDialog
        isOpen={isDeleteAlertOpen}
        onClose={() => setIsDeleteAlertOpen(false)}
        onConfirm={handleConfirmDelete}
        isPermanent={activeFilter === 'trash'}
      />
    </div>
  );
}
