"use client";

import dynamic from "next/dynamic";

const GameLoading = () => (
  <div className="flex min-h-[420px] items-center justify-center rounded-2xl border border-gold/20 bg-navy-light text-gold-light/60">
    Loading game…
  </div>
);

const RhythmicParrotGame = dynamic(
  () =>
    import("@/games/rhythmic-parrot/RhythmicParrotGame").then(
      (mod) => mod.RhythmicParrotGame,
    ),
  { ssr: false, loading: () => <GameLoading /> },
);

const IntervalisGame = dynamic(
  () =>
    import("@/games/intervalis/IntervalisGame").then(
      (mod) => mod.IntervalisGame,
    ),
  { ssr: false, loading: () => <GameLoading /> },
);

const RouteVIGame = dynamic(
  () =>
    import("@/games/route-vi/RouteVIGame").then((mod) => mod.RouteVIGame),
  { ssr: false, loading: () => <GameLoading /> },
);

type GameLoaderProps = {
  slug: string;
};

export const GameLoader = ({ slug }: GameLoaderProps) => {
  if (slug === "rhythmic-parrot") {
    return <RhythmicParrotGame defaultMuted />;
  }

  if (slug === "intervalis") {
    return <IntervalisGame defaultMuted />;
  }

  if (slug === "route-vi") {
    return <RouteVIGame defaultMuted />;
  }

  return (
    <div className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-dashed border-gold/30 bg-navy-light/30 p-8 text-center">
      <span className="mb-4 text-5xl" aria-hidden="true">
        ♪
      </span>
      <h2 className="font-display text-xl text-gold">Coming soon</h2>
      <p className="mt-2 max-w-xs text-sm text-gold-light/60">
        This game is next in the build queue.
      </p>
    </div>
  );
};
