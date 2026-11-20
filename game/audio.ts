let ctx: AudioContext | null = null;
let enabled = true;

export function setSoundEnabled(on: boolean) {
  enabled = on;
}

export function ensureAudio() {
  if (!ctx) {
    try {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      ctx = new AC();
    } catch {
      ctx = null;
    }
  }
  if (ctx && ctx.state === 'suspended') ctx.resume().catch(() => {});
}

type Wave = OscillatorType;

function tone(freq: number, dur: number, vol: number, wave: Wave = 'square', slideTo?: number) {
  if (!enabled || !ctx) return;
  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = wave;
  osc.frequency.setValueAtTime(freq, t);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(1, slideTo), t + dur);
  gain.gain.setValueAtTime(vol, t);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(gain).connect(ctx.destination);
  osc.start(t);
  osc.stop(t + dur);
}

export const sfx = {
  shoot: () => tone(880, 0.08, 0.05, 'square', 440),
  hit: () => tone(200, 0.06, 0.06, 'sawtooth', 120),
  kill: () => tone(300, 0.12, 0.07, 'triangle', 80),
  gem: () => tone(1200, 0.09, 0.05, 'sine', 1800),
  levelUp: () => {
    tone(523, 0.12, 0.08, 'sine');
    setTimeout(() => tone(659, 0.12, 0.08, 'sine'), 110);
    setTimeout(() => tone(784, 0.2, 0.08, 'sine'), 220);
  },
  hurt: () => tone(150, 0.2, 0.1, 'sawtooth', 60),
  death: () => tone(220, 0.6, 0.12, 'sawtooth', 40),
  coin: () => tone(988, 0.1, 0.06, 'sine', 1319),
};
