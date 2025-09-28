import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAtom } from 'jotai';
import { currentSprintAtom, storiesAtom, safeColumnsAtom } from '@/stores/appStore';
import { format, eachDayOfInterval, parseISO } from 'date-fns';

export function BurnupChart() {
  const [currentSprint] = useAtom(currentSprintAtom);
  const [stories] = useAtom(storiesAtom);
  const [columns] = useAtom(safeColumnsAtom);

  const generateBurnupData = () => {
    if (!currentSprint) return [];

    const startDate = parseISO(currentSprint.startDate);
    const endDate = parseISO(currentSprint.endDate);
    const days = eachDayOfInterval({ start: startDate, end: endDate });

    // Calculate total scope for the sprint
    const sprintStories = stories.filter(story => story.sprintId === currentSprint.id);
    const totalScope = sprintStories.reduce((sum, story) => sum + story.weight, 0);

    return days.map((day, index) => {
      const dayStr = format(day, 'MMM dd');
      
      // For burnup, we show cumulative completed work
      // In a real implementation, you'd track daily completion
      const completed = Math.min(totalScope, (totalScope * 0.1 * index));
      
      return {
        day: dayStr,
        completed: Math.round(completed),
        total: totalScope
      };
    });
  };

  const data = generateBurnupData();

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="day" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="completed" 
            stroke="#82ca9d" 
            strokeWidth={2}
            name="Completed"
          />
          <Line 
            type="monotone" 
            dataKey="total" 
            stroke="#8884d8" 
            strokeWidth={2}
            name="Total Scope"
            strokeDasharray="5 5"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
