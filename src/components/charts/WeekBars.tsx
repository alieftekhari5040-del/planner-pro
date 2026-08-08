import { useState } from 'react';
import { useStore } from '../../store';
import { completion } from '../../lib/analytics';
import { addDaysIso, faDigits, jalaliFull, subDaysIso, todayIso } from '../../lib/jalali';
import { WEEKDAYS_SHORT } from '../../lib/constants';
import { ChartTooltip } from '../ui';

const W = 340;
const H = 150;
const PAD = { t: 12, r: 8, b: 24, l: 8 };

export default function WeekBars() {
  const { getDay } = useStore();
  const [tip, setTip] = useState<{ x: number; y: number; iso: string } | null>(null);

  const today = todayIso();
  const days = Array.from({ length: 7 }, (_, i) => subDaysIso(today, 6 - i));
  const data = days.map((d) => completion(getDay(d)));

  const innerW = W - PAD.l - PAD.r;
  const innerH = H - PAD.t - PAD.b;
  const slot = innerW / 7;
  const barW = Math.min(30, slot * 0.55);
  const maxH = innerH;

  const tipIso = tip ? addDaysIso(tip.iso, 0) : null;
  const tipData = tipIso ? completion(getDay(tipIso)) : null;

  return (
    <div>
      <svg
        width="100%"
        viewBox={`0 0 ${W} ${H}`}
        style={{ display: 'block', direction: 'ltr' }}
        onMouseLeave={() => setTip(null)}
      >
        {/* gridlines */}
        {[0, 0.5, 1].map((g) => (
          <line
            key={g}
            x1={PAD.l}
            x2={W - PAD.r}
            y1={PAD.t + innerH * (1 - g)}
            y2={PAD.t + innerH * (1 - g)}
            stroke="rgba(124,92,255,0.12)"
            strokeDasharray="3 4"
          />
        ))}
        <defs>
          <linearGradient id="wb-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#b9a7ff" />
            <stop offset="100%" stopColor="#7c5cff" />
          </linearGradient>
        </defs>
        {data.map((d, i) => {
          const x = PAD.l + i * slot + (slot - barW) / 2;
          const bh = (d.pct / 100) * maxH;
          const y = PAD.t + maxH - bh;
          const cx = PAD.l + i * slot + slot / 2;
          return (
            <g key={days[i]}>
              <rect
                x={PAD.l + i * slot}
                y={PAD.t}
                width={slot}
                height={innerH}
                fill="transparent"
                onMouseMove={(e) =>
                  setTip({ x: e.clientX, y: e.clientY, iso: days[i] })
                }
                onMouseEnter={(e) =>
                  setTip({ x: e.clientX, y: e.clientY, iso: days[i] })
                }
              />
              {d.total > 0 && (
                <rect
                  x={x}
                  y={y}
                  width={barW}
                  height={bh}
                  rx={5}
                  fill="url(#wb-grad)"
                  style={{ filter: 'drop-shadow(0 0 8px rgba(124,92,255,0.5))', transition: 'height .4s ease, y .4s ease' }}
                />
              )}
              <text
                x={cx}
                y={H - 6}
                textAnchor="middle"
                fontSize="10"
                fill="#8f8fb8"
                fontFamily="Vazirmatn"
              >
                {WEEKDAYS_SHORT[i]}
              </text>
            </g>
          );
        })}
      </svg>
      <ChartTooltip x={tip?.x ?? 0} y={tip?.y ?? 0} visible={!!tip && !!tipIso}>
        {tipIso && tipData && (
          <>
            <div className="font-bold">{jalaliFull(tipIso)}</div>
            <div className="text-[#b9a7ff]">
              {faDigits(tipData.pct)}٪ · {faDigits(tipData.done)} از {faDigits(tipData.total)} تسک
            </div>
          </>
        )}
      </ChartTooltip>
    </div>
  );
}
