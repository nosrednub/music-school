# Architecture

## Directory Structure (Target)

```
music-school/
├── .cursor/skills/          # Agent skills for consistent development
├── .husky/                  # Git hooks
├── docs/                    # Planning & ADRs
├── public/
│   ├── samples/             # Self-hosted SFZ/WAV subsets (lazy-loaded)
│   ├── icons/               # PWA icons
│   └── fonts/               # Bravura (notation), UI fonts
├── src/
│   ├── app/                 # Next.js App Router pages
│   │   ├── (main)/          # Home, games, practice, profile
│   │   ├── games/[slug]/    # Dynamic game routes
│   │   └── layout.tsx
│   ├── components/
│   │   ├── ui/              # shadcn primitives
│   │   ├── game/            # Shared game shell (lives, timer, feedback)
│   │   ├── audio/           # Piano keyboard, MIDI status
│   │   └── notation/        # VexFlow wrappers
│   ├── games/               # One folder per game
│   │   ├── intervalis/
│   │   ├── chordelius/
│   │   └── ...
│   ├── lib/
│   │   ├── theory/          # Pure music theory (no React)
│   │   ├── audio/           # AudioService, sample loading
│   │   ├── midi/            # MidiService
│   │   ├── pitch/           # PitchService (microphone)
│   │   ├── rhythm/          # RhythmEngine
│   │   ├── notation/        # Score generation helpers
│   │   └── adaptive/        # MasteryTracker, SkillTree
│   ├── hooks/               # React hooks
│   ├── stores/              # Zustand stores
│   └── types/               # Shared TypeScript types
├── tests/
│   ├── unit/                # Vitest
│   └── e2e/                 # Playwright
└── scripts/                 # Sample conversion, codegen
```

---

## Core Modules

### 1. Theory Library (`src/lib/theory/`)

Pure TypeScript. Zero browser APIs. Fully unit-tested.

```typescript
// Example types
type NoteName = 'C' | 'C#' | 'D' | ... ;
type Pitch = { note: NoteName; octave: number };
type Interval = { semitones: number; quality: IntervalQuality; number: number };
type Chord = { root: Pitch; quality: ChordQuality; tones: Pitch[] };
type Scale = { root: Pitch; type: ScaleType; degrees: Pitch[] };
```

**Modules:**
- `notes.ts` — pitch class math, enharmonics
- `intervals.ts` — interval between two pitches, naming
- `scales.ts` — all scale types (see CURRICULUM.md)
- `chords.ts` — triads through extended jazz chords
- `progressions.ts` — Roman numeral analysis, jazz substitutions
- `random.ts` — seeded RNG for reproducible game questions

### 2. Audio Service (`src/lib/audio/`)

Singleton managing Web Audio lifecycle.

**Responsibilities:**
- Lazy AudioContext creation + resume on user gesture
- Instrument registry (piano, violin, guitar, …)
- Polyphonic note scheduling with velocity layers
- Master gain + limiter (prevent clipping on mobile speakers)

**Interface:**
```typescript
interface AudioService {
  unlock(): Promise<void>;
  playNote(instrument: InstrumentId, pitch: Pitch, durationMs: number, velocity?: number): void;
  playChord(instrument: InstrumentId, pitches: Pitch[], durationMs: number): void;
  playSequence(notes: ScheduledNote[]): Promise<void>;
  setMasterVolume(v: number): void;
}
```

### 3. MIDI Service (`src/lib/midi/`)

```typescript
interface MidiService {
  isSupported(): boolean;
  connect(): Promise<MidiInput[]>;
  onNoteOn(callback: (note: number, velocity: number) => void): void;
  onNoteOff(callback: (note: number) => void): void;
  disconnect(): void;
}
```

Feature-detects `navigator.requestMIDIAccess`. Shows setup guide for Android USB/BLE.

### 4. Pitch Service (`src/lib/pitch/`)

For voice games (Melody Jay, Solfègiator, Interval Barks).

- Uses `pitchy` PitchDetector on AnalyserNode stream
- Converts Hz → Pitch with cents tolerance scoring
- Handles clarity threshold (ignore noise)

### 5. Rhythm Engine (`src/lib/rhythm/`)

- Metronome with lookahead scheduler (Chris Wilson pattern)
- Tap recording with timing deviation scoring (±ms tolerance scales with level)
- Pattern representation: array of `{ offset: number; duration: number }`

### 6. Adaptive Engine (`src/lib/adaptive/`)

```typescript
interface SkillNode {
  id: string;
  name: string;
  mastery: number;        // 0-100
  level: number;          // 1-10 difficulty within skill
  lastReviewed: Date;
  nextReview: Date;       // SM-2
  history: AttemptRecord[];
}

interface MasteryTracker {
  recordAttempt(skillId: string, correct: boolean, responseMs: number, difficulty: number): void;
  getRecommendedLevel(skillId: string): number;
  getDueReviews(): SkillNode[];
  shouldPromote(skillId: string): boolean;
  shouldDemote(skillId: string): boolean;
}
```

Persisted to IndexedDB via Dexie.

---

## Game Architecture Pattern

Every game follows the same shell:

```
GameShell
├── Header (lives, score, pause)
├── GameCanvas (game-specific UI)
├── FeedbackOverlay (correct/wrong + teaching moment)
└── Footer (primary action buttons — thumb zone)
```

Each game implements:

```typescript
interface GameDefinition {
  id: string;
  name: string;
  slug: string;
  category: GameCategory;
  skillNodes: string[];           // links to adaptive tree
  generateQuestion(level: number, rng: RNG): Question;
  evaluateAnswer(question: Question, answer: UserAnswer): Evaluation;
  renderQuestion(props: QuestionRenderProps): ReactNode;
  renderAnswerInput(props: AnswerInputProps): ReactNode;
  getTeachingMoment(question: Question, evaluation: Evaluation): TeachingMoment;
}
```

This registry pattern lets us:
- Launch games from a central catalog
- Share adaptive logic
- Test question generation in isolation (no React)

---

## Data Flow

```
User action
  → Game component
  → evaluateAnswer() [pure function]
  → MasteryTracker.recordAttempt()
  → IndexedDB persist
  → FeedbackOverlay with teaching moment
  → Next question from generateQuestion(level)
```

Audio playback is side-effect: `AudioService.playChord(...)` called when question renders.

---

## PWA & Offline

- Service worker caches app shell + piano samples (core subset ~5MB)
- Game progress in IndexedDB (works offline)
- Sample packs downloaded on-demand, cached by version hash

---

## Security & Privacy

- Microphone: requested only when entering voice games; never background
- MIDI: no data sent to server (local-first Phase 0–4)
- No third-party analytics in Phase 0 (add privacy-respecting analytics later if needed)

---

## CI Pipeline

```yaml
# .github/workflows/ci.yml
on: [push, pull_request]
jobs:
  test:
    - npm ci
    - npm run lint
    - npm run test:unit
    - npm run test:e2e  # Playwright with mocked audio
    - npm run build
```

---

## Key Technical Decisions

| Decision | Choice | Alternatives considered |
|----------|--------|------------------------|
| Framework | Next.js | Vite SPA (less PWA tooling), Expo (native not needed yet) |
| Samples | smplr + self-hosted SFZ | Tone.js Synth (rejected — sounds fake) |
| Notation | VexFlow programmatic | ABC.js (less flexible for games) |
| State | Zustand | Redux (overkill), Context (performance) |
| Persistence | Dexie/IndexedDB | localStorage (too small) |
| Pitch | pitchy | aubiojs (GPL concern for commercial) |

See [DECISIONS.md](./DECISIONS.md) for full ADR log.
