import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface HelpModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function HelpModal({ open, onOpenChange }: HelpModalProps) {
  const shortcuts = [
    { key: 'N', description: 'Add new Story' },
    { key: 'F', description: 'Focus filter bar' },
    { key: 'D', description: 'Toggle chart section' },
    { key: 'R', description: 'Toggle roadmap section' },
    { key: 'B', description: 'Toggle board section' },
    { key: '?', description: 'Open this help modal' },
    { key: '1-5', description: 'Switch views (Sprint, Story Boards, Importance, Planner, Settings)' },
    { key: 'Esc', description: 'Close modals or clear selections' },
    { key: 'Del', description: 'Delete selected stories' },
    { key: 'Enter', description: 'Edit focused story' },
    { key: '↑↓←→', description: 'Navigate stories and columns' },
  ];

  const multiSelectShortcuts = [
    { key: 'Ctrl/Cmd + Click', description: 'Select multiple stories' },
    { key: 'Shift + Click', description: 'Select range of stories' },
    { key: 'Drag selected', description: 'Move all selected stories' },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts & Help</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* General Shortcuts */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">General Shortcuts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {shortcuts.map((shortcut) => (
                  <div key={shortcut.key} className="flex items-center gap-3">
                    <Badge variant="outline" className="font-mono">
                      {shortcut.key}
                    </Badge>
                    <span className="text-sm">{shortcut.description}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Multi-select Shortcuts */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Multi-select & Navigation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {multiSelectShortcuts.map((shortcut) => (
                  <div key={shortcut.key} className="flex items-center gap-3">
                    <Badge variant="outline" className="font-mono">
                      {shortcut.key}
                    </Badge>
                    <span className="text-sm">{shortcut.description}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Filter Examples */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Filter Examples</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div>
                  <Badge variant="outline" className="font-mono mr-2">weight=3</Badge>
                  <span>Stories with weight 3</span>
                </div>
                <div>
                  <Badge variant="outline" className="font-mono mr-2">priority=Q1</Badge>
                  <span>Q1 priority stories</span>
                </div>
                <div>
                  <Badge variant="outline" className="font-mono mr-2">role=Student</Badge>
                  <span>Stories for Student role</span>
                </div>
                <div>
                  <Badge variant="outline" className="font-mono mr-2">type=Spiritual</Badge>
                  <span>Spiritual type stories</span>
                </div>
                <div>
                  <Badge variant="outline" className="font-mono mr-2">label=workout</Badge>
                  <span>Stories with workout label</span>
                </div>
                <div>
                  <Badge variant="outline" className="font-mono mr-2">sprint=current</Badge>
                  <span>Current sprint stories</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Mobile Tips */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Mobile Usage</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p>• Tap and hold to select multiple stories</p>
                <p>• Swipe to navigate between views</p>
                <p>• Pinch to zoom on charts</p>
                <p>• Use the sticky header for quick access</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
