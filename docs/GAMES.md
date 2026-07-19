# Game Specifications

All games share: 3 lives, adaptive difficulty (levels 1–10), post-answer teaching moment, XP reward.

---

## Ear Training — Intervals

### Intervalis
**Slug:** `intervalis`  
**Skill:** Harmonic interval identification  
**Mechanic:** Two notes played simultaneously. User selects interval name (e.g. "Major 3rd").

| Level | Content |
|-------|---------|
| 1–2 | Perfect unison, 4th, 5th, octave |
| 3–4 | Major/minor 2nd, 3rd, 6th, 7th |
| 5–6 | Tritone, compound intervals |
| 7–8 | Augmented/diminished variants |
| 9–10 | Random octave displacement, micro-level speed |

**Teaching moment:** "A major 3rd spans 4 semitones — think 'When the Saints' opening (C–E)."

---

### Departurer
**Slug:** `departurer`  
**Skill:** Ascending melodic interval identification  
**Mechanic:** Two notes played in sequence (low → high). Same answer UI as Intervalis.

Differs from Intervalis only in playback (melodic vs harmonic). Shares interval answer pool.

---

### Lander
**Slug:** `lander`  
**Skill:** Descending melodic interval identification  
**Mechanic:** Two notes played in sequence (high → low).

---

### Calibrator
**Slug:** `calibrator`  
**Skill:** Interval size comparison  
**Mechanic:** Three harmonic intervals played in sequence. User picks the largest.

| Level | Content |
|-------|---------|
| 1–3 | Compare M2 vs m2 vs M3 |
| 4–6 | Include tritone |
| 7–10 | Compound intervals, subtle differences (M6 vs m7) |

---

### Interval Barks
**Slug:** `interval-barks`  
**Skill:** Solfège / interval singing  
**Mechanic:** Interval displayed on staff or as text (e.g. "Perfect 5th above C"). Life-ring plays reference. User sings target note; pitch detection scores.

**Requires:** Microphone permission, pitchy.

---

## Ear Training — Chords

### Chordelius
**Slug:** `chordelius`  
**Skill:** Chord quality identification  
**Mechanic:** 3–4 notes played simultaneously. User selects chord type.

| Level | Content |
|-------|---------|
| 1–2 | Major, minor triads |
| 3–4 | Diminished, augmented |
| 5–6 | Dominant 7, major 7, minor 7 |
| 7–8 | Half-dim, dim7, sus2/sus4 |
| 9–10 | 9ths, altered dominants (jazz) |

---

### Inversionist
**Slug:** `inversionist`  
**Skill:** Chord inversion identification  
**Mechanic:** Chord played. User identifies inversion (root, 1st, 2nd, 3rd for 7ths).

Teaching: "The bass note tells you the inversion — here, the 3rd is in the bass, so it's 1st inversion."

---

## Ear Training — Scales

### Scale Spy
**Slug:** `scale-spy`  
**Skill:** Scale identification  
**Mechanic:** Scale played ascending (and optionally descending). User picks scale type.

| Level | Content |
|-------|---------|
| 1–2 | Major, natural minor |
| 3–4 | Harmonic/melodic minor |
| 5–6 | Church modes (Ionian–Locrian) |
| 7–8 | Jazz scales (bebop, altered, whole tone) |
| 9–10 | Gospel modes, pentatonic variants |

**Companion mode:** Scale Studio (practice lab) — connect MIDI, play along with scale patterns.

---

## Ear Training — Melody

### Melody Hunter
**Slug:** `melody-hunter`  
**Skill:** Melodic dictation (performance)  
**Mechanic:** Short melody (2–8 notes). User replays on on-screen keyboard or MIDI.

Scoring: note accuracy + rhythm tolerance.

---

### Melodix
**Slug:** `melodix`  
**Skill:** Melodic dictation (selection)  
**Mechanic:** Same as Melody Hunter but user picks notes from a grid (easier entry).

Good mobile fallback when no MIDI.

---

### Melody Jay
**Slug:** `melody-jay`  
**Skill:** Melodic echo (voice)  
**Mechanic:** Melody played. User sings it back. Pitch detection scores each note.

---

## Ear Training — Rhythm

### Rhythmic Parrot
**Slug:** `rhythmic-parrot`  
**Skill:** Rhythm imitation  
**Mechanic:** Rhythm played (woodblock or piano). User taps screen / spacebar in time.

Scoring: onset timing deviation (ms). Visual metronome optional at low levels.

---

### Rhythmania
**Slug:** `rhythmania`  
**Skill:** Rhythm dictation  
**Mechanic:** Notated rhythm shown. User taps the rhythm (inverse of Parrot).

Uses VexFlow for rhythm-only notation.

---

## Ear Training — Harmony

### Route VI
**Slug:** `route-vi`  
**Skill:** Chord progression identification  
**Mechanic:** 4-bar progression played. User selects Roman numeral sequence.

| Level | Content |
|-------|---------|
| 1–3 | I–IV–V–I, I–V–vi–IV |
| 4–6 | ii–V–I (jazz) |
| 7–8 | Turnarounds, tritone subs |
| 9–10 | Gospel: I–vi–ii–V with passing chords |

**Life-ring:** Replay bass notes only (easier root motion hearing).

---

## Sight Reading

### Notationist
**Slug:** `notationist`  
**Skill:** Treble clef note identification  
**Mechanic:** Note on staff. User selects pitch name. Timed rounds for speed.

---

### Bassonist
**Slug:** `bassonist`  
**Skill:** Bass clef note identification  
**Mechanic:** Same as Notationist, bass clef.

---

### Solfègiator
**Slug:** `solfeigator`  
**Skill:** Sight-singing  
**Mechanic:** Short melody on staff. User sings. Pitch detection per note.

Movable-do or fixed-do (user setting).

---

## Game Catalog Summary

| # | Name | Category | Input | Phase |
|---|------|----------|-------|-------|
| 1 | Intervalis | Intervals | Tap | 1 |
| 2 | Departurer | Intervals | Tap | 1 |
| 3 | Lander | Intervals | Tap | 1 |
| 4 | Chordelius | Chords | Tap | 1 |
| 5 | Scale Spy | Scales | Tap | 1 |
| 6 | Rhythmic Parrot | Rhythm | Tap | 2 |
| 7 | Rhythmania | Rhythm | Tap | 2 |
| 8 | Melody Hunter | Melody | Keyboard/MIDI | 2 |
| 9 | Melodix | Melody | Tap | 2 |
| 10 | Route VI | Progressions | Tap | 4 |
| 11 | Inversionist | Chords | Tap | 4 |
| 12 | Calibrator | Intervals | Tap | 4 |
| 13 | Notationist | Reading | Tap | 3 |
| 14 | Bassonist | Reading | Tap | 3 |
| 15 | Melody Jay | Melody | Voice | 3 |
| 16 | Solfègiator | Reading | Voice | 3 |
| 17 | Interval Barks | Intervals | Voice | 3 |

**Plus:** Scale Studio (MIDI practice lab) — Phase 1.
