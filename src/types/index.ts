import type { Timestamp } from 'firebase/firestore';

export type NoteLanguage = 'en' | 'bn' | 'bilingual';
export type NoteFontStyle = 'sans' | 'serif' | 'bengali' | 'mono';
export type DreamAura = 'aurora' | 'nebula' | 'sunset' | 'mint';
export type AppLocale = 'en' | 'bn';
export type ViewMode = 'grid' | 'list';
export type SortBy = 'updatedAt' | 'createdAt' | 'title';
export type SidebarFilter =
  | 'all'
  | 'pinned'
  | 'favorites'
  | 'code'
  | 'archived'
  | 'trash'
  | 'trashed';

export type JournalEntry = {
  id: string;
  title: string;
  content: string; // Stored as HTML string
  color: string; // Hex color code
  tags?: string[];
  folder?: string;
  isPinned?: boolean;
  isFavorite?: boolean;
  isArchived?: boolean;
  isTrashed?: boolean;
  language?: NoteLanguage;
  fontStyle?: NoteFontStyle;
  wordCount?: number;
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
};

export type JournalEntryData = Omit<JournalEntry, 'id'>;
