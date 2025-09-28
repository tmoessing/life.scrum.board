import React, { useState } from 'react';
import { useAtom } from 'jotai';
import { currentViewAtom } from '@/stores/appStore';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AddStoryModal } from '@/components/AddStoryModal';
import { Plus } from 'lucide-react';
import type { ViewType } from '@/types';

const viewLabels: Record<ViewType, string> = {
  'sprint': 'Sprint View',
  'story-boards': 'Story Boards',
  'importance': 'Importance',
  'planner': 'Planner',
  'sprint-planning': 'Sprint Planning',
  'settings': 'Settings'
};

export function Header() {
  const [currentView, setCurrentView] = useAtom(currentViewAtom);
  const [showAddStoryModal, setShowAddStoryModal] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-14 sm:h-16 items-center justify-between px-2 sm:px-4">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <h1 className="text-lg sm:text-xl font-bold truncate">Life Scrum Board</h1>
            <div className="hidden sm:block">
              <Tabs value={currentView} onValueChange={(value) => setCurrentView(value as ViewType)}>
                <TabsList className="grid grid-cols-3 lg:grid-cols-6">
                  {Object.entries(viewLabels).map(([key, label]) => (
                    <TabsTrigger key={key} value={key} className="text-xs">
                      <span className="hidden lg:inline">{label}</span>
                      <span className="lg:hidden">{label.split(' ')[0]}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>
          </div>
          
          <div className="flex items-center space-x-1 sm:space-x-2">
            <Button 
              size="sm" 
              className="gap-1 sm:gap-2 text-xs sm:text-sm touch-target"
              onClick={() => setShowAddStoryModal(true)}
            >
              <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline">Add Story</span>
              <span className="xs:hidden">Add</span>
            </Button>
          </div>
        </div>
        
        {/* Mobile Navigation */}
        <div className="sm:hidden border-t bg-background/95 backdrop-blur">
          <Tabs value={currentView} onValueChange={(value) => setCurrentView(value as ViewType)}>
            <TabsList className="grid grid-cols-3 w-full h-12">
              {Object.entries(viewLabels).slice(0, 3).map(([key, label]) => (
                <TabsTrigger key={key} value={key} className="text-xs">
                  {label.split(' ')[0]}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          <Tabs value={currentView} onValueChange={(value) => setCurrentView(value as ViewType)}>
            <TabsList className="grid grid-cols-3 w-full h-12">
              {Object.entries(viewLabels).slice(3).map(([key, label]) => (
                <TabsTrigger key={key} value={key} className="text-xs">
                  {label.split(' ')[0]}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </header>
      
      <AddStoryModal 
        open={showAddStoryModal} 
        onOpenChange={setShowAddStoryModal} 
      />
    </>
  );
}
