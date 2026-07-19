"use client";

import { useCallback, useRef } from "react";
import { inputBus } from "@/lib/midi/inputBus";
import { playNote, unlockAudio } from "@/lib/audio/audioService";
import { midiToPitch } from "@/lib/theory/notes";
import { cn } from "@/lib/utils";

import { BLACK_KEYS, WHITE_KEYS } from "./pianoLayout";

type OnScreenPianoProps = {
  highlightedMidi?: Set<number>;
  nextMidi?: number | null;
  muted?: boolean;
  onNoteOn?: (midi: number) => void;
};

const releaseFocus = () => {
  const active = document.activeElement;
  if (active instanceof HTMLElement) {
    active.blur();
  }
};

export const OnScreenPiano = ({
  highlightedMidi = new Set(),
  nextMidi = null,
  muted = true,
  onNoteOn,
}: OnScreenPianoProps) => {
  const activeRef = useRef<Set<number>>(new Set());

  const handleNoteStart = useCallback(
    async (midi: number) => {
      if (activeRef.current.has(midi)) {
        return;
      }
      activeRef.current.add(midi);

      inputBus.emitVirtualNote(midi, "noteon");
      onNoteOn?.(midi);

      if (!muted) {
        await unlockAudio();
        await playNote(midiToPitch(midi), 0.4, 75);
      }
    },
    [muted, onNoteOn],
  );

  const handleNoteEnd = useCallback((midi: number) => {
    activeRef.current.delete(midi);
    inputBus.emitVirtualNote(midi, "noteoff", 0);
  }, []);

  const handlePointerDown = useCallback(
    (midi: number) => (event: React.PointerEvent<HTMLDivElement>) => {
      event.preventDefault();
      releaseFocus();
      void handleNoteStart(midi);
    },
    [handleNoteStart],
  );

  const whiteWidth = 100 / WHITE_KEYS.length;

  return (
    <div
      className="relative mx-auto w-full max-w-lg select-none touch-manipulation [-webkit-tap-highlight-color:transparent]"
      style={{ height: 140 }}
      role="group"
      aria-label="On-screen piano keyboard"
    >
      <div className="absolute inset-x-0 bottom-0 flex h-[120px]">
        {WHITE_KEYS.map((key) => {
          const isHighlight = highlightedMidi.has(key.midi);
          const isNext = nextMidi === key.midi;
          return (
            <div
              key={key.midi}
              role="button"
              tabIndex={-1}
              className={cn(
                "relative flex-1 cursor-pointer border border-navy/40 bg-gold-light/90 text-[10px] text-navy/70",
                "active:bg-gold min-h-[120px] rounded-b-md touch-none",
                isHighlight && "bg-gold/40 ring-2 ring-gold",
                isNext && "ring-2 ring-coral bg-gold/60",
              )}
              style={{ width: `${whiteWidth}%` }}
              aria-label={`${key.label} ${Math.floor(key.midi / 12) - 1}`}
              onPointerDown={handlePointerDown(key.midi)}
              onPointerUp={() => handleNoteEnd(key.midi)}
              onPointerLeave={() => handleNoteEnd(key.midi)}
              onPointerCancel={() => handleNoteEnd(key.midi)}
            >
              <span className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2">
                {key.label}
              </span>
            </div>
          );
        })}
      </div>

      {BLACK_KEYS.map((key) => {
        const leftPercent = (key.afterWhite + 1) * whiteWidth - whiteWidth * 0.32;
        const isHighlight = highlightedMidi.has(key.midi);
        const isNext = nextMidi === key.midi;
        return (
          <div
            key={`b-${key.midi}`}
            role="button"
            tabIndex={-1}
            className={cn(
              "absolute top-0 z-10 h-[72px] cursor-pointer rounded-b-md bg-navy border border-navy-light",
              "active:bg-navy-light min-w-[28px] touch-none",
              isHighlight && "ring-2 ring-gold",
              isNext && "ring-2 ring-coral",
            )}
            style={{
              left: `${leftPercent}%`,
              width: `${whiteWidth * 0.65}%`,
            }}
            aria-label={`Black key MIDI ${key.midi}`}
            onPointerDown={handlePointerDown(key.midi)}
            onPointerUp={() => handleNoteEnd(key.midi)}
            onPointerLeave={() => handleNoteEnd(key.midi)}
            onPointerCancel={() => handleNoteEnd(key.midi)}
          />
        );
      })}
    </div>
  );
};
