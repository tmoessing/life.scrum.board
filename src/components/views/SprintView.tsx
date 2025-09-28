import { useAtom } from 'jotai';
import { 
  currentSprintAtom, 
  safeSprintsAtom,
  selectedSprintIdAtom,
  chartSectionCollapsedAtom,
  boardSectionCollapsedAtom,
  roadmapSectionCollapsedAtom,
  chartAboveBoardAtom,
  roadmapPositionAtom
} from '@/stores/appStore';
import { KanbanBoard } from '@/components/KanbanBoard';
import { ChartsSection } from '@/components/ChartsSection';
import { RoadmapSection } from '@/components/RoadmapSection';
import { FilterBar } from '@/components/FilterBar';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronDown, ChevronUp, Layout, Calendar } from 'lucide-react';

export function SprintView() {
  const [currentSprint] = useAtom(currentSprintAtom);
  const [sprints] = useAtom(safeSprintsAtom);
  const [selectedSprintId, setSelectedSprintId] = useAtom(selectedSprintIdAtom);
  // const [storiesByColumn] = useAtom(storiesByColumnAtom);
  const [chartSectionCollapsed, setChartSectionCollapsed] = useAtom(chartSectionCollapsedAtom);
  const [boardSectionCollapsed, setBoardSectionCollapsed] = useAtom(boardSectionCollapsedAtom);
  const [roadmapSectionCollapsed, setRoadmapSectionCollapsed] = useAtom(roadmapSectionCollapsedAtom);
  const [chartAboveBoard, setChartAboveBoard] = useAtom(chartAboveBoardAtom);
  const [roadmapPosition] = useAtom(roadmapPositionAtom);

  const renderSections = () => {
    const sections = [];

    // Add Roadmap section if not collapsed and positioned at top
    if (!roadmapSectionCollapsed && roadmapPosition === 'top') {
      sections.push(
        <div key="roadmap-top" className="mb-6">
          <RoadmapSection />
        </div>
      );
    }

    // Add Charts section if not collapsed and positioned above board
    if (!chartSectionCollapsed && chartAboveBoard) {
      sections.push(
        <div key="charts-above" className="mb-6">
          <ChartsSection />
        </div>
      );
    }

    // Add Board section if not collapsed
    if (!boardSectionCollapsed) {
      sections.push(
        <div key="board" className="mb-6">
          <KanbanBoard />
        </div>
      );
    }

    // Add Charts section if not collapsed and positioned below board
    if (!chartSectionCollapsed && !chartAboveBoard) {
      sections.push(
        <div key="charts-below" className="mb-6">
          <ChartsSection />
        </div>
      );
    }

    // Add Roadmap section if not collapsed and positioned at bottom
    if (!roadmapSectionCollapsed && roadmapPosition === 'bottom') {
      sections.push(
        <div key="roadmap-bottom" className="mb-6">
          <RoadmapSection />
        </div>
      );
    }

    return sections;
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Sprint Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <div>
            <h2 className="text-lg sm:text-2xl font-bold">
              {currentSprint ? `Week ${currentSprint.isoWeek} - ${currentSprint.year}` : 'Current Sprint'}
            </h2>
            {currentSprint && (
              <p className="text-sm text-muted-foreground">
                {new Date(currentSprint.startDate).toLocaleDateString()} - {new Date(currentSprint.endDate).toLocaleDateString()}
              </p>
            )}
          </div>
          
          {/* Sprint Selector */}
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <Select value={selectedSprintId} onValueChange={setSelectedSprintId}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Select Sprint" />
              </SelectTrigger>
              <SelectContent>
                {sprints.map((sprint) => (
                  <SelectItem key={sprint.id} value={sprint.id}>
                    <div className="flex flex-col">
                      <span className="font-medium">
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
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setChartAboveBoard(!chartAboveBoard)}
            className="gap-2 text-xs sm:text-sm"
          >
            <Layout className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">{chartAboveBoard ? 'Charts Above' : 'Charts Below'}</span>
            <span className="sm:hidden">{chartAboveBoard ? 'Above' : 'Below'}</span>
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <FilterBar />

      {/* Section Toggles */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setBoardSectionCollapsed(!boardSectionCollapsed)}
          className="gap-1 sm:gap-2 text-xs sm:text-sm"
        >
          {boardSectionCollapsed ? <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4" /> : <ChevronUp className="h-3 w-3 sm:h-4 sm:w-4" />}
          Board
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => setChartSectionCollapsed(!chartSectionCollapsed)}
          className="gap-1 sm:gap-2 text-xs sm:text-sm"
        >
          {chartSectionCollapsed ? <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4" /> : <ChevronUp className="h-3 w-3 sm:h-4 sm:w-4" />}
          Charts
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => setRoadmapSectionCollapsed(!roadmapSectionCollapsed)}
          className="gap-1 sm:gap-2 text-xs sm:text-sm"
        >
          {roadmapSectionCollapsed ? <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4" /> : <ChevronUp className="h-3 w-3 sm:h-4 sm:w-4" />}
          <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
          <span className="hidden sm:inline">Roadmap</span>
          <span className="sm:hidden">Map</span>
        </Button>
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        {renderSections()}
      </div>
    </div>
  );
}
