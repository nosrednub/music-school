import type { Pitch } from "@/types/music";
import { midiToPitch, pitchToMidi } from "@/lib/theory/notes";

export type NoteChallenge = {
  id: string;
  midi: number;
  pitch: Pitch;
  letter: string;
};

export type NoteResult = {
  correct: boolean;
  expectedMidi: number;
  playedMidi: number;
};

export const ROUNDS_TO_WIN = 8;
export const STARTING_LIVES = 3;
export const BASE_TRAVEL_MS = 7500;
export const MIN_TRAVEL_MS = 3200;

/** Level 1: C4–B4 natural notes */
export const LEVEL_1_MIDI = [60, 62, 64, 65, 67, 69, 71, 72] as const;

export const LETTER_BUTTONS = ["C", "D", "E", "F", "G", "A", "B"] as const;

export const getTravelDurationMs = (streak: number): number => {
  return Math.max(MIN_TRAVEL_MS, BASE_TRAVEL_MS - streak * 350);
};

export const pickNoteChallenge = (
  level: number,
  rng: () => number = Math.random,
): NoteChallenge => {
  const pool = level <= 1 ? [...LEVEL_1_MIDI] : [...LEVEL_1_MIDI];
  const midi = pool[Math.floor(rng() * pool.length)] ?? 60;
  const pitch = midiToPitch(midi);
  const letter = pitch.note.replace("#", "♯").replace("b", "♭").charAt(0);

  return {
    id: `${midi}-${Math.floor(rng() * 1e6)}`,
    midi,
    pitch,
    letter: pitch.note.length > 1 ? pitch.note : letter,
  };
};

export const evaluateNote = (
  expectedMidi: number,
  playedMidi: number,
): NoteResult => ({
  correct: expectedMidi === playedMidi,
  expectedMidi,
  playedMidi,
});

export const letterToMidiInRange = (
  letter: string,
  referenceMidi: number,
): number | null => {
  const refPitch = midiToPitch(referenceMidi);
  const normalized = letter.replace("♯", "#").replace("♭", "b").toUpperCase();

  const noteMap: Record<string, Pitch["note"]> = {
    C: "C",
    D: "D",
    E: "E",
    F: "F",
    G: "G",
    A: "A",
    B: "B",
  };

  const note = noteMap[normalized.charAt(0) ?? ""];
  if (!note) {
    return null;
  }

  return pitchToMidi({ note, octave: refPitch.octave });
};

export const getCoachTip = (challenge: NoteChallenge): string => {
  const tips: Record<number, string> = {
    60: "Middle C — on the line below the treble staff.",
    62: "D — first line of the treble staff.",
    64: "E — first space of the treble staff.",
    65: "F — fourth line from the bottom.",
    67: "G — sits on the second line.",
    69: "A — second space from the bottom.",
    71: "B — third line of the treble staff.",
    72: "High C — ledger line above the staff.",
  };
  return tips[challenge.midi] ?? `Play ${challenge.pitch.note}${challenge.pitch.octave} before the rune reaches the wall.`;
};
