import type { Pitch } from "@/types/music";
import { formatPitch, pitchToMidi } from "@/lib/theory/notes";
import { CacheStorage, SplendidGrandPiano } from "smplr";

import {
  getSharedAudioContext,
  resumeFromUserGesture,
  settleAudioContext,
  unlockFromUserGesture,
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
      await settleAudioContext();
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
  resumeFromUserGesture();

  if (state.pianoReady && state.piano) {
    playPiano(state.piano);
    return;
  }

  fallback();
  void loadPiano();
};

/** Sync unlock — call directly from click/touch handlers (iOS-safe). */
export const unlockAudioSync = (): void => {
  unlockFromUserGesture();
  state.unlocked = true;
  playFallbackNote(72, 0.25, 80);
  void loadPiano();
};

/** Async unlock for callers that already unlocked synchronously. */
export const unlockAudio = async (): Promise<void> => {
  unlockAudioSync();
  await settleAudioContext();
};

export const isAudioUnlocked = (): boolean => state.unlocked;

/** Audible confirmation on unmute — fully synchronous for iOS. */
export const playUnlockConfirmation = (): void => {
  unlockAudioSync();
};

export const playHarmonicInterval = (
  root: Pitch,
  upper: Pitch,
  durationSec = 1.4,
): void => {
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

export const playNote = (
  pitch: Pitch,
  durationSec = 0.6,
  velocity = 70,
): void => {
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

/** Short click for Rhythmic Parrot beats and tap feedback. */
export const playTapClick = (accent = false): void => {
  if (!state.unlocked) {
    return;
  }

  playWithPianoOrFallback(
    (piano) => {
      piano.start({ note: accent ? "C6" : "G5", velocity: accent ? 55 : 42, duration: 0.05 });
    },
    () => {
      playFallbackClick(accent);
    },
  );
};

export const midiToPitch = (midi: number): Pitch => {
  const noteNames = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"] as const;
  const octave = Math.floor(midi / 12) - 1;
  const pitchClass = ((midi % 12) + 12) % 12;
  return { note: noteNames[pitchClass], octave };
};

export const playChordMidis = (
  midis: number[],
  durationSec = 0.9,
  velocity = 68,
): void => {
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
