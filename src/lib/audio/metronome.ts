let audioContext: AudioContext | null = null;

const getContext = (): AudioContext => {
  if (!audioContext) {
    audioContext = new AudioContext({ latencyHint: "interactive" });
  }
  return audioContext;
};

const playClick = (ctx: AudioContext, accent: boolean) => {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.value = accent ? 880 : 660;
  gain.gain.value = accent ? 0.08 : 0.05;
  osc.connect(gain);
  gain.connect(ctx.destination);
  const now = ctx.currentTime;
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
  osc.start(now);
  osc.stop(now + 0.06);
};

export type MetronomeHandle = {
  stop: () => void;
};

export const startMetronome = (
  bpm: number,
  beatsPerMeasure = 4,
): MetronomeHandle => {
  const ctx = getContext();
  void ctx.resume();

  let beat = 0;
  const intervalMs = (60_000 / bpm);
  let intervalId: ReturnType<typeof setInterval> | null = null;

  const tick = () => {
    playClick(ctx, beat % beatsPerMeasure === 0);
    beat += 1;
  };

  tick();
  intervalId = setInterval(tick, intervalMs);

  return {
    stop: () => {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    },
  };
};

export const disposeMetronomeContext = (): void => {
  void audioContext?.close();
  audioContext = null;
};
