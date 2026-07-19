import type { Pitch } from "@/types/music";
import { formatPitch, pitchToMidi } from "@/lib/theory/notes";
import { SplendidGrandPiano } from "smplr";

type AudioServiceState = {
  context: AudioContext | null;
  piano: SplendidGrandPiano | null;
  loading: Promise<SplendidGrandPiano> | null;
  unlocked: boolean;
};

const state: AudioServiceState = {
  context: null,
  piano: null,
  loading: null,
  unlocked: false,
};

const getContext = (): AudioContext => {
  if (!state.context) {
    state.context = new AudioContext({ latencyHint: "interactive" });
  }
  return state.context;
};

const loadPiano = (): Promise<SplendidGrandPiano> => {
  if (state.piano) {
    return Promise.resolve(state.piano);
  }
  if (state.loading) {
    return state.loading;
  }

  state.loading = (async () => {
    const ctx = getContext();
    const piano = new SplendidGrandPiano(ctx);
    state.piano = piano;
    return piano;
  })();

  return state.loading;
};

export const unlockAudio = async (): Promise<void> => {
  const ctx = getContext();
  if (ctx.state === "suspended") {
    await ctx.resume();
  }
  await loadPiano();
  state.unlocked = true;
};

export const isAudioUnlocked = (): boolean => state.unlocked;

export const playHarmonicInterval = async (
  root: Pitch,
  upper: Pitch,
  durationSec = 1.4,
): Promise<void> => {
  if (!state.unlocked) {
    return;
  }

  const piano = await loadPiano();
  const rootNote = formatPitch(root);
  const upperNote = formatPitch(upper);

  piano.start({ note: rootNote, velocity: 72, duration: durationSec });
  piano.start({ note: upperNote, velocity: 68, duration: durationSec });
};

export const playNote = async (
  pitch: Pitch,
  durationSec = 0.6,
  velocity = 70,
): Promise<void> => {
  if (!state.unlocked) {
    return;
  }
  const piano = await loadPiano();
  piano.start({ note: formatPitch(pitch), velocity, duration: durationSec });
};

/** For Rhythmic Parrot unmute — short click sample via low piano note */
export const playTapClick = async (): Promise<void> => {
  if (!state.unlocked) {
    return;
  }
  const piano = await loadPiano();
  piano.start({ note: "C6", velocity: 40, duration: 0.06 });
};

export const midiToPitch = (midi: number): Pitch => {
  const noteNames = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"] as const;
  const octave = Math.floor(midi / 12) - 1;
  const pitchClass = ((midi % 12) + 12) % 12;
  return { note: noteNames[pitchClass], octave };
};

export const disposeAudio = (): void => {
  state.piano = null;
  state.loading = null;
  void state.context?.close();
  state.context = null;
  state.unlocked = false;
};

// re-export for tests
export { pitchToMidi };
