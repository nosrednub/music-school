import { describe, expect, it } from "vitest";
import { SCALE_LIBRARY } from "@/lib/theory/scaleLibrary";
import {
  buildExerciseSequence,
  createSession,
  getExerciseProgress,
  getScalePitches,
  processNoteOn,
  searchScales,
} from "@/practice/scale-studio/mechanics";

describe("scale library", () => {
  it("has at least 24 scales", () => {
    expect(SCALE_LIBRARY.length).toBeGreaterThanOrEqual(24);
  });

  it("searches by label", () => {
    const hits = searchScales("pentatonic");
    expect(hits.length).toBeGreaterThanOrEqual(2);
  });
});

describe("scale studio exercises", () => {
  it("builds C major ascending midi", () => {
    const seq = buildExerciseSequence("C", "major", "scale-run-up");
    expect(seq).toEqual([60, 62, 64, 65, 67, 69, 71]);
  });

  it("builds up-down pattern", () => {
    const seq = buildExerciseSequence("C", "major-pentatonic", "scale-run-up-down");
    expect(seq[0]).toBe(60);
    expect(seq[seq.length - 1]).toBe(60);
    expect(seq.length).toBeGreaterThan(5);
  });

  it("builds thirds ladder", () => {
    const seq = buildExerciseSequence("C", "major", "thirds-ladder");
    expect(seq.length).toBeGreaterThan(7);
  });

  it("provides staff pitches for notation", () => {
    const pitches = getScalePitches("G", "mixolydian");
    expect(pitches.length).toBe(7);
  });

  it("tracks progress percent", () => {
    const session = createSession("C", "major", "scale-run-up");
    const step = processNoteOn(session, 60);
    const progress = getExerciseProgress(step.session);
    expect(progress.current).toBe(1);
    expect(progress.percent).toBeGreaterThan(0);
  });

  it("resets streak on mistake", () => {
    let session = createSession("C", "major", "scale-run-up");
    session = processNoteOn(session, 60).session;
    session = processNoteOn(session, 61).session;
    expect(session.streak).toBe(0);
    expect(session.mistakes).toBe(1);
  });
});
