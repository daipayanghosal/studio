"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { useEditor, EditorContent, ReactNodeViewRenderer } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import Placeholder from '@tiptap/extension-placeholder';
import Highlight from '@tiptap/extension-highlight';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Underline from '@tiptap/extension-underline';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import TextAlign from '@tiptap/extension-text-align';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableHeader } from '@tiptap/extension-table-header';
import { TableCell } from '@tiptap/extension-table-cell';
import { common, createLowlight } from 'lowlight';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Save,
  X,
  Palette,
  Pin,
  Heart,
  Tag as TagIcon,
  Download,
  Languages,
  Type,
  Sparkles,
  FileText,
  Clock,
  Printer,
} from 'lucide-react';
import {
  JournalEntry,
  JournalEntryData,
  NoteFontStyle,
  NoteLanguage,
} from '@/types';
import EditorToolbar from './editor-toolbar';
import CodeBlockNode from './code-block-node';
import { useApp } from '@/components/providers/app-provider';
import { useToast } from '@/hooks/use-toast';
import {
  DREAM_NOTE_COLORS,
  NOTE_TEMPLATES,
  getWordAndCharStats,
  exportAsMarkdown,
  exportAsText,
  exportAsHtml,
} from '@/lib/note-utils';
import { cn } from '@/lib/utils';

interface EntryEditorProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  entry: JournalEntry | null;
  onSave: (entry: JournalEntry | JournalEntryData) => void;
}

const lowlightInstance = createLowlight(common);

export default function EntryEditor({
  isOpen,
  setIsOpen,
  entry,
  onSave,
}: EntryEditorProps) {
  const { t } = useApp();
  const { toast } = useToast();

  const [title, setTitle] = useState('');
  const [color, setColor] = useState(DREAM_NOTE_COLORS[0].hex);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [language, setLanguage] = useState<NoteLanguage>('en');
  const [fontStyle, setFontStyle] = useState<NoteFontStyle>('sans');
  const [isSaving, setIsSaving] = useState(false);
  const [stats, setStats] = useState({ words: 0, chars: 0, readTimeMinutes: 1 });

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        codeBlock: false,
        heading: {
          levels: [1, 2, 3],
        },
      }),
      CodeBlockLowlight.extend({
        addNodeView() {
          return ReactNodeViewRenderer(CodeBlockNode);
        },
      }).configure({
        lowlight: lowlightInstance,
        defaultLanguage: 'javascript',
      }),
      Placeholder.configure({
        placeholder: t.writePlaceholder,
      }),
      Underline,
      Highlight.configure({ multicolor: true }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      TextStyle,
      Color,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Subscript,
      Superscript,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline font-medium cursor-pointer',
        },
      }),
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    editorProps: {
      attributes: {
        class: 'focus:outline-none min-h-[46vh] p-4 sm:p-6',
      },
    },
    onUpdate: ({ editor: ed }) => {
      const html = ed.getHTML();
      setStats(getWordAndCharStats(html));
    },
  });

  // Sync state whenever entry or open dialog changes
  useEffect(() => {
    if (isOpen) {
      if (entry) {
        setTitle(entry.title || '');
        setColor(entry.color || DREAM_NOTE_COLORS[0].hex);
        setTags(entry.tags || []);
        setIsPinned(Boolean(entry.isPinned));
        setIsFavorite(Boolean(entry.isFavorite));
        setLanguage(entry.language || 'en');
        setFontStyle(entry.fontStyle || 'sans');
        if (editor) {
          editor.commands.setContent(entry.content || '');
          setStats(getWordAndCharStats(entry.content || ''));
        }
      } else {
        setTitle('');
        setColor(DREAM_NOTE_COLORS[0].hex);
        setTags([]);
        setIsPinned(false);
        setIsFavorite(false);
        setLanguage('en');
        setFontStyle('sans');
        if (editor) {
          editor.commands.setContent('');
          setStats({ words: 0, chars: 0, readTimeMinutes: 1 });
        }
      }
    }
  }, [entry, isOpen, editor]);

  const handleApplyTemplate = (tmpl: (typeof NOTE_TEMPLATES)[0]) => {
    setTitle(tmpl.title);
    setColor(tmpl.color);
    setTags(tmpl.tags);
    setLanguage(tmpl.language);
    setFontStyle(tmpl.fontStyle);
    if (editor) {
      editor.commands.setContent(tmpl.content);
      setStats(getWordAndCharStats(tmpl.content));
    }
    toast({
      title: 'Template applied',
      description: `${tmpl.nameEn} loaded into canvas.`,
    });
  };

  const handleAddTag = () => {
    const trimmed = tagInput.trim().replace(/^#/, '');
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSave = async () => {
    const content = editor?.getHTML() || '';
    const finalTitle = title.trim() || 'Untitled Note';

    setIsSaving(true);
    const payload = {
      title: finalTitle,
      content,
      color,
      tags,
      isPinned,
      isFavorite,
      language,
      fontStyle,
      wordCount: stats.words,
    };

    try {
      if (entry) {
        onSave({
          ...entry,
          ...payload,
          updatedAt: new Date(),
        });
      } else {
        onSave({
          ...payload,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }

      toast({
        title: t.saved,
        description: `"${finalTitle}" preserved gracefully.`,
      });
      setIsOpen(false);
    } catch (err) {
      console.error(err);
      toast({
        title: 'Error saving',
        description: 'Please check your connection and try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const fontClass = useMemo(() => {
    switch (fontStyle) {
      case 'bengali':
        return 'font-style-bengali';
      case 'serif':
        return 'font-style-serif';
      case 'mono':
        return 'font-style-mono';
      default:
        return 'font-body';
    }
  }, [fontStyle]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="w-full h-full max-w-full max-h-full sm:max-w-5xl sm:h-[92vh] flex flex-col p-0 gap-0 dream-glass border-border/80 sm:rounded-2xl overflow-hidden shadow-2xl">
        {/* Top Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/60 bg-background/70 backdrop-blur-md select-none">
          <DialogHeader className="flex-row items-center gap-2 sm:gap-3 space-y-0">
            <div
              className="h-3.5 w-3.5 rounded-full ring-2 ring-white/60 shadow-sm"
              style={{ backgroundColor: color }}
            />
            <DialogTitle className="text-base sm:text-lg font-headline font-semibold text-foreground">
              {entry ? t.editNote : t.newNote}
            </DialogTitle>
          </DialogHeader>

          {/* Header Action Tools */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Template Selector (For new notes) */}
            {!entry && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 text-xs gap-1 text-purple-600 dark:text-purple-300 hover:bg-purple-500/10"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    <span className="hidden md:inline">Templates</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-60 font-body">
                  {NOTE_TEMPLATES.map((tmpl) => (
                    <DropdownMenuItem
                      key={tmpl.id}
                      onClick={() => handleApplyTemplate(tmpl)}
                      className="flex flex-col items-start gap-0.5 py-2 cursor-pointer"
                    >
                      <span className="font-semibold text-xs text-foreground">
                        {tmpl.nameEn} / {tmpl.nameBn}
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        {tmpl.descEn}
                      </span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Pin Toggle */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setIsPinned(!isPinned)}
              className={cn(
                "h-8 w-8 transition-colors",
                isPinned ? 'text-amber-500 bg-amber-500/10' : 'text-muted-foreground hover:text-foreground'
              )}
              title={isPinned ? 'Pinned note' : 'Pin to top'}
            >
              <Pin className={cn("h-4 w-4", isPinned && 'fill-amber-500')} />
            </Button>

            {/* Favorite Toggle */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setIsFavorite(!isFavorite)}
              className={cn(
                "h-8 w-8 transition-colors",
                isFavorite ? 'text-rose-500 bg-rose-500/10' : 'text-muted-foreground hover:text-foreground'
              )}
              title={isFavorite ? 'In favorites' : 'Add to favorites'}
            >
              <Heart className={cn("h-4 w-4", isFavorite && 'fill-rose-500')} />
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
                <DropdownMenuItem onClick={() => exportAsMarkdown(title, editor?.getHTML() || '')}>
                  <FileText className="h-4 w-4 mr-2" />
                  {t.exportMarkdown}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportAsText(title, editor?.getHTML() || '')}>
                  <FileText className="h-4 w-4 mr-2" />
                  {t.exportTxt}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportAsHtml(title, editor?.getHTML() || '')}>
                  <FileText className="h-4 w-4 mr-2" />
                  {t.exportHtml}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => window.print()}>
                  <Printer className="h-4 w-4 mr-2" />
                  {t.exportPdf}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Save Button */}
            <Button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              size="sm"
              className="h-8 px-3.5 gap-1.5 text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-md transition-all hover:scale-[1.02]"
            >
              <Save className="h-3.5 w-3.5" />
              <span>{isSaving ? t.saving : t.save}</span>
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

        {/* Main Editor Body */}
        <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
          {/* Editor Canvas Column */}
          <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
            {/* Title Section */}
            <div className="px-4 sm:px-6 pt-5 pb-3">
              <input
                id="entry-title-input"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t.titlePlaceholder}
                className={cn(
                  "w-full text-2xl sm:text-3xl font-extrabold tracking-tight bg-transparent focus:outline-none placeholder:text-muted-foreground/50",
                  language === 'bn' ? 'font-bengali' : 'font-headline'
                )}
              />

              {/* Tags Ribbon */}
              <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-destructive transition-colors ml-0.5"
                    >
                      ×
                    </button>
                  </span>
                ))}
                <div className="inline-flex items-center gap-1">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ',') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    placeholder="+ add tag..."
                    className="px-2 py-0.5 text-xs bg-transparent border-b border-dashed border-muted-foreground/40 focus:border-primary focus:outline-none w-24 text-foreground"
                  />
                </div>
              </div>
            </div>

            {/* Sticky Rich Toolbar */}
            <EditorToolbar editor={editor} />

            {/* Rich Editor Content Canvas */}
            <div
              className={cn(
                "flex-1 px-4 sm:px-6 py-4 chrono-prose prose prose-sm sm:prose-base dark:prose-invert max-w-none focus:outline-none cursor-text",
                fontClass
              )}
              style={{
                borderLeft: `3px solid ${color}`,
              }}
              onClick={() => editor?.commands.focus()}
            >
              <EditorContent editor={editor} />
            </div>

            {/* Editor Footer Status Bar */}
            <div className="flex items-center justify-between px-4 py-2 border-t border-border/40 text-[11px] text-muted-foreground bg-background/50 select-none">
              <div className="flex items-center gap-3">
                <span>
                  {stats.words} {t.wordCount}
                </span>
                <span>•</span>
                <span>
                  {stats.chars} {t.charCount}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {stats.readTimeMinutes} {t.minuteRead}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="capitalize font-medium text-foreground/80">
                  {fontStyle} typography
                </span>
              </div>
            </div>
          </div>

          {/* Sidebar Settings Panel */}
          <aside className="w-full md:w-72 border-t md:border-t-0 md:border-l border-border/60 bg-muted/20 backdrop-blur-md p-4 space-y-5 overflow-y-auto select-none">
            {/* Note Color Swatches */}
            <div>
              <div className="flex items-center gap-1.5 mb-2.5">
                <Palette className="h-3.5 w-3.5 text-primary" />
                <h4 className="text-xs font-semibold text-foreground tracking-wide uppercase">
                  {t.noteColor}
                </h4>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {DREAM_NOTE_COLORS.map((c) => (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => setColor(c.hex)}
                    className={cn(
                      "h-9 rounded-xl border-2 transition-all flex items-center justify-center relative group",
                      color === c.hex
                        ? 'ring-2 ring-primary ring-offset-2 ring-offset-background scale-105'
                        : 'border-transparent hover:scale-105'
                    )}
                    style={{ backgroundColor: c.hex }}
                    title={c.nameEn}
                    aria-label={c.nameEn}
                  >
                    {color === c.hex && (
                      <span className="h-2 w-2 rounded-full bg-white shadow-md" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Language Selector */}
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <Languages className="h-3.5 w-3.5 text-primary" />
                <h4 className="text-xs font-semibold text-foreground tracking-wide uppercase">
                  {t.language}
                </h4>
              </div>
              <div className="grid grid-cols-3 gap-1 bg-muted/50 p-1 rounded-lg border border-border/60">
                <button
                  type="button"
                  onClick={() => setLanguage('en')}
                  className={cn(
                    "py-1 text-xs font-medium rounded-md transition-colors",
                    language === 'en'
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  English
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage('bn')}
                  className={cn(
                    "py-1 text-xs font-medium rounded-md font-bengali transition-colors",
                    language === 'bn'
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  বাংলা
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage('bilingual')}
                  className={cn(
                    "py-1 text-xs font-medium rounded-md transition-colors",
                    language === 'bilingual'
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  Dual
                </button>
              </div>
            </div>

            {/* Typography Font Style */}
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <Type className="h-3.5 w-3.5 text-primary" />
                <h4 className="text-xs font-semibold text-foreground tracking-wide uppercase">
                  {t.fontStyle}
                </h4>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => setFontStyle('sans')}
                  className={cn(
                    "px-2.5 py-1.5 rounded-lg border text-xs font-sans text-left transition-all",
                    fontStyle === 'sans'
                      ? 'border-primary bg-primary/10 text-primary font-semibold'
                      : 'border-border/60 bg-background/50 text-muted-foreground hover:text-foreground'
                  )}
                >
                  Modern Sans
                </button>
                <button
                  type="button"
                  onClick={() => setFontStyle('serif')}
                  className={cn(
                    "px-2.5 py-1.5 rounded-lg border text-xs font-serif text-left transition-all",
                    fontStyle === 'serif'
                      ? 'border-primary bg-primary/10 text-primary font-semibold'
                      : 'border-border/60 bg-background/50 text-muted-foreground hover:text-foreground'
                  )}
                >
                  Dreamy Serif
                </button>
                <button
                  type="button"
                  onClick={() => setFontStyle('bengali')}
                  className={cn(
                    "px-2.5 py-1.5 rounded-lg border text-xs font-bengali text-left transition-all",
                    fontStyle === 'bengali'
                      ? 'border-primary bg-primary/10 text-primary font-semibold'
                      : 'border-border/60 bg-background/50 text-muted-foreground hover:text-foreground'
                  )}
                >
                  বাংলা ক্যালিগ্রাফিক
                </button>
                <button
                  type="button"
                  onClick={() => setFontStyle('mono')}
                  className={cn(
                    "px-2.5 py-1.5 rounded-lg border text-xs font-mono text-left transition-all",
                    fontStyle === 'mono'
                      ? 'border-primary bg-primary/10 text-primary font-semibold'
                      : 'border-border/60 bg-background/50 text-muted-foreground hover:text-foreground'
                  )}
                >
                  Developer Mono
                </button>
              </div>
            </div>

            {/* Suggested Tags Quick Add */}
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <TagIcon className="h-3.5 w-3.5 text-primary" />
                <h4 className="text-xs font-semibold text-foreground tracking-wide uppercase">
                  Quick Tags
                </h4>
              </div>
              <div className="flex flex-wrap gap-1">
                {['journal', 'code', 'ideas', 'poetry', 'study', 'বাংলা'].map((tName) => (
                  <button
                    key={tName}
                    type="button"
                    onClick={() => {
                      if (!tags.includes(tName)) setTags([...tags, tName]);
                    }}
                    className={cn(
                      "px-2 py-0.5 rounded-md text-[11px] border transition-colors",
                      tags.includes(tName)
                        ? 'bg-primary/20 text-primary border-primary/30'
                        : 'bg-muted/60 text-muted-foreground border-border/40 hover:text-foreground'
                    )}
                  >
                    #{tName}
                  </button>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </DialogContent>
    </Dialog>
  );
}
