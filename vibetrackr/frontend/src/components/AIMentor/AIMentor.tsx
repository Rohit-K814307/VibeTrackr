import { Card } from "@/components/ui/card";
import { VscRobot } from "react-icons/vsc";

export function AIMentor() {
  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8" id="mood-mentor">
      <div className="max-w-4xl mx-auto">
        <p className="text-sm text-violet-600 text-center mb-2">Mood Mentor</p>
        <h2 className="text-3xl font-bold text-center text-black mb-3">
          Meet Your Mood Mentor
        </h2>

        <p className="text-center text-gray-500 mb-12 max-w-3xl mx-auto">
          Get compassionate feedback, personalized advice, and emotional support—all powered by our finetuned AI.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-8">
          {/* Feature Card 1: Smart Journaling */}
          <Card className="p-6 rounded-lg bg-gradient-to-br from-purple-100 to-white shadow-[4px_4px_12px_rgba(0,0,0,0.08)] hover:shadow-[6px_6px_16px_rgba(0,0,0,0.1)] transition-shadow flex flex-col justify-between">
            <div>
              <div className="flex justify-center mb-4">
                <VscRobot className="text-4xl text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-center">Personal AI Support</h3>
              <p className="text-gray-600 mt-2 text-center">
                VibeTrackr's AI mentor reads your journals, recognizes themes, and responds with thoughtful, actionable feedback.
              </p>
            </div>
            <div className="mt-6 flex justify-center">
              <div className="bg-purple-200 text-purple-700 text-xs font-medium px-3 py-1 rounded-full">
                Always there for you
              </div>
            </div>
          </Card>

          {/* Feature Card 2: Mood Mentor */}
          <Card className="p-6 rounded-lg shadow-[4px_4px_12px_rgba(0,0,0,0.08)] hover:shadow-[6px_6px_16px_rgba(0,0,0,0.1)] transition-shadow">
            <div className="flex items-center justify-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full border-2 border-violet-600 overflow-hidden">
                <img
                  src="https://png.pngtree.com/png-vector/20231215/ourmid/pngtree-3d-character-psychologist-cartoon-three-dimensional-realistic-profession-png-image_11362969.png"
                  alt="mm"
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-xl font-semibold">Mood Mentor</h3>
            </div>
            <p className="text-gray-600 mt-2 italic text-center">
              "I noticed you felt nervous before your big meeting, but also excited. Remember to breathe and celebrate every small win today!"
            </p>
          </Card>
        </div>
      </div>
    </section>
  );
}
