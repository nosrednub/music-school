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
          Rhythmic Parrot is playable — more games incoming
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

      <section className="rounded-2xl border border-gold/20 bg-gold/5 p-6">
        <h2 className="font-display text-lg font-semibold text-gold-light">
          Try Rhythmic Parrot
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-gold-light/70">
          Tap when the fruit hits the beak. Silent by default — safe for
          meetings until you toggle sound on.
        </p>
      </section>
    </main>
  );
};

export default HomePage;
