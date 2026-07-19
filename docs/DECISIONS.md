# Architecture Decision Records

## ADR-001: Mobile-First Web App (Not Native)

**Status:** Accepted  
**Date:** 2026-07-19

**Context:** Games must run in mobile browsers. MIDI keyboard support desired.

**Decision:** Progressive Web App with Next.js, not React Native or native apps.

**Rationale:**
- Single codebase for mobile + desktop
- Web MIDI works on Android Chrome without app store
- PWA installable on home screen
- Faster iteration for 17 games

**Consequences:**
- iOS has no Web MIDI — must provide on-screen keyboard fallback
- Audio latency slightly higher than native (acceptable for theory games)

---

## ADR-002: Sample-Based Audio (Not Synthesis)

**Status:** Accepted  
**Date:** 2026-07-19

**Context:** User explicitly rejected "fake synth" sounds.

**Decision:** Use real recorded samples via smplr (Phase 0) and self-hosted SFZ (Phase 2+).

**Rationale:** Only path to realistic piano/strings/guitar in browser without massive WASM modeling.

**Consequences:**
- Larger download sizes; need progressive loading
- Licensing tracking required

---

## ADR-003: Pure TypeScript Theory Library

**Status:** Accepted  
**Date:** 2026-07-19

**Context:** Music theory logic must be testable and reusable across games.

**Decision:** `src/lib/theory/` has zero React/browser dependencies.

**Rationale:** 95%+ test coverage achievable; games stay thin.

---

## ADR-004: Game Registry Pattern

**Status:** Accepted  
**Date:** 2026-07-19

**Context:** 17 games with shared shell but unique logic.

**Decision:** Each game implements `GameDefinition` interface; registered in central catalog.

**Rationale:** Consistent UX, isolated testing, easy to add games.

---

## ADR-005: pitchy for Voice Detection

**Status:** Accepted  
**Date:** 2026-07-19

**Context:** Melody Jay, Solfègiator, Interval Barks need monophonic pitch detection.

**Decision:** Use `pitchy` (MIT, pure JS).

**Alternatives rejected:**
- aubiojs — underlying aubio is GPL
- ML models — overkill for monophonic, larger bundle

**Consequences:**
- Noisy environments may reduce accuracy — design generous tolerance at low levels

---

## ADR-006: Local-First Progress (IndexedDB)

**Status:** Accepted  
**Date:** 2026-07-19

**Context:** Offline play, no account requirement initially.

**Decision:** Dexie.js on IndexedDB for mastery, settings, sample cache metadata.

**Consequences:**
- Cloud sync deferred until user accounts are needed

---

## ADR-007: Vitest + Playwright Testing

**Status:** Accepted  
**Date:** 2026-07-19

**Context:** Need fast feedback; theory must be bulletproof.

**Decision:**
- Vitest for unit/integration (theory, game logic, adaptive engine)
- Playwright for E2E smoke tests
- Husky pre-commit runs lint + unit tests on staged files

---

## ADR-009: PixiJS Game Engine (Not Quiz UI)

**Status:** Accepted  
**Date:** 2026-07-19

**Context:** Ideator rejected multiple-choice quiz flows. Games must be visual and engaging.

**Decision:** Each game is a **PixiJS v8 scene** (@pixi/react, dynamic import). React handles hub + coach overlay only.

**Rationale:** 60fps mobile gameplay, distinct mechanics per title, proven pattern (Ivory Quest, Note Bounce).

**Consequences:** Larger bundle per game (code split); no SSR on game routes; team must learn Pixi useTick patterns.

---

## ADR-010: Unified MidiTransport + MIDI Link for Safari

**Status:** Accepted  
**Date:** 2026-07-19

**Context:** MIDI required on Mac Safari, mobile Safari, Chrome, Android. Safari has no Web MIDI API.

**Decision:**
- `MidiTransport` abstraction with Web MIDI, BLE, beacio (iOS), and **Music School MIDI Link** (Mac Safari USB)
- Open-source Tauri menubar app in `packages/midi-link/`

**Rationale:** Professional cross-platform solution; no deprecated NPAPI plugins.

---

## ADR-011: Gospel Content from Phase 1

**Status:** Accepted  
**Date:** 2026-07-19

**Decision:** Gospel progressions, scales, and grooves in Phase 1 (Chapel Grove biome, Route VI Chapel Line).

---

## ADR-012: Movable-Do Solfège (Confirmed)

**Status:** Accepted  
**Date:** 2026-07-19

**Decision:** Movable-do default for Solfègiator, Interval Barks, vocal games. Best pedagogy for relative pitch + gospel line singing.

---

## ADR-013: Latency Tiers for Game Input

**Status:** Accepted  
**Date:** 2026-07-19

**Context:** Real-time games (rhythm, MIDI performance, voice) need minimal input latency; turn-based games (Intervalis, Chordelius) do not.

**Decision:** Three tiers in [LATENCY.md](./LATENCY.md). Tier A uses capture-phase input (`inputLatency.ts`), ref-based grading, deferred React updates.

---

## ADR-008: Movable-Do Default Solfège

**Status:** Superseded by ADR-012
