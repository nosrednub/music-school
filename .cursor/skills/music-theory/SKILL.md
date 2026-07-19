---
name: music-theory
description: Music theory domain knowledge for Music School. Use when implementing scales, chords, intervals, progressions, or game question generation.
---

# Music Theory Skill

## Focus Areas
Classical foundation → jazz harmony → gospel flavor. Teach deeply, not drill.

## Pitch Representation
```typescript
type NoteName = 'C' | 'C#' | 'D' | 'D#' | 'E' | 'F' | 'F#' | 'G' | 'G#' | 'A' | 'A#' | 'B';
type Pitch = { note: NoteName; octave: number };
// MIDI note = (octave + 1) * 12 + pitchClass
```

Use sharp spellings internally; display enharmonics contextually (e.g. F# in G major, Gb in D♭ major).

## Interval Naming
- Always use quality + number: "Major 3rd", not "4 semitones" in UI
- Harmonic = simultaneous; Melodic = sequential
- Compound intervals: reduce to simple for levels 1–6, show compound at 7+

## Chord Spelling Rules
- Triads: major (4-3), minor (3-4), dim (3-3), aug (4-4)
- 7ths: maj7, dom7, m7, m7♭5, dim7
- Extensions: stack 3rds; omit 5th in jazz voicings when appropriate

## Scale Types (implement all in `scales.ts`)
Tier 1: major, natural minor, harmonic minor, melodic minor  
Tier 2: dorian, phrygian, lydian, mixolydian, locrian  
Tier 3: bebop dominant, altered, whole tone, HW/WH diminished  
Tier 4: major/minor/blues pentatonic

## Progressions (Roman Numerals)
- Classical: I–IV–V–I, I–vi–IV–V
- Jazz: ii–V–I, tritone sub, rhythm changes
- Gospel: I–vi–IV–V with passing chords, backdoor ♭VII

## Teaching Moments
Every wrong/correct answer should include a 1-sentence "why":
- Reference songs for intervals (see docs/CURRICULUM.md)
- Explain chord function in key context
- Connect scale to its mode parent or usage

## Question Generation
- Use seeded RNG for reproducible tests: `random(seed)`
- Avoid enharmonic ambiguity in multiple choice (don't offer both C# and Db)
- Level 1: diatonic only in C major/A minor; expand keys with level

## Solfège Default
Movable-do unless user setting says otherwise. C major → Do = C.
