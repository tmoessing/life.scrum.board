import { useEffect } from 'react';
import { useAtom } from 'jotai';
import { 
  currentViewAtom, 
  chartSectionCollapsedAtom, 
  boardSectionCollapsedAtom, 
  roadmapSectionCollapsedAtom 
} from '@/stores/appStore';

export function useKeyboardShortcuts() {
  const [, setCurrentView] = useAtom(currentViewAtom);
  const [, setChartSectionCollapsed] = useAtom(chartSectionCollapsedAtom);
  const [, setBoardSectionCollapsed] = useAtom(boardSectionCollapsedAtom);
  const [, setRoadmapSectionCollapsed] = useAtom(roadmapSectionCollapsedAtom);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement
      ) {
        return;
      }

      // Check for modifier keys
      const isCtrlOrCmd = event.ctrlKey || event.metaKey;
      const isShift = event.shiftKey;

      switch (event.key.toLowerCase()) {
        case 'n':
          if (!isCtrlOrCmd && !isShift) {
            event.preventDefault();
            // Open Add Story modal
            console.log('Open Add Story modal');
          }
          break;

        case 'f':
          if (!isCtrlOrCmd && !isShift) {
            event.preventDefault();
            // Focus filter bar
            const filterInput = document.querySelector('input[placeholder*="Search stories"]') as HTMLInputElement;
            if (filterInput) {
              filterInput.focus();
            }
          }
          break;

        case 'd':
          if (!isCtrlOrCmd && !isShift) {
            event.preventDefault();
            // Toggle chart section
            setChartSectionCollapsed(prev => !prev);
          }
          break;

        case 'r':
          if (!isCtrlOrCmd && !isShift) {
            event.preventDefault();
            // Toggle roadmap section
            setRoadmapSectionCollapsed(prev => !prev);
          }
          break;

        case 'b':
          if (!isCtrlOrCmd && !isShift) {
            event.preventDefault();
            // Toggle board section
            setBoardSectionCollapsed(prev => !prev);
          }
          break;

        case '?':
          if (!isCtrlOrCmd && !isShift) {
            event.preventDefault();
            // Open help modal
            console.log('Open help modal');
          }
          break;

        case '1':
          if (!isCtrlOrCmd && !isShift) {
            event.preventDefault();
            setCurrentView('sprint');
          }
          break;

        case '2':
          if (!isCtrlOrCmd && !isShift) {
            event.preventDefault();
            setCurrentView('story-boards');
          }
          break;

        case '3':
          if (!isCtrlOrCmd && !isShift) {
            event.preventDefault();
            setCurrentView('importance');
          }
          break;

        case '4':
          if (!isCtrlOrCmd && !isShift) {
            event.preventDefault();
            setCurrentView('planner');
          }
          break;

        case '5':
          if (!isCtrlOrCmd && !isShift) {
            event.preventDefault();
            setCurrentView('settings');
          }
          break;

        case 'escape':
          // Close any open modals or clear selections
          event.preventDefault();
          console.log('Close modals/clear selections');
          break;

        case 'delete':
        case 'backspace':
          // Delete selected stories
          if (!isCtrlOrCmd && !isShift) {
            event.preventDefault();
            console.log('Delete selected stories');
          }
          break;

        case 'enter':
          // Edit focused story
          if (!isCtrlOrCmd && !isShift) {
            event.preventDefault();
            console.log('Edit focused story');
          }
          break;

        case 'arrowup':
        case 'arrowdown':
        case 'arrowleft':
        case 'arrowright':
          // Navigate stories and columns
          if (!isCtrlOrCmd && !isShift) {
            event.preventDefault();
            console.log('Navigate stories');
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    setCurrentView,
    setChartSectionCollapsed,
    setBoardSectionCollapsed,
    setRoadmapSectionCollapsed
  ]);
}
