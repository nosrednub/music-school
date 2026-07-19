"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { MidiConnectPanel } from "@/components/midi/MidiConnectPanel";
import { ScaleStaffView } from "@/components/notation/ScaleStaffView";
import { OnScreenPiano } from "@/components/piano/OnScreenPiano";
import { unlockAudio } from "@/lib/audio/audioService";
import { inputBus } from "@/lib/midi";
import { cn } from "@/lib/utils";
import {
  type ExerciseId,
  type RootOption,
  type ScaleCategory,
  type ScaleLibraryId,
  EXERCISES,
  ROOT_OPTIONS,
  SCALE_LIBRARY,
  createSession,
  getExerciseProgress,
  getScaleEntry,
  getScalesByCategory,
  getStaffPitchesForExercise,
  processNoteOn,
  searchScales,
} from "./mechanics";

type FeedbackKind = "correct" | "wrong" | "complete" | null;

const PIANO_DOCK_HEIGHT =
  "calc(9.75rem + max(0.5rem, env(safe-area-inset-bottom)))";

const preserveScrollY = (action: () => void) => {
  const scrollY = window.scrollY;
  action();
  requestAnimationFrame(() => {
    window.scrollTo(0, scrollY);
  });
};

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
  const [search, setSearch] = useState("");
  const [root, setRoot] = useState<RootOption>("C");
  const [scaleId, setScaleId] = useState<ScaleLibraryId>("major");
  const [exerciseId, setExerciseId] = useState<ExerciseId>("scale-run-up");
  const [muted, setMuted] = useState(defaultMuted);
  const [session, setSession] = useState(() =>
    createSession("C", "major", "scale-run-up"),
  );
  const [feedback, setFeedback] = useState<FeedbackKind>(null);
  const [libraryOpen, setLibraryOpen] = useState(false);

  const scaleOptions = useMemo(() => {
    const byCat = getScalesByCategory(category);
    if (!search.trim()) {
      return byCat;
    }
    const ids = new Set(searchScales(search).map((s) => s.id));
    return byCat.filter((s) => ids.has(s.id));
  }, [category, search]);

  const scaleDef = getScaleEntry(scaleId);
  const exerciseDef = EXERCISES.find((e) => e.id === exerciseId);
  const progress = getExerciseProgress(session);

  const staffPitches = useMemo(
    () => getStaffPitchesForExercise(root, scaleId, exerciseId),
    [root, scaleId, exerciseId],
  );

  const highlightedMidi = useMemo(
    () => new Set(session.targetMidi),
    [session.targetMidi],
  );

  const nextMidi = session.targetMidi[session.nextIndex] ?? null;

  const resetSession = useCallback(() => {
    setSession(createSession(root, scaleId, exerciseId));
    setFeedback(null);
  }, [root, scaleId, exerciseId]);

  useEffect(() => {
    resetSession();
  }, [resetSession]);

  const handleNoteOn = useCallback((midi: number) => {
    preserveScrollY(() => {
      setSession((prev) => {
        const result = processNoteOn(prev, midi);

        if (result.correct && result.complete) {
          setFeedback("complete");
        } else if (result.correct) {
          setFeedback("correct");
        } else {
          setFeedback("wrong");
        }

        window.setTimeout(() => setFeedback(null), 500);
        return result.session;
      });
    });
  }, []);

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
    const filtered = search.trim()
      ? options.filter((s) =>
          searchScales(search).some((hit) => hit.id === s.id),
        )
      : options;
    if (!filtered.some((s) => s.id === scaleId) && filtered[0]) {
      setScaleId(filtered[0].id);
    }
  };

  return (
    <main
      className="mx-auto flex min-h-dvh max-w-lg flex-col px-4 pt-4"
      style={{ paddingBottom: PIANO_DOCK_HEIGHT }}
    >
      <header className="mb-3 flex items-center justify-between gap-3">
        <Link
          href="/"
          className="min-h-11 min-w-11 flex items-center justify-center rounded-full text-gold/80 hover:text-gold"
          aria-label="Back to home"
        >
          ←
        </Link>
        <div className="text-center">
          <h1 className="font-display text-2xl font-bold text-gold-light">
            Scale Studio
          </h1>
          <p className="text-xs text-gold/60">
            {SCALE_LIBRARY.length} scales · sheet music drills
          </p>
        </div>
        <button
          type="button"
          onClick={() => void handleToggleMute()}
          className="min-h-11 rounded-full border border-gold/30 px-3 text-xs"
          aria-label={muted ? "Unmute piano" : "Mute piano"}
        >
          {muted ? "🔇" : "🔊"}
        </button>
      </header>

      <MidiConnectPanel />

      {/* Sheet music hero */}
      <section className="mt-4 rounded-xl border border-gold/30 bg-navy-light/50 p-3">
        <ScaleStaffView
          pitches={staffPitches}
          currentIndex={session.nextIndex}
          completedThrough={session.nextIndex}
          title={`${scaleDef?.label ?? "Scale"} in ${root} · ${exerciseDef?.label ?? "Exercise"}`}
        />
        <div className="mt-3">
          <div className="h-2 overflow-hidden rounded-full bg-navy">
            <div
              className="h-full bg-gold transition-all duration-200"
              style={{ width: `${progress.percent}%` }}
            />
          </div>
          <p className="mt-1 text-center text-xs text-gold/70">
            {progress.current}/{progress.total} notes · follow the staff
          </p>
        </div>
      </section>

      {/* Feedback strip — no aria-live here (iOS Safari scrolls to live regions) */}
      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {feedback === "wrong" && "Wrong note — read the coral note on the staff"}
        {feedback === "complete" &&
          `Run complete. Streak ${session.streak}. Best ${session.bestStreak}.`}
      </p>
      <section
        className={cn(
          "mt-3 rounded-lg border px-3 py-2 text-center text-sm transition-colors",
          feedback === "wrong" && "border-coral bg-coral/10 text-coral",
          feedback === "complete" && "border-gold bg-gold/15 text-gold-light",
          feedback === "correct" && "border-gold/40 bg-gold/5",
          !feedback && "border-transparent text-gold/60",
        )}
      >
        {feedback === "complete" && (
          <span>
            Run complete! Streak {session.streak} · Best {session.bestStreak}
          </span>
        )}
        {feedback === "wrong" && (
          <span>Wrong note — read the coral note on the staff</span>
        )}
        {feedback === "correct" && <span>✓</span>}
        {!feedback && (
          <span>
            Streak {session.streak} · Mistakes {session.mistakes}
            {" · "}
            <button type="button" onClick={resetSession} className="underline">
              Reset
            </button>
          </span>
        )}
      </section>

      {/* Exercise picker */}
      <section className="mt-4">
        <p className="text-xs uppercase tracking-widest text-gold/70">Exercise</p>
        <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
          {EXERCISES.map((ex) => (
            <button
              key={ex.id}
              type="button"
              onClick={() => setExerciseId(ex.id)}
              className={cn(
                "min-w-[100px] shrink-0 rounded-xl border px-3 py-2 text-left",
                exerciseId === ex.id
                  ? "border-gold bg-gold/15"
                  : "border-gold/20 bg-navy-light/30",
              )}
              aria-pressed={exerciseId === ex.id}
            >
              <span className="text-lg">{ex.icon}</span>
              <span className="mt-1 block text-xs font-medium text-gold-light">
                {ex.label}
              </span>
            </button>
          ))}
        </div>
        {exerciseDef && (
          <p className="mt-1 text-xs text-gold/60">{exerciseDef.description}</p>
        )}
      </section>

      {/* Scale library */}
      <section className="mt-4 rounded-xl border border-gold/20 bg-navy-light/40 p-4">
        <button
          type="button"
          onClick={() => setLibraryOpen((o) => !o)}
          className="flex w-full items-center justify-between text-left"
          aria-expanded={libraryOpen}
        >
          <span className="text-xs uppercase tracking-widest text-gold/70">
            Scale library ({scaleOptions.length})
          </span>
          <span className="text-gold/60">{libraryOpen ? "▲" : "▼"}</span>
        </button>

        {libraryOpen && (
          <>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search scales…"
              className="mt-3 w-full rounded-lg border border-gold/20 bg-navy px-3 py-2 text-sm text-gold-light"
              aria-label="Search scale library"
            />
            <div className="mt-2 flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleCategoryChange(cat.id)}
                  className={cn(
                    "min-h-8 rounded-full px-3 text-[10px] uppercase",
                    category === cat.id
                      ? "bg-gold text-navy font-semibold"
                      : "border border-gold/30 text-gold-light",
                  )}
                >
                  {cat.label}
                </button>
              ))}
            </div>
            <div className="mt-3 grid max-h-48 grid-cols-1 gap-2 overflow-y-auto">
              {scaleOptions.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setScaleId(s.id)}
                  className={cn(
                    "rounded-lg border px-3 py-2 text-left",
                    scaleId === s.id
                      ? "border-gold bg-gold/10"
                      : "border-navy-light hover:border-gold/30",
                  )}
                >
                  <span className="text-sm font-medium text-gold-light">
                    {s.label}
                  </span>
                  <span className="block text-[10px] text-gold/50">
                    Tier {s.tier} · {s.tagline}
                  </span>
                </button>
              ))}
            </div>
            <label className="mt-3 flex flex-col gap-1">
              <span className="text-xs text-gold/60">Root</span>
              <select
                value={root}
                onChange={(e) => setRoot(e.target.value as RootOption)}
                className="min-h-11 rounded-lg border border-gold/20 bg-navy px-3 text-sm text-gold-light"
              >
                {ROOT_OPTIONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </label>
          </>
        )}
      </section>

      <div
        className="fixed inset-x-0 bottom-0 z-30 border-t border-gold/20 bg-navy/95 px-4 pt-2 backdrop-blur-sm supports-[backdrop-filter]:bg-navy/85"
        style={{
          paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))",
        }}
      >
        <div className="mx-auto max-w-lg">
          <OnScreenPiano
            highlightedMidi={highlightedMidi}
            nextMidi={nextMidi}
            muted={muted}
          />
        </div>
      </div>
    </main>
  );
};
