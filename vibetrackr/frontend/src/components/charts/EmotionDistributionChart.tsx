import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { JournalEntry } from '@/types/journal'; 

ChartJS.register(ArcElement, Tooltip, Legend);

interface EmotionDistributionChartProps {
  journals: JournalEntry[];
  type: 'user' | 'ai'; // To choose between user-selected or AI-detected emotion
}

export const EmotionDistributionChart: React.FC<EmotionDistributionChartProps> = ({ journals, type }) => {
  const emotionCounts: { [key: string]: number } = {};

  journals.forEach((journal) => {
    const emotion = type === 'user' ? journal.emotion : journal.analysis.Emotion;
    emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
  });

  const labels = Object.keys(emotionCounts);
  const dataValues = Object.values(emotionCounts);

  const data = {
    labels: labels,
    datasets: [
      {
        label: `Number of Entries`,
        data: dataValues,
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)', // Red (Happy, Excited, etc.)
          'rgba(54, 162, 235, 0.6)', // Blue (Calm, Peaceful)
          'rgba(255, 206, 86, 0.6)', // Yellow (Surprised, Neutral)
          'rgba(75, 192, 192, 0.6)', // Green (Content, Peaceful)
          'rgba(153, 102, 255, 0.6)', // Purple (Sad, Depressed)
          'rgba(255, 159, 64, 0.6)', // Orange (Angry, Annoyed)
          'rgba(199, 199, 199, 0.6)', // Grey (Neutral, Tired)
          // Add more colors if you expect more emotion types
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(199, 199, 199, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
      },
      title: {
        display: true,
        text: `${type === 'user' ? 'User-Selected' : 'AI-Detected'} Emotion Distribution`,
      },
    },
  };

  return (
    <Card className="h-[400px]">
      <CardHeader>
        <CardTitle>{type === 'user' ? 'Your Emotions' : 'AI\'s Perspective'}</CardTitle>
      </CardHeader>
      <CardContent className="relative h-[calc(100%-80px)]"> {/* Adjust height for content */}
        {journals.length > 0 ? (
          <Doughnut data={data} options={options} />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            No journal entries to display emotion distribution.
          </div>
        )}
      </CardContent>
    </Card>
  );
};