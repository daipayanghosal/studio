
import { Timestamp } from "firebase/firestore";

export type JournalEntry = {
  id: string;
  title: string;
  content: string; // Stored as HTML string
  color: string; // Hex color code
};

export type JournalEntryData = Omit<JournalEntry, 'id'>;
