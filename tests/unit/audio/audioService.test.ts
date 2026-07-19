import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const pianoStart = vi.fn();

vi.mock("smplr", () => ({
  CacheStorage: vi.fn(),
  SplendidGrandPiano: vi.fn(() => ({
    load: Promise.resolve(undefined),
    start: pianoStart,
  })),
}));

vi.mock("@/lib/audio/fallbackSynth", () => ({
  playFallbackNote: vi.fn(),
  playFallbackClick: vi.fn(),
}));

const createMockContext = () => {
  const gain = {
    gain: {
      value: 0,
      setValueAtTime: vi.fn(),
      exponentialRampToValueAtTime: vi.fn(),
      linearRampToValueAtTime: vi.fn(),
    },
    connect: vi.fn(),
  };
  const osc = {
    type: "sine",
    frequency: { value: 440 },
    connect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
  };
  return {
    state: "running" as AudioContextState,
    currentTime: 0,
    destination: {},
    resume: vi.fn().mockResolvedValue(undefined),
    createOscillator: vi.fn(() => osc),
    createGain: vi.fn(() => gain),
    close: vi.fn(),
  };
};

describe("audioService", () => {
  beforeEach(() => {
    vi.resetModules();
    pianoStart.mockClear();
    const mockCtx = createMockContext();
    vi.stubGlobal(
      "AudioContext",
      vi.fn(() => mockCtx),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("marks audio unlocked and plays gesture blip on unlock", async () => {
    const { unlockAudio, isAudioUnlocked } = await import("@/lib/audio/audioService");
    expect(isAudioUnlocked()).toBe(false);
    await unlockAudio();
    expect(isAudioUnlocked()).toBe(true);
    expect(AudioContext).toHaveBeenCalled();
  });

  it("plays unlock confirmation tone after unmute", async () => {
    const { playUnlockConfirmation } = await import("@/lib/audio/audioService");

    await playUnlockConfirmation();

    expect(pianoStart).toHaveBeenCalledWith(
      expect.objectContaining({ note: "C5", velocity: 72, duration: 0.35 }),
    );
  });

  it("uses piano samples for playNote once unlocked", async () => {
    const { unlockAudio, playNote } = await import("@/lib/audio/audioService");
    await unlockAudio();
    await new Promise((resolve) => {
      setTimeout(resolve, 0);
    });

    await playNote({ note: "C", octave: 4 });
    expect(pianoStart).toHaveBeenCalledWith(
      expect.objectContaining({ note: "C4", velocity: 70 }),
    );
  });

  it("no-ops playNote while still muted", async () => {
    const { playFallbackNote } = await import("@/lib/audio/fallbackSynth");
    const { playNote } = await import("@/lib/audio/audioService");

    await playNote({ note: "C", octave: 4 });

    expect(playFallbackNote).not.toHaveBeenCalled();
    expect(pianoStart).not.toHaveBeenCalled();
  });
});
