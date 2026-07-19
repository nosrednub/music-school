# Music School — Master Plan

> **Vision:** A mobile-first **game studio for music theory** — not a quiz app. Classical, jazz, and **gospel from day one**. Real samples, real MIDI everywhere we can engineer it, real teaching through play.

---

## North Star (Revised)

| Principle | What it means |
|-----------|---------------|
| **Play, don't pick** | Drag bridges, route trains, tap rhythms, perform on keys — never default to multiple choice |
| **See the music** | PixiJS game worlds with notation baked into scenes — not text cards |
| **Teach in the flow** | 5-second coach overlay after failure; no blocking lectures |
| **Sound real** | smplr + self-hosted SFZ (Salamander, Sonatina) — never bare synth oscillators |
| **MIDI everywhere** | Unified MidiTransport: Web MIDI, BLE, beacio (iOS Safari), MIDI Link (Mac Safari USB) |
| **Gospel is core** | Chapel Grove biome, gospel progressions, organ pads — Phase 1, not Phase 4 |
| **Adapt invisibly** | GameRuntime adjusts tolerance and content — player feels skill growth, not tests |
| **Low latency (Tier A)** | Real-time games: capture input at native event, grade on refs, defer React updates — see [LATENCY.md](./LATENCY.md) |

---

## What We Are NOT Building

- ❌ Multiple-choice quiz flows with game icons
- ❌ Duolingo-style "pick the right answer" as primary interaction
- ❌ Placement tests that feel like exams
- ❌ Oscillator-based piano sounds
- ❌ "Safari doesn't support MIDI" as an excuse — we ship bridges

**Quality bar:** Ivory Quest, Note Bounce, Chord Crush, Rhythm Heaven — each of our games has a distinct mechanic (see [GAME-DESIGN-VISION.md](./GAME-DESIGN-VISION.md)).

---

## Tech Stack (Revised)

| Layer | Choice | Rationale |
|-------|--------|-----------|
| App shell | **Next.js 15** (App Router) | Hub, PWA, routing; games dynamic-imported (no SSR on canvas) |
| Language | **TypeScript** strict | Theory + game logic typed end-to-end |
| Hub UI | **Tailwind** + **shadcn/ui** | World map, settings, connect MIDI |
| **Game engine** | **PixiJS v8** + **@pixi/react** | 60fps mobile WebGL, Canvas fallback |
| Physics | **Matter.js** | Lander, Calibrator, fruit arcs in Rhythmic Parrot |
| Animation | **GSAP** + Pixi `useTick` | Imperative motion; React for structure only |
| Audio samples | **smplr** → self-hosted SFZ | Realistic piano/strings (see AUDIO.md) |
| Audio timing | **Tone.js Transport** | Rhythm games, groove backing |
| MIDI | **MidiTransport** abstraction | Web MIDI, BLE, beacio, MIDI Link — see MIDI.md |
| Voice | **pitchy** | Melody Jay, Solfègiator, Interval Barks |
| Notation in games | **VexFlow → RenderTexture** | Staff sprites inside Pixi scenes |
| State | **Zustand** + **Dexie** (IndexedDB) | Anonymous local progress |
| Adaptive | **GameRuntime** + **MasteryTracker** | Per-game difficulty, invisible |
| Testing | **Vitest** + **Playwright** | Theory 95%+ coverage; E2E per game scene |
| Mac Safari MIDI | **Music School MIDI Link** (Tauri) | Open-source menubar CoreMIDI → WebSocket |

---

## Architecture Overview

```
┌──────────────────────────────────────────────────────────────────┐
│  Next.js Hub (React) — world map, settings, MIDI connect UI       │
└────────────────────────────┬─────────────────────────────────────┘
                             │ dynamic import
┌────────────────────────────▼─────────────────────────────────────┐
│  GameScene (PixiJS) × 17 — unique mechanics per game              │
│  WorldLayer │ PlayLayer │ NotationLayer │ FeedbackLayer           │
└────────────────────────────┬─────────────────────────────────────┘
                             │
┌────────────────────────────▼─────────────────────────────────────┐
│  GameRuntime — scoring, adaptive level, InputBus, Coach triggers    │
└────────────────────────────┬─────────────────────────────────────┘
                             │
┌────────────────────────────▼─────────────────────────────────────┐
│  Services: AudioService │ MidiRouter │ PitchService │ GrooveEngine │
│  Theory Library (pure TS) │ MasteryTracker │ Dexie persistence     │
└──────────────────────────────────────────────────────────────────┘
```

Full module boundaries: [ARCHITECTURE.md](./ARCHITECTURE.md).

---

## MIDI — Cross-Platform (Summary)

Safari does not ship Web MIDI. We solve it:

| Target | Solution |
|--------|----------|
| Mac Chrome / Android Chrome | Native Web MIDI |
| Mac Safari USB | **MIDI Link** companion (open source) |
| iOS Safari BLE | **@beacio/core** + Bluetooth MIDI keyboard |
| All | Virtual on-screen piano (same event shape) |

Details: [MIDI.md](./MIDI.md).

---

## Content Pillars (All Active Phase 1)

| Pillar | Classical | Jazz | Gospel (now) |
|--------|-----------|------|--------------|
| Scales | Major, minor modes | Bebop, altered | Mixolydian, pentatonic, blues |
| Harmony | I–IV–V | ii–V–I, tritone sub | I–vi–IV–V + passing dim, backdoor |
| Groove | Straight metronome | Swing ride | Shuffle, organ pad backing |
| Solfège | Movable-do default | Same | Same — sings the church line |

---

## Phased Roadmap (Revised)

### Phase 0 — Foundation ← **We are here**

- [x] Planning docs, skills, test hooks, theory library stub
- [ ] **GameRuntime** + PixiJS dynamic-import shell
- [ ] **AudioService** (smplr piano) + **Tone.js Transport**
- [ ] **MidiTransport** (Virtual + WebMidi)
- [ ] World map hub (3 biomes: Canyon, Chapel, Junction)

### Phase 1 — Prove the Game Studio (not "5 quizzes")

| # | Game | Proves |
|---|------|--------|
| 1 | **Rhythmic Parrot** | Touch timing, Tone transport, juice VFX |
| 2 | **Intervalis** | Pixi drag mechanic, harmonic audio |
| 3 | **Scale Studio** | MIDI performance loop, scale library |
| 4 | **Route VI** (Gospel Chapel line) | Track routing, gospel progressions |
| 5 | **Notationist** | Action + VexFlow texture, keyboard/MIDI |

Plus: **BleMidiTransport**, **beacio** integration, **MIDI Link** alpha (Mac Safari).

**Exit criteria:** Five distinct game feels; MIDI on Mac Chrome + Android Chrome + Mac Safari (via Link); gospel content playable.

### Phase 2 — Melody & Chord Games

Melody Hunter, Melodix, Chordelius, Departurer, Lander, Scale Spy — each with unique scene from GAME-DESIGN-VISION.md.

### Phase 3 — Voice & Advanced Rhythm

Melody Jay, Solfègiator, Interval Barks, Rhythmania, Bassonist.

### Phase 4 — Deep Harmony

Inversionist, Calibrator, jazz voicing expansions.

### Phase 5 — AI Tutor (Future)

Embedded coach; possible repo graduation. See [BACKLOG.md](./BACKLOG.md).

---

## Adaptive Learning (Invisible)

- No placement test — drop into **Interval Canyon**, difficulty adapts from attempt 1
- **GameRuntime** tracks accuracy, timing variance, streak per skill node
- Promote: smoother animations, tighter tolerance, richer content (gospel/jazz mix)
- Demote: wider timing windows, fewer chord extensions — never punishing copy
- Spaced repetition: "Daily Grove" revisits weak skills inside game scenes (e.g. extra bridge in Intervalis)

---

## Design Direction

- **Hub:** Illustrated world map — biomes, not a list of quizzes
- **Biomes:** Interval Canyon · Gospel Chapel · Jazz Junction · Deep Staff (reading) · Sky Loft (voice)
- **Palette:** Navy `#0F172A`, gold `#F59E0B`, cream `#FEF3C7`, chapel purple `#7C3AED`
- **Fonts:** Fraunces (display) + DM Sans (UI)
- **Juice:** Particles, screen shake, combo counters, real orchestral stingers

---

## Decisions Locked (Ideator, July 2026)

| Topic | Decision |
|-------|----------|
| Monetization | **Backlog** — after working app ([BACKLOG.md](./BACKLOG.md)) |
| Accounts | **Anonymous local now** |
| Gospel | **Now** with classical + jazz |
| Multiplayer | **Backlog** |
| Solfège | **Movable-do** (domain default; fixed-do in settings later) |

---

## Documentation Index

| Doc | Purpose |
|-----|---------|
| [GAME-DESIGN-VISION.md](./GAME-DESIGN-VISION.md) | **Primary creative spec** — real mechanics per game |
| [MIDI.md](./MIDI.md) | Cross-platform MIDI architecture |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Code structure |
| [GAMES.md](./GAMES.md) | Legacy index → points to vision doc |
| [CURRICULUM.md](./CURRICULUM.md) | Theory content (gospel integrated) |
| [AUDIO.md](./AUDIO.md) | Sample libraries |
| [LATENCY.md](./LATENCY.md) | Real-time input budgets (Tier A/B/C games) |
| [DECISIONS.md](./DECISIONS.md) | ADRs |

---

## Next Implementation Steps

1. **GameRuntime** + empty PixiJS scene with tap-to-start audio unlock
2. **Rhythmic Parrot** vertical slice (one playable level)
3. **WebMidiTransport** + on-screen piano
4. **MIDI Link** repo scaffold in `packages/midi-link/`

---

*Last updated: 2026-07-19 — revised after ideator feedback: games not quizzes, gospel now, MIDI everywhere.*
