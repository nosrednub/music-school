import { describe, expect, it } from "vitest";
import { GAME_CATALOG, getGameBySlug, getGamesByPhase } from "@/lib/games/catalog";

describe("game catalog", () => {
  it("contains all phase 1 MVP games", () => {
    const phase1 = getGamesByPhase(1);
    const slugs = phase1.map((g) => g.slug);
    expect(slugs).toContain("intervalis");
    expect(slugs).toContain("chordelius");
    expect(slugs).toContain("scale-spy");
  });

  it("looks up games by slug", () => {
    const game = getGameBySlug("intervalis");
    expect(game?.name).toBe("Intervalis");
    expect(game?.category).toBe("intervals");
  });

  it("has unique slugs", () => {
    const slugs = GAME_CATALOG.map((g) => g.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });
});
