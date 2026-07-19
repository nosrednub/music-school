import { describe, expect, it } from "vitest";
import { buildRhythmicParrotClickSchedule } from "@/lib/audio/scheduleBeatClicks";

describe("scheduleBeatClicks", () => {
  it("includes countdown and gameplay beats", () => {
    const countdownStart = 1000;
    const hits = [3950, 4700, 5450];

    const clicks = buildRhythmicParrotClickSchedule(countdownStart, hits);

    expect(clicks.length).toBe(4 + hits.length);
    expect(clicks[0]?.atMs).toBe(countdownStart);
    expect(clicks[3]?.atMs).toBe(countdownStart + 2100);
    expect(clicks[4]?.atMs).toBe(3950);
    expect(clicks[4]?.accent).toBe(true);
    expect(clicks[5]?.accent).toBe(false);
  });
});
