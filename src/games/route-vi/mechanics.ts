export type ChordStation = {
  roman: string;
  symbol: string;
  tagline: string;
  bassMidi: number;
  chordMidis: number[];
};

export type JunctionChallenge = {
  stepIndex: number;
  from: ChordStation;
  target: ChordStation;
  options: ChordStation[];
  correctIndex: number;
  lifeRing: boolean;
};

export type SwitchResult = {
  correct: boolean;
  selected: ChordStation;
  target: ChordStation;
};

export const JUNCTION_TIME_MS = 6000;
export const TRAVEL_TIME_MS = 1800;
export const STATIONS_PER_ROUND = 4;

/** Gospel Chapel Line — I–vi–IV–V–I in C (Phase 1) */
export const CHAPEL_LINE: ChordStation[] = [
  {
    roman: "I",
    symbol: "C",
    tagline: "Home — the tonic",
    bassMidi: 48,
    chordMidis: [48, 52, 55],
  },
  {
    roman: "vi",
    symbol: "Am",
    tagline: "Relative minor — emotional lift",
    bassMidi: 45,
    chordMidis: [45, 52, 57],
  },
  {
    roman: "IV",
    symbol: "F",
    tagline: "Gospel 'Amen' chord",
    bassMidi: 53,
    chordMidis: [53, 57, 60],
  },
  {
    roman: "V",
    symbol: "G",
    tagline: "Tension before home",
    bassMidi: 55,
    chordMidis: [55, 59, 62],
  },
  {
    roman: "I",
    symbol: "C",
    tagline: "Resolution",
    bassMidi: 48,
    chordMidis: [48, 52, 55],
  },
];

/** Decoy switches for wrong tracks */
export const DECOY_POOL: ChordStation[] = [
  {
    roman: "ii",
    symbol: "Dm",
    tagline: "Pre-dominant color",
    bassMidi: 50,
    chordMidis: [50, 53, 57],
  },
  {
    roman: "iii",
    symbol: "Em",
    tagline: "Mediant — softer pull",
    bassMidi: 52,
    chordMidis: [52, 55, 59],
  },
  {
    roman: "bVII",
    symbol: "Bb",
    tagline: "Backdoor dominant",
    bassMidi: 46,
    chordMidis: [46, 50, 53],
  },
  {
    roman: "V/vi",
    symbol: "E",
    tagline: "Secondary dominant",
    bassMidi: 52,
    chordMidis: [52, 56, 59],
  },
];

const shuffle = <T,>(items: T[], rng: () => number): T[] => {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j]!, copy[i]!];
  }
  return copy;
};

export const buildJunctionChallenge = (
  stepIndex: number,
  lifeRing = false,
  rng: () => number = Math.random,
): JunctionChallenge => {
  const from = CHAPEL_LINE[stepIndex]!;
  const target = CHAPEL_LINE[stepIndex + 1]!;

  const decoys = shuffle(
    DECOY_POOL.filter((d) => d.roman !== target.roman),
    rng,
  ).slice(0, 2);

  const options = shuffle([target, ...decoys], rng);
  const correctIndex = options.findIndex((o) => o.roman === target.roman);

  return {
    stepIndex,
    from,
    target,
    options,
    correctIndex,
    lifeRing,
  };
};

export const evaluateSwitch = (
  challenge: JunctionChallenge,
  selectedIndex: number,
): SwitchResult => {
  const selected = challenge.options[selectedIndex]!;
  return {
    correct: selectedIndex === challenge.correctIndex,
    selected,
    target: challenge.target,
  };
};

export const getCoachTip = (result: SwitchResult): string => {
  if (result.correct) {
    return `${result.target.roman} (${result.target.symbol}) — ${result.target.tagline}`;
  }

  const tips: Record<string, string> = {
    vi: "vi is the relative minor — same notes as I, different home.",
    IV: "IV is the subdominant — the classic gospel 'lift' before V.",
    V: "V pulls strongly back to I — listen for the tension.",
    I: "I is home base — where the chapel line resolves.",
    bVII: "bVII is the backdoor — common in gospel, but not this line.",
  };

  return (
    tips[result.target.roman] ??
    `This junction needed ${result.target.roman} (${result.target.symbol}), not ${result.selected.roman}.`
  );
};

export const getStationAngle = (stationIndex: number, totalStations: number): number => {
  return (stationIndex / totalStations) * Math.PI * 2 - Math.PI / 2;
};

export const lerpAngle = (from: number, to: number, t: number): number => {
  let delta = to - from;
  while (delta > Math.PI) {
    delta -= Math.PI * 2;
  }
  while (delta < -Math.PI) {
    delta += Math.PI * 2;
  }
  return from + delta * t;
};
