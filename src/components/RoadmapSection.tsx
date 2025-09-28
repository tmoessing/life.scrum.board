
import { useState } from 'react';
import { useAtom } from 'jotai';
import { currentSprintAtom, storiesAtom } from '@/stores/appStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AddStoryModal } from '@/components/AddStoryModal';
import { Calendar, Plus } from 'lucide-react';
import { format, eachDayOfInterval, parseISO } from 'date-fns';

export function RoadmapSection() {
  const [currentSprint] = useAtom(currentSprintAtom);
  const [stories] = useAtom(storiesAtom);
  const [showAddStoryModal, setShowAddStoryModal] = useState(false);

  const generateRoadmapData = () => {
    if (!currentSprint) return { days: [], stories: [] };

    const startDate = parseISO(currentSprint.startDate);
    const endDate = parseISO(currentSprint.endDate);
    const days = eachDayOfInterval({ start: startDate, end: endDate });

    // Get stories for this sprint
    const sprintStories = stories.filter(story => story.sprintId === currentSprint.id);

    return {
      days: days.map(day => ({
        date: format(day, 'yyyy-MM-dd'),
        dayName: format(day, 'EEE'),
        dayNumber: format(day, 'd')
      })),
      stories: sprintStories
    };
  };

  const { days, stories: sprintStories } = generateRoadmapData();

  const handleCellClick = (storyId: string, date: string) => {
    // Update story scheduled date
    console.log(`Schedule story ${storyId} for ${date}`);
  };

  const isStoryScheduledOnDate = (storyId: string, date: string) => {
    const story = sprintStories.find(s => s.id === storyId);
    return story?.scheduled === date;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Roadmap
          </CardTitle>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => setShowAddStoryModal(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Story
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="min-w-full">
            {/* Header with days */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              <div className="p-2 text-sm font-medium text-muted-foreground">Story</div>
              {days.map((day) => (
                <div key={day.date} className="p-2 text-center">
                  <div className="text-xs text-muted-foreground">{day.dayName}</div>
                  <div className="text-sm font-medium">{day.dayNumber}</div>
                </div>
              ))}
            </div>

            {/* Story rows */}
            {sprintStories.map((story) => (
              <div key={story.id} className="grid grid-cols-7 gap-1 mb-1">
                <div className="p-2 text-sm truncate border rounded">
                  {story.title}
                </div>
                {days.map((day) => (
                  <div
                    key={`${story.id}-${day.date}`}
                    className={`p-2 border rounded cursor-pointer hover:bg-muted transition-colors ${
                      isStoryScheduledOnDate(story.id, day.date)
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-background'
                    }`}
                    onClick={() => handleCellClick(story.id, day.date)}
                  >
                    {isStoryScheduledOnDate(story.id, day.date) && (
                      <div className="w-2 h-2 bg-current rounded-full mx-auto"></div>
                    )}
                  </div>
                ))}
              </div>
            ))}

            {/* Empty state */}
            {sprintStories.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No stories in this sprint</p>
                <p className="text-sm">Add stories to see them in the roadmap</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
      
      <AddStoryModal 
        open={showAddStoryModal} 
        onOpenChange={setShowAddStoryModal}
        initialData={{ sprintId: currentSprint?.id }}
      />
    </Card>
  );
}
