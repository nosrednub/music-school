---
name: game-design
description: Game mechanics, PixiJS scenes, and UX for Music School. Use when implementing any game. NEVER default to multiple-choice quiz flows.
---

# Game Design Skill

## Non-Negotiable

**Music School games are NOT quizzes.** No "pick the right answer" as primary interaction.

Before implementing any game:
1. Read `docs/GAME-DESIGN-VISION.md` for that game's mechanic
2. Implement a **PixiJS scene** with unique gameplay
3. Put scoring/adaptive logic in pure `mechanics.ts` (Vitest tested)
4. MC buttons are forbidden except as rare settings/debug

## Architecture

```
play/[slug]/page.tsx  →  SceneLoader (dynamic import, ssr: false)
                        →  GameScene (@pixi/react)
                        →  mechanics.ts (pure TS)
                        →  GameRuntime (scoring, coach trigger)
                        →  CoachOverlay (React portal, 5s max)
```

## Input (via InputBus)

| Game type | Input |
|-----------|-------|
| Rhythm | Tap timing (touch/space/MIDI pad) |
| Intervalis | Drag bridge between pillars |
| Route VI | Throw track switches before train arrives |
| Melody | Perform notes on MIDI/virtual keyboard |
| Voice | pitchy → pitch lanes |
| Notationist | Key/MIDI before enemy reaches wall |

All MIDI goes through `MidiRouter` — games never call Web MIDI directly.

## Juice Checklist

- [ ] Particle burst on success
- [ ] Screen shake on fail (subtle on mobile)
- [ ] Combo counter with real sample stinger
- [ ] `navigator.vibrate(50)` on perfect hit (if available)
- [ ] 60fps — use `useTick`, not React state per frame

## Adaptive (Invisible)

GameRuntime adjusts:
- Timing tolerance (±ms for rhythm)
- Content tier (gospel/jazz mix in Route VI, Scale Spy)
- Speed (enemy walk rate in Notationist)

Never show "Level 3" mid-game unless player opens profile.

## Gospel Content (Phase 1+)

- Route VI: Chapel Line — I–vi–IV–V, passing dim, backdoor
- Scale Spy: Mixolydian + pentatonic trails in Chapel Grove
- Scale Studio: organ pad groove option
- Chordelius: gospel chord forge visual (purple/gold embers)

## Coach Overlay

After failed round only:
- One sentence theory tip
- Optional "replay sound" button
- Auto-dismiss 5s or tap continue
- Never blocks next attempt

## Latency Tiers

Consult `GAME_LATENCY_TIER` in `src/game-engine/inputLatency.ts` and [LATENCY.md](../../docs/LATENCY.md).

- **Tier A (real-time):** native capture listeners, no React on hot path, pre-warm audio/Pixi on Start
- **Tier B (scheduled):** musical clock, input window before event
- **Tier C (turn-based):** standard React UX OK

Rhythmic Parrot / Rhythmania / voice games / action Notationist = Tier A.

--- Games

Ivory Quest (action notation), Note Bounce (rhythm staff), Chord Crush (puzzle), Rhythm Heaven (timing).

## Phase 1 Build Order

1. Rhythmic Parrot — timing + Tone.Transport
2. Intervalis — drag mechanic
3. Scale Studio — MIDI performance
4. Route VI — gospel routing
5. Notationist — action + VexFlow texture
