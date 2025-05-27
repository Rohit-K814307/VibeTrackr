import { Button } from "@/components/ui/button";
import { ShieldCheck, Music, Bot } from "lucide-react";

export function CTA() {
  return (
    <div >
      <div className="flex flex-col items-center space-y-4 max-w-4xl mx-auto" id="get-started">
        <h1 className="text-4xl font-bold text-center">Start Your Journey With VibeTrackr Today</h1>
        <p className="text-white text-sm text-center">Journaling, emotion analytics, music, and mentorship—everything you need for better mental wellbeing.</p>

        <Button className="bg-white text-blue-500 font-bold px-6 py-3 rounded-full hover:bg-gray-100">
          Sign Up Free
        </Button>

        <div className="border-t border-white/50 w-full mt-6 pt-4 text-sm">
          <div className="flex flex-wrap items-center justify-center gap-6">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-white" />
              <span>Private and Secure</span>
            </div>
            <div className="flex items-center space-x-2">
              <Music className="w-4 h-4 text-white" />
              <span>Spotify Integration</span>
            </div>
            <div className="flex items-center space-x-2">
              <Bot className="w-4 h-4 text-white" />
              <span>AI Powered</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
