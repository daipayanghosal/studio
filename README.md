# ChronoCanvas (ক্রোনোক্যানভাস) 🌌

> An ethereal, full-scale multilingual note-taking & code sanctuary with a dreamy aesthetic, native English and Bengali (বাংলা) editing, rich formatting tools, and syntax-highlighted code blocks.

---

## ✨ Features Overview

### 🎨 Dreamy UI & Atmospheric Aesthetic
- **Glassmorphism & Auroral Orbs**: Ambient floating gradients (`Celestial Aurora`, `Cosmic Nebula`, `Twilight Sunset`, `Breeze Mint`) with hardware-accelerated transforms and frosted glass surfaces.
- **Multilingual Typography Pairing**: Curated Google Fonts — `Outfit` for display headlines, `Hind Siliguri` & `Noto Sans Bengali` for Bengali scripts, `Plus Jakarta Sans` for clean body text, `Lora` for dreamy serifs, and `JetBrains Mono` for code blocks.
- **Dark & Light Modes**: Seamless day-and-night theme toggle with tailored pastel tokens for both lighting conditions.
- **Dream Grid & Serene List Views**: Switch between responsive card masonry and a clean compact list.

### 🇧🇩 Multilingual Bengali & English Editing
- **Dual Language Interface (English / বাংলা)**: Complete localized UI with one-click instant language toggle.
- **Interactive Bengali Typing Assistant**:
  - **Avro-style Phonetic Transliteration**: Type English letters (e.g., `ami banglay likhi`, `ajker bhabna`, `shubho sokal`) with live transliteration, smart candidate suggestions, and instant insertion.
  - **Virtual Bengali Keyboard**: Full layout for vowels (স্বরবর্ণ), vowel signs (কারচিহ্ন), consonants (ব্যঞ্জনবর্ণ), conjunct joiners/hasanta (্), and punctuation (দাঁড়ি ।).
  - **Bengali Quick Phrases & Numerals (০-৯)**.
- **Multilingual Voice Typing**: Speech-to-text dictation supporting both Bengali (`bn-BD` / `bn-IN`) and English (`en-US`).

### 🛠️ Rich Formatting Tools (Tiptap v3)
- **Hierarchy**: H1, H2, H3, Paragraph with quick dropdown selector.
- **Inline Styling**: Bold, Italic, Underline, Strikethrough, Inline Code, Subscript, Superscript.
- **Pastel Highlighters & Colors**: 6 pastel highlighters and 10 custom text colors.
- **Alignment & Structure**: Left, Center, Right, Justify alignment.
- **Interactive Task Lists**: Checklists with clickable checkboxes that strike through completed tasks.
- **Tables**: Insert 3x3 tables, add/delete rows & columns.
- **Embeds**: Link insertion and image URL embedding.
- **Markdown Shortcuts**: `# `, `## `, `* `, `- `, `1. `, `> `, ```` `, and `- [ ] ` automatically format on space or enter.

### 💻 Syntax Highlighting for Code
- **Powered by lowlight & highlight.js**: Integrated support for 35+ common languages (JavaScript, TypeScript, Python, HTML/XML, CSS, Bash, SQL, C++, Java, Rust, Go, JSON, Markdown, etc.).
- **Twilight Obsidian Theme**: Custom dark syntax theme with pastel highlight tokens.
- **Interactive Code Nodes**: Copy code snippet button with one-click clipboard feedback and inline language selector.

### 🗂️ Organization, Organization & Insights
- **Tag Management**: Add, filter, and organize notes by tags.
- **Pinned & Favorite Notes**: Pin critical thoughts to the top and mark favorites with a heart.
- **Search & Filter**: Real-time search across titles, contents, and tags (`/` shortcut to focus).
- **Code Vault & Archive**: Dedicated views for code snippets, archives, and trash.
- **Live Stats**: Word count, character count, and estimated reading time.
- **Export Formats**: Export any note as Markdown (`.md`), Plain Text (`.txt`), HTML (`.html`), or Print/PDF.
- **Templates**: Pre-made templates for Daily Reflection, Code Architecture, Bengali Writing, and Action/Study Plans.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ (tested up to Node 26)
- npm or yarn

### Environment Setup
Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### Installation & Run

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) or [http://localhost:9002](http://localhost:9002).

### Production Build

```bash
npm run build
npm run start
```

---

## 🔮 Suggested Future Enhancements

1. **AI Synthesis & Journal Prompts**: Integrate Google Gemini via Genkit to summarize long entries, suggest titles, or generate introspective prompts in English and Bengali.
2. **Encrypted / PIN-Locked Notes**: Client-side AES-GCM encryption for personal or sensitive notes.
3. **Graph / Connection View**: Interactive Obsidian-style node graph linking notes that share tags or cross-references.
4. **Offline PWA Sync**: Service worker caching and IndexedDB background sync for writing notes completely offline with automatic sync on reconnect.
5. **Audio Note Recording**: Record voice memos with inline audio player playback alongside transcribed text.
