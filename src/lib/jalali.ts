import {
  addDays,
  subDays,
  differenceInCalendarDays,
  format,
  getDay,
  isToday,
  parseISO,
  startOfWeek,
} from 'date-fns-jalali';
import { faIR } from 'date-fns-jalali/locale';
import { MONTHS } from './constants';

const FA_DIGITS = '۰۱۲۳۴۵۶۷۸۹';

/** Convert Latin (and English) digits to Persian digits. */
export function faDigits(input: string | number): string {
  return String(input).replace(/[0-9]/g, (d) => FA_DIGITS[Number(d)]);
}

/** ISO date key (YYYY-MM-DD) -> JS Date at local midnight. */
export function isoToDate(iso: string): Date {
  return parseISO(iso);
}

/** JS Date -> ISO date key (YYYY-MM-DD). */
export function dateToIso(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function todayIso(): string {
  return dateToIso(new Date());
}

export function addDaysIso(iso: string, n: number): string {
  return dateToIso(addDays(isoToDate(iso), n));
}

export function subDaysIso(iso: string, n: number): string {
  return dateToIso(subDays(isoToDate(iso), n));
}

/** Difference in whole days: b - a. */
export function diffDays(aIso: string, bIso: string): number {
  return differenceInCalendarDays(isoToDate(bIso), isoToDate(aIso));
}

/** Jalali weekday index with week starting Saturday: 0=شنبه .. 6=جمعه */
export function jalaliWeekday(iso: string): number {
  // date-fns getDay returns 0=Sunday..6=Saturday. Shift so Saturday=0.
  const d = getDay(isoToDate(iso)); // 0..6 (Sun=0)
  return (d + 1) % 7; // Sat=0, Sun=1, ... Fri=6
}

/** First day (Saturday) of the Jalali week containing `iso`. */
export function startOfWeekIso(iso: string): string {
  // date-fns-jalali startOfWeek with weekStartsOn=6 (Saturday)
  const s = startOfWeek(isoToDate(iso), { weekStartsOn: 6 });
  return dateToIso(s);
}

/** All 7 ISO days of the Jalali week containing `iso`. */
export function daysOfWeek(iso: string): string[] {
  const start = startOfWeekIso(iso);
  return Array.from({ length: 7 }, (_, i) => addDaysIso(start, i));
}

/** Jalali day-of-month. */
export function jalaliDay(iso: string): number {
  return Number(format(isoToDate(iso), 'd'));
}

/** Jalali month name (e.g. «مرداد»). */
export function jalaliMonthName(iso: string): string {
  const m = Number(format(isoToDate(iso), 'M')) - 1;
  return MONTHS[m] ?? '';
}

/** Jalali year (e.g. ۱۴۰۴). */
export function jalaliYear(iso: string): number {
  return Number(format(isoToDate(iso), 'yyyy'));
}

/**
 * Full Jalali date label in Persian: «شنبه ۱۸ مرداد ۱۴۰۴».
 */
export function jalaliFull(iso: string): string {
  return faDigits(format(isoToDate(iso), 'EEEE d MMMM yyyy', { locale: faIR }));
}

/**
 * Short Jalali label for ranges: «۱۲ تا ۱۸ مرداد ۱۴۰۴»
 * (handles month/year rollover).
 */
export function jalaliRange(startIso: string, endIso: string): string {
  const s = format(isoToDate(startIso), 'd MMMM yyyy', { locale: faIR });
  const e = format(isoToDate(endIso), 'd MMMM yyyy', { locale: faIR });
  if (s === e) return faDigits(s);
  return faDigits(`${s} تا ${e}`);
}

export { isToday, addDays };
