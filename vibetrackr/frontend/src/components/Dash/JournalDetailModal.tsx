import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription} from "@/components/ui/dialog";

interface JournalEntry {
  id: number;
  date: string;
  title: string;
  emoji: string;
  emotion: string;
  journal: string;
}

interface JournalDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  entry: JournalEntry | null; 
}

export const JournalDetailModal: React.FC<JournalDetailModalProps> = ({ isOpen, onClose, entry }) => {
  if (!entry) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] md:max-w-xl lg:max-w-2xl bg-white p-6 rounded-lg shadow-xl border border-gray-200">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900 pr-8"> 
            {entry.title} {entry.emoji}
          </DialogTitle>
          <DialogDescription className="text-gray-600 mt-1">
            {entry.date} - {entry.emotion}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 text-gray-800 leading-relaxed max-h-[70vh] overflow-y-auto">
          <p>{entry.content}</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};