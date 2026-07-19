export type NoteName =
  | "C"
  | "C#"
  | "D"
  | "D#"
  | "E"
  | "F"
  | "F#"
  | "G"
  | "G#"
  | "A"
  | "A#"
  | "B";

export type Pitch = {
  note: NoteName;
  octave: number;
};

export type IntervalQuality =
  | "perfect"
  | "major"
  | "minor"
  | "augmented"
  | "diminished";

export type Interval = {
  semitones: number;
  quality: IntervalQuality;
  number: number;
  simple: boolean;
};

export type ScaleType =
  | "major"
  | "natural-minor"
  | "harmonic-minor"
  | "melodic-minor"
  | "dorian"
  | "phrygian"
  | "lydian"
  | "mixolydian"
  | "locrian";

export type ChordQuality =
  | "major"
  | "minor"
  | "diminished"
  | "augmented"
  | "dominant7"
  | "major7"
  | "minor7"
  | "half-diminished7"
  | "diminished7";

export type Chord = {
  root: Pitch;
  quality: ChordQuality;
  tones: Pitch[];
};

export type GameCategory =
  | "intervals"
  | "chords"
  | "scales"
  | "melody"
  | "rhythm"
  | "harmony"
  | "reading";

export type GameDefinition = {
  id: string;
  name: string;
  slug: string;
  category: GameCategory;
  description: string;
  skillNodes: string[];
  phase: number;
};
