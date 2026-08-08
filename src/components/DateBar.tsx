import { useCallback, useEffect, useRef, useState } from 'react';
import {
  addDaysIso,
  daysOfWeek,
  faDigits,
  isToday,
  jalaliDay,
  jalaliFull,
  jalaliMonthName,
  jalaliWeekday,
  jalaliYear,
  subDaysIso,
  todayIso,
} from '../lib/jalali';
import { format } from 'date-fns-jalali';
import { WEEKDAYS } from '../lib/constants';
import { dayIsActive } from '../lib/analytics';
import { useStore } from '../store';
import { playTick } from '../lib/sound';

/** First day of the Jalali month containing `iso`. */
function jalaliMonthStart(iso: string): string {
  const target = format(new Date(`${iso}T00:00:00`), 'yyyy-MM');
  let cur = iso;
  let guard = 0;
  while (format(new Date(`${cur}T00:00:00`), 'yyyy-MM') === target && guard < 32) {
    cur = subDaysIso(cur, 1);
    guard++;
  }
  return addDaysIso(cur, 1);
}

function daysInMonth(monthStartIso: string): number {
  // next month first day minus one
  const nextMonth = jalaliMonthStart(addDaysIso(monthStartIso, 35));
  let d = monthStartIso;
  let count = 0;
  while (d < nextMonth) {
    d = addDaysIso(d, 1);
    count++;
  }
  return count;
}

function CalendarGrid({
  monthStart,
  selected,
  onPick,
  onClose,
  isDayActive,
}: {
  monthStart: string;
  selected: string;
  onPick: (iso: string) => void;
  onClose: () => void;
  isDayActive: (iso: string) => boolean;
}) {
  const wd = jalaliWeekday(monthStart);
  const dim = daysInMonth(monthStart);
  const cells: { iso: string; dom: number; inMonth: boolean }[] = [];
  for (let i = 0; i < 42; i++) {
    const iso = addDaysIso(monthStart, i - wd);
    const dom = i - wd + 1;
    cells.push({ iso, dom, inMonth: dom >= 1 && dom <= dim });
  }

  return (
    <div className="mt-3">
      <div className="grid grid-cols-7 gap-1 text-center text-[0.65rem] font-semibold text-[#8f8fb8]">
        {WEEKDAYS.map((w) => (
          <div key={w} className="py-1">{w}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((c) => {
          const sel = c.iso === selected;
          const today = isToday(new Date(`${c.iso}T00:00:00`));
          const active = isDayActive(c.iso);
          return (
            <button
              key={c.iso}
              onClick={() => onPick(c.iso)}
              className={`relative aspect-square rounded-lg text-xs font-semibold transition-colors ${
                !c.inMonth ? 'text-[#4a4a72]' : sel
                  ? 'bg-[#7c5cff] text-white shadow-[0_0_16px_rgba(124,92,255,0.6)]'
                  : today
                    ? 'bg-[#7c5cff]/20 text-[#b9a7ff] hover:bg-[#7c5cff]/30'
                    : 'text-[#e6e0ff] hover:bg-white/5'
              }`}
            >
              {faDigits(c.dom)}
              {active && (
                <span
                  className="absolute left-1/2 top-1 h-1.5 w-1.5 -translate-x-1/2 rounded-full"
                  style={{ background: 'var(--accent)', boxShadow: '0 0 8px rgba(255,59,79,0.8)' }}
                />
              )}
            </button>
          );
        })}
      </div>
      <div className="mt-2 flex justify-end">
        <button className="btn btn--ghost px-3 py-1 text-xs" onClick={onClose}>
          بستن
        </button>
      </div>
    </div>
  );
}

export default function DateBar({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (iso: string) => void;
}) {
  const { data } = useStore();
  const [open, setOpen] = useState(false);
  const [monthStart, setMonthStart] = useState(() => jalaliMonthStart(selected));
  const popRef = useRef<HTMLDivElement>(null);
  const touchX = useRef<number | null>(null);

  const weekDays = daysOfWeek(selected);
  const today = todayIso();

  // keep popover month in sync when the selected date changes externally
  useEffect(() => {
    setMonthStart(jalaliMonthStart(selected));
  }, [selected]);

  // close on outside click / escape
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (popRef.current && !popRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    window.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  // keyboard navigation (skip when typing in a field)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA')) return;
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        onSelect(subDaysIso(selected, 1));
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        onSelect(addDaysIso(selected, 1));
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selected, onSelect]);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    touchX.current = e.touches[0].clientX;
  }, []);
  const onTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (touchX.current == null) return;
      const dx = e.changedTouches[0].clientX - touchX.current;
      if (Math.abs(dx) > 50) {
        if (dx > 0) onSelect(subDaysIso(selected, 1));
        else onSelect(addDaysIso(selected, 1));
      }
      touchX.current = null;
    },
    [selected, onSelect]
  );

  return (
    <div
      className="glass glass--sm px-4 py-3"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div className="flex items-center gap-3">
        {/* prev day (RTL: right arrow) */}
        <button
          className="btn btn--ghost h-10 w-10"
          aria-label="روز قبل"
          onClick={() => {
            onSelect(subDaysIso(selected, 1));
            playTick();
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m9 18 6-6-6-6" />
          </svg>
        </button>

        {/* clickable date label */}
        <button
          className="btn flex-1 flex-col rounded-xl px-2 py-1 hover:bg-white/5"
          onClick={() => setOpen((o) => !o)}
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-label="تقویم"
        >
          <span className="text-base font-bold text-[#f0ecff]">
            {jalaliFull(selected)}
          </span>
          <span className="text-[0.65rem] text-[#8f8fb8]">
            {selected === today ? 'امروز' : jalaliFull(today) === jalaliFull(selected) ? 'امروز' : 'انتخاب‌شده'}
          </span>
        </button>

        {/* next day */}
        <button
          className="btn btn--ghost h-10 w-10"
          aria-label="روز بعد"
          onClick={() => {
            onSelect(addDaysIso(selected, 1));
            playTick();
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>

        <button
          className="btn btn--primary px-4 py-2 text-sm"
          onClick={() => onSelect(today)}
        >
          امروز
        </button>
      </div>

      {/* week chips */}
      <div className="mt-3 grid grid-cols-7 gap-1">
        {weekDays.map((d, i) => {
          const sel = d === selected;
          return (
            <button
              key={d}
              onClick={() => onSelect(d)}
              className={`flex flex-col items-center gap-0.5 rounded-lg py-1.5 text-xs transition-colors ${
                sel
                  ? 'bg-[#7c5cff]/25 text-[#b9a7ff]'
                  : 'text-[#8f8fb8] hover:bg-white/5'
              }`}
            >
              <span>{WEEKDAYS[i]}</span>
              <span className="text-[0.6rem] font-bold" style={{ direction: 'ltr' }}>
                {faDigits(jalaliDay(d))}
              </span>
            </button>
          );
        })}
      </div>

      {/* calendar popover */}
      {open && (
        <div
          ref={popRef}
          role="dialog"
          aria-label="تقویم جلالی"
          className="glass glass--sm mt-3 animate-[popIn_0.2s_ease-out] p-3"
        >
          <div className="flex items-center justify-between">
            <button
              className="btn btn--ghost h-8 w-8 text-xs"
              aria-label="ماه قبل"
              onClick={() => setMonthStart((m) => subDaysIso(m, 40))}
            >
              ›
            </button>
            <div className="text-center">
              <div className="text-sm font-bold">
                {jalaliMonthName(monthStart)} {faDigits(jalaliYear(monthStart))}
              </div>
              <div className="text-[0.6rem] text-[#8f8fb8]">تقویم جلالی</div>
            </div>
            <button
              className="btn btn--ghost h-8 w-8 text-xs"
              aria-label="ماه بعد"
              onClick={() => setMonthStart((m) => addDaysIso(m, 40))}
            >
              ‹
            </button>
          </div>
          <CalendarGrid
            monthStart={monthStart}
            selected={selected}
            onPick={(iso) => {
              onSelect(iso);
              setOpen(false);
            }}
            onClose={() => setOpen(false)}
            isDayActive={(iso) => dayIsActive(data.days[iso])}
          />
        </div>
      )}
    </div>
  );
}
