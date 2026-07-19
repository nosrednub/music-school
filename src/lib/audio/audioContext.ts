/** Shared Web Audio context for piano, metronome, and organ pad. */

let context: AudioContext | null = null;

export const getSharedAudioContext = (): AudioContext => {
  if (!context) {
    context = new AudioContext({ latencyHint: "interactive" });
  }
  return context;
};

/** Immediate audible blip — must run synchronously inside a user gesture (iOS). */
export const playGestureUnlockBlip = (ctx: AudioContext): void => {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "triangle";
  osc.frequency.value = 523.25;
  gain.gain.value = 0.001;
  osc.connect(gain);
  gain.connect(ctx.destination);
  const now = ctx.currentTime;
  gain.gain.setValueAtTime(0.001, now);
  gain.gain.exponentialRampToValueAtTime(0.12, now + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
  osc.start(now);
  osc.stop(now + 0.12);
};

export const resumeSharedAudioContext = async (): Promise<AudioContext> => {
  const ctx = getSharedAudioContext();
  playGestureUnlockBlip(ctx);
  if (ctx.state === "suspended") {
    await ctx.resume();
  }
  return ctx;
};

export const disposeSharedAudioContext = (): void => {
  void context?.close();
  context = null;
};
