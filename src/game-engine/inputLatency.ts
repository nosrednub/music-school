/**
 * Low-latency input helpers for Tier A (real-time) games.
 * Timestamp at capture; defer UI work.
 */

export type CaptureOptions = {
  onTap: (timeMs: number) => void;
  onKey?: (timeMs: number, code: string) => void;
};

export const captureTapTimestamp = (event: PointerEvent | KeyboardEvent): number => {
  // timeStamp shares the performance.now() epoch in modern browsers
  if (event.timeStamp > 0) {
    return event.timeStamp;
  }
  return performance.now();
};

/**
 * Registers capture-phase listeners for minimal input latency.
 * Returns cleanup function.
 */
export const bindLowLatencyInput = (
  element: HTMLElement,
  options: CaptureOptions,
): (() => void) => {
  const handlePointerDown = (event: PointerEvent) => {
    if (event.button !== 0) {
      return;
    }
    options.onTap(captureTapTimestamp(event));
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (!options.onKey) {
      return;
    }
    if (event.code === "Space") {
      event.preventDefault();
      options.onKey(captureTapTimestamp(event), event.code);
    }
  };

  element.addEventListener("pointerdown", handlePointerDown, {
    capture: true,
    passive: true,
  });
  element.addEventListener("keydown", handleKeyDown, { capture: true });

  return () => {
    element.removeEventListener("pointerdown", handlePointerDown, { capture: true });
    element.removeEventListener("keydown", handleKeyDown, { capture: true });
  };
};

/** Batch React-facing UI updates to avoid blocking the input thread */
export const scheduleUiSync = (callback: () => void): void => {
  requestAnimationFrame(callback);
};

export type GameLatencyTier = "realtime" | "scheduled" | "turnbased";

export const GAME_LATENCY_TIER: Record<string, GameLatencyTier> = {
  "rhythmic-parrot": "realtime",
  rhythmania: "realtime",
  "melody-hunter": "realtime",
  "melody-jay": "realtime",
  solfeigator: "realtime",
  "interval-barks": "realtime",
  notationist: "realtime",
  bassonist: "realtime",
  "scale-studio": "realtime",
  "route-vi": "scheduled",
  departurer: "scheduled",
  lander: "scheduled",
  intervalis: "turnbased",
  chordelius: "turnbased",
  inversionist: "turnbased",
  calibrator: "turnbased",
  "scale-spy": "turnbased",
  melodix: "turnbased",
};
