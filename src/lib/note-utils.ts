import { NoteFontStyle, NoteLanguage } from '@/types';

export interface DreamNoteColor {
  hex: string;
  nameEn: string;
  nameBn: string;
  tint: string;
}

export const DREAM_NOTE_COLORS: DreamNoteColor[] = [
  { hex: '#77BEF0', nameEn: 'Celestial Blue', nameBn: 'আকাশী নীল', tint: 'rgba(119, 190, 240, 0.14)' },
  { hex: '#A78BFA', nameEn: 'Dreamy Lavender', nameBn: 'স্বপ্নিল ল্যাভেন্ডার', tint: 'rgba(167, 139, 250, 0.14)' },
  { hex: '#F472B6', nameEn: 'Rose Quartz', nameBn: 'গোলাপি কোয়ার্টজ', tint: 'rgba(244, 114, 182, 0.14)' },
  { hex: '#FFCB61', nameEn: 'Moonlight Gold', nameBn: 'জ্যোৎস্না সোনালি', tint: 'rgba(255, 203, 97, 0.14)' },
  { hex: '#FF894F', nameEn: 'Sunset Peach', nameBn: 'গোধূলি কমলা', tint: 'rgba(255, 137, 79, 0.14)' },
  { hex: '#EA5B6F', nameEn: 'Crimson Berry', nameBn: 'টকটকে লাল', tint: 'rgba(234, 91, 111, 0.14)' },
  { hex: '#34D399', nameEn: 'Mint Breeze', nameBn: 'শীতল পুদিনা', tint: 'rgba(52, 211, 153, 0.14)' },
  { hex: '#2DD4BF', nameEn: 'Aurora Teal', nameBn: 'উত্তরী টিল', tint: 'rgba(45, 212, 191, 0.14)' },
];

export function stripHtmlToText(html: string): string {
  if (!html) return '';
  if (typeof window === 'undefined') {
    return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  }
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return (doc.body.textContent || '').replace(/\s+/g, ' ').trim();
}

export function getWordAndCharStats(html: string): {
  words: number;
  chars: number;
  readTimeMinutes: number;
} {
  const plain = stripHtmlToText(html);
  if (!plain) {
    return { words: 0, chars: 0, readTimeMinutes: 0 };
  }
  // Split by whitespace (works cleanly for both Bengali and English Unicode text)
  const words = plain.split(/\s+/).filter(Boolean).length;
  const chars = plain.length;
  const readTimeMinutes = Math.max(1, Math.ceil(words / 180));
  return { words, chars, readTimeMinutes };
}

export function hasCodeBlock(html: string): boolean {
  if (!html) return false;
  return /<pre[\s>]/i.test(html) || /<code[\s>]/i.test(html);
}

export function htmlToMarkdown(html: string, title?: string): string {
  let md = html || '';

  // Code blocks first
  md = md.replace(
    /<pre[^>]*><code(?:\s+class="language-([^"]*)")?[^>]*>([\s\S]*?)<\/code><\/pre>/gi,
    (_m, lang, code) => {
      const cleanCode = decodeHtmlEntities(code.replace(/<[^>]+>/g, ''));
      return `\n\`\`\`${lang || ''}\n${cleanCode}\n\`\`\`\n\n`;
    }
  );

  // Headings
  md = md.replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, '\n# $1\n\n');
  md = md.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, '\n## $1\n\n');
  md = md.replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, '\n### $1\n\n');

  // Task items
  md = md.replace(
    /<li[^>]*data-type="taskItem"[^>]*data-checked="true"[^>]*>([\s\S]*?)<\/li>/gi,
    '- [x] $1\n'
  );
  md = md.replace(
    /<li[^>]*data-type="taskItem"[^>]*>([\s\S]*?)<\/li>/gi,
    '- [ ] $1\n'
  );

  // Regular list items
  md = md.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, '- $1\n');
  md = md.replace(/<\/?(ul|ol)[^>]*>/gi, '\n');

  // Blockquotes
  md = md.replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, '\n> $1\n\n');

  // Inline styles
  md = md.replace(/<(strong|b)[^>]*>([\s\S]*?)<\/\1>/gi, '**$2**');
  md = md.replace(/<(em|i)[^>]*>([\s\S]*?)<\/\1>/gi, '*$2*');
  md = md.replace(/<(s|del|strike)[^>]*>([\s\S]*?)<\/\1>/gi, '~~$2~~');
  md = md.replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, '`$1`');
  md = md.replace(/<a[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, '[$2]($1)');
  md = md.replace(/<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*\/?>/gi, '![$2]($1)');
  md = md.replace(/<img[^>]*src="([^"]*)"[^>]*\/?>/gi, '![]($1)');
  md = md.replace(/<hr[^>]*\/?>/gi, '\n---\n\n');
  md = md.replace(/<br[^>]*\/?>/gi, '\n');
  md = md.replace(/<\/p>/gi, '\n\n');
  md = md.replace(/<[^>]+>/g, '');

  md = decodeHtmlEntities(md).replace(/\n{3,}/g, '\n\n').trim();

  if (title) {
    return `# ${title}\n\n${md}`;
  }
  return md;
}

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
}

function triggerDownload(filename: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function sanitizeFilename(title: string): string {
  return (title || 'chronocanvas-note')
    .replace(/[\\/:*?"<>|]/g, '')
    .trim()
    .slice(0, 60) || 'chronocanvas-note';
}

export function exportAsMarkdown(title: string, html: string) {
  const md = htmlToMarkdown(html, title);
  triggerDownload(`${sanitizeFilename(title)}.md`, md, 'text/markdown;charset=utf-8');
}

export function exportAsText(title: string, html: string) {
  const plain = `${title}\n${'='.repeat(Math.min(title.length || 10, 40))}\n\n${stripHtmlToText(html)}`;
  triggerDownload(`${sanitizeFilename(title)}.txt`, plain, 'text/plain;charset=utf-8');
}

export function exportAsHtml(title: string, html: string) {
  const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title || 'ChronoCanvas Note'}</title>
  <style>
    body { font-family: system-ui, -apple-system, 'Noto Sans Bengali', sans-serif; max-width: 780px; margin: 3rem auto; padding: 0 1.5rem; line-height: 1.8; color: #1e293b; }
    h1, h2, h3 { color: #0f172a; }
    pre { background: #131126; color: #e2e8f0; padding: 1rem 1.25rem; border-radius: 10px; overflow-x: auto; }
    blockquote { border-left: 4px solid #7c3aed; padding-left: 1rem; color: #475569; font-style: italic; }
    table { width: 100%; border-collapse: collapse; margin: 1rem 0; }
    th, td { border: 1px solid #cbd5e1; padding: 0.5rem 0.75rem; text-align: left; }
    th { background: #f1f5f9; }
  </style>
</head>
<body>
  <h1>${title}</h1>
  ${html}
</body>
</html>`;
  triggerDownload(`${sanitizeFilename(title)}.html`, fullHtml, 'text/html;charset=utf-8');
}

export interface NoteTemplate {
  id: string;
  nameEn: string;
  nameBn: string;
  descEn: string;
  descBn: string;
  title: string;
  content: string;
  color: string;
  tags: string[];
  language: NoteLanguage;
  fontStyle: NoteFontStyle;
}

export const NOTE_TEMPLATES: NoteTemplate[] = [
  {
    id: 'reflection',
    nameEn: 'Daily Reflection',
    nameBn: 'দৈনিক ভাবনা',
    descEn: 'Gratitude, thoughts & goals',
    descBn: 'কৃতজ্ঞতা, ভাবনা ও লক্ষ্য',
    title: 'Daily Reflection',
    color: '#A78BFA',
    tags: ['journal', 'reflection'],
    language: 'bilingual',
    fontStyle: 'serif',
    content: `<h2>✨ Today's Highlights / আজকের বিশেষ মুহূর্ত</h2><p>Write down three things that brought you peace or joy today...</p><blockquote>"Quiet the mind, and the soul will speak."</blockquote><h2>📌 Tasks & Intentions</h2><ul data-type="taskList"><li data-type="taskItem" data-checked="false"><p>Review top priority</p></li><li data-type="taskItem" data-checked="false"><p>Take 10 minutes to unwind</p></li></ul>`,
  },
  {
    id: 'code-vault',
    nameEn: 'Code & Architecture',
    nameBn: 'কোড ও আর্কিটেকচার',
    descEn: 'Syntax-highlighted snippet & design notes',
    descBn: 'কোড স্নিপেট ও টেকনিক্যাল নোট',
    title: 'Code Snippet & Notes',
    color: '#77BEF0',
    tags: ['code', 'dev'],
    language: 'en',
    fontStyle: 'sans',
    content: `<h2>💡 Overview</h2><p>Document the algorithm, API design, or snippet below:</p><pre><code class="language-typescript">// Dreamy TypeScript utility
export function greet(name: string): string {
  return \`Hello, \${name}! Welcome to ChronoCanvas.\`;
}</code></pre><h3>Checklist</h3><ul data-type="taskList"><li data-type="taskItem" data-checked="false"><p>Handle edge cases</p></li><li data-type="taskItem" data-checked="false"><p>Write unit tests</p></li></ul>`,
  },
  {
    id: 'bengali-literary',
    nameEn: 'Bengali Writing (বাংলা রচনা)',
    nameBn: 'বাংলা সাহিত্য ও কবিতা',
    descEn: 'Poetry, prose or diary in Bangla',
    descBn: 'কবিতা, গল্প বা বাংলা ডায়েরি',
    title: 'আজকের বাংলা লেখা',
    color: '#F472B6',
    tags: ['বাংলা', 'সাহিত্য'],
    language: 'bn',
    fontStyle: 'bengali',
    content: `<h2>নতুন ভাবনা</h2><p>মনের গহীনের কথাগুলো এখানে সাজিয়ে লিখুন।</p><blockquote>"আমার সোনার বাংলা, আমি তোমায় ভালোবাসি।"</blockquote><p>আজকের বিশেষ কিছু মুহূর্ত বা কবিতার পঙ্‌ক্তি...</p>`,
  },
  {
    id: 'checklist',
    nameEn: 'Action & Study Plan',
    nameBn: 'কাজ ও পড়াশোনার তালিকা',
    descEn: 'Interactive checklists & structured table',
    descBn: 'চেকলিস্ট ও সময়সূচী টেবিল',
    title: 'Weekly Study & Task Plan',
    color: '#34D399',
    tags: ['tasks', 'study'],
    language: 'en',
    fontStyle: 'sans',
    content: `<h2>🎯 Priorities</h2><ul data-type="taskList"><li data-type="taskItem" data-checked="false"><p>Complete core module</p></li><li data-type="taskItem" data-checked="false"><p>Revise notes</p></li></ul><h2>📅 Schedule</h2><table><tbody><tr><th><p>Time</p></th><th><p>Focus Area</p></th><th><p>Status</p></th></tr><tr><td><p>Morning</p></td><td><p>Deep Work</p></td><td><p>Planned</p></td></tr><tr><td><p>Evening</p></td><td><p>Reading & Review</p></td><td><p>Pending</p></td></tr></tbody></table>`,
  },
];
