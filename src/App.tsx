import { useEffect, useState } from 'react';
import { StoreProvider } from './store';
import type { TabId } from './types';
import Header from './components/Header';
import Tabs from './components/Tabs';
import Footer from './components/Footer';
import DateBar from './components/DateBar';
import TodayView from './components/TodayView';
import HabitsView from './components/HabitsView';
import StatsView from './components/StatsView';
import { todayIso } from './lib/jalali';

function Background() {
  return (
    <div className="app-bg" aria-hidden="true">
      <div className="aurora-orb aurora-orb--1" />
      <div className="aurora-orb aurora-orb--2" />
      <div className="grid-overlay" />
      <div className="noise-overlay" />
    </div>
  );
}

function UpdateToast() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const onUpdate = () => setReady(true);
    window.addEventListener('app-update', onUpdate);
    return () => window.removeEventListener('app-update', onUpdate);
  }, []);
  if (!ready) return null;
  return (
    <div className="fixed bottom-24 left-1/2 z-[90] w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 md:bottom-6">
      <div className="glass glass--sm flex items-center gap-3 p-4">
        <span className="text-xl" aria-hidden="true">🔄</span>
        <p className="flex-1 text-sm font-semibold">نسخه‌ی جدید آماده است</p>
        <button
          className="btn btn--primary px-3 py-2 text-xs"
          onClick={() => window.location.reload()}
        >
          بروزرسانی
        </button>
      </div>
    </div>
  );
}

function Shell() {
  const [tab, setTab] = useState<TabId>('today');
  const [selectedDate, setSelectedDate] = useState(() => todayIso());

  return (
    <div className="relative min-h-screen pb-28 md:pb-10">
      <Background />
      <div className="mx-auto w-full max-w-4xl px-4 pt-4 sm:px-6">
        <Header />
        <div className="mt-5">
          <Tabs active={tab} onChange={setTab} />
        </div>
        <main className="mt-5 space-y-5">
          {tab === 'today' && (
            <>
              <DateBar selected={selectedDate} onSelect={setSelectedDate} />
              <TodayView key={selectedDate} iso={selectedDate} />
            </>
          )}
          {tab === 'habits' && <HabitsView />}
          {tab === 'stats' && <StatsView />}
        </main>
        <Footer />
      </div>
      <UpdateToast />
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <Shell />
    </StoreProvider>
  );
}
