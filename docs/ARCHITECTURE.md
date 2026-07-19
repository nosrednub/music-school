# Architecture

## Directory Structure (Target)

```
music-school/
├── packages/
│   └── midi-link/              # Tauri menubar app — CoreMIDI → WebSocket (Mac Safari)
├── .cursor/skills/
├── docs/
├── public/
│   ├── samples/                # Self-hosted SFZ subsets
│   ├── atlases/                # Pixi spritesheets
│   └── fonts/                  # Bravura, UI fonts
├── src/
│   ├── app/                    # Next.js hub (world map, routes)
│   │   ├── page.tsx            # World map — NOT a quiz list
│   │   └── play/[slug]/        # Game launcher (dynamic import)
│   ├── components/
│   │   ├── hub/                # Biome map, MIDI connect sheet
│   │   ├── coach/              # React overlay — 5s teaching moments
│   │   └── ui/                 # shadcn
│   ├── game-engine/            # Shared game infrastructure
│   │   ├── GameRuntime.ts      # Session, scoring, adaptive
│   │   ├── InputBus.ts         # Touch, MIDI, voice → events
│   │   ├── SceneLoader.tsx     # dynamic(() => import game scene)
│   │   └── pixi/               # extend(), shared textures, juice
│   ├── games/                  # One Pixi scene per game
│   │   ├── rhythmic-parrot/
│   │   │   ├── scene.tsx       # @pixi/react scene
│   │   │   ├── mechanics.ts    # Pure logic (testable)
│   │   │   └── assets.json
│   │   ├── intervalis/
│   │   └── ...
│   ├── lib/
│   │   ├── theory/             # Pure TS — no Pixi, no React
│   │   ├── audio/              # AudioService, smplr, Tone Transport
│   │   ├── midi/               # MidiTransport implementations + MidiRouter
│   │   ├── pitch/              # pitchy voice pipeline
│   │   ├── groove/             # Gospel/jazz backing patterns
│   │   ├── notation/           # VexFlow → canvas → Pixi texture
│   │   └── adaptive/           # MasteryTracker
│   └── stores/
├── tests/
│   ├── unit/
│   └── e2e/
└── scripts/
```

---

## Layer Separation

| Layer | Technology | Responsibility |
|-------|------------|----------------|
| **Hub** | React + Tailwind | Navigation, settings, MIDI connect UX |
| **Game Scene** | PixiJS + @pixi/react | Visual mechanics, 60fps gameplay |
| **Game Logic** | Pure TypeScript | `mechanics.ts` per game — fully unit tested |
| **Services** | Browser APIs | Audio, MIDI, mic — injected into GameRuntime |
| **Theory** | Pure TS | Content generation — never imported by Pixi directly in hot paths |

**Rule:** React re-renders on state changes (lives, pause). Pixi `useTick` drives frame animation — never `useState` per frame.

---

## GameRuntime

Central orchestrator — games register, don't inherit from a quiz base class.

```typescript
interface GameRuntime {
  readonly slug: string;
  readonly level: number;
  start(): void;
  pause(): void;
  handleInput(event: InputEvent): void;
  onRoundComplete(result: RoundResult): void;
  subscribe(cb: (state: RuntimeState) => void): Unsubscribe;
}
```

`RoundResult` feeds `MasteryTracker`. Coach overlay triggered on `needsCoach: true`.

---

## InputBus

Normalizes all player input:

```typescript
type InputEvent =
  | { type: "tap"; x: number; y: number; timestamp: number }
  | { type: "drag"; phase: "start" | "move" | "end"; ... }
  | { type: "midi"; note: number; velocity: number; on: boolean }
  | { type: "voice"; pitchHz: number; clarity: number };
```

MidiRouter → InputBus. Virtual keyboard → InputBus. Touch → InputBus.

---

## MidiRouter (`src/lib/midi/`)

See [MIDI.md](./MIDI.md). Implementations:

- `WebMidiTransport`
- `BleMidiTransport`
- `BeacioBleTransport`
- `LinkTransport` (WebSocket to `packages/midi-link`)
- `VirtualKeyboardTransport`

```typescript
const router = await MidiRouter.detect();
await router.connect();
router.onNote((e) => inputBus.emit({ type: "midi", ... }));
```

---

## Audio Stack

```
Tone.Transport  ──►  groove backing, metronome, rhythm grading
AudioService    ──►  smplr instruments (note playback)
GrooveEngine    ──►  gospel organ pad, jazz ride patterns (samples)
```

Sample-first always. Metronome click = short noise burst, not sine wave.

---

## Notation in Pixi

1. VexFlow renders to offscreen canvas
2. `PIXI.Texture.from(canvas)` → sprite in NotationLayer
3. Cache textures by note/chord hash
4. Animate sprite position in `useTick` (Note Bounce pattern)

---

## Game Registration

```typescript
// src/games/registry.ts
export const GAME_REGISTRY = {
  "rhythmic-parrot": {
    loadScene: () => import("./rhythmic-parrot/scene"),
    mechanics: () => import("./rhythmic-parrot/mechanics"),
    biomes: ["interval-canyon"],
    requiresMidi: false,
  },
  // ...
};
```

Hub reads registry for world map pins — not hardcoded lists.

---

## PWA & Performance

- Dynamic `import()` for every Pixi scene (code split per game)
- `resolution: Math.min(devicePixelRatio, 2)` on Pixi Application
- Atlas packing for biome sprites
- Service worker: app shell + piano sample subset
- Audio unlocked on first tap anywhere in hub

---

## Testing

| Target | Tool |
|--------|------|
| `mechanics.ts` | Vitest — 95%+ coverage |
| `MidiTransport` parsers | Vitest fixtures |
| `GameRuntime` | Vitest integration |
| Hub navigation | Playwright mobile |
| Game scene smoke | Playwright — load scene, tap start, one interaction |

---

## Key Decisions

| Decision | Choice |
|----------|--------|
| Game rendering | PixiJS v8 (not DOM quiz cards) |
| Game framework | Custom GameRuntime (not Phaser — we need fine control + React hub) |
| Safari MIDI | MIDI Link companion + beacio BLE |
| Gospel content | GrooveEngine + curriculum tags from Phase 1 |

See [DECISIONS.md](./DECISIONS.md).
