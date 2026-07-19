"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Application, Graphics, Text } from "pixi.js";
import {
  playHarmonicInterval,
  playUnlockConfirmation,
} from "@/lib/audio/audioService";
import { inputBus } from "@/lib/midi";
import { cn } from "@/lib/utils";
import {
  PX_PER_SEMITONE,
  ROUNDS_TO_WIN,
  STARTING_LIVES,
  evaluateLaunch,
  fuelPercentToSemitones,
  getCoachTip,
  midiMatchesTarget,
  pickDeparturerChallenge,
  semitonesToFuelPercent,
  formatPitchLabel,
  type DeparturerChallenge,
  type LaunchEvaluation,
} from "./mechanics";

type GamePhase = "ready" | "playing" | "launching" | "feedback" | "complete";

const CANVAS_W = 360;
const CANVAS_H = 360;
const PAD_X = 72;
const GROUND_Y = 300;

type DeparturerGameProps = {
  defaultMuted?: boolean;
};

export const DeparturerGame = ({ defaultMuted = true }: DeparturerGameProps) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<Application | null>(null);
  const rafRef = useRef<number | null>(null);

  const phaseRef = useRef<GamePhase>("ready");
  const fuelPercentRef = useRef(58);
  const launchProgressRef = useRef(0);
  const launchStartRef = useRef(0);
  const launchFromRef = useRef(0);
  const launchToRef = useRef(0);
  const challengeRef = useRef<DeparturerChallenge | null>(null);
  const mutedRef = useRef(defaultMuted);
  const lastEvalRef = useRef<LaunchEvaluation | null>(null);

  const [phase, setPhase] = useState<GamePhase>("ready");
  const [muted, setMuted] = useState(defaultMuted);
  const [fuelPercent, setFuelPercent] = useState(58);
  const [lives, setLives] = useState(STARTING_LIVES);
  const [score, setScore] = useState(0);
  const [challenge, setChallenge] = useState<DeparturerChallenge | null>(null);
  const [lastEval, setLastEval] = useState<LaunchEvaluation | null>(null);
  const [coachTip, setCoachTip] = useState<string | null>(null);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);
  useEffect(() => {
    mutedRef.current = muted;
  }, [muted]);
  useEffect(() => {
    challengeRef.current = challenge;
  }, [challenge]);
  useEffect(() => {
    fuelPercentRef.current = fuelPercent;
  }, [fuelPercent]);
  useEffect(() => {
    lastEvalRef.current = lastEval;
  }, [lastEval]);

  const altitudeY = (semitones: number) =>
    GROUND_Y - semitones * PX_PER_SEMITONE;

  const drawScene = useCallback((app: Application, now: number) => {
    const stage = app.stage;
    stage.removeChildren();
    const active = challengeRef.current;
    const currentPhase = phaseRef.current;

    const bg = new Graphics();
    bg.rect(0, 0, CANVAS_W, CANVAS_H);
    bg.fill(0x0f172a);
    stage.addChild(bg);

    const sky = new Graphics();
    sky.rect(0, 0, CANVAS_W, GROUND_Y);
    sky.fill({ color: 0x1e3a5f, alpha: 0.5 });
    stage.addChild(sky);

    const ground = new Graphics();
    ground.rect(0, GROUND_Y, CANVAS_W, CANVAS_H - GROUND_Y);
    ground.fill(0x1e293b);
    stage.addChild(ground);

    if (active) {
      const targetY = altitudeY(active.targetSemitones);
      const band = new Graphics();
      band.rect(PAD_X + 20, targetY - 6, CANVAS_W - PAD_X - 40, 12);
      band.fill({ color: 0xa78bfa, alpha: 0.35 });
      band.stroke({ width: 2, color: 0xa78bfa, alpha: 0.8 });
      stage.addChild(band);

      const targetLabel = new Text({
        text: `Target · ${active.label}`,
        style: { fill: 0xfef3c7, fontSize: 10, fontFamily: "DM Sans, sans-serif" },
      });
      targetLabel.x = PAD_X + 24;
      targetLabel.y = targetY - 22;
      stage.addChild(targetLabel);
    }

    let rocketY = GROUND_Y - 28;
    if (currentPhase === "launching" && launchStartRef.current > 0) {
      const elapsed = now - launchStartRef.current;
      const t = Math.min(1, elapsed / 900);
      const eased = 1 - (1 - t) ** 3;
      rocketY = launchFromRef.current + (launchToRef.current - launchFromRef.current) * eased;
      launchProgressRef.current = t;
    } else if (currentPhase === "feedback" || currentPhase === "playing") {
      rocketY = GROUND_Y - 28;
    }

    const rocket = new Graphics();
    rocket.roundRect(-14, -36, 28, 44, 4);
    rocket.fill(lastEvalRef.current?.correct === false ? 0xf97316 : 0xfef3c7);
    rocket.x = PAD_X;
    rocket.y = rocketY;
    stage.addChild(rocket);

    const flame = new Graphics();
    flame.moveTo(-8, 8);
    flame.lineTo(0, 24 + Math.sin(now / 80) * 4);
    flame.lineTo(8, 8);
    flame.fill({ color: 0xf59e0b, alpha: currentPhase === "launching" ? 0.9 : 0.3 });
    flame.x = PAD_X;
    flame.y = rocketY;
    stage.addChild(flame);

    if (currentPhase === "playing" && active) {
      const previewY = altitudeY(fuelPercentToSemitones(fuelPercentRef.current));
      const preview = new Graphics();
      preview.moveTo(PAD_X, GROUND_Y - 28);
      preview.lineTo(PAD_X + 40, previewY);
      preview.stroke({ width: 2, color: 0xf59e0b, alpha: 0.5 });
      stage.addChild(preview);
    }
  }, []);

  const playChallengeAudio = useCallback((c: DeparturerChallenge) => {
    if (mutedRef.current) {
      return;
    }
    playHarmonicInterval(c.root, c.target, 1.2);
  }, []);

  const startRound = useCallback((c: DeparturerChallenge) => {
    setChallenge(c);
    setLastEval(null);
    setCoachTip(null);
    setFuelPercent(semitonesToFuelPercent(Math.min(7, c.targetSemitones)));
    setPhase("playing");
    playChallengeAudio(c);
  }, [playChallengeAudio]);

  const handleStart = useCallback(() => {
    setScore(0);
    setLives(STARTING_LIVES);
    void startRound(pickDeparturerChallenge(1));
  }, [startRound]);

  const handleLaunch = useCallback(() => {
    const active = challengeRef.current;
    if (!active || phaseRef.current !== "playing") {
      return;
    }

    const fuelSemitones = fuelPercentToSemitones(fuelPercentRef.current);
    const evalResult = evaluateLaunch(fuelSemitones, active, 0);
    setLastEval(evalResult);
    lastEvalRef.current = evalResult;

    launchFromRef.current = GROUND_Y - 28;
    launchToRef.current = altitudeY(fuelSemitones);
    launchStartRef.current = performance.now();
    setPhase("launching");

    window.setTimeout(() => {
      setCoachTip(getCoachTip(active));
      if (evalResult.correct) {
        setScore((prev) => {
          const next = prev + 1;
          if (next >= ROUNDS_TO_WIN) {
            setPhase("complete");
          } else {
            setPhase("feedback");
            window.setTimeout(() => {
              void startRound(pickDeparturerChallenge(1));
            }, 1200);
          }
          return next;
        });
      } else {
        setLives((l) => {
          const next = Math.max(0, l - 1);
          if (next <= 0) {
            setPhase("ready");
            return STARTING_LIVES;
          }
          setPhase("feedback");
          window.setTimeout(() => {
            void startRound(pickDeparturerChallenge(1));
          }, 1400);
          return next;
        });
      }
    }, 950);
  }, [startRound]);

  useEffect(() => {
    const unsub = inputBus.subscribe((event) => {
      if (event.type !== "noteon" || event.velocity === 0) {
        return;
      }
      const active = challengeRef.current;
      if (!active || phaseRef.current !== "playing") {
        return;
      }
      if (midiMatchesTarget(active, event.note)) {
        const pct = semitonesToFuelPercent(active.targetSemitones);
        setFuelPercent(pct);
        fuelPercentRef.current = pct;
        handleLaunch();
      }
    });
    return unsub;
  }, [handleLaunch]);

  const handleToggleMute = useCallback(() => {
    if (muted) {
      playUnlockConfirmation();
    }
    setMuted((m) => !m);
  }, [muted]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) {
      return;
    }

    let destroyed = false;
    const app = new Application();

    void (async () => {
      await app.init({
        width: CANVAS_W,
        height: CANVAS_H,
        backgroundAlpha: 0,
        antialias: true,
        resolution: Math.min(window.devicePixelRatio || 1, 2),
        autoDensity: true,
      });

      if (destroyed) {
        app.destroy(true);
        return;
      }

      host.appendChild(app.canvas);
      appRef.current = app;

      const tick = (now: number) => {
        drawScene(app, now);
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    })();

    return () => {
      destroyed = true;
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      appRef.current?.destroy(true);
      appRef.current = null;
    };
  }, [drawScene]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-widest text-gold/70">
          Rocket Reach · ascending intervals
        </p>
        <button
          type="button"
          onClick={handleToggleMute}
          className="min-h-11 rounded-full border border-gold/30 px-3 text-xs"
          aria-label={muted ? "Unmute" : "Mute"}
        >
          {muted ? "🔇" : "🔊"}
        </button>
      </div>

      <div
        ref={hostRef}
        className="mx-auto overflow-hidden rounded-2xl border border-gold/20"
        aria-label="Departurer rocket scene"
      />

      {phase === "ready" && (
        <div className="rounded-xl border border-gold/30 bg-navy-light/50 p-4 text-center">
          <p className="text-sm text-gold-light/80">
            Hear the interval. Set fuel to match the target altitude, then launch.
            Or play the upper note on MIDI to auto-launch.
          </p>
          <button
            type="button"
            onClick={handleStart}
            className="mt-4 min-h-11 rounded-full bg-gold px-8 font-medium text-navy"
          >
            Start
          </button>
        </div>
      )}

      {(phase === "playing" || phase === "launching") && challenge && (
        <div className="rounded-xl border border-gold/20 bg-navy-light/40 p-4">
          <p className="text-center text-sm text-gold-light">
            Ignition{" "}
            <strong className="text-gold">{formatPitchLabel(challenge.root)}</strong>
            {" → "}
            reach <strong className="text-gold">{challenge.label}</strong>
          </p>
          <label className="mt-4 block">
            <span className="text-xs text-gold/60">
              Fuel gauge · {fuelPercentToSemitones(fuelPercent)} semitones
            </span>
            <input
              type="range"
              min={0}
              max={100}
              value={fuelPercent}
              onChange={(e) => setFuelPercent(Number(e.target.value))}
              disabled={phase === "launching"}
              className="mt-2 w-full accent-gold"
              aria-label="Fuel gauge semitones"
            />
          </label>
          <button
            type="button"
            onClick={handleLaunch}
            disabled={phase === "launching"}
            className="mt-4 min-h-12 w-full rounded-full bg-gold font-medium text-navy disabled:opacity-50"
          >
            Launch
          </button>
        </div>
      )}

      {phase === "feedback" && lastEval && (
        <p
          className={cn(
            "rounded-lg px-3 py-2 text-center text-sm",
            lastEval.correct
              ? "border border-gold/30 bg-gold/10 text-gold-light"
              : "border border-coral/40 bg-coral/10 text-coral",
          )}
        >
          {lastEval.correct
            ? "Perfect altitude!"
            : `Miss — needed ${lastEval.targetSemitones} st, flew ${lastEval.fuelSemitones} st. ${coachTip ?? ""}`}
        </p>
      )}

      {phase === "complete" && (
        <div className="rounded-xl border border-gold/40 bg-gold/10 p-4 text-center">
          <p className="font-display text-lg text-gold-light">Orbit achieved!</p>
          <p className="mt-1 text-sm text-gold/70">{ROUNDS_TO_WIN} launches · {lives} lives left</p>
          <button
            type="button"
            onClick={handleStart}
            className="mt-4 min-h-11 rounded-full border border-gold px-6 text-sm text-gold-light"
          >
            Fly again
          </button>
        </div>
      )}

      {phase !== "ready" && phase !== "complete" && (
        <p className="text-center text-xs text-gold/50">
          Score {score}/{ROUNDS_TO_WIN} · Lives {lives}
        </p>
      )}
    </div>
  );
};
