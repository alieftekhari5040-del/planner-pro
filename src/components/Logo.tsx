/** THE ASCENT BLUEPRINT logo — three vertical rounded bars (white / lavender / violet). */
export default function Logo({ size = 38 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 512 512"
      role="img"
      aria-label="لوگوی برنامه‌ی روزانه"
    >
      <defs>
        <linearGradient id="ascent-v" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#9b7bff" />
          <stop offset="1" stopColor="#7c5cff" />
        </linearGradient>
      </defs>
      <rect x="180" y="292" width="46" height="120" rx="23" fill="#f0ecff" />
      <rect x="233" y="232" width="46" height="180" rx="23" fill="#b9a7ff" />
      <rect x="286" y="160" width="46" height="252" rx="23" fill="url(#ascent-v)" />
    </svg>
  );
}
