import { describe, it, expect } from 'vitest';
import {
  dateToIso,
  isoToDate,
  addDaysIso,
  subDaysIso,
  daysOfWeek,
  startOfWeekIso,
  jalaliWeekday,
  diffDays,
  faDigits,
} from '../src/lib/jalali';

describe('jalali date helpers', () => {
  it('round-trips iso <-> date', () => {
    expect(dateToIso(isoToDate('2025-08-15'))).toBe('2025-08-15');
  });

  it('add/sub days', () => {
    expect(addDaysIso('2025-08-15', 1)).toBe('2025-08-16');
    expect(subDaysIso('2025-08-15', 1)).toBe('2025-08-14');
  });

  it('diffDays computes day difference', () => {
    expect(diffDays('2025-08-15', '2025-08-20')).toBe(5);
    expect(diffDays('2025-08-20', '2025-08-15')).toBe(-5);
  });

  it('week starts on Saturday (Jalali weekday index 0 = شنبه)', () => {
    // 2025-08-15 is a Friday (جمعه) in Jalali. Week should start 2025-08-09 (شنبه).
    const start = startOfWeekIso('2025-08-15');
    expect(jalaliWeekday(start)).toBe(0);
    const week = daysOfWeek('2025-08-15');
    expect(week).toHaveLength(7);
    expect(week[0]).toBe(start);
    // consecutive days
    for (let i = 1; i < 7; i++) {
      expect(addDaysIso(week[i - 1], 1)).toBe(week[i]);
    }
    // weekdays map 0..6
    week.forEach((d, i) => expect(jalaliWeekday(d)).toBe(i));
  });

  it('faDigits converts English digits', () => {
    expect(faDigits('2025-08-15')).toBe('۲۰۲۵-۰۸-۱۵');
    expect(faDigits(42)).toBe('۴۲');
  });
});
