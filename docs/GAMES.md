# Game Index

> **⚠️ The authoritative game spec is [GAME-DESIGN-VISION.md](./GAME-DESIGN-VISION.md).**  
> This file is a quick index. Each game has unique PixiJS mechanics — not multiple-choice flows.

---

## Games at a Glance

| Game | Slug | Genre | Primary input | Phase |
|------|------|-------|---------------|-------|
| **Intervalis** | `intervalis` | Draw bridge puzzle | Drag semitone bridge | 1 |
| **Departurer** | `departurer` | Rocket arc | Slide fuel / MIDI interval | 2 |
| **Lander** | `lander` | Parachute landing | Tap vents / Matter.js | 2 |
| **Calibrator** | `calibrator` | Balance scales | Drag weight token | 4 |
| **Interval Barks** | `interval-barks` | Moon howl | Voice pitch | 3 |
| **Chordelius** | `chordelius` | Forge crafting | Drag embers to crucible | 2 |
| **Inversionist** | `inversionist` | Tower reorder | Drag face stack | 4 |
| **Scale Spy** | `scale-spy` | Map exploration | Play scale on keyboard | 2 |
| **Melody Hunter** | `melody-hunter` | Platform gates | Perform melody on keyboard | 2 |
| **Melodix** | `melodix` | Gem lattice | Tap / MIDI grid | 2 |
| **Melody Jay** | `melody-jay` | Sky lane runner | Voice pitch | 3 |
| **Rhythmic Parrot** | `rhythmic-parrot` | Rhythm Heaven-style | Tap timing | **1** |
| **Rhythmania** | `note-bounce` | Scrolling bounce | Tap at strike line | 3 |
| **Route VI** | `route-vi` | Train routing | Throw track switches | **1** |
| **Notationist** | `notationist` | Spell action | Key / MIDI before enemy hits | **1** |
| **Bassonist** | `bassonist` | Sub depth action | Same as Notationist, bass clef | 3 |
| **Solfègiator** | `solfeigator` | Choir loft | Sight-sing scrolling staff | 3 |

## Practice Mode

| Mode | Slug | Type |
|------|------|------|
| **Scale Studio** | `scale-studio` | Performance practice yard (not a game) |

---

## Shared Systems (Not Per-Game Quizzes)

- **GameRuntime** — scoring, adaptive difficulty, session state
- **Coach overlay** — 5s theory tip after failed round
- **InputBus** — touch, MIDI, voice → unified events
- **Lives / XP** — light stakes; regen over time

See [GAME-DESIGN-VISION.md](./GAME-DESIGN-VISION.md) for full mechanic descriptions, level curves, and gospel integration.
