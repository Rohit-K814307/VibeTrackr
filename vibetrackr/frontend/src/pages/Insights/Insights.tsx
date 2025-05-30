import React from 'react';
import type { JournalEntry } from '@/types/journal'; 
import { EmotionDistributionChart } from '@/components/charts/EmotionDistributionChart';
import { EmotionIntensityChart } from '@/components/charts/EmotionIntensityChart';
import { EmotiveAngularDistanceChart } from '@/components/charts/EmotiveAngularDistanceChart';
import { VAD3DScatterPlot } from '@/components/charts/VAD3DScaterPlot';
import { ScrollArea } from '@/components/ui/scroll-area'; // Assuming you have shadcn scroll-area

interface InsightsDashboardProps {
  journals: JournalEntry[];
}

export const Insights: React.FC<InsightsDashboardProps> = ({ journals }) => {
  if (!journals || journals.length === 0) {
    return (
      <div className="ml-10 mr-10 mb-10 mt-10 container mx-auto py-8 text-center text-muted-foreground">
        <h2 className="text-3xl font-bold mb-6">Your Insights</h2>
        <p>No journal entries available to display insights yet. Start journaling!</p>
      </div>
    );
  }

  return (
      <div className="container mx-auto py-8 px-4 ">
        <h2 className="text-4xl font-bold mb-8 text-center">Your Emotional Insights</h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <EmotionDistributionChart journals={journals} type="user" />
          <EmotionDistributionChart journals={journals} type="ai" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <EmotionIntensityChart journals={journals} />
          <EmotiveAngularDistanceChart journals={journals} />
        </div>

        <div className="mb-8">
          <VAD3DScatterPlot journals={journals} numJournalsToShow={20} /> {/* Show latest 20 journals in 3D */}
        </div>
      </div>
  );
};