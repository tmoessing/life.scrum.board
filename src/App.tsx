import React, { useEffect } from 'react';
import { Provider } from 'jotai';
import { Header } from '@/components/Header';
import { SprintView } from '@/components/views/SprintView';
import { StoryBoardsView } from '@/components/views/StoryBoardsView';
import { ImportanceView } from '@/components/views/ImportanceView';
import { PlannerView } from '@/components/views/PlannerView';
import { SprintPlanningView } from '@/components/views/SprintPlanningView';
import { SettingsView } from '@/components/views/SettingsView';
import { useAtom } from 'jotai';
import { currentViewAtom, settingsAtom } from '@/stores/appStore';

function AppContent() {
  const [currentView] = useAtom(currentViewAtom);
  const [settings, setSettings] = useAtom(settingsAtom);

  // Migration: Ensure storySizes and visionTypes exist
  useEffect(() => {
    if (!settings.storySizes) {
      setSettings(prev => ({
        ...prev,
        storySizes: [
          { name: 'XS', color: '#10B981', timeEstimate: '15 min' },
          { name: 'S', color: '#3B82F6', timeEstimate: '30 min' },
          { name: 'M', color: '#F59E0B', timeEstimate: '1 hour' },
          { name: 'L', color: '#EF4444', timeEstimate: '2-4 hours' },
          { name: 'XL', color: '#8B5CF6', timeEstimate: '1+ days' }
        ]
      }));
    }
    if (!settings.visionTypes) {
      setSettings(prev => ({
        ...prev,
        visionTypes: [
          { name: 'Spiritual', color: '#8B5CF6' },
          { name: 'Physical', color: '#EF4444' },
          { name: 'Intellectual', color: '#3B82F6' },
          { name: 'Social', color: '#10B981' }
        ]
      }));
    }
  }, [settings.storySizes, settings.visionTypes, setSettings]);

  const renderView = () => {
    switch (currentView) {
      case 'sprint':
        return <SprintView />;
      case 'story-boards':
        return <StoryBoardsView />;
      case 'importance':
        return <ImportanceView />;
      case 'planner':
        return <PlannerView />;
      case 'sprint-planning':
        return <SprintPlanningView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <SprintView />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-2 sm:px-4 py-4 sm:py-6">
        {renderView()}
      </main>
    </div>
  );
}

function App() {
  return (
    <Provider>
      <AppContent />
    </Provider>
  );
}

export default App;
