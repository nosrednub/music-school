---
name: game-design
description: Game mechanics, UX, and adaptive learning for Music School games. Use when implementing or designing any of the 17 games.
---

# Game Design Skill

## Shared Game Shell
Every game uses GameShell with:
- 3 lives (regenerate 1 per hour, max 3)
- XP on correct (+10 base × level multiplier)
- Post-answer teaching moment (always, not just on wrong)
- Pause menu, sound toggle
- Bottom-aligned primary controls (thumb zone)

## GameDefinition Interface
Each game in `src/games/[slug]/` implements:
- `generateQuestion(level, rng)` — pure, testable
- `evaluateAnswer(question, answer)` — pure, testable
- `getTeachingMoment(question, evaluation)` — returns string + optional audio cue
- React render components for question and answer input

## Input Types by Game
| Type | Games |
|------|-------|
| Multiple choice tap | Intervalis, Chordelius, Scale Spy, Route VI, … |
| On-screen piano | Melody Hunter, Scale Studio |
| MIDI keyboard | Melody Hunter, Scale Studio (when available) |
| Tap rhythm | Rhythmic Parrot, Rhythmania |
| Voice (mic) | Melody Jay, Solfègiator, Interval Barks |
| Timed tap | Notationist, Bassonist |

## Adaptive Difficulty (Levels 1–10)
- MasteryTracker decides effective level per skill node
- Promote: ≥80% accuracy over last 10 at current level
- Demote: <50% over last 5 (gentle messaging: "Let's practice this more")
- Inject spaced-repetition reviews between new questions

## Life-Rings (Hints)
Limited per round (2 default):
- Route VI: replay bass notes only
- Interval Barks: play reference interval before singing
- General: replay question audio (costs 1 life-ring)

## Gamification Rules
- Worlds group games visually (Interval Island, Chord City, Scale Summit…)
- Streak counter for daily play
- Never punish harshly — wrong answers teach, not shame
- Celebration: subtle note-bounce animation + satisfying chord on correct

## Mobile UX
- Landscape optional but portrait primary
- Large tap targets for rhythm games (full-width tap zone)
- Spacebar works on desktop for rhythm games
- Haptic feedback via `navigator.vibrate(50)` on correct (if available)

## Reference
Full specs: `docs/GAMES.md`  
Curriculum mapping: `docs/CURRICULUM.md`
