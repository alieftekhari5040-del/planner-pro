import { useRef } from 'react';
import Logo from './Logo';
import { useStore } from '../store';
import { defaultData } from '../lib/storage';
import { STORAGE_KEY } from '../lib/constants';
import type { AppData } from '../types';

export default function Footer() {
  const { data, update } = useStore();
  const fileRef = useRef<HTMLInputElement>(null);

  const exportData = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ascent-blueprint-backup.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const onImportFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as Partial<AppData>;
        const base = defaultData();
        update(() => ({
          days: parsed.days ?? base.days,
          habits: Array.isArray(parsed.habits) ? parsed.habits : base.habits,
          settings: { sound: parsed.settings?.sound ?? base.settings.sound },
        }));
        // eslint-disable-next-line no-alert
        alert('پشتیبان با موفقیت بازیابی شد');
      } catch {
        // eslint-disable-next-line no-alert
        alert('فایل پشتیبان نامعتبر است');
      }
    };
    reader.readAsText(file);
  };

  return (
    <footer className="mt-10 border-t border-[#2d2d5e]/60 pt-6">
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
        <div className="flex items-center gap-3">
          <Logo size={30} />
          <div className="leading-tight">
            <div className="text-sm font-bold text-[#f0ecff]">روز صفر تا قله</div>
            <div className="microlabel mt-0.5">THE ASCENT BLUEPRINT — DAILY</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="btn btn--ghost px-3 py-2 text-xs" onClick={exportData}>
            خروجی (JSON)
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onImportFile(f);
              e.target.value = '';
            }}
          />
          <button
            className="btn btn--ghost px-3 py-2 text-xs"
            onClick={() => fileRef.current?.click()}
          >
            بازیابی
          </button>
        </div>
      </div>
      <p className="mt-4 text-center text-[0.6rem] text-[#5b5b85]">
        {STORAGE_KEY} · داده‌ها فقط روی همین دستگاه ذخیره می‌شوند
      </p>
    </footer>
  );
}
