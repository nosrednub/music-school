---
name: music-school-dev
description: Core development conventions for the Music School mobile-first PWA. Use when writing any code in this repo.
---

# Music School — Development Skill

## Stack
- Next.js 15 App Router, TypeScript strict, Tailwind CSS, shadcn/ui
- Mobile-first: min touch target 44×44px, thumb-zone controls at bottom
- PWA: manifest, service worker, offline shell

## Code Conventions
- Use `const` arrow functions; prefix handlers with `handle` (e.g. `handleTap`)
- Tailwind only — no CSS files unless absolutely necessary
- Early returns for readability
- Accessibility: aria-labels, keyboard support, focus management
- Match existing patterns in surrounding files before inventing new abstractions

## Module Boundaries
- `src/lib/theory/` — pure TS, NO React, NO browser APIs. Must be unit-tested.
- `src/lib/audio/` — Web Audio, smplr. Mock in tests.
- `src/games/` — one folder per game implementing `GameDefinition`
- `src/components/game/` — shared GameShell (lives, XP, feedback)

## Before Committing
- Run `npm run lint` and `npm run test:unit`
- Husky pre-commit hook enforces this on staged files

## Key Docs
- `docs/PLAN.md` — roadmap and vision
- `docs/ARCHITECTURE.md` — module structure
- `docs/GAMES.md` — per-game specs
- `docs/CURRICULUM.md` — theory content

## Do NOT
- Use Web Audio oscillators as primary instrument sound (metronome click only)
- Put music theory math inside React components
- Block the app when MIDI is unavailable — always provide fallback input
- Create AudioContext before user gesture (mobile will stay suspended)
