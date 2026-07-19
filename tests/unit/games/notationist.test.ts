import { describe, expect, it } from "vitest";
import {
  evaluateNote,
  getTravelDurationMs,
  letterToMidiInRange,
  pickNoteChallenge,
} from "@/games/notationist/mechanics";

describe("Notationist mechanics", () => {
  it("picks notes in level 1 range", () => {
    const challenge = pickNoteChallenge(1, () => 0);
    expect(challenge.midi).toBeGreaterThanOrEqual(60);
    expect(challenge.midi).toBeLessThanOrEqual(72);
  });

  it("evaluates matching MIDI", () => {
    expect(evaluateNote(64, 64).correct).toBe(true);
    expect(evaluateNote(64, 65).correct).toBe(false);
  });

  it("maps letter buttons to reference octave", () => {
    expect(letterToMidiInRange("E", 64)).toBe(64);
    expect(letterToMidiInRange("F", 64)).toBe(65);
  });

  it("speeds up with streak", () => {
    expect(getTravelDurationMs(0)).toBeGreaterThan(getTravelDurationMs(5));
  });
});
