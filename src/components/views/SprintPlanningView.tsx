import { useState, useEffect } from 'react';
import { useAtom } from 'jotai';
import { storiesAtom, safeSprintsAtom, updateStoryAtom, deleteStoryAtom, addStoryAtom, rolesAtom, visionsAtom, settingsAtom, currentSprintAtom } from '@/stores/appStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AddStoryModal } from '@/components/AddStoryModal';
import { EditStoryModal } from '@/components/EditStoryModal';
import { Plus, Calendar, Target, Clock, Edit, Undo } from 'lucide-react';
import type { Story, Sprint } from '@/types';

export function SprintPlanningView() {
  const [stories] = useAtom(storiesAtom);
  const [sprints] = useAtom(safeSprintsAtom);
  const [, updateStory] = useAtom(updateStoryAtom);
  const [, deleteStory] = useAtom(deleteStoryAtom);
  const [, addStory] = useAtom(addStoryAtom);
  const [roles] = useAtom(rolesAtom);
  const [visions] = useAtom(visionsAtom);
  const [settings] = useAtom(settingsAtom);
  const [currentSprint] = useAtom(currentSprintAtom);
  
  const [showAddStoryModal, setShowAddStoryModal] = useState(false);
  const [showEditStoryModal, setShowEditStoryModal] = useState(false);
  const [editingStory, setEditingStory] = useState<Story | null>(null);
  const [draggedStoryId, setDraggedStoryId] = useState<string | null>(null);
  const [dragOverSprintId, setDragOverSprintId] = useState<string | null>(null);
  const [selectedStoryIds, setSelectedStoryIds] = useState<Set<string>>(new Set());
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(null);
  const [undoStack, setUndoStack] = useState<Array<{
    type: 'delete' | 'move';
    storyId: string;
    previousSprintId?: string;
    story?: Story;
  }>>([]);

  // Get stories that are not assigned to any sprint
  const unassignedStories = stories.filter(story => !story.sprintId && !story.deleted);

  // Helper function to get range of stories between two indices
  const getStoriesInRange = (storyList: Story[], startIndex: number, endIndex: number): string[] => {
    const start = Math.min(startIndex, endIndex);
    const end = Math.max(startIndex, endIndex);
    return storyList.slice(start, end + 1).map(story => story.id);
  };

  const handleAssignToSprint = (storyId: string, sprintId: string) => {
    updateStory(storyId, { sprintId });
  };

  const handleStoryClick = (e: React.MouseEvent, storyId: string, storyList?: Story[], currentIndex?: number) => {
    // Don't handle click if it's a drag operation
    if (e.defaultPrevented) return;
    
    if (e.ctrlKey && e.shiftKey && storyList && currentIndex !== undefined && lastSelectedIndex !== null) {
      // Range selection with Ctrl+Shift
      const rangeStoryIds = getStoriesInRange(storyList, lastSelectedIndex, currentIndex);
      setSelectedStoryIds(prev => {
        const newSet = new Set(prev);
        rangeStoryIds.forEach(id => newSet.add(id));
        return newSet;
      });
    } else if (e.ctrlKey || e.metaKey) {
      // Multi-select with Ctrl/Cmd
      setSelectedStoryIds(prev => {
        const newSet = new Set(prev);
        if (newSet.has(storyId)) {
          newSet.delete(storyId);
        } else {
          newSet.add(storyId);
        }
        return newSet;
      });
      // Update last selected index for range selection
      if (storyList && currentIndex !== undefined) {
        setLastSelectedIndex(currentIndex);
      }
    } else {
      // Single select
      setSelectedStoryIds(new Set([storyId]));
      // Update last selected index for range selection
      if (storyList && currentIndex !== undefined) {
        setLastSelectedIndex(currentIndex);
      }
    }
  };

  const clearSelection = () => {
    setSelectedStoryIds(new Set());
    setLastSelectedIndex(null);
  };

  const handleDeleteSelected = () => {
    if (selectedStoryIds.size > 0) {
      selectedStoryIds.forEach(storyId => {
        const story = stories.find(s => s.id === storyId);
        if (story) {
          // Add to undo stack before deleting
          setUndoStack(prev => [...prev, {
            type: 'delete',
            storyId,
            story: { ...story }
          }]);
          deleteStory(storyId);
        }
      });
      clearSelection();
    }
  };

  const handleUndo = () => {
    if (undoStack.length > 0) {
      const lastAction = undoStack[undoStack.length - 1];
      
      if (lastAction.type === 'delete' && lastAction.story) {
        // Restore deleted story by adding it back
        const storyToRestore = { ...lastAction.story, deleted: false };
        console.log('Undo delete: restoring story', lastAction.storyId);
        addStory(storyToRestore);
      } else if (lastAction.type === 'move' && lastAction.previousSprintId !== undefined) {
        // Restore previous sprint assignment
        updateStory(lastAction.storyId, { sprintId: lastAction.previousSprintId });
        console.log('Undo move:', lastAction.storyId, 'back to sprint:', lastAction.previousSprintId);
      }
      
      // Remove from undo stack
      setUndoStack(prev => prev.slice(0, -1));
    }
  };

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedStoryIds.size > 0) {
          e.preventDefault();
          handleDeleteSelected();
        }
      } else if (e.key === 'z' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        handleUndo();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedStoryIds, deleteStory, undoStack]);

  const handleEditStory = (story: Story) => {
    setEditingStory(story);
    setShowEditStoryModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditStoryModal(false);
    setEditingStory(null);
  };

  const handleDragStart = (e: React.DragEvent, storyId: string) => {
    console.log('DRAG START TRIGGERED for story:', storyId);
    setDraggedStoryId(storyId);
    e.dataTransfer.effectAllowed = 'move';
    
    // If this story is part of a multi-select, drag all selected stories
    const storiesToDrag = selectedStoryIds.has(storyId) && selectedStoryIds.size > 1 
      ? Array.from(selectedStoryIds) 
      : [storyId];
    
    const dragData = JSON.stringify(storiesToDrag);
    console.log('Drag start - Story ID:', storyId, 'Stories to drag:', storiesToDrag, 'Data:', dragData);
    e.dataTransfer.setData('text/plain', dragData);
    
    // Add some visual feedback
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '0.5';
    }
  };

  const handleDragEnd = (e: React.DragEvent) => {
    setDraggedStoryId(null);
    // Reset visual feedback
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '1';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragOverSprint = (e: React.DragEvent, sprintId: string) => {
    console.log('DRAG OVER sprint:', sprintId);
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverSprintId(sprintId);
  };

  const handleDragLeaveSprint = () => {
    setDragOverSprintId(null);
  };

  const handleDrop = (e: React.DragEvent, targetSprintId: string) => {
    console.log('DROP EVENT TRIGGERED for sprint:', targetSprintId);
    e.preventDefault();
    const data = e.dataTransfer.getData('text/plain');
    console.log('Drop data:', data, 'Target sprint:', targetSprintId);
    
    if (data) {
      try {
        const storyIds = JSON.parse(data);
        console.log('Parsed story IDs:', storyIds);
        if (Array.isArray(storyIds)) {
          // Move multiple stories
          storyIds.forEach(storyId => {
            const story = stories.find(s => s.id === storyId);
            if (story) {
              // Add to undo stack before moving
              setUndoStack(prev => [...prev, {
                type: 'move',
                storyId,
                previousSprintId: story.sprintId
              }]);
            }
            console.log('Updating story:', storyId, 'to sprint:', targetSprintId);
            updateStory(storyId, { sprintId: targetSprintId });
          });
        } else {
          // Single story (backward compatibility)
          const story = stories.find(s => s.id === data);
          if (story) {
            // Add to undo stack before moving
            setUndoStack(prev => [...prev, {
              type: 'move',
              storyId: data,
              previousSprintId: story.sprintId
            }]);
          }
          console.log('Updating single story:', data, 'to sprint:', targetSprintId);
          updateStory(data, { sprintId: targetSprintId });
        }
      } catch (error) {
        console.log('JSON parse error, treating as single story:', error);
        // Fallback for single story
        const story = stories.find(s => s.id === data);
        if (story) {
          setUndoStack(prev => [...prev, {
            type: 'move',
            storyId: data,
            previousSprintId: story.sprintId
          }]);
        }
        updateStory(data, { sprintId: targetSprintId });
      }
    }
    setDraggedStoryId(null);
    setDragOverSprintId(null);
    clearSelection();
  };

  const handleDropToUnassigned = (e: React.DragEvent) => {
    e.preventDefault();
    const data = e.dataTransfer.getData('text/plain');
    if (data) {
      try {
        const storyIds = JSON.parse(data);
        if (Array.isArray(storyIds)) {
          // Move multiple stories to unassigned
          storyIds.forEach(storyId => {
            const story = stories.find(s => s.id === storyId);
            if (story) {
              // Add to undo stack before moving
              setUndoStack(prev => [...prev, {
                type: 'move',
                storyId,
                previousSprintId: story.sprintId
              }]);
            }
            updateStory(storyId, { sprintId: undefined });
          });
        } else {
          // Single story (backward compatibility)
          const story = stories.find(s => s.id === data);
          if (story) {
            setUndoStack(prev => [...prev, {
              type: 'move',
              storyId: data,
              previousSprintId: story.sprintId
            }]);
          }
          updateStory(data, { sprintId: undefined });
        }
      } catch {
        // Fallback for single story
        const story = stories.find(s => s.id === data);
        if (story) {
          setUndoStack(prev => [...prev, {
            type: 'move',
            storyId: data,
            previousSprintId: story.sprintId
          }]);
        }
        updateStory(data, { sprintId: undefined });
      }
    }
    setDraggedStoryId(null);
    setDragOverSprintId(null);
    clearSelection();
  };

  const getStoryTypeColor = (type: string) => {
    const storyType = settings.storyTypes?.find(st => st.name === type);
    return storyType?.color || '#6B7280';
  };

  const getVisionTypeColor = (visionId: string) => {
    const vision = visions.find(v => v.id === visionId);
    const visionType = settings.visionTypes?.find(vt => vt.name === vision?.type);
    return visionType?.color || '#6B7280';
  };

  const getRoleColor = (roleId: string) => {
    const role = roles.find(r => r.id === roleId);
    return role?.color || '#6B7280';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Target className="h-6 w-6" />
        <h2 className="text-2xl font-bold">Sprint Planning</h2>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <p className="text-muted-foreground">
            Drag stories between sprints or to unassigned. Hold Ctrl/Cmd and click to select multiple stories, then drag them together. Press Delete key to remove selected stories. Press Ctrl+Z to undo operations.
          </p>
          {selectedStoryIds.size > 0 && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {selectedStoryIds.size} selected
              </Badge>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={clearSelection}
                className="text-xs h-6"
              >
                Clear
              </Button>
              <Button 
                size="sm" 
                variant="destructive" 
                onClick={handleDeleteSelected}
                className="text-xs h-6"
              >
                Delete
              </Button>
            </div>
          )}
          {undoStack.length > 0 && (
            <div className="flex items-center gap-2">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={handleUndo}
                className="text-xs h-6"
              >
                <Undo className="h-3 w-3 mr-1" />
                Undo
              </Button>
            </div>
          )}
        </div>
        <Button onClick={() => setShowAddStoryModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Story
        </Button>
      </div>

      {/* Unassigned Stories */}
      <Card
        onDragOver={handleDragOver}
        onDrop={handleDropToUnassigned}
        className={`transition-colors ${
          draggedStoryId && !dragOverSprintId ? 'ring-2 ring-green-500 bg-green-50' : ''
        }`}
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Unassigned Stories ({unassignedStories.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {unassignedStories.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No unassigned stories</p>
              <p className="text-sm">Create a new story or assign existing stories to sprints</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {unassignedStories.map((story, index) => (
                <Card 
                  key={story.id} 
                  className={`hover:shadow-md transition-all cursor-move ${
                    draggedStoryId === story.id ? 'opacity-50 scale-95' : ''
                  } ${
                    selectedStoryIds.has(story.id) ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                  }`}
                  draggable
                  onDragStart={(e) => handleDragStart(e, story.id)}
                  onDragEnd={handleDragEnd}
                  onClick={(e) => handleStoryClick(e, story.id, unassignedStories, index)}
                >
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div>
                        <h3 className="font-medium text-sm mb-1">{story.title}</h3>
                        {story.description && (
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {story.description}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-1">
                        <Badge 
                          variant="outline" 
                          className="text-xs"
                          style={{ 
                            borderColor: getStoryTypeColor(story.type),
                            color: getStoryTypeColor(story.type)
                          }}
                        >
                          <div 
                            className="w-2 h-2 rounded-full mr-1" 
                            style={{ backgroundColor: getStoryTypeColor(story.type) }}
                          />
                          {story.type}
                        </Badge>
                        
                        <Badge variant="outline" className="text-xs">
                          {story.priority}
                        </Badge>
                        
                        <Badge variant="outline" className="text-xs">
                          {story.weight}
                        </Badge>
                        
                        <Badge variant="outline" className="text-xs">
                          {story.size}
                        </Badge>
                      </div>

                      {story.roleId && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <div 
                            className="w-2 h-2 rounded-full" 
                            style={{ backgroundColor: getRoleColor(story.roleId) }}
                          />
                          {roles.find(r => r.id === story.roleId)?.name}
                        </div>
                      )}

                      {story.visionId && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <div 
                            className="w-2 h-2 rounded-full" 
                            style={{ backgroundColor: getVisionTypeColor(story.visionId) }}
                          />
                          {visions.find(v => v.id === story.visionId)?.title}
                        </div>
                      )}

                      <div className="pt-2 border-t">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs font-medium">Assign to Sprint:</p>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-xs h-6 p-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditStory(story);
                            }}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {sprints.slice(0, 3).map((sprint) => (
                            <Button
                              key={sprint.id}
                              size="sm"
                              variant="outline"
                              className="text-xs h-6"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAssignToSprint(story.id, sprint.id);
                              }}
                            >
                              Week {sprint.isoWeek}
                            </Button>
                          ))}
                          {sprints.length > 3 && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-xs h-6"
                            >
                              +{sprints.length - 3} more
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sprint Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sprints.slice(0, 6).map((sprint) => {
          const sprintStories = stories.filter(story => story.sprintId === sprint.id && !story.deleted);
          return (
            <Card 
              key={sprint.id} 
              className={`hover:shadow-md transition-all ${
                dragOverSprintId === sprint.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
              }`}
              onDragOver={(e) => handleDragOverSprint(e, sprint.id)}
              onDragLeave={handleDragLeaveSprint}
              onDrop={(e) => handleDrop(e, sprint.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <CardTitle className="text-base">
                      Week {sprint.isoWeek} - {sprint.year}
                    </CardTitle>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {sprintStories.length}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {new Date(sprint.startDate).toLocaleDateString()} - {new Date(sprint.endDate).toLocaleDateString()}
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {sprintStories.slice(0, 3).map((story, index) => (
                    <div 
                      key={story.id} 
                      className={`p-2 bg-muted rounded text-xs cursor-move transition-all ${
                        draggedStoryId === story.id ? 'opacity-50 scale-95' : 'hover:bg-muted/80'
                      } ${
                        selectedStoryIds.has(story.id) ? 'ring-2 ring-blue-500 bg-blue-100' : ''
                      }`}
                      draggable
                      onDragStart={(e) => handleDragStart(e, story.id)}
                      onDragEnd={handleDragEnd}
                      onClick={(e) => handleStoryClick(e, story.id, sprintStories, index)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-medium truncate flex-1">{story.title}</div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-xs h-4 w-4 p-0 ml-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditStory(story);
                          }}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="flex gap-1 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {story.priority}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {story.weight}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  {sprintStories.length > 3 && (
                    <div className="text-xs text-muted-foreground text-center">
                      +{sprintStories.length - 3} more stories
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <AddStoryModal 
        open={showAddStoryModal} 
        onOpenChange={setShowAddStoryModal}
        initialData={{ sprintId: currentSprint?.id }}
      />

      {editingStory && (
        <EditStoryModal 
          open={showEditStoryModal} 
          onOpenChange={handleCloseEditModal}
          story={editingStory}
        />
      )}
    </div>
  );
}
