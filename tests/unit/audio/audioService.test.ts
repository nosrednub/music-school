import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const pianoStart = vi.fn();

vi.mock("smplr", () => ({
  CacheStorage: vi.fn(),
  SplendidGrandPiano: vi.fn(() => ({
    load: Promise.resolve(undefined),
    start: pianoStart,
  })),
}));

const createMockContext = () => {
  const gain = {
    gain: {
      value: 0,
      setValueAtTime: vi.fn(),
      linearRampToValueAtTime: vi.fn(),
      exponentialRampToValueAtTime: vi.fn(),
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
  const bufferSource = {
    buffer: null as AudioBuffer | null,
    connect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
  };
  return {
    state: "running" as AudioContextState,
    currentTime: 0,
    sampleRate: 44100,
    destination: {},
    resume: vi.fn().mockResolvedValue(undefined),
    createOscillator: vi.fn(() => osc),
    createGain: vi.fn(() => gain),
    createBuffer: vi.fn(() => ({ getChannelData: vi.fn() })),
    createBufferSource: vi.fn(() => bufferSource),
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
    vi.stubGlobal(
      "webkitAudioContext",
      vi.fn(() => mockCtx),
    );
    vi.stubGlobal(
      "Audio",
      vi.fn(() => ({
        preload: "",
        currentTime: 0,
        play: vi.fn().mockResolvedValue(undefined),
      })),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("marks audio unlocked synchronously on unlockAudioSync", async () => {
    const { unlockAudioSync, isAudioUnlocked } = await import("@/lib/audio/audioService");
    expect(isAudioUnlocked()).toBe(false);
    unlockAudioSync();
    expect(isAudioUnlocked()).toBe(true);
    expect(AudioContext).toHaveBeenCalled();
  });

  it("plays unlock confirmation without awaiting", async () => {
    const { playUnlockConfirmation, isAudioUnlocked } = await import("@/lib/audio/audioService");
    playUnlockConfirmation();
    expect(isAudioUnlocked()).toBe(true);
  });

  it("uses piano samples for playNote once unlocked", async () => {
    const { unlockAudioSync, playNote } = await import("@/lib/audio/audioService");
    unlockAudioSync();
    await new Promise((resolve) => {
      setTimeout(resolve, 0);
    });

    playNote({ note: "C", octave: 4 });
    expect(pianoStart).toHaveBeenCalledWith(
      expect.objectContaining({ note: "C4", velocity: 70 }),
    );
  });

  it("no-ops playNote while still muted", async () => {
    const { playNote } = await import("@/lib/audio/audioService");
    playNote({ note: "C", octave: 4 });
    expect(pianoStart).not.toHaveBeenCalled();
  });
});
