# Music School MIDI Link

Open-source menubar companion for **Mac Safari USB MIDI**.

Safari does not implement the Web MIDI API. This app bridges CoreMIDI to a local WebSocket so the Music School PWA receives identical `MidiNoteEvent`s as Chrome.

## Status

Scaffold — implementation in Phase 1b.

## Planned Stack

- **Tauri 2** — small menubar footprint (~2MB)
- **CoreMIDI** — USB MIDI device input
- **WebSocket** — `ws://127.0.0.1:47809` (localhost only)

## Protocol (draft)

```json
{ "type": "noteon", "note": 60, "velocity": 100, "channel": 0, "timestamp": 1234567890 }
{ "type": "noteoff", "note": 60, "velocity": 0, "channel": 0, "timestamp": 1234567891 }
```

## User Flow

1. Install MIDI Link from releases (signed macOS binary)
2. Plug in USB MIDI keyboard
3. Open Music School in Safari → Connect → auto-detects Link

See [docs/MIDI.md](../../docs/MIDI.md) for full cross-platform strategy.
