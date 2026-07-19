"use client";

import { unlockAudioSync } from "@/lib/audio/audioService";

/** Visible in UI so users can confirm they have the latest deploy. */
export const APP_BUILD_LABEL = "2026-07-19 · pixi-fix";

type SoundGateProps = {
  onEnabled: () => void;
  title?: string;
  description?: string;
};

export const SoundGate = ({
  onEnabled,
  title = "Enable sound",
  description = "Rhythmic Parrot needs audio for the metronome. Tap below — you should hear a short tone immediately.",
}: SoundGateProps) => {
  const handleEnable = () => {
    unlockAudioSync();
    onEnabled();
  };

  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-navy/90 p-6 text-center">
      <p className="text-xs uppercase tracking-widest text-gold/60">{APP_BUILD_LABEL}</p>
      <h2 className="mt-3 font-display text-2xl text-gold-light">{title}</h2>
      <p className="mt-3 max-w-xs text-sm text-gold-light/75">{description}</p>
      <button
        type="button"
        onClick={handleEnable}
        className="mt-8 min-h-14 w-full max-w-xs rounded-2xl bg-gold px-8 text-lg font-semibold text-navy shadow-lg active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold-light"
      >
        Tap to hear the beat
      </button>
      <p className="mt-4 text-xs text-gold-light/45">
        iPhone: turn off the silent switch if you hear nothing
      </p>
    </div>
  );
};
