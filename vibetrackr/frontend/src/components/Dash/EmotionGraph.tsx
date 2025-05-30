import { useState, useEffect, useCallback } from "react";
import { getAuth } from "firebase/auth";
import { fetchWithRetry } from "@/utils";
import { format, parseISO, startOfWeek, addDays, isSameDay } from "date-fns";
import { enUS } from 'date-fns/locale';
import { Loader2, Info } from "lucide-react";

// Re-using the JournalEntry interface
interface JournalEntry {
  id: string;
  date: string;
  emoji: string;
  title: string;
  emotion: string;
  content: string;
  analysis?: {
    V: number;
    emotion: string;
  };
}

async function getIdToken() {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) throw new Error("No user logged in");
  return await user.getIdToken(true);
}

const getValenceColorClass = (valence: number | undefined): string => {
  if (valence === undefined || isNaN(valence)) return 'bg-gray-200';

  if (valence >= 0.7) return 'bg-green-300';
  if (valence >= 0.3) return 'bg-lime-200';
  if (valence > -0.3 && valence < 0.3) return 'bg-yellow-200';
  if (valence <= -0.7) return 'bg-red-300';
  if (valence < -0.3) return 'bg-orange-200';

  return 'bg-gray-200';
};

const getValenceUnderlineColorClass = (valence: number | undefined): string => {
  if (valence === undefined || isNaN(valence)) return 'border-gray-400';

  if (valence >= 0.7) return 'border-green-500';
  if (valence >= 0.3) return 'border-lime-400';
  if (valence > -0.3 && valence < 0.3) return 'border-yellow-400';
  if (valence <= -0.7) return 'border-red-500';
  if (valence < -0.3) return 'border-orange-400';

  return 'border-gray-400';
};

export function EmotionGraph() {
  const [weeklyData, setWeeklyData] = useState<
    Array<{
      date: Date;
      dayOfWeek: string;
      emoji: string | null;
      valence: number | undefined;
      emotionName: string | null;
    }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWeeklyJournalData = useCallback(async () => {
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

      const startOfCurrentWeek = startOfWeek(new Date(), { locale: enUS });
      const weekDates: Date[] = [];
      for (let i = 0; i < 7; i++) {
        weekDates.push(addDays(startOfCurrentWeek, i));
      }

      const processedWeeklyData = weekDates.map((date) => {
        const journalForDay = journals.find((journal) =>
          isSameDay(parseISO(journal.date), date)
        );

        return {
          date: date,
          dayOfWeek: format(date, "EEE", { locale: enUS }),
          emoji: journalForDay?.emoji || null,
          valence: journalForDay?.analysis?.V,
          emotionName: journalForDay?.analysis?.emotion || journalForDay?.emotion || null,
        };
      });

      setWeeklyData(processedWeeklyData);
    } catch (err: any) {
      console.error("Error fetching weekly journal data:", err.message);
      setError(err.message || "Failed to load weekly emotion chart.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWeeklyJournalData();
  }, [fetchWeeklyJournalData]);

  return (
    <div className="p-6 bg-white rounded-xl shadow-md border border-gray-200 max-w-2xl mx-auto">
      <h3 className="text-xl font-bold mb-4 text-gray-800">This Week's Vibe Report</h3>

      {loading && (
        <div className="flex items-center justify-center h-48 text-gray-600">
          <Loader2 className="h-8 w-8 mr-2 animate-spin" />
          <span>Loading weekly insights...</span>
        </div>
      )}

      {error && (
        <div className="text-red-500 flex items-center justify-center h-48">
          <Info className="h-6 w-6 mr-2" />
          <span>Error: {error}</span>
        </div>
      )}

      {!loading && !error && (
        weeklyData.length > 0 ? (
          <div className="overflow-x-auto pb-2 -mx-2">
            <div className="flex justify-between items-end min-w-full md:min-w-0 md:justify-around">
              {weeklyData.map((day, _) => (
                <div
                  key={day.date.toISOString()}
                  className="flex flex-col items-center flex-shrink-0 px-2"
                  title={
                    day.emoji
                      ? `Date: ${format(day.date, "PPP", { locale: enUS })}\nEmotion: ${day.emotionName || 'N/A'}\nValence: ${day.valence !== undefined && !isNaN(day.valence) ? day.valence.toFixed(1) : 'N/A'}`
                      : `Date: ${format(day.date, "PPP", { locale: enUS })}\nNo journal entry.`
                  }
                >
                  <span className="text-sm font-medium text-gray-500 mb-2">
                    {day.dayOfWeek}
                  </span>

                  <div
                    className={`relative w-12 h-12 flex items-center justify-center text-3xl rounded-full mb-2
                                ${day.emoji ? getValenceColorClass(day.valence) : 'bg-gray-100 text-gray-400'}
                                `}
                  >
                    {day.emoji || "—"}
                    {day.emoji && (
                        <div className={`absolute inset-0 rounded-full border-2 ${getValenceUnderlineColorClass(day.valence)} opacity-70`}></div>
                    )}
                  </div>

                  {/* Added "Vibe Score:" label */}
                  <div className={`w-full text-center text-xs text-gray-600`}>Vibe Score:</div>
                  <div className={`w-full text-center text-sm font-semibold pt-1 border-t-2 ${getValenceUnderlineColorClass(day.valence)}`}>
                    {day.valence !== undefined && !isNaN(day.valence) ? day.valence.toFixed(1) : "N/A"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center text-gray-600 p-8">
            <Info className="h-12 w-12 mb-4 text-blue-400" />
            <p className="text-xl font-medium">No journal entries for this week.</p>
            <p className="text-base text-center mt-2">Start journaling to see your weekly emotion chart!</p>
          </div>
        )
      )}
    </div>
  );
}