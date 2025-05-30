import React from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { JournalEntry } from '@/types/journal'; 

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface EmotiveAngularDistanceChartProps {
  journals: JournalEntry[];
}

export const EmotiveAngularDistanceChart: React.FC<EmotiveAngularDistanceChartProps> = ({ journals }) => {
  const sortedJournals = [...journals].sort((a, b) => a.timestamp - b.timestamp);

  const labels = sortedJournals.map((journal) => new Date(journal.timestamp).toLocaleDateString());
  const dataValues = sortedJournals.map((journal) => journal.analysis.Emotive_Angular_Distance);

  const data = {
    labels: labels,
    datasets: [
      {
        label: 'Emotive Angular Distance',
        data: dataValues,
        borderColor: 'rgb(153, 102, 255)',
        backgroundColor: 'rgba(153, 102, 255, 0.2)',
        tension: 0.3,
        fill: false, // Don't fill for this metric, as it's a distance
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
        text: 'Emotive Angular Distance Over Time',
      },
    },
    scales: {
      y: {
        min: 0,
        // Max might vary depending on the specific model, let Chart.js auto-scale or set a reasonable max if known
        title: {
          display: true,
          text: 'Distance',
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
        <CardTitle>Emotional Stability Indicator</CardTitle>
      </CardHeader>
      <CardContent className="relative h-[calc(100%-80px)]">
        {journals.length > 0 ? (
          <Line data={data} options={options} />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            No journal entries to display angular distance.
          </div>
        )}
      </CardContent>
    </Card>
  );
};