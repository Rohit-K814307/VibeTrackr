export interface JournalEntry {
    journalId: string;
    journalTitle: string;
    content: string;
    date: string; // YYYY-MM-DD format
    timestamp: number; // Unix timestamp
    emoji: string;
    emotion: string; // User-selected primary emotion
  
    analysis: {
      A: number; // Arousal
      D: number; // Dominance
      V: number; // Valence
      Emotion: string; // ML/AI detected emotion
      Emotive_Angular_Distance: number;
      Valence_Scaled_By_Mag: number;
    };
  }