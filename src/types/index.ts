
import { Timestamp } from "firebase/firestore";

export type JournalEntry = {
  id: string;
  title: string;
  content: string; // Stored as HTML string
  color: string; // Hex color code
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
};

export type JournalEntryData = Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'> & {
  createdAt: Timestamp;
  updatedAt: Timestamp;
};
