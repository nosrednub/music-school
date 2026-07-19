# Music School

A **mobile-first game studio for music theory** — not a quiz app. Play through PixiJS worlds that teach classical, jazz, and **gospel** harmony. Real samples. MIDI on Mac Safari, mobile Safari, Chrome, and Android.

## Status: Phase 0 → Phase 1 pivot

Planning revised: **games with real mechanics**, cross-platform MIDI architecture, gospel from day one. See [docs/GAME-DESIGN-VISION.md](./docs/GAME-DESIGN-VISION.md).

## Quick Start

```bash
npm install
npm run dev        # http://localhost:3000
npm run test:unit  # Vitest
npm run test:e2e   # Playwright (mobile viewport)
```

## Documentation

| Doc | Purpose |
|-----|---------|
| **[GAME-DESIGN-VISION.md](./docs/GAME-DESIGN-VISION.md)** | Real game mechanics (primary creative spec) |
| **[MIDI.md](./docs/MIDI.md)** | Safari + Chrome + Android MIDI strategy |
| [PLAN.md](./docs/PLAN.md) | Roadmap |
| [ARCHITECTURE.md](./docs/ARCHITECTURE.md) | PixiJS + GameRuntime structure |
| [BACKLOG.md](./docs/BACKLOG.md) | Monetization, accounts, multiplayer (deferred) |
| [CURRICULUM.md](./docs/CURRICULUM.md) | Theory + gospel content |
| [AUDIO.md](./docs/AUDIO.md) | Sample libraries |

## Tech Stack

- **Next.js 15** hub + **PixiJS v8** game scenes
- **Tone.js** rhythm + **smplr** realistic samples
- **MidiTransport** — Web MIDI, BLE, beacio (iOS Safari), MIDI Link (Mac Safari)
- **Vitest** + **Playwright** + Husky pre-commit

## Phase 1 Games (first builds)

1. **Rhythmic Parrot** — Rhythm Heaven-style tap timing
2. **Intervalis** — Draw semitone bridges between resonating pillars
3. **Scale Studio** — MIDI scale practice yard with gospel grooves
4. **Route VI** — Route the train through gospel chord stations
5. **Notationist** — Defend the wall (Ivory Quest-style)

## Cursor Skills

`.cursor/skills/` — dev, music theory, audio/MIDI, game design

## License

TBD
