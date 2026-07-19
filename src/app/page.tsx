import Link from "next/link";
import { GAME_CATALOG } from "@/lib/games/catalog";

const HomePage = () => {
  const phase1Games = GAME_CATALOG.filter((game) => game.phase === 1);

  return (
    <main className="mx-auto flex min-h-dvh max-w-lg flex-col px-4 pb-8 pt-6">
      <header className="mb-8 text-center">
        <p className="mb-2 text-sm uppercase tracking-widest text-gold/80">
          Mobile-first music theory
        </p>
        <h1 className="font-display text-4xl font-bold text-gold-light">
          Music School
        </h1>
        <p className="mt-3 text-base text-gold-light/70">
          Level up your ear, theory, and keyboard skills — classical, jazz, and
          gospel.
        </p>
      </header>

      <section className="mb-8 rounded-2xl border border-navy-light bg-navy-light/50 p-6">
        <h2 className="font-display text-xl font-semibold text-gold">
          Phase 1 Games
        </h2>
        <p className="mt-1 text-sm text-gold-light/60">
          Rhythmic Parrot, Intervalis & Scale Studio are playable
        </p>
        <ul className="mt-4 space-y-3">
          {phase1Games.map((game) => (
            <li key={game.id}>
              <Link
                href={`/games/${game.slug}`}
                className="flex min-h-11 items-center justify-between rounded-xl bg-navy px-4 py-3 transition-colors hover:bg-navy-light focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold"
                aria-label={`${game.name}: ${game.description}`}
              >
                <span className="font-medium text-gold-light">{game.name}</span>
                <span className="text-xs uppercase tracking-wide text-gold/70">
                  {game.category}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mb-8 rounded-2xl border border-coral/30 bg-coral/5 p-6">
        <h2 className="font-display text-xl font-semibold text-gold-light">
          Practice Yard
        </h2>
        <p className="mt-1 text-sm text-gold-light/60">
          Keyboard & MIDI drills — not quiz games
        </p>
        <ul className="mt-4 space-y-3">
          <li>
            <Link
              href="/practice/scale-studio"
              className="flex min-h-11 items-center justify-between rounded-xl bg-navy px-4 py-3 transition-colors hover:bg-navy-light focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold"
              aria-label="Scale Studio: ascending scale practice with MIDI"
            >
              <span className="font-medium text-gold-light">Scale Studio</span>
              <span className="text-xs uppercase tracking-wide text-coral/80">
                practice
              </span>
            </Link>
          </li>
        </ul>
      </section>

      <section className="rounded-2xl border border-gold/20 bg-gold/5 p-6">
        <h2 className="font-display text-lg font-semibold text-gold-light">
          Now playable
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-gold-light/70">
          <strong>Rhythmic Parrot</strong> — tap timing.{" "}
          <strong>Intervalis</strong> — draw the semitone bridge.{" "}
          <strong>Scale Studio</strong> — play scales on piano or MIDI. All silent
          by default.
        </p>
      </section>
    </main>
  );
};

export default HomePage;
