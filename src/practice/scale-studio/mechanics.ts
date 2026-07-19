import type { Pitch } from "@/types/music";
import {
  type RootOption,
  type ScaleLibraryId,
  getScaleEntry,
} from "@/lib/theory/scaleLibrary";
import { buildScale, SCALE_TYPE_LABELS } from "@/lib/theory/scales";
import { formatPitch, midiToPitch, parseNote, pitchToMidi } from "@/lib/theory/notes";

export type { RootOption, ScaleLibraryId, ScaleCategory } from "@/lib/theory/scaleLibrary";
export {
  ROOT_OPTIONS,
  SCALE_LIBRARY,
  getScaleEntry,
  getScalesByCategory,
  getScalesByTier,
  searchScales,
} from "@/lib/theory/scaleLibrary";

export type ExerciseId =
  | "scale-run-up"
  | "scale-run-down"
  | "scale-run-up-down"
  | "thirds-ladder"
  | "broken-thirds"
  | "speed-run";

export type ExerciseDef = {
  id: ExerciseId;
  label: string;
  description: string;
  icon: string;
};

export const EXERCISES: ExerciseDef[] = [
  {
    id: "scale-run-up",
    label: "Scale Run ↑",
    description: "One octave ascending — read the full line on staff",
    icon: "↑",
  },
  {
    id: "scale-run-down",
    label: "Scale Run ↓",
    description: "One octave descending from the top",
    icon: "↓",
  },
  {
    id: "scale-run-up-down",
    label: "Up & Down",
    description: "Ascend then descend — classic exam pattern",
    icon: "↕",
  },
  {
    id: "thirds-ladder",
    label: "Thirds Ladder",
    description: "Diatonic thirds — stack intervals on the staff",
    icon: "3",
  },
  {
    id: "broken-thirds",
    label: "Broken Thirds",
    description: "Skip-step pattern: 1–3–2–4–3–5…",
    icon: "⌁",
  },
  {
    id: "speed-run",
    label: "Speed Run",
    description: "Same as scale run — chase your best streak combo",
    icon: "⚡",
  },
];

const ROOT_TO_PITCH: Record<RootOption, string> = {
  C: "C4",
  Db: "C#4",
  D: "D4",
  Eb: "D#4",
  E: "E4",
  F: "F4",
  Gb: "F#4",
  G: "G4",
  Ab: "G#4",
  A: "A4",
  Bb: "A#4",
  B: "B4",
};

export const rootToPitch = (root: RootOption): Pitch => {
  return parseNote(ROOT_TO_PITCH[root]);
};

const isTheoryScaleType = (id: ScaleLibraryId): id is keyof typeof SCALE_TYPE_LABELS => {
  return id in SCALE_TYPE_LABELS;
};

/** One-octave scale pitches from root (may extend into next octave for display) */
export const getScalePitches = (
  root: RootOption,
  scaleId: ScaleLibraryId,
  octaves = 1,
): Pitch[] => {
  const entry = getScaleEntry(scaleId);
  if (!entry) {
    return [];
  }

  const rootPitch = rootToPitch(root);
  const rootMidi = pitchToMidi(rootPitch);

  if (isTheoryScaleType(scaleId)) {
    const base = buildScale(rootPitch, scaleId);
    if (octaves <= 1) {
      return base;
    }
    const pitches: Pitch[] = [...base];
    for (let o = 1; o < octaves; o++) {
      for (const p of base) {
        pitches.push(midiToPitch(pitchToMidi(p) + o * 12));
      }
    }
    return pitches;
  }

  const pitches: Pitch[] = [];
  for (let o = 0; o < octaves; o++) {
    for (const interval of entry.intervals) {
      pitches.push(midiToPitch(rootMidi + interval + o * 12));
    }
  }
  return pitches;
};

export const pitchesToMidi = (pitches: Pitch[]): number[] => {
  return pitches.map(pitchToMidi);
};

export const buildExerciseSequence = (
  root: RootOption,
  scaleId: ScaleLibraryId,
  exerciseId: ExerciseId,
): number[] => {
  const scale = getScalePitches(root, scaleId, 1);
  const midi = pitchesToMidi(scale);

  switch (exerciseId) {
    case "scale-run-up":
    case "speed-run":
      return midi;
    case "scale-run-down": {
      const desc = [...midi].reverse();
      return desc;
    }
    case "scale-run-up-down":
      return [...midi, ...[...midi].slice(0, -1).reverse()];
    case "thirds-ladder": {
      const thirds: number[] = [];
      for (let i = 0; i < midi.length - 2; i++) {
        thirds.push(midi[i]!, midi[i + 2]!);
      }
      return thirds.flat();
    }
    case "broken-thirds": {
      const broken: number[] = [];
      for (let i = 0; i < midi.length - 1; i++) {
        broken.push(midi[i]!);
        if (i + 2 < midi.length) {
          broken.push(midi[i + 2]!);
        }
      }
      broken.push(midi[midi.length - 1]!);
      return broken;
    }
    default:
      return midi;
  }
};

export type PracticeSession = {
  root: RootOption;
  scaleId: ScaleLibraryId;
  exerciseId: ExerciseId;
  targetMidi: number[];
  nextIndex: number;
  streak: number;
  mistakes: number;
  bestStreak: number;
  startedAt: number;
};

export const createSession = (
  root: RootOption,
  scaleId: ScaleLibraryId,
  exerciseId: ExerciseId,
): PracticeSession => ({
  root,
  scaleId,
  exerciseId,
  targetMidi: buildExerciseSequence(root, scaleId, exerciseId),
  nextIndex: 0,
  streak: 0,
  mistakes: 0,
  bestStreak: 0,
  startedAt: Date.now(),
});

export type StepResult = {
  correct: boolean;
  complete: boolean;
  expectedMidi: number | null;
  playedMidi: number;
  session: PracticeSession;
};

export const processNoteOn = (
  session: PracticeSession,
  midiNote: number,
): StepResult => {
  const expected = session.targetMidi[session.nextIndex];

  if (expected === undefined) {
    return {
      correct: true,
      complete: true,
      expectedMidi: null,
      playedMidi: midiNote,
      session,
    };
  }

  if (midiNote !== expected) {
    return {
      correct: false,
      complete: false,
      expectedMidi: expected,
      playedMidi: midiNote,
      session: { ...session, mistakes: session.mistakes + 1, streak: 0 },
    };
  }

  const nextIndex = session.nextIndex + 1;
  const complete = nextIndex >= session.targetMidi.length;
  const streak = complete ? session.streak + 1 : session.streak;
  const bestStreak = Math.max(session.bestStreak, complete ? streak : session.bestStreak);

  return {
    correct: true,
    complete,
    expectedMidi: expected,
    playedMidi: midiNote,
    session: {
      ...session,
      nextIndex: complete ? 0 : nextIndex,
      streak: complete ? streak : session.streak,
      bestStreak: complete ? bestStreak : session.bestStreak,
    },
  };
};

export const midiToLabel = (midi: number): string => {
  return formatPitch(midiToPitch(midi));
};

export const getExerciseProgress = (session: PracticeSession): {
  current: number;
  total: number;
  percent: number;
} => {
  const total = session.targetMidi.length;
  const current = Math.min(session.nextIndex, total);
  return {
    current,
    total,
    percent: total === 0 ? 0 : Math.round((current / total) * 100),
  };
};

export const getStaffPitchesForExercise = (
  root: RootOption,
  scaleId: ScaleLibraryId,
  exerciseId: ExerciseId,
): Pitch[] => {
  const midi = buildExerciseSequence(root, scaleId, exerciseId);
  return midi.map(midiToPitch);
};
