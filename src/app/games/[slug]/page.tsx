import Link from "next/link";
import { notFound } from "next/navigation";
import { getGameBySlug } from "@/lib/games/catalog";

type GamePageProps = {
  params: Promise<{ slug: string }>;
};

const GamePage = async ({ params }: GamePageProps) => {
  const { slug } = await params;
  const game = getGameBySlug(slug);

  if (!game) {
    notFound();
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-lg flex-col px-4 pb-8 pt-6">
      <Link
        href="/"
        className="mb-6 inline-flex min-h-11 items-center text-sm text-gold/80 hover:text-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold"
        aria-label="Back to home"
      >
        ← Back
      </Link>

      <header className="mb-8">
        <p className="text-xs uppercase tracking-widest text-gold/70">
          {game.category}
        </p>
        <h1 className="font-display text-3xl font-bold text-gold-light">
          {game.name}
        </h1>
        <p className="mt-2 text-gold-light/70">{game.description}</p>
      </header>

      <section
        className="flex flex-1 flex-col items-center justify-center rounded-2xl border border-dashed border-gold/30 bg-navy-light/30 p-8 text-center"
        aria-label="Game placeholder"
      >
        <span className="mb-4 text-5xl" aria-hidden="true">
          ♪
        </span>
        <h2 className="font-display text-xl text-gold">Coming in Phase 1</h2>
        <p className="mt-2 max-w-xs text-sm text-gold-light/60">
          Game engine shell and audio service are next. Check docs/GAMES.md for
          the full spec.
        </p>
      </section>
    </main>
  );
};

export default GamePage;
