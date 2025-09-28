import { useState } from 'react';
import { useAtom } from 'jotai';
import { storiesAtom, rolesAtom, visionsAtom } from '@/stores/appStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Brain, Clock, Target } from 'lucide-react';
import type { BrainLevel, TimeBucket, Priority } from '@/types';
import { getBrainLevelWeights, getPriorityOrder } from '@/utils';

export function PlannerView() {
  const [stories] = useAtom(storiesAtom);
  const [roles] = useAtom(rolesAtom);
  // const [labels] = useAtom(labelsAtom);
  const [visions] = useAtom(visionsAtom);

  const [selectedBrainLevel, setSelectedBrainLevel] = useState<BrainLevel>('moderate');
  const [selectedTimeBucket, setSelectedTimeBucket] = useState<TimeBucket>('M');

  const getFilteredStories = () => {
    const brainWeights = getBrainLevelWeights(selectedBrainLevel);
    
    return stories
      .filter(story => !story.deleted)
      .filter(story => brainWeights.includes(story.weight))
      .filter(story => story.size === selectedTimeBucket)
      .sort((a, b) => {
        // Sort by priority first, then by weight (descending)
        const priorityOrderA = getPriorityOrder(a.priority);
        const priorityOrderB = getPriorityOrder(b.priority);
        
        if (priorityOrderA !== priorityOrderB) {
          return priorityOrderA - priorityOrderB;
        }
        
        return b.weight - a.weight;
      });
  };

  const filteredStories = getFilteredStories();
  const storiesByPriority = filteredStories.reduce((acc, story) => {
    if (!acc[story.priority]) {
      acc[story.priority] = [];
    }
    acc[story.priority].push(story);
    return acc;
  }, {} as Record<Priority, typeof filteredStories>);

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case 'Q1':
        return 'bg-red-50 border-red-200';
      case 'Q2':
        return 'bg-orange-50 border-orange-200';
      case 'Q3':
        return 'bg-yellow-50 border-yellow-200';
      case 'Q4':
        return 'bg-gray-50 border-gray-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getWeightColor = (weight: number) => {
    if (weight <= 3) return 'bg-green-100 text-green-800';
    if (weight <= 8) return 'bg-yellow-100 text-yellow-800';
    if (weight <= 13) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Brain className="h-6 w-6" />
        <h2 className="text-2xl font-bold">Planner</h2>
      </div>

      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Current State
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Brain Level</label>
              <Select value={selectedBrainLevel} onValueChange={(value: BrainLevel) => setSelectedBrainLevel(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low (1-3 weight)</SelectItem>
                  <SelectItem value="moderate">Moderate (5-8 weight)</SelectItem>
                  <SelectItem value="high">High (8-21 weight)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Time Available</label>
              <Select value={selectedTimeBucket} onValueChange={(value: TimeBucket) => setSelectedTimeBucket(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="XS">XS (15-30 min)</SelectItem>
                  <SelectItem value="S">S (30-60 min)</SelectItem>
                  <SelectItem value="M">M (1-2 hours)</SelectItem>
                  <SelectItem value="L">L (2-4 hours)</SelectItem>
                  <SelectItem value="XL">XL (4+ hours)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Recommended Stories</h3>
          <Badge variant="secondary">
            {filteredStories.length} stories
          </Badge>
        </div>

        {Object.keys(storiesByPriority).length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">No stories match your current state</p>
              <p className="text-sm text-muted-foreground">Try adjusting your brain level or time available</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {Object.entries(storiesByPriority)
              .sort(([a], [b]) => getPriorityOrder(a as Priority) - getPriorityOrder(b as Priority))
              .map(([priority, priorityStories]) => (
                <Card key={priority} className={getPriorityColor(priority as Priority)}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">{priority} Priority</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {priorityStories.map((story) => {
                      const role = roles.find(r => r.id === story.roleId);
                      const vision = visions.find(v => v.id === story.visionId);
                      
                      return (
                        <div
                          key={story.id}
                          className="p-3 bg-background rounded border cursor-pointer hover:shadow-sm transition-shadow"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-medium text-sm flex-1">{story.title}</h4>
                            <div className="flex gap-1">
                              <Badge variant="outline" className={`text-xs ${getWeightColor(story.weight)}`}>
                                {story.weight}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {story.size}
                              </Badge>
                            </div>
                          </div>
                          
                          {story.description && (
                            <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                              {story.description}
                            </p>
                          )}
                          
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            {role && <span>{role.name}</span>}
                            {vision && <span>• {vision.title}</span>}
                          </div>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
