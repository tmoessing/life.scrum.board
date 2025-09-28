import React, { useState } from 'react';
import { useAtom } from 'jotai';
import { 
  rolesAtom, 
  labelsAtom, 
  settingsAtom, 
  storiesAtom,
  safeSprintsAtom,
  visionsAtom,
  columnsAtom,
  boardsAtom,
  exportDataAtom,
  importDataAtom,
  addRoleAtom, 
  updateRoleAtom, 
  deleteRoleAtom,
  addLabelAtom,
  updateLabelAtom,
  deleteLabelAtom
} from '@/stores/appStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit, Trash2, Palette, Users, Tag, Settings as SettingsIcon, Weight, AlertTriangle, Download, Upload, Database } from 'lucide-react';
import { getWeightGradientColor, exportAllData, importAllData, createBackupBeforeImport } from '@/utils';


export function SettingsView() {
  const [roles, setRoles] = useAtom(rolesAtom);
  const [labels, setLabels] = useAtom(labelsAtom);
  const [settings, setSettings] = useAtom(settingsAtom);
  const [stories, setStories] = useAtom(storiesAtom);
  const [sprints, setSprints] = useAtom(safeSprintsAtom);
  const [visions, setVisions] = useAtom(visionsAtom);
  const [columns, setColumns] = useAtom(columnsAtom);
  const [boards, setBoards] = useAtom(boardsAtom);
  const [exportData] = useAtom(exportDataAtom);
  const [, importData] = useAtom(importDataAtom);
  
  const [, addRole] = useAtom(addRoleAtom);
  const [, updateRole] = useAtom(updateRoleAtom);
  const [, deleteRole] = useAtom(deleteRoleAtom);
  const [, addLabel] = useAtom(addLabelAtom);
  const [, updateLabel] = useAtom(updateLabelAtom);
  const [, deleteLabel] = useAtom(deleteLabelAtom);


  const handleAddRole = () => {
    addRole({
      name: 'New Role',
      color: '#3B82F6'
    });
  };

  const handleAddLabel = () => {
    addLabel({
      name: 'new-label',
      color: '#3B82F6'
    });
  };

  const [showAddTypeForm, setShowAddTypeForm] = useState(false);
  const [newTypeName, setNewTypeName] = useState('');
  const [newTypeColor, setNewTypeColor] = useState('#3B82F6');
  
  const [editingRole, setEditingRole] = useState<string | null>(null);
  const [editingLabel, setEditingLabel] = useState<string | null>(null);
  const [editingType, setEditingType] = useState<number | null>(null);
  
  // Backup/restore state
  const [importMode, setImportMode] = useState<'overwrite' | 'merge'>('overwrite');
  const [isImporting, setIsImporting] = useState(false);
  const [createBackup, setCreateBackup] = useState(true);

  const handleAddType = () => {
    setShowAddTypeForm(true);
    setNewTypeName('');
    setNewTypeColor('#3B82F6');
  };

  const handleSaveNewType = () => {
    if (newTypeName.trim()) {
      setSettings({
        ...settings,
        storyTypes: [...(settings.storyTypes || []), { 
          name: newTypeName.trim(), 
          color: newTypeColor 
        }]
      });
      setShowAddTypeForm(false);
      setNewTypeName('');
      setNewTypeColor('#3B82F6');
    }
  };

  const handleCancelNewType = () => {
    setShowAddTypeForm(false);
    setNewTypeName('');
    setNewTypeColor('#3B82F6');
  };

  const handleUpdateRole = (roleId: string, updates: Partial<typeof roles[0]>) => {
    updateRole(roleId, updates);
  };

  const handleUpdateLabel = (labelId: string, updates: Partial<typeof labels[0]>) => {
    updateLabel(labelId, updates);
  };

  const handleDeleteRole = (roleId: string) => {
    if (confirm('Are you sure you want to delete this role?')) {
      deleteRole(roleId);
    }
  };

  const handleDeleteLabel = (labelId: string) => {
    if (confirm('Are you sure you want to delete this label?')) {
      deleteLabel(labelId);
    }
  };

  // Backup/restore handlers
  const handleDownloadData = () => {
    exportAllData(exportData);
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    
    try {
      // Create safety backup first (only if user wants it and there are active stories)
      if (createBackup) {
        const currentActiveStories = stories.filter(story => !story.deleted);
        if (currentActiveStories.length > 0) {
          createBackupBeforeImport();
        }
      }
      
      const { data: importedData } = await importAllData(file);
      
      if (importMode === 'overwrite') {
        // For overwrite mode, import all data but preserve deleted stories
        const existingDeletedStories = stories.filter(story => story.deleted);
        const allStories = [...(importedData.stories || []), ...existingDeletedStories];
        
        // Use the importDataAtom to set all data at once
        importData({
          stories: allStories,
          sprints: importedData.sprints || [],
          roles: importedData.roles || [],
          labels: importedData.labels || [],
          visions: importedData.visions || [],
          columns: importedData.columns || [],
          boards: importedData.boards || [],
          settings: importedData.settings || {}
        });
        
        // Force a small delay to ensure state updates
        setTimeout(() => {
          alert(`Successfully imported all data (overwrite mode). Stories: ${importedData.stories?.length || 0}, Roles: ${importedData.roles?.length || 0}, Labels: ${importedData.labels?.length || 0}, Visions: ${importedData.visions?.length || 0}`);
        }, 100);
      } else {
        // Merge mode - merge stories but replace other data
        const existingStories = [...stories];
        const storyMap = new Map();
        
        // Add existing stories to map
        existingStories.forEach(story => {
          storyMap.set(story.id, story);
        });
        
        // Merge imported stories, keeping the newest version
        (importedData.stories || []).forEach(importedStory => {
          const existing = storyMap.get(importedStory.id);
          if (existing) {
            // Compare updatedAt timestamps
            const existingTime = new Date(existing.updatedAt || existing.createdAt || 0).getTime();
            const importedTime = new Date(importedStory.updatedAt || importedStory.createdAt || 0).getTime();
            
            if (importedTime >= existingTime) {
              storyMap.set(importedStory.id, importedStory);
            }
          } else {
            storyMap.set(importedStory.id, importedStory);
          }
        });
        
        const mergedStories = Array.from(storyMap.values());
        const activeCount = mergedStories.filter(story => !story.deleted).length;
        
        // Use the importDataAtom to set all data at once
        importData({
          stories: mergedStories,
          sprints: importedData.sprints || [],
          roles: importedData.roles || [],
          labels: importedData.labels || [],
          visions: importedData.visions || [],
          columns: importedData.columns || [],
          boards: importedData.boards || [],
          settings: importedData.settings || {}
        });
        
        // Force a small delay to ensure state updates
        setTimeout(() => {
          alert(`Successfully merged data. Active stories: ${activeCount}, Roles: ${importedData.roles?.length || 0}, Labels: ${importedData.labels?.length || 0}, Visions: ${importedData.visions?.length || 0}`);
        }, 100);
      }
    } catch (error) {
      alert(`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsImporting(false);
      // Reset file input
      event.target.value = '';
    }
  };


  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <SettingsIcon className="h-6 w-6" />
        <h2 className="text-2xl font-bold">Settings</h2>
      </div>

      <Tabs defaultValue="priorities" className="space-y-4">
        <TabsList className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 w-full">
          <TabsTrigger value="priorities" className="text-xs">Priorities</TabsTrigger>
          <TabsTrigger value="roles" className="text-xs">Roles</TabsTrigger>
          <TabsTrigger value="types" className="text-xs">Types</TabsTrigger>
          <TabsTrigger value="labels" className="text-xs">Labels</TabsTrigger>
          <TabsTrigger value="sizes" className="text-xs">Sizes</TabsTrigger>
          <TabsTrigger value="weights" className="text-xs">Weights</TabsTrigger>
          <TabsTrigger value="backup" className="text-xs">Data Backup</TabsTrigger>
        </TabsList>

        <TabsContent value="priorities" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Priority Colors
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Customize the colors for priority levels (Q1-Q4)
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                {(['Q1', 'Q2', 'Q3', 'Q4'] as const).map((priority) => (
                  <div key={priority} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge 
                        variant="outline" 
                        className="text-sm"
                        style={{
                          backgroundColor: `${settings.priorityColors[priority]}20`,
                          color: settings.priorityColors[priority],
                          borderColor: `${settings.priorityColors[priority]}40`
                        }}
                      >
                        {priority}
                      </Badge>
                      <span className="text-sm font-medium">
                        {priority === 'Q1' && 'Urgent & Important'}
                        {priority === 'Q2' && 'Important, Not Urgent'}
                        {priority === 'Q3' && 'Urgent, Not Important'}
                        {priority === 'Q4' && 'Not Urgent, Not Important'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={settings.priorityColors[priority]}
                        onChange={(e) => setSettings({
                          ...settings,
                          priorityColors: {
                            ...settings.priorityColors,
                            [priority]: e.target.value
                          }
                        })}
                        className="w-10 h-8 rounded border cursor-pointer"
                      />
                      <span className="text-sm text-muted-foreground w-16">
                        {settings.priorityColors[priority]}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Priority Color Preview:</h4>
                <div className="flex gap-2 flex-wrap">
                  {(['Q1', 'Q2', 'Q3', 'Q4'] as const).map(priority => (
                    <div key={priority} className="flex items-center gap-2 p-2 border rounded">
                      <div 
                        className="w-4 h-4 rounded border"
                        style={{ backgroundColor: settings.priorityColors[priority] }}
                      />
                      <span className="text-xs">{priority}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Roles
                </CardTitle>
                <Button onClick={handleAddRole} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Role
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {roles.map((role) => (
                <div key={role.id} className="flex items-center gap-3 p-3 border rounded">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: role.color }}
                  />
                  {editingRole === role.id ? (
                    <Input
                      defaultValue={role.name}
                      onBlur={(e) => {
                        if (e.target.value.trim()) {
                          handleUpdateRole(role.id, { name: e.target.value.trim() });
                        }
                        setEditingRole(null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          if (e.currentTarget.value.trim()) {
                            handleUpdateRole(role.id, { name: e.currentTarget.value.trim() });
                          }
                          setEditingRole(null);
                        } else if (e.key === 'Escape') {
                          setEditingRole(null);
                        }
                      }}
                      autoFocus
                      className="flex-1"
                    />
                  ) : (
                    <span className="flex-1">{role.name}</span>
                  )}
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={role.color}
                      onChange={(e) => handleUpdateRole(role.id, { color: e.target.value })}
                      className="w-8 h-8 rounded border cursor-pointer"
                    />
                    <span className="text-sm text-muted-foreground w-16">
                      {role.color}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingRole(role.id)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteRole(role.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="labels" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-5 w-5" />
                  Labels
                </CardTitle>
                <Button onClick={handleAddLabel} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Label
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {labels.map((label) => (
                <div key={label.id} className="flex items-center gap-3 p-3 border rounded">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: label.color }}
                  />
                  {editingLabel === label.id ? (
                    <Input
                      defaultValue={label.name}
                      onBlur={(e) => {
                        if (e.target.value.trim()) {
                          handleUpdateLabel(label.id, { name: e.target.value.trim() });
                        }
                        setEditingLabel(null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          if (e.currentTarget.value.trim()) {
                            handleUpdateLabel(label.id, { name: e.currentTarget.value.trim() });
                          }
                          setEditingLabel(null);
                        } else if (e.key === 'Escape') {
                          setEditingLabel(null);
                        }
                      }}
                      autoFocus
                      className="flex-1"
                    />
                  ) : (
                    <span className="flex-1">{label.name}</span>
                  )}
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={label.color}
                      onChange={(e) => handleUpdateLabel(label.id, { color: e.target.value })}
                      className="w-8 h-8 rounded border cursor-pointer"
                    />
                    <span className="text-sm text-muted-foreground w-16">
                      {label.color}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingLabel(label.id)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteLabel(label.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="types" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-5 w-5" />
                  Story Types
                </CardTitle>
                <Button onClick={handleAddType} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Type
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {(settings.storyTypes || []).map((type, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 border rounded">
                    <div 
                      className="w-4 h-4 rounded-full border-2 border-gray-300" 
                      style={{ backgroundColor: type.color }}
                    />
                    {editingType === index ? (
                      <Input
                        defaultValue={type.name}
                        onBlur={(e) => {
                          if (e.target.value.trim()) {
                            const newTypes = [...(settings.storyTypes || [])];
                            newTypes[index] = { ...type, name: e.target.value.trim() };
                            setSettings({ ...settings, storyTypes: newTypes });
                          }
                          setEditingType(null);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            if (e.currentTarget.value.trim()) {
                              const newTypes = [...(settings.storyTypes || [])];
                              newTypes[index] = { ...type, name: e.currentTarget.value.trim() };
                              setSettings({ ...settings, storyTypes: newTypes });
                            }
                            setEditingType(null);
                          } else if (e.key === 'Escape') {
                            setEditingType(null);
                          }
                        }}
                        autoFocus
                        className="flex-1"
                      />
                    ) : (
                      <span className="flex-1">{type.name}</span>
                    )}
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={type.color}
                        onChange={(e) => {
                          const newTypes = [...(settings.storyTypes || [])];
                          newTypes[index] = { ...type, color: e.target.value };
                          setSettings({ ...settings, storyTypes: newTypes });
                        }}
                        className="w-8 h-8 rounded border cursor-pointer"
                      />
                      <span className="text-sm text-muted-foreground w-16">
                        {type.color}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingType(index)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const newTypes = (settings.storyTypes || []).filter((_, i) => i !== index);
                          setSettings({ ...settings, storyTypes: newTypes });
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                
                {showAddTypeForm && (
                  <div className="flex items-center gap-3 p-3 border rounded border-dashed border-blue-300 bg-blue-50">
                    <div 
                      className="w-4 h-4 rounded-full border-2 border-gray-300" 
                      style={{ backgroundColor: newTypeColor }}
                    />
                    <Input
                      placeholder="Enter type name..."
                      value={newTypeName}
                      onChange={(e) => setNewTypeName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleSaveNewType();
                        } else if (e.key === 'Escape') {
                          handleCancelNewType();
                        }
                      }}
                      autoFocus
                      className="flex-1"
                    />
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={newTypeColor}
                        onChange={(e) => setNewTypeColor(e.target.value)}
                        className="w-8 h-8 rounded border cursor-pointer"
                      />
                      <span className="text-sm text-muted-foreground w-16">
                        {newTypeColor}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleSaveNewType}
                        disabled={!newTypeName.trim()}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCancelNewType}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sizes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Story Sizes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {(settings.storySizes || []).map((size, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 border rounded">
                    <div 
                      className="w-4 h-4 rounded-full border-2 border-gray-300" 
                      style={{ backgroundColor: size.color }}
                    />
                    <span className="flex-1">{size.name}</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={size.timeEstimate}
                        onChange={(e) => {
                          const newSizes = [...(settings.storySizes || [])];
                          newSizes[index] = { ...size, timeEstimate: e.target.value };
                          setSettings({ ...settings, storySizes: newSizes });
                        }}
                        className="w-24 px-2 py-1 text-sm border rounded"
                        placeholder="Time estimate"
                      />
                    </div>
                    <div className="flex gap-1">
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={size.color}
                          onChange={(e) => {
                            const newSizes = [...(settings.storySizes || [])];
                            newSizes[index] = { ...size, color: e.target.value };
                            setSettings({ ...settings, storySizes: newSizes });
                          }}
                          className="w-8 h-8 rounded border cursor-pointer"
                        />
                        <span className="text-sm text-muted-foreground w-16">
                          {size.color}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const newName = prompt('Enter new name:', size.name);
                          if (newName && newName.trim()) {
                            const newSizes = [...(settings.storySizes || [])];
                            newSizes[index] = { ...size, name: newName.trim() };
                            setSettings({ ...settings, storySizes: newSizes });
                          }
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const newEstimate = prompt('Enter time estimate:', size.timeEstimate);
                          if (newEstimate && newEstimate.trim()) {
                            const newSizes = [...(settings.storySizes || [])];
                            newSizes[index] = { ...size, timeEstimate: newEstimate.trim() };
                            setSettings({ ...settings, storySizes: newSizes });
                          }
                        }}
                      >
                        <SettingsIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const newSizes = (settings.storySizes || []).filter((_, i) => i !== index);
                          setSettings({ ...settings, storySizes: newSizes });
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                <div className="flex gap-2">
                  <Input
                    placeholder="Add new size name..."
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const input = e.target as HTMLInputElement;
                        if (input.value.trim()) {
                          setSettings({
                            ...settings,
                            storySizes: [...(settings.storySizes || []), { 
                              name: input.value.trim(), 
                              color: '#6B7280',
                              timeEstimate: '1 hour'
                            }]
                          });
                          input.value = '';
                        }
                      }
                    }}
                  />
                  <Button
                    onClick={(e) => {
                      const input = e.currentTarget.parentElement?.querySelector('input') as HTMLInputElement;
                      if (input && input.value.trim()) {
                        setSettings({
                          ...settings,
                          storySizes: [...(settings.storySizes || []), { 
                            name: input.value.trim(), 
                            color: '#6B7280',
                            timeEstimate: '1 hour'
                          }]
                        });
                        input.value = '';
                      }
                    }}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="weights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Weight className="h-5 w-5" />
                Weight Gradient Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <label className="text-sm font-medium w-24">Base Color:</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={settings.weightBaseColor}
                      onChange={(e) => setSettings({ ...settings, weightBaseColor: e.target.value })}
                      className="w-10 h-8 rounded border cursor-pointer"
                    />
                    <span className="text-sm text-muted-foreground">{settings.weightBaseColor}</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Weight Gradient Preview:</h4>
                <div className="flex gap-2 flex-wrap">
                  {[1, 3, 5, 8, 13, 21].map(weight => {
                    const gradientColor = getWeightGradientColor(weight, settings.weightBaseColor, 21);
                    return (
                      <div key={weight} className="flex items-center gap-2 p-2 border rounded">
                        <div 
                          className="w-4 h-4 rounded border"
                          style={{ backgroundColor: gradientColor }}
                        />
                        <span className="text-xs">{weight}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backup" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Data Backup & Restore
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Export your stories to a JSON file or import from a backup
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Export Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium">Export Data</h3>
                    <p className="text-sm text-muted-foreground">
                      Download all your stories as a JSON backup file
                    </p>
                  </div>
                  <Button onClick={handleDownloadData} className="flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Download Data
                  </Button>
                </div>
                <div className="text-sm text-muted-foreground">
                  <p>• File will be named: backup-YYYY-MM-DDTHH-mm-ss.json</p>
                  <p>• Contains: {stories.filter(story => !story.deleted).length} active stories, {roles.length} roles, {labels.length} labels, {visions.length} visions</p>
                  <p>• Includes: All settings, priorities, types, sizes, weights, and board configurations</p>
                </div>
              </div>

              {/* Import Section */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium">Import Data</h3>
                  <p className="text-sm text-muted-foreground">
                    Import all app data from a JSON backup file
                  </p>
                </div>
                
                {/* Import Mode Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Import Mode:</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="importMode"
                        value="overwrite"
                        checked={importMode === 'overwrite'}
                        onChange={(e) => setImportMode(e.target.value as 'overwrite' | 'merge')}
                      />
                      <span className="text-sm">Overwrite (replace all current data)</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="importMode"
                        value="merge"
                        checked={importMode === 'merge'}
                        onChange={(e) => setImportMode(e.target.value as 'overwrite' | 'merge')}
                      />
                      <span className="text-sm">Merge (merge stories, replace other data)</span>
                    </label>
                  </div>
                </div>

                {/* Safety Backup Option */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={createBackup}
                      onChange={(e) => setCreateBackup(e.target.checked)}
                    />
                    <span className="text-sm font-medium">Create safety backup before import</span>
                  </label>
                  <p className="text-xs text-muted-foreground ml-6">
                    Automatically download a backup of current stories before importing
                  </p>
                </div>

                {/* File Input */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Select JSON file:</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleFileSelect}
                      disabled={isImporting}
                      className="flex-1"
                    />
                    {isImporting && (
                      <div className="text-sm text-muted-foreground">
                        Importing...
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-sm text-muted-foreground space-y-1">
                  <p>• Supported formats: Full backup files or legacy story-only files</p>
                  <p>• Includes: Stories, roles, labels, visions, settings, priorities, types, sizes, weights</p>
                  <p>• Safety backup is optional (checkbox above)</p>
                  <p>• Invalid files will be rejected with an error message</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
}
