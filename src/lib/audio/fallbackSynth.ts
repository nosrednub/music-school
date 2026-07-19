import { getSharedAudioContext } from "@/lib/audio/audioContext";
import type { Pitch } from "@/types/music";
import { pitchToMidi } from "@/lib/theory/notes";

const midiToFrequency = (midi: number): number =>
  440 * 2 ** ((midi - 69) / 12);

/** Soft triangle fallback while sampled piano is still loading. */
export const playFallbackNote = (
  pitch: Pitch | number,
  durationSec = 0.6,
  velocity = 70,
): void => {
  const ctx = getSharedAudioContext();
  const midi = typeof pitch === "number" ? pitch : pitchToMidi(pitch);
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "triangle";
  osc.frequency.value = midiToFrequency(midi);
  const peak = Math.min(0.22, (velocity / 127) * 0.28);
  gain.gain.value = 0.001;
  osc.connect(gain);
  gain.connect(ctx.destination);
  const now = ctx.currentTime;
  gain.gain.setValueAtTime(0.001, now);
  gain.gain.exponentialRampToValueAtTime(peak, now + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.001, now + durationSec);
  osc.start(now);
  osc.stop(now + durationSec + 0.02);
};

export const playFallbackClick = (): void => {
  const ctx = getSharedAudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.value = 880;
  gain.gain.value = 0.06;
  osc.connect(gain);
  gain.connect(ctx.destination);
  const now = ctx.currentTime;
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
  osc.start(now);
  osc.stop(now + 0.05);
};
