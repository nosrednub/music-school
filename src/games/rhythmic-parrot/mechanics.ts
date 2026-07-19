export type TapGrade = "perfect" | "good" | "miss" | "early";

export type LevelConfig = {
  bpm: number;
  beatCount: number;
  /** How long each fruit travels before reaching the beak — should match one beat. */
  travelMs: number;
  perfectMs: number;
  goodMs: number;
  lateMs: number;
};

export const LEVEL_1_CONFIG: LevelConfig = {
  bpm: 80,
  beatCount: 8,
  travelMs: 750,
  perfectMs: 55,
  goodMs: 130,
  lateMs: 220,
};

export type BeatSchedule = {
  spawnAt: number;
  hitAt: number;
  index: number;
  originIndex: number;
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

export type Point = { x: number; y: number };

/** Fixed target — every fruit lands here on the beat. */
export const BEAK_TARGET: Point = { x: 138, y: 248 };

/** Alternate launch points; motion always ends at BEAK_TARGET. */
export const SPAWN_ORIGINS: Point[] = [
  { x: 300, y: 80 },
  { x: 48, y: 96 },
  { x: 310, y: 210 },
  { x: 72, y: 52 },
  { x: 280, y: 140 },
];

export const getBeatIntervalMs = (bpm: number): number => {
  return 60_000 / bpm;
};

/**
 * Each fruit spawns one travel window before its hit time.
 * Hit times sit on the tempo grid so arrivals match the beat.
 */
export const buildBeatSchedule = (
  config: LevelConfig,
  sessionStartMs: number,
): BeatSchedule[] => {
  const interval = getBeatIntervalMs(config.bpm);
  const firstHitAt = sessionStartMs + interval;

  return Array.from({ length: config.beatCount }, (_, index) => {
    const hitAt = firstHitAt + index * interval;
    const spawnAt =
      index === 0
        ? hitAt - config.travelMs
        : firstHitAt + (index - 1) * interval;
    return {
      index,
      hitAt,
      spawnAt,
      originIndex: index % SPAWN_ORIGINS.length,
    };
  });
};

export const getNextUngradedBeat = (
  schedule: BeatSchedule[],
  gradedIndices: Set<number>,
): BeatSchedule | undefined => {
  return schedule.find((beat) => !gradedIndices.has(beat.index));
};

/** The single fruit in flight — hides graded beats and spawn handoff clutter. */
export const getVisibleBeats = (
  nowMs: number,
  schedule: BeatSchedule[],
  gradedIndices: Set<number>,
  travelMs: number,
): BeatSchedule[] => {
  let best: BeatSchedule | undefined;
  let bestProgress = -1;

  for (const beat of schedule) {
    if (gradedIndices.has(beat.index)) {
      continue;
    }
    if (nowMs < beat.spawnAt || nowMs > beat.hitAt + 80) {
      continue;
    }

    const progress = getFruitProgress(nowMs, beat, travelMs);
    if (progress >= bestProgress) {
      bestProgress = progress;
      best = beat;
    }
  }

  return best ? [best] : [];
};

/** Pick the beat the player is trying to hit — closest ungraded hit window. */
export const getBeatForTap = (
  tapTimeMs: number,
  schedule: BeatSchedule[],
  gradedIndices: Set<number>,
  config: LevelConfig,
): BeatSchedule | undefined => {
  const ungraded = schedule.filter((beat) => !gradedIndices.has(beat.index));
  if (ungraded.length === 0) {
    return undefined;
  }

  let best: BeatSchedule | undefined;
  let bestAbsDelta = Number.POSITIVE_INFINITY;

  for (const beat of ungraded) {
    const delta = Math.abs(tapTimeMs - beat.hitAt);
    if (delta < bestAbsDelta) {
      bestAbsDelta = delta;
      best = beat;
    }
  }

  if (!best) {
    return undefined;
  }

  const deltaMs = tapTimeMs - best.hitAt;
  if (deltaMs < -config.goodMs) {
    const earliest = ungraded[0];
    return earliest;
  }

  return best;
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
  const firstHitAt = interval;
  const lastHitAt = firstHitAt + (config.beatCount - 1) * interval;
  return lastHitAt + config.lateMs + 600;
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

/** Linear progress 0→1 from spawn to hit (constant tempo). */
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

/** Quadratic arc from origin to fixed beak target. */
export const getArcPoint = (
  origin: Point,
  target: Point,
  t: number,
): Point => {
  const clamped = Math.max(0, Math.min(1, t));
  const midX = (origin.x + target.x) / 2;
  const lift = Math.min(origin.y, target.y) - 70;
  const midY = lift;
  const x =
    (1 - clamped) * (1 - clamped) * origin.x +
    2 * (1 - clamped) * clamped * midX +
    clamped * clamped * target.x;
  const y =
    (1 - clamped) * (1 - clamped) * origin.y +
    2 * (1 - clamped) * clamped * midY +
    clamped * clamped * target.y;
  return { x, y };
};

export const getSpawnOrigin = (beat: BeatSchedule): Point => {
  return SPAWN_ORIGINS[beat.originIndex] ?? SPAWN_ORIGINS[0]!;
};
