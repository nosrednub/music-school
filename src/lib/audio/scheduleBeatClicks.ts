import { getSharedAudioContext } from "@/lib/audio/audioContext";

export type TimedClick = {
  atMs: number;
  accent?: boolean;
};

export type ScheduledRhythmHandle = {
  stop: () => void;
};

const scheduleOneClick = (
  ctx: AudioContext,
  atMs: number,
  accent: boolean,
): OscillatorNode => {
  const when = ctx.currentTime + Math.max(0, (atMs - performance.now()) / 1000);
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.value = accent ? 880 : 660;
  const peak = accent ? 0.16 : 0.11;
  osc.connect(gain);
  gain.connect(ctx.destination);
  gain.gain.setValueAtTime(peak, when);
  gain.gain.exponentialRampToValueAtTime(0.001, when + 0.05);
  osc.start(when);
  osc.stop(when + 0.06);
  return osc;
};

/**
 * Schedule metronome clicks on the Web Audio timeline (works on iOS after unlock).
 * `atMs` values use the performance.now() clock.
 */
export const scheduleBeatClicks = (clicks: TimedClick[]): ScheduledRhythmHandle => {
  const ctx = getSharedAudioContext();
  const nodes = clicks.map(({ atMs, accent = false }) =>
    scheduleOneClick(ctx, atMs, accent),
  );

  return {
    stop: () => {
      nodes.forEach((node) => {
        try {
          node.stop();
        } catch {
          /* already stopped */
        }
      });
    },
  };
};

/** Countdown 3-2-1 plus gameplay beat hits. */
export const buildRhythmicParrotClickSchedule = (
  countdownStartMs: number,
  beatHitTimesMs: number[],
  countdownStepMs = 700,
): TimedClick[] => {
  const clicks: TimedClick[] = [
    { atMs: countdownStartMs, accent: true },
    { atMs: countdownStartMs + countdownStepMs, accent: false },
    { atMs: countdownStartMs + countdownStepMs * 2, accent: false },
    { atMs: countdownStartMs + countdownStepMs * 3, accent: true },
  ];

  beatHitTimesMs.forEach((hitAt, index) => {
    clicks.push({
      atMs: hitAt,
      accent: index % 4 === 0,
    });
  });

  return clicks.filter((click) => click.atMs >= countdownStartMs);
};

export { getSharedAudioContext };
