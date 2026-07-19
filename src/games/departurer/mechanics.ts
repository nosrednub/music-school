import type { Pitch } from "@/types/music";
import { formatInterval, getInterval } from "@/lib/theory/intervals";
import { parseNote, pitchToMidi, transpose } from "@/lib/theory/notes";

export type DeparturerChallenge = {
  id: string;
  root: Pitch;
  target: Pitch;
  targetSemitones: number;
  label: string;
  level: number;
};

export type LaunchEvaluation = {
  correct: boolean;
  fuelSemitones: number;
  targetSemitones: number;
  delta: number;
};

export const PX_PER_SEMITONE = 14;
export const MAX_FUEL_SEMITONES = 12;
export const ROUNDS_TO_WIN = 5;
export const STARTING_LIVES = 3;

const LEVEL_1_INTERVALS = [2, 3, 4, 5, 7, 12] as const;

const ROOT_OPTIONS: Pitch[] = [
  parseNote("C4"),
  parseNote("D4"),
  parseNote("E4"),
  parseNote("G4"),
  parseNote("A4"),
];

export const fuelPercentToSemitones = (percent: number): number => {
  const clamped = Math.max(0, Math.min(100, percent));
  return Math.round((clamped / 100) * MAX_FUEL_SEMITONES);
};

export const semitonesToFuelPercent = (semitones: number): number => {
  return (semitones / MAX_FUEL_SEMITONES) * 100;
};

export const pickDeparturerChallenge = (
  level: number,
  rng: () => number = Math.random,
): DeparturerChallenge => {
  const pool =
    level <= 1
      ? LEVEL_1_INTERVALS
      : ([...LEVEL_1_INTERVALS, 1, 6, 8, 9, 10] as number[]);

  const targetSemitones = pool[Math.floor(rng() * pool.length)] ?? 7;
  const root = ROOT_OPTIONS[Math.floor(rng() * ROOT_OPTIONS.length)]!;
  const target = transpose(root, targetSemitones);
  const label = formatInterval(getInterval(root, target));

  return {
    id: `${root.note}${root.octave}-${targetSemitones}-${Math.floor(rng() * 1e6)}`,
    root,
    target,
    targetSemitones,
    label,
    level,
  };
};

export const evaluateLaunch = (
  fuelSemitones: number,
  challenge: DeparturerChallenge,
  tolerance = 0,
): LaunchEvaluation => {
  const delta = fuelSemitones - challenge.targetSemitones;
  return {
    correct: Math.abs(delta) <= tolerance,
    fuelSemitones,
    targetSemitones: challenge.targetSemitones,
    delta,
  };
};

export const getCoachTip = (challenge: DeparturerChallenge): string => {
  const tips: Record<number, string> = {
    2: "Major 2nd — 2 semitones. A whole step up.",
    3: "Minor 3rd — 3 semitones.",
    4: "Major 3rd — 4 semitones.",
    5: "Perfect 4th — 5 semitones.",
    7: "Perfect 5th — 7 semitones. Star Wars leap.",
    12: "Octave — 12 semitones. Same note, higher.",
  };
  return (
    tips[challenge.targetSemitones] ??
    `${challenge.label} — set fuel to ${challenge.targetSemitones} semitones.`
  );
};

export const midiMatchesTarget = (
  challenge: DeparturerChallenge,
  midi: number,
): boolean => {
  return midi === pitchToMidi(challenge.target);
};

export const formatPitchLabel = (pitch: Pitch): string =>
  `${pitch.note}${pitch.octave}`;
