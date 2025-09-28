import React, { useState } from 'react';
import { useAtom } from 'jotai';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { addStoryAtom, rolesAtom, labelsAtom, visionsAtom, settingsAtom, sprintsAtom, currentSprintAtom } from '@/stores/appStore';
import { getWeightGradientColor } from '@/utils';
import type { Story, Priority, StoryType } from '@/types';

interface AddStoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: Partial<Story>;
  targetColumnId?: string;
}

export function AddStoryModal({ open, onOpenChange, initialData, targetColumnId }: AddStoryModalProps) {
  const [, addStory] = useAtom(addStoryAtom);
  const [roles] = useAtom(rolesAtom);
  const [labels] = useAtom(labelsAtom);
  const [visions] = useAtom(visionsAtom);
  const [settings] = useAtom(settingsAtom);
  const [sprints] = useAtom(sprintsAtom);
  const [currentSprint] = useAtom(currentSprintAtom);

  // Helper function to get all available story types
  const getAllStoryTypes = () => {
    const defaultTypes = [
      { name: 'Spiritual', color: '#8B5CF6' },
      { name: 'Physical', color: '#EF4444' },
      { name: 'Intellectual', color: '#3B82F6' },
      { name: 'Social', color: '#10B981' }
    ];
    
    const settingsTypes = settings.storyTypes || [];
    const allTypes = [...settingsTypes];
    
    // Add default types that aren't already in settings
    defaultTypes.forEach(defaultType => {
      if (!settingsTypes.some(setting => setting.name === defaultType.name)) {
        allTypes.push(defaultType);
      }
    });
    
    return allTypes;
  };


  const [formData, setFormData] = useState<Partial<Story>>({
    title: '',
    description: '',
    priority: 'Q1',
    weight: 1,
    size: 'M',
    type: 'Intellectual',
    labels: [],
    roleId: undefined,
    visionId: undefined,
    dueDate: undefined,
    sprintId: undefined,
    ...initialData
  });

  const [repeatWeekly, setRepeatWeekly] = useState(false);
  const [repeatEndDate, setRepeatEndDate] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title?.trim()) {
      return;
    }

    const storyData = {
      ...formData,
      title: formData.title.trim(),
      description: formData.description?.trim() || ''
    };
    
    if (repeatWeekly) {
      // Create stories for multiple sprints
      const selectedSprint = sprints.find(s => s.id === formData.sprintId) || currentSprint;
      if (selectedSprint) {
        const startSprintIndex = sprints.findIndex(s => s.id === selectedSprint.id);
        const endDate = repeatEndDate ? new Date(repeatEndDate) : null;
        
        let sprintIndex = startSprintIndex;
        while (sprintIndex < sprints.length) {
          const sprint = sprints[sprintIndex];
          
          // Check if we've reached the end date
          if (endDate && new Date(sprint.startDate) > endDate) {
            break;
          }
          
          // Create story for this sprint
          const weeklyStoryData = {
            ...storyData,
            sprintId: sprint.id,
            title: `${storyData.title} (Week ${sprint.isoWeek})`
          };
          
          addStory(weeklyStoryData, targetColumnId);
          sprintIndex++;
        }
      }
    } else {
      // Create single story
      addStory(storyData, targetColumnId);
    }
    
    // Reset form
    setFormData({
      title: '',
      description: '',
      priority: 'Q1',
      weight: 1,
      size: 'M',
      type: 'Intellectual',
      labels: [],
      roleId: undefined,
      visionId: undefined,
      dueDate: undefined,
      sprintId: undefined
    });
    setRepeatWeekly(false);
    setRepeatEndDate('');
    
    onOpenChange(false);
  };

  const handleLabelToggle = (labelId: string) => {
    setFormData(prev => ({
      ...prev,
      labels: prev.labels?.includes(labelId)
        ? prev.labels.filter(id => id !== labelId)
        : [...(prev.labels || []), labelId]
    }));
  };

  const priorities: Priority[] = ['Q1', 'Q2', 'Q3', 'Q4'];
  const weights = [1, 3, 5, 8, 13, 21];
  // Use story sizes from settings instead of hardcoded array

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">Add New Story</DialogTitle>
          <DialogDescription className="text-sm">
            Create a new story to track your tasks and goals.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title - First and most prominent */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Title *</label>
            <Input
              value={formData.title || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter story title..."
              required
              className="text-lg"
            />
          </div>

          {/* Main Details Grid - 1 column on mobile, 2 columns on larger screens */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              {/* Priority */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Priority</label>
                <Select
                  value={formData.priority}
                  onValueChange={(value: Priority) => setFormData(prev => ({ ...prev, priority: value }))}
                >
                  <SelectTrigger>
                    <SelectValue>
                      {formData.priority && (
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ 
                              backgroundColor: formData.priority === 'Q1' ? '#EF4444' : 
                                             formData.priority === 'Q2' ? '#F59E0B' :
                                             formData.priority === 'Q3' ? '#3B82F6' : '#6B7280'
                            }}
                          />
                          {formData.priority === 'Q1' ? 'Q1 - Urgent & Important' :
                           formData.priority === 'Q2' ? 'Q2 - Not Urgent & Important' :
                           formData.priority === 'Q3' ? 'Q3 - Urgent & Not Important' :
                           formData.priority === 'Q4' ? 'Q4 - Not Urgent & Not Important' : formData.priority}
                        </div>
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {priorities.map(priority => {
                      const getPriorityLabel = (p: Priority) => {
                        switch (p) {
                          case 'Q1':
                            return 'Q1 - Urgent & Important';
                          case 'Q2':
                            return 'Q2 - Not Urgent & Important';
                          case 'Q3':
                            return 'Q3 - Urgent & Not Important';
                          case 'Q4':
                            return 'Q4 - Not Urgent & Not Important';
                          default:
                            return p;
                        }
                      };
                      
                      const getPriorityColor = (p: Priority) => {
                        switch (p) {
                          case 'Q1':
                            return '#EF4444'; // Red
                          case 'Q2':
                            return '#F59E0B'; // Orange
                          case 'Q3':
                            return '#3B82F6'; // Blue
                          case 'Q4':
                            return '#6B7280'; // Gray
                          default:
                            return '#6B7280';
                        }
                      };
                      
                      return (
                        <SelectItem key={priority} value={priority}>
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: getPriorityColor(priority) }}
                            />
                            {getPriorityLabel(priority)}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              {/* Role */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Role</label>
                <Select
                  value={formData.roleId || 'none'}
                  onValueChange={(value) => {
                    const selectedRole = roles.find(role => role.id === value);
                    setFormData(prev => ({ 
                      ...prev, 
                      roleId: value === 'none' ? undefined : value,
                      description: selectedRole ? `As a ${selectedRole.name} I need to` : prev.description
                    }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {roles.map(role => (
                      <SelectItem key={role.id} value={role.id}>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: role.color }}
                          />
                          {role.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Type */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Type</label>
                <Select
                  value={formData.type}
                  onValueChange={(value: StoryType) => setFormData(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type...">
                    {formData.type && (
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: settings.storyTypes?.find(t => t.name === formData.type)?.color || '#6B7280' }}
                        />
                        {formData.type}
                      </div>
                    )}
                  </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {getAllStoryTypes().map(type => (
                      <SelectItem key={type.name} value={type.name}>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: type.color }}
                          />
                          {type.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              {/* Weight and Size in a row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Weight</label>
                  <Select
                    value={formData.weight?.toString()}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, weight: parseInt(value) as Story['weight'] }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {weights.map(weight => {
                        const gradientColor = getWeightGradientColor(weight, settings.weightBaseColor, 21);
                        return (
                          <SelectItem key={weight} value={weight.toString()}>
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-3 h-3 rounded border"
                                style={{ backgroundColor: gradientColor }}
                              />
                              {weight}
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Size</label>
                  <Select
                    value={formData.size}
                    onValueChange={(value: Story['size']) => setFormData(prev => ({ ...prev, size: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue>
                        {formData.size && (
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: settings.storySizes?.find(s => s.name === formData.size)?.color || '#6B7280' }}
                            />
                            <span>{formData.size}</span>
                            {settings.storySizes?.find(s => s.name === formData.size)?.timeEstimate && (
                              <span className="text-muted-foreground text-xs">
                                ({settings.storySizes.find(s => s.name === formData.size)?.timeEstimate})
                              </span>
                            )}
                          </div>
                        )}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {(settings.storySizes || []).map(size => (
                        <SelectItem key={size.name} value={size.name}>
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: size.color }}
                            />
                            <span>{size.name}</span>
                            <span className="text-muted-foreground text-xs">({size.timeEstimate})</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Vision */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Vision</label>
                <Select
                  value={formData.visionId || 'none'}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, visionId: value === 'none' ? undefined : value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select vision...">
                      {formData.visionId && (
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ 
                              backgroundColor: settings.visionTypes?.find(vt => vt.name === visions.find(v => v.id === formData.visionId)?.type)?.color || '#6B7280'
                            }}
                          />
                          {visions.find(v => v.id === formData.visionId)?.title}
                        </div>
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {visions.map(vision => (
                      <SelectItem key={vision.id} value={vision.id}>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ 
                              backgroundColor: settings.visionTypes?.find(vt => vt.name === vision.type)?.color || '#6B7280'
                            }}
                          />
                          {vision.title}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Additional Details */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-muted-foreground">Additional Details</h3>
            </div>
            
            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={formData.description || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter story description..."
                rows={3}
              />
            </div>

            {/* Sprint and Due Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Sprint</label>
                <Select
                  value={formData.sprintId || 'none'}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, sprintId: value === 'none' ? undefined : value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sprint..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Sprint</SelectItem>
                    {sprints.map((sprint) => (
                      <SelectItem key={sprint.id} value={sprint.id}>
                        <div className="flex flex-col">
                          <span className="font-medium text-sm">
                            Week {sprint.isoWeek} - {sprint.year}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(sprint.startDate).toLocaleDateString()} - {new Date(sprint.endDate).toLocaleDateString()}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Due Date</label>
                <Input
                  type="date"
                  value={formData.dueDate || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                />
              </div>
            </div>

            {/* Repeat Weekly */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="repeatWeekly"
                  checked={repeatWeekly}
                  onChange={(e) => setRepeatWeekly(e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="repeatWeekly" className="text-sm font-medium">
                  Repeat every week
                </label>
              </div>
              {repeatWeekly && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">End Date (Optional)</label>
                  <Input
                    type="date"
                    value={repeatEndDate}
                    onChange={(e) => setRepeatEndDate(e.target.value)}
                    placeholder="Leave empty to repeat indefinitely"
                  />
                </div>
              )}
            </div>

            {/* Labels */}
            {labels.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Labels</label>
                <div className="flex flex-wrap gap-2">
                  {labels.map(label => (
                    <Badge
                      key={label.id}
                      variant={formData.labels?.includes(label.id) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => handleLabelToggle(label.id)}
                    >
                      {label.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button type="submit" disabled={!formData.title?.trim()} className="w-full sm:w-auto">
              Add Story
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
