import { describe, expect, it } from "vitest";
import { getBiomeGames, isGamePlayable, WORLD_BIOMES } from "@/lib/games/biomes";

describe("world biomes", () => {
  it("defines four biomes", () => {
    expect(WORLD_BIOMES).toHaveLength(4);
  });

  it("marks shipped games playable", () => {
    expect(isGamePlayable("notationist")).toBe(true);
    expect(isGamePlayable("departurer")).toBe(true);
    expect(isGamePlayable("lander")).toBe(false);
  });

  it("groups gospel chapel with route vi and scale studio practice", () => {
    const chapel = WORLD_BIOMES.find((b) => b.id === "chapel");
    expect(chapel?.gameSlugs).toContain("route-vi");
    expect(chapel?.practiceLinks?.[0]?.href).toBe("/practice/scale-studio");
    expect(getBiomeGames(chapel!).some((g) => g.slug === "route-vi")).toBe(true);
  });
});
