"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  Application,
  Graphics,
} from "pixi.js";
import {
  bindLowLatencyInput,
  scheduleUiSync,
} from "@/game-engine/inputLatency";
import {
  playUnlockConfirmation,
} from "@/lib/audio/audioService";
import {
  BEAK_TARGET,
  LEVEL_1_CONFIG,
  applyGrade,
  buildBeatSchedule,
  calculateStars,
  createEmptyScore,
  getArcPoint,
  getBeatForTap,
  getBeatIntervalMs,
  getFruitProgress,
  getRoundDurationMs,
  getSpawnOrigin,
  getVisibleBeats,
  gradeTapAgainstBeat,
  type BeatSchedule,
  type RoundScore,
  type TapGrade,
} from "./mechanics";

type GamePhase = "ready" | "countdown" | "playing" | "results";

type FeedbackFlash = {
  grade: TapGrade;
  id: number;
};

const CANVAS_WIDTH = 360;
const CANVAS_HEIGHT = 420;

const BEAK_X = BEAK_TARGET.x - 20;
const BEAK_Y = BEAK_TARGET.y;

type RhythmicParrotGameProps = {
  defaultMuted?: boolean;
};

export const RhythmicParrotGame = ({
  defaultMuted = true,
}: RhythmicParrotGameProps) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const tapZoneRef = useRef<HTMLButtonElement>(null);
  const appRef = useRef<Application | null>(null);
  const scheduleRef = useRef<BeatSchedule[]>([]);
  const gradedRef = useRef<Set<number>>(new Set());
  const sessionStartRef = useRef(0);
  const comboRef = useRef(0);
  const scoreRef = useRef<RoundScore>(createEmptyScore());
  const rafRef = useRef<number | null>(null);
  const autoMissRef = useRef<number[]>([]);
  const phaseRef = useRef<GamePhase>("ready");
  const flashGradeRef = useRef<TapGrade | null>(null);

  const [phase, setPhase] = useState<GamePhase>("ready");
  const [countdown, setCountdown] = useState(3);
  const [muted, setMuted] = useState(defaultMuted);
  const [score, setScore] = useState<RoundScore>(createEmptyScore());
  const [combo, setCombo] = useState(0);
  const [flash, setFlash] = useState<FeedbackFlash | null>(null);
  const [stars, setStars] = useState<0 | 1 | 2 | 3>(0);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    flashGradeRef.current = flash?.grade ?? null;
  }, [flash]);

  const drawScene = useCallback((app: Application, nowMs: number) => {
    const activeFlash = flashGradeRef.current;
    const currentPhase = phaseRef.current;
      const stage = app.stage;
      stage.removeChildren();

      const bg = new Graphics();
      bg.rect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      bg.fill(0x0f172a);
      stage.addChild(bg);

      const skyGlow = new Graphics();
      skyGlow.circle(CANVAS_WIDTH * 0.72, 90, 70);
      skyGlow.fill({ color: 0xf59e0b, alpha: 0.08 });
      stage.addChild(skyGlow);

      const branch = new Graphics();
      branch.roundRect(24, 300, 220, 18, 8);
      branch.fill(0x78350f);
      branch.roundRect(30, 292, 200, 12, 6);
      branch.fill(0x92400e);
      stage.addChild(branch);

      const parrotBody = new Graphics();
      parrotBody.ellipse(BEAK_X - 8, 250, 34, 40);
      parrotBody.fill(0x22c55e);
      parrotBody.ellipse(BEAK_X - 18, 236, 16, 20);
      parrotBody.fill(0x16a34a);
      stage.addChild(parrotBody);

      const beak = new Graphics();
      beak.poly([
        BEAK_X + 8,
        BEAK_Y - 4,
        BEAK_X + 34,
        BEAK_Y + 2,
        BEAK_X + 8,
        BEAK_Y + 10,
      ]);
      beak.fill(0xf59e0b);
      stage.addChild(beak);

      const eye = new Graphics();
      eye.circle(BEAK_X - 4, 236, 5);
      eye.fill(0x0f172a);
      eye.circle(BEAK_X - 3, 235, 2);
      eye.fill(0xfef3c7);
      stage.addChild(eye);

      const targetRing = new Graphics();
      targetRing.circle(BEAK_TARGET.x, BEAK_TARGET.y, 22);
      targetRing.stroke({ width: 3, color: 0xf59e0b, alpha: 0.85 });
      if (activeFlash === "perfect") {
        targetRing.circle(BEAK_TARGET.x, BEAK_TARGET.y, 30);
        targetRing.stroke({ width: 4, color: 0xfef3c7, alpha: 0.9 });
      }
      stage.addChild(targetRing);

      if (currentPhase === "playing" && scheduleRef.current.length > 0) {
        getVisibleBeats(
          nowMs,
          scheduleRef.current,
          gradedRef.current,
          LEVEL_1_CONFIG.travelMs,
        ).forEach((beat) => {
          const progress = getFruitProgress(
            nowMs,
            beat,
            LEVEL_1_CONFIG.travelMs,
          );
          if (progress <= 0) {
            return;
          }

          const origin = getSpawnOrigin(beat);
          const point = getArcPoint(origin, BEAK_TARGET, progress);
          const fruit = new Graphics();
          fruit.circle(point.x, point.y, 14);
          fruit.fill(0xf97316);
          fruit.circle(point.x - 4, point.y - 4, 4);
          fruit.fill({ color: 0xfef3c7, alpha: 0.35 });
          stage.addChild(fruit);

          if (progress >= 0.92) {
            const approach = new Graphics();
            approach.circle(BEAK_TARGET.x, BEAK_TARGET.y, 18);
            approach.stroke({ width: 2, color: 0xfef3c7, alpha: 0.5 });
            stage.addChild(approach);
          }
        });
      }

      if (activeFlash && activeFlash !== "miss" && activeFlash !== "early") {
        const burst = new Graphics();
        burst.circle(BEAK_TARGET.x, BEAK_TARGET.y, 16);
        burst.fill({ color: 0xfef3c7, alpha: 0.75 });
        stage.addChild(burst);
      }
  }, []);

  const finishRound = useCallback(() => {
    setPhase("results");
    setStars(calculateStars(scoreRef.current));
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    autoMissRef.current.forEach(clearTimeout);
    autoMissRef.current = [];
  }, []);

  const registerGrade = useCallback((grade: TapGrade, beatIndex: number) => {
    comboRef.current =
      grade === "perfect" || grade === "good" ? comboRef.current + 1 : 0;
    scoreRef.current = applyGrade(
      scoreRef.current,
      grade,
      comboRef.current,
    );
    gradedRef.current.add(beatIndex);
    scheduleUiSync(() => {
      setScore({ ...scoreRef.current });
      setCombo(comboRef.current);
      setFlash({ grade, id: beatIndex });
    });

    if (navigator.vibrate && (grade === "perfect" || grade === "good")) {
      navigator.vibrate(grade === "perfect" ? 30 : 15);
    }

    window.setTimeout(() => {
      setFlash(null);
    }, 350);
  }, []);

  const handleTapAt = useCallback(
    (timeMs: number) => {
      if (phaseRef.current !== "playing") {
        return;
      }

      const beat = getBeatForTap(
        timeMs,
        scheduleRef.current,
        gradedRef.current,
        LEVEL_1_CONFIG,
      );
      if (!beat) {
        return;
      }

      const { grade } = gradeTapAgainstBeat(
        timeMs,
        beat,
        LEVEL_1_CONFIG,
      );
      registerGrade(grade, beat.index);
    },
    [registerGrade],
  );

  useEffect(() => {
    const tapZone = tapZoneRef.current;
    if (!tapZone) {
      return;
    }

    return bindLowLatencyInput(tapZone, {
      onTap: handleTapAt,
      onKey: (timeMs, code) => {
        if (code === "Space") {
          handleTapAt(timeMs);
        }
      },
    });
  }, [handleTapAt]);

  const startPlaying = useCallback(() => {
    gradedRef.current = new Set();
    comboRef.current = 0;
    scoreRef.current = createEmptyScore();
    setScore(createEmptyScore());
    setCombo(0);
    setStars(0);

    const start = performance.now() + 120;
    sessionStartRef.current = start;
    scheduleRef.current = buildBeatSchedule(LEVEL_1_CONFIG, start);
    setPhase("playing");

    const now = performance.now();
    scheduleRef.current.forEach((beat) => {
      const missAt = beat.hitAt + LEVEL_1_CONFIG.lateMs;
      const delay = Math.max(0, missAt - now);
      const timeoutId = window.setTimeout(() => {
        if (gradedRef.current.has(beat.index)) {
          return;
        }
        registerGrade("miss", beat.index);
      }, delay);
      autoMissRef.current.push(timeoutId);
    });

    const endDelay = Math.max(0, start + getRoundDurationMs(LEVEL_1_CONFIG) - now);
    const endTimeout = window.setTimeout(() => {
      finishRound();
    }, endDelay);
    autoMissRef.current.push(endTimeout);
  }, [finishRound, registerGrade]);

  const handleStart = useCallback(() => {
    setPhase("countdown");
    setCountdown(3);
  }, []);

  useEffect(() => {
    if (phase !== "countdown") {
      return;
    }

    if (countdown <= 0) {
      startPlaying();
      return;
    }

    const timer = window.setTimeout(() => {
      setCountdown((value) => value - 1);
    }, 700);

    return () => clearTimeout(timer);
  }, [phase, countdown, startPlaying]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host || appRef.current) {
      return;
    }

    let disposed = false;

    const init = async () => {
      const app = new Application();
      await app.init({
        width: CANVAS_WIDTH,
        height: CANVAS_HEIGHT,
        backgroundAlpha: 0,
        antialias: true,
        resolution: Math.min(window.devicePixelRatio || 1, 2),
        autoDensity: true,
      });

      if (disposed) {
        app.destroy(true);
        return;
      }

      host.appendChild(app.canvas);
      appRef.current = app;

      const tick = () => {
        drawScene(app, performance.now());
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    };

    void init();

    return () => {
      disposed = true;
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
      appRef.current?.destroy(true);
      appRef.current = null;
    };
  }, [drawScene]);

  const handleRetry = () => {
    autoMissRef.current.forEach(clearTimeout);
    autoMissRef.current = [];
    if (rafRef.current === null && appRef.current) {
      const tick = () => {
        drawScene(appRef.current!, performance.now());
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    }
    setPhase("ready");
    setFlash(null);
  };

  const handleToggleMute = useCallback(async () => {
    if (muted) {
      await playUnlockConfirmation();
    }
    setMuted((value) => !value);
  }, [muted]);

  const hitRate =
    score.total > 0
      ? Math.round(((score.perfect + score.good) / score.total) * 100)
      : 0;

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex gap-3 text-sm text-gold-light/80">
          <span aria-live="polite">
            Combo <strong className="text-gold">{combo}</strong>
          </span>
          <span>
            Perfect <strong className="text-gold">{score.perfect}</strong>
          </span>
        </div>
        <button
          type="button"
          onClick={() => void handleToggleMute()}
          className="min-h-11 rounded-full border border-gold/30 px-4 text-sm text-gold-light hover:border-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold"
          aria-pressed={!muted}
          aria-label={muted ? "Sound off — tap to enable" : "Sound on — tap to mute"}
        >
          {muted ? "🔇 Silent" : "🔊 Sound"}
        </button>
      </div>

      <div
        className="relative overflow-hidden rounded-2xl border border-gold/20 bg-navy-light shadow-lg"
        role="application"
        aria-label="Rhythmic Parrot game canvas"
      >
        <div ref={hostRef} className="mx-auto w-full max-w-[360px]" />

        {phase === "ready" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-navy/75 p-6 text-center">
            <p className="text-xs uppercase tracking-widest text-gold/70">
              Level 1 · {LEVEL_1_CONFIG.bpm} BPM
            </p>
            <h2 className="mt-2 font-display text-2xl text-gold-light">
              Tap when the fruit hits the beak
            </h2>
            <p className="mt-2 max-w-xs text-sm text-gold-light/70">
              Each fruit flies from a different angle but always lands on the
              beak on the beat — tap when it arrives.
            </p>
            <button
              type="button"
              onClick={handleStart}
              className="mt-6 min-h-12 rounded-full bg-gold px-8 font-medium text-navy hover:bg-gold/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold-light"
            >
              Start Round
            </button>
          </div>
        )}

        {phase === "countdown" && (
          <div className="absolute inset-0 flex items-center justify-center bg-navy/60">
            <span className="font-display text-6xl font-bold text-gold animate-pulse">
              {countdown === 0 ? "Go!" : countdown}
            </span>
          </div>
        )}

        {phase === "results" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-navy/85 p-6 text-center">
            <p className="text-xs uppercase tracking-widest text-gold/70">
              Round complete
            </p>
            <p className="mt-2 font-display text-4xl text-gold-light">
              {"★".repeat(stars)}
              {"☆".repeat(3 - stars)}
            </p>
            <p className="mt-3 text-sm text-gold-light/80">
              {hitRate}% on beat · Max combo {score.maxCombo}
            </p>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={handleRetry}
                className="min-h-11 rounded-full bg-gold px-6 font-medium text-navy"
              >
                Play again
              </button>
            </div>
          </div>
        )}

        {flash && phase === "playing" && (
          <div
            className="pointer-events-none absolute left-1/2 top-4 -translate-x-1/2 rounded-full px-4 py-1 text-sm font-semibold uppercase tracking-wide"
            style={{
              color:
                flash.grade === "perfect"
                  ? "#FEF3C7"
                  : flash.grade === "good"
                    ? "#F59E0B"
                    : "#F97316",
            }}
          >
            {flash.grade}
          </div>
        )}
      </div>

      <button
        ref={tapZoneRef}
        type="button"
        disabled={phase !== "playing"}
        className="min-h-14 w-full rounded-2xl border-2 border-gold/40 bg-gold/10 text-lg font-semibold text-gold-light transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold touch-manipulation"
        aria-label="Tap rhythm"
      >
        {phase === "playing" ? "TAP!" : "Tap zone (active during round)"}
      </button>

      <p className="text-center text-xs text-gold-light/50">
        Beat every {Math.round(getBeatIntervalMs(LEVEL_1_CONFIG.bpm))}ms ·
        Spacebar works on desktop
      </p>
    </div>
  );
};
