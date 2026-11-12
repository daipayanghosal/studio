"use client";

import React, { useState, useEffect } from 'react';
import { type Editor } from '@tiptap/react';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  FileCode,
  Quote,
  List,
  ListOrdered,
  CheckSquare,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Heading1,
  Heading2,
  Heading3,
  Highlighter,
  Palette,
  Minus,
  Table as TableIcon,
  Link2,
  Image as ImageIcon,
  Undo2,
  Redo2,
  Subscript,
  Superscript,
  Mic,
  MicOff,
  Keyboard,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Toggle } from '@/components/ui/toggle';
import { useApp } from '@/components/providers/app-provider';
import BengaliAssistant from './bengali-assistant';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface EditorToolbarProps {
  editor: Editor | null;
  onVoiceText?: (text: string) => void;
}

const TEXT_COLORS = [
  '#0f172a', '#64748b', '#7c3aed', '#3b82f6', '#06b6d4',
  '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#ffffff',
];

const HIGHLIGHT_COLORS = [
  '#fef08a', // Pastel Yellow
  '#fbcfe8', // Pastel Pink
  '#ddd6fe', // Pastel Lavender
  '#bae6fd', // Pastel Sky
  '#a7f3d0', // Pastel Mint
  '#fed7aa', // Pastel Peach
];

export default function EditorToolbar({ editor, onVoiceText }: EditorToolbarProps) {
  const { t, locale } = useApp();
  const { toast } = useToast();
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const [bengaliAssistantOpen, setBengaliAssistantOpen] = useState(false);
  const [linkInput, setLinkInput] = useState('');
  const [linkOpen, setLinkOpen] = useState(false);
  const [imageInput, setImageInput] = useState('');
  const [imageOpen, setImageOpen] = useState(false);

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const sr = new SpeechRecognition();
        sr.continuous = true;
        sr.interimResults = false;
        sr.lang = locale === 'bn' ? 'bn-BD' : 'en-US';

        sr.onresult = (event: any) => {
          const current = event.resultIndex;
          const transcript = event.results[current][0].transcript;
          if (editor && transcript) {
            editor.chain().focus().insertContent(' ' + transcript).run();
          }
          if (onVoiceText) {
            onVoiceText(transcript);
          }
        };

        sr.onerror = (e: any) => {
          console.warn('Speech recognition error:', e);
          setIsListening(false);
        };

        sr.onend = () => {
          setIsListening(false);
        };

        setRecognition(sr);
      }
    }
  }, [locale, editor, onVoiceText]);

  const toggleListening = () => {
    if (!recognition) {
      toast({
        title: t.speechNotSupported,
        description: 'Try using Chrome, Edge, or Safari with microphone access.',
        variant: 'destructive',
      });
      return;
    }

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      try {
        recognition.lang = locale === 'bn' ? 'bn-BD' : 'en-US';
        recognition.start();
        setIsListening(true);
        toast({
          title: t.listening,
          description: locale === 'bn' ? 'বাংলায় কথা বলুন...' : 'Speak in English...',
        });
      } catch (err) {
        console.error(err);
      }
    }
  };

  if (!editor) {
    return (
      <div className="h-12 border-b border-border/60 bg-muted/30 animate-pulse rounded-t-xl" />
    );
  }

  const setLink = () => {
    if (!linkInput) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
    } else {
      const formatted = linkInput.startsWith('http') ? linkInput : `https://${linkInput}`;
      editor.chain().focus().extendMarkRange('link').setLink({ href: formatted }).run();
    }
    setLinkInput('');
    setLinkOpen(false);
  };

  const addImage = () => {
    if (imageInput) {
      editor.chain().focus().setImage({ src: imageInput }).run();
    }
    setImageInput('');
    setImageOpen(false);
  };

  return (
    <div className="flex flex-wrap items-center gap-0.5 sm:gap-1 p-1.5 sm:p-2 border-b border-border/60 bg-background/80 backdrop-blur-md rounded-t-xl sticky top-0 z-20 select-none">
      {/* History */}
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-primary/10"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        title="Undo (Ctrl+Z)"
      >
        <Undo2 className="h-4 w-4" />
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-primary/10"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        title="Redo (Ctrl+Y)"
      >
        <Redo2 className="h-4 w-4" />
      </Button>

      <Separator orientation="vertical" className="h-5 mx-0.5 sm:mx-1 bg-border/60" />

      {/* Headings Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-xs font-medium text-foreground hover:bg-primary/10 gap-1"
          >
            {editor.isActive('heading', { level: 1 })
              ? 'H1'
              : editor.isActive('heading', { level: 2 })
              ? 'H2'
              : editor.isActive('heading', { level: 3 })
              ? 'H3'
              : 'Text'}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-36 font-body">
          <DropdownMenuItem
            onClick={() => editor.chain().focus().setParagraph().run()}
            className={cn(editor.isActive('paragraph') && 'bg-primary/10 text-primary font-semibold')}
          >
            Paragraph (Normal)
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={cn(editor.isActive('heading', { level: 1 }) && 'bg-primary/10 text-primary font-semibold')}
          >
            <Heading1 className="h-4 w-4 mr-2" /> Heading 1
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={cn(editor.isActive('heading', { level: 2 }) && 'bg-primary/10 text-primary font-semibold')}
          >
            <Heading2 className="h-4 w-4 mr-2" /> Heading 2
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={cn(editor.isActive('heading', { level: 3 }) && 'bg-primary/10 text-primary font-semibold')}
          >
            <Heading3 className="h-4 w-4 mr-2" /> Heading 3
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Separator orientation="vertical" className="h-5 mx-0.5 sm:mx-1 bg-border/60" />

      {/* Bold, Italic, Underline, Strikethrough */}
      <Toggle
        size="sm"
        pressed={editor.isActive('bold')}
        onPressedChange={() => editor.chain().focus().toggleBold().run()}
        className="h-8 w-8 p-0 hover:bg-primary/10 data-[state=on]:bg-primary/20 data-[state=on]:text-primary"
        aria-label="Bold"
        title="Bold (Ctrl+B)"
      >
        <Bold className="h-3.5 w-3.5" />
      </Toggle>

      <Toggle
        size="sm"
        pressed={editor.isActive('italic')}
        onPressedChange={() => editor.chain().focus().toggleItalic().run()}
        className="h-8 w-8 p-0 hover:bg-primary/10 data-[state=on]:bg-primary/20 data-[state=on]:text-primary"
        aria-label="Italic"
        title="Italic (Ctrl+I)"
      >
        <Italic className="h-3.5 w-3.5" />
      </Toggle>

      <Toggle
        size="sm"
        pressed={editor.isActive('underline')}
        onPressedChange={() => editor.chain().focus().toggleUnderline().run()}
        className="h-8 w-8 p-0 hover:bg-primary/10 data-[state=on]:bg-primary/20 data-[state=on]:text-primary"
        aria-label="Underline"
        title="Underline (Ctrl+U)"
      >
        <Underline className="h-3.5 w-3.5" />
      </Toggle>

      <Toggle
        size="sm"
        pressed={editor.isActive('strike')}
        onPressedChange={() => editor.chain().focus().toggleStrike().run()}
        className="h-8 w-8 p-0 hover:bg-primary/10 data-[state=on]:bg-primary/20 data-[state=on]:text-primary"
        aria-label="Strikethrough"
        title="Strikethrough"
      >
        <Strikethrough className="h-3.5 w-3.5" />
      </Toggle>

      <Toggle
        size="sm"
        pressed={editor.isActive('code')}
        onPressedChange={() => editor.chain().focus().toggleCode().run()}
        className="h-8 w-8 p-0 hover:bg-primary/10 data-[state=on]:bg-primary/20 data-[state=on]:text-primary"
        aria-label="Inline Code"
        title="Inline Code (`)"
      >
        <Code className="h-3.5 w-3.5" />
      </Toggle>

      <Separator orientation="vertical" className="h-5 mx-0.5 sm:mx-1 bg-border/60" />

      {/* Highlighter Palette */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn(
              "h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-primary/10",
              editor.isActive('highlight') && 'bg-primary/20 text-primary'
            )}
            title="Highlight Color"
          >
            <Highlighter className="h-3.5 w-3.5" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2" align="start">
          <div className="space-y-1.5">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block px-1">
              {t.highlight}
            </span>
            <div className="flex gap-1.5">
              {HIGHLIGHT_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  className="h-6 w-6 rounded-full border border-black/10 transition-transform hover:scale-110"
                  style={{ backgroundColor: c }}
                  onClick={() => editor.chain().focus().toggleHighlight({ color: c }).run()}
                  aria-label={`Highlight ${c}`}
                />
              ))}
              <button
                type="button"
                className="h-6 px-1.5 text-[10px] rounded-md border border-border bg-muted/60 text-muted-foreground hover:text-foreground"
                onClick={() => editor.chain().focus().unsetHighlight().run()}
              >
                Clear
              </button>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Text Color Palette */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-primary/10"
            title="Text Color"
          >
            <Palette className="h-3.5 w-3.5" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2" align="start">
          <div className="space-y-1.5">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block px-1">
              Text Color
            </span>
            <div className="grid grid-cols-5 gap-1.5">
              {TEXT_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  className="h-6 w-6 rounded-full border border-border transition-transform hover:scale-110 shadow-sm"
                  style={{ backgroundColor: c }}
                  onClick={() => editor.chain().focus().setColor(c).run()}
                  aria-label={`Color ${c}`}
                />
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>

      <Separator orientation="vertical" className="h-5 mx-0.5 sm:mx-1 bg-border/60" />

      {/* Alignment */}
      <Toggle
        size="sm"
        pressed={editor.isActive({ textAlign: 'left' })}
        onPressedChange={() => editor.chain().focus().setTextAlign('left').run()}
        className="h-8 w-8 p-0 hover:bg-primary/10 data-[state=on]:bg-primary/20 data-[state=on]:text-primary"
        aria-label="Align Left"
        title="Align Left"
      >
        <AlignLeft className="h-3.5 w-3.5" />
      </Toggle>

      <Toggle
        size="sm"
        pressed={editor.isActive({ textAlign: 'center' })}
        onPressedChange={() => editor.chain().focus().setTextAlign('center').run()}
        className="h-8 w-8 p-0 hover:bg-primary/10 data-[state=on]:bg-primary/20 data-[state=on]:text-primary"
        aria-label="Align Center"
        title="Align Center"
      >
        <AlignCenter className="h-3.5 w-3.5" />
      </Toggle>

      <Toggle
        size="sm"
        pressed={editor.isActive({ textAlign: 'right' })}
        onPressedChange={() => editor.chain().focus().setTextAlign('right').run()}
        className="h-8 w-8 p-0 hover:bg-primary/10 data-[state=on]:bg-primary/20 data-[state=on]:text-primary"
        aria-label="Align Right"
        title="Align Right"
      >
        <AlignRight className="h-3.5 w-3.5" />
      </Toggle>

      <Separator orientation="vertical" className="h-5 mx-0.5 sm:mx-1 bg-border/60" />

      {/* Lists */}
      <Toggle
        size="sm"
        pressed={editor.isActive('bulletList')}
        onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
        className="h-8 w-8 p-0 hover:bg-primary/10 data-[state=on]:bg-primary/20 data-[state=on]:text-primary"
        aria-label="Bullet List"
        title="Bullet List (-)"
      >
        <List className="h-3.5 w-3.5" />
      </Toggle>

      <Toggle
        size="sm"
        pressed={editor.isActive('orderedList')}
        onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
        className="h-8 w-8 p-0 hover:bg-primary/10 data-[state=on]:bg-primary/20 data-[state=on]:text-primary"
        aria-label="Numbered List"
        title="Numbered List (1.)"
      >
        <ListOrdered className="h-3.5 w-3.5" />
      </Toggle>

      {/* Task List / Checklist */}
      <Toggle
        size="sm"
        pressed={editor.isActive('taskList')}
        onPressedChange={() => editor.chain().focus().toggleTaskList().run()}
        className="h-8 w-8 p-0 hover:bg-primary/10 data-[state=on]:bg-primary/20 data-[state=on]:text-primary"
        aria-label={t.checklist}
        title={`${t.checklist} ([ ])`}
      >
        <CheckSquare className="h-3.5 w-3.5" />
      </Toggle>

      {/* Blockquote */}
      <Toggle
        size="sm"
        pressed={editor.isActive('blockquote')}
        onPressedChange={() => editor.chain().focus().toggleBlockquote().run()}
        className="h-8 w-8 p-0 hover:bg-primary/10 data-[state=on]:bg-primary/20 data-[state=on]:text-primary"
        aria-label={t.quote}
        title={`${t.quote} (>)`}
      >
        <Quote className="h-3.5 w-3.5" />
      </Toggle>

      {/* Syntax Highlighted Code Block */}
      <Toggle
        size="sm"
        pressed={editor.isActive('codeBlock')}
        onPressedChange={() => editor.chain().focus().toggleCodeBlock().run()}
        className="h-8 px-2 hover:bg-primary/10 data-[state=on]:bg-primary/20 data-[state=on]:text-primary gap-1"
        aria-label={t.syntaxHighlight}
        title={`${t.syntaxHighlight} (\`\`\`)`}
      >
        <FileCode className="h-3.5 w-3.5 text-purple-500" />
        <span className="text-xs font-mono hidden md:inline">Code</span>
      </Toggle>

      <Separator orientation="vertical" className="h-5 mx-0.5 sm:mx-1 bg-border/60" />

      {/* Table Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-primary/10"
            title={t.table}
          >
            <TableIcon className="h-3.5 w-3.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-44 font-body">
          <DropdownMenuItem
            onClick={() =>
              editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
            }
          >
            {t.insertTable} (3x3)
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => editor.chain().focus().addRowAfter().run()}>
            Add Row Below
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => editor.chain().focus().addColumnAfter().run()}>
            Add Column Right
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => editor.chain().focus().deleteRow().run()}>
            Delete Row
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => editor.chain().focus().deleteColumn().run()}>
            Delete Column
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => editor.chain().focus().deleteTable().run()}
            className="text-destructive focus:text-destructive"
          >
            Delete Table
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Insert Link */}
      <Popover open={linkOpen} onOpenChange={setLinkOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn(
              "h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-primary/10",
              editor.isActive('link') && 'bg-primary/20 text-primary'
            )}
            title="Insert Link"
          >
            <Link2 className="h-3.5 w-3.5" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-72 p-3 font-body" align="start">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground">Link URL</label>
            <input
              type="url"
              value={linkInput}
              onChange={(e) => setLinkInput(e.target.value)}
              placeholder="https://example.com"
              className="w-full px-2.5 py-1.5 text-xs rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  setLink();
                }
              }}
            />
            <div className="flex justify-end gap-1.5">
              <Button type="button" size="sm" variant="ghost" onClick={() => setLinkOpen(false)}>
                Cancel
              </Button>
              <Button type="button" size="sm" onClick={setLink}>
                Apply
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Insert Image */}
      <Popover open={imageOpen} onOpenChange={setImageOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-primary/10"
            title="Insert Image"
          >
            <ImageIcon className="h-3.5 w-3.5" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-72 p-3 font-body" align="start">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground">Image URL</label>
            <input
              type="url"
              value={imageInput}
              onChange={(e) => setImageInput(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full px-2.5 py-1.5 text-xs rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addImage();
                }
              }}
            />
            <div className="flex justify-end gap-1.5">
              <Button type="button" size="sm" variant="ghost" onClick={() => setImageOpen(false)}>
                Cancel
              </Button>
              <Button type="button" size="sm" onClick={addImage}>
                Insert
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Horizontal Rule */}
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-primary/10"
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        title="Divider (---)"
      >
        <Minus className="h-3.5 w-3.5" />
      </Button>

      {/* Subscript & Superscript */}
      <Toggle
        size="sm"
        pressed={editor.isActive('subscript')}
        onPressedChange={() => editor.chain().focus().toggleSubscript().run()}
        className="h-8 w-8 p-0 hover:bg-primary/10 data-[state=on]:bg-primary/20 data-[state=on]:text-primary hidden sm:inline-flex"
        title="Subscript"
      >
        <Subscript className="h-3.5 w-3.5" />
      </Toggle>

      <Toggle
        size="sm"
        pressed={editor.isActive('superscript')}
        onPressedChange={() => editor.chain().focus().toggleSuperscript().run()}
        className="h-8 w-8 p-0 hover:bg-primary/10 data-[state=on]:bg-primary/20 data-[state=on]:text-primary hidden sm:inline-flex"
        title="Superscript"
      >
        <Superscript className="h-3.5 w-3.5" />
      </Toggle>

      <div className="flex-1" />

      {/* Voice Dictation (Speech to Text) */}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={toggleListening}
        className={cn(
          "h-8 px-2 gap-1.5 text-xs font-medium rounded-lg transition-all",
          isListening
            ? 'bg-rose-500/20 text-rose-500 hover:bg-rose-500/30 animate-pulse'
            : 'text-muted-foreground hover:text-foreground hover:bg-primary/10'
        )}
        title={isListening ? t.stopListening : t.speechToText}
      >
        {isListening ? (
          <>
            <MicOff className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{t.listening}</span>
          </>
        ) : (
          <>
            <Mic className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{t.speechToText}</span>
          </>
        )}
      </Button>

      {/* Bengali Phonetic & Keyboard Assistant Trigger */}
      <Popover open={bengaliAssistantOpen} onOpenChange={setBengaliAssistantOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 px-2.5 gap-1.5 text-xs font-semibold rounded-lg border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 transition-all font-bengali"
          >
            <Keyboard className="h-3.5 w-3.5" />
            <span>বাংলা কীবোর্ড</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 border-primary/20 shadow-xl" align="end">
          <BengaliAssistant editor={editor} />
        </PopoverContent>
      </Popover>
    </div>
  );
}
