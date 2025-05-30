import { AddJournal } from "./AddJournal";
import { UpdateJournal } from "./UpdateJournal";
import { getAuth } from "firebase/auth";
import { useEffect, useState } from "react";
import { fetchWithRetry } from "@/utils";
import { Button } from "@/components/ui/button";

function getTodayDateString(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function JournalCard() {
  const todayDateString = getTodayDateString();
  const [journals, setJournals] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState<boolean>(false);

  async function getIdToken() {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) throw new Error("No user logged in");
    return await user.getIdToken(true);
  }

  async function getUser() {
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

      if (!response.ok) throw new Error("API call failed");

      const data = await response.json();
      setJournals(data.journals || []);

    } catch (err: any) {
      setError(err.message);
    }
  }

  useEffect(() => {
    getUser();
  }, []);

  function getTodayJournalId(journals: any[]) {
    if (!Array.isArray(journals) || journals.length === 0) return null;
    const todayJournal = journals.find((journal) => journal.date === todayDateString);
    return todayJournal ? todayJournal.id : null;
  }

  const todayJournalId = getTodayJournalId(journals);

  return (
    <div className="h-full w-full">
      <div className="rounded-2xl bg-sky-500 text-white p-6 shadow-xl h-full">
        <h2 className="text-2xl font-semibold mb-4">Today’s Journal</h2>
  
        <p className="mb-4">
          {todayJournalId
            ? "You’ve already started your journal for today!"
            : "Ready to write something new today?"}
        </p>
  
        <Button
          className="bg-white text-sky-700 hover:bg-sky-100 font-bold"
          onClick={() => setOpen(true)}
        >
          {todayJournalId ? "Edit Journal Entry" : "New Journal Entry"}
        </Button>
  
        {todayJournalId ? (
          <UpdateJournal open={open} onClose={() => setOpen(false)} journalId={todayJournalId} />
        ) : (
          <AddJournal open={open} onClose={() => setOpen(false)} />
        )}
      </div>
  
      {error && <p className="text-red-600 text-sm mt-4">{error}</p>}
    </div>
  );  
}
