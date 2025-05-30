import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { getAuth } from "firebase/auth"
import { fetchWithRetry } from "@/utils"

interface AddJournalProps {
  open: boolean
  onClose: () => void
}

const MAX_WORDS = 500
const emojiOptions = ['😊', '😔', '😠', '🥰', '😢', '😎', '🤔', '😴', '🥳', '😨']

export const AddJournal: React.FC<AddJournalProps> = ({ open, onClose }) => {
  const [title, setTitle] = useState('')
  const [content, setcontent] = useState('')
  const [emotion, setEmotion] = useState('')
  const [selectedEmoji, setSelectedEmoji] = useState('😀')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [_, setUserData] = useState(null)

  const wordCount = content.trim() === '' ? 0 : content.trim().split(/\s+/).length

  async function getIdToken() {
    const auth = getAuth()
    const user = auth.currentUser
    if (!user) throw new Error("No user logged in")
    return await user.getIdToken(true)
  }

  async function addJournal(entry: { title: string; content: string; emotion: string; emoji: string }) {
    try {
      const token = await getIdToken()
      const response = await fetchWithRetry(import.meta.env.VITE_API_BASE_URL + "/add-journal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(entry),
      })

      if (!response.ok) throw new Error("API call failed")

      const data = await response.json()
      console.log(data)
      setUserData(data)
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleApiCall = async (entry: { title: string; content: string; emotion: string; emoji: string }) => {
    await addJournal(entry)
  }

  const handleSubmit = async () => {
    if (wordCount === 0 || wordCount > MAX_WORDS) return
    setLoading(true)
    setError(null)

    try {
      await handleApiCall({ title, content, emotion, emoji: selectedEmoji })
      setTitle('')
      setcontent('')
      setEmotion('')
      setSelectedEmoji('😀')
      onClose()
      window.location.reload()
    } catch {
      setError('Failed to submit.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!open) {
      setTitle('')
      setcontent('')
      setEmotion('')
      setSelectedEmoji('😀')
      setError(null)
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="">
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition"
        >
        </button>

        <DialogTitle className="text-xl font-semibold text-center mb-4">
          Add a Journal Entry
        </DialogTitle>

        {/* Title Input */}
        <Input
          placeholder="Title"
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
          onChange={(e) => setcontent(e.target.value)}
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
