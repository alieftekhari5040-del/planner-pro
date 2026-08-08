export interface ScheduleRow {
  id: string;
  time: string;
  note: string;
}

export interface Task {
  id: string;
  t: string;
  done: boolean;
}

export interface Habit {
  id: string;
  title: string;
  icon: string;
  color: string;
  createdAt: string; // ISO date
}

export interface DayData {
  schedule: ScheduleRow[];
  tasks: Task[];
  goals: string[];
  lessons: string;
  habits: Record<string, boolean>; // habitId -> completed
}

export interface Settings {
  sound: boolean;
}

export interface AppData {
  days: Record<string, DayData>;
  habits: Habit[];
  settings: Settings;
}

export type TabId = 'today' | 'habits' | 'stats';
