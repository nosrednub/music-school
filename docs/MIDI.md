# MIDI — Cross-Platform Strategy

> **Requirement:** MIDI keyboards must work on Mac Safari, mobile Safari, Chrome (desktop + Android), and Android Chrome. This is a hard product requirement — solved with a **unified transport layer**, not browser hope.

---

## The Hard Truth About Safari

Apple **does not implement the Web MIDI API** in Safari on macOS or iOS (as of July 2026). There is no flag, no polyfill in pure JavaScript for USB MIDI in Safari.

| Platform | Browser | Native Web MIDI | Our solution |
|----------|---------|-----------------|--------------|
| Mac | Chrome, Edge, Firefox | ✅ USB + BLE | `WebMidiTransport` |
| Mac | **Safari** | ❌ | `LinkTransport` (companion) OR `BleMidiTransport` |
| iPhone/iPad | **Safari** | ❌ USB | `BleMidiTransport` + **beacio** polyfill |
| iPhone/iPad | Chrome | ❌ (WebKit) | Same as Safari |
| Android | Chrome, Edge, Samsung | ✅ USB + BLE | `WebMidiTransport` + `BleMidiTransport` |

We do **not** tell users "Safari doesn't work." We detect capability and activate the right transport automatically.

---

## Unified MidiTransport Architecture

All games and Scale Studio consume one interface:

```typescript
type MidiTransportKind =
  | "web-midi"      // navigator.requestMIDIAccess
  | "ble-midi"      // Web Bluetooth MIDI (standard BLE-MIDI service)
  | "beacio-ble"    // iOS Safari via @beacio/core polyfill
  | "link-bridge"   // WebSocket to Music School MIDI Link (Mac Safari USB)
  | "virtual";      // On-screen keyboard → same event shape

interface MidiTransport {
  readonly kind: MidiTransportKind;
  readonly isConnected: boolean;
  connect(): Promise<void>;
  disconnect(): void;
  onNote(on: (event: MidiNoteEvent) => void): Unsubscribe;
  onConnectionChange(cb: (connected: boolean) => void): Unsubscribe;
}

interface MidiNoteEvent {
  note: number;       // MIDI 0–127
  velocity: number;   // 0–127
  channel: number;
  type: "noteon" | "noteoff";
  timestamp: number;  // performance.now()
}
```

**MidiRouter** selects transport at runtime:

```
1. Try WebMidiTransport (Chrome/Firefox/Edge)
2. Else try BleMidiTransport (BLE-MIDI capable browser)
3. Else if iOS Safari → init beacio → BeacioBleTransport
4. Else if Mac Safari → offer LinkTransport (WebSocket ws://127.0.0.1:47809)
5. Always available: VirtualKeyboardTransport (same MidiNoteEvent shape)
```

Games never import `navigator.requestMIDIAccess` directly.

---

## Transport Details

### 1. WebMidiTransport (Primary)

Standard W3C Web MIDI API.

- **Mac Chrome/Firefox/Edge:** USB class-compliant keyboards, Bluetooth MIDI adapters
- **Android Chrome:** USB OTG + BLE
- Library: thin wrapper (no heavy abstraction) — we own the code

### 2. BleMidiTransport (Web Bluetooth MIDI)

Many modern keyboards expose **BLE-MIDI** (Bluetooth LE MIDI service `03B80E5A-EDE8-4B33-A751-6CE34EC4C700`).

- Works in Chrome/Edge (Mac + Android) natively
- Parsed with standard BLE-MIDI packet format
- Open source: we implement against spec (no proprietary SDK required for Chrome)

### 3. BeacioBleTransport (iOS Safari)

[iOS Safari has no Web Bluetooth natively](https://beacio.com/docs). The **beacio** open-source polyfill (`@beacio/core`) provides `navigator.bluetooth` via a free companion app + Safari extension.

```typescript
import "@beacio/core/auto"; // no-op on Chrome
import { initBeacio, isIOSSafari } from "@beacio/detect";
```

**UX:** First connect on iPhone shows a friendly 3-step sheet: Install beacio → Enable extension → Connect keyboard. One-time setup.

This is the **only viable path** for wireless MIDI on iPhone Safari without wrapping the whole app in native code.

### 4. LinkTransport — Music School MIDI Link (Mac Safari USB)

For **USB MIDI on Mac Safari**, we ship an open-source companion:

**`packages/midi-link/`** — lightweight menubar app (Tauri or Swift + CoreMIDI)

- Reads USB MIDI from CoreMIDI
- Exposes `ws://127.0.0.1:47809` WebSocket (local only)
- JSON messages mirror `MidiNoteEvent`
- PWA connects when Safari detected + Link running
- Auto-start option; signed macOS build for easy install

**Why:** Jazz-Plugin/NPAPI is dead. Web MIDI will not ship in Safari. A 2MB menubar bridge is the professional solution — same pattern as VS Code language servers, Figma desktop proxy, etc.

**Phase 1 deliverable:** Mac MIDI Link (open source, MIT). iOS USB remains BLE/beacio path (Camera Connection Kit keyboards often support BLE mode).

### 5. VirtualKeyboardTransport

On-screen piano (Pixi or React) emits identical `MidiNoteEvent`s. **Not a fallback tier** — a first-class input for touch-only sessions. Games cannot tell the difference.

---

## Connection UX (All Platforms)

```
┌─────────────────────────────────────┐
│  🎹 Connect Your Keyboard           │
│                                     │
│  [Auto-detected: USB Yamaha P-125]  │
│  ● Connected via Web MIDI           │
│                                     │
│  ── or ──                           │
│  [Use On-Screen Piano]              │
└─────────────────────────────────────┘
```

- Auto-scan on first game that needs MIDI
- Persist last device in IndexedDB
- Mac Safari: "Install MIDI Link" CTA with download link (one click)
- iOS: "Enable Bluetooth MIDI" with beacio guide

---

## Testing Strategy

| Transport | Test approach |
|-----------|---------------|
| WebMidiTransport | Vitest mocks + Playwright fake MIDI (if available) |
| BleMidiTransport | Unit test packet parser (fixtures from BLE-MIDI spec) |
| LinkTransport | Integration test against mock WebSocket server |
| VirtualKeyboardTransport | E2E tap piano keys |
| All | `web-midi-test` / JZZ virtual ports for CI |

---

## Implementation Phases

| Phase | Deliverable |
|-------|-------------|
| **0b** | `MidiTransport` interface + `VirtualKeyboardTransport` + `WebMidiTransport` |
| **1a** | `BleMidiTransport` + `@beacio/core` integration |
| **1b** | **Music School MIDI Link** (Mac Safari USB) — Tauri + CoreMIDI |
| **2** | RTP-MIDI network input (optional, for studio setups) |

---

## Dependencies (Open Source)

| Package | License | Role |
|---------|---------|------|
| `@beacio/core` | MIT | iOS Safari Web Bluetooth polyfill |
| `@beacio/detect` | MIT | Extension install prompts |
| `jzz` (optional) | MIT | Virtual MIDI ports in dev/CI |
| Tauri / CoreMIDI | MIT / Apple SDK | MIDI Link companion |

We **avoid** GPL (aubio) and deprecated NPAPI (Jazz-Plugin).

---

## Summary for the Ideator

**Yes, MIDI on Mac Safari and mobile Safari is achievable** — not via wishful Web MIDI support, but via:

1. **Chrome/Firefox on Mac** → native Web MIDI (zero install)
2. **Mac Safari** → our **MIDI Link** menubar companion (small one-time install)
3. **iPhone/iPad Safari** → **beacio** + Bluetooth MIDI keyboard
4. **Android Chrome** → native Web MIDI USB + BLE
5. **Everyone** → on-screen piano with identical game behavior

The app treats all inputs equally. Games stay dumb about transport details.
