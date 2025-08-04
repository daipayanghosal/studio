
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Bold, Italic, Underline, Palette, Code, Link, List, ListOrdered } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Toggle } from '../ui/toggle';

interface EditorToolbarProps {
  editorRef: React.RefObject<HTMLDivElement>;
}

const textColors = [
  '#000000', '#e60000', '#ff9900', '#ffff00', '#008a00',
  '#0066cc', '#9933ff', '#ffffff', '#facccc', '#ffebcc',
  '#ffffcc', '#cce8cc', '#cce0f5', '#ebd6ff',
];


export default function EditorToolbar({ editorRef }: EditorToolbarProps) {
  
  const execCmd = (command: string, value?: string) => {
    if (editorRef.current) {
      editorRef.current.focus();
      document.execCommand(command, false, value);
    }
  };

  const [activeToggles, setActiveToggles] = useState<Record<string, boolean>>({});

  const updateToolbarState = useCallback(() => {
    const newActiveToggles: Record<string, boolean> = {};
    if (document.queryCommandState) {
        newActiveToggles['bold'] = document.queryCommandState('bold');
        newActiveToggles['italic'] = document.queryCommandState('italic');
        newActiveToggles['underline'] = document.queryCommandState('underline');
    }
    setActiveToggles(newActiveToggles);
  }, []);

  useEffect(() => {
    const editor = editorRef.current;
    if (editor) {
      const handleSelectionChange = () => {
        updateToolbarState();
      };
      
      document.addEventListener('selectionchange', handleSelectionChange);
      editor.addEventListener('input', updateToolbarState);
      editor.addEventListener('click', updateToolbarState);
      editor.addEventListener('keydown', updateToolbarState);

      return () => {
        document.removeEventListener('selectionchange', handleSelectionChange);
        editor.removeEventListener('input', updateToolbarState);
        editor.removeEventListener('click', updateToolbarState);
        editor.removeEventListener('keydown', updateToolbarState);
      };
    }
  }, [editorRef, updateToolbarState]);

  return (
    <div className="flex items-center gap-1 border border-input border-b-0 p-2 bg-muted/50 rounded-t-md sticky top-0 z-10">
      <Toggle size="sm" pressed={activeToggles['bold']} onPressedChange={() => execCmd('bold')} aria-label="Bold">
        <Bold className="h-4 w-4" />
      </Toggle>
      <Toggle size="sm" pressed={activeToggles['italic']} onPressedChange={() => execCmd('italic')} aria-label="Italic">
        <Italic className="h-4 w-4" />
      </Toggle>
      <Toggle size="sm" pressed={activeToggles['underline']} onPressedChange={() => execCmd('underline')} aria-label="Underline">
        <Underline className="h-4 w-4" />
      </Toggle>
       <Separator orientation="vertical" className="h-6 mx-1" />
       <Toggle size="sm" onPressedChange={() => execCmd('insertUnorderedList')} aria-label="Bullet List">
        <List className="h-4 w-4" />
      </Toggle>
      <Toggle size="sm" onPressedChange={() => execCmd('insertOrderedList')} aria-label="Numbered List">
        <ListOrdered className="h-4 w-4" />
      </Toggle>

      <Separator orientation="vertical" className="h-6 mx-1" />
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="p-2">
            <Palette className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2">
          <div className="grid grid-cols-7 gap-1">
            {textColors.map((color) => (
              <Button
                key={color}
                variant="ghost"
                size="icon"
                className="h-6 w-6 rounded-full"
                style={{ backgroundColor: color }}
                onClick={() => execCmd('foreColor', color)}
                aria-label={`Set text color to ${color}`}
              />
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
