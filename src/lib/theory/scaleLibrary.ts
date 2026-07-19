import type { ScaleType } from "@/types/music";
import { SCALE_TYPE_LABELS } from "./scales";

export type ScaleCategory = "classical" | "jazz" | "gospel";

export type ScaleTier = 1 | 2 | 3 | 4;

export type ScaleLibraryId =
  | ScaleType
  | "major-pentatonic"
  | "minor-pentatonic"
  | "blues-six"
  | "bebop-dominant"
  | "bebop-major"
  | "altered"
  | "whole-tone"
  | "diminished-hw"
  | "diminished-wh"
  | "lydian-dominant"
  | "mixolydian-b6"
  | "chromatic"
  | "harmonic-major"
  | "double-harmonic"
  | "neapolitan-minor";

export type ScaleLibraryEntry = {
  id: ScaleLibraryId;
  label: string;
  tier: ScaleTier;
  categories: ScaleCategory[];
  intervals: number[];
  tagline: string;
};

/** Full curriculum library — Scale Spy + Scale Studio */
export const SCALE_LIBRARY: ScaleLibraryEntry[] = [
  // Tier 1 — Foundations
  {
    id: "major",
    label: SCALE_TYPE_LABELS.major,
    tier: 1,
    categories: ["classical", "gospel"],
    intervals: [0, 2, 4, 5, 7, 9, 11],
    tagline: "Ionian — the home key",
  },
  {
    id: "natural-minor",
    label: SCALE_TYPE_LABELS["natural-minor"],
    tier: 1,
    categories: ["classical"],
    intervals: [0, 2, 3, 5, 7, 8, 10],
    tagline: "Aeolian — relative minor",
  },
  {
    id: "harmonic-minor",
    label: SCALE_TYPE_LABELS["harmonic-minor"],
    tier: 1,
    categories: ["classical", "jazz"],
    intervals: [0, 2, 3, 5, 7, 8, 11],
    tagline: "Raised 7th — classical cadence",
  },
  {
    id: "melodic-minor",
    label: SCALE_TYPE_LABELS["melodic-minor"],
    tier: 1,
    categories: ["jazz"],
    intervals: [0, 2, 3, 5, 7, 9, 11],
    tagline: "Jazz minor ascending",
  },
  {
    id: "harmonic-major",
    label: "Harmonic Major",
    tier: 1,
    categories: ["classical"],
    intervals: [0, 2, 4, 5, 7, 8, 11],
    tagline: "Major with lowered 6th",
  },
  // Tier 2 — Modes
  {
    id: "dorian",
    label: SCALE_TYPE_LABELS.dorian,
    tier: 2,
    categories: ["jazz", "gospel"],
    intervals: [0, 2, 3, 5, 7, 9, 10],
    tagline: "Minor with major 6th",
  },
  {
    id: "phrygian",
    label: SCALE_TYPE_LABELS.phrygian,
    tier: 2,
    categories: ["classical", "jazz"],
    intervals: [0, 1, 3, 5, 7, 8, 10],
    tagline: "Spanish / flamenco color",
  },
  {
    id: "lydian",
    label: SCALE_TYPE_LABELS.lydian,
    tier: 2,
    categories: ["jazz"],
    intervals: [0, 2, 4, 6, 7, 9, 11],
    tagline: "Bright #4 sound",
  },
  {
    id: "mixolydian",
    label: SCALE_TYPE_LABELS.mixolydian,
    tier: 2,
    categories: ["gospel", "jazz"],
    intervals: [0, 2, 4, 5, 7, 9, 10],
    tagline: "Dominant / church groove",
  },
  {
    id: "locrian",
    label: SCALE_TYPE_LABELS.locrian,
    tier: 2,
    categories: ["jazz"],
    intervals: [0, 1, 3, 5, 6, 8, 10],
    tagline: "Diminished tonic context",
  },
  {
    id: "mixolydian-b6",
    label: "Mixolydian ♭6",
    tier: 2,
    categories: ["gospel"],
    intervals: [0, 2, 4, 5, 7, 8, 10],
    tagline: "Gospel color tone",
  },
  // Tier 3 — Jazz
  {
    id: "bebop-dominant",
    label: "Bebop Dominant",
    tier: 3,
    categories: ["jazz"],
    intervals: [0, 2, 4, 5, 7, 9, 10, 11],
    tagline: "8-note dominant bebop",
  },
  {
    id: "bebop-major",
    label: "Bebop Major",
    tier: 3,
    categories: ["jazz"],
    intervals: [0, 2, 4, 5, 7, 8, 9, 11],
    tagline: "8-note major bebop",
  },
  {
    id: "altered",
    label: "Altered (Super Locrian)",
    tier: 3,
    categories: ["jazz"],
    intervals: [0, 1, 3, 4, 6, 8, 10],
    tagline: "V7alt tension",
  },
  {
    id: "whole-tone",
    label: "Whole Tone",
    tier: 3,
    categories: ["jazz"],
    intervals: [0, 2, 4, 6, 8, 10],
    tagline: "Augmented symmetry",
  },
  {
    id: "diminished-hw",
    label: "Diminished (H–W)",
    tier: 3,
    categories: ["jazz"],
    intervals: [0, 1, 3, 4, 6, 7, 9, 10],
    tagline: "Half-whole over 7♭9",
  },
  {
    id: "diminished-wh",
    label: "Diminished (W–H)",
    tier: 3,
    categories: ["jazz"],
    intervals: [0, 2, 3, 5, 6, 8, 9, 11],
    tagline: "Whole-half over dim7",
  },
  {
    id: "lydian-dominant",
    label: "Lydian Dominant",
    tier: 3,
    categories: ["jazz"],
    intervals: [0, 2, 4, 6, 7, 9, 10],
    tagline: "♯4 ♭7 — tritone sub",
  },
  {
    id: "chromatic",
    label: "Chromatic",
    tier: 3,
    categories: ["classical", "jazz"],
    intervals: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
    tagline: "All twelve pitch classes",
  },
  {
    id: "double-harmonic",
    label: "Double Harmonic",
    tier: 3,
    categories: ["classical"],
    intervals: [0, 1, 4, 5, 7, 8, 11],
    tagline: "Byzantine / Arabic maqam",
  },
  // Tier 4 — Gospel & Popular
  {
    id: "major-pentatonic",
    label: "Major Pentatonic",
    tier: 4,
    categories: ["gospel"],
    intervals: [0, 2, 4, 7, 9],
    tagline: "Gospel melody runs",
  },
  {
    id: "minor-pentatonic",
    label: "Minor Pentatonic",
    tier: 4,
    categories: ["gospel", "jazz"],
    intervals: [0, 3, 5, 7, 10],
    tagline: "Blues & gospel bends",
  },
  {
    id: "blues-six",
    label: "Blues (hexatonic)",
    tier: 4,
    categories: ["gospel", "jazz"],
    intervals: [0, 3, 5, 6, 7, 10],
    tagline: "♭3 ♭5 ♭7 pocket",
  },
  {
    id: "neapolitan-minor",
    label: "Neapolitan Minor",
    tier: 4,
    categories: ["classical"],
    intervals: [0, 1, 3, 5, 7, 8, 11],
    tagline: "Phrygian with major 7th",
  },
];

export const ROOT_OPTIONS = [
  "C",
  "Db",
  "D",
  "Eb",
  "E",
  "F",
  "Gb",
  "G",
  "Ab",
  "A",
  "Bb",
  "B",
] as const;

export type RootOption = (typeof ROOT_OPTIONS)[number];

export const getScaleEntry = (
  id: ScaleLibraryId,
): ScaleLibraryEntry | undefined => {
  return SCALE_LIBRARY.find((s) => s.id === id);
};

export const getScalesByCategory = (
  category: ScaleCategory | "all",
): ScaleLibraryEntry[] => {
  if (category === "all") {
    return SCALE_LIBRARY;
  }
  return SCALE_LIBRARY.filter((s) => s.categories.includes(category));
};

export const getScalesByTier = (tier: ScaleTier | "all"): ScaleLibraryEntry[] => {
  if (tier === "all") {
    return SCALE_LIBRARY;
  }
  return SCALE_LIBRARY.filter((s) => s.tier === tier);
};

export const searchScales = (query: string): ScaleLibraryEntry[] => {
  const q = query.trim().toLowerCase();
  if (!q) {
    return SCALE_LIBRARY;
  }
  return SCALE_LIBRARY.filter(
    (s) =>
      s.label.toLowerCase().includes(q) ||
      s.id.includes(q) ||
      s.tagline.toLowerCase().includes(q),
  );
};
