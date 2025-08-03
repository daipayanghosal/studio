export type JournalEntry = {
  id: string;
  title: string;
  content: string; // Stored as HTML string
  color: string; // Hex color code
  createdAt: Date;
  updatedAt: Date;
};
