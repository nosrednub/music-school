import { describe, expect, it } from "vitest";
import {
  formatPitch,
  midiToPitch,
  parseNote,
  pitchToMidi,
  transpose,
} from "@/lib/theory/notes";

describe("notes", () => {
  it("converts pitch to MIDI and back", () => {
    const pitch = parseNote("C4");
    expect(pitchToMidi(pitch)).toBe(60);
    expect(midiToPitch(60)).toEqual({ note: "C", octave: 4 });
  });

  it("transposes by semitones", () => {
    expect(formatPitch(transpose(parseNote("C4"), 4))).toBe("E4");
    expect(formatPitch(transpose(parseNote("C4"), -1))).toBe("B3");
  });

  it("parses sharp notes", () => {
    expect(parseNote("F#5")).toEqual({ note: "F#", octave: 5 });
  });
});
