"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Application, Graphics, Text } from "pixi.js";
import { playChordMidis, unlockAudio } from "@/lib/audio/audioService";
import { cn } from "@/lib/utils";
import {
  CHAPEL_LINE,
  JUNCTION_TIME_MS,
  STATIONS_PER_ROUND,
  TRAVEL_TIME_MS,
  buildJunctionChallenge,
  evaluateSwitch,
  getCoachTip,
  getStationAngle,
  lerpAngle,
  type JunctionChallenge,
} from "./mechanics";

type GamePhase = "ready" | "junction" | "travel" | "derailed" | "complete";

const CANVAS_W = 360;
const CANVAS_H = 320;
const TRACK_CX = 180;
const TRACK_CY = 150;
const TRACK_RX = 130;
const TRACK_RY = 85;

type RouteVIGameProps = {
  defaultMuted?: boolean;
};

export const RouteVIGame = ({ defaultMuted = true }: RouteVIGameProps) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<Application | null>(null);
  const rafRef = useRef<number | null>(null);

  const phaseRef = useRef<GamePhase>("ready");
  const trainAngleRef = useRef(getStationAngle(0, CHAPEL_LINE.length));
  const travelFromRef = useRef(0);
  const travelToRef = useRef(1);
  const travelStartRef = useRef(0);
  const junctionDeadlineRef = useRef(0);
  const derailedRef = useRef(false);
  const mutedRef = useRef(defaultMuted);
  const stepRef = useRef(0);
  const scoreRef = useRef(0);
  const selectedIndexRef = useRef<number | null>(null);
  const challengeRef = useRef<JunctionChallenge | null>(null);
  const timeoutHandledRef = useRef(false);

  const [phase, setPhase] = useState<GamePhase>("ready");
  const [muted, setMuted] = useState(defaultMuted);
  const [step, setStep] = useState(0);
  const [score, setScore] = useState(0);
  const [challenge, setChallenge] = useState<JunctionChallenge | null>(null);
  const [coachTip, setCoachTip] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [timeLeftMs, setTimeLeftMs] = useState(JUNCTION_TIME_MS);

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
    selectedIndexRef.current = selectedIndex;
  }, [selectedIndex]);

  const drawScene = useCallback((app: Application, now: number) => {
    const stage = app.stage;
    stage.removeChildren();
    const currentPhase = phaseRef.current;
    const derailed = derailedRef.current;

    const bg = new Graphics();
    bg.rect(0, 0, CANVAS_W, CANVAS_H);
    bg.fill(0x0f172a);
    stage.addChild(bg);

    const chapelGlow = new Graphics();
    chapelGlow.circle(TRACK_CX, TRACK_CY, TRACK_RY + 24);
    chapelGlow.fill({ color: 0x7c3aed, alpha: 0.12 });
    stage.addChild(chapelGlow);

    const track = new Graphics();
    track.ellipse(TRACK_CX, TRACK_CY, TRACK_RX, TRACK_RY);
    track.stroke({ width: 6, color: 0x475569, alpha: 0.9 });
    stage.addChild(track);

    CHAPEL_LINE.forEach((station, index) => {
      const angle = getStationAngle(index, CHAPEL_LINE.length);
      const x = TRACK_CX + TRACK_RX * Math.cos(angle);
      const y = TRACK_CY + TRACK_RY * Math.sin(angle);

      const dot = new Graphics();
      dot.circle(x, y, index <= stepRef.current ? 10 : 7);
      dot.fill(index <= stepRef.current ? 0xf59e0b : 0x334155);
      stage.addChild(dot);

      const label = new Text({
        text: station.roman,
        style: {
          fill: 0xfef3c7,
          fontSize: 11,
          fontFamily: "DM Sans, sans-serif",
        },
      });
      label.anchor.set(0.5);
      label.x = x;
      label.y = y - 18;
      stage.addChild(label);
    });

    let trainAngle = trainAngleRef.current;
    if (currentPhase === "travel" && travelStartRef.current > 0) {
      const elapsed = now - travelStartRef.current;
      const t = Math.min(1, elapsed / TRAVEL_TIME_MS);
      const fromA = getStationAngle(travelFromRef.current, CHAPEL_LINE.length);
      const toA = getStationAngle(travelToRef.current, CHAPEL_LINE.length);
      trainAngle = lerpAngle(fromA, toA, t);
      trainAngleRef.current = trainAngle;
    }

    const trainX = TRACK_CX + TRACK_RX * Math.cos(trainAngle);
    const trainY = TRACK_CY + TRACK_RY * Math.sin(trainAngle);

    const train = new Graphics();
    if (derailed) {
      train.roundRect(-14, -10, 28, 20, 4);
      train.fill(0xf97316);
      train.rotation = 0.6;
    } else {
      train.roundRect(-12, -8, 24, 16, 4);
      train.fill(0xfef3c7);
    }
    train.x = trainX;
    train.y = trainY;
    stage.addChild(train);

    if (currentPhase === "junction") {
      const pulse = new Graphics();
      pulse.circle(trainX, trainY, 18 + Math.sin(now / 120) * 4);
      pulse.stroke({ width: 2, color: 0xf97316, alpha: 0.7 });
      stage.addChild(pulse);
    }
  }, []);

  const beginJunction = useCallback((stepIndex: number) => {
    const nextChallenge = buildJunctionChallenge(stepIndex, stepIndex >= 2);
    stepRef.current = stepIndex;
    setStep(stepIndex);
    setChallenge(nextChallenge);
    setSelectedIndex(null);
    selectedIndexRef.current = null;
    setCoachTip(null);
    setTimeLeftMs(JUNCTION_TIME_MS);
    junctionDeadlineRef.current = performance.now() + JUNCTION_TIME_MS;
    timeoutHandledRef.current = false;
    derailedRef.current = false;
    setPhase("junction");
  }, []);

  const beginTravel = useCallback((fromStation: number, toStation: number) => {
    travelFromRef.current = fromStation;
    travelToRef.current = toStation;
    travelStartRef.current = performance.now();
    setPhase("travel");
  }, []);

  const resolveJunction = useCallback(
    async (selected: number) => {
      const active = challengeRef.current;
      if (!active || phaseRef.current !== "junction") {
        return;
      }

      const result = evaluateSwitch(active, selected);
      setSelectedIndex(selected);
      selectedIndexRef.current = selected;
      setCoachTip(getCoachTip(result));

      if (!result.correct) {
        derailedRef.current = true;
        setPhase("derailed");
        window.setTimeout(() => {
          derailedRef.current = false;
          beginJunction(active.stepIndex);
        }, 1600);
        return;
      }

      scoreRef.current += 1;
      setScore(scoreRef.current);

      if (!mutedRef.current) {
        await unlockAudio();
        await playChordMidis(result.target.chordMidis);
      }

      const nextStep = active.stepIndex + 1;
      if (nextStep >= STATIONS_PER_ROUND) {
        setPhase("complete");
        return;
      }

      beginTravel(active.stepIndex, nextStep);
      window.setTimeout(() => {
        beginJunction(nextStep);
      }, TRAVEL_TIME_MS);
    },
    [beginJunction, beginTravel],
  );

  const handleStart = useCallback(() => {
    scoreRef.current = 0;
    setScore(0);
    trainAngleRef.current = getStationAngle(0, CHAPEL_LINE.length);
    stepRef.current = 0;
    setStep(0);
    beginJunction(0);
  }, [beginJunction]);

  const handleToggleMute = useCallback(async () => {
    if (muted) {
      await unlockAudio();
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

        if (
          phaseRef.current === "junction" &&
          !timeoutHandledRef.current &&
          selectedIndexRef.current === null
        ) {
          const remaining = Math.max(0, junctionDeadlineRef.current - now);
          setTimeLeftMs(remaining);
          if (remaining <= 0) {
            timeoutHandledRef.current = true;
            derailedRef.current = true;
            setCoachTip("Too slow — throw the switch before the train arrives!");
            setPhase("derailed");
            window.setTimeout(() => {
              derailedRef.current = false;
              const current = challengeRef.current;
              if (current) {
                beginJunction(current.stepIndex);
              }
            }, 1600);
          }
        }

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
  }, [beginJunction, drawScene]);

  const timePercent = (timeLeftMs / JUNCTION_TIME_MS) * 100;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-widest text-gold/70">
          Chapel Line · I–vi–IV–V
        </p>
        <button
          type="button"
          onClick={() => void handleToggleMute()}
          className="min-h-11 rounded-full border border-gold/30 px-3 text-xs"
          aria-label={muted ? "Unmute chords" : "Mute chords"}
        >
          {muted ? "🔇" : "🔊"}
        </button>
      </div>

      <div
        ref={hostRef}
        className="mx-auto overflow-hidden rounded-2xl border border-gold/20"
        aria-label="Route VI train track"
      />

      {phase === "ready" && (
        <div className="rounded-xl border border-gold/30 bg-navy-light/50 p-4 text-center">
          <p className="text-sm text-gold-light/80">
            Route the gospel train through each chord station. Throw the track
            switch before the train arrives at the junction.
          </p>
          <button
            type="button"
            onClick={handleStart}
            className="mt-4 min-h-11 rounded-full bg-gold px-8 font-medium text-navy"
          >
            Start Chapel Line
          </button>
        </div>
      )}

      {phase === "junction" && challenge && (
        <div className="rounded-xl border border-coral/40 bg-coral/5 p-4">
          <p className="text-center text-xs uppercase tracking-widest text-gold/70">
            Junction {step + 1}/{STATIONS_PER_ROUND}
          </p>
          <p className="mt-1 text-center text-sm text-gold-light">
            Route to{" "}
            <strong className="text-gold">
              {challenge.target.roman}
              {challenge.lifeRing ? ` (${challenge.target.symbol})` : ""}
            </strong>
          </p>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-navy">
            <div
              className="h-full bg-coral transition-all duration-100"
              style={{ width: `${timePercent}%` }}
            />
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {challenge.options.map((option, index) => (
              <button
                key={`${option.roman}-${index}`}
                type="button"
                onClick={() => void resolveJunction(index)}
                className={cn(
                  "min-h-16 rounded-xl border px-2 py-3 text-center transition-colors",
                  selectedIndex === index
                    ? "border-gold bg-gold/20"
                    : "border-gold/30 bg-navy hover:border-gold/60",
                )}
                aria-label={`Switch to ${option.roman} ${option.symbol}`}
              >
                <span className="block text-lg font-semibold text-gold-light">
                  {option.roman}
                </span>
                <span className="mt-1 block text-[10px] text-gold/60">
                  {challenge.lifeRing ? option.symbol : "♪"}
                </span>
              </button>
            ))}
          </div>
          {challenge.lifeRing && (
            <p className="mt-2 text-center text-[10px] text-gold/50">
              Life-ring: chord symbols shown
            </p>
          )}
        </div>
      )}

      {phase === "derailed" && (
        <p className="rounded-lg border border-coral/40 bg-coral/10 px-3 py-2 text-center text-sm text-coral">
          Derailed! {coachTip ?? "Try that junction again."}
        </p>
      )}

      {phase === "complete" && (
        <div className="rounded-xl border border-gold/40 bg-gold/10 p-4 text-center">
          <p className="font-display text-lg text-gold-light">
            Chapel Line complete!
          </p>
          <p className="mt-1 text-sm text-gold/70">
            Score {score}/{STATIONS_PER_ROUND} junctions
          </p>
          <button
            type="button"
            onClick={handleStart}
            className="mt-4 min-h-11 rounded-full border border-gold px-6 text-sm text-gold-light"
          >
            Run again
          </button>
        </div>
      )}

      {phase !== "ready" && phase !== "complete" && (
        <p className="text-center text-xs text-gold/50">
          Score {score} · Gospel Chapel route
        </p>
      )}
    </div>
  );
};
