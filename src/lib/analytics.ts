import type { AppData, DayData, Habit } from '../types';
import {
  addDaysIso,
  daysOfWeek,
  subDaysIso,
  todayIso,
} from './jalali';

export interface Completion {
  done: number;
  total: number;
  pct: number;
}

export function completion(day: DayData | undefined): Completion {
  const tasks = day?.tasks ?? [];
  const total = tasks.length;
  const done = tasks.filter((t) => t.done).length;
  return { done, total, pct: total ? Math.round((done / total) * 100) : 0 };
}

/** A day counts as "کامل" when it has tasks and all of them are done. */
export function dayIsComplete(day: DayData | undefined): boolean {
  const tasks = day?.tasks ?? [];
  return tasks.length > 0 && tasks.every((t) => t.done);
}

/** A day has real recorded activity (any kind). */
export function dayIsActive(day: DayData | undefined): boolean {
  if (!day) return false;
  return (
    day.schedule.some(
      (row) => !!row.done || row.note.trim().length > 0 || (row.time?.length ?? 0) > 0
    ) ||
    day.tasks.some((t) => t.done) ||
    day.goals.some((goal) => goal.trim().length > 0) ||
    Object.values(day.habits).some(Boolean) ||
    day.lessons.trim().length > 0
  );
}

export function tasksDoneIn(day: DayData | undefined): number {
  return (day?.tasks ?? []).filter((t) => t.done).length;
}

export function tasksTotalIn(day: DayData | undefined): number {
  return day?.tasks?.length ?? 0;
}

/** Number of complete days in the week starting at `weekStartIso` (Saturday). */
export function completedDaysInWeek(
  data: AppData,
  weekStartIso: string
): number {
  return daysOfWeek(weekStartIso).filter((d) =>
    dayIsComplete(data.days[d])
  ).length;
}

/** Count of days in [start, start+6] with the habit done. */
export function habitDaysInWeek(
  data: AppData,
  habitId: string,
  weekStartIso: string
): number {
  return daysOfWeek(weekStartIso).filter((d) => data.days[d]?.habits[habitId])
    .length;
}

/** Current streak of consecutive active days (falls back to most recent active day). */
export function activeStreak(data: AppData, anchor = todayIso()): number {
  let cursor = anchor;
  if (!dayIsActive(data.days[cursor])) cursor = subDaysIso(cursor, 1);
  let streak = 0;
  while (dayIsActive(data.days[cursor])) {
    streak++;
    cursor = subDaysIso(cursor, 1);
  }
  return streak;
}

/** Consecutive days the habit was done, ending at `anchor`. */
export function habitStreak(data: AppData, habitId: string, anchor = todayIso()): number {
  let streak = 0;
  let cursor = anchor;
  // allow today to be "pending"
  if (!data.days[cursor]?.habits[habitId]) cursor = subDaysIso(cursor, 1);
  while (data.days[cursor]?.habits[habitId]) {
    streak++;
    cursor = subDaysIso(cursor, 1);
  }
  return streak;
}

export function habitActiveDays(data: AppData, habitId: string, fromIso: string, toIso: string): number {
  let count = 0;
  let d = fromIso;
  let guard = 0;
  while (d <= toIso && guard < 400) {
    if (data.days[d]?.habits[habitId]) count++;
    d = addDaysIso(d, 1);
    guard++;
  }
  return count;
}

export function habitBestStreak(data: AppData, habitId: string): number {
  const days = Object.keys(data.days)
    .filter((k) => data.days[k]?.habits[habitId])
    .sort();
  if (!days.length) return 0;
  let best = 0;
  let run = 0;
  let prev: string | null = null;
  for (const d of days) {
    if (prev && subDaysIso(d, 1) === prev) run++;
    else run = 1;
    if (run > best) best = run;
    prev = d;
  }
  return best;
}

function pctDelta(current: number, previous: number): number | null {
  if (previous === 0) return null;
  return Math.round(((current - previous) / previous) * 100);
}

export interface Kpi {
  id: string;
  label: string;
  value: string;
  delta: string | null;
  deltaDir: 'up' | 'down' | 'flat';
}

export interface Insight {
  title: string;
  details: string;
  empty: boolean;
}

export function buildKpis(data: AppData): Kpi[] {
  const today = todayIso();
  const yesterday = subDaysIso(today, 1);
  const thisWeekStart = daysOfWeek(today)[0];
  const lastWeekStart = subDaysIso(thisWeekStart, 7);

  const todayC = completion(data.days[today]);
  const yestC = completion(data.days[yesterday]);
  const todayPct = todayC.total ? todayC.pct : 0;
  const yestPct = yestC.total ? yestC.pct : 0;

  const thisWeekDone = completedDaysInWeek(data, thisWeekStart);
  const lastWeekDone = completedDaysInWeek(data, lastWeekStart);
  const weekPct = Math.round((thisWeekDone / 7) * 100);
  const lastWeekPct = Math.round((lastWeekDone / 7) * 100);

  const streak = activeStreak(data, today);
  const prevStreak = activeStreak(data, yesterday);

  const thisWeekTasks = daysOfWeek(today).reduce(
    (a, d) => a + tasksDoneIn(data.days[d]),
    0
  );
  const lastWeekTasks = daysOfWeek(subDaysIso(thisWeekStart, 1)).reduce(
    (a, d) => a + tasksDoneIn(data.days[d]),
    0
  );

  const kpis: Kpi[] = [
    {
      id: 'today',
      label: 'امروز',
      value: `${fa(todayPct)}٪`,
      delta: fmtPct(pctDelta(todayPct, yestPct)),
      deltaDir: dir(pctDelta(todayPct, yestPct)),
    },
    {
      id: 'week',
      label: 'این هفته',
      value: `${fa(weekPct)}٪`,
      delta: fmtPct(pctDelta(weekPct, lastWeekPct)),
      deltaDir: dir(pctDelta(weekPct, lastWeekPct)),
    },
    {
      id: 'streak',
      label: 'روزهای پیاپی',
      value: `${fa(streak)} روز`,
      delta: fmtNum(streak - prevStreak),
      deltaDir: dir(streak - prevStreak),
    },
    {
      id: 'tasks',
      label: 'تسک‌های انجام‌شده',
      value: fa(thisWeekTasks),
      delta: fmtNum(thisWeekTasks - lastWeekTasks),
      deltaDir: dir(thisWeekTasks - lastWeekTasks),
    },
  ];
  return kpis;
}

function dir(n: number | null): 'up' | 'down' | 'flat' {
  if (n == null || n === 0) return 'flat';
  return n > 0 ? 'up' : 'down';
}
function fmtPct(n: number | null): string | null {
  if (n == null) return null;
  return `${n > 0 ? '+' : ''}${fa(Math.abs(n))}٪`;
}
function fmtNum(n: number | null): string | null {
  if (n == null || n === 0) return null;
  return `${n > 0 ? '+' : ''}${fa(Math.abs(n))}`;
}
function fa(n: number): string {
  return String(n).replace(/[0-9]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[Number(d)]);
}

/** Auto-generated Persian insight summary. */
export function buildInsight(data: AppData, habits: Habit[]): Insight {
  const today = todayIso();
  const thisWeekStart = daysOfWeek(today)[0];
  const lastWeekStart = subDaysIso(thisWeekStart, 7);

  const thisDone = completedDaysInWeek(data, thisWeekStart);
  const lastDone = completedDaysInWeek(data, lastWeekStart);

  const hasAnyData = Object.keys(data.days).some((d) => dayIsActive(data.days[d]));
  if (!hasAnyData) {
    return {
      empty: true,
      title: 'هنوز داده‌ای نیست — از امروز شروع کن',
      details: 'اولین گام را همین حالا بردار؛ هر روز یک قدم جلوتر.',
    };
  }

  // best habit this week
  let bestHabit: Habit | null = null;
  let bestDays = 0;
  for (const h of habits) {
    const c = habitDaysInWeek(data, h.id, thisWeekStart);
    if (c > bestDays) {
      bestDays = c;
      bestHabit = h;
    }
  }

  const parts: string[] = [];
  parts.push(`این هفته ${fa(thisDone)} از ۷ روز کامل شد؛`);
  if (bestHabit) {
    parts.push(`بهترین عادت: ${bestHabit.title} (${fa(bestDays)} روز)`);
  }
  if (thisDone !== lastDone) {
    const diff = thisDone - lastDone;
    const arrow = diff > 0 ? '↑' : '↓';
    const adj = Math.abs(diff);
    parts.push(`${fa(adj)} روز ${diff > 0 ? 'بهتر' : 'کمتر'} از هفتهٔ قبل ${arrow}`);
  } else if (thisDone > 0) {
    parts.push('هم‌اندازهٔ هفتهٔ قبل ادامه دادی — ثبات عالی');
  }

  return { empty: false, title: parts.slice(0, 2).join(' '), details: parts.join(' ') };
}
