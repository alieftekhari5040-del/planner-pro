import { useState } from 'react';
import type { Task } from '../types';
import { useStore } from '../store';
import { uid } from '../lib/storage';
import { faDigits } from '../lib/jalali';
import { SectionTitle, EmptyState } from './ui';
import { playFlip, playSuccess } from '../lib/sound';

function Checkbox({ checked, onToggle }: { checked: boolean; onToggle: () => void }) {
  return (
    <button
      role="checkbox"
      aria-checked={checked}
      onClick={onToggle}
      className="relative h-5 w-5 shrink-0 rounded-md border transition-all"
      style={{
        borderColor: checked ? 'transparent' : 'var(--line)',
        background: checked
          ? 'linear-gradient(135deg,#7c5cff,#9b7bff)'
          : 'rgba(22,22,58,0.7)',
        boxShadow: checked ? '0 0 14px rgba(124,92,255,0.6)' : 'none',
      }}
    >
      <svg
        viewBox="0 0 24 24"
        className="h-3.5 w-3.5 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ opacity: checked ? 1 : 0, transition: 'opacity .15s' }}
      >
        <path d="M20 6 9 17l-5-5" />
      </svg>
    </button>
  );
}

export default function TodayView({ iso }: { iso: string }) {
  const { getDay, setDay } = useStore();
  const day = getDay(iso);

  const upd = (fn: (d: NonNullable<typeof day>) => void) =>
    setDay(iso, (d) => {
      fn(d);
      return d;
    });

  const addSchedule = () => {
    upd((d) => d.schedule.push({ id: uid(), time: '', note: '' }));
  };

  const checkAllDone = (tasks: Task[]) =>
    tasks.length > 0 && tasks.every((t) => t.done);

  const toggleTask = (id: string) => {
    const willDone = !day.tasks.find((t) => t.id === id)?.done;
    upd((d) => {
      const t = d.tasks.find((x) => x.id === id);
      if (t) t.done = willDone;
    });
    if (willDone) {
      // play chime when the last task is completed
      const remaining = day.tasks.filter((t) => !t.done && t.id !== id).length;
      if (remaining === 0 && day.tasks.length > 1) playSuccess();
      else playFlip();
    }
  };

  return (
    <div className="space-y-6" id="panel-today">
      {/* برنامه امروز */}
      <section className="glass glass--sm p-5">
        <SectionTitle>برنامه‌ی امروز</SectionTitle>
        <div className="mt-4 space-y-2">
          {day.schedule.length === 0 && (
            <EmptyState title="هنوز برنامه‌ای نداری" sub="ردیفی اضافه کن تا روزت را بسازی" />
          )}
          {day.schedule.map((row) => (
            <div
              key={row.id}
              className="group-row flex items-center gap-2 rounded-xl border border-[#2d2d5e] bg-[#16163a]/50 p-2"
            >
              <input
                type="time"
                lang="fa"
                className="field w-28 shrink-0 text-center"
                value={row.time}
                aria-label="ساعت"
                onChange={(e) =>
                  upd((d) => {
                    const r = d.schedule.find((x) => x.id === row.id);
                    if (r) r.time = e.target.value;
                  })
                }
              />
              <input
                className="field flex-1"
                placeholder="توضیح…"
                value={row.note}
                aria-label="یادداشت برنامه"
                onChange={(e) =>
                  upd((d) => {
                    const r = d.schedule.find((x) => x.id === row.id);
                    if (r) r.note = e.target.value;
                  })
                }
              />
              <button
                className="row-delete text-lg"
                aria-label="حذف ردیف"
                onClick={() =>
                  upd((d) => {
                    d.schedule = d.schedule.filter((x) => x.id !== row.id);
                  })
                }
              >
                ✕
              </button>
            </div>
          ))}
          <button className="btn btn--ghost w-full py-2.5 text-sm" onClick={addSchedule}>
            <span className="text-base leading-none">+</span> افزودن ردیف
          </button>
        </div>
      </section>

      {/* bottom two panels */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* اولویت کارها */}
        <section className="glass glass--sm p-5">
          <SectionTitle>اولویت کارها</SectionTitle>
          <div className="mt-4 space-y-2">
            {day.tasks.length === 0 && (
              <EmptyState title="کارهای مهم را بنویس" sub="در اولویت، قدم‌های واقعی" />
            )}
            {day.tasks.map((task) => (
              <div
                key={task.id}
                className="group-row flex items-center gap-2 rounded-xl border border-[#2d2d5e] bg-[#16163a]/50 p-2"
              >
                <Checkbox checked={task.done} onToggle={() => toggleTask(task.id)} />
                <input
                  className="field flex-1 border-transparent bg-transparent"
                  value={task.t}
                  aria-label="کار"
                  style={{ textDecoration: task.done ? 'line-through' : 'none', opacity: task.done ? 0.55 : 1, color: task.done ? 'var(--muted)' : 'var(--text)' }}
                  onChange={(e) =>
                    upd((d) => {
                      const t = d.tasks.find((x) => x.id === task.id);
                      if (t) t.t = e.target.value;
                    })
                  }
                />
                <button
                  className="row-delete text-lg"
                  aria-label="حذف کار"
                  onClick={() =>
                    upd((d) => {
                      d.tasks = d.tasks.filter((x) => x.id !== task.id);
                    })
                  }
                >
                  ✕
                </button>
              </div>
            ))}
            <AddInline
              placeholder="کار جدید…"
              onAdd={(v) =>
                upd((d) => {
                  d.tasks.push({ id: uid(), t: v, done: false });
                })
              }
            />
            {day.tasks.length > 0 && (
              <p className="pt-1 text-[0.7rem] text-[#8f8fb8]">
                {faDigits(day.tasks.filter((t) => t.done).length)} از{' '}
                {faDigits(day.tasks.length)} کار انجام شد
                {checkAllDone(day.tasks) ? ' — همه‌چیز تمام شد 🎉' : ''}
              </p>
            )}
          </div>
        </section>

        {/* اهداف امروز */}
        <section className="glass glass--sm p-5">
          <SectionTitle>اهداف امروز</SectionTitle>
          <div className="mt-4 space-y-2">
            {day.goals.length === 0 && (
              <EmptyState title="هدف امروزت چیست؟" sub="یک هدف مشخص و کوچک" />
            )}
            {day.goals.map((g, i) => (
              <div
                key={i}
                className="group-row flex items-center gap-2 rounded-xl border border-[#2d2d5e] bg-[#16163a]/50 p-2"
              >
                <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: 'var(--border)' }} />
                <input
                  className="field flex-1 border-transparent bg-transparent"
                  value={g}
                  aria-label="هدف"
                  onChange={(e) =>
                    upd((d) => {
                      d.goals[i] = e.target.value;
                    })
                  }
                />
                <button
                  className="row-delete text-lg"
                  aria-label="حذف هدف"
                  onClick={() => upd((d) => void d.goals.splice(i, 1))}
                >
                  ✕
                </button>
              </div>
            ))}
            <AddInline
              placeholder="هدف جدید…"
              onAdd={(v) => upd((d) => void d.goals.push(v))}
            />
          </div>
        </section>
      </div>

      {/* درس امروز */}
      <section className="glass glass--sm p-5">
        <SectionTitle>درس‌هایی که امروز گرفتم</SectionTitle>
        <div className="mt-4">
          <textarea
            className="field min-h-[140px] leading-loose"
            style={{
              backgroundImage:
                'repeating-linear-gradient(transparent, transparent 31px, rgba(124,92,255,0.12) 32px)',
              lineHeight: '32px',
            }}
            placeholder="یادداشت امروزت را اینجا بنویس…"
            value={day.lessons}
            aria-label="درس‌های امروز"
            onChange={(e) => upd((d) => void (d.lessons = e.target.value))}
          />
        </div>
      </section>
    </div>
  );
}

function AddInline({
  placeholder,
  onAdd,
}: {
  placeholder: string;
  onAdd: (v: string) => void;
}) {
  const [v, setV] = useState('');
  const submit = () => {
    const val = v.trim();
    if (!val) return;
    onAdd(val);
    setV('');
  };
  return (
    <div className="flex items-center gap-2">
      <input
        className="field flex-1"
        placeholder={placeholder}
        value={v}
        onChange={(e) => setV(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') submit();
        }}
      />
      <button className="btn btn--ghost h-10 w-10 text-lg" aria-label="افزودن" onClick={submit}>
        +
      </button>
    </div>
  );
}
