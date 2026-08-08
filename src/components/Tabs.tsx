import type { TabId } from '../types';

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: 'today', label: 'امروز', icon: '☀️' },
  { id: 'habits', label: 'عادت‌ها', icon: '♻️' },
  { id: 'stats', label: 'آمار', icon: '📈' },
];

function TabButtons({
  active,
  onChange,
}: {
  active: TabId;
  onChange: (t: TabId) => void;
}) {
  return (
    <>
      {TABS.map((t, i) => {
        const selected = active === t.id;
        return (
          <button
            key={t.id}
            role="tab"
            aria-selected={selected}
            aria-controls={`panel-${t.id}`}
            onClick={() => onChange(t.id)}
            className={`relative flex flex-1 flex-col items-center justify-center gap-0.5 py-2.5 text-sm font-semibold transition-colors ${
              selected ? 'text-[#f0ecff]' : 'text-[#8f8fb8] hover:text-[#c8bfff]'
            }`}
            style={{ animationDelay: `${i * 0.04}s` }}
          >
            <span className="text-lg leading-none" aria-hidden="true">{t.icon}</span>
            <span>{t.label}</span>
            {selected && (
              <span
                className="absolute bottom-0 h-0.5 w-10 rounded-full bg-[#7c5cff]"
                style={{ boxShadow: '0 0 12px rgba(124,92,255,0.8)' }}
              />
            )}
          </button>
        );
      })}
    </>
  );
}

export default function Tabs({
  active,
  onChange,
}: {
  active: TabId;
  onChange: (t: TabId) => void;
}) {
  return (
    <>
      {/* Desktop: top tab bar */}
      <div className="hidden md:block">
        <div
          role="tablist"
          aria-label="بخش‌های برنامه"
          className="glass glass--sm inline-flex items-center gap-1 px-2 py-1.5"
        >
          {TABS.map((t, i) => {
            const selected = active === t.id;
            return (
              <button
                key={t.id}
                role="tab"
                aria-selected={selected}
                aria-controls={`panel-${t.id}`}
                onClick={() => onChange(t.id)}
                className={`btn px-5 py-2 text-sm ${
                  selected
                    ? 'bg-[#7c5cff] text-white shadow-[0_4px_18px_rgba(124,92,255,0.45)]'
                    : 'text-[#8f8fb8] hover:text-[#e6e0ff]'
                }`}
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Mobile: fixed bottom bar */}
      <nav
        role="tablist"
        aria-label="بخش‌های برنامه"
        className="glass glass--sm fixed inset-x-3 bottom-3 z-40 flex items-stretch overflow-hidden px-2 md:hidden"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <TabButtons active={active} onChange={onChange} />
      </nav>
    </>
  );
}
