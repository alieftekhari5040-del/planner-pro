import { useState } from 'react';
import { useStore } from '../../store';
import {
  daysOfWeek,
  faDigits,
  jalaliFull,
  jalaliWeekday,
  startOfWeekIso,
  subDaysIso,
  todayIso,
} from '../../lib/jalali';
import { WEEKDAYS } from '../../lib/constants';
import { ChartTooltip } from '../ui';

const CELL = 13;
const GAP = 3;
const COLS = 15;
const LEFT = 22;

export default function Heatmap() {
  const { getDay } = useStore();
  const [tip, setTip] = useState<{ x: number; y: number; iso: string } | null>(null);

  const today = todayIso();
  const curWeekStart = startOfWeekIso(today);

  // columns = weeks (oldest -> newest), rows = weekdays (شنبه -> جمعه)
  const weeks: string[][] = [];
  for (let w = 0; w < COLS; w++) {
    const ws = subDaysIso(curWeekStart, (COLS - 1 - w) * 7);
    weeks.push(daysOfWeek(ws));
  }

  const activity = (iso: string): number => {
    const d = getDay(iso);
    const tasksDone = d.tasks.filter((t) => t.done).length;
    const habitsDone = Object.values(d.habits).filter(Boolean).length;
    return tasksDone + habitsDone;
  };

  const values = weeks.flatMap((week) => week.map(activity));
  const max = Math.max(1, ...values);

  const totalW = LEFT + COLS * CELL + (COLS - 1) * GAP;
  const totalH = 7 * CELL + 6 * GAP;

  return (
    <div className="overflow-x-auto">
      <svg
        width={totalW}
        height={totalH}
        style={{ display: 'block', direction: 'ltr', minWidth: totalW }}
        onMouseLeave={() => setTip(null)}
      >
        {/* weekday labels */}
        {Array.from({ length: 7 }, (_, r) => (
          <text
            key={r}
            x={LEFT - 5}
            y={r * (CELL + GAP) + CELL - 3}
            textAnchor="end"
            fontSize="8"
            fill="#8f8fb8"
            fontFamily="Vazirmatn"
          >
            {r % 2 === 0 ? WEEKDAYS[r] : ''}
          </text>
        ))}
        {weeks.map((week, w) =>
          week.map((d, r) => {
            const v = activity(d);
            const alpha = v === 0 ? 0.06 : 0.25 + 0.6 * (v / max);
            const x = LEFT + w * (CELL + GAP);
            const y = r * (CELL + GAP);
            const isTodayD = d === today;
            return (
              <rect
                key={d}
                x={x}
                y={y}
                width={CELL}
                height={CELL}
                rx={3}
                fill={v === 0 ? 'rgba(124,92,255,0.05)' : `rgba(124,92,255,${alpha.toFixed(2)})`}
                stroke={isTodayD ? '#b9a7ff' : 'transparent'}
                strokeWidth={isTodayD ? 1.2 : 0}
                style={{ cursor: 'pointer' }}
                onMouseMove={(e) => setTip({ x: e.clientX, y: e.clientY, iso: d })}
                onMouseEnter={(e) => setTip({ x: e.clientX, y: e.clientY, iso: d })}
              />
            );
          })
        )}
      </svg>
      {tip && (
        <ChartTooltip x={tip.x} y={tip.y} visible={!!tip}>
          <div className="font-bold">{jalaliFull(tip.iso)}</div>
          <div className="text-[#b9a7ff]">
            {faDigits(activity(tip.iso))} فعالیت · {faDigits(jalaliWeekday(tip.iso) + 1)}‍مین روز هفته
          </div>
        </ChartTooltip>
      )}
    </div>
  );
}
