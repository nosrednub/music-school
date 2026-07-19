import type { GameDefinition } from "@/types/music";
import { GAME_CATALOG } from "./catalog";

export type BiomeDefinition = {
  id: string;
  name: string;
  description: string;
  borderClass: string;
  bgClass: string;
  gameSlugs: string[];
  practiceLinks?: { href: string; name: string; description: string }[];
};

export const WORLD_BIOMES: BiomeDefinition[] = [
  {
    id: "canyon",
    name: "Interval Canyon",
    description: "Bridges, crystals, and harmonic leaps",
    borderClass: "border-sky-500/30",
    bgClass: "bg-sky-950/20",
    gameSlugs: ["intervalis", "departurer", "lander"],
  },
  {
    id: "chapel",
    name: "Gospel Chapel",
    description: "Progressions, organ groove, chapel line routing",
    borderClass: "border-violet-500/40",
    bgClass: "bg-violet-950/25",
    gameSlugs: ["route-vi"],
    practiceLinks: [
      {
        href: "/practice/scale-studio",
        name: "Scale Studio",
        description: "Sheet music drills · full scale library",
      },
    ],
  },
  {
    id: "roost",
    name: "Rhythm Roost",
    description: "Timing, syncopation, and groove",
    borderClass: "border-amber-500/30",
    bgClass: "bg-amber-950/15",
    gameSlugs: ["rhythmic-parrot"],
  },
  {
    id: "staff",
    name: "Deep Staff",
    description: "Sight reading under pressure",
    borderClass: "border-gold/30",
    bgClass: "bg-gold/5",
    gameSlugs: ["notationist", "chordelius", "scale-spy"],
  },
];

const PLAYABLE_SLUGS = new Set([
  "rhythmic-parrot",
  "intervalis",
  "route-vi",
  "notationist",
]);

export const isGamePlayable = (slug: string): boolean =>
  PLAYABLE_SLUGS.has(slug);

export const getBiomeGames = (biome: BiomeDefinition): GameDefinition[] => {
  return biome.gameSlugs
    .map((slug) => GAME_CATALOG.find((g) => g.slug === slug))
    .filter((g): g is GameDefinition => g !== undefined);
};
