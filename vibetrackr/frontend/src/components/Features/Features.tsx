import { Card } from "@/components/ui/card";
import { BsJournalBookmarkFill } from "react-icons/bs";
import { LuChartLine } from "react-icons/lu";
import { AiOutlineSpotify } from "react-icons/ai";

export function Features() {
  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8" id="features">
      <div className="max-w-4xl mx-auto">
        <p className="text-sm text-violet-600 text-center mb-2">Features</p>
        <h2 className="text-3xl font-bold text-center text-black mb-3">
          The Tools That Power Your Emotional Wellbeing
        </h2>

        <p className="text-center text-gray-500 mb-12 max-w-3xl mx-auto">
          VibeTrackr blends the science of emotion detection with music therapy and AI mentorship to support
          your mental health journey.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Feature Card 1: Smart Journaling */}
          <Card className="p-6 rounded-lg bg-gradient-to-br from-purple-100 to-white text-center shadow-[4px_4px_12px_rgba(0,0,0,0.08)] hover:shadow-[6px_6px_16px_rgba(0,0,0,0.1)] transition-shadow">
            <div className="flex justify-center mb-4">
              <BsJournalBookmarkFill className="text-4xl text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold">Smart Journaling</h3>
            <p className="text-gray-600 mt-2">
              Write daily journals for day-by-day insights. Your thoughts are securely
              stored and analyzed for deeper understanding.
            </p>
          </Card>

          {/* Feature Card 2: Emotion Analytics */}
          <Card className="p-6 rounded-lg bg-gradient-to-br from-sky-100 to-white text-center shadow-[4px_4px_12px_rgba(0,0,0,0.08)] hover:shadow-[6px_6px_16px_rgba(0,0,0,0.1)] transition-shadow">
            <div className="flex justify-center mb-4">
              <LuChartLine className="text-4xl text-sky-400" />
            </div>
            <h3 className="text-xl font-semibold">Emotion Analytics</h3>
            <p className="text-gray-600 mt-2">
              VibeTrackr uses advanced BERT AI to extract Valence, Arousal, and
              Dominance emotion dimensions from your entries.
            </p>
          </Card>

          {/* Feature Card 3: Music Therapy */}
          <Card className="p-6 rounded-lg bg-gradient-to-br from-green-100 to-white text-center shadow-[4px_4px_12px_rgba(0,0,0,0.08)] hover:shadow-[6px_6px_16px_rgba(0,0,0,0.1)] transition-shadow">
            <div className="flex justify-center mb-4">
              <AiOutlineSpotify className="text-4xl text-green-400" />
            </div>
            <h3 className="text-xl font-semibold">Music Therapy</h3>
            <p className="text-gray-600 mt-2">
              Get Spotify song recommendations tailored to your mood and emotional
              state—instantly lift your spirits.
            </p>
          </Card>
        </div>
      </div>
    </section>
  );
}
