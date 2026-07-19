import Link from "next/link";
import { getBiomeGames, isGamePlayable, WORLD_BIOMES } from "@/lib/games/biomes";

const PLAYABLE_LINKS = [
  {
    href: "/games/rhythmic-parrot",
    name: "Rhythmic Parrot",
    description: "Tap when the fruit hits the beak",
    badge: "rhythm",
  },
  {
    href: "/games/intervalis",
    name: "Intervalis",
    description: "Draw the semitone bridge",
    badge: "intervals",
  },
  {
    href: "/games/route-vi",
    name: "Route VI",
    description: "Throw switches on the gospel Chapel Line",
    badge: "harmony",
  },
  {
    href: "/games/notationist",
    name: "Notationist",
    description: "Press the note before the rune hits the wall",
    badge: "reading",
  },
  {
    href: "/games/departurer",
    name: "Departurer",
    description: "Set rocket fuel to match the ascending interval",
    badge: "intervals",
  },
  {
    href: "/practice/scale-studio",
    name: "Scale Studio",
    description: "Sheet music scale drills with full library",
    badge: "practice",
  },
] as const;

const HomePage = () => {
  return (
    <main className="mx-auto flex min-h-dvh max-w-lg flex-col px-4 pb-8 pt-6">
      <header className="mb-8 text-center">
        <p className="mb-2 text-sm uppercase tracking-widest text-gold/80">
          World map
        </p>
        <h1 className="font-display text-4xl font-bold text-gold-light">
          Music School
        </h1>
        <p className="mt-3 text-base text-gold-light/70">
          Explore biomes — classical, jazz, and gospel. Each game teaches
          through play, not quizzes.
        </p>
      </header>

      <section className="mb-8 rounded-2xl border border-gold/40 bg-gold/10 p-6">
        <h2 className="font-display text-xl font-semibold text-gold-light">
          Playable now
        </h2>
        <p className="mt-1 text-sm text-gold-light/60">
          Tap to open — silent by default
        </p>
        <ul className="mt-4 space-y-3">
          {PLAYABLE_LINKS.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="flex min-h-11 flex-col rounded-xl bg-navy px-4 py-3 transition-colors hover:bg-navy-light focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold sm:flex-row sm:items-center sm:justify-between"
                aria-label={`${item.name}: ${item.description}`}
              >
                <span>
                  <span className="block font-medium text-gold-light">
                    {item.name}
                  </span>
                  <span className="mt-0.5 block text-xs text-gold-light/60">
                    {item.description}
                  </span>
                </span>
                <span className="mt-2 text-xs uppercase tracking-wide text-gold/70 sm:mt-0">
                  {item.badge}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mb-4">
        <h2 className="font-display text-xl font-semibold text-gold-light">
          Biomes
        </h2>
        <p className="mt-1 text-sm text-gold-light/60">
          Unlock paths as you play — more scenes shipping weekly
        </p>
      </section>

      <div className="space-y-6">
        {WORLD_BIOMES.map((biome) => {
          const games = getBiomeGames(biome);
          return (
            <section
              key={biome.id}
              className={`rounded-2xl border p-5 ${biome.borderClass} ${biome.bgClass}`}
            >
              <h3 className="font-display text-lg font-semibold text-gold-light">
                {biome.name}
              </h3>
              <p className="mt-1 text-xs text-gold-light/60">{biome.description}</p>
              <ul className="mt-4 space-y-2">
                {games.map((game) => (
                  <li key={game.id}>
                    <Link
                      href={`/games/${game.slug}`}
                      className="flex min-h-11 items-center justify-between rounded-xl bg-navy/80 px-4 py-3 transition-colors hover:bg-navy-light focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold"
                      aria-label={`${game.name}: ${game.description}`}
                    >
                      <span className="font-medium text-gold-light">{game.name}</span>
                      <span className="text-xs uppercase tracking-wide text-gold/70">
                        {isGamePlayable(game.slug) ? "play" : "soon"}
                      </span>
                    </Link>
                  </li>
                ))}
                {biome.practiceLinks?.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="flex min-h-11 flex-col rounded-xl bg-navy/80 px-4 py-3 transition-colors hover:bg-navy-light sm:flex-row sm:items-center sm:justify-between"
                    >
                      <span className="font-medium text-gold-light">{link.name}</span>
                      <span className="text-xs text-gold/60">{link.description}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </main>
  );
};

export default HomePage;
