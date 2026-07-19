"use client";

import { useEffect, useRef } from "react";
import type { Pitch } from "@/types/music";
import { formatPitch } from "@/lib/theory/notes";

type ScaleStaffViewProps = {
  pitches: Pitch[];
  currentIndex: number;
  completedThrough: number;
  title?: string;
};

const pitchToVexKey = (pitch: Pitch): string => {
  return `${pitch.note.toLowerCase()}/${pitch.octave}`;
};

export const ScaleStaffView = ({
  pitches,
  currentIndex,
  completedThrough,
  title,
}: ScaleStaffViewProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || pitches.length === 0) {
      return;
    }

    let cancelled = false;

    const render = async () => {
      const VF = await import("vexflow");
      if (cancelled || !containerRef.current) {
        return;
      }

      container.innerHTML = "";

      const width = Math.min(container.clientWidth || 360, 360);
      const noteCount = pitches.length;
      const height = noteCount > 8 ? 200 : 160;

      const renderer = new VF.Renderer(container, VF.Renderer.Backends.SVG);
      renderer.resize(width, height);
      const context = renderer.getContext();
      context.setFillStyle("#F5E6C8");
      context.setStrokeStyle("#F5E6C8");

      const staveWidth = width - 24;
      const stave = new VF.Stave(12, 24, staveWidth);
      stave.addClef("treble");
      stave.setContext(context).draw();

      const duration = noteCount > 10 ? "8" : "q";
      const staveNotes = pitches.map((pitch, index) => {
        const note = new VF.StaveNote({
          keys: [pitchToVexKey(pitch)],
          duration,
          auto_stem: true,
        });

        if (pitch.note.includes("#")) {
          note.addModifier(new VF.Accidental("#"), 0);
        }

        if (index < completedThrough) {
          note.setStyle({ fillStyle: "#D4A017", strokeStyle: "#D4A017" });
        } else if (index === currentIndex) {
          note.setStyle({ fillStyle: "#FF6B6B", strokeStyle: "#FF6B6B" });
        } else {
          note.setStyle({ fillStyle: "#F5E6C8", strokeStyle: "#F5E6C8" });
        }

        return note;
      });

      const voice = new VF.Voice({ num_beats: noteCount, beat_value: duration === "8" ? 8 : 4 });
      voice.setStrict(false);
      voice.addTickables(staveNotes);

      new VF.Formatter().joinVoices([voice]).format([voice], staveWidth - 40);
      voice.draw(context, stave);
      container.dataset.staffReady = "true";
    };

    void render();

    return () => {
      cancelled = true;
    };
  }, [pitches, currentIndex, completedThrough]);

  return (
    <div className="w-full">
      {title && (
        <p className="mb-2 text-center text-xs uppercase tracking-widest text-gold/70">
          {title}
        </p>
      )}
      <div
        ref={containerRef}
        className="mx-auto overflow-x-auto rounded-lg border border-gold/20 bg-navy/80 p-2"
        role="img"
        aria-label={`Sheet music: ${pitches.map(formatPitch).join(", ")}`}
      />
      <p className="mt-2 text-center text-[10px] text-gold/50">
        Gold = played · Coral = current · Cream = upcoming
      </p>
    </div>
  );
};
