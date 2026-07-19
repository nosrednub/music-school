# Audio & Sample Strategy

Goal: **Realistic, expressive instruments — never bare synth oscillators.**

---

## Primary Libraries (Open Source)

### Piano
| Library | Source | Size | Quality | Phase |
|---------|--------|------|---------|-------|
| **Salamander Grand Piano** | [sfzinstruments](https://github.com/sfzinstruments/SalamanderGrandPiano) | 296MB–1.2GB full | 16 velocity layers, 48kHz | Self-host subset |
| **Splendid Grand Piano** | [sfzinstruments](https://github.com/sfzinstruments/SplendidGrandPiano) | Smaller | 4 velocity layers | Phase 0 via smplr |
| **FreePats Acoustic Grand** | [freepats](https://freepats.zenvoid.org/Piano/acoustic-grand-piano.html) | 27–69MB | Good mobile compromise | Fallback |

**Phase 0:** Use `smplr` `SplendidGrandPiano` (CDN, zero setup).  
**Phase 1:** Self-host optimized subset (~8MB, 3 velocity layers, every 3rd note sampled + interpolation).

### Orchestral Strings
| Library | Source | Notes |
|---------|--------|-------|
| **Sonatina Symphonic Orchestra** | [sfzinstruments](https://github.com/sfzinstruments/Sonatina-Symphonic-Orchestra) | Violin, viola, cello, bass — CC-licensed |
| **VPO3 subset** | Virtual Playing Orchestra | Higher quality, larger |

Phase 2: violin + cello for melody games.

### Guitar
| Library | Source | Notes |
|---------|--------|-------|
| **Decent Samples Acoustic** | [decentsamples.com](https://www.decentsamples.com/) | Free, SFZ, easy conversion |
| **Karoryfer samples** | GitHub | Various plucked strings |

### Other (Later)
- Flute, clarinet, trumpet from Sonatina
- Organ for gospel (church organ samples from FreePats)

---

## Playback Engine

### Phase 0–2: smplr + Web Audio API

```typescript
import { SplendidGrandPiano } from 'smplr';

const piano = new SplendidGrandPiano(audioContext);
piano.start({ note: 'C4', velocity: 80, duration: 1.5 });
```

**Pros:** No server, high quality, maintained.  
**Cons:** Limited instrument set; CDN dependency initially.

### Phase 2+: Self-hosted SFZ via custom loader or webaudiofontplayer

Convert SFZ → sf2-json for `webaudiofontplayer`:
- Full control over sample quality vs size
- Offline PWA caching
- Velocity layers, sustain pedal (future)

### Phase 5+: Physical Modeling (Research)

Browser-based piano modeling (e.g. adapted from [WebAudio Piano](https://github.com/g200kg/webaudio-piano) or custom WASM).  
Not before core games ship — samples first.

---

## Mobile Optimization

| Concern | Strategy |
|---------|----------|
| Bundle size | Progressive download; piano only on first load |
| Memory | Limit polyphony to 32 voices; steal oldest |
| Latency | Schedule 100ms ahead; use AudioWorklet for metronome |
| Speaker quality | Gentle limiter at -1dB; avoid harsh transients |
| iOS silent mode | `<audio>` unlock trick + user gesture |

### Sample Loading Priority
1. Piano (core) — blocking, show progress
2. Metronome click — tiny, embedded
3. Violin/cello — on first melody game
4. Full orchestra — on demand

---

## Instrument Assignment by Game

| Game | Primary instrument |
|------|-------------------|
| Intervalis, Departurer, Lander, Calibrator | Piano (two-hand voicing) |
| Chordelius, Inversionist | Piano or string pad |
| Scale Spy | Piano ascending |
| Melody Hunter/Jay/Melodix | Piano + later violin |
| Rhythmic Parrot, Rhythmania | Woodblock or muted piano |
| Route VI | Piano comping (jazz voicings) |
| Voice games | Piano reference tones |
| Notationist, Bassonist | Piano confirmation on answer |

---

## Metronome & Click

Custom short sample (~50ms wooden click) or synthesized noise burst.  
**Not** a sine wave tone — use filtered noise for natural feel.

---

## Licensing Checklist

| Library | License | Commercial OK? |
|---------|---------|----------------|
| Salamander/Splendid (sfzinstruments) | CC BY-SA / various | Verify per instrument README |
| Sonatina | CC BY | Yes with attribution |
| smplr samples (danigb) | MIT (code) / sample-specific | Check each |
| FreePats | Free | Yes with attribution |

**Action:** Maintain `docs/SAMPLE-LICENSES.md` as we add instruments.

---

## Quality Bar

Before any instrument ships:
- [ ] A/B test against real recording (blind ear check)
- [ ] No obvious looping artifacts on sustained notes
- [ ] Velocity layers sound smooth (no jumps)
- [ ] Mobile speaker test (iPhone + Android mid-range)

If it sounds like a cheap keyboard synth → reject and find better samples.
