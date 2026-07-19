import { describe, expect, it } from "vitest";
import {
  bridgeWidthToSemitones,
  evaluateBridge,
  pickChallenge,
  semitonesToBridgeWidth,
  getTeachingTip,
} from "@/games/intervalis/mechanics";

describe("intervalis mechanics", () => {
  it("maps bridge width to semitones", () => {
    expect(bridgeWidthToSemitones(80)).toBe(5);
    expect(semitonesToBridgeWidth(7)).toBe(112);
  });

  it("evaluates exact bridge match", () => {
    const challenge = pickChallenge(1, () => 0.99);
    const width = semitonesToBridgeWidth(challenge.targetSemitones);
    const result = evaluateBridge(width, challenge);
    expect(result.correct).toBe(true);
    expect(result.delta).toBe(0);
  });

  it("evaluates wrong bridge length", () => {
    const challenge = pickChallenge(1, () => 0.5);
    const result = evaluateBridge(semitonesToBridgeWidth(3), challenge);
    if (challenge.targetSemitones !== 3) {
      expect(result.correct).toBe(false);
    }
  });

  it("provides teaching tips", () => {
    const challenge = pickChallenge(1, () => 0);
    expect(getTeachingTip(challenge).length).toBeGreaterThan(10);
  });
});
