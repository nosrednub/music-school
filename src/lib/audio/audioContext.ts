/** Shared Web Audio context for piano, metronome, and organ pad. */

type AudioContextConstructor = typeof AudioContext;

const getAudioContextClass = (): AudioContextConstructor | null => {
  if (typeof window === "undefined") {
    return null;
  }
  return (
    window.AudioContext ??
    (window as Window & { webkitAudioContext?: AudioContextConstructor })
      .webkitAudioContext ??
    null
  );
};

let context: AudioContext | null = null;
let htmlUnlockAudio: HTMLAudioElement | null = null;

/** Tiny inline WAV — unlocks iOS media playback from a user gesture. */
const HTML_UNLOCK_WAV =
  "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA==";

export const getSharedAudioContext = (): AudioContext => {
  const AudioContextClass = getAudioContextClass();
  if (!AudioContextClass) {
    throw new Error("Web Audio API is not available");
  }
  if (!context) {
    context = new AudioContextClass({ latencyHint: "interactive" });
  }
  return context;
};

/** iOS `<audio>` unlock — must run synchronously inside tap/click handler. */
export const playHtmlAudioUnlock = (): void => {
  if (typeof window === "undefined") {
    return;
  }
  if (!htmlUnlockAudio) {
    htmlUnlockAudio = new Audio(HTML_UNLOCK_WAV);
    htmlUnlockAudio.preload = "auto";
  }
  htmlUnlockAudio.currentTime = 0;
  void htmlUnlockAudio.play().catch(() => {
    /* ignored — Web Audio blip is the primary unlock */
  });
};

/** Immediate audible blip — must run synchronously inside a user gesture (iOS). */
export const playGestureUnlockBlip = (ctx: AudioContext): void => {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "triangle";
  osc.frequency.value = 523.25;
  osc.connect(gain);
  gain.connect(ctx.destination);
  const now = ctx.currentTime;
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.linearRampToValueAtTime(0.2, now + 0.01);
  gain.gain.linearRampToValueAtTime(0.0001, now + 0.15);
  osc.start(now);
  osc.stop(now + 0.16);
};

/**
 * Synchronous unlock for iOS Safari — NO await before resume or play.
 * Call as the first line of unmute / enable-sound handlers.
 */
export const unlockFromUserGesture = (): AudioContext => {
  const ctx = getSharedAudioContext();
  playHtmlAudioUnlock();
  void ctx.resume();
  playGestureUnlockBlip(ctx);

  const buffer = ctx.createBuffer(1, 1, ctx.sampleRate);
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.connect(ctx.destination);
  source.start(0);
  source.stop(0.001);

  return ctx;
};

/** Resume without the confirmation blip — use on each play tap/key. */
export const resumeFromUserGesture = (): AudioContext => {
  const ctx = getSharedAudioContext();
  void ctx.resume();
  return ctx;
};

/** Async settle — safe to await after synchronous unlock in the same handler. */
export const settleAudioContext = async (): Promise<AudioContext> => {
  const ctx = getSharedAudioContext();
  if (ctx.state !== "running") {
    await ctx.resume();
  }
  return ctx;
};

export const disposeSharedAudioContext = (): void => {
  void context?.close();
  context = null;
  htmlUnlockAudio = null;
};
