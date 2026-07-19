# Latency Strategy

> **Rule:** Real-time games must feel instant. Turn-based games can prioritize clarity over milliseconds.

---

## Game Classification

| Tier | Latency budget (input → feedback) | Games |
|------|-----------------------------------|-------|
| **A — Real-time** | ≤ 20ms perceived; measure input at capture | Rhythmic Parrot, Rhythmania, Melody Hunter (perform), Melody Jay, Solfègiator, Interval Barks, Notationist (action), Bassonist, Scale Studio MIDI |
| **B — Scheduled** | Align to musical clock; input window in advance | Route VI (throw switch before train), Departurer/Lander |
| **C — Turn-based** | No hard RT budget; polish > speed | Intervalis, Chordelius, Inversionist, Calibrator, Melodix (select), Scale Spy (name scale) |

**Default:** If the player acts *in time with sound*, it's Tier A.

---

## Tier A Requirements

### Input capture
1. Timestamp at **first native event** (`pointerdown` / `keydown` / MIDI), not after React re-render.
2. Use **`{ capture: true, passive: true }`** listeners on the tap surface.
3. Hot path reads **refs** only — no `useState` before grading.
4. **`performance.now()`** for tap grading; MIDI uses message timestamp when present.

### Audio / clock
1. `AudioContext` with `{ latencyHint: 'interactive' }`.
2. Schedule sounds **≥ 25ms ahead** of `currentTime` (lookahead scheduler).
3. **Tone.js Transport** for groove backing — never `setTimeout` for musical beats.
4. Visual metronome may lead audio by 1–2 frames on mobile (documented offset compensation in grading).

### Render
1. Pixi **`requestAnimationFrame`** loop — never tie game state to React per frame.
2. Input feedback (flash, particles) via refs + canvas; React score updates **throttled** (max 10/s) or on beat boundary.
3. Pre-warm: create AudioContext + Pixi app on **Start** tap, not first gameplay input.

### MIDI
1. `WebMidiTransport`: handle `noteon` in dedicated handler; push to ring buffer with `event.receivedTime ?? performance.now()`.
2. **MIDI Link** (Safari): WebSocket binary + monotonic clock sync; target < 5ms local overhead.
3. BLE MIDI: expect +15–40ms jitter; widen Tier A windows slightly when `transport.kind === 'ble-midi'`.

### Voice (pitchy)
1. `AudioWorklet` capture path when available; fallback AnalyserNode with documented +30ms bias.
2. Grade on **stable pitch** (N consecutive frames above clarity threshold), not single frame.

---

## Latency Budget (Tier A target)

```
Touch/MIDI event          0 ms    ← timestamp here
Input handler + grade     < 2 ms  ← refs, pure TS
Visual feedback           < 16 ms ← same or next frame
Audio feedback (if on)    < 25 ms ← scheduled ahead
React score label update  < 100 ms ← throttled, non-blocking
```

**Total perceived:** one frame (16ms @ 60fps) for visual; audio on next buffer.

---

## Anti-patterns (never in Tier A)

- Grading inside `onClick` after async work
- Re-mounting Pixi canvas on score/flash state change
- `setTimeout` for beat scheduling
- Loading samples on first tap
- Full React tree re-render per frame
- Debouncing tap input

---

## Testing latency

| Test | Tool |
|------|------|
| Tap grading math | Vitest (mechanics) |
| Input timestamp preserved | Unit test on `captureTapTimestamp` |
| E2E round completes | Playwright |
| Manual RTT | Chrome Performance panel + optional `__LATENCY_DEBUG__` overlay (dev only) |

---

## Rhythmic Parrot (implemented)

- Native `pointerdown` + `keydown` with capture
- `phaseRef` on hot path
- Score/combo React updates deferred via `requestAnimationFrame` batch
- Pre-start countdown separates warm-up from graded window

---

## Future: InputBus

All Tier A games share:

```typescript
type TimedInput = {
  type: "tap" | "midi" | "voice";
  timeMs: number;       // captured at source
  transport?: string; // for jitter compensation
};
```

Games consume `TimedInput`; grading uses pure mechanics + config windows.
