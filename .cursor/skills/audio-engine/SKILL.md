---
name: audio-engine
description: Web Audio, MIDI, and sample playback for Music School. Use when implementing sound, instruments, or MIDI keyboard support.
---

# Audio Engine Skill

## Golden Rule
Realistic sample-based instruments only. No synth oscillators for musical content.

## Phase 0 Stack
- `smplr` library with `SplendidGrandPiano`
- Web Audio API `AudioContext`
- Custom `AudioService` singleton

## AudioContext Lifecycle (Mobile Critical)
```typescript
// 1. Create lazily, not at module load
// 2. Resume on first user tap:
await audioContext.resume();
// 3. Show "Tap to Start" overlay before any sound
```

## Sample Sources
- Phase 0: smplr CDN (SplendidGrandPiano)
- Phase 2+: Self-hosted SFZ from sfzinstruments (Salamander, Sonatina)
- See docs/AUDIO.md for full inventory

## Scheduling Pattern
```typescript
const when = audioContext.currentTime + 0.1; // 100ms lookahead
instrument.start({ note: 'C4', velocity: 80, time: when, duration: 1.0 });
```

## MIDI (Web MIDI API)
```typescript
const access = await navigator.requestMIDIAccess();
// Feature-detect first; iOS = no support
```

| Platform | Support |
|----------|---------|
| Android Chrome/Edge/Samsung | USB + BLE |
| iOS all browsers | ❌ — use on-screen keyboard |
| Desktop | ✅ |

Always show MidiStatus component: connected/disconnected/unsupported.

## Pitch Detection (Voice Games)
- Use `pitchy` PitchDetector on AnalyserNode
- Score with cents tolerance: ±50 cents (level 1) → ±25 cents (level 10)
- Require clarity > 0.85 before accepting pitch

## Mobile Constraints
- Max 32 concurrent voices; voice stealing on overflow
- Master limiter at -1dB
- Progressive sample loading with progress UI
- Cache samples in service worker (Phase 1+)

## Testing
Mock AudioContext in Vitest. Test note→MIDI mapping, scheduling math, not actual audio output.
