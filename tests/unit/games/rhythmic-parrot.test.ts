import { describe, expect, it } from "vitest";
import {
  LEVEL_1_CONFIG,
  applyGrade,
  buildBeatSchedule,
  calculateStars,
  createEmptyScore,
  getBeatIntervalMs,
  getFruitProgress,
  getNextUngradedBeat,
  getRoundDurationMs,
  gradeTapAgainstBeat,
} from "@/games/rhythmic-parrot/mechanics";

describe("rhythmic-parrot mechanics", () => {
  it("schedules beats with travel offset", () => {
    const schedule = buildBeatSchedule(LEVEL_1_CONFIG, 1000);
    expect(schedule).toHaveLength(8);
    expect(schedule[0]?.hitAt).toBe(1000 + LEVEL_1_CONFIG.travelMs);
    expect(schedule[1]?.spawnAt).toBe(1000 + getBeatIntervalMs(80));
  });

  it("grades perfect and good taps", () => {
    const beat = { index: 0, spawnAt: 0, hitAt: 2000 };
    expect(gradeTapAgainstBeat(2000, beat, LEVEL_1_CONFIG).grade).toBe(
      "perfect",
    );
    expect(gradeTapAgainstBeat(2080, beat, LEVEL_1_CONFIG).grade).toBe("good");
    expect(gradeTapAgainstBeat(1800, beat, LEVEL_1_CONFIG).grade).toBe(
      "early",
    );
  });

  it("tracks fruit progress along travel window", () => {
    const beat = { index: 0, spawnAt: 1000, hitAt: 2800 };
    expect(getFruitProgress(1000, beat, 1800)).toBe(0);
    expect(getFruitProgress(1900, beat, 1800)).toBe(0.5);
    expect(getFruitProgress(2800, beat, 1800)).toBe(1);
  });

  it("finds next ungraded beat", () => {
    const schedule = buildBeatSchedule(LEVEL_1_CONFIG, 0);
    const graded = new Set([0, 1]);
    expect(getNextUngradedBeat(schedule, graded)?.index).toBe(2);
  });

  it("calculates stars from round score", () => {
    const score = createEmptyScore();
    score.total = 8;
    score.perfect = 6;
    score.good = 2;
    expect(calculateStars(score)).toBe(3);
  });

  it("computes round duration", () => {
    expect(getRoundDurationMs(LEVEL_1_CONFIG)).toBeGreaterThan(7000);
  });

  it("updates score with combo tracking", () => {
    let score = createEmptyScore();
    score = applyGrade(score, "perfect", 1);
    score = applyGrade(score, "perfect", 2);
    score = applyGrade(score, "miss", 0);
    expect(score.perfect).toBe(2);
    expect(score.miss).toBe(1);
    expect(score.maxCombo).toBe(2);
  });
});
