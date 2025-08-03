"use client";

import React from 'react';
import { Bold, Italic, Underline, Palette } from 'lucide-react';
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
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  return (
    <div className="flex items-center gap-1 border-b border-input p-2 bg-muted/50 rounded-t-md">
      <Toggle size="sm" onPressedChange={() => execCmd('bold')} aria-label="Bold">
        <Bold className="h-4 w-4" />
      </Toggle>
      <Toggle size="sm" onPressedChange={() => execCmd('italic')} aria-label="Italic">
        <Italic className="h-4 w-4" />
      </Toggle>
      <Toggle size="sm" onPressedChange={() => execCmd('underline')} aria-label="Underline">
        <Underline className="h-4 w-4" />
      </Toggle>
      <Separator orientation="vertical" className="h-6 mx-1" />
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm">
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
