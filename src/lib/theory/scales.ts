import type { Pitch, ScaleType } from "@/types/music";
import { transpose } from "./notes";

const SCALE_INTERVALS: Record<ScaleType, number[]> = {
  major: [0, 2, 4, 5, 7, 9, 11],
  "natural-minor": [0, 2, 3, 5, 7, 8, 10],
  "harmonic-minor": [0, 2, 3, 5, 7, 8, 11],
  "melodic-minor": [0, 2, 3, 5, 7, 9, 11],
  dorian: [0, 2, 3, 5, 7, 9, 10],
  phrygian: [0, 1, 3, 5, 7, 8, 10],
  lydian: [0, 2, 4, 6, 7, 9, 11],
  mixolydian: [0, 2, 4, 5, 7, 9, 10],
  locrian: [0, 1, 3, 5, 6, 8, 10],
};

export const SCALE_TYPE_LABELS: Record<ScaleType, string> = {
  major: "Major (Ionian)",
  "natural-minor": "Natural Minor (Aeolian)",
  "harmonic-minor": "Harmonic Minor",
  "melodic-minor": "Melodic Minor",
  dorian: "Dorian",
  phrygian: "Phrygian",
  lydian: "Lydian",
  mixolydian: "Mixolydian",
  locrian: "Locrian",
};

export const buildScale = (root: Pitch, type: ScaleType): Pitch[] => {
  const intervals = SCALE_INTERVALS[type];
  return intervals.map((semitones) => transpose(root, semitones));
};

export const getScaleTypes = (): ScaleType[] => {
  return Object.keys(SCALE_INTERVALS) as ScaleType[];
};

export { SCALE_INTERVALS };
