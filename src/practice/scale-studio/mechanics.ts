import type { Pitch, ScaleType } from "@/types/music";
import { buildScale, SCALE_TYPE_LABELS } from "@/lib/theory/scales";
import { formatPitch, midiToPitch, parseNote, pitchToMidi } from "@/lib/theory/notes";

export type ScaleCategory = "classical" | "jazz" | "gospel";

export type PracticeScaleId =
  | ScaleType
  | "major-pentatonic"
  | "minor-pentatonic"
  | "blues-six";

export type PracticeScaleDef = {
  id: PracticeScaleId;
  label: string;
  categories: ScaleCategory[];
  intervals: number[];
};

export const PRACTICE_SCALES: PracticeScaleDef[] = [
  { id: "major", label: SCALE_TYPE_LABELS.major, categories: ["classical", "gospel"], intervals: [0, 2, 4, 5, 7, 9, 11] },
  { id: "natural-minor", label: SCALE_TYPE_LABELS["natural-minor"], categories: ["classical"], intervals: [0, 2, 3, 5, 7, 8, 10] },
  { id: "harmonic-minor", label: SCALE_TYPE_LABELS["harmonic-minor"], categories: ["classical", "jazz"], intervals: [0, 2, 3, 5, 7, 8, 11] },
  { id: "melodic-minor", label: SCALE_TYPE_LABELS["melodic-minor"], categories: ["jazz"], intervals: [0, 2, 3, 5, 7, 9, 11] },
  { id: "dorian", label: SCALE_TYPE_LABELS.dorian, categories: ["jazz", "gospel"], intervals: [0, 2, 3, 5, 7, 9, 10] },
  { id: "mixolydian", label: SCALE_TYPE_LABELS.mixolydian, categories: ["gospel", "jazz"], intervals: [0, 2, 4, 5, 7, 9, 10] },
  { id: "lydian", label: SCALE_TYPE_LABELS.lydian, categories: ["jazz"], intervals: [0, 2, 4, 6, 7, 9, 11] },
  { id: "major-pentatonic", label: "Major Pentatonic", categories: ["gospel"], intervals: [0, 2, 4, 7, 9] },
  { id: "minor-pentatonic", label: "Minor Pentatonic", categories: ["gospel", "jazz"], intervals: [0, 3, 5, 7, 10] },
  { id: "blues-six", label: "Blues (6-note)", categories: ["gospel", "jazz"], intervals: [0, 3, 5, 6, 7, 10] },
];

export const ROOT_OPTIONS = ["C", "D", "E", "F", "G", "A", "Bb"] as const;
export type RootOption = (typeof ROOT_OPTIONS)[number];

export const rootToPitch = (root: RootOption): Pitch => {
  const map: Record<RootOption, string> = {
    C: "C4",
    D: "D4",
    E: "E4",
    F: "F4",
    G: "G4",
    A: "A4",
    Bb: "A#3",
  };
  return parseNote(map[root]);
};

export const getScaleDef = (id: PracticeScaleId): PracticeScaleDef | undefined => {
  return PRACTICE_SCALES.find((s) => s.id === id);
};

export const getScaleMidiSequence = (
  root: RootOption,
  scaleId: PracticeScaleId,
): number[] => {
  const def = getScaleDef(scaleId);
  if (!def) {
    return [];
  }

  if (isTheoryScaleType(scaleId)) {
    const pitches = buildScale(rootToPitch(root), scaleId);
    return pitches.map(pitchToMidi);
  }

  const rootMidi = pitchToMidi(rootToPitch(root));
  return def.intervals.map((interval) => rootMidi + interval);
};

const isTheoryScaleType = (id: PracticeScaleId): id is ScaleType => {
  return id in SCALE_TYPE_LABELS;
};

export const getScalesByCategory = (
  category: ScaleCategory | "all",
): PracticeScaleDef[] => {
  if (category === "all") {
    return PRACTICE_SCALES;
  }
  return PRACTICE_SCALES.filter((s) => s.categories.includes(category));
};

export type PracticeSession = {
  root: RootOption;
  scaleId: PracticeScaleId;
  targetMidi: number[];
  nextIndex: number;
  streak: number;
  mistakes: number;
};

export const createSession = (
  root: RootOption,
  scaleId: PracticeScaleId,
): PracticeSession => ({
  root,
  scaleId,
  targetMidi: getScaleMidiSequence(root, scaleId),
  nextIndex: 0,
  streak: 0,
  mistakes: 0,
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
      session: { ...session, mistakes: session.mistakes + 1 },
    };
  }

  const nextIndex = session.nextIndex + 1;
  const complete = nextIndex >= session.targetMidi.length;
  const streak = complete ? session.streak + 1 : session.streak;

  return {
    correct: true,
    complete,
    expectedMidi: expected,
    playedMidi: midiNote,
    session: {
      ...session,
      nextIndex: complete ? 0 : nextIndex,
      streak: complete ? streak : session.streak,
    },
  };
};

export const midiToLabel = (midi: number): string => {
  return formatPitch(midiToPitch(midi));
};

export const getProgressLabel = (session: PracticeSession): string => {
  if (session.targetMidi.length === 0) {
    return "";
  }
  const current = session.targetMidi[session.nextIndex];
  if (current === undefined) {
    return "Scale complete — play again!";
  }
  return `Play ${midiToLabel(current)} (${session.nextIndex + 1}/${session.targetMidi.length})`;
};
