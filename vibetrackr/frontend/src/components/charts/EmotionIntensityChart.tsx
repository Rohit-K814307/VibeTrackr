import React from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { JournalEntry } from '@/types/journal'; 

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface EmotionIntensityChartProps {
  journals: JournalEntry[];
}

export const EmotionIntensityChart: React.FC<EmotionIntensityChartProps> = ({ journals }) => {
  const sortedJournals = [...journals].sort((a, b) => a.timestamp - b.timestamp);

  const labels = sortedJournals.map((journal) => new Date(journal.timestamp).toLocaleDateString());
  const dataValues = sortedJournals.map((journal) => journal.analysis.Valence_Scaled_By_Mag);

  const data = {
    labels: labels,
    datasets: [
      {
        label: 'Emotion Intensity (Valence Scaled by Magnitude)',
        data: dataValues,
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.3,
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Emotion Intensity Over Time',
      },
    },
    scales: {
      y: {
        min: 0,
        max: 1, // Valence_Scaled_By_Mag is likely normalized between 0 and 1
        title: {
          display: true,
          text: 'Intensity (0-1)',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Date',
        },
      },
    },
  };

  return (
    <Card className="h-[400px]">
      <CardHeader>
        <CardTitle>Emotional Intensity Trends</CardTitle>
      </CardHeader>
      <CardContent className="relative h-[calc(100%-80px)]">
        {journals.length > 0 ? (
          <Line data={data} options={options} />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            No journal entries to display emotion intensity.
          </div>
        )}
      </CardContent>
    </Card>
  );
};