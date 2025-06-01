import React, { useEffect, useRef, useState } from 'react';
import Plot from 'react-plotly.js';
import Plotly from 'plotly.js-dist-min';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { JournalEntry } from '@/types/journal';

interface VAD3DScatterPlotProps {
  journals: JournalEntry[];
  numJournalsToShow?: number;
}

const EMOTION_COLORS: Record<string, string> = {
  happy: 'rgb(255, 204, 0)', // Yellow
  excited: 'rgb(255, 102, 0)', // Orange
  sad: 'rgb(102, 102, 255)', // Light Blue/Purple
  angry: 'rgb(204, 0, 0)', // Red
  calm: 'rgb(0, 153, 0)', // Green
  default: 'rgb(128, 128, 128)', // Grey
};

const VAD_EXPLANATIONS = {
  Valence:
    'Valence measures how positive or negative an emotion is. High valence = positive feelings, low valence = negative feelings.',
  Arousal:
    'Arousal measures the intensity or energy level of an emotion. High arousal = excitement/agitation, low arousal = calm/relaxed.',
  Dominance:
    'Dominance measures the control or influence over a situation. High dominance = feeling in control, low dominance = feeling submissive.',
};

export const VAD3DScatterPlot: React.FC<VAD3DScatterPlotProps> = ({
  journals,
  numJournalsToShow = 10,
}) => {
  const plotRef = useRef<any>(null);
  const [selectedEmotion, setSelectedEmotion] = useState<string>('all');
  const [isRotating, setIsRotating] = useState<boolean>(true);

  // Filter and sort journals
  const filteredJournals = [...journals]
    .filter((j) => selectedEmotion === 'all' || j.emotion.toLowerCase() === selectedEmotion)
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, numJournalsToShow);

  const x = filteredJournals.map((j) => j.analysis.V);
  const y = filteredJournals.map((j) => j.analysis.A);
  const z = filteredJournals.map((j) => j.analysis.D);

  const text = filteredJournals.map(
    (j) =>
      `Title: ${j.title}<br>Date: ${new Date(j.timestamp * 1000).toLocaleDateString()}<br>Emotion: ${j.emotion} (${j.analysis.Emotion})<br>V: ${j.analysis.V.toFixed(
        2
      )}, A: ${j.analysis.A.toFixed(2)}, D: ${j.analysis.D.toFixed(2)}`
  );

  const colors = filteredJournals.map((j) => {
    const c = EMOTION_COLORS[j.emotion.toLowerCase()];
    return c || EMOTION_COLORS.default;
  });

  const data: Plotly.Data[] = [
    {
      x,
      y,
      z,
      mode: 'markers',
      type: 'scatter3d',
      text,
      hoverinfo: 'text',
      marker: {
        size: 8,
        opacity: 0.85,
        color: colors,
        line: {
          width: 0.5,
          color: 'rgba(0,0,0,0.15)',
        },
      },
    },
  ];

  const layout: Partial<Plotly.Layout> = {
    scene: {
      xaxis: { title: { text: 'Valence (V)' }, autorange: true },
      yaxis: { title: { text: 'Arousal (A)' }, autorange: true },
      zaxis: { title: { text: 'Dominance (D)' }, autorange: true },
      aspectmode: 'data',
    },
    margin: { l: 0, r: 0, b: 0, t: 40 },
    hovermode: 'closest',
    title: `VAD Space for Latest ${filteredJournals.length} Journals`,
    paper_bgcolor: 'white',
    font: { family: 'Arial, sans-serif', size: 12 },
  };

  // Rotation animation
  useEffect(() => {
    if (!isRotating) return;

    let angle = 0;
    const interval = setInterval(() => {
      angle += 0.02;
      const camera = {
        eye: {
          x: 1.5 * Math.cos(angle),
          y: 1.5 * Math.sin(angle),
          z: 0.5,
        },
      };
      if (plotRef.current?.el) {
        Plotly.relayout(plotRef.current.el, { 'scene.camera': camera });
      }
    }, 50);

    return () => clearInterval(interval);
  }, [filteredJournals, isRotating]);

  const uniqueEmotions = Array.from(
    new Set(journals.map((j) => j.emotion.toLowerCase()))
  );

  return (
    <Card className="h-[500px] flex flex-col md:flex-row gap-4">
      <div className="flex-1 flex flex-col">
        <CardHeader>
          <CardTitle>Your Emotional Landscape (VAD Model)</CardTitle>
        </CardHeader>
        <CardContent className="relative flex-1 h-[calc(100%-80px)] flex flex-col">
          {journals.length > 0 ? (
            <>
              <div className="mb-2 flex items-center gap-4">
                {/* Dropdown */}
                <label htmlFor="emotion-select" className="font-medium">
                  Filter by Emotion:
                </label>
                <select
                  id="emotion-select"
                  value={selectedEmotion}
                  onChange={(e) => setSelectedEmotion(e.target.value)}
                  className="border border-gray-300 rounded px-2 py-1"
                >
                  <option value="all">All Emotions</option>
                  {uniqueEmotions.map((emo) => (
                    <option key={emo} value={emo}>
                      {emo.charAt(0).toUpperCase() + emo.slice(1)}
                    </option>
                  ))}
                </select>

                {/* Pause/Play button */}
                <button
                  onClick={() => setIsRotating(!isRotating)}
                  className="ml-auto rounded bg-blue-600 px-3 py-1 text-white hover:bg-blue-700 transition"
                >
                  {isRotating ? 'Pause Rotation' : 'Play Rotation'}
                </button>
              </div>

              <div className="flex-1 min-h-0">
                {/* Constrain plot size and prevent overflow */}
                <Plot
                  ref={plotRef}
                  data={data}
                  layout={layout}
                  config={{ responsive: true }}
                  className="w-full h-full"
                  style={{ minHeight: 0, maxHeight: 'calc(100%)', maxWidth: '100%' }}
                />
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              No journal entries to plot VAD space.
            </div>
          )}
        </CardContent>
      </div>

      <aside className="w-full md:w-64 bg-gray-50 p-4 mr-6 rounded border border-gray-200">
        <h3 className="text-lg font-semibold mb-2">VAD Psychological Model Explanation</h3>
        {Object.entries(VAD_EXPLANATIONS).map(([key, desc]) => (
          <div key={key} className="mb-4">
            <h4 className="font-medium">{key}</h4>
            <p className="text-sm text-gray-700">{desc}</p>
          </div>
        ))}
      </aside>
    </Card>
  );
};
