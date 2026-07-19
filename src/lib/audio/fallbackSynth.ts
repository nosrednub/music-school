import { resumeFromUserGesture } from "@/lib/audio/audioContext";
import type { Pitch } from "@/types/music";
import { pitchToMidi } from "@/lib/theory/notes";

const midiToFrequency = (midi: number): number =>
  440 * 2 ** ((midi - 69) / 12);

/** Soft triangle tone — works immediately without sample downloads. */
export const playFallbackNote = (
  pitch: Pitch | number,
  durationSec = 0.6,
  velocity = 70,
): void => {
  const ctx = resumeFromUserGesture();
  const midi = typeof pitch === "number" ? pitch : pitchToMidi(pitch);
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "triangle";
  osc.frequency.value = midiToFrequency(midi);
  const peak = Math.min(0.28, (velocity / 127) * 0.35);
  osc.connect(gain);
  gain.connect(ctx.destination);
  const now = ctx.currentTime;
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.linearRampToValueAtTime(peak, now + 0.012);
  gain.gain.linearRampToValueAtTime(0.0001, now + durationSec);
  osc.start(now);
  osc.stop(now + durationSec + 0.03);
};

export const playFallbackClick = (accent = false): void => {
  const ctx = resumeFromUserGesture();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.value = accent ? 880 : 660;
  const peak = accent ? 0.14 : 0.1;
  osc.connect(gain);
  gain.connect(ctx.destination);
  const now = ctx.currentTime;
  gain.gain.setValueAtTime(peak, now);
  gain.gain.linearRampToValueAtTime(0.0001, now + 0.05);
  osc.start(now);
  osc.stop(now + 0.06);
};
