import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Calendar, User, Tag, Weight } from 'lucide-react';
import type { Story, Priority } from '@/types';
import { useAtom } from 'jotai';
import { rolesAtom, labelsAtom, visionsAtom, settingsAtom } from '@/stores/appStore';
import { getWeightGradientColor } from '@/utils';

interface StoryCardProps {
  story: Story;
  isSelected?: boolean;
  onClick?: (event: React.MouseEvent) => void;
  onEdit?: (story: Story) => void;
}

export function StoryCard({ story, isSelected = false, onClick, onEdit }: StoryCardProps) {
  const [roles] = useAtom(rolesAtom);
  const [labels] = useAtom(labelsAtom);
  const [visions] = useAtom(visionsAtom);
  const [settings] = useAtom(settingsAtom);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: story.id,
    data: {
      type: 'story',
      story,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const role = roles.find(r => r.id === story.roleId);
  const vision = visions.find(v => v.id === story.visionId);
  const storyLabels = labels.filter(l => story.labels.includes(l.id));

  const getPriorityColor = (priority: Priority) => {
    // Fallback colors for when priorityColors is not yet available
    const fallbackColors = {
      'Q1': '#EF4444', // Red for Urgent & Important
      'Q2': '#10B981', // Green for Important, Not Urgent
      'Q3': '#F59E0B', // Yellow for Urgent, Not Important
      'Q4': '#6B7280'  // Gray for Not Urgent, Not Important
    };
    
    const priorityColor = settings.priorityColors?.[priority] || fallbackColors[priority];
    return {
      backgroundColor: `${priorityColor}20`,
      color: priorityColor,
      borderColor: `${priorityColor}40`
    };
  };

  const getWeightColor = (weight: number) => {
    const gradientColor = getWeightGradientColor(weight, settings.weightBaseColor, 21);
    return {
      backgroundColor: `${gradientColor}20`,
      color: gradientColor,
      borderColor: `${gradientColor}40`
    };
  };

  const getStoryTypeColor = (type: string) => {
    const storyType = settings.storyTypes.find(st => st.name === type);
    const typeColor = storyType?.color || '#6B7280';
    return {
      backgroundColor: `${typeColor}20`,
      color: typeColor,
      borderColor: `${typeColor}40`
    };
  };

  const getStorySizeConfig = (size: string) => {
    const storySize = settings.storySizes?.find(ss => ss.name === size);
    return storySize || { name: size, color: '#6B7280', timeEstimate: '' };
  };

  const getStorySizeColor = (size: string) => {
    const sizeConfig = getStorySizeConfig(size);
    const sizeColor = sizeConfig.color;
    return {
      backgroundColor: `${sizeColor}20`,
      color: sizeColor,
      borderColor: `${sizeColor}40`
    };
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`cursor-grab hover:shadow-md transition-shadow ${
        isDragging ? 'opacity-50 cursor-grabbing' : ''
      } ${isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : ''}`}
      {...attributes}
      {...listeners}
      onClick={(e) => {
        // Only handle click if not dragging
        if (!isDragging) {
          onClick?.(e);
        }
      }}
      onDoubleClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        // Only handle double-click if not dragging
        if (!isDragging) {
          console.log('Double-click detected, opening edit modal for:', story.title);
          onEdit?.(story);
        }
      }}
    >
      <CardContent className="p-2 sm:p-3 space-y-1 sm:space-y-2">
        {/* Title */}
        <h4 className="font-medium text-xs sm:text-sm line-clamp-2">{story.title}</h4>
        
        {/* Description */}
        {story.description && (
          <p className="text-xs text-muted-foreground line-clamp-1 sm:line-clamp-2">
            {story.description}
          </p>
        )}

        {/* Priority and Weight */}
        <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
          <Badge 
            variant="outline" 
            className="text-xs"
            style={getPriorityColor(story.priority)}
          >
            {story.priority}
          </Badge>
          <Badge 
            variant="outline" 
            className="text-xs flex items-center gap-1"
            style={getWeightColor(story.weight)}
          >
            <Weight className="h-3 w-3" />
            {story.weight}
          </Badge>
        </div>

        {/* Type and Size */}
        <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
          <Badge 
            variant="secondary" 
            className="text-xs"
            style={getStoryTypeColor(story.type)}
          >
            <span className="hidden sm:inline">{story.type}</span>
            <span className="sm:hidden">{story.type.charAt(0)}</span>
          </Badge>
          <Badge 
            variant="outline" 
            className="text-xs"
            style={getStorySizeColor(story.size)}
          >
            {story.size} {getStorySizeConfig(story.size).timeEstimate && (
              <span className="hidden sm:inline">({getStorySizeConfig(story.size).timeEstimate})</span>
            )}
          </Badge>
        </div>

        {/* Role and Vision - Hidden on mobile to save space */}
        <div className="hidden sm:block space-y-1">
          {role && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <User className="h-3 w-3" />
              <span className="truncate">{role.name}</span>
            </div>
          )}
          {vision && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Tag className="h-3 w-3" />
              <span className="truncate">{vision.title}</span>
            </div>
          )}
        </div>

        {/* Labels - Show only first 2 on mobile */}
        {storyLabels.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {storyLabels.slice(0, 2).map((label) => (
              <Badge
                key={label.id}
                variant="secondary"
                className="text-xs"
                style={{ backgroundColor: label.color + '20', color: label.color }}
              >
                {label.name}
              </Badge>
            ))}
            {storyLabels.length > 2 && (
              <Badge variant="secondary" className="text-xs sm:hidden">
                +{storyLabels.length - 2}
              </Badge>
            )}
            {storyLabels.slice(2).map((label) => (
              <Badge
                key={label.id}
                variant="secondary"
                className="text-xs hidden sm:inline-flex"
                style={{ backgroundColor: label.color + '20', color: label.color }}
              >
                {label.name}
              </Badge>
            ))}
          </div>
        )}

        {/* Due Date - Hidden on mobile to save space */}
        {story.dueDate && (
          <div className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>{new Date(story.dueDate).toLocaleDateString()}</span>
          </div>
        )}

        {/* Checklist Progress - Hidden on mobile to save space */}
        {story.checklist.length > 0 && (
          <div className="hidden sm:block text-xs text-muted-foreground">
            {story.checklist.filter(item => item.done).length} / {story.checklist.length} tasks
          </div>
        )}

        {/* Subtasks - Hidden on mobile to save space */}
        {story.subtasks && story.subtasks.length > 0 && (
          <div className="hidden sm:block text-xs text-muted-foreground">
            {story.subtasks.length} subtasks
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-between items-center">
          <div className="text-xs text-muted-foreground hidden sm:block">
            Drag to move
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-5 w-5 sm:h-6 sm:w-6 p-0"
            onClick={(e) => {
              e.stopPropagation();
              // Handle menu
            }}
          >
            <MoreHorizontal className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
