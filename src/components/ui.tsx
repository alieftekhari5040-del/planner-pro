import { useEffect, type ReactNode } from 'react';

/** Section title with a red glowing tick before the label. */
export function SectionTitle({
  children,
  hint,
}: {
  children: ReactNode;
  hint?: ReactNode;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="tick" aria-hidden="true" />
      <h2 className="text-lg font-bold tracking-tight">{children}</h2>
      {hint && <span className="mr-auto">{hint}</span>}
    </div>
  );
}

export function Microlabel({ children }: { children: ReactNode }) {
  return <span className="microlabel">{children}</span>;
}

/** Absolute-positioned tooltip used by the SVG charts. */
export function ChartTooltip({
  x,
  y,
  children,
  visible,
}: {
  x: number;
  y: number;
  children: ReactNode;
  visible: boolean;
}) {
  if (!visible) return null;
  return (
    <div
      className="pointer-events-none fixed z-50 rounded-xl border border-[#7c5cff] bg-[#0b0b24] px-3 py-1.5 text-xs shadow-lg shadow-black/50"
      style={{
        left: x,
        top: y - 46,
        transform: 'translateX(-50%)',
        direction: 'rtl',
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </div>
  );
}

/** Friendly Persian empty state. */
export function EmptyState({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
      <div className="text-3xl" aria-hidden="true">🌙</div>
      <p className="font-semibold text-[#f0ecff]">{title}</p>
      {sub && <p className="text-sm text-[#8f8fb8]">{sub}</p>}
    </div>
  );
}

/** Simple confirmation modal for destructive actions. */
export function Confirm({
  open,
  title,
  message,
  confirmLabel = 'حذف',
  cancelLabel = 'انصراف',
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onCancel]);

  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
      />
      <div className="glass relative w-full max-w-sm p-6 animate-[popIn_0.2s_ease-out]">
        <h3 className="text-lg font-bold">{title}</h3>
        <p className="mt-2 text-sm text-[#8f8fb8]">{message}</p>
        <div className="mt-5 flex justify-end gap-3">
          <button className="btn btn--ghost px-4 py-2 text-sm" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button
            className="btn px-4 py-2 text-sm text-white"
            style={{ background: 'var(--accent)' }}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
