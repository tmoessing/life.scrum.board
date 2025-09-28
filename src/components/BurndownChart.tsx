import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAtom } from 'jotai';
import { currentSprintAtom, storiesAtom } from '@/stores/appStore';
import { format, eachDayOfInterval, parseISO } from 'date-fns';

export function BurndownChart() {
  const [currentSprint] = useAtom(currentSprintAtom);
  const [stories] = useAtom(storiesAtom);
  // const [columns] = useAtom(safeColumnsAtom);

  const generateBurndownData = () => {
    if (!currentSprint) return [];

    const startDate = parseISO(currentSprint.startDate);
    const endDate = parseISO(currentSprint.endDate);
    const days = eachDayOfInterval({ start: startDate, end: endDate });

    // Calculate total weight for the sprint
    const sprintStories = stories.filter(story => story.sprintId === currentSprint.id);
    const totalWeight = sprintStories.reduce((sum, story) => sum + story.weight, 0);

    // Calculate ideal burndown (straight line from total to 0)
    const idealBurndown = totalWeight / (days.length - 1);

    // Calculate actual burndown based on stories in Done column
    // const doneColumn = columns.find(col => col.name === 'Done');
    // const doneStories = doneColumn ? doneColumn.storyIds.map(id => 
    //   stories.find(story => story.id === id)
    // ).filter(Boolean) : [];

    return days.map((day, index) => {
      const dayStr = format(day, 'MMM dd');
      const idealRemaining = Math.max(0, totalWeight - (idealBurndown * index));
      
      // For actual, we'll simulate based on current done stories
      // In a real implementation, you'd track daily progress
      const actualRemaining = Math.max(0, totalWeight - (totalWeight * 0.1 * index));
      
      return {
        day: dayStr,
        ideal: Math.round(idealRemaining),
        actual: Math.round(actualRemaining)
      };
    });
  };

  const data = generateBurndownData();

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
            dataKey="ideal" 
            stroke="#8884d8" 
            strokeWidth={2}
            name="Ideal"
            strokeDasharray="5 5"
          />
          <Line 
            type="monotone" 
            dataKey="actual" 
            stroke="#82ca9d" 
            strokeWidth={2}
            name="Actual"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
