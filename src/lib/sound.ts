// Synthesized WebAudio sound effects — no audio files needed.

let ctx: AudioContext | null = null;
let muted = false;

function ensureCtx(): AudioContext | null {
  try {
    if (!ctx) {
      const AC =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

interface ToneOpts {
  type?: OscillatorType;
  vol?: number;
  freqEnd?: number;
}

function tone(freq: number, start: number, dur: number, opts: ToneOpts = {}): void {
  const ac = ensureCtx();
  if (!ac || muted) return;
  const { type = 'sine', vol = 0.08, freqEnd } = opts;
  const t0 = ac.currentTime + start;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (freqEnd) osc.frequency.exponentialRampToValueAtTime(freqEnd, t0 + dur);
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(vol, t0 + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(gain).connect(ac.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.03);
}

export function setSoundEnabled(enabled: boolean): void {
  muted = !enabled;
}

/** Short confirmation tick. */
export function playTick(): void {
  tone(900, 0, 0.05, { type: 'square', vol: 0.05 });
}

/** Soft blip for toggles. */
export function playBlip(): void {
  tone(660, 0, 0.07, { type: 'triangle', vol: 0.06 });
  tone(990, 0.05, 0.06, { type: 'triangle', vol: 0.05 });
}

/** Flip for task completion. */
export function playFlip(): void {
  tone(320, 0, 0.09, { type: 'sine', vol: 0.07, freqEnd: 560 });
}

/** Success chime for completing all tasks / full day. */
export function playSuccess(): void {
  tone(523.25, 0, 0.14, { type: 'sine', vol: 0.09 });
  tone(659.25, 0.09, 0.14, { type: 'sine', vol: 0.09 });
  tone(783.99, 0.18, 0.2, { type: 'sine', vol: 0.1 });
}

/** Streak fanfare. */
export function playStreak(): void {
  const notes = [523.25, 659.25, 783.99, 1046.5];
  notes.forEach((n, i) => tone(n, i * 0.09, 0.16, { type: 'triangle', vol: 0.09 }));
  tone(1567.98, notes.length * 0.09, 0.3, { type: 'sine', vol: 0.1 });
}
