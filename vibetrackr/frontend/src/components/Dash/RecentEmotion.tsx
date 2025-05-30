import React, { useState, useEffect, useCallback } from "react";
import { getAuth } from "firebase/auth";
import { fetchWithRetry } from "@/utils"; // Assuming utils is correctly aliased
import { format, parseISO } from "date-fns";
import { Smile, Frown, Meh, Loader2, Info } from "lucide-react"; // Icons for emotion/loading/info

// Re-using the JournalEntry interface for consistency
interface JournalEntry {
  id: string;
  date: string; // e.g., "YYYY-MM-DD"
  emoji: string; // e.g., "😊"
  title: string;
  emotion: string; // e.g., "Happy", "Sad", "Neutral"
  content: string;
}

// Helper to get Firebase ID Token (re-used from other components)
async function getIdToken() {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) throw new Error("No user logged in");
  return await user.getIdToken(true);
}

export function RecentEmotion() {
  const [latestJournal, setLatestJournal] = useState<JournalEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLatestJournal = useCallback(async () => {
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
      const journals: JournalEntry[] = resData.journals || [];

      if (journals.length > 0) {
        // Find the latest journal entry by date
        const sortedJournals = journals.sort((a, b) =>
          parseISO(b.date).getTime() - parseISO(a.date).getTime() // Sort in descending order (latest first)
        );
        setLatestJournal(sortedJournals[0]);
      } else {
        setLatestJournal(null); // No journals found
      }
    } catch (err: any) {
      console.error("Error fetching latest journal for RecentEmotion:", err.message);
      setError(err.message || "Failed to load recent emotion.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLatestJournal();
  }, [fetchLatestJournal]);

  // Helper to determine icon based on emotion (optional, but nice visual touch)
  const getEmotionIcon = (emotion: string) => {
    const lowerEmotion = emotion.toLowerCase();
    if (lowerEmotion.includes("happy") || lowerEmotion.includes("joy")) {
      return <Smile className="h-6 w-6 text-green-500" />;
    }
    if (lowerEmotion.includes("sad") || lowerEmotion.includes("unhappy")) {
      return <Frown className="h-6 w-6 text-red-500" />;
    }
    // Add more emotion mappings as needed
    return <Meh className="h-6 w-6 text-gray-500" />; // Default for neutral or unknown
  };

  return (
    <div className="p-6 bg-white rounded-2xl shadow-md border border-gray-200 max-w-sm mx-auto flex flex-col items-center justify-center text-center">
      <h3 className="text-xl font-bold mb-4 text-gray-800">Your Recent Mood</h3>

      {loading && (
        <div className="flex items-center text-gray-600">
          <Loader2 className="h-6 w-6 mr-2 animate-spin" />
          <span>Loading...</span>
        </div>
      )}

      {error && (
        <div className="text-red-500 flex items-center">
          <Frown className="h-5 w-5 mr-1" />
          <span>Error: {error}</span>
        </div>
      )}

      {!loading && !error && (
        latestJournal ? (
          <>
            <div className="text-6xl mb-4 p-4 rounded-full bg-blue-50 border border-blue-200">
              {latestJournal.emoji || "❓"} {/* Display emoji or fallback */}
            </div>
            <p className="text-2xl font-semibold text-gray-900 mb-2">
              {latestJournal.emotion || "N/A"} {/* Display emotion or fallback */}
            </p>
            <div className="flex items-center text-gray-600 text-sm">
              {getEmotionIcon(latestJournal.emotion || "")}
              <span className="ml-2">Journaled on {format(parseISO(latestJournal.date), "PPP")}</span>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center text-gray-600 p-4">
            <Info className="h-10 w-10 mb-4 text-blue-400" />
            <p className="text-lg font-medium">No journal entries yet.</p>
            <p className="text-sm">Start journaling to see your recent mood here!</p>
          </div>
        )
      )}
    </div>
  );
}