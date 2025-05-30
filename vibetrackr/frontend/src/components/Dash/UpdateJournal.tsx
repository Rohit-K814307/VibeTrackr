import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { getAuth } from "firebase/auth"
import { fetchWithRetry } from "@/utils"

interface UpdateJournalProps {
  open: boolean
  onClose: () => void
  journalId: string
}

const MAX_WORDS = 500
const emojiOptions = ['😊', '😔', '😠', '🥰', '😢', '😎', '🤔', '😴', '🥳', '😨']

export const UpdateJournal: React.FC<UpdateJournalProps> = ({ open, onClose, journalId }) => {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [emotion, setEmotion] = useState('')
  const [selectedEmoji, setSelectedEmoji] = useState('😀')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const wordCount = content.trim() === '' ? 0 : content.trim().split(/\s+/).length

  const resetForm = () => {
    setTitle('')
    setContent('')
    setEmotion('')
    setSelectedEmoji('😀')
    setError(null)
  }

  async function getIdToken() {
    const auth = getAuth()
    const user = auth.currentUser
    if (!user) throw new Error("No user logged in")
    return await user.getIdToken(true)
  }

  async function fetchJournalData(id: string) {
    try {
      const token = await getIdToken()
      const response = await fetchWithRetry(`${import.meta.env.VITE_API_BASE_URL}/get-user`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      })

      if (!response.ok) throw new Error("API call failed")

      const data = await response.json()
      const journal = data.journals.find((journal) => journal.id === id)
      if (!journal) throw new Error("Journal not found")

      setTitle(journal.title || '')
      setContent(journal.content)
      setSelectedEmoji(journal.emoji || '😀')
      setEmotion(journal.emotion || '')
    } catch (err: any) {
      setError(err.message)
    }
  }

  async function updateJournal(entry: { id: string; title: string; content: string; emotion: string; emoji: string }) {
    try {
      const token = await getIdToken()
      const response = await fetchWithRetry(`${import.meta.env.VITE_API_BASE_URL}/update-journal?journal_id=${entry.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(entry),
      })

      if (!response.ok) throw new Error("API call failed")
    } catch (err: any) {
      throw new Error(err.message)
    }
  }

  const handleSubmit = async () => {
    if (wordCount === 0 || wordCount > MAX_WORDS) return

    setLoading(true)
    setError(null)

    try {
      await updateJournal({
        id: journalId,
        title,
        content,
        emotion,
        emoji: selectedEmoji,
      })
      resetForm()
      onClose()
      window.location.reload()
    } catch (err: any) {
      setError('Failed to submit: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (open && journalId) {
      fetchJournalData(journalId)
    } else if (!open) {
      resetForm()
    }
  }, [open, journalId])

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogTitle className="text-xl font-semibold text-center mb-4">
          Update Your Journal Entry
        </DialogTitle>

        {/* Title Input */}
        <Input
          placeholder="Entry Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mb-4"
        />

        {/* Emoji Picker + Emotion Input */}
        <div className="flex items-center gap-4 mb-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="text-2xl">
                {selectedEmoji}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="grid grid-cols-5 gap-2 w-48">
              {emojiOptions.map((emoji) => (
                <button
                  key={emoji}
                  className="text-xl hover:scale-110 transition"
                  onClick={() => setSelectedEmoji(emoji)}
                >
                  {emoji}
                </button>
              ))}
            </PopoverContent>
          </Popover>

          <Input
            placeholder="Emotion (e.g. happy, anxious)"
            value={emotion}
            onChange={(e) => setEmotion(e.target.value)}
          />
        </div>

        {/* Content Area */}
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your thoughts here..."
          rows={6}
          className="resize-none mb-2"
        />

        <div className="flex justify-between text-xs text-gray-500 mb-4">
          <span>{wordCount} / {MAX_WORDS} words</span>
          {wordCount > MAX_WORDS && (
            <span className="text-red-500">Too many words</span>
          )}
        </div>

        {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

        <Button
          onClick={handleSubmit}
          disabled={loading || wordCount === 0 || wordCount > MAX_WORDS}
          className="w-full bg-sky-500 hover:bg-sky-600 text-white"
        >
          {loading ? 'Working Our Magic...' : 'Submit'}
        </Button>
      </DialogContent>
    </Dialog>
  )
}
