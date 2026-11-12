"use client";

import React, { useState } from 'react';
import {
  BENGALI_VOWELS,
  BENGALI_KARS,
  BENGALI_CONSONANTS,
  BENGALI_SYMBOLS,
  BENGALI_DIGITS,
  BENGALI_QUICK_PHRASES,
  transliteratePhonetic,
  getBengaliCandidates,
} from '@/lib/bengali-phonetic';
import { useApp } from '@/components/providers/app-provider';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles, CornerDownLeft, Copy, Check, Keyboard, BookOpen } from 'lucide-react';
import type { Editor } from '@tiptap/react';

interface BengaliAssistantProps {
  editor: Editor | null;
  onInsertText?: (text: string) => void;
}

export default function BengaliAssistant({
  editor,
  onInsertText,
}: BengaliAssistantProps) {
  const { t } = useApp();
  const [romanInput, setRomanInput] = useState('');
  const [copied, setCopied] = useState(false);

  const previewBengali = transliteratePhonetic(romanInput);
  const words = romanInput.trim().split(/\s+/);
  const lastWord = words[words.length - 1] || '';
  const candidates = getBengaliCandidates(lastWord);

  const insertTextIntoEditor = (text: string) => {
    if (!text) return;
    if (editor) {
      editor.chain().focus().insertContent(text).run();
    } else if (onInsertText) {
      onInsertText(text);
    }
  };

  const handleInsertCurrentPhonetic = () => {
    if (!previewBengali) return;
    insertTextIntoEditor(previewBengali + ' ');
    setRomanInput('');
  };

  const handlePickCandidate = (candidate: string) => {
    if (words.length <= 1) {
      insertTextIntoEditor(candidate + ' ');
      setRomanInput('');
    } else {
      const preceding = words.slice(0, -1).join(' ');
      const precedingBn = transliteratePhonetic(preceding);
      insertTextIntoEditor(precedingBn + ' ' + candidate + ' ');
      setRomanInput('');
    }
  };

  const handleCopy = async () => {
    if (!previewBengali) return;
    try {
      await navigator.clipboard.writeText(previewBengali);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {}
  };

  return (
    <div className="w-[360px] sm:w-[420px] p-4 text-sm font-body">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-border/60">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
            <Keyboard className="h-4 w-4" />
          </div>
          <div>
            <h4 className="font-semibold text-foreground text-sm font-headline">
              {t.bengaliHelper}
            </h4>
            <p className="text-[11px] text-muted-foreground">
              Phonetic typing & instant character palette
            </p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="phonetic" className="w-full">
        <TabsList className="grid grid-cols-3 mb-3 bg-muted/60 p-1">
          <TabsTrigger value="phonetic" className="text-xs">
            <Sparkles className="h-3 w-3 mr-1.5 text-purple-500" />
            Phonetic
          </TabsTrigger>
          <TabsTrigger value="keyboard" className="text-xs">
            বর্ণমালা
          </TabsTrigger>
          <TabsTrigger value="guide" className="text-xs">
            <BookOpen className="h-3 w-3 mr-1.5" />
            Guide
          </TabsTrigger>
        </TabsList>

        {/* Phonetic Transliteration Tab */}
        <TabsContent value="phonetic" className="space-y-3 mt-0">
          <div>
            <label className="text-[11px] font-medium text-muted-foreground mb-1 block">
              Type in English / Roman (e.g. <i>ami banglay likhi</i>):
            </label>
            <div className="relative">
              <input
                type="text"
                value={romanInput}
                onChange={(e) => setRomanInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleInsertCurrentPhonetic();
                  }
                }}
                placeholder="Type here in English letters..."
                className="w-full px-3 py-2 text-xs rounded-lg border border-border/80 bg-background/70 focus:outline-none focus:ring-2 focus:ring-primary/50 font-sans"
              />
              {romanInput && (
                <button
                  type="button"
                  onClick={() => setRomanInput('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Bengali Live Output */}
          <div className="p-2.5 rounded-lg border border-primary/20 bg-primary/[0.04] space-y-2">
            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span>রূপান্তর (Bangla Output):</span>
              <div className="flex items-center gap-1.5">
                {previewBengali && (
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="p-1 hover:text-primary transition-colors"
                    title="Copy"
                  >
                    {copied ? (
                      <Check className="h-3.5 w-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>
                )}
              </div>
            </div>

            <div className="min-h-[38px] flex items-center font-bengali text-base font-medium text-foreground px-1">
              {previewBengali || (
                <span className="text-xs font-sans text-muted-foreground/60 italic">
                  Converted Bengali will appear here...
                </span>
              )}
            </div>

            {/* Smart Candidate Chips */}
            {candidates.length > 0 && lastWord && (
              <div className="flex flex-wrap gap-1 pt-1 border-t border-border/40">
                <span className="text-[10px] text-muted-foreground self-center mr-1">
                  Suggestions:
                </span>
                {candidates.map((cand, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handlePickCandidate(cand)}
                    className="px-2 py-0.5 rounded-md text-xs font-bengali bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 transition-colors"
                  >
                    {cand}
                  </button>
                ))}
              </div>
            )}

            <Button
              type="button"
              size="sm"
              onClick={handleInsertCurrentPhonetic}
              disabled={!previewBengali}
              className="w-full text-xs h-8 mt-1 gap-1.5"
            >
              <CornerDownLeft className="h-3.5 w-3.5" />
              নোটের মধ্যে যুক্ত করুন (Insert into Note)
            </Button>
          </div>

          {/* Quick Phrases */}
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground/80 block mb-1.5">
              Quick Phrases / দরকারি শব্দগুচ্ছ
            </span>
            <div className="flex flex-wrap gap-1">
              {BENGALI_QUICK_PHRASES.map((phrase, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => insertTextIntoEditor(phrase + ' ')}
                  className="px-2 py-1 rounded text-xs font-bengali bg-muted/60 hover:bg-muted text-foreground transition-colors border border-border/40"
                >
                  {phrase}
                </button>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Virtual Keyboard Grid Tab */}
        <TabsContent value="keyboard" className="space-y-3 mt-0 max-h-[360px] overflow-y-auto pr-1">
          {/* Vowel Signs (Kars) */}
          <div>
            <span className="text-[11px] font-semibold text-muted-foreground block mb-1">
              কারচিহ্ন (Vowel Signs)
            </span>
            <div className="grid grid-cols-5 gap-1">
              {BENGALI_KARS.map((k, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => insertTextIntoEditor(k.char)}
                  className="h-8 rounded bg-muted/50 hover:bg-primary/20 hover:text-primary font-bengali text-sm font-semibold border border-border/50 transition-colors"
                  title={k.label}
                >
                  {k.char}
                </button>
              ))}
            </div>
          </div>

          {/* Symbols & Conjunct Joiner */}
          <div>
            <span className="text-[11px] font-semibold text-muted-foreground block mb-1">
              যুক্তাক্ষর হসন্ত ও যতিচিহ্ন
            </span>
            <div className="grid grid-cols-4 gap-1">
              {BENGALI_SYMBOLS.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => insertTextIntoEditor(s.char)}
                  className="h-8 rounded bg-muted/50 hover:bg-primary/20 hover:text-primary font-bengali text-sm font-semibold border border-border/50 transition-colors"
                  title={s.label}
                >
                  {s.char}
                </button>
              ))}
            </div>
          </div>

          {/* Vowels */}
          <div>
            <span className="text-[11px] font-semibold text-muted-foreground block mb-1">
              স্বরবর্ণ (Vowels)
            </span>
            <div className="grid grid-cols-6 gap-1">
              {BENGALI_VOWELS.map((v, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => insertTextIntoEditor(v)}
                  className="h-8 rounded bg-muted/50 hover:bg-primary/20 hover:text-primary font-bengali text-sm font-semibold border border-border/50 transition-colors"
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          {/* Consonants */}
          <div>
            <span className="text-[11px] font-semibold text-muted-foreground block mb-1">
              ব্যঞ্জনবর্ণ (Consonants)
            </span>
            <div className="grid grid-cols-7 gap-1">
              {BENGALI_CONSONANTS.map((c, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => insertTextIntoEditor(c)}
                  className="h-7 rounded bg-muted/50 hover:bg-primary/20 hover:text-primary font-bengali text-xs font-semibold border border-border/50 transition-colors"
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Bengali Numerals */}
          <div>
            <span className="text-[11px] font-semibold text-muted-foreground block mb-1">
              সংখ্যা (Digits)
            </span>
            <div className="grid grid-cols-5 gap-1">
              {BENGALI_DIGITS.map((d, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => insertTextIntoEditor(d)}
                  className="h-7 rounded bg-muted/50 hover:bg-primary/20 hover:text-primary font-bengali text-xs font-semibold border border-border/50 transition-colors"
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Quick Reference Guide */}
        <TabsContent value="guide" className="mt-0 max-h-[360px] overflow-y-auto pr-1 text-xs space-y-2">
          <div className="p-2.5 rounded-lg bg-muted/50 border border-border/60">
            <h5 className="font-semibold text-foreground mb-1 font-headline">
              Phonetic Typing Rules (Avro style)
            </h5>
            <ul className="space-y-1 text-muted-foreground text-[11px]">
              <li><strong className="text-foreground">k</strong> = ক, <strong className="text-foreground">kh</strong> = খ, <strong className="text-foreground">g</strong> = গ</li>
              <li><strong className="text-foreground">c / ch</strong> = চ, <strong className="text-foreground">chh</strong> = ছ, <strong className="text-foreground">j</strong> = জ</li>
              <li><strong className="text-foreground">T</strong> = ট, <strong className="text-foreground">t</strong> = ত, <strong className="text-foreground">th</strong> = থ</li>
              <li><strong className="text-foreground">D</strong> = ড, <strong className="text-foreground">d</strong> = দ, <strong className="text-foreground">dh</strong> = ধ</li>
              <li><strong className="text-foreground">p</strong> = প, <strong className="text-foreground">f / ph</strong> = ফ, <strong className="text-foreground">b</strong> = ব, <strong className="text-foreground">bh / v</strong> = ভ</li>
              <li><strong className="text-foreground">sh</strong> = শ, <strong className="text-foreground">Sh / S</strong> = ষ, <strong className="text-foreground">s</strong> = স</li>
              <li><strong className="text-foreground">R</strong> = ড়, <strong className="text-foreground">Rh</strong> = ঢ়, <strong className="text-foreground">y</strong> = য়</li>
              <li><strong className="text-foreground">ng</strong> = ং, <strong className="text-foreground">:</strong> = ঃ, <strong className="text-foreground">^</strong> = ঁ</li>
              <li><strong className="text-foreground">.</strong> = । (Bengali Dari)</li>
            </ul>
          </div>
          <p className="text-[11px] text-muted-foreground italic px-1">
            Tip: Press Enter in the phonetic input to immediately insert the text into your note!
          </p>
        </TabsContent>
      </Tabs>
    </div>
  );
}
