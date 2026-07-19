import type { Pitch } from "@/types/music";
import { formatPitch, pitchToMidi } from "@/lib/theory/notes";
import { CacheStorage, SplendidGrandPiano } from "smplr";

import {
  getSharedAudioContext,
  playGestureUnlockBlip,
  resumeSharedAudioContext,
} from "@/lib/audio/audioContext";
import {
  playFallbackClick,
  playFallbackNote,
} from "@/lib/audio/fallbackSynth";

type AudioServiceState = {
  piano: SplendidGrandPiano | null;
  loading: Promise<SplendidGrandPiano | null> | null;
  unlocked: boolean;
  pianoReady: boolean;
  useFallback: boolean;
};

const pianoStorage = new CacheStorage("music-school-piano");

const state: AudioServiceState = {
  piano: null,
  loading: null,
  unlocked: false,
  pianoReady: false,
  useFallback: false,
};

const loadPiano = (): Promise<SplendidGrandPiano | null> => {
  if (state.useFallback) {
    return Promise.resolve(null);
  }
  if (state.piano && state.pianoReady) {
    return Promise.resolve(state.piano);
  }
  if (state.loading) {
    return state.loading;
  }

  state.loading = (async () => {
    try {
      const ctx = getSharedAudioContext();
      const piano = new SplendidGrandPiano(ctx, { storage: pianoStorage });
      state.piano = piano;
      await piano.load;
      state.pianoReady = true;
      return piano;
    } catch (error) {
      console.warn("Piano sample load failed; using fallback synth", error);
      state.useFallback = true;
      state.piano = null;
      state.pianoReady = false;
      return null;
    } finally {
      state.loading = null;
    }
  })();

  return state.loading;
};

const playWithPianoOrFallback = (
  playPiano: (piano: SplendidGrandPiano) => void,
  fallback: () => void,
): void => {
  if (state.pianoReady && state.piano) {
    playPiano(state.piano);
    return;
  }

  fallback();
  void loadPiano();
};

export const unlockAudio = async (): Promise<void> => {
  await resumeSharedAudioContext();
  state.unlocked = true;
  void loadPiano();
};

export const isAudioUnlocked = (): boolean => state.unlocked;

/** Audible confirmation on unmute — immediate blip, then piano or fallback tone. */
export const playUnlockConfirmation = async (): Promise<void> => {
  if (!state.unlocked) {
    await unlockAudio();
  } else {
    playGestureUnlockBlip(getSharedAudioContext());
  }

  playWithPianoOrFallback(
    (piano) => {
      piano.start({ note: "C5", velocity: 72, duration: 0.35 });
    },
    () => {
      playFallbackNote(72, 0.35, 72);
    },
  );
};

export const playHarmonicInterval = async (
  root: Pitch,
  upper: Pitch,
  durationSec = 1.4,
): Promise<void> => {
  if (!state.unlocked) {
    return;
  }

  const rootNote = formatPitch(root);
  const upperNote = formatPitch(upper);

  playWithPianoOrFallback(
    (piano) => {
      piano.start({ note: rootNote, velocity: 72, duration: durationSec });
      piano.start({ note: upperNote, velocity: 68, duration: durationSec });
    },
    () => {
      playFallbackNote(root, durationSec, 72);
      playFallbackNote(upper, durationSec, 68);
    },
  );
};

export const playNote = async (
  pitch: Pitch,
  durationSec = 0.6,
  velocity = 70,
): Promise<void> => {
  if (!state.unlocked) {
    return;
  }

  const note = formatPitch(pitch);
  playWithPianoOrFallback(
    (piano) => {
      piano.start({ note, velocity, duration: durationSec });
    },
    () => {
      playFallbackNote(pitch, durationSec, velocity);
    },
  );
};

/** Short click for Rhythmic Parrot unmute and tap feedback. */
export const playTapClick = async (): Promise<void> => {
  if (!state.unlocked) {
    return;
  }

  playWithPianoOrFallback(
    (piano) => {
      piano.start({ note: "C6", velocity: 40, duration: 0.06 });
    },
    playFallbackClick,
  );
};

export const midiToPitch = (midi: number): Pitch => {
  const noteNames = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"] as const;
  const octave = Math.floor(midi / 12) - 1;
  const pitchClass = ((midi % 12) + 12) % 12;
  return { note: noteNames[pitchClass], octave };
};

export const playChordMidis = async (
  midis: number[],
  durationSec = 0.9,
  velocity = 68,
): Promise<void> => {
  if (!state.unlocked) {
    return;
  }

  playWithPianoOrFallback(
    (piano) => {
      for (const midi of midis) {
        piano.start({
          note: formatPitch(midiToPitch(midi)),
          velocity,
          duration: durationSec,
        });
      }
    },
    () => {
      for (const midi of midis) {
        playFallbackNote(midi, durationSec, velocity);
      }
    },
  );
};

export const disposeAudio = (): void => {
  state.piano = null;
  state.loading = null;
  state.pianoReady = false;
  state.useFallback = false;
  state.unlocked = false;
};

export { getSharedAudioContext, pitchToMidi };
