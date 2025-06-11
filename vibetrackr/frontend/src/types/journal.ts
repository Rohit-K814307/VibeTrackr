export interface JournalEntry {
    journalId: string;
    title: string;
    content: string;
    date: string; // YYYY-MM-DD 
    timestamp: number; // Unix epoch from 1970 date 
    emoji: string;
    emotion: string; // User-selected primary emotion
  
    analysis: {
      A: number; // Arousal
      D: number; // Dominance
      V: number; // Valence
      Emotion: string; // vad-bert on hf detects this!!
      Emotive_Angular_Distance: number;
      Valence_Scaled_By_Mag: number;
    };
  }