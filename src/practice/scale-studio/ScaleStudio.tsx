"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { MidiConnectPanel } from "@/components/midi/MidiConnectPanel";
import { OnScreenPiano } from "@/components/piano/OnScreenPiano";
import { unlockAudio } from "@/lib/audio/audioService";
import { inputBus } from "@/lib/midi";
import { cn } from "@/lib/utils";
import {
  type PracticeScaleId,
  type RootOption,
  type ScaleCategory,
  ROOT_OPTIONS,
  createSession,
  getProgressLabel,
  getScaleDef,
  getScalesByCategory,
  midiToLabel,
  processNoteOn,
} from "./mechanics";

type FeedbackKind = "correct" | "wrong" | "complete" | null;

const CATEGORIES: { id: ScaleCategory | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "classical", label: "Classical" },
  { id: "jazz", label: "Jazz" },
  { id: "gospel", label: "Gospel" },
];

type ScaleStudioProps = {
  defaultMuted?: boolean;
};

export const ScaleStudio = ({ defaultMuted = true }: ScaleStudioProps) => {
  const [category, setCategory] = useState<ScaleCategory | "all">("all");
  const [root, setRoot] = useState<RootOption>("C");
  const [scaleId, setScaleId] = useState<PracticeScaleId>("major");
  const [muted, setMuted] = useState(defaultMuted);
  const [session, setSession] = useState(() => createSession("C", "major"));
  const [feedback, setFeedback] = useState<FeedbackKind>(null);

  const scaleOptions = useMemo(
    () => getScalesByCategory(category),
    [category],
  );

  const scaleDef = getScaleDef(scaleId);
  const nextMidi = session.targetMidi[session.nextIndex] ?? null;

  const highlightedMidi = useMemo(() => {
    return new Set(session.targetMidi);
  }, [session.targetMidi]);

  const resetSession = useCallback(() => {
    setSession(createSession(root, scaleId));
    setFeedback(null);
  }, [root, scaleId]);

  useEffect(() => {
    resetSession();
  }, [resetSession]);

  const handleNoteOn = useCallback(
    (midi: number) => {
      setSession((prev) => {
        const result = processNoteOn(prev, midi);

        if (result.correct && result.complete) {
          setFeedback("complete");
        } else if (result.correct) {
          setFeedback("correct");
        } else {
          setFeedback("wrong");
        }

        window.setTimeout(() => setFeedback(null), 600);
        return result.session;
      });
    },
    [],
  );

  useEffect(() => {
    const unsub = inputBus.subscribe((event) => {
      if (event.type === "noteon" && event.velocity > 0) {
        handleNoteOn(event.note);
      }
    });
    return unsub;
  }, [handleNoteOn]);

  const handleToggleMute = useCallback(async () => {
    if (muted) {
      await unlockAudio();
    }
    setMuted((m) => !m);
  }, [muted]);

  const handleCategoryChange = (next: ScaleCategory | "all") => {
    setCategory(next);
    const options = getScalesByCategory(next);
    if (!options.some((s) => s.id === scaleId) && options[0]) {
      setScaleId(options[0].id);
    }
  };

  return (
    <main className="mx-auto flex min-h-dvh max-w-lg flex-col px-4 pb-6 pt-4">
      <header className="mb-4 flex items-center justify-between gap-3">
        <Link
          href="/"
          className="min-h-11 min-w-11 flex items-center justify-center rounded-full text-gold/80 hover:text-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold"
          aria-label="Back to home"
        >
          ←
        </Link>
        <div className="text-center">
          <h1 className="font-display text-2xl font-bold text-gold-light">
            Scale Studio
          </h1>
          <p className="text-xs text-gold/60">Ascending scale practice</p>
        </div>
        <button
          type="button"
          onClick={() => void handleToggleMute()}
          className="min-h-11 rounded-full border border-gold/30 px-3 text-xs text-gold-light"
          aria-label={muted ? "Unmute piano" : "Mute piano"}
        >
          {muted ? "🔇" : "🔊"}
        </button>
      </header>

      <MidiConnectPanel />

      <section className="mt-4 rounded-xl border border-gold/20 bg-navy-light/40 p-4">
        <p className="text-xs uppercase tracking-widest text-gold/70">Style</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => handleCategoryChange(cat.id)}
              className={cn(
                "min-h-9 rounded-full px-3 text-xs uppercase tracking-wide",
                category === cat.id
                  ? "bg-gold text-navy font-semibold"
                  : "border border-gold/30 text-gold-light",
              )}
              aria-pressed={category === cat.id}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-xs text-gold/60">Root</span>
            <select
              value={root}
              onChange={(e) => setRoot(e.target.value as RootOption)}
              className="min-h-11 rounded-lg border border-gold/20 bg-navy px-3 text-sm text-gold-light"
              aria-label="Scale root"
            >
              {ROOT_OPTIONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs text-gold/60">Scale</span>
            <select
              value={scaleId}
              onChange={(e) => setScaleId(e.target.value as PracticeScaleId)}
              className="min-h-11 rounded-lg border border-gold/20 bg-navy px-3 text-sm text-gold-light"
              aria-label="Scale type"
            >
              {scaleOptions.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <p className="mt-3 text-sm text-gold-light/80">
          {scaleDef?.label ?? "Scale"} in {root} — play each note in order.
        </p>
      </section>

      <section
        className={cn(
          "mt-4 rounded-xl border p-4 text-center transition-colors",
          feedback === "correct" && "border-gold bg-gold/10",
          feedback === "wrong" && "border-coral bg-coral/10",
          feedback === "complete" && "border-gold bg-gold/20",
          !feedback && "border-navy-light bg-navy-light/30",
        )}
        aria-live="polite"
      >
        <p className="text-lg font-medium text-gold-light">
          {getProgressLabel(session)}
        </p>
        {nextMidi !== null && (
          <p className="mt-1 text-sm text-gold/70">
            Next: {midiToLabel(nextMidi)}
          </p>
        )}
        {feedback === "wrong" && (
          <p className="mt-1 text-sm text-coral">Try again — check the highlight</p>
        )}
        {feedback === "complete" && (
          <p className="mt-1 text-sm text-gold">
            Scale complete! Streak: {session.streak}
          </p>
        )}
        <div className="mt-3 flex justify-center gap-4 text-xs text-gold/60">
          <span>Streak {session.streak}</span>
          <span>Mistakes {session.mistakes}</span>
          <button
            type="button"
            onClick={resetSession}
            className="underline hover:text-gold-light"
          >
            Reset
          </button>
        </div>
      </section>

      <div className="mt-auto pt-6">
        <OnScreenPiano
          highlightedMidi={highlightedMidi}
          nextMidi={nextMidi}
          muted={muted}
        />
      </div>
    </main>
  );
};
