export const ZWNJ = '\u200c';

// Weekday labels شنبه..جمعه (Jalali week starts Saturday)
export const WEEKDAYS = [
  'شنبه',
  'یکشنبه',
  'دوشنبه',
  'سه' + ZWNJ + 'شنبه',
  'چهارشنبه',
  'پنجشنبه',
  'جمعه',
];

export const WEEKDAYS_SHORT = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'];

export const MONTHS = [
  'فروردین',
  'اردیبهشت',
  'خرداد',
  'تیر',
  'مرداد',
  'شهریور',
  'مهر',
  'آبان',
  'آذر',
  'دی',
  'بهمن',
  'اسفند',
];

// Auto colors for habits
export const HABIT_COLORS = [
  '#7c5cff',
  '#b9a7ff',
  '#ff3b4f',
  '#4fd1c5',
  '#f6ad55',
  '#63b3ed',
  '#f472b6',
  '#a3e635',
  '#fbbf24',
  '#60a5fa',
];

export const HABIT_PRESETS: { title: string; icon: string }[] = [
  { title: 'مطالعه', icon: '📚' },
  { title: 'تسک رشد فردی', icon: '🧗' },
  { title: 'تمرین / بدنسازی', icon: '💪' },
];

export const STORAGE_KEY = 'ascent-data-v1';
