// IDs are strings (uuid style)

export type Priority = "Q1" | "Q2" | "Q3" | "Q4"; // First Things First
export type StoryType = "Spiritual" | "Physical" | "Intellectual" | "Social" | string;

export type Role = {
  id: string;
  name: string; // e.g., Disciple of Christ, Student
  color: string; // hex
};

export type Label = { 
  id: string; 
  name: string; 
  color: string; 
};

export type Vision = {
  id: string;
  title: string;
  description?: string; // optional short description
  type: StoryType;
  order: number; // for Importance view ordering
};

export type Story = {
  id: string;
  title: string;
  description: string; // templated as described below
  labels: string[]; // label ids
  priority: Priority;
  weight: 1 | 3 | 5 | 8 | 13 | 21;
  size: "XS" | "S" | "M" | "L" | "XL"; // used for time estimate picker
  type: StoryType; // mapped to role when applicable
  roleId?: string; // Role selection
  visionId?: string; // link to Vision
  dueDate?: string; // ISO date
  sprintId?: string; // nullable, story may exist without a sprint
  scheduled?: string; // ISO date for Roadmap scheduling, optional
  checklist: { id: string; text: string; done: boolean }[];
  createdAt: string;
  updatedAt: string;
  deleted?: boolean;
  repeat?: {
    cadence: "none" | "weekly" | "biweekly" | "monthly"; // implement weekly at minimum
    count?: number; // optional number of repeats
  };
  subtasks?: string[]; // child Story ids for bigger work
};

export type Sprint = {
  id: string; // format: Week-<isoWeek>-<year>
  isoWeek: number;
  year: number;
  startDate: string; // Monday ISO
  endDate: string; // Sunday ISO
};

export type Board = {
  id: string;
  name: string;
  columns: string[]; // column ids in order
};

export type Column = {
  id: string;
  name: "Icebox" | "Backlog" | "To Do" | "In Progress" | "Review" | "Done";
  storyIds: string[];
};

export type StoryTypeConfig = {
  name: string;
  color: string; // hex color
};

export type StorySizeConfig = {
  name: string;
  color: string; // hex color
  timeEstimate: string; // e.g., "15 min", "1 hour", "2-4 hours"
};

export type VisionTypeConfig = {
  name: string;
  color: string; // hex color
};

export type Settings = {
  theme: "light" | "dark" | "system";
  roles: Role[]; // editable
  labels: Label[]; // editable, color aware
  storyTypes: StoryTypeConfig[]; // story types with colors
  storySizes: StorySizeConfig[]; // story sizes with colors and time estimates
  visionTypes: VisionTypeConfig[]; // vision types with colors
  priorityColors: Record<Priority, string>; // priority colors
  weightBaseColor: string; // base color for weight gradient
  roleToTypeMap: Record<string, StoryType>; // Disciple -> Spiritual, Friend -> Social, etc.
};

export type AppState = {
  stories: Story[];
  sprints: Sprint[];
  boards: Board[];
  columns: Column[];
  visions: Vision[];
  settings: Settings;
  selectedSprintId?: string;
  selectedStoryIds: string[];
  focusedStoryId?: string;
  filters: {
    text: string;
    keywords: string;
    dueSoon: boolean;
  };
  layout: {
    chartSectionCollapsed: boolean;
    boardSectionCollapsed: boolean;
    roadmapSectionCollapsed: boolean;
    chartAboveBoard: boolean;
    roadmapPosition: 'top' | 'middle' | 'bottom';
  };
  ui: {
    chartCollapsed: {
      burndown: boolean;
      burnup: boolean;
    };
  };
};

// View types
export type ViewType = "sprint" | "story-boards" | "importance" | "planner" | "sprint-planning" | "settings";

// Filter keyword types
export type FilterKey = "sprint" | "type" | "role" | "priority" | "label" | "weight" | "size" | "due" | "dueSoon";
export type FilterOperator = "=" | "!=";

// Brain level and time bucket types for Planner
export type BrainLevel = "low" | "moderate" | "high";
export type TimeBucket = "XS" | "S" | "M" | "L" | "XL";

// Chart data types
export type BurndownData = {
  day: string;
  ideal: number;
  actual: number;
};

export type BurnupData = {
  day: string;
  completed: number;
  total: number;
};

// Multi-select and keyboard navigation
export type SelectionMode = "single" | "multi";
export type NavigationDirection = "up" | "down" | "left" | "right";

// Modal types
export type ModalType = "add-story" | "edit-story" | "delete-story" | "help" | "import" | "export";

// Roadmap grid types
export type RoadmapCell = {
  date: string;
  storyId?: string;
};

export type RoadmapColumn = {
  storyId: string;
  storyTitle: string;
  cells: RoadmapCell[];
};
