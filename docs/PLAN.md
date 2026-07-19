# Music School — Master Plan

> **Vision:** A mobile-first, gamified music theory academy that teaches deeply — not drills blindly. Classical and jazz foundations with a gospel twist, graduating toward embedded AI tutoring over time.

---

## North Star

| Principle | What it means |
|-----------|---------------|
| **Teach, don't drill** | Every game explains *why* an answer is correct. Wrong answers trigger micro-lessons, not just red X's. |
| **Feel like a game** | Progression, streaks, lives, worlds, and satisfying audio/visual feedback — not a quiz app skin. |
| **Sound real** | Sample-based instruments (SFZ/SF2), never bare oscillators. Future: browser physical modeling. |
| **Mobile first** | Touch targets ≥ 44px, thumb zones, offline-capable PWA, AudioContext unlock on first tap. |
| **Adapt to the learner** | Placement test → skill tree → spaced repetition + difficulty scaling per concept. |
| **MIDI when possible** | USB/BLE MIDI on Android Chrome; graceful fallbacks everywhere else. |

---

## Repository Identity

- **Current name:** `music-school`
- **Future name:** May graduate (e.g. `harmony-lab`, `theory-quest`) when AI tutoring ships
- **Audience:** Self-directed learners leveling up in theory — ear training, reading, and keyboard fluency

---

## Tech Stack (Recommended)

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Framework | **Next.js 15** (App Router) | SSR/PWA, great DX, easy deploy |
| Language | **TypeScript** | Music theory is inherently typed (Note, Interval, Chord…) |
| Styling | **Tailwind CSS** + **shadcn/ui** | Mobile-first, accessible components |
| Audio engine | **Web Audio API** + **smplr** | Realistic samples, no server required |
| Sample sources | **sfzinstruments**, **Salamander**, **Sonatina Orchestra** | Open, high-quality, community-maintained |
| MIDI input | **Web MIDI API** (+ Web Bluetooth MIDI where needed) | Native browser, no plugin |
| Pitch detection | **pitchy** (monophonic voice games) | Lightweight, real-time, MIT |
| Notation | **VexFlow** (programmatic) + **OSMD** (MusicXML) | Sight-reading games |
| Rhythm | Custom scheduler on **AudioContext.currentTime** | Sub-10ms tap accuracy |
| State | **Zustand** + **IndexedDB** (via Dexie) | Offline progress persistence |
| Adaptive engine | Custom **MasteryTracker** (SM-2 + Bayesian-lite) | Spaced repetition per skill node |
| Testing | **Vitest** (unit) + **Playwright** (E2E) + **Testing Library** | Fast feedback loop |
| Git hooks | **Husky** + **lint-staged** | Pre-commit lint + test on changed files |

---

## Platform Constraints (Critical)

### Web MIDI on Mobile

| Platform | USB MIDI | BLE MIDI | Fallback |
|----------|----------|----------|----------|
| Android Chrome/Edge/Samsung | ✅ | ✅ (Web Bluetooth) | — |
| Android Firefox | ❌ | ❌ | On-screen keyboard |
| iOS Safari / all iOS browsers | ❌ | ❌ | On-screen keyboard + touch input |
| Desktop Chrome/Firefox/Edge | ✅ | ✅ | — |

**Strategy:** Detect capability at runtime. Show a friendly "Connect MIDI" panel on supported browsers. On iOS, promote the responsive on-screen piano and voice/tap games. Never block the app — MIDI is enhancement, not requirement.

### Audio on Mobile

- AudioContext must be resumed after user gesture (tap "Start").
- Preload samples progressively (piano first, orchestra lazy-load).
- Use `AudioWorklet` for low-latency scheduling where supported.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Mobile Browser (PWA)                     │
├─────────────────────────────────────────────────────────────┤
│  UI Layer          │  Game Shells (17 games)                │
│  (React + Tailwind)│  Shared: lives, timer, feedback, XP    │
├────────────────────┼────────────────────────────────────────┤
│  Game Engines      │  ChordEngine │ IntervalEngine │ …       │
├────────────────────┼────────────────────────────────────────┤
│  Core Services     │  AudioService │ MidiService │ Notation  │
│                    │  PitchService │ RhythmEngine            │
├────────────────────┼────────────────────────────────────────┤
│  Theory Library    │  Scales │ Chords │ Progressions │ …    │
│  (pure TS, tested) │  Jazz voicings │ Gospel substitutions   │
├────────────────────┼────────────────────────────────────────┤
│  Adaptive Layer    │  MasteryTracker │ PlacementTest        │
│                    │  SkillTree │ SpacedRepetition            │
├────────────────────┼────────────────────────────────────────┤
│  Persistence       │  IndexedDB (progress, settings, cache) │
└─────────────────────────────────────────────────────────────┘
```

See [ARCHITECTURE.md](./ARCHITECTURE.md) for module boundaries and [GAMES.md](./GAMES.md) for per-game specs.

---

## Phased Roadmap

### Phase 0 — Foundation (Weeks 1–3) ← **We are here**

- [x] Planning docs, Cursor skills, git hooks
- [ ] Next.js scaffold, design tokens, PWA manifest
- [ ] `AudioService` with Salamander piano via smplr
- [ ] `TheoryLibrary`: notes, intervals, scales (major, natural/harmonic/melodic minor, modes)
- [ ] `MasteryTracker` skeleton + placement test (10 questions)
- [ ] Home screen + game launcher shell
- [ ] CI: lint, unit tests, Playwright smoke test

**Exit criteria:** Tap a note on mobile, hear realistic piano. Pass placement test, see personalized skill tree.

### Phase 1 — MVP Games (Weeks 4–8)

Ship 5 games that cover the core pillars (intervals, chords, scales, rhythm, melody):

| Game | Pillar | Why first |
|------|--------|-----------|
| **Intervalis** | Intervals (harmonic) | Foundation for everything else |
| **Departurer** | Intervals (melodic ascending) | Ear training baseline |
| **Lander** | Intervals (melodic descending) | Pairs with Departurer |
| **Chordelius** | Chord quality | Jazz/classical harmony entry |
| **Scale Spy** | Scale identification | Connects to MIDI scale practice |

Plus: **Scale Studio** (MIDI/on-screen keyboard scale practice mode — not a quiz game, a practice lab).

**Exit criteria:** 5 playable games, adaptive difficulty, progress saved offline.

### Phase 2 — Rhythm & Melody (Weeks 9–12)

| Game | Notes |
|------|-------|
| **Rhythmic Parrot** | Tap timing with visual metronome |
| **Rhythmania** | Rhythm dictation (see notation → tap) |
| **Melody Hunter** | Listen → replay on keyboard |
| **Melodix** | Listen → select pitches (multiple choice variant) |

Add: violin/cello samples (Sonatina), guitar (decentsamples).

### Phase 3 — Notation & Voice (Weeks 13–18)

| Game | Notes |
|------|-------|
| **Notationist** | Treble clef speed reading |
| **Bassonist** | Bass clef speed reading |
| **Melody Jay** | Sing back melody (pitchy) |
| **Solfègiator** | Sight-sing from notation |
| **Interval Barks** | Sing displayed interval |

Voice games need microphone permission UX and noise-tolerant scoring.

### Phase 4 — Advanced Harmony (Weeks 19–24)

| Game | Notes |
|------|-------|
| **Route VI** | Chord progressions + life-ring bass hints |
| **Inversionist** | Chord inversions |
| **Calibrator** | Compare interval sizes |

Jazz extensions (7ths, 9ths, altered dominants), gospel substitutions (II–V–I with passing chords, church modes).

### Phase 5 — AI Tutor (Future)

- Embedded AI explains mistakes in natural language
- Generates custom exercises from weak areas
- Conversational "why does this progression work?" mode
- Repo may graduate to a new name at this point

---

## Adaptive Learning Model

### Placement Test (10 min)

1. Interval identification (5 Q)
2. Chord quality (3 Q)
3. Scale identification (2 Q)

→ Maps to starting nodes on the skill tree.

### Per-Skill Mastery (0–100)

```
score = weighted(recent_accuracy, response_time, streak, difficulty_level)
```

- **Promote** when score ≥ 80 over last 10 attempts at current level
- **Demote** when score < 50 over last 5 attempts (gentle, no punishment UX)
- **Spaced repetition:** review due items injected between new content (SM-2 intervals)

### Skill Tree (Top-Level Branches)

```
Ear Training
├── Intervals (harmonic, ascending, descending)
├── Chords (triads → 7ths → extensions)
├── Scales & Modes
├── Melody dictation
└── Rhythm

Reading
├── Treble clef
├── Bass clef
└── Lead sheet symbols

Harmony
├── Diatonic functions (I–IV–V)
├── Jazz II–V–I
└── Gospel reharmonization

Performance
├── MIDI scale fluency
├── Voice accuracy
└── Rhythm tapping
```

See [CURRICULUM.md](./CURRICULUM.md) for theory content mapping.

---

## Design Direction

### Visual Language

- **Palette:** Deep navy `#0F172A`, warm gold `#F59E0B`, cream `#FEF3C7`, accent coral `#F97316`
- **Typography:** Display — "Fraunces" or "Playfair Display"; UI — "DM Sans"
- **Iconography:** Custom music glyphs (clefs, notes, intervals as visual badges)
- **Motion:** Subtle note-bounce on correct answers; screen shake on wrong (mobile-safe)
- **Layout:** Bottom nav (Home, Games, Practice, Profile); game controls in thumb zone

### Gamification (Not Gimmicks)

| Mechanic | Purpose |
|----------|---------|
| **Lives (3)** | Stakes without frustration — regen over time |
| **XP + Levels** | Visible growth |
| **Streaks** | Daily habit |
| **Worlds** | Group games by concept (Interval Island, Chord City…) |
| **Life-rings** | Hints (Route VI bass notes, Interval Barks reference tone) — limited per round |
| **Post-answer teaching** | 1-sentence theory tip on every question |

---

## Audio Strategy

See [AUDIO.md](./AUDIO.md) for full sample inventory and loading strategy.

**Phase 0 instrument:** Salamander Grand Piano (smplr `SplendidGrandPiano` or self-hosted SFZ subset)

**Never:** Web Audio oscillators as primary sound (OK for metronome click only).

---

## Testing Strategy

| Layer | Tool | What |
|-------|------|------|
| Theory lib | Vitest | Interval math, chord spelling, scale degrees — 100% coverage target |
| Game logic | Vitest | Question generation, scoring, adaptive level changes |
| Audio | Vitest + mocks | Scheduling, note mapping (no real audio in CI) |
| Components | Testing Library | Accessibility, tap targets, game UI states |
| E2E | Playwright | Smoke: load app, unlock audio, play one round |
| Git hooks | Husky | Pre-commit: lint + unit tests on staged files |
| CI | GitHub Actions | Full test suite on PR |

---

## Open Questions for You (Ideator)

1. **Monetization:** Free + premium worlds? One-time purchase? Subscription for AI phase?
2. **Accounts:** Anonymous local-first vs. cloud sync from day one?
3. **Gospel twist priority:** Phase 4, or sprinkle gospel progressions earlier as optional "flavor packs"?
4. **Multiplayer:** Any interest in async challenges (leaderboards, friend duels)?
5. **Language:** English-only initially, or solfège in multiple languages (movable-do vs fixed-do)?

---

## Success Metrics

| Metric | Target (Phase 1) |
|--------|------------------|
| Mobile Lighthouse Performance | ≥ 90 |
| Time to first sound | < 2s after tap |
| Game session length | 5–15 min (by design) |
| D7 retention | Track; aim 30%+ |
| Theory lib test coverage | ≥ 95% |

---

## Next Actions (Implementor)

1. **Your review** of this plan + answers to open questions
2. Scaffold Next.js app (Phase 0)
3. Implement `TheoryLibrary` + tests
4. Implement `AudioService` with piano
5. Build game shell + first game (Intervalis)

---

*Last updated: 2026-07-19*
