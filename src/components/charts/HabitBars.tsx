import { useStore } from '../../store';
import { habitActiveDays } from '../../lib/analytics';
import { subDaysIso, todayIso } from '../../lib/jalali';
import { faDigits } from '../../lib/jalali';
import { EmptyState } from '../ui';

const DAYS = 28;

export default function HabitBars() {
  const { data } = useStore();
  const today = todayIso();
  const from = subDaysIso(today, DAYS - 1);

  if (data.habits.length === 0) {
    return (
      <EmptyState title="عادتی ثبت نشده" sub="برای دیدن نمودار عادت‌ها را اضافه کن" />
    );
  }

  const items = data.habits.map((h) => {
    const active = habitActiveDays(data, h.id, from, today);
    return { habit: h, active, pct: Math.round((active / DAYS) * 100) };
  });

  return (
    <div className="space-y-3" dir="rtl">
      {items.map(({ habit, active, pct }) => (
        <div key={habit.id} className="flex items-center gap-3">
          <span className="w-7 shrink-0 text-center text-lg" aria-hidden="true">
            {habit.icon}
          </span>
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="truncate font-semibold text-[#e6e0ff]">{habit.title}</span>
              <span className="shrink-0 text-[#8f8fb8]">
                {faDigits(active)} از {faDigits(DAYS)} روز
              </span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-[#16163a]">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${pct}%`,
                  background: `linear-gradient(90deg, ${habit.color}55, ${habit.color})`,
                  boxShadow: `0 0 10px ${habit.color}66`,
                }}
              />
            </div>
          </div>
          <span className="w-12 shrink-0 text-left text-sm font-bold" style={{ color: habit.color }}>
            {faDigits(pct)}٪
          </span>
        </div>
      ))}
    </div>
  );
}
