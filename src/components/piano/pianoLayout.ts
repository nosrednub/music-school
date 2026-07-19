export type WhiteKey = { midi: number; label: string };
export type BlackKey = { midi: number; afterWhite: number };

/** White keys C3–C5 (15 keys) for on-screen practice range */
export const WHITE_KEYS: WhiteKey[] = [
  { midi: 48, label: "C" },
  { midi: 50, label: "D" },
  { midi: 52, label: "E" },
  { midi: 53, label: "F" },
  { midi: 55, label: "G" },
  { midi: 57, label: "A" },
  { midi: 59, label: "B" },
  { midi: 60, label: "C" },
  { midi: 62, label: "D" },
  { midi: 64, label: "E" },
  { midi: 65, label: "F" },
  { midi: 67, label: "G" },
  { midi: 69, label: "A" },
  { midi: 71, label: "B" },
  { midi: 72, label: "C" },
];

/**
 * Black keys positioned after white key index N (between N and N+1).
 * No entries between E–F or B–C — those gaps have no black keys on a piano.
 */
export const BLACK_KEYS: BlackKey[] = [
  { midi: 49, afterWhite: 0 },
  { midi: 51, afterWhite: 1 },
  { midi: 54, afterWhite: 3 },
  { midi: 56, afterWhite: 4 },
  { midi: 58, afterWhite: 5 },
  { midi: 61, afterWhite: 7 },
  { midi: 63, afterWhite: 8 },
  { midi: 66, afterWhite: 10 },
  { midi: 68, afterWhite: 11 },
  { midi: 70, afterWhite: 12 },
];

/** White-key gaps with no black key (E–F and B–C in each octave). */
const NO_BLACK_AFTER_WHITE = new Set([2, 6, 9, 13]);

export const isValidPianoLayout = (): boolean => {
  const whiteMidis = new Set(WHITE_KEYS.map((k) => k.midi));

  for (const black of BLACK_KEYS) {
    if (whiteMidis.has(black.midi)) {
      return false;
    }
    if (NO_BLACK_AFTER_WHITE.has(black.afterWhite)) {
      return false;
    }
    if (black.afterWhite < 0 || black.afterWhite >= WHITE_KEYS.length - 1) {
      return false;
    }
  }

  return true;
};
