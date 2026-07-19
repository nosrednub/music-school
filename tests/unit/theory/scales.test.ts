import { describe, expect, it } from "vitest";
import { buildScale, SCALE_TYPE_LABELS } from "@/lib/theory/scales";
import { formatPitch, parseNote } from "@/lib/theory/notes";

describe("scales", () => {
  it("builds C major scale", () => {
    const scale = buildScale(parseNote("C4"), "major");
    expect(scale.map(formatPitch)).toEqual([
      "C4",
      "D4",
      "E4",
      "F4",
      "G4",
      "A4",
      "B4",
    ]);
  });

  it("builds A natural minor scale", () => {
    const scale = buildScale(parseNote("A3"), "natural-minor");
    expect(scale.map(formatPitch)).toEqual([
      "A3",
      "B3",
      "C4",
      "D4",
      "E4",
      "F4",
      "G4",
    ]);
  });

  it("has labels for all scale types", () => {
    expect(SCALE_TYPE_LABELS["harmonic-minor"]).toBe("Harmonic Minor");
    expect(SCALE_TYPE_LABELS.dorian).toBe("Dorian");
  });
});
