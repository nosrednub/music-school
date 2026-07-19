import { describe, expect, it } from "vitest";
import {
  getInterval,
  getIntervalDisplayName,
  formatInterval,
} from "@/lib/theory/intervals";
import { parseNote } from "@/lib/theory/notes";

describe("intervals", () => {
  it("identifies a major third", () => {
    const interval = getInterval(parseNote("C4"), parseNote("E4"));
    expect(interval.semitones).toBe(4);
    expect(interval.quality).toBe("major");
    expect(interval.number).toBe(3);
    expect(getIntervalDisplayName(parseNote("C4"), parseNote("E4"))).toBe(
      "Major 3rd",
    );
  });

  it("identifies a perfect fifth", () => {
    const interval = getInterval(parseNote("C4"), parseNote("G4"));
    expect(interval.semitones).toBe(7);
    expect(formatInterval(interval)).toBe("Perfect 5th");
  });

  it("handles compound intervals", () => {
    const interval = getInterval(parseNote("C4"), parseNote("C5"));
    expect(interval.semitones).toBe(12);
    expect(interval.simple).toBe(true);
    expect(formatInterval(interval)).toBe("Perfect 8th");
  });
});
