---
name: audio-engine
description: Web Audio, MIDI transport, and sample playback for Music School. Use when implementing sound, instruments, or MIDI keyboard support across all platforms including Safari.
---

# Audio Engine Skill

## Golden Rule
Realistic sample-based instruments only. No synth oscillators for musical content.

## Audio Stack
- **smplr** — SplendidGrandPiano (Phase 0), self-hosted SFZ later
- **Tone.js Transport** — rhythm games, groove backing, metronome scheduling
- **GrooveEngine** — gospel organ pad, jazz swing patterns (sample loops)

## AudioContext (Mobile)
```typescript
// Lazy create; resume on user gesture (hub "Enter" or game tap-to-start)
await audioContext.resume();
```

## MIDI — Use MidiRouter, NOT raw Web MIDI

See `docs/MIDI.md`. Games consume InputBus events only.

| Transport | When |
|-----------|------|
| WebMidiTransport | Chrome/Firefox/Edge (Mac, Android) |
| BleMidiTransport | BLE-MIDI keyboards |
| BeacioBleTransport | iOS Safari + @beacio/core |
| LinkTransport | Mac Safari USB → packages/midi-link WebSocket |
| VirtualKeyboardTransport | Always available |

```typescript
import "@beacio/core/auto"; // no-op on Chrome — import once in app entry

const router = await MidiRouter.detect();
await router.connect();
```

Never tell users Safari "doesn't support MIDI" — show connect path for their platform.

## Voice Games
- **pitchy** PitchDetector on AnalyserNode
- Cents tolerance scales with level
- clarity > 0.85 to accept

## Groove Backing (Gospel/Jazz)
- Scale Studio + Route VI use GrooveEngine
- Real samples: organ pad, ride cymbal loop, shuffle bass
- Tempo synced to Tone.Transport

## Testing
Mock AudioContext and MidiTransport in Vitest. Test BLE-MIDI packet parser with fixtures.
