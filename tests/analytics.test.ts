import { describe, it, expect } from 'vitest';
import type { AppData } from '../src/types';
import {
  completion,
  dayIsComplete,
  dayIsActive,
  activeStreak,
  habitStreak,
  habitBestStreak,
  habitDaysInWeek,
  buildKpis,
  buildInsight,
} from '../src/lib/analytics';
import { daysOfWeek, subDaysIso, todayIso } from '../src/lib/jalali';

function day({ tasksDone = 0, tasks = 0, habits = {}, goals = [] }: {
  tasksDone?: number; tasks?: number; habits?: Record<string, boolean>;
  goals?: string[];
}) {
  const arr = Array.from({ length: tasks }, (_, i) => ({ id: `t${i}`, t: 'x', done: i < tasksDone }));
  return { schedule: [], tasks: arr, goals, lessons: '', habits };
}

describe('completion', () => {
  it('empty day -> 0', () => {
    expect(completion(undefined)).toEqual({ done: 0, total: 0, pct: 0 });
  });
  it('partial', () => {
    expect(completion(day({ tasks: 4, tasksDone: 2 })).pct).toBe(50);
  });
  it('full', () => {
    const c = completion(day({ tasks: 3, tasksDone: 3 }));
    expect(c.pct).toBe(100);
    expect(dayIsComplete(day({ tasks: 3, tasksDone: 3 }))).toBe(true);
  });
});

describe('dayIsActive', () => {
  it('active from a done task', () => {
    expect(dayIsActive(day({ tasks: 1, tasksDone: 1 }))).toBe(true);
  });
  it('not active when empty or only undone tasks', () => {
    expect(dayIsActive(undefined)).toBe(false);
    expect(dayIsActive(day({ tasks: 2, tasksDone: 0 }))).toBe(false);
  });
  it('active from goals', () => {
    expect(dayIsActive(day({ goals: ['go'] }))).toBe(true);
  });

  it('ignores blank starter rows but detects a checked or filled schedule row', () => {
    const blank = {
      ...day({}),
      schedule: [
        { id: 's1', note: '', done: false },
        { id: 's2', note: '   ', done: false },
      ],
    };
    expect(dayIsActive(blank)).toBe(false);
    expect(dayIsActive({
      ...blank,
      schedule: [{ id: 's1', note: '', done: true }],
    })).toBe(true);
    expect(dayIsActive({
      ...blank,
      schedule: [{ id: 's1', note: 'جلسه‌ی تیم', done: false }],
    })).toBe(true);
  });
});

describe('streaks', () => {
  const w = daysOfWeek('2025-08-15'); // 7 days starting Saturday
  function mkData(activeIso: string[]): AppData {
    const days: AppData['days'] = {};
    for (const d of activeIso) days[d] = day({ goals: ['x'] });
    return { days, habits: [], settings: { sound: true } };
  }
  it('activeStreak counts consecutive active days', () => {
    // anchor = w[3], active on w[1],w[2],w[3] -> streak 3
    const data = mkData([w[1], w[2], w[3]]);
    expect(activeStreak(data, w[3])).toBe(3);
  });
  it('activeStreak backs up if anchor inactive', () => {
    // anchor w[4] inactive, active w[2],w[3] -> 2
    const data = mkData([w[2], w[3]]);
    expect(activeStreak(data, w[4])).toBe(2);
  });

  it('habitStreak consecutive', () => {
    const days: AppData['days'] = {};
    for (const d of [w[2], w[3], w[4]]) days[d] = day({ habits: { h: true } });
    days[w[5]] = day({});
    const data: AppData = { days, habits: [], settings: { sound: true } };
    expect(habitStreak(data, 'h', w[4])).toBe(3);
    // anchor inactive -> rolls back one day to the ongoing streak (today pending)
    expect(habitStreak(data, 'h', w[5])).toBe(3);
    // anchor after a real gap -> 0
    days[w[6]] = day({});
    expect(habitStreak(data, 'h', w[6])).toBe(0);
  });

  it('habitBestStreak finds longest run', () => {
    const days: AppData['days'] = {};
    for (const d of [w[0], w[1], w[3], w[4], w[5], w[6]]) days[d] = day({ habits: { h: true } });
    const data: AppData = { days, habits: [], settings: { sound: true } };
    expect(habitBestStreak(data, 'h')).toBe(4);
  });

  it('habitDaysInWeek counts within selected week', () => {
    const days: AppData['days'] = {};
    for (const d of [w[0], w[2], w[5]]) days[d] = day({ habits: { h: true } });
    const data: AppData = { days, habits: [], settings: { sound: true } };
    expect(habitDaysInWeek(data, 'h', w[0])).toBe(3);
  });
});

describe('buildKpis', () => {
  it('no data -> today & week 0, no deltas', () => {
    const data: AppData = { days: {}, habits: [], settings: { sound: true } };
    const kpis = buildKpis(data);
    expect(kpis.find((k) => k.id === 'today')!.value).toBe('۰٪');
    expect(kpis.find((k) => k.id === 'streak')!.value).toBe('۰ روز');
    // all deltas null when there is no previous period
    expect(kpis.every((k) => k.delta === null)).toBe(true);
  });

  it('reflects completed tasks today', () => {
    const today = todayIso();
    const data: AppData = {
      days: { [today]: day({ tasks: 2, tasksDone: 2 }) },
      habits: [],
      settings: { sound: true },
    };
    const kpis = buildKpis(data);
    expect(kpis.find((k) => k.id === 'today')!.value).toBe('۱۰۰٪');
  });
});

describe('buildInsight', () => {
  it('empty when no data', () => {
    const data: AppData = { days: {}, habits: [], settings: { sound: true } };
    expect(buildInsight(data, []).empty).toBe(true);
  });

  it('mentions best habit for the week', () => {
    const today = todayIso();
    const wk = daysOfWeek(today);
    const days: AppData['days'] = {};
    for (const d of [wk[0], wk[2]]) days[d] = day({ habits: { h1: true } });
    const data: AppData = { days, habits: [], settings: { sound: true } };
    const insight = buildInsight(data, [
      { id: 'h1', title: 'مطالعه', icon: '📚', color: '#fff', createdAt: today },
    ]);
    expect(insight.empty).toBe(false);
    expect(insight.title).toContain('مطالعه');
    expect(insight.title).toContain('۲ روز');
  });
});
