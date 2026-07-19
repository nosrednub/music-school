"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { Application, Graphics } from "pixi.js";
import {
  playHarmonicInterval,
  unlockAudio,
} from "@/lib/audio/audioService";
import {
  type BridgeEvaluation,
  type IntervalChallenge,
  PIXELS_PER_SEMITONE,
  bridgeWidthToSemitones,
  evaluateBridge,
  getTeachingTip,
  pickChallenge,
} from "./mechanics";

type GamePhase = "ready" | "playing" | "feedback" | "complete";

const CANVAS_W = 360;
const CANVAS_H = 400;
const PILLAR_X = 56;
const PILLAR_Y = 280;
const MAX_BRIDGE_PX = 200;
const ROUNDS_TO_WIN = 5;

type IntervalisGameProps = {
  defaultMuted?: boolean;
};

export const IntervalisGame = ({
  defaultMuted = true,
}: IntervalisGameProps) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<Application | null>(null);
  const rafRef = useRef<number | null>(null);

  const dragActiveRef = useRef(false);
  const bridgeWidthRef = useRef(0);
  const challengeRef = useRef<IntervalChallenge | null>(null);
  const pillarPulseRef = useRef(0);
  const phaseRef = useRef<GamePhase>("ready");
  const feedbackRef = useRef<"ok" | "bad" | null>(null);
  const mutedRef = useRef(defaultMuted);
  const scoreRef = useRef(0);
  const livesRef = useRef(3);

  const [phase, setPhase] = useState<GamePhase>("ready");
  const [muted, setMuted] = useState(defaultMuted);
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [challenge, setChallenge] = useState<IntervalChallenge | null>(null);
  const [lastEval, setLastEval] = useState<BridgeEvaluation | null>(null);
  const [coachTip, setCoachTip] = useState<string | null>(null);
  const [bridgeWidth, setBridgeWidth] = useState(0);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    mutedRef.current = muted;
  }, [muted]);

  const drawScene = useCallback((app: Application) => {
    const stage = app.stage;
    stage.removeChildren();
    const pulse = pillarPulseRef.current;
    const width = bridgeWidthRef.current;
    const feedback = feedbackRef.current;

    const bg = new Graphics();
    bg.rect(0, 0, CANVAS_W, CANVAS_H);
    bg.fill(0x0f172a);
    stage.addChild(bg);

    const canyon = new Graphics();
    canyon.rect(0, 320, CANVAS_W, 80);
    canyon.fill(0x1e293b);
    stage.addChild(canyon);

    const leftPillar = new Graphics();
    leftPillar.roundRect(PILLAR_X - 14, PILLAR_Y - 120, 28, 120, 6);
    leftPillar.fill(0x38bdf8);
    leftPillar.alpha = 0.85 + pulse * 0.15;
    stage.addChild(leftPillar);

    const rightPillar = new Graphics();
    rightPillar.roundRect(PILLAR_X + MAX_BRIDGE_PX - 14, PILLAR_Y - 120, 28, 120, 6);
    rightPillar.fill(0xa78bfa);
    rightPillar.alpha = 0.85 + pulse * 0.15;
    stage.addChild(rightPillar);

    for (let s = 0; s <= 12; s += 1) {
      const x = PILLAR_X + s * PIXELS_PER_SEMITONE;
      const tick = new Graphics();
      tick.moveTo(x, PILLAR_Y - 8);
      tick.lineTo(x, PILLAR_Y - 22);
      tick.stroke({ width: 1, color: 0xf59e0b, alpha: s % 12 === 0 ? 0.8 : 0.25 });
      stage.addChild(tick);
    }

    if (width > 0) {
      const bridge = new Graphics();
      bridge.moveTo(PILLAR_X, PILLAR_Y - 40);
      bridge.lineTo(PILLAR_X + width, PILLAR_Y - 40);
      bridge.stroke({
        width: 6,
        color: feedback === "bad" ? 0xf97316 : feedback === "ok" ? 0xfef3c7 : 0xf59e0b,
        alpha: 0.95,
      });
      stage.addChild(bridge);

      const traveler = new Graphics();
      traveler.circle(PILLAR_X + width * 0.5, PILLAR_Y - 52, 10);
      traveler.fill(0x22c55e);
      stage.addChild(traveler);
    }
  }, []);

  const playChallengeAudio = useCallback(async (ch: IntervalChallenge) => {
    if (mutedRef.current) {
      pillarPulseRef.current = 1;
      return;
    }
    await unlockAudio();
    await playHarmonicInterval(ch.root, ch.upper);
  }, []);

  const beginChallenge = useCallback(() => {
    const ch = pickChallenge(1);
    challengeRef.current = ch;
    bridgeWidthRef.current = 0;
    feedbackRef.current = null;
    setChallenge(ch);
    setBridgeWidth(0);
    setLastEval(null);
    setCoachTip(null);
    setPhase("playing");
    void playChallengeAudio(ch);
  }, [playChallengeAudio]);

  const scheduleNext = useCallback(
    (delayMs: number, action: () => void) => {
      window.setTimeout(action, delayMs);
    },
    [],
  );

  const handleRelease = useCallback(() => {
    if (!dragActiveRef.current || phaseRef.current !== "playing") {
      dragActiveRef.current = false;
      return;
    }

    const current = challengeRef.current;
    if (!current) {
      return;
    }

    dragActiveRef.current = false;
    const evaluation = evaluateBridge(bridgeWidthRef.current, current);
    feedbackRef.current = evaluation.correct ? "ok" : "bad";
    setLastEval(evaluation);
    setCoachTip(getTeachingTip(current));
    setPhase("feedback");

    if (evaluation.correct) {
      scoreRef.current += 1;
      setScore(scoreRef.current);

      if (scoreRef.current >= ROUNDS_TO_WIN) {
        scheduleNext(1400, () => setPhase("complete"));
      } else {
        scheduleNext(1800, beginChallenge);
      }
    } else {
      livesRef.current -= 1;
      setLives(livesRef.current);

      if (livesRef.current <= 0) {
        scheduleNext(1400, () => setPhase("complete"));
      } else {
        scheduleNext(2200, beginChallenge);
      }
    }
  }, [beginChallenge, scheduleNext]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host || appRef.current) {
      return;
    }

    let disposed = false;

    const init = async () => {
      const app = new Application();
      await app.init({
        width: CANVAS_W,
        height: CANVAS_H,
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

      const canvas = app.canvas as HTMLCanvasElement;
      canvas.style.touchAction = "none";

      const updateWidthFromEvent = (clientX: number) => {
        const rect = canvas.getBoundingClientRect();
        const x = ((clientX - rect.left) / rect.width) * CANVAS_W;
        const width = Math.max(0, Math.min(MAX_BRIDGE_PX, x - PILLAR_X));
        bridgeWidthRef.current = width;
        setBridgeWidth(width);
      };

      const onPointerDown = (e: PointerEvent) => {
        if (phaseRef.current !== "playing") {
          return;
        }
        dragActiveRef.current = true;
        canvas.setPointerCapture(e.pointerId);
        updateWidthFromEvent(e.clientX);
      };

      const onPointerMove = (e: PointerEvent) => {
        if (!dragActiveRef.current) {
          return;
        }
        updateWidthFromEvent(e.clientX);
      };

      const onPointerUp = (e: PointerEvent) => {
        if (dragActiveRef.current) {
          updateWidthFromEvent(e.clientX);
          handleRelease();
        }
        try {
          canvas.releasePointerCapture(e.pointerId);
        } catch {
          /* ignore */
        }
      };

      canvas.addEventListener("pointerdown", onPointerDown);
      canvas.addEventListener("pointermove", onPointerMove);
      canvas.addEventListener("pointerup", onPointerUp);
      canvas.addEventListener("pointercancel", onPointerUp);

      const tick = () => {
        if (pillarPulseRef.current > 0) {
          pillarPulseRef.current = Math.max(0, pillarPulseRef.current - 0.02);
        }
        drawScene(app);
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);

      return () => {
        canvas.removeEventListener("pointerdown", onPointerDown);
        canvas.removeEventListener("pointermove", onPointerMove);
        canvas.removeEventListener("pointerup", onPointerUp);
        canvas.removeEventListener("pointercancel", onPointerUp);
      };
    };

    let removeListeners: (() => void) | undefined;
    void init().then((cleanup) => {
      removeListeners = cleanup;
    });

    return () => {
      disposed = true;
      removeListeners?.();
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
      appRef.current?.destroy(true);
      appRef.current = null;
    };
  }, [drawScene, handleRelease]);

  const handleStart = () => {
    scoreRef.current = 0;
    livesRef.current = 3;
    setScore(0);
    setLives(3);
    beginChallenge();
  };

  const handleToggleMute = async () => {
    const next = !muted;
    setMuted(next);
    mutedRef.current = next;
    if (!next) {
      await unlockAudio();
      if (challengeRef.current) {
        await playHarmonicInterval(
          challengeRef.current.root,
          challengeRef.current.upper,
        );
      }
    }
  };

  const handleRetry = () => {
    feedbackRef.current = null;
    setPhase("ready");
    setChallenge(null);
    challengeRef.current = null;
  };

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex items-center justify-between text-sm text-gold-light/80">
        <span>
          Lives <strong className="text-gold">{lives}</strong>
        </span>
        <span>
          Score <strong className="text-gold">{score}</strong>/{ROUNDS_TO_WIN}
        </span>
        <button
          type="button"
          onClick={() => void handleToggleMute()}
          className="min-h-11 rounded-full border border-gold/30 px-4 text-sm text-gold-light"
          aria-pressed={!muted}
        >
          {muted ? "🔇 Silent" : "🔊 Sound"}
        </button>
      </div>

      {challenge && phase !== "ready" && (
        <p className="text-center text-xs text-gold-light/60">
          Drag from the left crystal — bridge length = semitones
          {muted ? " (pillars pulse when interval plays)" : ""}.
          {bridgeWidth > 0 && (
            <> · {bridgeWidthToSemitones(bridgeWidth)} semitones</>
          )}
        </p>
      )}

      <div className="relative overflow-hidden rounded-2xl border border-gold/20 bg-navy-light">
        <div ref={hostRef} className="mx-auto w-full max-w-[360px]" />

        {phase === "ready" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-navy/80 p-6 text-center">
            <h2 className="font-display text-2xl text-gold-light">Resonance Bridge</h2>
            <p className="mt-2 max-w-xs text-sm text-gold-light/70">
              Hear two notes together. Drag a light-bridge — one gold tick per
              semitone. Release to lock.
            </p>
            <button
              type="button"
              onClick={handleStart}
              className="mt-6 min-h-12 rounded-full bg-gold px-8 font-medium text-navy"
            >
              Start
            </button>
          </div>
        )}

        {phase === "feedback" && lastEval && coachTip && (
          <div className="absolute bottom-4 left-4 right-4 rounded-xl border border-gold/30 bg-navy/90 p-4 text-sm text-gold-light">
            <p className="font-semibold text-gold">
              {lastEval.correct ? "Bridge holds!" : "Bridge shatters…"}
            </p>
            <p className="mt-1 text-gold-light/80">
              Target: {challenge?.targetLabel} ({lastEval.targetSemitones} st) · Drew{" "}
              {lastEval.drawnSemitones} st
            </p>
            <p className="mt-2 text-xs text-gold-light/60">{coachTip}</p>
          </div>
        )}

        {phase === "complete" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-navy/85 p-6 text-center">
            <h2 className="font-display text-2xl text-gold-light">Crossing complete</h2>
            <p className="mt-2 text-gold-light/80">
              {score} of {ROUNDS_TO_WIN} bridges · {lives} lives left
            </p>
            <button
              type="button"
              onClick={handleRetry}
              className="mt-6 min-h-11 rounded-full bg-gold px-6 font-medium text-navy"
            >
              Play again
            </button>
          </div>
        )}
      </div>

      {phase === "playing" && challenge && (
        <p className="text-center text-xs text-gold/50">
          Replay interval: toggle sound on · ticks mark semitones
        </p>
      )}
    </div>
  );
};
