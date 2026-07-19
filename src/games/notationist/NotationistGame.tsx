"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Application, Graphics, Text } from "pixi.js";
import { ScaleStaffView } from "@/components/notation/ScaleStaffView";
import { playNote, unlockAudio } from "@/lib/audio/audioService";
import { inputBus } from "@/lib/midi";
import { cn } from "@/lib/utils";
import {
  LETTER_BUTTONS,
  ROUNDS_TO_WIN,
  STARTING_LIVES,
  evaluateNote,
  getCoachTip,
  getTravelDurationMs,
  letterToMidiInRange,
  pickNoteChallenge,
  type NoteChallenge,
} from "./mechanics";

type GamePhase = "ready" | "playing" | "feedback" | "complete";

const CANVAS_W = 360;
const CANVAS_H = 200;
const WALL_X = 36;
const START_X = 320;

type NotationistGameProps = {
  defaultMuted?: boolean;
};

export const NotationistGame = ({ defaultMuted = true }: NotationistGameProps) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<Application | null>(null);
  const rafRef = useRef<number | null>(null);

  const phaseRef = useRef<GamePhase>("ready");
  const progressRef = useRef(0);
  const travelStartRef = useRef(0);
  const travelMsRef = useRef(getTravelDurationMs(0));
  const challengeRef = useRef<NoteChallenge | null>(null);
  const mutedRef = useRef(defaultMuted);
  const resolvedRef = useRef(false);

  const [phase, setPhase] = useState<GamePhase>("ready");
  const [muted, setMuted] = useState(defaultMuted);
  const [lives, setLives] = useState(STARTING_LIVES);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [challenge, setChallenge] = useState<NoteChallenge | null>(null);
  const [coachTip, setCoachTip] = useState<string | null>(null);
  const [lastCorrect, setLastCorrect] = useState<boolean | null>(null);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    mutedRef.current = muted;
  }, [muted]);

  useEffect(() => {
    challengeRef.current = challenge;
  }, [challenge]);

  const drawScene = useCallback((app: Application) => {
    const stage = app.stage;
    stage.removeChildren();

    const bg = new Graphics();
    bg.rect(0, 0, CANVAS_W, CANVAS_H);
    bg.fill(0x0f172a);
    stage.addChild(bg);

    const wall = new Graphics();
    wall.rect(WALL_X - 8, 40, 12, 120);
    wall.fill(0x7c3aed);
    stage.addChild(wall);

    const ground = new Graphics();
    ground.rect(0, CANVAS_H - 40, CANVAS_W, 40);
    ground.fill(0x1e293b);
    stage.addChild(ground);

    const progress = progressRef.current;
    const enemyX = WALL_X + (START_X - WALL_X) * (1 - progress);
    const active = challengeRef.current;

    const enemy = new Graphics();
    enemy.roundRect(-18, -24, 36, 48, 6);
    enemy.fill(lastCorrect === false ? 0xf97316 : 0x334155);
    enemy.x = enemyX;
    enemy.y = 100;
    stage.addChild(enemy);

    if (active) {
      const rune = new Text({
        text: active.pitch.note.replace("#", "♯"),
        style: {
          fill: 0xfef3c7,
          fontSize: 20,
          fontFamily: "Fraunces, serif",
          fontWeight: "bold",
        },
      });
      rune.anchor.set(0.5);
      rune.x = enemyX;
      rune.y = 96;
      stage.addChild(rune);
    }

    if (phaseRef.current === "playing" && progress > 0.75) {
      const warn = new Graphics();
      warn.circle(enemyX, 100, 28);
      warn.stroke({ width: 2, color: 0xf97316, alpha: 0.5 + progress * 0.5 });
      stage.addChild(warn);
    }
  }, [lastCorrect]);

  const spawnChallenge = useCallback(
    (nextStreak: number) => {
      const next = pickNoteChallenge(1);
      travelMsRef.current = getTravelDurationMs(nextStreak);
      progressRef.current = 0;
      travelStartRef.current = performance.now();
      resolvedRef.current = false;
      setChallenge(next);
      setCoachTip(null);
      setLastCorrect(null);
      setPhase("playing");
    },
    [],
  );

  const resolveNote = useCallback(
    async (playedMidi: number) => {
      const active = challengeRef.current;
      if (!active || phaseRef.current !== "playing" || resolvedRef.current) {
        return;
      }

      resolvedRef.current = true;
      const result = evaluateNote(active.midi, playedMidi);
      setLastCorrect(result.correct);

      if (!result.correct) {
        setStreak(0);
        streakRef.current = 0;
        setCoachTip(getCoachTip(active));
        setPhase("feedback");
        setLives((l) => {
          const next = Math.max(0, l - 1);
          livesRef.current = next;
          window.setTimeout(() => {
            if (next <= 0) {
              setPhase("ready");
              setLives(STARTING_LIVES);
              livesRef.current = STARTING_LIVES;
              setScore(0);
              scoreRef.current = 0;
              setStreak(0);
              setChallenge(null);
            } else {
              spawnChallenge(0);
            }
          }, 1400);
          return next;
        });
        return;
      }

      if (!mutedRef.current) {
        await unlockAudio();
        await playNote(active.pitch, 0.35, 80);
      }

      const nextScore = scoreRef.current + 1;
      scoreRef.current = nextScore;
      setScore(nextScore);
      const nextStreak = streakRef.current + 1;
      streakRef.current = nextStreak;
      setStreak(nextStreak);

      if (nextScore >= ROUNDS_TO_WIN) {
        setPhase("complete");
        return;
      }

      setPhase("feedback");
      window.setTimeout(() => {
        spawnChallenge(nextStreak);
      }, 400);
    },
    [spawnChallenge],
  );

  const livesRef = useRef(lives);
  const scoreRef = useRef(score);
  const streakRef = useRef(streak);

  useEffect(() => {
    livesRef.current = lives;
  }, [lives]);
  useEffect(() => {
    scoreRef.current = score;
  }, [score]);
  useEffect(() => {
    streakRef.current = streak;
  }, [streak]);

  const handleStart = useCallback(() => {
    scoreRef.current = 0;
    streakRef.current = 0;
    setScore(0);
    setStreak(0);
    setLives(STARTING_LIVES);
    livesRef.current = STARTING_LIVES;
    spawnChallenge(0);
  }, [spawnChallenge]);

  const handleLetter = useCallback(
    (letter: string) => {
      const active = challengeRef.current;
      if (!active) {
        return;
      }
      const midi = letterToMidiInRange(letter, active.midi);
      if (midi !== null) {
        void resolveNote(midi);
      }
    },
    [resolveNote],
  );

  useEffect(() => {
    const unsub = inputBus.subscribe((event) => {
      if (event.type === "noteon" && event.velocity > 0) {
        void resolveNote(event.note);
      }
    });
    return unsub;
  }, [resolveNote]);

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
        if (phaseRef.current === "playing" && !resolvedRef.current) {
          const elapsed = now - travelStartRef.current;
          progressRef.current = Math.min(1, elapsed / travelMsRef.current);
          if (progressRef.current >= 1) {
            resolvedRef.current = true;
            setLastCorrect(false);
            setStreak(0);
            streakRef.current = 0;
            const active = challengeRef.current;
            setCoachTip(active ? getCoachTip(active) : "Too slow!");
            setPhase("feedback");
            setLives((l) => {
              const next = Math.max(0, l - 1);
              livesRef.current = next;
              window.setTimeout(() => {
                if (next <= 0) {
                  setPhase("ready");
                  setLives(STARTING_LIVES);
                  livesRef.current = STARTING_LIVES;
                  setScore(0);
                  scoreRef.current = 0;
                  setChallenge(null);
                } else {
                  spawnChallenge(0);
                }
              }, 1400);
              return next;
            });
          }
        }

        drawScene(app);
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
  }, [drawScene, spawnChallenge]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-widest text-gold/70">
          Spell Staff · treble clef
        </p>
        <button
          type="button"
          onClick={() => void handleToggleMute()}
          className="min-h-11 rounded-full border border-gold/30 px-3 text-xs"
          aria-label={muted ? "Unmute notes" : "Mute notes"}
        >
          {muted ? "🔇" : "🔊"}
        </button>
      </div>

      {challenge && phase !== "ready" && (
        <ScaleStaffView
          pitches={[challenge.pitch]}
          currentIndex={0}
          completedThrough={-1}
          title="Target rune"
        />
      )}

      <div
        ref={hostRef}
        className="mx-auto overflow-hidden rounded-2xl border border-gold/20"
        aria-label="Notationist rampart"
      />

      {phase === "ready" && (
        <div className="rounded-xl border border-gold/30 bg-navy-light/50 p-4 text-center">
          <p className="text-sm text-gold-light/80">
            Read the rune on the staff. Press the matching note on letter
            buttons or MIDI before the enemy reaches the wall.
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

      {(phase === "playing" || phase === "feedback") && (
        <>
          <div className="flex justify-center gap-2">
            {LETTER_BUTTONS.map((letter) => (
              <button
                key={letter}
                type="button"
                onClick={() => handleLetter(letter)}
                disabled={phase !== "playing"}
                className={cn(
                  "min-h-12 min-w-10 rounded-lg border border-gold/30 bg-navy text-sm font-semibold text-gold-light",
                  "hover:border-gold disabled:opacity-40",
                )}
                aria-label={`Play ${letter}`}
              >
                {letter}
              </button>
            ))}
          </div>
          <p className="text-center text-xs text-gold/50">
            Lives {lives} · Streak {streak} · Spells {score}/{ROUNDS_TO_WIN}
          </p>
        </>
      )}

      {phase === "feedback" && coachTip && (
        <p
          className={cn(
            "rounded-lg px-3 py-2 text-center text-sm",
            lastCorrect
              ? "border border-gold/30 bg-gold/10 text-gold-light"
              : "border border-coral/40 bg-coral/10 text-coral",
          )}
        >
          {lastCorrect ? "Spell cast!" : coachTip}
        </p>
      )}

      {phase === "complete" && (
        <div className="rounded-xl border border-gold/40 bg-gold/10 p-4 text-center">
          <p className="font-display text-lg text-gold-light">Rampart defended!</p>
          <p className="mt-1 text-sm text-gold/70">
            {ROUNDS_TO_WIN} runes · best streak {streak}
          </p>
          <button
            type="button"
            onClick={handleStart}
            className="mt-4 min-h-11 rounded-full border border-gold px-6 text-sm text-gold-light"
          >
            Play again
          </button>
        </div>
      )}
    </div>
  );
};
