import type { GameDefinition } from "@/types/music";

export const GAME_CATALOG: GameDefinition[] = [
  {
    id: "intervalis",
    name: "Intervalis",
    slug: "intervalis",
    category: "intervals",
    description: "Harmonic interval detection",
    skillNodes: ["intervals-harmonic"],
    phase: 1,
  },
  {
    id: "departurer",
    name: "Departurer",
    slug: "departurer",
    category: "intervals",
    description: "Ascending interval detection",
    skillNodes: ["intervals-ascending"],
    phase: 1,
  },
  {
    id: "lander",
    name: "Lander",
    slug: "lander",
    category: "intervals",
    description: "Descending interval detection",
    skillNodes: ["intervals-descending"],
    phase: 1,
  },
  {
    id: "chordelius",
    name: "Chordelius",
    slug: "chordelius",
    category: "chords",
    description: "Chord quality detection",
    skillNodes: ["chords-quality"],
    phase: 1,
  },
  {
    id: "scale-spy",
    name: "Scale Spy",
    slug: "scale-spy",
    category: "scales",
    description: "Scale identification",
    skillNodes: ["scales-identification"],
    phase: 1,
  },
  {
    id: "rhythmic-parrot",
    name: "Rhythmic Parrot",
    slug: "rhythmic-parrot",
    category: "rhythm",
    description: "Rhythm imitation",
    skillNodes: ["rhythm-imitation"],
    phase: 2,
  },
  {
    id: "melody-hunter",
    name: "Melody Hunter",
    slug: "melody-hunter",
    category: "melody",
    description: "Melodic memory — replay on keyboard",
    skillNodes: ["melody-dictation"],
    phase: 2,
  },
  {
    id: "route-vi",
    name: "Route VI",
    slug: "route-vi",
    category: "harmony",
    description: "Chord progression detection",
    skillNodes: ["progressions"],
    phase: 4,
  },
];

export const getGameBySlug = (slug: string): GameDefinition | undefined => {
  return GAME_CATALOG.find((game) => game.slug === slug);
};

export const getGamesByPhase = (phase: number): GameDefinition[] => {
  return GAME_CATALOG.filter((game) => game.phase <= phase);
};
