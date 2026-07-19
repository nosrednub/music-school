import { describe, expect, it } from "vitest";
import {
  createSession,
  getScaleMidiSequence,
  getScalesByCategory,
  processNoteOn,
} from "@/practice/scale-studio/mechanics";

describe("scale studio mechanics", () => {
  it("builds C major ascending midi sequence", () => {
    const seq = getScaleMidiSequence("C", "major");
    expect(seq).toEqual([60, 62, 64, 65, 67, 69, 71]);
  });

  it("filters gospel scales", () => {
    const gospel = getScalesByCategory("gospel");
    expect(gospel.some((s) => s.id === "major-pentatonic")).toBe(true);
    expect(gospel.some((s) => s.id === "natural-minor")).toBe(false);
  });

  it("advances session on correct notes", () => {
    const session = createSession("C", "major");
    const first = session.targetMidi[0];
    expect(first).toBeDefined();

    const result = processNoteOn(session, first!);
    expect(result.correct).toBe(true);
    expect(result.complete).toBe(false);
    expect(result.session.nextIndex).toBe(1);
  });

  it("counts mistakes on wrong notes", () => {
    const session = createSession("C", "major");
    const wrong = processNoteOn(session, 61);
    expect(wrong.correct).toBe(false);
    expect(wrong.session.mistakes).toBe(1);
    expect(wrong.session.nextIndex).toBe(0);
  });

  it("completes scale and increments streak", () => {
    let session = createSession("C", "major-pentatonic");
    for (const midi of session.targetMidi) {
      const step = processNoteOn(session, midi);
      session = step.session;
      if (step.complete) {
        expect(step.correct).toBe(true);
        expect(session.streak).toBe(1);
        expect(session.nextIndex).toBe(0);
      }
    }
  });
});
