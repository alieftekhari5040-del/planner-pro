import { useEffect, useState } from 'react';
import Logo from './Logo';
import ProgressRing from './ProgressRing';
import { useStore } from '../store';
import { todayIso } from '../lib/jalali';
import { completion } from '../lib/analytics';
import { playBlip } from '../lib/sound';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

function greeting(): string {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return 'صبح بخیر';
  if (h >= 12 && h < 17) return 'عصر بخیر';
  return 'شب بخیر';
}

export default function Header() {
  const { data, update, getDay } = useStore();
  const [installEvt, setInstallEvt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstall, setShowInstall] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallEvt(e as BeforeInstallPromptEvent);
      setShowInstall(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const install = async () => {
    if (!installEvt) return;
    await installEvt.prompt();
    const choice = await installEvt.userChoice;
    if (choice.outcome === 'accepted') setShowInstall(false);
  };

  const dayPct = completion(getDay(todayIso())).pct;

  const toggleSound = () => {
    update((d) => ({ ...d, settings: { sound: !d.settings.sound } }));
    playBlip();
  };

  return (
    <header className="glass glass--sm flex flex-wrap items-center gap-x-4 gap-y-3 px-5 py-4">
      <div className="flex items-center gap-3">
        <Logo />
        <div className="leading-snug">
          <h1 className="text-lg font-black tracking-tight">
            برنامه‌ی <span className="neon">روزانه</span>
          </h1>
          <p className="text-[0.72rem] font-medium text-[#8f8fb8]">
            هر روز یک قدم جلوتر
          </p>
          <p className="microlabel mt-0.5">THE ASCENT BLUEPRINT</p>
        </div>
      </div>

      <div className="hidden items-center gap-2 sm:flex">
        <span className="text-2xl" aria-hidden="true">✦</span>
        <p className="text-sm font-semibold text-[#b9a7ff]">{greeting()}</p>
      </div>

      <div className="mr-auto flex items-center gap-3">
        <div className="flex items-center gap-2 rounded-xl border border-[#2d2d5e] bg-[#16163a]/60 px-3 py-1.5">
          <span className="microlabel hidden sm:inline">امروز</span>
          <ProgressRing percent={dayPct} />
        </div>

        <button
          className="btn btn--ghost h-10 w-10"
          aria-pressed={data.settings.sound}
          aria-label={data.settings.sound ? 'خاموش‌کردن صدا' : 'روشن‌کردن صدا'}
          title={data.settings.sound ? 'خاموش‌کردن صدا' : 'روشن‌کردن صدا'}
          onClick={toggleSound}
        >
          {data.settings.sound ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 5 6 9H2v6h4l5 4V5z" />
              <path d="M15.5 8.5a5 5 0 0 1 0 7" />
              <path d="M18.5 5.5a9 9 0 0 1 0 13" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 5 6 9H2v6h4l5 4V5z" />
              <line x1="23" y1="9" x2="17" y2="15" />
              <line x1="17" y1="9" x2="23" y2="15" />
            </svg>
          )}
        </button>

        {showInstall && (
          <button
            className="btn btn--primary hidden px-4 py-2 text-sm sm:inline-flex"
            onClick={install}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3v12" />
              <path d="m7 10 5 5 5-5" />
              <path d="M4 21h16" />
            </svg>
            نصب اپ
          </button>
        )}
      </div>
    </header>
  );
}
