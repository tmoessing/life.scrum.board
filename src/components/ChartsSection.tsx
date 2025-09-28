import React from 'react';
import { useAtom } from 'jotai';
import { burndownCollapsedAtom, burnupCollapsedAtom } from '@/stores/appStore';
import { BurndownChart } from '@/components/BurndownChart';
import { BurnupChart } from '@/components/BurnupChart';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronDown, ChevronUp, BarChart3 } from 'lucide-react';

export function ChartsSection() {
  const [burndownCollapsed, setBurndownCollapsed] = useAtom(burndownCollapsedAtom);
  const [burnupCollapsed, setBurnupCollapsed] = useAtom(burnupCollapsedAtom);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <BarChart3 className="h-5 w-5" />
        <h3 className="text-lg font-semibold">Charts</h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Burndown Chart */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Burndown Chart</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setBurndownCollapsed(!burndownCollapsed)}
                className="h-6 w-6 p-0"
              >
                {burndownCollapsed ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronUp className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardHeader>
          {!burndownCollapsed && (
            <CardContent>
              <BurndownChart />
            </CardContent>
          )}
        </Card>

        {/* Burnup Chart */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Burnup Chart</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setBurnupCollapsed(!burnupCollapsed)}
                className="h-6 w-6 p-0"
              >
                {burnupCollapsed ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronUp className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardHeader>
          {!burnupCollapsed && (
            <CardContent>
              <BurnupChart />
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}
