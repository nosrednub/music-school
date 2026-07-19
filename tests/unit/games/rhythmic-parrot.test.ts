import { describe, expect, it } from "vitest";
import {
  BEAK_TARGET,
  LEVEL_1_CONFIG,
  SPAWN_ORIGINS,
  applyGrade,
  buildBeatSchedule,
  calculateStars,
  createEmptyScore,
  getArcPoint,
  getBeatForTap,
  getBeatIntervalMs,
  getFruitProgress,
  getNextUngradedBeat,
  getRoundDurationMs,
  getSpawnOrigin,
  getVisibleBeats,
  gradeTapAgainstBeat,
} from "@/games/rhythmic-parrot/mechanics";

describe("rhythmic-parrot mechanics", () => {
  it("anchors hit times on the tempo grid", () => {
    const interval = getBeatIntervalMs(80);
    const schedule = buildBeatSchedule(LEVEL_1_CONFIG, 1000);

    expect(schedule).toHaveLength(8);
    expect(schedule[0]?.hitAt).toBe(1000 + interval);
    expect(schedule[0]?.spawnAt).toBe(1000);
    expect(schedule[1]?.hitAt).toBe(schedule[0]!.hitAt + interval);
    expect(schedule[1]?.spawnAt).toBe(schedule[0]!.hitAt);
  });

  it("shows one fruit at a time when travel equals beat interval", () => {
    const schedule = buildBeatSchedule(LEVEL_1_CONFIG, 0);
    const interval = getBeatIntervalMs(80);
    const graded = new Set<number>();
    const midFlight = schedule[0]!.spawnAt + LEVEL_1_CONFIG.travelMs / 2;

    expect(getVisibleBeats(midFlight, schedule, graded, LEVEL_1_CONFIG.travelMs)).toHaveLength(1);
    expect(
      getVisibleBeats(schedule[0]!.hitAt, schedule, graded, LEVEL_1_CONFIG.travelMs),
    ).toHaveLength(1);
    expect(
      getVisibleBeats(
        schedule[0]!.hitAt + interval / 2,
        schedule,
        graded,
        LEVEL_1_CONFIG.travelMs,
      ),
    ).toHaveLength(1);

    const afterFirstHit = new Set([0]);
    expect(
      getVisibleBeats(schedule[0]!.hitAt, schedule, afterFirstHit, LEVEL_1_CONFIG.travelMs),
    ).toHaveLength(1);
    expect(
      getVisibleBeats(schedule[0]!.hitAt, schedule, afterFirstHit, LEVEL_1_CONFIG.travelMs)[0]
        ?.index,
    ).toBe(1);
  });

  it("grades perfect and good taps", () => {
    const beat = { index: 0, spawnAt: 0, hitAt: 2000, originIndex: 0 };
    expect(gradeTapAgainstBeat(2000, beat, LEVEL_1_CONFIG).grade).toBe(
      "perfect",
    );
    expect(gradeTapAgainstBeat(2080, beat, LEVEL_1_CONFIG).grade).toBe("good");
    expect(gradeTapAgainstBeat(1800, beat, LEVEL_1_CONFIG).grade).toBe(
      "early",
    );
  });

  it("tracks fruit progress along travel window", () => {
    const beat = { index: 0, spawnAt: 1000, hitAt: 1750, originIndex: 0 };
    expect(getFruitProgress(1000, beat, 750)).toBe(0);
    expect(getFruitProgress(1375, beat, 750)).toBe(0.5);
    expect(getFruitProgress(1750, beat, 750)).toBe(1);
  });

  it("finds next ungraded beat", () => {
    const schedule = buildBeatSchedule(LEVEL_1_CONFIG, 0);
    const graded = new Set([0, 1]);
    expect(getNextUngradedBeat(schedule, graded)?.index).toBe(2);
  });

  it("matches tap to the beat at the beak", () => {
    const schedule = buildBeatSchedule(LEVEL_1_CONFIG, 0);
    const graded = new Set<number>();
    const beat = getBeatForTap(schedule[0]!.hitAt, schedule, graded, LEVEL_1_CONFIG);
    expect(beat?.index).toBe(0);
  });

  it("uses alternate spawn origins that share one target", () => {
    const schedule = buildBeatSchedule(LEVEL_1_CONFIG, 0);
    const first = getSpawnOrigin(schedule[0]!);
    const second = getSpawnOrigin(schedule[1]!);
    expect(first).not.toEqual(second);
    expect(getArcPoint(first, BEAK_TARGET, 1)).toEqual(BEAK_TARGET);
    expect(getArcPoint(second, BEAK_TARGET, 1)).toEqual(BEAK_TARGET);
    expect(SPAWN_ORIGINS.length).toBeGreaterThan(1);
  });

  it("calculates stars from round score", () => {
    const score = createEmptyScore();
    score.total = 8;
    score.perfect = 6;
    score.good = 2;
    expect(calculateStars(score)).toBe(3);
  });

  it("computes round duration", () => {
    expect(getRoundDurationMs(LEVEL_1_CONFIG)).toBeGreaterThan(5000);
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
