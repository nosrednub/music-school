import type { Pitch } from "@/types/music";
import { formatInterval, getInterval } from "@/lib/theory/intervals";
import { parseNote, transpose } from "@/lib/theory/notes";

export type IntervalChallenge = {
  id: string;
  root: Pitch;
  upper: Pitch;
  targetSemitones: number;
  targetLabel: string;
  level: number;
};

export type BridgeEvaluation = {
  correct: boolean;
  drawnSemitones: number;
  targetSemitones: number;
  delta: number;
};

/** Level 1 pool: stable consonances + major third */
const LEVEL_1_SEMITONES = [0, 4, 5, 7, 12] as const;

const TEACHING_TIPS: Record<number, string> = {
  0: "Perfect unison — same pitch, 0 semitones.",
  4: "Major 3rd — 4 semitones. Think “When the Saints” (C→E).",
  5: "Perfect 4th — 5 semitones. “Here Comes the Bride.”",
  7: "Perfect 5th — 7 semitones. “Star Wars” opening leap.",
  12: "Perfect octave — 12 semitones. Same note name, twice the frequency.",
};

export const PIXELS_PER_SEMITONE = 16;

export const ROOT_OPTIONS: Pitch[] = [
  parseNote("C4"),
  parseNote("D4"),
  parseNote("E4"),
  parseNote("G4"),
  parseNote("A4"),
];

export const semitonesToBridgeWidth = (semitones: number): number => {
  return semitones * PIXELS_PER_SEMITONE;
};

export const bridgeWidthToSemitones = (widthPx: number): number => {
  return Math.max(0, Math.round(widthPx / PIXELS_PER_SEMITONE));
};

export const pickChallenge = (
  level: number,
  rng: () => number = Math.random,
): IntervalChallenge => {
  const pool =
    level <= 1
      ? LEVEL_1_SEMITONES
      : ([...LEVEL_1_SEMITONES, 3, 8, 9, 10] as number[]);

  const targetSemitones = pool[Math.floor(rng() * pool.length)] ?? 7;
  const root = ROOT_OPTIONS[Math.floor(rng() * ROOT_OPTIONS.length)]!;
  const upper = transpose(root, targetSemitones);
  const targetLabel = formatInterval(getInterval(root, upper));

  return {
    id: `${root.note}${root.octave}-${targetSemitones}-${Math.floor(rng() * 1e6)}`,
    root,
    upper,
    targetSemitones,
    targetLabel,
    level,
  };
};

export const evaluateBridge = (
  drawnWidthPx: number,
  challenge: IntervalChallenge,
): BridgeEvaluation => {
  const drawnSemitones = bridgeWidthToSemitones(drawnWidthPx);
  const delta = drawnSemitones - challenge.targetSemitones;

  return {
    correct: delta === 0,
    drawnSemitones,
    targetSemitones: challenge.targetSemitones,
    delta,
  };
};

export const getTeachingTip = (challenge: IntervalChallenge): string => {
  const st = challenge.targetSemitones;
  const tipKey = st === 12 ? 12 : ((st % 12) + 12) % 12;
  const base =
    TEACHING_TIPS[tipKey] ??
    `${challenge.targetLabel} — listen for the color.`;
  if (st > 12) {
    return `${base} Span: ${st} semitones (compound).`;
  }
  return base;
};

export const formatPitchLabel = (pitch: Pitch): string => {
  return `${pitch.note}${pitch.octave}`;
};
