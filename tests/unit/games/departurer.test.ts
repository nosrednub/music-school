import { describe, expect, it } from "vitest";
import {
  evaluateLaunch,
  fuelPercentToSemitones,
  pickDeparturerChallenge,
} from "@/games/departurer/mechanics";

describe("Departurer mechanics", () => {
  it("maps fuel percent to semitones", () => {
    expect(fuelPercentToSemitones(0)).toBe(0);
    expect(fuelPercentToSemitones(100)).toBe(12);
  });

  it("evaluates exact launch", () => {
    const c = pickDeparturerChallenge(1, () => 0);
    expect(evaluateLaunch(c.targetSemitones, c).correct).toBe(true);
    expect(evaluateLaunch(c.targetSemitones + 1, c).correct).toBe(false);
  });

  it("picks ascending intervals", () => {
    const c = pickDeparturerChallenge(1, () => 0.5);
    expect(c.targetSemitones).toBeGreaterThan(0);
  });
});
