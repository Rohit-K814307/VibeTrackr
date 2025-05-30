import { Button } from "@/components/ui/button";
import { Pencil, Brain, Bot } from "lucide-react";
import { SiSpotify as Spotify } from "react-icons/si"; // optional for Spotify icon

const features = [
  {
    title: "Daily Journal Entry",
    description: "“Today I feel hopeful but anxious about my presentation…”",
    icon: <Pencil className="w-5 h-5 text-violet-600" />,
    bg: "bg-white",
  },
  {
    title: "Emotion Analysis",
    description: (
      <div className="text-sm text-white">
        <p>
          Valence <span className="float-right">+0.45</span>
        </p>
        <p>
          Arousal <span className="float-right">+0.65</span>
        </p>
        <p>
          Dominance <span className="float-right">+0.51</span>
        </p>
      </div>
    ),
    icon: <Brain className="w-5 h-5 text-white" />,
    bg: "bg-violet-600 text-white",
  },
  {
    title: "Spotify Recommendation",
    description: `"Good Days" by SZA`,
    icon: <Spotify className="w-5 h-5 text-green-500" />,
    bg: "bg-white",
  },
  {
    title: "AI Mood Mentor",
    description: `"You should spend more time relaxing and focusing on..."`,
    icon: <Bot className="w-5 h-5 text-violet-600" />,
    bg: "bg-white",
  },
];

interface Testimonial {
  quote: string;
  author: string;
  role: string;
  company: string;
  avatars: Array<{
    image: string;
    fallback: string;
  }>;
}

interface Hero151Props {
  heading?: string;
  description?: string;
  button?: {
    text: string;
    url: string;
  };
  testimonial?: Testimonial;
}

const Hero151 = ({
  heading = "Understand Your Feelings. Elevate Your Mood. Meet VibeTrackr.",
  description =
    "A modern mental health companion built to help you journal, analyze your emotions, get tailored Spotify music recommendations, and receive thoughtful AI guidance—all in one place.",
  button = {
    text: "Start for Free",
    url: "/sign-in",
  },
}: Hero151Props) => {
  return (
    <section className="py-12 md:py-20">
      <div className="container">
        <div className="flex flex-col items-center gap-8 md:flex-row">
          <div className="flex-1 min-w-0 px-4 md:px-0">
            <div className="flex flex-col gap-4 lg:gap-8">
              <h1 className="max-w-[80%] text-2xl leading-tight font-semibold text-foreground lg:text-3xl xl:text-5xl">
                {heading.split(" ").map((word, i) => {
                  const cleanWord = word.replace(/[^\w]/g, "");
                  const isTargetWord =
                    cleanWord.toLowerCase() === "feelings" ||
                    cleanWord.toLowerCase() === "mood";
                  const trailingPunctuation = word.match(/[^\w]+$/)?.[0] || "";
                  return isTargetWord ? (
                    <span key={i} className="text-sky-500">
                      {cleanWord}
                      {trailingPunctuation}{" "}
                    </span>
                  ) : (
                    <span key={i}>{word} </span>
                  );
                })}
              </h1>
              <p className="text-lg leading-relaxed text-muted-foreground xl:text-2xl">
                {description}
              </p>
            </div>
            <div className="my-6 lg:my-10">
              <Button asChild size="lg" className="bg-sky-500">
                <a href={button.url}>{button.text}</a>
              </Button>
            </div>
          </div>
          <div className="w-full max-w-xl md:w-[420px] grid grid-cols-1 md:grid-cols-2 gap-4 mt-10 px-4 md:px-0">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-2xl shadow-md ${feature.bg} transition hover:scale-105 duration-200`}
              >
                <div className="flex items-center gap-2 mb-2">
                  {feature.icon}
                  <h3 className="font-semibold text-lg">{feature.title}</h3>
                </div>
                <p className="text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export { Hero151 };
