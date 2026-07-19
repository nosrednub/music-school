import type { Interval, IntervalQuality, Pitch } from "@/types/music";
import { pitchToMidi } from "./notes";

const INTERVAL_NAMES: Record<number, { quality: IntervalQuality; number: number }> = {
  0: { quality: "perfect", number: 1 },
  1: { quality: "minor", number: 2 },
  2: { quality: "major", number: 2 },
  3: { quality: "minor", number: 3 },
  4: { quality: "major", number: 3 },
  5: { quality: "perfect", number: 4 },
  6: { quality: "diminished", number: 5 },
  7: { quality: "perfect", number: 5 },
  8: { quality: "minor", number: 6 },
  9: { quality: "major", number: 6 },
  10: { quality: "minor", number: 7 },
  11: { quality: "major", number: 7 },
  12: { quality: "perfect", number: 8 },
};

export const getInterval = (from: Pitch, to: Pitch): Interval => {
  const semitones = pitchToMidi(to) - pitchToMidi(from);
  const normalized = ((semitones % 12) + 12) % 12;
  const octaves = Math.floor(Math.abs(semitones) / 12);
  const base = INTERVAL_NAMES[normalized];

  if (!base) {
    throw new Error(`Unknown interval for ${semitones} semitones`);
  }

  return {
    semitones,
    quality: base.quality,
    number: base.number + octaves * 7,
    simple: Math.abs(semitones) <= 12,
  };
};

export const formatInterval = (interval: Interval): string => {
  const qualityLabel =
    interval.quality.charAt(0).toUpperCase() + interval.quality.slice(1);
  const ordinal = interval.number;
  const suffix =
    ordinal === 1
      ? "st"
      : ordinal === 2
        ? "nd"
        : ordinal === 3
          ? "rd"
          : "th";
  return `${qualityLabel} ${ordinal}${suffix}`;
};

export const getIntervalDisplayName = (from: Pitch, to: Pitch): string => {
  return formatInterval(getInterval(from, to));
};

export { INTERVAL_NAMES };
