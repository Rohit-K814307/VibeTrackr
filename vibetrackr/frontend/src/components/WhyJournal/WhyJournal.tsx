import { Card } from "@/components/ui/card";
import { FaBrain } from "react-icons/fa6";
import { FaHeartbeat, FaLightbulb } from "react-icons/fa";
import { BsGraphUpArrow } from "react-icons/bs";

export function WhyJournal() {
  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8" id="why-journal">
      <div className="max-w-4xl mx-auto">
        <p className="text-sm text-violet-600 text-center mb-2">Why Journal?</p>
        <h2 className="text-3xl font-bold text-center text-black mb-3">
          The Science Behind Daily Journaling
        </h2>
        <p className="text-center text-gray-500 mb-12 max-w-3xl mx-auto">
          Discover how daily journaling can transform your mental wellbeing, backed by research and real results.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Feature Card 1 */}
          <Card className="p-6 bg-sky-100 transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-1">
            <div className="flex items-center gap-4 mb-4">
              <FaBrain className="text-3xl text-sky-500" />
              <h3 className="text-xl font-semibold">Reduce Anxiety</h3>
            </div>
            <p className="text-gray-700">
              Studies show regular journaling decreases anxiety levels by up to 37% through emotional processing.
            </p>
          </Card>

          {/* Feature Card 2 */}
          <Card className="p-6 bg-sky-100 transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-1">
            <div className="flex items-center gap-4 mb-4">
              <FaHeartbeat className="text-3xl text-sky-500" />
              <h3 className="text-xl font-semibold">Stress Management</h3>
            </div>
            <p className="text-gray-700">
              Writing for just 15 minutes daily can significantly lower cortisol levels and improve stress resilience.
            </p>
          </Card>

          {/* Feature Card 3 */}
          <Card className="p-6 bg-sky-100 transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-1">
            <div className="flex items-center gap-4 mb-4">
              <FaLightbulb className="text-3xl text-sky-500" />
              <h3 className="text-xl font-semibold">Improve Self-Awareness</h3>
            </div>
            <p className="text-gray-700">
              Regular journaling enhances emotional intelligence and helps identify behavior patterns.
            </p>
          </Card>

          {/* Feature Card 4 */}
          <Card className="p-6 bg-sky-100 transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-1">
            <div className="flex items-center gap-4 mb-4">
              <BsGraphUpArrow className="text-3xl text-sky-500" />
              <h3 className="text-xl font-semibold">Proven Results</h3>
            </div>
            <p className="text-gray-700">
              Research shows 88% of journal keepers report improved mental clarity and emotional balance.
            </p>
          </Card>
        </div>

        {/* Quote Section */}
        <div className="mt-16 text-center">
          <blockquote className="text-xl italic text-gray-700 max-w-2xl mx-auto border-l-4 border-sky-500 pl-4">
            “Journaling is like whispering to one's self and listening at the same time.” — Mina Murray, Psychology Research Journal
          </blockquote>
        </div>
      </div>
    </section>
  );
}
