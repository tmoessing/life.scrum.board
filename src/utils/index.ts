import { format, startOfWeek, endOfWeek, getISOWeek, getYear, addWeeks, parseISO, isValid } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import type { Story, Sprint, Priority, StoryType, Role, Label, Vision, Settings } from '@/types';

// Date utilities
export const getCurrentWeek = (): { isoWeek: number; year: number } => {
  const now = new Date();
  return {
    isoWeek: getISOWeek(now),
    year: getYear(now)
  };
};

export const getWeekDates = (isoWeek: number, year: number): { startDate: string; endDate: string } => {
  const date = new Date(year, 0, 1);
  const weekStart = startOfWeek(date, { weekStartsOn: 1 });
  const targetWeek = addWeeks(weekStart, isoWeek - 1);
  
  return {
    startDate: format(targetWeek, 'yyyy-MM-dd'),
    endDate: format(endOfWeek(targetWeek, { weekStartsOn: 1 }), 'yyyy-MM-dd')
  };
};

export const createSprintId = (isoWeek: number, year: number): string => {
  return `Week-${isoWeek}-${year}`;
};

// Weight gradient utilities
export const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};

export const rgbToHex = (r: number, g: number, b: number): string => {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
};

export const getWeightGradientColor = (weight: number, baseColor: string, maxValue: number = 21): string => {
  const rgb = hexToRgb(baseColor);
  if (!rgb) return baseColor;
  
  // Calculate intensity based on weight (0 to 1)
  const intensity = Math.min(weight / maxValue, 1);
  
  // Lighten the color by increasing RGB values (reverse gradient)
  const lightenFactor = 0.3 + (intensity * 0.7); // Range from 0.3 to 1.0
  const newR = Math.floor(rgb.r + (255 - rgb.r) * lightenFactor);
  const newG = Math.floor(rgb.g + (255 - rgb.g) * lightenFactor);
  const newB = Math.floor(rgb.b + (255 - rgb.b) * lightenFactor);
  
  return rgbToHex(newR, newG, newB);
};

export const generateSprints = (weeksAhead: number = 12): Sprint[] => {
  const { isoWeek, year } = getCurrentWeek();
  const sprints: Sprint[] = [];
  
  for (let i = 0; i < weeksAhead; i++) {
    const weekNumber = isoWeek + i;
    const sprintYear = year + Math.floor((weekNumber - 1) / 52);
    const normalizedWeek = ((weekNumber - 1) % 52) + 1;
    
    const { startDate, endDate } = getWeekDates(normalizedWeek, sprintYear);
    
    sprints.push({
      id: createSprintId(normalizedWeek, sprintYear),
      isoWeek: normalizedWeek,
      year: sprintYear,
      startDate,
      endDate
    });
  }
  
  return sprints;
};

// Story utilities
export const createStory = (overrides: Partial<Story> = {}): Story => {
  const now = new Date().toISOString();
  return {
    id: uuidv4(),
    title: '',
    description: '',
    labels: [],
    priority: 'Q4',
    weight: 1,
    size: 'M',
    type: 'Intellectual',
    checklist: [],
    createdAt: now,
    updatedAt: now,
    ...overrides
  };
};

export const createRole = (overrides: Partial<Role> = {}): Role => ({
  id: uuidv4(),
  name: '',
  color: '#3B82F6',
  ...overrides
});

export const createLabel = (overrides: Partial<Label> = {}): Label => ({
  id: uuidv4(),
  name: '',
  color: '#3B82F6',
  ...overrides
});

export const createVision = (overrides: Partial<Vision> = {}): Vision => ({
  id: uuidv4(),
  title: '',
  description: '',
  type: 'Intellectual',
  order: 0,
  ...overrides
});

// Default settings
export const getDefaultSettings = (): Settings => ({
  theme: 'system',
  roles: [
    { id: 'disciple', name: 'Disciple of Christ', color: '#8B5CF6' },
    { id: 'student', name: 'Student', color: '#3B82F6' },
    { id: 'friend', name: 'Friend', color: '#10B981' },
    { id: 'family', name: 'Family Member', color: '#F59E0B' }
  ],
  labels: [
    { id: 'workout', name: 'workout', color: '#EF4444' },
    { id: 'study', name: 'study', color: '#3B82F6' },
    { id: 'family', name: 'family', color: '#F59E0B' },
    { id: 'spiritual', name: 'spiritual', color: '#8B5CF6' }
  ],
  storyTypes: [
    { name: 'Spiritual', color: '#8B5CF6' },
    { name: 'Physical', color: '#EF4444' },
    { name: 'Intellectual', color: '#3B82F6' },
    { name: 'Social', color: '#10B981' }
  ],
  storySizes: [
    { name: 'XS', color: '#10B981', timeEstimate: '15 min' },
    { name: 'S', color: '#3B82F6', timeEstimate: '30 min' },
    { name: 'M', color: '#F59E0B', timeEstimate: '1 hour' },
    { name: 'L', color: '#EF4444', timeEstimate: '2-4 hours' },
    { name: 'XL', color: '#8B5CF6', timeEstimate: '1+ days' }
  ],
  visionTypes: [
    { name: 'Spiritual', color: '#8B5CF6' },
    { name: 'Physical', color: '#EF4444' },
    { name: 'Intellectual', color: '#3B82F6' },
    { name: 'Social', color: '#10B981' }
  ],
  priorityColors: {
    'Q1': '#EF4444', // Red for Urgent & Important
    'Q2': '#10B981', // Green for Important, Not Urgent
    'Q3': '#F59E0B', // Yellow for Urgent, Not Important
    'Q4': '#6B7280'  // Gray for Not Urgent, Not Important
  },
  weightBaseColor: '#3B82F6', // Base color for weight gradient
  roleToTypeMap: {
    'disciple': 'Spiritual',
    'student': 'Intellectual',
    'friend': 'Social',
    'family': 'Social'
  }
});

// Description template generation
export const generateDescription = (
  role?: Role,
  vision?: Vision,
  customText?: string
): string => {
  if (customText) return customText;
  
  const roleName = role?.name || 'person';
  const visionText = vision ? ` so that I fulfill (${vision.title})` : '';
  
  return `As a ${roleName} I need to <...>${visionText}`;
};

// Filter utilities
export const parseFilterKeywords = (keywords: string): Record<string, string[]> => {
  const filters: Record<string, string[]> = {};
  
  if (!keywords.trim()) return filters;
  
  const parts = keywords.split(/\s+/);
  
  for (const part of parts) {
    const [key, value] = part.split('=');
    if (key && value) {
      const values = value.split(',').map(v => v.trim());
      filters[key] = values;
    }
  }
  
  return filters;
};

// Story filtering
export const filterStories = (
  stories: Story[],
  text: string,
  keywords: string,
  dueSoon: boolean,
  roles: Role[],
  labels: Label[],
  visions: Vision[]
): Story[] => {
  let filtered = stories.filter(story => !story.deleted);
  
  // Text search
  if (text.trim()) {
    const searchText = text.toLowerCase();
    filtered = filtered.filter(story => 
      story.title.toLowerCase().includes(searchText) ||
      story.description.toLowerCase().includes(searchText)
    );
  }
  
  // Keyword filters
  const keywordFilters = parseFilterKeywords(keywords);
  
  for (const [key, values] of Object.entries(keywordFilters)) {
    filtered = filtered.filter(story => {
      switch (key) {
        case 'weight':
          return values.includes(story.weight.toString());
        case 'size':
          return values.includes(story.size);
        case 'priority':
          return values.includes(story.priority);
        case 'type':
          return values.includes(story.type);
        case 'role':
          const role = roles.find(r => r.id === story.roleId);
          return role && values.includes(role.name.toLowerCase());
        case 'label':
          return story.labels.some(labelId => {
            const label = labels.find(l => l.id === labelId);
            return label && values.includes(label.name.toLowerCase());
          });
        case 'sprint':
          if (values.includes('current')) {
            // Logic for current sprint
            return true; // Placeholder
          }
          return true; // Placeholder
        default:
          return true;
      }
    });
  }
  
  // Due soon filter
  if (dueSoon) {
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
    
    filtered = filtered.filter(story => {
      if (!story.dueDate) return false;
      const dueDate = parseISO(story.dueDate);
      return isValid(dueDate) && dueDate <= sevenDaysFromNow;
    });
  }
  
  return filtered;
};

// Local storage utilities
export const saveToLocalStorage = (key: string, data: any): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
};

export const loadFromLocalStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Failed to load from localStorage:', error);
    return defaultValue;
  }
};

// Story storage helpers
export const loadStories = (): any[] => {
  try {
    const stories = localStorage.getItem('life-scrum-stories');
    return stories ? JSON.parse(stories) : [];
  } catch (error) {
    console.error('Failed to load stories:', error);
    return [];
  }
};

export const saveStories = (stories: any[]): void => {
  try {
    localStorage.setItem('life-scrum-stories', JSON.stringify(stories));
  } catch (error) {
    console.error('Failed to save stories:', error);
  }
};

// Backup and restore utilities
export const exportAllData = (data: any) => {
  // Filter out deleted stories for export
  const activeStories = data.stories ? data.stories.filter((story: any) => !story.deleted) : [];
  
  const exportData = {
    exportedAt: new Date().toISOString(),
    stories: activeStories,
    sprints: data.sprints || [],
    roles: data.roles || [],
    labels: data.labels || [],
    visions: data.visions || [],
    columns: data.columns || [],
    boards: data.boards || [],
    settings: data.settings || {}
  };
  
  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const filename = `backup-${timestamp}.json`;
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Legacy function for backward compatibility
export const exportStories = (stories: any[]) => {
  const activeStories = stories.filter(story => !story.deleted);
  exportAllData({ stories: activeStories });
};

export const importAllData = (file: File): Promise<{ data: any, mode: 'overwrite' | 'merge' }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);
        
        // Handle different import formats
        if (Array.isArray(data)) {
          // Legacy format: Direct array of stories
          resolve({ 
            data: { stories: data }, 
            mode: 'overwrite' 
          });
        } else if (data.stories && Array.isArray(data.stories)) {
          // Full backup format: Object with all data
          resolve({ 
            data: {
              stories: data.stories || [],
              sprints: data.sprints || [],
              roles: data.roles || [],
              labels: data.labels || [],
              visions: data.visions || [],
              columns: data.columns || [],
              boards: data.boards || [],
              settings: data.settings || {}
            }, 
            mode: 'overwrite' 
          });
        } else {
          throw new Error('Invalid file format. Expected array of stories or full backup object.');
        }
      } catch (error) {
        reject(new Error('Invalid JSON file or unsupported format.'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file.'));
    };
    
    reader.readAsText(file);
  });
};

// Legacy function for backward compatibility
export const importStories = (file: File): Promise<{ stories: any[], mode: 'overwrite' | 'merge' }> => {
  return importAllData(file).then(result => ({
    stories: result.data.stories || [],
    mode: result.mode
  }));
};

export const createBackupBeforeImport = (): void => {
  const currentStories = loadStories();
  const activeStories = currentStories.filter(story => !story.deleted);
  if (activeStories.length > 0) {
    exportStories(activeStories);
  }
};

// Export/Import utilities
export const exportData = (data: any): string => {
  return JSON.stringify(data, null, 2);
};

export const importData = (jsonString: string): any => {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    throw new Error('Invalid JSON format');
  }
};

// Brain level mapping for Planner
export const getBrainLevelWeights = (level: 'low' | 'moderate' | 'high'): number[] => {
  switch (level) {
    case 'low':
      return [1, 3];
    case 'moderate':
      return [5, 8];
    case 'high':
      return [8, 13, 21];
    default:
      return [1, 3, 5, 8, 13, 21];
  }
};

// Priority sorting
export const getPriorityOrder = (priority: Priority): number => {
  const order = { Q1: 1, Q2: 2, Q3: 3, Q4: 4 };
  return order[priority];
};

// Story weight to size mapping
export const getWeightSize = (weight: number): "XS" | "S" | "M" | "L" | "XL" => {
  if (weight <= 1) return 'XS';
  if (weight <= 3) return 'S';
  if (weight <= 8) return 'M';
  if (weight <= 13) return 'L';
  return 'XL';
};
