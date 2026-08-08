import { faDigits } from '../lib/jalali';

/** SVG daily progress ring with gradient stroke + glow. */
export default function ProgressRing({
  percent,
  size = 46,
  stroke = 5,
}: {
  percent: number;
  size?: number;
  stroke?: number;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - Math.max(0, Math.min(100, percent)) / 100);

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
      role="img"
      aria-label={`پیشرفت امروز ${faDigits(percent)} درصد`}
    >
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id="ring-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#b9a7ff" />
            <stop offset="100%" stopColor="#7c5cff" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgba(45,45,94,0.7)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="url(#ring-grad)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.6s ease', filter: 'drop-shadow(0 0 6px rgba(124,92,255,0.6))' }}
        />
      </svg>
      <span
        className="absolute text-[0.6rem] font-bold"
        style={{ color: 'var(--lavender)', direction: 'ltr' }}
      >
        {faDigits(percent)}
      </span>
    </div>
  );
}
