"use client";

import React, { useState } from 'react';
import { NodeViewContent, NodeViewWrapper, type NodeViewProps } from '@tiptap/react';
import { Check, Copy, Code2 } from 'lucide-react';

const CODE_LANGUAGES = [
  { value: '', label: 'Auto Detect' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'xml', label: 'HTML / XML' },
  { value: 'css', label: 'CSS / SCSS' },
  { value: 'json', label: 'JSON' },
  { value: 'bash', label: 'Bash / Shell' },
  { value: 'sql', label: 'SQL' },
  { value: 'c', label: 'C' },
  { value: 'cpp', label: 'C++' },
  { value: 'csharp', label: 'C#' },
  { value: 'java', label: 'Java' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'php', label: 'PHP' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'swift', label: 'Swift' },
  { value: 'kotlin', label: 'Kotlin' },
  { value: 'yaml', label: 'YAML' },
  { value: 'markdown', label: 'Markdown' },
  { value: 'graphql', label: 'GraphQL' },
  { value: 'diff', label: 'Diff' },
  { value: 'plaintext', label: 'Plain Text' },
];

export default function CodeBlockNode({
  node,
  updateAttributes,
  editor,
}: NodeViewProps) {
  const [copied, setCopied] = useState(false);
  const currentLanguage = (node.attrs.language as string) || '';
  const isEditable = editor?.isEditable ?? false;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(node.textContent || '');
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Fallback
    }
  };

  const displayLabel =
    CODE_LANGUAGES.find((l) => l.value === currentLanguage)?.label ||
    (currentLanguage ? currentLanguage.toUpperCase() : 'Code');

  return (
    <NodeViewWrapper className="chrono-code-wrapper my-4 rounded-xl overflow-hidden not-prose">
      <div
        contentEditable={false}
        className="flex items-center justify-between px-3.5 py-2 border-b border-white/10 bg-white/[0.04] select-none"
      >
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5" aria-hidden="true">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-400/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-300/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
          </div>
          <div className="flex items-center gap-1.5 text-xs text-purple-200/80 ml-1">
            <Code2 className="h-3.5 w-3.5 text-purple-300" />
            {isEditable ? (
              <select
                value={currentLanguage}
                onChange={(e) => updateAttributes({ language: e.target.value })}
                className="bg-transparent text-xs text-purple-100/90 font-medium focus:outline-none cursor-pointer hover:text-white pr-1"
                aria-label="Code language"
              >
                {CODE_LANGUAGES.map((lang) => (
                  <option
                    key={lang.value}
                    value={lang.value}
                    className="bg-[#191632] text-slate-100"
                  >
                    {lang.label}
                  </option>
                ))}
              </select>
            ) : (
              <span className="font-medium tracking-wide">{displayLabel}</span>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium text-purple-100/80 hover:text-white hover:bg-white/10 transition-colors"
          title="Copy code"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-emerald-300">Copied</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      <pre className="m-0">
        <NodeViewContent as="div" className="font-mono" />
      </pre>
    </NodeViewWrapper>
  );
}
