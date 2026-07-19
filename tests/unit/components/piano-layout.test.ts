import { describe, expect, it } from "vitest";
import { BLACK_KEYS, isValidPianoLayout, WHITE_KEYS } from "@/components/piano/pianoLayout";

describe("piano layout", () => {
  it("has no black keys between E–F or B–C", () => {
    expect(isValidPianoLayout()).toBe(true);

    const gapsWithoutBlack = [2, 6, 9, 13];
    for (const afterWhite of gapsWithoutBlack) {
      expect(BLACK_KEYS.some((k) => k.afterWhite === afterWhite)).toBe(false);
    }
  });

  it("never uses a white-key MIDI for a black key", () => {
    const whiteMidis = new Set(WHITE_KEYS.map((k) => k.midi));
    for (const black of BLACK_KEYS) {
      expect(whiteMidis.has(black.midi)).toBe(false);
    }
  });
});
