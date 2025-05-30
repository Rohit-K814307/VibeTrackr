// src/components/JournalTable.tsx

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Plus, Pencil, Trash2, ChevronDown } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

import { JournalDetailModal } from './JournalDetailModal';

// Assuming these are your existing components that are NOT being changed
import { AddJournal } from "./AddJournal";
import { UpdateJournal } from "./UpdateJournal";

import { getAuth } from "firebase/auth";
import { fetchWithRetry } from "@/utils";

interface JournalEntry {
  id: string;
  date: string;
  title: string;
  emoji: string;
  emotion: string;
  content: string; 
}

// Helper to get today's date string
function getTodayDateString(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

async function getIdToken() {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) throw new Error("No user logged in");
  return await user.getIdToken(true);
}

// Define all possible columns and their display names
const allColumns = [
  { id: "date", name: "Date" },
  { id: "title", name: "Title" },
  { id: "emoji", name: "Emoji" },
  { id: "emotion", name: "Emotion" },
  { id: "content", name: "Journal" },
];


export function JournalTable() {
  const [data, setData] = useState<JournalEntry[]>([]);
  const [selectedEntries, setSelectedEntries] = useState<string[]>([]);
  const [addEditJournalDialogOpen, setAddEditJournalDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  // formData now reflects the flat 'content' property
  const [formData, setFormData] = useState<Partial<JournalEntry>>({});

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [viewingEntry, setViewingEntry] = useState<JournalEntry | null>(null);

  const [isAlreadyAddedWarningOpen, setIsAlreadyAddedWarningOpen] = useState(false);

  const [isEditMode, setIsEditMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const entriesPerPage = 5;

  const [visibleColumns, setVisibleColumns] = useState<string[]>(allColumns.map(col => col.id));

  // --- API Interaction Functions ---

  const fetchJournals = useCallback(async () => {
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

      if (!response.ok) throw new Error("API call failed to fetch journals");

      const resData = await response.json();
      const journals: JournalEntry[] = resData.journals || [];
      setData(journals);
    } catch (err: any) {
      console.error("Error fetching user journals:", err.message);
    }
  }, []);

  useEffect(() => {
    fetchJournals();
  }, [fetchJournals, addEditJournalDialogOpen]);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const token = await getIdToken();
  
      for (const id of selectedEntries) {
        const response = await fetchWithRetry(
          `${import.meta.env.VITE_API_BASE_URL}/delete-journal?journal_id=${String(id)}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
  
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `Failed to delete entry with ID ${id}.`);
        }
      }
  
      setDeleteDialogOpen(false);
      setSelectedEntries([]);
      window.location.reload();
    } catch (error: any) {
      console.error("Error deleting journals:", error);
      alert(`Error deleting journals: ${error.message}`);
    } finally {
      setIsDeleting(false);
    }
  };
  
  

  // --- Dialog & Modal Handlers ---

  const todayDateString = getTodayDateString();
  const todayJournal = data.find((journal) => journal.date === todayDateString);

  const handleAddButtonClick = () => {
    if (todayJournal) {
      setIsAlreadyAddedWarningOpen(true);
    } else {
      setIsEditMode(false);
      // Initialize content to an empty string for a new entry
      setFormData({ date: todayDateString, content: "" });
      setAddEditJournalDialogOpen(true);
    }
  };

  const handleEditButtonClick = () => {
    if (selectedEntries.length === 1) {
      const entryToEdit = data.find((d) => d.id === selectedEntries[0]);
      if (entryToEdit) {
        setIsEditMode(true);
        // --- IMPORTANT: Set formData with the flat 'content' property ---
        setFormData(entryToEdit);
        setAddEditJournalDialogOpen(true);
      }
    }
  };

  const handleCheckboxChange = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedEntries((prev) => [...prev, id]);
    } else {
      setSelectedEntries((prev) => prev.filter((entryId) => entryId !== id));
    }
  };

  const handleRowClick = (entry: JournalEntry) => {
    setViewingEntry(entry);
    setIsDetailModalOpen(true);
  };

  const handleDetailModalClose = () => {
    setIsDetailModalOpen(false);
    setViewingEntry(null);
  };

  const handleColumnToggle = (columnId: string, checked: boolean) => {
    if (checked) {
      setVisibleColumns((prev) => [...prev, columnId]);
    } else {
      setVisibleColumns((prev) => prev.filter((id) => id !== columnId));
    }
  };

  const filteredEntries = data.filter((entry) =>
    entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    // --- UPDATED: Accessing journal content directly ---
    (entry.content || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.emotion.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.date.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentEntries = filteredEntries.slice(indexOfFirstEntry, indexOfLastEntry);
  const totalPages = Math.ceil(filteredEntries.length / entriesPerPage);

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  };

  return (
    <TooltipProvider>
      <div className="p-6 bg-white rounded-lg shadow-md border border-gray-200">
        <h1 className="pb-3 text-center font-bold text-2xl">All Journal Entries</h1>
        {/* Top bar: Search, Add, Edit, Delete, Columns */}
        <div className="flex items-center justify-between mb-4 space-x-2">
          <div className="relative flex-grow mr-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search Journals..."
              className="pl-9 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-700"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                className="rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 bg-white"
                size="icon"
                onClick={handleAddButtonClick}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="bg-gray-700 text-white text-sm px-2 py-1 rounded">
              <p>Add New Entry</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                className="rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 bg-white"
                size="icon"
                onClick={handleEditButtonClick}
                disabled={selectedEntries.length !== 1}
              >
                <Pencil className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="bg-gray-700 text-white text-sm px-2 py-1 rounded">
              <p>Edit Selected Entry</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                className="rounded-md border border-gray-300 text-gray-700 hover:bg-red-50 bg-white"
                size="icon"
                onClick={() => setDeleteDialogOpen(true)}
                disabled={selectedEntries.length === 0}
                variant="destructive"
              >
                <Trash2 className="h-4 w-4 text-red-600" />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="bg-gray-700 text-white text-sm px-2 py-1 rounded">
              <p>Delete Selected Entries</p>
            </TooltipContent>
          </Tooltip>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-2 px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center">
                Columns <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48 bg-white shadow-lg rounded-md border border-gray-200">
              {allColumns.map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  checked={visibleColumns.includes(column.id)}
                  onCheckedChange={(checked) => handleColumnToggle(column.id, checked)}
                  className="px-8 py-2 cursor-pointer hover:bg-gray-100 text-gray-800"
                >
                  {column.name}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Journal Table */}
        <Table className="min-w-full divide-y divide-gray-200 border-t border-b border-gray-200">
          <TableHeader className="bg-gray-50">
            <TableRow className="border-b border-gray-200">
              <TableHead className="w-[40px] px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tl-lg">
                <Checkbox
                  checked={selectedEntries.length === currentEntries.length && currentEntries.length > 0}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedEntries(currentEntries.map(entry => entry.id));
                    } else {
                      setSelectedEntries([]);
                    }
                  }}
                  aria-label="Select all entries on current page"
                  className="border-gray-400 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                />
              </TableHead>
              {allColumns.map(column =>
                visibleColumns.includes(column.id) && (
                  <TableHead
                    key={column.id}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {column.name}
                  </TableHead>
                )
              )}
            </TableRow>
          </TableHeader>
          <TableBody className="bg-white divide-y divide-gray-200">
            {currentEntries.length > 0 ? (
              currentEntries.map((entry) => (
                <TableRow
                  key={entry.id}
                  onClick={() => handleRowClick(entry)}
                  className={selectedEntries.includes(entry.id) ? "bg-blue-50" : "hover:bg-gray-50 cursor-pointer"}
                >
                  <TableCell className="px-3 py-4 whitespace-nowrap">
                    <Checkbox
                      checked={selectedEntries.includes(entry.id)}
                      onCheckedChange={(checked) => handleCheckboxChange(entry.id, checked as boolean)}
                      aria-label={`Select entry ${entry.title}`}
                      className="border-gray-400 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </TableCell>
                  {visibleColumns.includes("date") && <TableCell className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{entry.date}</TableCell>}
                  {visibleColumns.includes("title") && <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{entry.title}</TableCell>}
                  {visibleColumns.includes("emoji") && <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{entry.emoji}</TableCell>}
                  {visibleColumns.includes("emotion") && <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{entry.emotion}</TableCell>}
                  {/* --- UPDATED: Accessing content directly --- */}
                  {visibleColumns.includes("content") && (
                    <TableCell className="px-6 py-4 text-sm text-gray-900">
                      <span className="truncate block max-w-[200px]">
                        {entry.content}
                      </span>
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={visibleColumns.length + 1} className="text-center text-gray-500 py-8">
                  No journal entries found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Pagination and Selected Count */}
        <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
          <p>{selectedEntries.length} of {filteredEntries.length} row(s) selected.</p>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 bg-white"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              onClick={handleNextPage}
              disabled={currentPage === totalPages || filteredEntries.length === 0}
              className="px-3 py-1 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 bg-white"
            >
              Next
            </Button>
          </div>
        </div>

        {/* Conditional Rendering of AddJournal or UpdateJournal Component */}
        {isEditMode ? (
          // Update Journal Mode
          <UpdateJournal
            open={addEditJournalDialogOpen}
            onClose={() => {
                setAddEditJournalDialogOpen(false); // Close the modal
                fetchJournals(); // Trigger re-fetch here
            }}
            journalId={(formData as JournalEntry).id} // Pass journalId
            journalData={formData as JournalEntry} // Pass full data including 'content'
          />
        ) : (
          // Add Journal Mode
          <AddJournal
            open={addEditJournalDialogOpen}
            onClose={() => {
                setAddEditJournalDialogOpen(false); // Close the modal
                fetchJournals(); // Trigger re-fetch here
            }}
          />
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent className="bg-white p-6 rounded-lg shadow-xl border border-gray-200">
            <div className="space-y-4">
              <p className="text-gray-800">Are you sure you want to delete {selectedEntries.length} selected entr{selectedEntries.length > 1 ? "ies" : "y"}?</p>
              <div className="flex justify-end gap-2">
                <Button variant="outline" className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 bg-white" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                <DialogFooter>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? "Deleting..." : "Confirm Delete"}
                </Button>
              </DialogFooter>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Journal Detail Modal */}
        <JournalDetailModal
          isOpen={isDetailModalOpen}
          onClose={handleDetailModalClose}
          entry={viewingEntry}
        />

        {/* Journal Already Added Warning Modal */}
        <Dialog open={isAlreadyAddedWarningOpen} onOpenChange={setIsAlreadyAddedWarningOpen}>
          <DialogContent className="sm:max-w-md bg-white p-6 rounded-lg shadow-xl border border-gray-200">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-gray-900">Journal Already Added Today!</DialogTitle>
              <DialogDescription className="text-gray-600 mt-2">
                You have already created a journal entry for today. Please edit the existing entry if you wish to make changes.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex justify-end gap-2 mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAlreadyAddedWarningOpen(false)}
                className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 bg-white"
              >
                Close
              </Button>
              {/* Optional: Add a button here to directly open the edit modal for today's entry */}
              {todayJournal && (
                <Button
                  type="button"
                  onClick={() => {
                    setIsAlreadyAddedWarningOpen(false); // Close warning
                    setIsEditMode(true); // Set mode to edit
                    setFormData(todayJournal); // Pre-fill with today's journal data
                    setAddEditJournalDialogOpen(true); // Open edit modal
                  }}
                  className="px-4 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600"
                >
                  Edit Today's Journal
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}