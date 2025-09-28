import { useState } from 'react';
import { useAtom } from 'jotai';
import { visionsAtom, reorderVisionsAtom, addVisionAtom, updateVisionAtom, deleteVisionAtom, settingsAtom } from '@/stores/appStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, GripVertical, Target, Edit2, Trash2, Check, X } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function SortableVision({ 
  vision, 
  index, 
  onDelete, 
  onUpdate, 
  visionTypes 
}: { 
  vision: any; 
  index: number;
  onDelete: (visionId: string) => void;
  onUpdate: (visionId: string, updates: any) => void;
  visionTypes: any[];
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(vision.title);
  const [editDescription, setEditDescription] = useState(vision.description || '');
  const [editType, setEditType] = useState(vision.type);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: vision.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleSave = () => {
    if (editTitle.trim()) {
      onUpdate(vision.id, { 
        title: editTitle.trim(), 
        description: editDescription.trim(),
        type: editType 
      });
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditTitle(vision.title);
    setEditDescription(vision.description || '');
    setEditType(vision.type);
    setIsEditing(false);
  };

  const getVisionTypeColor = (type: string) => {
    const visionType = visionTypes.find(vt => vt.name === type);
    return visionType?.color || '#6B7280';
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`${isDragging ? 'opacity-50' : ''}`}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing"
          >
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </div>
          
          {/* Ranking Number */}
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold">
            {index + 1}
          </div>

          <div className="flex-1">
            {isEditing ? (
              <div className="space-y-2">
                <Input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="text-sm"
                  placeholder="Vision title..."
                />
                <Textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="text-sm resize-none"
                  placeholder="Short description (optional)..."
                  rows={2}
                />
                <Select value={editType} onValueChange={setEditType}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {visionTypes.map(type => (
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
                <div className="flex gap-1">
                  <Button size="sm" onClick={handleSave} className="h-6 px-2">
                    <Check className="h-3 w-3" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleCancel} className="h-6 px-2">
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                <h3 className="font-medium">{vision.title}</h3>
                {vision.description && (
                  <p className="text-sm text-muted-foreground mt-1">{vision.description}</p>
                )}
                <Badge 
                  variant="outline" 
                  className="mt-1"
                  style={{ 
                    borderColor: getVisionTypeColor(vision.type),
                    color: getVisionTypeColor(vision.type)
                  }}
                >
                  <div 
                    className="w-2 h-2 rounded-full mr-1" 
                    style={{ backgroundColor: getVisionTypeColor(vision.type) }}
                  />
                  {vision.type}
                </Badge>
              </div>
            )}
          </div>

          {!isEditing && (
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsEditing(true)}
                className="h-8 w-8 p-0"
              >
                <Edit2 className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onDelete(vision.id)}
                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function ImportanceView() {
  const [visions, setVisions] = useAtom(visionsAtom);
  const [, reorderVisions] = useAtom(reorderVisionsAtom);
  const [, addVision] = useAtom(addVisionAtom);
  const [, updateVision] = useAtom(updateVisionAtom);
  const [, deleteVision] = useAtom(deleteVisionAtom);
  const [settings] = useAtom(settingsAtom);
  
  const [newVisionTitle, setNewVisionTitle] = useState('');
  const [newVisionDescription, setNewVisionDescription] = useState('');
  const [newVisionType, setNewVisionType] = useState('Intellectual');

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = visions.findIndex((item) => item.id === active.id);
      const newIndex = visions.findIndex((item) => item.id === over.id);

      const reorderedVisions = arrayMove(visions, oldIndex, newIndex);
      setVisions(reorderedVisions);
      reorderVisions(reorderedVisions.map(v => v.id));
    }
  };

  const handleAddVision = () => {
    if (newVisionTitle.trim()) {
      addVision({
        title: newVisionTitle.trim(),
        description: newVisionDescription.trim(),
        type: newVisionType,
        order: visions.length
      });
      setNewVisionTitle('');
      setNewVisionDescription('');
      setNewVisionType('Intellectual');
    }
  };

  const handleUpdateVision = (visionId: string, updates: any) => {
    updateVision(visionId, updates);
  };

  const handleDeleteVision = (visionId: string) => {
    deleteVision(visionId);
  };

  const visionTypes = settings.visionTypes || [
    { name: 'Spiritual', color: '#8B5CF6' },
    { name: 'Physical', color: '#EF4444' },
    { name: 'Intellectual', color: '#3B82F6' },
    { name: 'Social', color: '#10B981' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Target className="h-6 w-6" />
        <h2 className="text-2xl font-bold">Importance</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Visions</CardTitle>
          <p className="text-sm text-muted-foreground">
            Order your visions by importance. Drag to reorder.
          </p>
        </CardHeader>
        <CardContent>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={visions.map(v => v.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {visions
                  .sort((a, b) => a.order - b.order)
                  .map((vision, index) => (
                    <SortableVision 
                      key={vision.id} 
                      vision={vision} 
                      index={index}
                      onDelete={handleDeleteVision}
                      onUpdate={handleUpdateVision}
                      visionTypes={visionTypes}
                    />
                  ))}
              </div>
            </SortableContext>
          </DndContext>

          {/* Add Vision Form */}
          <div className="mt-6 p-4 border-2 border-dashed border-muted rounded-lg">
            <h4 className="font-medium mb-3">Add New Vision</h4>
            <div className="space-y-3">
              <Input
                placeholder="Vision title..."
                value={newVisionTitle}
                onChange={(e) => setNewVisionTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleAddVision();
                  }
                }}
              />
              <Textarea
                placeholder="Short description (optional)..."
                value={newVisionDescription}
                onChange={(e) => setNewVisionDescription(e.target.value)}
                className="resize-none"
                rows={2}
              />
              <Select value={newVisionType} onValueChange={setNewVisionType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select vision type..." />
                </SelectTrigger>
                <SelectContent>
                  {visionTypes.map(type => (
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
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleAddVision}
                  disabled={!newVisionTitle.trim()}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Vision
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
