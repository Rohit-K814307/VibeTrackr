import React, { useState, useEffect, useCallback } from "react";
import { Calendar } from "@/components/ui/calendar";
import { getAuth } from "firebase/auth";
import { fetchWithRetry } from "@/utils";
import {
  format,
  isSameDay,
  addDays,
  parseISO,
  startOfDay,
  subMonths,
  addMonths,
  isSameMonth,
  isToday,
  isBefore
} from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Flame } from "lucide-react";
import { enUS } from 'date-fns/locale';

import { UpdateJournal } from "./UpdateJournal";
import { AddJournal } from "./AddJournal";


interface JournalEntry {
  id: string;
  date: string;
  emoji: string;
  title: string;
  emotion: string;
  content: string;
}

async function getIdToken() {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) throw new Error("No user logged in");
  return await user.getIdToken(true);
}

interface NoJournalModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: Date | null;
}

const NoJournalModal: React.FC<NoJournalModalProps> = ({ isOpen, onClose, date }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white p-6 rounded-lg shadow-xl border border-gray-200 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900">No Journal Entry</DialogTitle>
          <DialogDescription className="text-gray-600 mt-2">
            {date ? `You didn't journal for ${format(date, "PPP", { locale: enUS })}.` : "You didn't journal for this day."}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

interface JournalCalendarProps {
  className?: string;
}

export function JournalCalendar({ className }: JournalCalendarProps) {
  const [journalData, setJournalData] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [highlightedDates, setHighlightedDates] = useState<Date[]>([]);
  const [journaledDates, setJournaledDates] = useState<Date[]>([]);

  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [journalEntryToUpdate, setJournalEntryToUpdate] = useState<JournalEntry | null>(null);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [dateToAddJournal, setDateToAddJournal] = useState<Date | null>(null);


  const [isNoJournalModalOpen, setIsNoJournalModalOpen] = useState(false);
  const [selectedDayForNoJournal, setSelectedDayForNoJournal] = useState<Date | null>(null);

  const [month, setMonth] = useState<Date>(new Date());


  const dateInfoMap = new Map<string, JournalEntry>();
  journalData.forEach(entry => {
    const entryDate = parseISO(entry.date);
    dateInfoMap.set(format(entryDate, "yyyy-MM-dd"), entry);
  });

  const fetchJournalData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await getIdToken();
      const response = await fetchWithRetry(
        import.meta.env.VITE_API_BASE_URL + "/get-user",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch journal data.");
      }

      const resData = await response.json();
      setJournalData(resData.journals || []);
    } catch (err: any) {
      console.error("Error fetching journal data for calendar:", err.message);
      setError(err.message || "Failed to load journal data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJournalData();
  }, [fetchJournalData]);


  const calculateStreaksAndJournaledDates = useCallback(() => {
    const journaledDatesSet = new Set<string>();
    journalData.forEach(entry => journaledDatesSet.add(format(parseISO(entry.date), "yyyy-MM-dd")));

    const parsedSortedDates = Array.from(journaledDatesSet)
      .map(dateStr => startOfDay(parseISO(dateStr)))
      .sort((a, b) => a.getTime() - b.getTime());

    setJournaledDates(parsedSortedDates);

    let longestStreakArr: Date[] = [];
    let currentStreakArr: Date[] = [];

    if (parsedSortedDates.length > 0) {
      currentStreakArr.push(parsedSortedDates[0]);
      longestStreakArr.push(parsedSortedDates[0]);

      for (let i = 1; i < parsedSortedDates.length; i++) {
        const prevDay = currentStreakArr[currentStreakArr.length - 1];
        const currentDay = parsedSortedDates[i];

        if (isSameDay(currentDay, addDays(prevDay, 1))) {
          currentStreakArr.push(currentDay);
        } else if (!isSameDay(currentDay, prevDay)) {
          currentStreakArr = [currentDay];
        }

        if (currentStreakArr.length > longestStreakArr.length) {
          longestStreakArr = [...currentStreakArr];
        }
      }
    }
    return longestStreakArr;
  }, [journalData]);

  useEffect(() => {
      setHighlightedDates(calculateStreaksAndJournaledDates());
  }, [journalData, calculateStreaksAndJournaledDates]);



  const handleDayClick = (day: Date) => {
    const today = startOfDay(new Date());
    const clickedDayNormalized = startOfDay(day);

    const dateString = format(day, "yyyy-MM-dd");
    const entry = dateInfoMap.get(dateString);

    if (entry) {
      setJournalEntryToUpdate(entry);
      setIsUpdateModalOpen(true);
    } else if (isSameDay(clickedDayNormalized, today)) {
      setDateToAddJournal(day);
      setIsAddModalOpen(true);
    } else if (isBefore(clickedDayNormalized, today)) {
      setSelectedDayForNoJournal(day);
      setIsNoJournalModalOpen(true);
    }
  };


  const renderDay = (day: Date) => {
    const isJournaled = journaledDates.some(journaledDate => isSameDay(day, journaledDate));
    const isHighlighted = highlightedDates.some(highlightedDate => isSameDay(day, highlightedDate));

    const isCurrentMonth = isSameMonth(day, month);
    const today = new Date();
    const isTodayDate = isSameDay(day, today);

    const isPastDate = isBefore(startOfDay(day), startOfDay(today));
    const isFutureDate = !isBefore(startOfDay(day), startOfDay(today)) && !isSameDay(day, today);

    // Tailwind classes for the day cell. `h-10 w-10` for fixed size, or `aspect-square` for responsive square
    // Using flex to center content.
    return (
      <div
        className={`relative h-10 w-10 flex items-center justify-center text-sm font-medium p-1 cursor-pointer select-none
                    ${isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}
                    ${isHighlighted ? 'bg-blue-200 rounded-full' : ''}
                    ${isJournaled && !isHighlighted ? 'underline' : ''}
                    ${isTodayDate ? 'border-2 border-blue-500 rounded-full' : ''}
                    ${isPastDate && !isJournaled && !isTodayDate ? 'opacity-50' : ''}
                    ${isFutureDate && !isTodayDate ? 'opacity-50 cursor-default' : ''}
                    `}
        onClick={() => handleDayClick(day)}
      >
        <span className="text-base">
          {format(day, "d")}
        </span>
      </div>
    );
  };

  if (loading) {
    return <div className={`p-6 text-center text-gray-600 h-full flex items-center justify-center ${className || ''}`}>Loading journal calendar...</div>;
  }

  if (error) {
    return <div className={`p-6 text-center text-red-500 h-full flex items-center justify-center ${className || ''}`}>Error: {error}</div>;
  }

  const currentLongestStreakLength = highlightedDates.length;

  return (
    <div className={`p-15 bg-white rounded-2xl shadow-md border border-gray-200 mx-auto ${className || ''} h-full flex flex-col`}>
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMonth(prev => subMonths(prev, 1))}
          className="text-gray-700 hover:bg-gray-100"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-xl font-semibold text-gray-800">
            {format(month, "MMMM yyyy", { locale: enUS })}
        </h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMonth(prev => addMonths(prev, 1))}
          className="text-gray-700 hover:bg-gray-100"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg mb-6 flex items-center justify-center text-center">
        <Flame className="h-6 w-6 mr-2 text-blue-600" />
        {currentLongestStreakLength > 0 ? (
          <p className="text-lg font-bold">
            {currentLongestStreakLength} day streak!
          </p>
        ) : journalData.length > 0 ? (
          <p className="text-md font-medium">No consecutive streak yet. Keep going!</p>
        ) : (
          <p className="text-md font-medium">Start journaling to see your streaks!</p>
        )}
      </div>

      {/* This div grows to fill vertical space */}
      <div className="flex-grow flex flex-col min-h-0">
        <Calendar
          mode="single"
          month={month}
          onMonthChange={setMonth}
          className="rounded-md border-0 p-0 shadow-none w-full h-full flex flex-col" // Removed border, padding, shadow from here if react-day-picker handles it
          classNames={{
            // Main container for the month view
            months: "flex flex-col flex-grow", // Ensures months container can grow
            month: "flex flex-col flex-grow space-y-2", // space-y-2 for spacing between header and weeks

            // Header row for day names (Sun, Mon, etc.)
            head_row: "grid grid-cols-7 gap-x-1", // Use grid, ensure consistent gap with day cells if any
            head_cell: "h-10 w-10 flex items-center justify-center text-sm font-medium text-gray-600", // Style for header cells

            // Week rows and day cells
            table: "w-full border-collapse flex flex-col flex-grow", // Table as flex column
            tbody: "flex flex-col flex-grow w-full space-y-1", // tbody as flex column, space-y for gap between weeks
            row: "grid grid-cols-7 gap-x-1 w-full", // Each week row is a grid, gap for spacing between days

            // Individual day cell (wrapper around what renderDay provides, or use day if not using components.Day)
            // cell: "h-10 w-10", // Ensure cell container matches renderDay's size
            day: "h-10 w-10", // Styling for the day component itself if not overridden by components.Day

            // Modifiers (already handled by modifiersStyles and your renderDay logic)
            // day_selected: "",
            // day_today: "",
            // day_outside: "",
            // day_disabled: "",
            // day_range_middle: "",
            // day_hidden: "",
          }}
          components={{
            Caption: () => null, // Hiding default caption, month/year is handled above
            // Let react-day-picker render its own HeadRow and Week structure, styled by classNames
            // HeadRow: undefined, // Or remove the line
            // Week: undefined, // Or remove the line
            Day: ({ date }) => renderDay(date), // Your custom day rendering
          }}
          modifiers={{
            highlighted: highlightedDates,
            journaled: journaledDates,
            today: isToday,
          }}
          modifiersStyles={{
            highlighted: { /* Style for highlighted dates */ },
            journaled: { /* Style for journaled dates */ },
            today: { /* Style for today */ }
            // Note: Your renderDay function already applies these styles visually.
            // modifiersStyles might be redundant if renderDay handles all visual distinction.
            // If renderDay applies all styles, these can be empty or you can remove this prop.
          }}
          weekStartsOn={0} // 0 for Sunday, 1 for Monday (locale enUS default is Sunday)
          showOutsideDays={true} // Optional: to show/hide days from prev/next month
        />
      </div>

      {/* Modals */}
      {journalEntryToUpdate && (
        <UpdateJournal
          open={isUpdateModalOpen}
          onClose={() => {
            setIsUpdateModalOpen(false);
            setJournalEntryToUpdate(null);
            fetchJournalData();
          }}
          journalId={journalEntryToUpdate.id}
        />
      )}

      {isAddModalOpen && dateToAddJournal && (
        <AddJournal
          open={isAddModalOpen}
          onClose={() => {
            setIsAddModalOpen(false);
            setDateToAddJournal(null);
            fetchJournalData();
          }}
        />
      )}

      <NoJournalModal
        isOpen={isNoJournalModalOpen}
        onClose={() => {
          setIsNoJournalModalOpen(false);
          setSelectedDayForNoJournal(null);
        }}
        date={selectedDayForNoJournal}
      />
    </div>
  );
}