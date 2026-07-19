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
- `src/game-engine/` — GameRuntime, InputBus, SceneLoader
- `src/games/[slug]/` — PixiJS scene + `mechanics.ts` per game (NOT quiz components)
- `src/lib/midi/` — MidiTransport + MidiRouter (see docs/MIDI.md)
- `src/components/coach/` — React overlay only

## Key Docs
- `docs/GAME-DESIGN-VISION.md` — **primary game spec** (real mechanics)
- `docs/MIDI.md` — cross-platform MIDI including Safari
- `docs/PLAN.md` — roadmap
- `docs/BACKLOG.md` — monetization, accounts, multiplayer (deferred)

## Do NOT
- Build multiple-choice quiz flows as game UI
- Use Web Audio oscillators as primary instrument sound
- Call navigator.requestMIDIAccess from game code — use MidiRouter
- Use React useState for per-frame animation — use Pixi useTick
