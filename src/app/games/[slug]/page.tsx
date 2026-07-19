import Link from "next/link";
import { notFound } from "next/navigation";
import { GameLoader } from "@/components/game/GameLoader";
import { GAME_CATALOG, getGameBySlug } from "@/lib/games/catalog";

export const generateStaticParams = () => {
  return GAME_CATALOG.map((game) => ({ slug: game.slug }));
};

type GamePageProps = {
  params: Promise<{ slug: string }>;
};

const GamePage = async ({ params }: GamePageProps) => {
  const { slug } = await params;
  const game = getGameBySlug(slug);

  if (!game) {
    notFound();
  }

  const playableSlugs = new Set([
    "rhythmic-parrot",
    "intervalis",
    "route-vi",
    "notationist",
    "departurer",
  ]);
  const isPlayable = playableSlugs.has(slug);

  return (
    <main className="mx-auto flex min-h-dvh max-w-lg flex-col px-4 pb-8 pt-6">
      <Link
        href="/"
        className="mb-6 inline-flex min-h-11 items-center text-sm text-gold/80 hover:text-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold"
        aria-label="Back to home"
      >
        ← Back
      </Link>

      <header className="mb-6">
        <p className="text-xs uppercase tracking-widest text-gold/70">
          {game.category}
        </p>
        <h1 className="font-display text-3xl font-bold text-gold-light">
          {game.name}
        </h1>
        <p className="mt-2 text-gold-light/70">{game.description}</p>
        {isPlayable && slug !== "rhythmic-parrot" && (
          <p className="mt-2 text-xs text-gold/60">
            Silent by default · unmute for chord and sample audio
          </p>
        )}
        {slug === "rhythmic-parrot" && (
          <p className="mt-2 text-xs text-gold/60">
            Tap to enable sound, then start the round to hear the beat
          </p>
        )}
      </header>

      <GameLoader slug={slug} />
    </main>
  );
};

export default GamePage;
