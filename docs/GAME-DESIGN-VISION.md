# Game Design Vision

> **This document is the creative contract.** Music School is not a quiz app with game cosmetics. Each title is a distinct interactive experience with its own mechanics, visuals, and feel — unified by shared audio/MIDI/progression systems.

---

## Design Principles

| Principle | Anti-pattern | Our approach |
|-----------|--------------|--------------|
| **Play, don't pick** | Multiple-choice buttons | Drag, tap timing, perform on keyboard/voice, route paths, stack blocks |
| **See the music** | Text-only prompts | PixiJS scenes: moving characters, particle resonance, bouncing notation |
| **Fail forward** | Red X, next question | In-world consequences (miss the landing, train derails) + 5-second coach overlay |
| **One mechanic per game** | Shared quiz shell | Each game owns its canvas scene; shared only: audio, MIDI, XP, coach |
| **Gospel is native** | "DLC flavor pack" | Church groove, shout cadences, II–V with passing chords woven into Route VI, Scale Spy, Chordelius from Phase 1 |

**Reference quality bar:** Ivory Quest (action + notation), Note Bounce (rhythm + staff), Chord Crush (puzzle + real songs), Rhythm Heaven (timing spectacle).

---

## Technology for Games

| Layer | Choice | Why |
|-------|--------|-----|
| **2D engine** | **PixiJS v8** + **@pixi/react** | 60fps mobile WebGL, Canvas fallback, dynamic import (no SSR) |
| **Physics** | **Matter.js** (where needed) | Lander parachute, Rhythmic Parrot fruit arcs, Calibrator balance |
| **Animation** | **GSAP** + Pixi `useTick` | UI tweens + imperative sprite motion (avoid React re-render per frame) |
| **Audio timing** | **Tone.js Transport** + **smplr** instruments | Sample realism + tight rhythm scheduling |
| **Notation in scenes** | **VexFlow → RenderTexture** | Bake staff snippets as Pixi sprites inside game worlds |
| **Input** | Unified **InputBus** | Touch, keyboard, MIDI note events, mic pitch — same event shape |

### Game Scene Architecture

```
GameScene (PixiJS Application, dynamic-imported)
├── WorldLayer      — backgrounds, parallax
├── PlayLayer       — interactive mechanics (sprites, physics bodies)
├── NotationLayer   — staff textures, bouncing notes
├── FeedbackLayer   — particles, screen shake, combo text
└── CoachOverlay    — React portal: 5s teaching moment after round

GameRuntime (framework-agnostic TS)
├── session state, scoring, adaptive level
├── emits: NOTE_ON, TAP, DRAG_END, VOICE_PITCH
└── consumes: AudioService, MidiTransport, MasteryTracker
```

**No shared "question card" component.** The home hub is React; each game is a self-contained scene.

---

## The 17 Games — Real Mechanics

### Intervalis — *Resonance Bridge*
**Genre:** Puzzle / tactile  
**Scene:** Two crystal pillars in a canyon pulse and hum when two notes sound harmonically.

**Play:** Player **draws a light-bridge** between the pillars by dragging. Bridge length must match the interval (visual ruler shows semitone slots). Release to lock. Correct = bridge solidifies, character crosses; wrong = bridge shatters.

**Levels:** Start with P5/P4 (forgiving snap). Add minor/major 2nds and 3rds. Late game: compound intervals require multi-segment bridges.

**Teach:** Coach shows semitone count + reference song after each crossing.

---

### Departurer — *Rocket Reach*
**Genre:** Arcade / aim  
**Scene:** Side-view rocket on launch pad. First note = ignition tone.

**Play:** Second note appears as a **target altitude marker**. Player **slides a fuel gauge** (continuous, not MC) mapped to interval distance. Launch — rocket flies in an arc; must stop within the target band.

**MIDI:** Connect keyboard — play the two notes yourself; rocket trajectory follows your interval.

---

### Lander — *Soft Landing*
**Genre:** Arcade / reverse Departurer  
**Scene:** Capsule descends from high note to low note.

**Play:** Player controls **parachute vents** (left/right taps) to bleed altitude in discrete interval steps. Land on the pad matching the heard descending interval. Matter.js gravity.

---

### Calibrator — *Balance Court*
**Genre:** Comparison puzzle  
**Scene:** Three golden scales; each plays a harmonic interval when touched.

**Play:** Intervals play in sequence. Player **tips the largest scale** by dragging a weight token onto it. Wrong = scales crash comically.

---

### Interval Barks — *Moon Howl*
**Genre:** Voice arcade  
**Scene:** Wolf on hill, moon shows interval label (e.g. P5 above Do).

**Play:** Life-ring plays root drone. Player **howls/sings** — pitch line rises in real time; wolf jumps to moon height. Clarity meter from pitchy. Not a button in sight.

**Solfège:** Movable-do labels on moon (see CURRICULUM.md).

---

### Chordelius — *Harmony Forge*
**Genre:** Crafting / stacking  
**Scene:** Blacksmith forge. Chord rings like a bell — glowing embers float with note names.

**Play:** Player **drags embers into the forge crucible** (3–4 slots). Only correct chord tones forge a sword; wrong ore explodes. Jazz/gospel chords unlock different blade styles (visual reward).

**Not:** "Which chord is this?" buttons.

---

### Inversionist — *Tower of Voices*
**Genre:** Spatial reorder  
**Scene:** Vertical tower of singing faces (each face = chord tone).

**Play:** Chord plays. Player **drag-reorders the faces** bottom-to-top to match the inversion (bass face must match heard bass). Tower animates when correct.

---

### Scale Spy — *Trail Tracker*
**Genre:** Exploration / performance  
**Scene:** Top-down forest map. Footprints glow in sequence as scale plays.

**Play:** Player **walks the path** by playing each scale degree on MIDI/on-screen keyboard in order. Wrong note = wrong fork, squirrel shakes head. Identify scale *by playing it*, then name it via **compass dial** (rotate to mode name).

**Gospel:** Mixolydian and pentatonic trails in "Chapel Grove" zone from Phase 1.

---

### Melody Hunter — *Echo Path*
**Genre:** Platform performance  
**Scene:** Side-scroller character at fork in path.

**Play:** Melody plays once. Player **performs melody on keyboard** to open the correct gate (note-by-note gate lights). Miss a note = gate stays shut, try again from last correct note.

---

### Melodix — *Gem Lattice*
**Genre:** Simon / spatial memory  
**Scene:** Crystal lattice (grid of gems).

**Play:** Melody lights gems in sequence. Player **taps gems in order** (touch) or **plays MIDI notes** mapped to grid positions. Lattice grows with level.

---

### Melody Jay — *Sky Singer*
**Genre:** Voice lane runner  
**Scene:** Bird glides through sky lanes (horizontal pitch zones).

**Play:** Melody plays. Then bird flies — player **sings** to move bird vertically through pitch gates (Flappy-style but pitch-driven). Gems collect on perfect intonation.

---

### Rhythmic Parrot — *Tropical Tap*
**Genre:** Rhythm Heaven-style  
**Scene:** Parrot on branch, fruit flies along arc toward beak.

**Play:** **Tap when fruit reaches beak** (visual timing window, not notation first). Combo = parrot dance. MIDI pad can trigger tap. Spacebar on desktop.

**Engine:** Tone.js Transport + lookahead scheduler; ±ms grading.

---

### Rhythmania — *Note Bounce*
**Genre:** Rhythm dictation / Note Bounce-inspired  
**Scene:** Staff scrolls horizontally; note heads bounce toward a strike line.

**Play:** **Tap at strike line** when note head crosses (rhythm dictation). Notation visible; timing is the skill.

---

### Route VI — *Conductor Express*
**Genre:** Path routing puzzle  
**Scene:** Train on circular track; stations labeled ♪I, ♪ii, ♪V, etc.

**Play:** Progression plays (loop). Player **throws track switches** before train arrives at each junction. Wrong switch = train comedy derail (no lives lost — retry loop). **Life-ring:** switches show bass roots only.

**Gospel from Phase 1:** Chapel Line route — I–vi–IV–V with passing diminished, backdoor ♭VII.

---

### Notationist — *Spell Staff*
**Genre:** Ivory Quest-style action  
**Scene:** Mage on rampart; enemies advance with note runes on shields.

**Play:** Rune appears on staff. Player **presses key / MIDI note / letter button** before enemy reaches wall. Speed rounds. Streak = spell combo VFX.

---

### Bassonist — *Deep Reader*
**Genre:** Notationist variant, bass clef  
**Scene:** Submarine depth gauge; bass clef notes as depth markers.

**Play:** Same action loop as Notationist; theme reskin teaches bass clef landmarks.

---

### Solfègiator — *Choir Loft*
**Genre:** Sight-sing performance  
**Scene:** Empty choir loft; ghost singers hold solfège syllables on a floating staff.

**Play:** Staff scrolls. Player **sings each syllable**; pitch line paints over ghosts. Ghosts solidify when within tolerance. Movable-do.

---

## Scale Studio — *The Practice Yard* (Not a quiz)

**Scene:** Open 3D-ish piano yard (Pixi perspective), circle-of-fifths wheel.

**Play:** Choose scale (classical, jazz, gospel tags). **Play along** with backing groove (gospel organ pad optional). Real-time note highlighting on keyboard. Streak for clean runs. **No questions** — pure practice with metronome and groove.

---

## Progression Without Quizzes

| System | How it works |
|--------|--------------|
| **World map** | React hub → unlock biomes (Interval Canyon, Gospel Chapel, Jazz Junction) |
| **Coach** | 5s overlay after failed round — theory tip, not blocking |
| **Adaptive** | GameRuntime adjusts speed, tolerance, content tier — invisible to player |
| **Boss rounds** | Multi-mechanic mashups (e.g. Route VI + Intervalis bridge) |
| **No placement test** | Start in Interval Canyon; difficulty adapts from first session |

---

## Visual Identity

- **Art direction:** Flat illustrated + subtle parallax (not generic UI cards)
- **Palette:** Deep navy sky, warm gold accents, coral hit-flash, gospel chapel purples
- **Typography:** Fraunces display + DM Sans; music glyphs as world icons
- **Juice:** Screen shake, particle bursts on combo, sample-based stingers (real orchestral hits from Sonatina)

---

## Phase 1 Build Order (Revised)

1. **GameRuntime + PixiJS shell** (dynamic import, InputBus, Coach overlay)
2. **AudioService** (smplr piano) + **MidiTransport** (see MIDI.md)
3. **Rhythmic Parrot** — proves timing engine + touch (no theory MC)
4. **Intervalis** — proves Pixi drag mechanic + harmonic audio
5. **Scale Studio** — proves MIDI performance loop
6. **Route VI (Gospel Chapel line)** — proves progression routing + gospel content

---

*Games teach through doing. The theory library powers the games; the games never expose the theory library as a worksheet.*
