import type { NoteName, Pitch } from "@/types/music";

const NOTE_NAMES: NoteName[] = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
];

export const pitchToMidi = (pitch: Pitch): number => {
  const index = NOTE_NAMES.indexOf(pitch.note);
  if (index === -1) {
    throw new Error(`Invalid note: ${pitch.note}`);
  }
  return (pitch.octave + 1) * 12 + index;
};

export const midiToPitch = (midi: number): Pitch => {
  const octave = Math.floor(midi / 12) - 1;
  const pitchClass = ((midi % 12) + 12) % 12;
  return { note: NOTE_NAMES[pitchClass], octave };
};

export const transpose = (pitch: Pitch, semitones: number): Pitch => {
  return midiToPitch(pitchToMidi(pitch) + semitones);
};

export const parseNote = (noteString: string): Pitch => {
  const match = noteString.match(/^([A-G]#?)(-?\d+)$/);
  if (!match) {
    throw new Error(`Invalid note string: ${noteString}`);
  }
  const [, note, octaveStr] = match;
  if (!NOTE_NAMES.includes(note as NoteName)) {
    throw new Error(`Invalid note name: ${note}`);
  }
  return { note: note as NoteName, octave: Number(octaveStr) };
};

export const formatPitch = (pitch: Pitch): string => {
  return `${pitch.note}${pitch.octave}`;
};

export { NOTE_NAMES };
