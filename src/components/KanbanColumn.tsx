import React, { useState } from 'react';
import { useAtom } from 'jotai';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useDroppable } from '@dnd-kit/core';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StoryCard } from '@/components/StoryCard';
import { AddStoryModal } from '@/components/AddStoryModal';
import { currentSprintAtom } from '@/stores/appStore';
import { Plus } from 'lucide-react';
import type { Column, Story } from '@/types';

interface KanbanColumnProps {
  column: Column;
  stories: Story[];
  selectedStories: string[];
  onStoryClick: (storyId: string, event: React.MouseEvent, storyList?: Story[], index?: number) => void;
  onEditStory: (story: Story) => void;
}

export function KanbanColumn({ column, stories, selectedStories, onStoryClick, onEditStory }: KanbanColumnProps) {
  const [showAddStoryModal, setShowAddStoryModal] = useState(false);
  const [currentSprint] = useAtom(currentSprintAtom);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: column.id,
    data: {
      type: 'column',
    },
  });

  const { setNodeRef: setDroppableRef } = useDroppable({
    id: column.id,
    data: {
      type: 'column',
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const getColumnColor = (columnName: string) => {
    switch (columnName) {
      case 'Icebox':
        return 'bg-gray-100 border-gray-200';
      case 'Backlog':
        return 'bg-blue-50 border-blue-200';
      case 'To Do':
        return 'bg-yellow-50 border-yellow-200';
      case 'In Progress':
        return 'bg-orange-50 border-orange-200';
      case 'Review':
        return 'bg-purple-50 border-purple-200';
      case 'Done':
        return 'bg-green-50 border-green-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <>
      <Card 
        ref={setNodeRef}
        style={style}
        className={`${getColumnColor(column.name)} ${isDragging ? 'opacity-50' : ''} h-fit sm:h-auto`}
        {...attributes}
        {...listeners}
      >
        <CardHeader className="pb-2 sm:pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xs sm:text-sm font-medium truncate">{column.name}</CardTitle>
            <Badge variant="secondary" className="text-xs">
              {stories.length}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent 
          ref={setDroppableRef}
          className="space-y-2 min-h-[150px] sm:min-h-[200px]"
        >
          {stories.map((story, index) => (
            <StoryCard 
              key={story.id} 
              story={story} 
              isSelected={selectedStories.includes(story.id)}
              onClick={(event) => onStoryClick(story.id, event, stories, index)}
              onEdit={onEditStory}
            />
          ))}
          
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-muted-foreground hover:text-foreground text-xs sm:text-sm"
            onClick={() => setShowAddStoryModal(true)}
          >
            <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Add Story</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </CardContent>
      </Card>
      
      <AddStoryModal
        open={showAddStoryModal}
        onOpenChange={setShowAddStoryModal}
        targetColumnId={column.id}
        initialData={{ sprintId: currentSprint?.id }}
      />
    </>
  );
}
