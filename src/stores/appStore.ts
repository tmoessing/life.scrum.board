import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import type { 
  Story, 
  Sprint, 
  Role, 
  Label, 
  Vision, 
  Settings, 
  ViewType,
  Column,
  Board
} from '@/types';
import { 
  generateSprints, 
  getDefaultSettings, 
  createStory,
  createRole,
  createLabel,
  createVision,
  getCurrentWeek,
  createSprintId,
  filterStories
} from '@/utils';

// Initialize default data
const defaultSprints = generateSprints(12);
const defaultSettings = getDefaultSettings();

// Get current week sprint ID for default selection
const getCurrentWeekSprintId = () => {
  const { isoWeek, year } = getCurrentWeek();
  return createSprintId(isoWeek, year);
};
const defaultColumns: Column[] = [
  { id: 'icebox', name: 'Icebox', storyIds: [] },
  { id: 'backlog', name: 'Backlog', storyIds: [] },
  { id: 'todo', name: 'To Do', storyIds: [] },
  { id: 'progress', name: 'In Progress', storyIds: [] },
  { id: 'review', name: 'Review', storyIds: [] },
  { id: 'done', name: 'Done', storyIds: [] }
];

const defaultBoard: Board = {
  id: 'main-board',
  name: 'Main Board',
  columns: ['icebox', 'backlog', 'todo', 'progress', 'review', 'done']
};

// Core data atoms with localStorage persistence
export const storiesAtom = atomWithStorage<Story[]>('life-scrum-stories', []);
export const sprintsAtom = atomWithStorage<Sprint[]>('life-scrum-sprints', defaultSprints);

// Ensure sprints are never empty - add a fallback
export const safeSprintsAtom = atom(
  (get) => {
    const sprints = get(sprintsAtom);
    return sprints.length > 0 ? sprints : defaultSprints;
  },
  (_, set, newSprints: Sprint[]) => {
    set(sprintsAtom, newSprints.length > 0 ? newSprints : defaultSprints);
  }
);
export const rolesAtom = atomWithStorage<Role[]>('life-scrum-roles', defaultSettings.roles);
export const labelsAtom = atomWithStorage<Label[]>('life-scrum-labels', defaultSettings.labels);
export const visionsAtom = atomWithStorage<Vision[]>('life-scrum-visions', []);
export const columnsAtom = atomWithStorage<Column[]>('life-scrum-columns', defaultColumns);

// Ensure columns are never empty - add a fallback
export const safeColumnsAtom = atom(
  (get) => {
    const columns = get(columnsAtom);
    return columns.length > 0 ? columns : defaultColumns;
  },
  (_, set, newColumns: Column[]) => {
    set(columnsAtom, newColumns.length > 0 ? newColumns : defaultColumns);
  }
);
export const boardsAtom = atomWithStorage<Board[]>('life-scrum-boards', [defaultBoard]);

// Settings atom with migration
const migrateSettings = (settings: any): Settings => {
  // If priorityColors is missing, add it
  if (!settings.priorityColors) {
    settings.priorityColors = {
      'Q1': '#EF4444', // Red for Urgent & Important
      'Q2': '#10B981', // Green for Important, Not Urgent
      'Q3': '#F59E0B', // Yellow for Urgent, Not Important
      'Q4': '#6B7280'  // Gray for Not Urgent, Not Important
    };
  }
  return settings as Settings;
};

// Base settings atom
const baseSettingsAtom = atomWithStorage<Settings>('life-scrum-settings', defaultSettings);

// Settings atom with migration
export const settingsAtom = atom(
  (get) => {
    const settings = get(baseSettingsAtom);
    return migrateSettings(settings);
  },
  (_, set, newSettings: Settings) => {
    set(baseSettingsAtom, newSettings);
  }
);

// UI state atoms
export const currentViewAtom = atomWithStorage<ViewType>('life-scrum-current-view', 'sprint');
export const selectedSprintIdAtom = atomWithStorage<string | undefined>('life-scrum-selected-sprint', getCurrentWeekSprintId());
export const selectedStoryIdsAtom = atomWithStorage<string[]>('life-scrum-selected-stories', []);
export const focusedStoryIdAtom = atomWithStorage<string | undefined>('life-scrum-focused-story', undefined);

// Filter atoms
export const filterTextAtom = atomWithStorage<string>('life-scrum-filter-text', '');
export const filterKeywordsAtom = atomWithStorage<string>('life-scrum-filter-keywords', '');
export const filterDueSoonAtom = atomWithStorage<boolean>('life-scrum-filter-due-soon', false);

// Layout atoms
export const chartSectionCollapsedAtom = atomWithStorage<boolean>('life-scrum-chart-collapsed', false);
export const boardSectionCollapsedAtom = atomWithStorage<boolean>('life-scrum-board-collapsed', false);
export const roadmapSectionCollapsedAtom = atomWithStorage<boolean>('life-scrum-roadmap-collapsed', true);
export const chartAboveBoardAtom = atomWithStorage<boolean>('life-scrum-chart-above-board', false);
export const roadmapPositionAtom = atomWithStorage<'top' | 'middle' | 'bottom'>('life-scrum-roadmap-position', 'bottom');

// Chart collapse states
export const burndownCollapsedAtom = atomWithStorage<boolean>('life-scrum-burndown-collapsed', false);
export const burnupCollapsedAtom = atomWithStorage<boolean>('life-scrum-burnup-collapsed', false);

// Derived atoms for computed values
export const currentSprintAtom = atom(
  (get) => {
    const sprints = get(sprintsAtom);
    const selectedId = get(selectedSprintIdAtom);
    
    // First try to find the selected sprint
    let currentSprint = sprints.find(sprint => sprint.id === selectedId);
    
    // If not found, try to find the current week sprint
    if (!currentSprint) {
      const currentWeekId = getCurrentWeekSprintId();
      currentSprint = sprints.find(sprint => sprint.id === currentWeekId);
    }
    
    // Fallback to first sprint if still not found
    return currentSprint || sprints[0];
  }
);

export const filteredStoriesAtom = atom(
  (get) => {
    const stories = get(storiesAtom);
    const text = get(filterTextAtom);
    const keywords = get(filterKeywordsAtom);
    const dueSoon = get(filterDueSoonAtom);
    const roles = get(rolesAtom);
    const labels = get(labelsAtom);
    // const visions = get(visionsAtom);
    
    return filterStories(stories, text, keywords, dueSoon, roles, labels);
  }
);

export const storiesByColumnAtom = atom(
  (get) => {
    const stories = get(storiesAtom);
    const columns = get(columnsAtom);
    const currentSprint = get(currentSprintAtom);
    
    const result: Record<string, Story[]> = {};
    
    columns.forEach(column => {
      result[column.id] = column.storyIds
        .map(id => stories.find(story => story.id === id))
        .filter((story): story is Story => 
          story !== undefined && 
          !story.deleted && 
          story.sprintId === currentSprint?.id
        );
    });
    
    return result;
  }
);

// Action atoms
export const addStoryAtom = atom(
  null,
  (get, set, storyData: Partial<Story>, targetColumnId?: string) => {
    // Only assign to current sprint if sprintId is not provided in the storyData at all
    // If sprintId is explicitly set to undefined, keep it as undefined (no sprint)
    const currentSprint = get(currentSprintAtom);
    const storyDataWithSprint = {
      ...storyData,
      // Only assign to current sprint if sprintId is not a property of storyData
      sprintId: 'sprintId' in storyData ? storyData.sprintId : currentSprint?.id
    };
    
    const newStory = createStory(storyDataWithSprint);
    const currentStories = get(storiesAtom);
    set(storiesAtom, [...currentStories, newStory]);
    
    // Add the story to the specified column or icebox by default
    const columns = get(columnsAtom);
    const targetColumn = columns.find(col => col.id === (targetColumnId || 'icebox'));
    if (targetColumn) {
      const updatedColumns = columns.map(col => 
        col.id === (targetColumnId || 'icebox')
          ? { ...col, storyIds: [...col.storyIds, newStory.id] }
          : col
      );
      set(columnsAtom, updatedColumns);
    }
    
    return newStory;
  }
);

export const updateStoryAtom = atom(
  null,
  (get, set, storyId: string, updates: Partial<Story>) => {
    console.log('updateStoryAtom called with:', storyId, updates);
    const stories = get(storiesAtom);
    const updatedStories = stories.map(story => 
      story.id === storyId 
        ? { ...story, ...updates, updatedAt: new Date().toISOString() }
        : story
    );
    console.log('Updated stories:', updatedStories.find(s => s.id === storyId));
    set(storiesAtom, updatedStories);
  }
);

export const deleteStoryAtom = atom(
  null,
  (get, set, storyId: string) => {
    const stories = get(storiesAtom);
    const updatedStories = stories.map(story => 
      story.id === storyId 
        ? { ...story, deleted: true, updatedAt: new Date().toISOString() }
        : story
    );
    set(storiesAtom, updatedStories);
  }
);

export const moveStoryAtom = atom(
  null,
  (get, set, storyId: string, fromColumnId: string, toColumnId: string, toIndex?: number) => {
    const columns = get(columnsAtom);
    const updatedColumns = columns.map(column => {
      if (column.id === fromColumnId) {
        return {
          ...column,
          storyIds: column.storyIds.filter(id => id !== storyId)
        };
      }
      if (column.id === toColumnId) {
        const newStoryIds = [...column.storyIds];
        const insertIndex = toIndex !== undefined ? toIndex : newStoryIds.length;
        newStoryIds.splice(insertIndex, 0, storyId);
        return {
          ...column,
          storyIds: newStoryIds
        };
      }
      return column;
    });
    set(columnsAtom, updatedColumns);
  }
);

export const addRoleAtom = atom(
  null,
  (get, set, roleData: Partial<Role>) => {
    const newRole = createRole(roleData);
    const currentRoles = get(rolesAtom);
    set(rolesAtom, [...currentRoles, newRole]);
    return newRole;
  }
);

export const updateRoleAtom = atom(
  null,
  (get, set, roleId: string, updates: Partial<Role>) => {
    const roles = get(rolesAtom);
    const updatedRoles = roles.map(role => 
      role.id === roleId ? { ...role, ...updates } : role
    );
    set(rolesAtom, updatedRoles);
  }
);

export const deleteRoleAtom = atom(
  null,
  (get, set, roleId: string) => {
    const roles = get(rolesAtom);
    const updatedRoles = roles.filter(role => role.id !== roleId);
    set(rolesAtom, updatedRoles);
  }
);

export const addLabelAtom = atom(
  null,
  (get, set, labelData: Partial<Label>) => {
    const newLabel = createLabel(labelData);
    const currentLabels = get(labelsAtom);
    set(labelsAtom, [...currentLabels, newLabel]);
    return newLabel;
  }
);

export const updateLabelAtom = atom(
  null,
  (get, set, labelId: string, updates: Partial<Label>) => {
    const labels = get(labelsAtom);
    const updatedLabels = labels.map(label => 
      label.id === labelId ? { ...label, ...updates } : label
    );
    set(labelsAtom, updatedLabels);
  }
);

export const deleteLabelAtom = atom(
  null,
  (get, set, labelId: string) => {
    const labels = get(labelsAtom);
    const updatedLabels = labels.filter(label => label.id !== labelId);
    set(labelsAtom, updatedLabels);
  }
);

export const addVisionAtom = atom(
  null,
  (get, set, visionData: Partial<Vision>) => {
    const newVision = createVision(visionData);
    const currentVisions = get(visionsAtom);
    set(visionsAtom, [...currentVisions, newVision]);
    return newVision;
  }
);

export const updateVisionAtom = atom(
  null,
  (get, set, visionId: string, updates: Partial<Vision>) => {
    const visions = get(visionsAtom);
    const updatedVisions = visions.map(vision => 
      vision.id === visionId ? { ...vision, ...updates } : vision
    );
    set(visionsAtom, updatedVisions);
  }
);

export const deleteVisionAtom = atom(
  null,
  (get, set, visionId: string) => {
    const visions = get(visionsAtom);
    const updatedVisions = visions.filter(vision => vision.id !== visionId);
    set(visionsAtom, updatedVisions);
  }
);

export const reorderVisionsAtom = atom(
  null,
  (get, set, visionIds: string[]) => {
    const visions = get(visionsAtom);
    const reorderedVisions = visionIds.map((id, index) => {
      const vision = visions.find(v => v.id === id);
      return vision ? { ...vision, order: index } : null;
    }).filter((vision): vision is Vision => vision !== null);
    
    set(visionsAtom, reorderedVisions);
  }
);

// Export/Import atoms
export const exportDataAtom = atom(
  (get) => {
    return {
      stories: get(storiesAtom),
      sprints: get(sprintsAtom),
      roles: get(rolesAtom),
      labels: get(labelsAtom),
      visions: get(visionsAtom),
      columns: get(columnsAtom),
      boards: get(boardsAtom),
      settings: get(settingsAtom),
      exportDate: new Date().toISOString()
    };
  }
);

export const importDataAtom = atom(
  null,
  (_, set, data: any) => {
    if (data.stories) set(storiesAtom, data.stories);
    // Only set sprints if they exist and are not empty
    if (data.sprints && data.sprints.length > 0) {
      set(sprintsAtom, data.sprints);
    }
    if (data.roles) set(rolesAtom, data.roles);
    if (data.labels) set(labelsAtom, data.labels);
    if (data.visions) set(visionsAtom, data.visions);
    // Only set columns if they exist and are not empty
    if (data.columns && data.columns.length > 0) {
      set(columnsAtom, data.columns);
    }
    // Only set boards if they exist and are not empty
    if (data.boards && data.boards.length > 0) {
      set(boardsAtom, data.boards);
    }
    if (data.settings) set(settingsAtom, data.settings);
  }
);
