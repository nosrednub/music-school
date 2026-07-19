import { describe, expect, it, vi } from "vitest";
import { captureTapTimestamp } from "@/game-engine/inputLatency";

describe("inputLatency", () => {
  it("uses timeStamp when available", () => {
    const event = { timeStamp: 1050 } as PointerEvent;
    expect(captureTapTimestamp(event)).toBe(1050);
  });

  it("falls back to performance.now()", () => {
    vi.spyOn(performance, "now").mockReturnValue(2000);
    const event = { timeStamp: 0 } as PointerEvent;
    expect(captureTapTimestamp(event)).toBe(2000);
  });
});
