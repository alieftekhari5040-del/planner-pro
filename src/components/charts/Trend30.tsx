import { useState } from 'react';
import { useStore } from '../../store';
import { completion } from '../../lib/analytics';
import { faDigits, jalaliDay, subDaysIso, todayIso } from '../../lib/jalali';
import { ChartTooltip } from '../ui';

const W = 340;
const H = 160;
const PAD = { t: 14, r: 10, b: 24, l: 10 };

export default function Trend30() {
  const { getDay } = useStore();
  const [tip, setTip] = useState<{ x: number; y: number; iso: string } | null>(null);

  const today = todayIso();
  const days = Array.from({ length: 30 }, (_, i) => subDaysIso(today, 29 - i));
  const data = days.map((d) => completion(getDay(d)).pct);

  const innerW = W - PAD.l - PAD.r;
  const innerH = H - PAD.t - PAD.b;
  const step = innerW / (days.length - 1);
  const max = 100;

  const pts = data.map((v, i) => ({
    x: PAD.l + i * step,
    y: PAD.t + innerH - (v / max) * innerH,
    v,
  }));

  const line = pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const area = `${PAD.l},${PAD.t + innerH} ${line} ${W - PAD.r},${PAD.t + innerH}`;

  return (
    <div>
      <svg
        width="100%"
        viewBox={`0 0 ${W} ${H}`}
        style={{ display: 'block', direction: 'ltr' }}
        onMouseLeave={() => setTip(null)}
      >
        <defs>
          <linearGradient id="t30-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(124,92,255,0.45)" />
            <stop offset="100%" stopColor="rgba(124,92,255,0.02)" />
          </linearGradient>
          <linearGradient id="t30-line" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#b9a7ff" />
            <stop offset="100%" stopColor="#7c5cff" />
          </linearGradient>
        </defs>
        {[0, 50, 100].map((g) => (
          <line
            key={g}
            x1={PAD.l}
            x2={W - PAD.r}
            y1={PAD.t + innerH - (g / 100) * innerH}
            y2={PAD.t + innerH - (g / 100) * innerH}
            stroke="rgba(124,92,255,0.12)"
            strokeDasharray="3 4"
          />
        ))}
        <polygon points={area} fill="url(#t30-area)" />
        <polyline
          points={line}
          fill="none"
          stroke="url(#t30-line)"
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeLinecap="round"
          style={{ filter: 'drop-shadow(0 0 6px rgba(124,92,255,0.6))' }}
        />
        {pts.map((p, i) => (
          <circle
            key={days[i]}
            cx={p.x}
            cy={p.y}
            r="3"
            fill={i === days.length - 1 ? '#b9a7ff' : '#7c5cff'}
            style={{ cursor: 'pointer' }}
            onMouseMove={(e) => setTip({ x: e.clientX, y: e.clientY, iso: days[i] })}
            onMouseEnter={(e) => setTip({ x: e.clientX, y: e.clientY, iso: days[i] })}
          />
        ))}
        {/* x labels every 5 days */}
        {days.map((d, i) => {
          if (i % 5 !== 0 && i !== days.length - 1) return null;
          return (
            <text
              key={d}
              x={pts[i].x}
              y={H - 6}
              textAnchor="middle"
              fontSize="9"
              fill="#8f8fb8"
              fontFamily="Vazirmatn"
            >
              {faDigits(jalaliDay(d))}
            </text>
          );
        })}
      </svg>
      {tip && (
        <ChartTooltip x={tip.x} y={tip.y} visible={!!tip}>
          <div className="font-bold">{faDigits(jalaliDay(tip.iso))} روز پیش</div>
          <div className="text-[#b9a7ff]">{faDigits(completion(getDay(tip.iso)).pct)}٪</div>
        </ChartTooltip>
      )}
    </div>
  );
}
