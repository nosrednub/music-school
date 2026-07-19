# Music School

A **mobile-first, gamified music theory academy** for browser — classical and jazz foundations with a gospel twist. Connect a MIDI keyboard on Android, practice scales, and play 17 ear-training games that actually teach.

## Status: Phase 0 (Planning + Foundation)

Architecture, curriculum, Cursor skills, test hooks, and a minimal Next.js scaffold are in place. Games ship in Phase 1.

## Quick Start

```bash
npm install
npm run dev        # http://localhost:3000
npm run test:unit  # Vitest — theory library
npm run test:e2e   # Playwright — mobile smoke tests
npm run lint
```

Pre-commit hooks (Husky + lint-staged) run ESLint and related unit tests on staged files.

## Documentation

| Doc | Purpose |
|-----|---------|
| [docs/PLAN.md](./docs/PLAN.md) | Master plan, roadmap, open questions |
| [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) | Technical architecture |
| [docs/GAMES.md](./docs/GAMES.md) | All 17 game specifications |
| [docs/CURRICULUM.md](./docs/CURRICULUM.md) | Music theory content |
| [docs/AUDIO.md](./docs/AUDIO.md) | Sample libraries & audio strategy |
| [docs/DECISIONS.md](./docs/DECISIONS.md) | Architecture decision records |

## Cursor Skills

Agent skills in `.cursor/skills/` guide consistent development:

- `music-school-dev` — coding conventions
- `music-theory` — domain knowledge
- `audio-engine` — Web Audio, MIDI, samples
- `game-design` — game mechanics & UX

## Tech Stack

- **Next.js 15** + TypeScript + Tailwind CSS
- **Vitest** (unit) + **Playwright** (E2E, mobile viewport)
- **smplr** (Phase 1) for realistic piano samples
- **Web MIDI API** (Android Chrome; iOS fallback keyboard)

## Games (Planned)

Intervalis · Departurer · Lander · Chordelius · Scale Spy · Rhythmic Parrot · Melody Hunter · Melodix · Route VI · Inversionist · Calibrator · Notationist · Bassonist · Melody Jay · Solfègiator · Interval Barks · Rhythmania

See [docs/GAMES.md](./docs/GAMES.md) for full specs.

## License

TBD
