import { Card } from "@/components/ui/card";
import { FaPencilAlt, FaSpotify } from "react-icons/fa";
import { FcLineChart } from "react-icons/fc";

export function HowItWorks() {
  return (
    <section className="py-6 px-4 sm:px-6 lg:px-8" id="how-it-works">
      <div className="max-w-4xl mx-auto">
        <p className="text-sm text-violet-600 text-center mb-2">How It Works</p>
        <h2 className="text-3xl font-bold text-center text-black mb-3">
          Improving Your Mental Health, Step by Step
        </h2>

        <p className="text-center text-gray-500 mb-12 max-w-3xl mx-auto">
          Simple, insightful, and empowering—VibeTrackr is designed to fit your daily routine.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 text-center">
          {/* Feature Card 1 */}
          <Card className="p-6 transition-all duration-300 shadow-[6px_6px_16px_rgba(255,255,255,0.5)] hover:shadow-[10px_10px_24px_rgba(255,255,255,0.6)] hover:-translate-y-1">
            <div className="flex justify-center mb-4">
              <div className="bg-purple-100 rounded-full p-4 flex items-center justify-center">
                <FaPencilAlt className="text-3xl text-purple-500" />
              </div>
            </div>
            <h3 className="text-xl font-semibold">1. Journal Your Feelings</h3>
            <p className="text-gray-600 mt-2">
              Write daily journals about your feelings and experiences. Your journals are the foundation for all insights.
            </p>
          </Card>

          {/* Feature Card 2 */}
          <Card className="p-6 transition-all duration-300 shadow-[6px_6px_16px_rgba(255,255,255,0.5)] hover:shadow-[10px_10px_24px_rgba(255,255,255,0.6)] hover:-translate-y-1">
            <div className="flex justify-center mb-4">
              <div className="bg-sky-100 rounded-full p-4 flex items-center justify-center">
                <FcLineChart className="text-3xl" />
              </div>
            </div>
            <h3 className="text-xl font-semibold">2. Emotion Analytics</h3>
            <p className="text-gray-600 mt-2">
              In-house Machine Learning calculates mathematical dimensions of emotions and shows you them in an easy-to-understand dashboard with emotions ranging from anger to sadness.
            </p>
          </Card>

          {/* Feature Card 3 */}
          <Card className="p-6 transition-all duration-300 shadow-[6px_6px_16px_rgba(255,255,255,0.5)] hover:shadow-[10px_10px_24px_rgba(255,255,255,0.6)] hover:-translate-y-1">
            <div className="flex justify-center mb-4">
              <div className="bg-green-100 rounded-full p-4 flex items-center justify-center">
                <FaSpotify className="text-3xl text-green-500" />
              </div>
            </div>
            <h3 className="text-xl font-semibold">3. Get Music & Guidance</h3>
            <p className="text-gray-600 mt-2">
              Receive mood-matched Spotify tracks and thoughtful AI mentorship to uplift and guide you to improve your mood and mental well-being.
            </p>
          </Card>
        </div>
      </div>
    </section>
  );
}
