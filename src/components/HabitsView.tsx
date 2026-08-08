import { useState } from 'react';
import { useStore } from '../store';
import {
  daysOfWeek,
  faDigits,
  jalaliRange,
  jalaliWeekday,
  startOfWeekIso,
  subDaysIso,
  todayIso,
} from '../lib/jalali';
import { WEEKDAYS, HABIT_COLORS, HABIT_PRESETS } from '../lib/constants';
import { habitStreak, habitBestStreak, habitDaysInWeek } from '../lib/analytics';
import { uid } from '../lib/storage';
import { Confirm, EmptyState, SectionTitle } from './ui';
import { playBlip, playStreak } from '../lib/sound';

export default function HabitsView() {
  const { data, update, setDay, getDay } = useStore();
  const [weekStart, setWeekStart] = useState(() => startOfWeekIso(todayIso()));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const weekDays = daysOfWeek(weekStart);
  const weekEnd = weekDays[6];

  const toggleCell = (dayIso: string, habitId: string) => {
    const next = !(getDay(dayIso).habits[habitId]);
    setDay(dayIso, (d) => {
      d.habits[habitId] = next;
      return d;
    });
    if (next) {
      // streak bling when hitting a milestone
      const newStreak = habitStreak(data, habitId, dayIso);
      if (newStreak > 0 && newStreak % 7 === 0) playStreak();
      else playBlip();
    }
  };

  const addPreset = (title: string, icon: string) => {
    const color = HABIT_COLORS[data.habits.length % HABIT_COLORS.length];
    update((d) => {
      d.habits.push({
        id: uid(),
        title,
        icon,
        color,
        createdAt: todayIso(),
      });
      return d;
    });
    playBlip();
  };

  const addCustom = () => {
    const title = draft.trim();
    if (!title) return;
    const color = HABIT_COLORS[data.habits.length % HABIT_COLORS.length];
    update((d) => {
      d.habits.push({
        id: uid(),
        title,
        icon: '📌',
        color,
        createdAt: todayIso(),
      });
      return d;
    });
    setDraft('');
  };

  const commitRename = () => {
    if (editingId) {
      const title = draft.trim();
      if (title) {
        update((d) => {
          const h = d.habits.find((x) => x.id === editingId);
          if (h) h.title = title;
          return d;
        });
      }
    }
    setEditingId(null);
    setDraft('');
  };

  const weeklyCount = (habitId: string) => habitDaysInWeek(data, habitId, weekStart);

  const totalHabits = data.habits.length;

  return (
    <div className="space-y-5" id="panel-habits">
      {/* week navigation */}
      <section className="glass glass--sm flex flex-wrap items-center gap-3 px-4 py-3">
        <button className="btn btn--ghost h-9 w-9" aria-label="هفته قبل"
          onClick={() => setWeekStart((w) => subDaysIso(w, 7))}>
          ›
        </button>
        <button className="btn btn--ghost h-9 w-9" aria-label="هفته بعد"
          onClick={() => setWeekStart((w) => subDaysIso(w, -7))}>
          ‹
        </button>
        <div className="flex-1 text-center">
          <div className="text-sm font-bold text-[#f0ecff]">
            {jalaliRange(weekStart, weekEnd)}
          </div>
          <div className="text-[0.65rem] text-[#8f8fb8]">هفته‌ی انتخابی</div>
        </div>
        <button
          className="btn btn--primary px-4 py-2 text-sm"
          onClick={() => setWeekStart(startOfWeekIso(todayIso()))}
        >
          این هفته
        </button>
      </section>

      {/* add habit */}
      <section className="glass glass--sm p-5">
        <SectionTitle>افزودن عادت</SectionTitle>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {HABIT_PRESETS.map((p) => (
            <button
              key={p.title}
              className="btn btn--ghost px-3 py-2 text-sm"
              onClick={() => addPreset(p.title, p.icon)}
            >
              <span aria-hidden="true">{p.icon}</span> {p.title}
            </button>
          ))}
        </div>
        <div className="mt-3 flex gap-2">
          <input
            className="field flex-1"
            placeholder="عادت دلخواه…"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') addCustom();
            }}
          />
          <button className="btn btn--primary px-4 text-sm" onClick={addCustom}>
            افزودن
          </button>
        </div>
      </section>

      {/* matrix */}
      {totalHabits === 0 ? (
        <section className="glass glass--sm p-5">
          <EmptyState
            title="هنوز عادتی نداری"
            sub="یک عادت از پیشنهادها اضافه کن تا پیگیری شروع شود"
          />
        </section>
      ) : (
        <section className="glass glass--sm p-4 overflow-x-auto">
          <div className="min-w-[560px]">
            {/* header row */}
            <div className="grid grid-cols-[minmax(150px,1fr)_repeat(7,44px)_44px_44px] gap-1.5 items-center pb-2 text-center">
              <div className="text-[0.62rem] font-semibold text-[#8f8fb8]">عادت</div>
              {weekDays.map((d) => (
                <div key={d} className="text-[0.62rem] font-semibold text-[#8f8fb8]">
                  {WEEKDAYS[jalaliWeekday(d)]}
                  <div className="text-[0.55rem]" style={{ direction: 'ltr' }}>
                    {faDigits(d.slice(8))}
                  </div>
                </div>
              ))}
              <div className="text-[0.62rem] text-[#8f8fb8]">🔥</div>
              <div className="text-[0.62rem] text-[#8f8fb8]">بهترین</div>
            </div>

            {data.habits.map((habit) => {
              const cur = habitStreak(data, habit.id);
              const best = habitBestStreak(data, habit.id);
              return (
                <div
                  key={habit.id}
                  className="grid grid-cols-[minmax(150px,1fr)_repeat(7,44px)_44px_44px] gap-1.5 items-center border-t border-[#2d2d5e] py-1.5"
                >
                  {/* habit name (inline editable) */}
                  <div className="group-row flex items-center gap-1.5 min-w-0">
                    <span aria-hidden="true">{habit.icon}</span>
                    {editingId === habit.id ? (
                      <input
                        autoFocus
                        className="field py-1 text-sm"
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        onBlur={commitRename}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') commitRename();
                        }}
                      />
                    ) : (
                      <button
                        className="truncate text-sm font-semibold text-[#f0ecff] hover:text-[#b9a7ff]"
                        onClick={() => {
                          setEditingId(habit.id);
                          setDraft(habit.title);
                        }}
                        title="برای ویرایش کلیک کن"
                      >
                        {habit.title}
                      </button>
                    )}
                    <button
                      className="row-delete text-sm"
                      aria-label={`حذف ${habit.title}`}
                      title="حذف عادت"
                      onClick={() => setConfirmId(habit.id)}
                    >
                      ✕
                    </button>
                  </div>

                  {weekDays.map((d) => {
                    const done = !!getDay(d).habits[habit.id];
                    const isTodayD = d === todayIso();
                    return (
                      <button
                        key={d}
                        aria-pressed={done}
                        aria-label={`${habit.title} ${WEEKDAYS[jalaliWeekday(d)]}`}
                        onClick={() => toggleCell(d, habit.id)}
                        className="mx-auto grid h-9 w-9 place-items-center rounded-lg border transition-all"
                        style={{
                          borderColor: done ? habit.color : 'var(--line)',
                          background: done
                            ? `${habit.color}2e`
                            : 'rgba(22,22,58,0.5)',
                          boxShadow: done ? `0 0 12px ${habit.color}66` : 'none',
                          outline: isTodayD ? `1.5px dashed ${habit.color}` : 'none',
                          outlineOffset: 2,
                        }}
                      >
                        {done && (
                          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke={habit.color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 6 9 17l-5-5" />
                          </svg>
                        )}
                      </button>
                    );
                  })}

                  <div className="text-center text-sm font-bold" style={{ direction: 'ltr' }}>
                    <span className="text-lg" aria-hidden="true">🔥</span>
                    <span className="mr-0.5 text-[#f0ecff]">{faDigits(cur)}</span>
                  </div>
                  <div className="text-center text-sm font-bold text-[#b9a7ff]" style={{ direction: 'ltr' }}>
                    {faDigits(best)}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* per-habit weekly summary strip */}
      {totalHabits > 0 && (
        <section className="glass glass--sm p-5">
          <SectionTitle>خلاصه‌ی این هفته</SectionTitle>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {data.habits.map((h) => (
              <div key={h.id} className="flex items-center gap-2 rounded-xl border border-[#2d2d5e] bg-[#16163a]/50 px-3 py-2">
                <span aria-hidden="true">{h.icon}</span>
                <span className="text-sm text-[#e6e0ff]">{h.title}</span>
                <span className="mr-auto text-sm font-bold" style={{ color: h.color }}>
                  {faDigits(weeklyCount(h.id))} از {faDigits(7)} روز
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      <Confirm
        open={!!confirmId}
        title="حذف عادت"
        message="این عادت و سوابق هفتگی‌اش حذف شود؟"
        onCancel={() => setConfirmId(null)}
        onConfirm={() => {
          if (confirmId) {
            update((d) => {
              d.habits = d.habits.filter((h) => h.id !== confirmId);
              for (const key of Object.keys(d.days)) {
                if (d.days[key]) delete d.days[key].habits[confirmId];
              }
              return d;
            });
          }
          setConfirmId(null);
        }}
      />
    </div>
  );
}
