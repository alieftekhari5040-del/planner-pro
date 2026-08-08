import { buildInsight, buildKpis } from '../lib/analytics';
import { useStore } from '../store';
import { Microlabel, SectionTitle } from './ui';
import WeekBars from './charts/WeekBars';
import Trend30 from './charts/Trend30';
import Heatmap from './charts/Heatmap';
import HabitBars from './charts/HabitBars';

function KpiCard({
  label,
  value,
  delta,
  deltaDir,
  index,
}: {
  label: string;
  value: string;
  delta: string | null;
  deltaDir: 'up' | 'down' | 'flat';
  index: number;
}) {
  const color =
    deltaDir === 'up' ? '#34d399' : deltaDir === 'down' ? 'var(--accent)' : 'var(--muted)';
  return (
    <div
      className="glass glass--sm p-4"
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      <div className="microlabel">{label}</div>
      {/* Persian RTL (default) so number+unit strings like «۵ روز» keep correct order */}
      <div className="fa-balance mt-1 text-2xl font-black text-[#f0ecff]">
        {value}
      </div>
      <div className="mt-1 text-xs font-semibold" style={{ color }}>
        {delta == null ? (
          '—'
        ) : (
          <>
            <span style={{ color }} aria-hidden="true">
              {deltaDir === 'up' ? '▲' : deltaDir === 'down' ? '▼' : '•'}{' '}
            </span>
            <span style={{ color }}>{delta}</span>
            <span className="mr-1 text-[#8f8fb8] font-normal">نسبت به قبل</span>
          </>
        )}
      </div>
    </div>
  );
}

function ChartCard({
  title,
  en,
  children,
  ltr = true,
}: {
  title: string;
  en: string;
  children: React.ReactNode;
  ltr?: boolean;
}) {
  return (
    <section className="glass glass--sm p-5">
      <SectionTitle>{title}</SectionTitle>
      <div className="mt-1">
        <Microlabel en>{en}</Microlabel>
      </div>
      <div className="mt-4" dir={ltr ? 'ltr' : 'rtl'} style={ltr ? { textAlign: 'left' } : undefined}>
        {children}
      </div>
    </section>
  );
}

export default function StatsView() {
  const { data } = useStore();
  const insight = buildInsight(data, data.habits);
  const kpis = buildKpis(data);

  return (
    <div className="space-y-5" id="panel-stats">
      {/* insight summary */}
      <section className="glass glass--sm p-5">
        <SectionTitle>خلاصه‌ی هوشمند</SectionTitle>
        {insight.empty ? (
          <p className="mt-3 text-base font-semibold text-[#b9a7ff]">{insight.title}</p>
        ) : (
          <>
            <p className="mt-2 text-lg font-bold leading-loose text-[#f0ecff]">{insight.title}</p>
            <p className="mt-1 text-sm leading-loose text-[#8f8fb8]">{insight.details}</p>
          </>
        )}
      </section>

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {kpis.map((k, i) => (
          <KpiCard key={k.id} {...k} index={i} />
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <ChartCard title="هفت روز اخیر" en="LAST 7 DAYS">
          <WeekBars />
        </ChartCard>
        <ChartCard title="روند ۳۰ روز" en="30 DAY TREND">
          <Trend30 />
        </ChartCard>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <ChartCard title="نقشه فعالیت ۱۵ هفته" en="15-WEEK ACTIVITY">
          <Heatmap />
        </ChartCard>
        <ChartCard title="ثبات عادت‌ها" en="HABIT CONSISTENCY" ltr={false}>
          <HabitBars />
        </ChartCard>
      </div>
    </div>
  );
}
