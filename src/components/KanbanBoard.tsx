import React, { useState, useEffect } from 'react';
import { useAtom } from 'jotai';
import { storiesByColumnAtom, safeColumnsAtom, moveStoryAtom, deleteStoryAtom, addStoryAtom, updateStoryAtom } from '@/stores/appStore';
import { KanbanColumn } from '@/components/KanbanColumn';
import { EditStoryModal } from '@/components/EditStoryModal';
import { DndContext, DragEndEvent, DragOverEvent, DragStartEvent, PointerSensor, useSensor, useSensors, DragOverlay } from '@dnd-kit/core';
import { StoryCard } from '@/components/StoryCard';
import { Button } from '@/components/ui/button';
import { Undo } from 'lucide-react';
import type { Story } from '@/types';

export function KanbanBoard() {
  const [storiesByColumn] = useAtom(storiesByColumnAtom);
  const [columns] = useAtom(safeColumnsAtom);
  const [, moveStory] = useAtom(moveStoryAtom);
  const [, deleteStory] = useAtom(deleteStoryAtom);
  const [, addStory] = useAtom(addStoryAtom);
  const [, updateStory] = useAtom(updateStoryAtom);
  
  const [selectedStories, setSelectedStories] = useState<string[]>([]);
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(null);
  const [editingStory, setEditingStory] = useState<Story | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [undoStack, setUndoStack] = useState<Array<{
    type: 'delete' | 'move';
    storyId: string;
    previousColumnId?: string;
    story?: Story;
  }>>([]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Helper function to get range of stories between two indices
  const getStoriesInRange = (storyList: Story[], startIndex: number, endIndex: number): string[] => {
    const start = Math.min(startIndex, endIndex);
    const end = Math.max(startIndex, endIndex);
    return storyList.slice(start, end + 1).map(story => story.id);
  };

  const handleUndo = () => {
    if (undoStack.length > 0) {
      const lastAction = undoStack[undoStack.length - 1];
      console.log('Undo action:', lastAction);
      
      if (lastAction.type === 'delete' && lastAction.story) {
        // Restore deleted story by setting deleted: false
        console.log('Undo delete: restoring story', lastAction.storyId);
        updateStory(lastAction.storyId, { deleted: false });
        
        // Story will be restored to the icebox column by default
        console.log('Story restored to icebox column');
      } else if (lastAction.type === 'move' && lastAction.previousColumnId) {
        // Restore previous column assignment
        // Find the current column of the story
        let currentColumnId = '';
        for (const [columnId, stories] of Object.entries(storiesByColumn)) {
          if (stories.some(story => story.id === lastAction.storyId)) {
            currentColumnId = columnId;
            break;
          }
        }
        if (currentColumnId && currentColumnId !== lastAction.previousColumnId) {
          moveStory(lastAction.storyId, currentColumnId, lastAction.previousColumnId);
          console.log('Undo move:', lastAction.storyId, 'back to column:', lastAction.previousColumnId);
        }
      }
      
      // Remove from undo stack
      setUndoStack(prev => prev.slice(0, -1));
    }
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Delete' && selectedStories.length > 0) {
        // Delete selected stories and add to undo stack
        selectedStories.forEach(storyId => {
          // Find the story and its column to store in undo stack
          for (const [columnId, stories] of Object.entries(storiesByColumn)) {
            const story = stories.find(s => s.id === storyId);
            if (story) {
              setUndoStack(prev => [...prev, {
                type: 'delete',
                storyId,
                story: { ...story, columnId }
              }]);
              break;
            }
          }
          deleteStory(storyId);
        });
        setSelectedStories([]);
      } else if (event.key === 'z' && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        handleUndo();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedStories, deleteStory, undoStack, storiesByColumn, addStory]);

  const handleStoryClick = (storyId: string, event: React.MouseEvent, storyList?: Story[], currentIndex?: number) => {
    if (event.ctrlKey && event.shiftKey && storyList && currentIndex !== undefined && lastSelectedIndex !== null) {
      // Range selection with Ctrl+Shift
      const rangeStoryIds = getStoriesInRange(storyList, lastSelectedIndex, currentIndex);
      setSelectedStories(prev => {
        const newSet = new Set(prev);
        rangeStoryIds.forEach(id => newSet.add(id));
        return Array.from(newSet);
      });
    } else if (event.ctrlKey || event.metaKey) {
      // Multi-select with Ctrl/Cmd
      setSelectedStories(prev => 
        prev.includes(storyId) 
          ? prev.filter(id => id !== storyId)
          : [...prev, storyId]
      );
      // Update last selected index for range selection
      if (storyList && currentIndex !== undefined) {
        setLastSelectedIndex(currentIndex);
      }
    } else {
      // Single select
      setSelectedStories([storyId]);
      // Update last selected index for range selection
      if (storyList && currentIndex !== undefined) {
        setLastSelectedIndex(currentIndex);
      }
    }
  };

  const handleEditStory = (story: Story) => {
    console.log('Edit story called for:', story.title);
    setEditingStory(story);
    setShowEditModal(true);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    console.log('Drag end:', { activeId, overId, activeData: active.data.current, overData: over.data.current });

    // Find which column the active item is in
    let fromColumnId = '';
    let toColumnId = '';

    // Check if dropping on a column (either by column ID or by column data type)
    if (over.data.current?.type === 'column' || columns.some(col => col.id === overId)) {
      toColumnId = overId;
    } else {
      // Find the column of the over item (could be a story)
      for (const [columnId, stories] of Object.entries(storiesByColumn)) {
        if (stories.some(story => story.id === overId)) {
          toColumnId = columnId;
          break;
        }
      }
    }

    // Find which column the active item is in
    for (const [columnId, stories] of Object.entries(storiesByColumn)) {
      if (stories.some(story => story.id === activeId)) {
        fromColumnId = columnId;
        break;
      }
    }

    console.log('Move story:', { fromColumnId, toColumnId, activeId });

    if (fromColumnId && toColumnId && fromColumnId !== toColumnId) {
      // If multiple stories are selected and the dragged story is one of them, move all selected stories
      if (selectedStories.includes(activeId) && selectedStories.length > 1) {
        console.log('Moving multiple stories:', selectedStories);
        selectedStories.forEach(storyId => {
          // Find which column each selected story is in
          for (const [columnId, stories] of Object.entries(storiesByColumn)) {
            if (stories.some(story => story.id === storyId)) {
              if (columnId !== toColumnId) {
                // Add to undo stack before moving
                setUndoStack(prev => [...prev, {
                  type: 'move',
                  storyId,
                  previousColumnId: columnId
                }]);
                moveStory(storyId, columnId, toColumnId);
              }
              break;
            }
          }
        });
      } else {
        // Add to undo stack before moving single story
        setUndoStack(prev => [...prev, {
          type: 'move',
          storyId: activeId,
          previousColumnId: fromColumnId
        }]);
        // Move single story
        moveStory(activeId, fromColumnId, toColumnId);
      }
    }
    
    setActiveId(null);
  };

  const handleDragOver = (_event: DragOverEvent) => {
    // Handle drag over logic if needed
  };

  const handleDragStart = (event: DragStartEvent) => {
    const activeId = event.active.id as string;
    setActiveId(activeId);
    console.log('Drag start:', activeId);
    
    // If the dragged story is part of a multi-selection, show that in console
    if (selectedStories.includes(activeId) && selectedStories.length > 1) {
      console.log('Dragging multiple stories:', selectedStories);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Kanban Board</h3>
        <div className="flex items-center gap-2">
          {selectedStories.length > 1 && (
            <div className="text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
              {selectedStories.length} stories selected - drag any to move all
            </div>
          )}
          {undoStack.length > 0 && (
            <Button 
              size="sm" 
              variant="outline" 
              onClick={handleUndo}
              className="text-xs h-8"
            >
              <Undo className="h-3 w-3 mr-1" />
              Undo
            </Button>
          )}
        </div>
      </div>
      
      <DndContext
        sensors={sensors}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        onDragStart={handleDragStart}
      >
        <div className="overflow-x-auto pb-4 mobile-scroll">
          <div className="flex gap-4 min-w-max sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 sm:min-w-0">
            {columns.map((column) => (
              <div key={column.id} className="w-72 sm:w-auto flex-shrink-0 sm:flex-shrink">
                <KanbanColumn
                  column={column}
                  stories={storiesByColumn[column.id] || []}
                  selectedStories={selectedStories}
                  onStoryClick={handleStoryClick}
                  onEditStory={handleEditStory}
                />
              </div>
            ))}
          </div>
        </div>
        
        <DragOverlay>
          {activeId ? (
            <div className="opacity-90 transform rotate-3 scale-105">
              {(() => {
                // Find the active story
                for (const stories of Object.values(storiesByColumn)) {
                  const story = stories.find(s => s.id === activeId);
                  if (story) {
                    return (
                      <StoryCard 
                        story={story} 
                        isSelected={selectedStories.includes(story.id)}
                        onClick={() => {}}
                      />
                    );
                  }
                }
                return null;
              })()}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
      
      <EditStoryModal
        open={showEditModal}
        onOpenChange={setShowEditModal}
        story={editingStory}
      />
    </div>
  );
}
