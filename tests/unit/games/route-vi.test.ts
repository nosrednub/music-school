import { describe, expect, it } from "vitest";
import {
  CHAPEL_LINE,
  STATIONS_PER_ROUND,
  buildJunctionChallenge,
  evaluateSwitch,
  getCoachTip,
  lerpAngle,
} from "@/games/route-vi/mechanics";

describe("Route VI mechanics", () => {
  it("Chapel Line is I–vi–IV–V–I", () => {
    expect(CHAPEL_LINE.map((s) => s.roman)).toEqual(["I", "vi", "IV", "V", "I"]);
  });

  it("builds junction with correct target in options", () => {
    const challenge = buildJunctionChallenge(0, false, () => 0.5);
    expect(challenge.from.roman).toBe("I");
    expect(challenge.target.roman).toBe("vi");
    expect(challenge.options).toHaveLength(3);
    expect(challenge.options[challenge.correctIndex]?.roman).toBe("vi");
  });

  it("evaluates correct and wrong switches", () => {
    const challenge = buildJunctionChallenge(1, false, () => 0.1);
    const correct = evaluateSwitch(challenge, challenge.correctIndex);
    expect(correct.correct).toBe(true);

    const wrongIndex = challenge.correctIndex === 0 ? 1 : 0;
    const wrong = evaluateSwitch(challenge, wrongIndex);
    expect(wrong.correct).toBe(false);
    expect(getCoachTip(wrong)).toContain("IV");
  });

  it("round has four junctions", () => {
    expect(STATIONS_PER_ROUND).toBe(4);
  });

  it("lerps angles along shortest path", () => {
    expect(lerpAngle(0, Math.PI / 2, 0.5)).toBeCloseTo(Math.PI / 4);
  });
});
