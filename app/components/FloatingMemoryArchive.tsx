"use client";

import { motion, useReducedMotion } from "framer-motion";
import { startTransition, useEffect, useMemo, useState } from "react";

const PHRASES: { line: string; whisper: string }[] = [
  {
    line: "the color of waiting",
    whisper: "a threshold you can almost touch",
  },
  {
    line: "rain after conversation",
    whisper: "glass cooling, breath still warm",
  },
  {
    line: "a room holding afternoon light",
    whisper: "dust slow enough to name",
  },
  {
    line: "things we forgot softly",
    whisper: "they hum anyway, low",
  },
  {
    line: "Sunday tea and distant voices",
    whisper: "the kettle outlives the news",
  },
  {
    line: "dust floating through blue curtains",
    whisper: "a small weather inside the house",
  },
  {
    line: "letters never sent",
    whisper: "ink drying in another season",
  },
  {
    line: "the quiet between two trains",
    whisper: "platform, breath, someone’s scarf",
  },
];

type FragmentKind =
  | "note"
  | "polaroid"
  | "typewriter"
  | "tape"
  | "scrap"
  | "journal"
  | "photo";

type MemoryFragment = {
  id: string;
  kind: FragmentKind;
  xPct: number;
  yPct: number;
  wPx: number;
  rotate: number;
  driftX: number[];
  driftY: number[];
  rotateDrift: number[];
  duration: number;
  delay: number;
  line: string;
  whisper: string;
  z: number;
  opacityPulse: [number, number, number, number];
  blurIdle: number;
};

type BotanicalSprig = {
  id: string;
  xPct: number;
  yPct: number;
  scale: number;
  rotate: number;
  driftX: number[];
  driftY: number[];
  rotateDrift: number[];
  duration: number;
  delay: number;
  opacity: [number, number, number, number];
  z: number;
  variant: number;
};

function mulberry32(seed: number) {
  return function next() {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function rand(rng: () => number, a: number, b: number) {
  return a + rng() * (b - a);
}

function pickKinds(n: number, rng: () => number): FragmentKind[] {
  const pool: FragmentKind[] = [
    "note",
    "polaroid",
    "typewriter",
    "tape",
    "scrap",
    "journal",
    "photo",
    "note",
    "tape",
    "polaroid",
  ];
  const out: FragmentKind[] = [];
  for (let i = 0; i < n; i++) {
    out.push(pool[Math.floor(rng() * pool.length)] ?? "note");
  }
  return out;
}

function buildFragments(mobile: boolean, rng: () => number): MemoryFragment[] {
  const n = mobile ? 9 : 15;
  const kinds = pickKinds(n, rng);
  const used = new Set<number>();

  const takePhrase = () => {
    let idx = Math.floor(rng() * PHRASES.length);
    let guard = 0;
    while (used.has(idx) && guard++ < 24) {
      idx = Math.floor(rng() * PHRASES.length);
    }
    used.add(idx);
    return PHRASES[idx] ?? PHRASES[0];
  };

  const items: MemoryFragment[] = [];

  for (let i = 0; i < n; i++) {
    const angle = i * 137.5 + rand(rng, -20, 55);
    const rad = (mobile ? 26 : 20) + rand(rng, 0, 38);
    const xPct =
      48 +
      Math.cos((angle * Math.PI) / 180) * rad * 0.62 +
      rand(rng, -22, 22);
    const yPct =
      50 +
      Math.sin((angle * Math.PI) / 180) * rad * 0.48 +
      rand(rng, -26, 26);
    const phrase = takePhrase();
    const driftAmpX = 5 + rng() * 12;
    const driftAmpY = 7 + rng() * 16;
    const r0 = -11 + rng() * 22;

    items.push({
      id: `frag-${i}-${Math.floor(rng() * 1e9).toString(36)}`,
      kind: kinds[i] ?? "note",
      xPct: Math.min(97, Math.max(3, xPct)),
      yPct: Math.min(94, Math.max(6, yPct)),
      wPx: mobile ? 92 + rng() * 80 : 108 + rng() * 120,
      rotate: r0,
      driftX: [0, driftAmpX * (rng() < 0.5 ? 1 : -1), driftAmpX * 0.35, 0],
      driftY: [0, -driftAmpY * 0.75, driftAmpY * 0.55, 0],
      rotateDrift: [r0, r0 + 2.2 * rng(), r0 - 1.4 * rng(), r0],
      duration: 24 + rng() * 28,
      delay: rng() * 5,
      line: phrase.line,
      whisper: phrase.whisper,
      z: 18 + Math.floor(rng() * 48),
      opacityPulse: [
        0.38 + rng() * 0.18,
        0.68 + rng() * 0.14,
        0.44 + rng() * 0.12,
        0.38 + rng() * 0.18,
      ] as [number, number, number, number],
      blurIdle: rng() > 0.62 ? 0.25 + rng() * 0.35 : 0,
    });
  }

  return items;
}

function buildBotanicals(mobile: boolean, rng: () => number): BotanicalSprig[] {
  const n = mobile ? 5 : 8;
  const items: BotanicalSprig[] = [];
  for (let i = 0; i < n; i++) {
    const r0 = -25 + rng() * 50;
    const driftAmpX = 3 + rng() * 8;
    const driftAmpY = 5 + rng() * 12;
    items.push({
      id: `bot-${i}-${Math.floor(rng() * 1e9).toString(36)}`,
      xPct: rand(rng, 4, 96),
      yPct: rand(rng, 8, 92),
      scale: 0.55 + rng() * 0.85,
      rotate: r0,
      driftX: [0, driftAmpX * (rng() < 0.5 ? 1 : -1), driftAmpX * 0.3, 0],
      driftY: [0, -driftAmpY * 0.6, driftAmpY * 0.45, 0],
      rotateDrift: [r0, r0 + 4 * rng(), r0 - 3 * rng(), r0],
      duration: 32 + rng() * 36,
      delay: rng() * 6,
      opacity: [0.12, 0.28, 0.16, 0.12] as [number, number, number, number],
      z: 2 + Math.floor(rng() * 8),
      variant: Math.floor(rng() * 3),
    });
  }
  return items;
}

export type FloatingMemoryArchiveProps = {
  onActivate: () => void;
  /** Appended to each fragment’s aria-label after the mood line */
  activateAriaHint?: string;
};

export function FloatingMemoryArchive({
  onActivate,
  activateAriaHint = "Go to collage table.",
}: FloatingMemoryArchiveProps) {
  const reduce = useReducedMotion();
  const [fragments, setFragments] = useState<MemoryFragment[] | null>(null);
  const [botanicals, setBotanicals] = useState<BotanicalSprig[] | null>(null);

  useEffect(() => {
    startTransition(() => {
      const mobile = window.innerWidth < 640;
      const seed =
        ((typeof performance !== "undefined" ? performance.now() : 0) ^
          (Math.random() * 0xffffffff)) >>>
        0;
      const rng = mulberry32(seed >>> 0);
      setFragments(buildFragments(mobile, rng));
      setBotanicals(buildBotanicals(mobile, rng));
    });
  }, []);

  const easeDrift = useMemo(() => [0.42, 0, 0.58, 1] as const, []);

  return (
    <>
      {!fragments && (
        <p className="font-body px-6 pt-16 text-left text-sm italic text-ink-soft/60">
          the room gathers its breath…
        </p>
      )}

      {botanicals?.map((b) => (
        <BotanicalPiece key={b.id} b={b} reduce={!!reduce} easeDrift={easeDrift} />
      ))}

      {fragments?.map((f) => (
        <FragmentPiece
          key={f.id}
          f={f}
          reduce={!!reduce}
          easeDrift={easeDrift}
          onActivate={onActivate}
          activateAriaHint={activateAriaHint}
        />
      ))}
    </>
  );
}

function BotanicalPiece({
  b,
  reduce,
  easeDrift,
}: {
  b: BotanicalSprig;
  reduce: boolean;
  easeDrift: readonly [number, number, number, number];
}) {
  return (
    <motion.div
      className="pointer-events-none absolute text-sage/50"
      style={{
        left: `${b.xPct}%`,
        top: `${b.yPct}%`,
        width: 72 * b.scale,
        height: 108 * b.scale,
        zIndex: b.z,
        transform: "translate(-50%, -50%)",
      }}
      aria-hidden
      initial={{ opacity: 0 }}
      animate={
        reduce
          ? { opacity: 0.2, x: 0, y: 0, rotate: b.rotate }
          : {
              opacity: b.opacity,
              x: b.driftX,
              y: b.driftY,
              rotate: b.rotateDrift,
            }
      }
      transition={
        reduce
          ? { duration: 0.8 }
          : {
              opacity: {
                duration: b.duration * 0.9,
                repeat: Infinity,
                ease: "easeInOut",
                delay: b.delay,
              },
              x: {
                duration: b.duration * 1.05,
                repeat: Infinity,
                ease: easeDrift,
                delay: b.delay,
              },
              y: {
                duration: b.duration * 1.12,
                repeat: Infinity,
                ease: easeDrift,
                delay: b.delay + 0.5,
              },
              rotate: {
                duration: b.duration * 1.2,
                repeat: Infinity,
                ease: easeDrift,
                delay: b.delay,
              },
            }
      }
    >
      <SprigSvg variant={b.variant} />
    </motion.div>
  );
}

function SprigSvg({ variant }: { variant: number }) {
  if (variant === 0) {
    return (
      <svg viewBox="0 0 80 120" className="h-full w-full" fill="none">
        <path
          d="M40 8 C28 48 22 88 40 118"
          stroke="currentColor"
          strokeWidth="1.1"
          className="text-sage/45"
          strokeLinecap="round"
        />
        <ellipse
          cx="28"
          cy="42"
          rx="14"
          ry="7"
          transform="rotate(-38 28 42)"
          className="fill-sage/30"
        />
        <ellipse
          cx="52"
          cy="58"
          rx="12"
          ry="6"
          transform="rotate(42 52 58)"
          className="fill-sage/22"
        />
        <ellipse
          cx="34"
          cy="78"
          rx="11"
          ry="5"
          transform="rotate(-22 34 78)"
          className="fill-sage/18"
        />
      </svg>
    );
  }
  if (variant === 1) {
    return (
      <svg viewBox="0 0 90 100" className="h-full w-full" fill="none">
        <path
          d="M45 6 Q20 50 48 96"
          stroke="currentColor"
          strokeWidth="0.9"
          className="text-sage/35"
          strokeLinecap="round"
        />
        <ellipse
          cx="30"
          cy="36"
          rx="16"
          ry="8"
          transform="rotate(-50 30 36)"
          className="fill-blush/25"
        />
        <ellipse
          cx="58"
          cy="52"
          rx="13"
          ry="6"
          transform="rotate(48 58 52)"
          className="fill-sage/20"
        />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 70 90" className="h-full w-full" fill="none">
      <path
        d="M35 4 L35 86"
        stroke="currentColor"
        strokeWidth="0.85"
        className="text-ink-soft/25"
        strokeLinecap="round"
      />
      <circle cx="22" cy="32" r="5" className="fill-sage/28" />
      <circle cx="48" cy="44" r="4.5" className="fill-sage/22" />
      <circle cx="30" cy="58" r="4" className="fill-blush/20" />
    </svg>
  );
}

function FragmentPiece({
  f,
  reduce,
  easeDrift,
  onActivate,
  activateAriaHint,
}: {
  f: MemoryFragment;
  reduce: boolean;
  easeDrift: readonly [number, number, number, number];
  onActivate: () => void;
  activateAriaHint: string;
}) {
  return (
    <motion.button
      type="button"
      layout={false}
      aria-label={`${f.line}. ${activateAriaHint}`}
      className="group absolute cursor-pointer border-0 bg-transparent p-0 text-left outline-none focus-visible:ring-2 focus-visible:ring-ink/20 focus-visible:ring-offset-4 focus-visible:ring-offset-paper"
      style={{
        left: `${f.xPct}%`,
        top: `${f.yPct}%`,
        width: f.wPx,
        maxWidth: "min(88vw, 300px)",
        zIndex: f.z,
        transform: "translate(-50%, -50%)",
      }}
      onClick={onActivate}
      initial={{ opacity: 0 }}
      animate={
        reduce
          ? { opacity: 1, x: 0, y: 0, rotate: f.rotate }
          : {
              opacity: f.opacityPulse,
              x: f.driftX,
              y: f.driftY,
              rotate: f.rotateDrift,
            }
      }
      transition={
        reduce
          ? { duration: 0.6 }
          : {
              opacity: {
                duration: f.duration * 0.85,
                repeat: Infinity,
                ease: "easeInOut",
                delay: f.delay,
              },
              x: {
                duration: f.duration,
                repeat: Infinity,
                ease: easeDrift,
                delay: f.delay,
              },
              y: {
                duration: f.duration * 1.08,
                repeat: Infinity,
                ease: easeDrift,
                delay: f.delay + 0.4,
              },
              rotate: {
                duration: f.duration * 1.15,
                repeat: Infinity,
                ease: easeDrift,
                delay: f.delay,
              },
            }
      }
      whileHover={
        reduce
          ? {}
          : {
              scale: 1.06,
              transition: { duration: 0.85, ease: easeDrift },
            }
      }
      whileTap={{ scale: 0.97 }}
    >
      <div
        className={`relative transition-[box-shadow,filter] duration-[1000ms] ease-out group-hover:shadow-[0_0_48px_rgba(232,212,207,0.5),10px_32px_52px_rgba(61,56,50,0.14)] ${
          f.blurIdle > 0 ? "blur-[0.35px] group-hover:blur-none" : ""
        }`}
      >
        <div className="pointer-events-none absolute -inset-4 rounded-[45%] bg-blush/0 opacity-0 blur-3xl transition-opacity duration-[1000ms] group-hover:bg-blush/20 group-hover:opacity-100" />

        {f.kind === "note" && <PieceNote f={f} />}
        {f.kind === "polaroid" && <PiecePolaroid f={f} />}
        {f.kind === "typewriter" && <PieceTypewriter f={f} />}
        {f.kind === "tape" && <PieceTape f={f} />}
        {f.kind === "scrap" && <PieceScrap f={f} />}
        {f.kind === "journal" && <PieceJournal f={f} />}
        {f.kind === "photo" && <PiecePhoto f={f} />}
      </div>
    </motion.button>
  );
}

function PieceNote({ f }: { f: MemoryFragment }) {
  return (
    <div className="torn relative bg-gradient-to-br from-cream/95 to-paper-deep/78 px-4 py-4 shadow-[6px_24px_42px_rgba(61,56,50,0.12)] ring-1 ring-ink/6">
      <p className="font-hand-indie text-[clamp(1rem,2.2vw,1.28rem)] leading-snug text-ink/88">
        {f.line}
      </p>
      <p className="font-body mt-3 max-h-0 overflow-hidden text-xs italic leading-relaxed text-ink-soft opacity-0 transition-[max-height,opacity,margin] duration-[1100ms] ease-out group-hover:mt-2 group-hover:max-h-28 group-hover:opacity-100">
        {f.whisper}
      </p>
    </div>
  );
}

function PiecePolaroid({ f }: { f: MemoryFragment }) {
  return (
    <div className="relative rounded-[2px_3px_2px_2px] bg-cream/88 p-2 pb-9 shadow-[8px_28px_46px_rgba(61,56,50,0.15)] ring-1 ring-white/35">
      <div className="relative aspect-[1/1.05] overflow-hidden bg-gradient-to-br from-paper-deep via-blush/22 to-[#cfc4b4] opacity-[0.82]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_32%_22%,rgba(255,255,255,0.32),transparent_55%)] mix-blend-soft-light" />
      </div>
      <p className="font-caption absolute bottom-2 left-2 right-2 text-center text-[0.7rem] leading-tight text-ink/72">
        {f.line}
      </p>
      <p className="font-body pointer-events-none absolute left-2 right-2 top-12 max-h-0 overflow-hidden text-center text-[10px] italic text-ink-soft opacity-0 transition-[max-height,opacity] duration-[1100ms] group-hover:max-h-24 group-hover:opacity-100">
        {f.whisper}
      </p>
    </div>
  );
}

function PieceTypewriter({ f }: { f: MemoryFragment }) {
  return (
    <div className="relative border border-ink/10 bg-paper/75 px-3 py-3 shadow-[4px_18px_30px_rgba(61,56,50,0.08)]">
      <p className="font-editorial text-[10px] uppercase tracking-[0.24em] text-ink-soft/88">
        {f.line}
      </p>
      <p className="font-body mt-2 max-h-0 overflow-hidden text-xs italic leading-relaxed text-ink-soft/78 opacity-0 transition-[max-height,opacity] duration-[1100ms] group-hover:max-h-28 group-hover:opacity-100">
        {f.whisper}
      </p>
    </div>
  );
}

function PieceTape({ f }: { f: MemoryFragment }) {
  return (
    <div
      className="relative px-2 py-4 opacity-[0.88] shadow-sm"
      style={{
        background:
          "linear-gradient(90deg, rgba(250,247,242,0.2) 0%, rgba(232,212,207,0.72) 45%, rgba(245,236,228,0.28) 100%)",
        boxShadow:
          "inset 0 0 0 1px rgba(61,56,50,0.05), 0 2px 8px rgba(61,56,50,0.08)",
      }}
    >
      <p className="font-hand-indie text-center text-sm leading-snug text-ink/78">
        {f.line}
      </p>
      <p className="font-body mt-2 max-h-0 overflow-hidden text-center text-[10px] italic text-ink-soft opacity-0 transition-[max-height,opacity] duration-[1100ms] group-hover:max-h-24 group-hover:opacity-100">
        {f.whisper}
      </p>
    </div>
  );
}

function PieceScrap({ f }: { f: MemoryFragment }) {
  return (
    <div className="torn h-24 w-full bg-gradient-to-br from-paper-deep/88 to-[#c9bba8]/88 opacity-80 shadow-md ring-1 ring-ink/5">
      <p className="font-hand-indie absolute inset-x-2 bottom-3 text-xs leading-snug text-ink/78">
        {f.line}
      </p>
      <p className="font-body absolute inset-x-2 top-2 max-h-0 overflow-hidden text-[10px] italic text-ink-soft opacity-0 transition-[max-height,opacity] duration-[1100ms] group-hover:max-h-20 group-hover:opacity-100">
        {f.whisper}
      </p>
    </div>
  );
}

function PieceJournal({ f }: { f: MemoryFragment }) {
  return (
    <div className="relative min-h-[5.5rem] border border-ink/8 bg-cream/65 px-3 py-3 shadow-inner">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.1]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 11px, rgba(61,56,50,0.055) 11px, rgba(61,56,50,0.055) 12px)",
        }}
      />
      <p className="font-body relative text-sm italic leading-relaxed text-ink/82">
        {f.line}
      </p>
      <p className="font-body relative mt-2 max-h-0 overflow-hidden text-xs text-ink-soft opacity-0 transition-[max-height,opacity] duration-[1100ms] group-hover:max-h-24 group-hover:opacity-100">
        {f.whisper}
      </p>
    </div>
  );
}

function PiecePhoto({ f }: { f: MemoryFragment }) {
  return (
    <div className="relative">
      <div className="absolute inset-0 translate-x-2 translate-y-2 rotate-2 rounded-sm bg-ink/8 opacity-35 blur-[0.5px]" />
      <div className="relative overflow-hidden rounded-[2px] border border-white/45 bg-gradient-to-br from-paper-deep/45 to-blush/28 opacity-[0.68] shadow-[6px_22px_38px_rgba(61,56,50,0.14)] ring-1 ring-ink/8">
        <div className="aspect-[4/5] w-full bg-[radial-gradient(ellipse_at_50%_38%,rgba(255,252,248,0.35),transparent_62%)]" />
        <p className="font-caption absolute bottom-2 left-2 right-2 text-center text-[0.68rem] text-ink/68">
          {f.line}
        </p>
      </div>
      <p className="font-body relative z-10 mt-2 max-h-0 overflow-hidden text-center text-[10px] italic text-ink-soft opacity-0 transition-[max-height,opacity] duration-[1100ms] group-hover:max-h-24 group-hover:opacity-100">
        {f.whisper}
      </p>
    </div>
  );
}
