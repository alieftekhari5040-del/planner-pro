import type { AppData, DayData } from '../types';
import { STORAGE_KEY } from './constants';

export function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export function emptyDay(): DayData {
  return { schedule: [], tasks: [], goals: [], lessons: '', habits: {} };
}

export function defaultData(): AppData {
  return { days: {}, habits: [], settings: { sound: true } };
}

export function loadData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultData();
    const parsed = JSON.parse(raw) as Partial<AppData>;
    const base = defaultData();
    return {
      days: parsed.days ?? base.days,
      habits: Array.isArray(parsed.habits) ? parsed.habits : base.habits,
      settings: {
        sound: parsed.settings?.sound ?? base.settings.sound,
      },
    };
  } catch {
    return defaultData();
  }
}

export function saveData(data: AppData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    // storage full or unavailable — fail silently in personal tool
    console.warn('ذخیره‌سازی ناموفق بود', e);
  }
}
