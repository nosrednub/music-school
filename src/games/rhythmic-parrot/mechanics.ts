export type TapGrade = "perfect" | "good" | "miss" | "early";

export type LevelConfig = {
  bpm: number;
  beatCount: number;
  travelMs: number;
  perfectMs: number;
  goodMs: number;
  lateMs: number;
};

export const LEVEL_1_CONFIG: LevelConfig = {
  bpm: 80,
  beatCount: 8,
  travelMs: 1800,
  perfectMs: 55,
  goodMs: 130,
  lateMs: 220,
};

export type BeatSchedule = {
  spawnAt: number;
  hitAt: number;
  index: number;
};

export type GradedBeat = {
  index: number;
  grade: TapGrade;
  deltaMs: number;
};

export type RoundScore = {
  perfect: number;
  good: number;
  miss: number;
  early: number;
  total: number;
  maxCombo: number;
};

export const getBeatIntervalMs = (bpm: number): number => {
  return 60_000 / bpm;
};

export const buildBeatSchedule = (
  config: LevelConfig,
  sessionStartMs: number,
): BeatSchedule[] => {
  const interval = getBeatIntervalMs(config.bpm);
  return Array.from({ length: config.beatCount }, (_, index) => {
    const spawnAt = sessionStartMs + index * interval;
    return {
      index,
      spawnAt,
      hitAt: spawnAt + config.travelMs,
    };
  });
};

export const getNextUngradedBeat = (
  schedule: BeatSchedule[],
  gradedIndices: Set<number>,
): BeatSchedule | undefined => {
  return schedule.find((beat) => !gradedIndices.has(beat.index));
};

export const gradeTapAgainstBeat = (
  tapTimeMs: number,
  beat: BeatSchedule,
  config: LevelConfig,
): { grade: TapGrade; deltaMs: number } => {
  const deltaMs = tapTimeMs - beat.hitAt;

  if (deltaMs < -config.goodMs) {
    return { grade: "early", deltaMs };
  }

  const absDelta = Math.abs(deltaMs);
  if (absDelta <= config.perfectMs) {
    return { grade: "perfect", deltaMs };
  }
  if (absDelta <= config.goodMs) {
    return { grade: "good", deltaMs };
  }
  if (deltaMs <= config.lateMs) {
    return { grade: "miss", deltaMs };
  }

  return { grade: "miss", deltaMs };
};

export const createEmptyScore = (): RoundScore => ({
  perfect: 0,
  good: 0,
  miss: 0,
  early: 0,
  total: 0,
  maxCombo: 0,
});

export const applyGrade = (
  score: RoundScore,
  grade: TapGrade,
  combo: number,
): RoundScore => {
  const next = { ...score, total: score.total + 1 };

  if (grade === "perfect") {
    next.perfect += 1;
  } else if (grade === "good") {
    next.good += 1;
  } else if (grade === "early") {
    next.early += 1;
  } else {
    next.miss += 1;
  }

  if (grade === "perfect" || grade === "good") {
    next.maxCombo = Math.max(next.maxCombo, combo);
  }

  return next;
};

export const getRoundDurationMs = (config: LevelConfig): number => {
  const interval = getBeatIntervalMs(config.bpm);
  const lastSpawn = (config.beatCount - 1) * interval;
  return lastSpawn + config.travelMs + config.lateMs + 600;
};

export const calculateStars = (score: RoundScore): 0 | 1 | 2 | 3 => {
  if (score.total === 0) {
    return 0;
  }

  const hitRate = (score.perfect + score.good) / score.total;
  if (hitRate >= 0.9 && score.perfect >= score.total * 0.6) {
    return 3;
  }
  if (hitRate >= 0.7) {
    return 2;
  }
  if (hitRate >= 0.45) {
    return 1;
  }
  return 0;
};

export const getFruitProgress = (
  nowMs: number,
  beat: BeatSchedule,
  travelMs: number,
): number => {
  if (nowMs <= beat.spawnAt) {
    return 0;
  }
  const elapsed = nowMs - beat.spawnAt;
  return Math.min(1, elapsed / travelMs);
};
