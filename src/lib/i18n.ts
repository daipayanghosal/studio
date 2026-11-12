import { AppLocale } from "@/types";

export interface Translations {
  appName: string;
  appTagline: string;
  newNote: string;
  searchPlaceholder: string;
  allNotes: string;
  pinnedNotes: string;
  favorites: string;
  codeSnippets: string;
  archive: string;
  trash: string;
  tags: string;
  allTags: string;
  manageTags: string;
  emptyTitle: string;
  emptyDesc: string;
  emptySearch: string;
  createFirstNote: string;
  editNote: string;
  save: string;
  saving: string;
  saved: string;
  cancel: string;
  delete: string;
  restore: string;
  deletePermanently: string;
  close: string;
  titlePlaceholder: string;
  writePlaceholder: string;
  noteColor: string;
  noteTheme: string;
  language: string;
  fontStyle: string;
  wordCount: string;
  charCount: string;
  readTime: string;
  minuteRead: string;
  bengaliHelper: string;
  bengaliKeyboard: string;
  insertChar: string;
  tools: string;
  syntaxHighlight: string;
  codeLanguage: string;
  copyCode: string;
  codeCopied: string;
  exportNote: string;
  exportMarkdown: string;
  exportTxt: string;
  exportHtml: string;
  exportPdf: string;
  speechToText: string;
  listening: string;
  stopListening: string;
  speechNotSupported: string;
  signOut: string;
  deleteConfirmTitle: string;
  deleteConfirmDesc: string;
  permanentDeleteDesc: string;
  sortBy: string;
  sortUpdated: string;
  sortCreated: string;
  sortTitle: string;
  gridView: string;
  listView: string;
  stats: string;
  dreamAura: string;
  auraAurora: string;
  auraNebula: string;
  auraSunset: string;
  auraMint: string;
  table: string;
  insertTable: string;
  checklist: string;
  quote: string;
  highlight: string;
}

export const translations: Record<AppLocale, Translations> = {
  en: {
    appName: "ChronoCanvas",
    appTagline: "Ethereal sanctuary for your thoughts and code",
    newNote: "New Note",
    searchPlaceholder: "Search thoughts, code, tags...",
    allNotes: "All Notes",
    pinnedNotes: "Pinned",
    favorites: "Favorites",
    codeSnippets: "Code Vault",
    archive: "Archive",
    trash: "Trash",
    tags: "Tags",
    allTags: "All Tags",
    manageTags: "Manage Tags",
    emptyTitle: "Your canvas is quiet",
    emptyDesc: "Capture a fleeting reflection, a stroke of inspiration, or clean code.",
    emptySearch: "No notes match your cosmic search.",
    createFirstNote: "Create First Note",
    editNote: "Edit Note",
    save: "Save Note",
    saving: "Preserving...",
    saved: "Saved gracefully",
    cancel: "Cancel",
    delete: "Move to Trash",
    restore: "Restore Note",
    deletePermanently: "Delete Forever",
    close: "Close",
    titlePlaceholder: "Title your inspiration...",
    writePlaceholder: "Write your thoughts in English or বাংলা...",
    noteColor: "Aura Accent",
    noteTheme: "Atmosphere",
    language: "Note Language",
    fontStyle: "Typography Style",
    wordCount: "Words",
    charCount: "Characters",
    readTime: "Read Time",
    minuteRead: "min read",
    bengaliHelper: "বাংলা কীবোর্ড সহায়ক (Bengali Helper)",
    bengaliKeyboard: "বাংলা টাইপিং ও বর্ণমালা",
    insertChar: "Insert character",
    tools: "Formatting Tools",
    syntaxHighlight: "Syntax Highlighted Code",
    codeLanguage: "Language",
    copyCode: "Copy Code",
    codeCopied: "Copied to clipboard!",
    exportNote: "Export Note",
    exportMarkdown: "Export as Markdown (.md)",
    exportTxt: "Export as Plain Text (.txt)",
    exportHtml: "Export as HTML (.html)",
    exportPdf: "Print / PDF",
    speechToText: "Voice Dictation",
    listening: "Listening... speak now",
    stopListening: "Stop dictation",
    speechNotSupported: "Speech recognition not supported in this browser",
    signOut: "Sign Out",
    deleteConfirmTitle: "Move note to trash?",
    deleteConfirmDesc: "You can restore this note anytime from the Trash.",
    permanentDeleteDesc: "This action cannot be undone. This note will be lost in the cosmos.",
    sortBy: "Sort by",
    sortUpdated: "Recently Updated",
    sortCreated: "Newest First",
    sortTitle: "Title (A-Z)",
    gridView: "Dream Grid",
    listView: "Serene List",
    stats: "Insights",
    dreamAura: "Dream Aura",
    auraAurora: "Celestial Aurora",
    auraNebula: "Cosmic Nebula",
    auraSunset: "Twilight Sunset",
    auraMint: "Breeze Mint",
    table: "Table",
    insertTable: "Insert Table",
    checklist: "Checklist",
    quote: "Quote",
    highlight: "Highlight",
  },
  bn: {
    appName: "ক্রোনোক্যানভাস",
    appTagline: "আপনার ভাবনা ও কোডের মায়াবী অঙ্গন",
    newNote: "নতুন নোট",
    searchPlaceholder: "ভাবনা, কোড বা ট্যাগ খুঁজুন...",
    allNotes: "সকল নোট",
    pinnedNotes: "পিন করা",
    favorites: "প্রিয় নোটসমূহ",
    codeSnippets: "কোড ভল্ট",
    archive: "আর্কাইভ",
    trash: "ট্র্যাশ বিন",
    tags: "ট্যাগসমূহ",
    allTags: "সব ট্যাগ",
    manageTags: "ট্যাগ ব্যবস্থাপনা",
    emptyTitle: "আপনার ক্যানভাস শান্ত ও নিরব",
    emptyDesc: "একটি সুন্দর চিন্তা, নতুন অনুপ্রেরণা বা কোডের স্নিপেট লিখে রাখুন।",
    emptySearch: "কোনো নোট খুঁজে পাওয়া যায়নি।",
    createFirstNote: "প্রথম নোট তৈরি করুন",
    editNote: "নোট সম্পাদনা",
    save: "সংরক্ষণ করুন",
    saving: "সংরক্ষিত হচ্ছে...",
    saved: "সফলভাবে সংরক্ষিত",
    cancel: "বাতিল",
    delete: "ট্র্যাশে পাঠান",
    restore: "পুনরুদ্ধার করুন",
    deletePermanently: "চিরতরে মুছে ফেলুন",
    close: "বন্ধ করুন",
    titlePlaceholder: "নোটের শিরোনাম লিখুন...",
    writePlaceholder: "আপনার ভাবনা বাংলায় অথবা ইংরেজিতে লিখুন...",
    noteColor: "রং ও আভা",
    noteTheme: "পরিবেশ",
    language: "নোটের ভাষা",
    fontStyle: "ফন্ট স্টাইল",
    wordCount: "শব্দসংখ্যা",
    charCount: "বর্ণসংখ্যা",
    readTime: "পড়ার সময়",
    minuteRead: "মিনিট",
    bengaliHelper: "বাংলা বর্ণমালা ও সহায়ক",
    bengaliKeyboard: "বাংলা টাইপিং ও বর্ণমালা",
    insertChar: "বর্ণ যুক্ত করুন",
    tools: "টুলস ও ফরম্যাটিং",
    syntaxHighlight: "সিনট্যাক্স হাইলাইটেড কোড",
    codeLanguage: "প্রোগ্রামিং ভাষা",
    copyCode: "কোড কপি করুন",
    codeCopied: "ক্লিপবোর্ডে কপি করা হয়েছে!",
    exportNote: "নোট এক্সপোর্ট",
    exportMarkdown: "মার্কডাউন (.md) ফাইল",
    exportTxt: "সাধারণ টেক্সট (.txt) ফাইল",
    exportHtml: "এইচটিএমএল (.html) ফাইল",
    exportPdf: "প্রিন্ট বা পিডিএফ",
    speechToText: "ভয়েস দিয়ে টাইপ করুন",
    listening: "শুনছি... কথা বলুন",
    stopListening: "ভয়েস টাইপিং বন্ধ করুন",
    speechNotSupported: "এই ব্রাউজারে স্পিচ রেকগনিশন সমর্থিত নয়",
    signOut: "লগআউট",
    deleteConfirmTitle: "নোটটি ট্র্যাশে পাঠাবেন?",
    deleteConfirmDesc: "প্রয়োজনে ট্র্যাশ থেকে যেকোনো সময় এটি পুনরুদ্ধার করতে পারবেন।",
    permanentDeleteDesc: "এই নোটটি চিরতরে মুছে যাবে এবং আর কখনো ফেরত আনা যাবে না।",
    sortBy: "সাজান",
    sortUpdated: "সর্বশেষ সম্পাদিত",
    sortCreated: "নতুনগুলো আগে",
    sortTitle: "শিরোনাম অনুযায়ী",
    gridView: "গ্রিড ভিউ",
    listView: "লিস্ট ভিউ",
    stats: "পরিসংখ্যান",
    dreamAura: "মায়াবী আভা",
    auraAurora: "উত্তরী আলো (Aurora)",
    auraNebula: "নীহারিকা (Nebula)",
    auraSunset: "গোধূলি বেলা (Sunset)",
    auraMint: "শীতল সমীরণ (Mint)",
    table: "টেবিল",
    insertTable: "টেবিল যোগ করুন",
    checklist: "চেকলিস্ট",
    quote: "উক্তি / কোট",
    highlight: "হাইলাইট",
  },
};
