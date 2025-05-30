import React from 'react';
import Plot from 'react-plotly.js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { JournalEntry } from '@/types/journal'; 

interface VAD3DScatterPlotProps {
  journals: JournalEntry[];
  numJournalsToShow?: number; 
}

export const VAD3DScatterPlot: React.FC<VAD3DScatterPlotProps> = ({ journals, numJournalsToShow = 10 }) => {
  const latestJournals = [...journals]
    .sort((a, b) => b.timestamp - a.timestamp) // Sort descending by timestamp
    .slice(0, numJournalsToShow); // Take the latest N

  const x = latestJournals.map((j) => j.analysis.V); // Valence
  const y = latestJournals.map((j) => j.analysis.A); // Arousal
  const z = latestJournals.map((j) => j.analysis.D); // Dominance

  // Hover text for each point
  const text = latestJournals.map(
    (j) =>
      `Title: ${j.journalTitle}<br>Date: ${new Date(j.timestamp).toLocaleDateString()}<br>Emotion: ${j.emotion} (${j.analysis.Emotion})<br>V: ${j.analysis.V.toFixed(2)}, A: ${j.analysis.A.toFixed(2)}, D: ${j.analysis.D.toFixed(2)}`
  );

  const data: Plotly.Data[] = [
    {
      x: x,
      y: y,
      z: z,
      mode: 'markers',
      type: 'scatter3d',
      marker: {
        size: 8,
        opacity: 0.8,
        color: latestJournals.map(j => {
          // Color points based on main emotion (can refine this)
          switch (j.emotion.toLowerCase()) {
            case 'happy': return 'rgb(255, 204, 0)'; // Yellow
            case 'excited': return 'rgb(255, 102, 0)'; // Orange
            case 'sad': return 'rgb(102, 102, 255)'; // Light Blue/Purple
            case 'angry': return 'rgb(204, 0, 0)'; // Red
            case 'calm': return 'rgb(0, 153, 0)'; // Green
            default: return 'rgb(128, 128, 128)'; // Grey
          }
        }),
      },
      text: text,
      hoverinfo: 'text',
    },
  ];

  const layout: Partial<Plotly.Layout> = {
    scene: {
      xaxis: { title: 'Valence (V)' },
      yaxis: { title: 'Arousal (A)' },
      zaxis: { title: 'Dominance (D)' },
      aspectmode: 'cube', // Keeps the aspect ratio fixed
    },
    margin: {
      l: 0,
      r: 0,
      b: 0,
      t: 40, // Adjust top margin for title
    },
    hovermode: 'closest',
    title: `VAD Space for Latest ${latestJournals.length} Journals`,
  };

  return (
    <Card className="h-[500px]">
      <CardHeader>
        <CardTitle>Your Emotional Landscape (VAD Model)</CardTitle>
      </CardHeader>
      <CardContent className="relative h-[calc(100%-80px)]">
        {journals.length > 0 ? (
          <Plot
            data={data}
            layout={layout}
            className="w-full h-full"
            config={{ responsive: true }}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            No journal entries to plot VAD space.
          </div>
        )}
      </CardContent>
    </Card>
  );
};