import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import type { AppData, DayData } from './types';
import { emptyDay, loadData, saveData } from './lib/storage';
import { setSoundEnabled } from './lib/sound';

interface Store {
  data: AppData;
  update: (updater: (d: AppData) => AppData) => void;
  getDay: (iso: string) => DayData;
  setDay: (iso: string, updater: (day: DayData) => DayData) => void;
}

const StoreContext = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(() => loadData());

  // Keep the sound engine in sync with the persisted toggle.
  useEffect(() => {
    setSoundEnabled(data.settings.sound);
  }, [data.settings.sound]);

  // Persist on every change.
  useEffect(() => {
    saveData(data);
  }, [data]);

  const update = useCallback((updater: (d: AppData) => AppData) => {
    setData((prev) => updater(prev));
  }, []);

  const getDay = useCallback(
    (iso: string): DayData => data.days[iso] ?? emptyDay(),
    [data.days]
  );

  const setDay = useCallback(
    (iso: string, updater: (day: DayData) => DayData) => {
      setData((prev) => {
        const existing = prev.days[iso] ?? emptyDay();
        return {
          ...prev,
          days: { ...prev.days, [iso]: updater(existing) },
        };
      });
    },
    []
  );

  return (
    <StoreContext.Provider value={{ data, update, getDay, setDay }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore(): Store {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}
