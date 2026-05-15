import type { CompositionModeId } from "./collageCompositionModes";
import type { CanvasCompositionKind } from "./collageCanvasFormats";
import type { LayoutProfile, StyleLayoutHints } from "./collageStylePresets";
import {
  RISO_INK_TREATMENT_IDS,
  type RisoInkTreatmentId,
} from "./collageRisoTreatments";
import {
  buildPiecePaperEdge,
  type TearEdgeProfile,
} from "./collageTornEdges";

export type PieceTier = 0 | 1 | 2;

export type PieceLayout = {
  xPct: number;
  yPct: number;
  widthPct: number;
  heightPct: number;
  rotate: number;
  zIndex: number;
  opacity: number;
  behindScale: number;
  behindRotate: number;
  imageBlurPx: number;
  floatYOffsetPx: number;
  layerShadow: string;
  tier: PieceTier;
  /** Unique procedural clip-path + analog edge treatment params */
  clipPathCss: string;
  edgeDisplacementSeed: number;
  edgeDisplacementScale: number;
  edgeNoiseBaseFrequency: number;
  edgeNoiseOctaves: number;
  curlCorner: 0 | 1 | 2 | 3;
  edgeVignetteOpacity: number;
  wrinkleOpacity: number;
  /** Riso Dream — per-print ink / contrast path */
  risoInkTreatment?: RisoInkTreatmentId;
};

export type TapeLayout = {
  leftPct: number;
  topPct: number;
  width: number;
  height: number;
  rotate: number;
  opacity: number;
  zIndex: number;
  /** Semi-transparent masking vs matte paper-strip tape */
  tapeKind: "masking" | "opaque";
};

export type ScrapLayout = {
  leftPct: number;
  topPct: number;
  w: number;
  h: number;
  rotate: number;
  zIndex: number;
  bg: string;
};

export type CollageLayoutOptions = {
  /** Fewer decorative scraps & tape strips (phones / tablets). */
  liteDecor?: boolean;
  /** Softer SVG edge displacement + less micro-blur (phones). */
  liteRender?: boolean;
};

export type CollageLayoutResult = {
  pieces: PieceLayout[];
  tapes: TapeLayout[];
  scraps: ScrapLayout[];
  captionTilt: number;
  captionLeftPct: number;
  captionTopPct: number;
  focalIndex: number;
  imagePermutation: number[];
};

function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(initial: number) {
  let seed = initial;
  return function next() {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function rand(rng: () => number, a: number, b: number) {
  return a + rng() * (b - a);
}

function styleRotation(rng: () => number, range: number) {
  return -range + rng() * 2 * range;
}

function shuffleInPlace<T>(arr: T[], rng: () => number) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

const SHADOW_FOCAL = [
  "0 2px 3px rgba(24,20,18,0.14), 8px 18px 32px rgba(38,32,28,0.22), 20px 48px 68px rgba(22,18,16,0.36), 0 0 0 1px rgba(255,252,248,0.14)",
  "0 1px 2px rgba(28,24,20,0.12), 10px 22px 38px rgba(42,36,32,0.2), 18px 44px 64px rgba(26,22,18,0.34), -1px -1px 0 rgba(255,252,248,0.08)",
  "0 3px 5px rgba(22,18,16,0.16), 12px 28px 46px rgba(34,30,26,0.24), 22px 52px 72px rgba(30,26,22,0.32), inset 0 -1px 0 rgba(255,252,248,0.1)",
];

const SHADOW_SECONDARY = [
  "0 1px 2px rgba(45,40,35,0.12), 8px 22px 40px rgba(48,42,36,0.26), 3px 10px 22px rgba(55,48,42,0.14)",
  "6px 20px 36px rgba(52,46,40,0.24), 0 0 0 1px rgba(255,252,248,0.06), 2px 6px 14px rgba(58,52,46,0.12)",
  "10px 28px 44px rgba(42,38,32,0.26), 4px 12px 24px rgba(55,50,45,0.15)",
  "4px 16px 32px rgba(58,52,46,0.2), 10px 32px 50px rgba(40,36,30,0.18)",
];

const SHADOW_TERTIARY = [
  "0 1px 1px rgba(55,50,45,0.1), 3px 10px 22px rgba(58,52,46,0.16), 0 0 0 1px rgba(255,252,248,0.05)",
  "2px 8px 18px rgba(52,48,42,0.15), 1px 3px 8px rgba(58,54,48,0.1)",
  "4px 14px 26px rgba(50,45,40,0.17)",
  "1px 4px 12px rgba(58,54,48,0.12), 6px 16px 28px rgba(48,44,38,0.14)",
];

/** Riso / flat print depth — overlap & color carry depth, not paper loft */
const SHADOW_RISO_FOCAL = [
  "0 1px 3px rgba(26,58,118,0.22), 1px 2px 0 rgba(255,60,152,0.08)",
  "0 0 0 1px rgba(255,255,255,0.12), 2px 10px 20px rgba(28,52,122,0.14)",
];
const SHADOW_RISO_SECONDARY = [
  "0 1px 2px rgba(42,92,148,0.14), 1px 1px 0 rgba(255,200,105,0.06)",
  "1px 8px 16px rgba(38,72,138,0.11)",
];
const SHADOW_RISO_TERTIARY = [
  "0 1px 1px rgba(48,108,172,0.08)",
  "1px 5px 12px rgba(72,112,172,0.06)",
];

/** Scrunched paper scraps: contact shadow scales with stacking height */
export const SCRAP_SHADOW_DEPTH_LOW =
  "1px 3px 7px rgba(44,38,34,0.11), 0 0 0 1px rgba(62,56,48,0.04)";
export const SCRAP_SHADOW_DEPTH_MID =
  "2px 8px 16px rgba(45,40,35,0.16), 1px 4px 11px rgba(52,46,42,0.12), 0 0 0 1px rgba(255,252,246,0.06)";
export const SCRAP_SHADOW_DEPTH_HIGH =
  "4px 14px 30px rgba(38,34,28,0.22), 2px 7px 18px rgba(48,42,38,0.15), 0 1px 0 rgba(255,252,248,0.2)";

export function scrapMaterialShadow(zIndex: number): string {
  if (zIndex < 20) return SCRAP_SHADOW_DEPTH_LOW;
  if (zIndex < 56) return SCRAP_SHADOW_DEPTH_MID;
  return SCRAP_SHADOW_DEPTH_HIGH;
}

/** Flat ink-block scraps — no deep paper lift */
export function scrapMaterialShadowRiso(zIndex: number): string {
  if (zIndex < 20) {
    return "1px 3px 8px rgba(28,72,132,0.07), 0 0 0 1px rgba(255,255,252,0.05)";
  }
  return "1px 5px 12px rgba(38,58,122,0.09), 0 1px 0 rgba(255,90,160,0.06)";
}

/** Prefer a photo corner — tape crosses the stack like real masking tape */
function placeTapeOnPieceCorner(
  pieces: PieceLayout[],
  focalIndex: number,
  rng: () => number,
): { leftPct: number; topPct: number } | null {
  if (!pieces.length) return null;
  const biasFocal = rng() < 0.68;
  const idx =
    biasFocal && pieces[focalIndex] !== undefined
      ? focalIndex
      : Math.floor(rng() * pieces.length);
  const p = pieces[idx]!;
  const halfW = p.widthPct / 2;
  const halfH = p.heightPct / 2;
  const corner = Math.floor(rng() * 4);
  const along = rand(rng, 0.42, 0.58);
  const off = rand(rng, -2.8, 2.8);

  let leftPct = p.xPct;
  let topPct = p.yPct;
  switch (corner) {
    case 0: {
      const legX = halfW * 0.88 * along;
      const legY = -halfH * 0.82 * (1 - along);
      leftPct += -halfW + legX + off;
      topPct += -halfH + legY + off * 0.6;
      break;
    }
    case 1: {
      leftPct += halfW * (0.75 - along * 0.55) + off;
      topPct += -halfH * (0.2 + along * 0.65) + off * 0.5;
      break;
    }
    case 2: {
      leftPct += -halfW * (0.15 + along * 0.7) + off;
      topPct += halfH * (0.72 - along * 0.52) + off * 0.55;
      break;
    }
    default: {
      leftPct += halfW * (0.62 - along * 0.52) + off;
      topPct += halfH * (-0.12 + along * 0.78) + off * 0.5;
      break;
    }
  }

  leftPct += rand(rng, -1.6, 1.6);
  topPct += rand(rng, -1.6, 1.6);
  return {
    leftPct: clamp(leftPct, 6, 94),
    topPct: clamp(topPct, 6, 94),
  };
}

/** % margin from paper edge — photo centers clamped so full bbox stays inside */
const PHOTO_PAPER_INSET = 7;

function clampPhotoCenterInsidePaper(p: PieceLayout, inset: number) {
  const hw = p.widthPct * 0.5;
  const hh = p.heightPct * 0.5;
  p.xPct = clamp(p.xPct, inset + hw, 100 - inset - hw);
  p.yPct = clamp(p.yPct, inset + hh, 100 - inset - hh);
}

/** Nudge satellites toward the focal for light overlap / hand-assembled tension */
function biasPiecesTowardFocalOverlap(
  pieces: PieceLayout[],
  focal: number,
  rng: () => number,
) {
  const fp = pieces[focal];
  if (!fp) return;
  for (let i = 0; i < pieces.length; i++) {
    if (i === focal) continue;
    if (rng() > 0.33) continue;
    const dx = fp.xPct - pieces[i]!.xPct;
    const dy = fp.yPct - pieces[i]!.yPct;
    const pull = rand(rng, 0.05, 0.14);
    pieces[i]!.xPct += dx * pull;
    pieces[i]!.yPct += dy * pull;
    pieces[i]!.rotate += styleRotation(rng, 2.4 + rng() * 2);
  }
}

function nudgePhotosOffPaperRim(
  pieces: PieceLayout[],
  rng: () => number,
  inset: number,
) {
  const rim = inset + 5;
  for (const p of pieces) {
    const onRimX = p.xPct < rim || p.xPct > 100 - rim;
    const onRimY = p.yPct < rim || p.yPct > 100 - rim;
    if (!onRimX && !onRimY) continue;
    const dx = 50 - p.xPct;
    const dy = 50 - p.yPct;
    const len = Math.hypot(dx, dy) || 1;
    const pull = rand(rng, 2.5, 8);
    p.xPct += (dx / len) * pull;
    p.yPct += (dy / len) * pull;
  }
}

function containAllPhotosOnPaper(pieces: PieceLayout[], rng: () => number) {
  for (const p of pieces) {
    clampPhotoCenterInsidePaper(p, PHOTO_PAPER_INSET);
  }
  nudgePhotosOffPaperRim(pieces, rng, PHOTO_PAPER_INSET);
  for (const p of pieces) {
    clampPhotoCenterInsidePaper(p, PHOTO_PAPER_INSET);
  }
}

function finalizePiecePositions(
  pieces: PieceLayout[],
  focal: number,
  rng: () => number,
  opts?: { skipOverlapBias?: boolean },
) {
  if (!opts?.skipOverlapBias) {
    biasPiecesTowardFocalOverlap(pieces, focal, rng);
  }
  containAllPhotosOnPaper(pieces, rng);
}

function pickLayerShadowForTier(
  hints: StyleLayoutHints,
  tier: PieceTier,
  rng: () => number,
): string {
  const flat = hints.layoutProfile === "riso-graphic";
  if (flat) {
    const pool =
      tier === 0 ? SHADOW_RISO_FOCAL : tier === 1 ? SHADOW_RISO_SECONDARY : SHADOW_RISO_TERTIARY;
    return pool[Math.floor(rng() * pool.length)] ?? pool[0];
  }
  if (tier === 0) {
    return SHADOW_FOCAL[Math.floor(rng() * SHADOW_FOCAL.length)] ?? SHADOW_FOCAL[0];
  }
  if (tier === 1) {
    return (
      SHADOW_SECONDARY[Math.floor(rng() * SHADOW_SECONDARY.length)] ??
      SHADOW_SECONDARY[0]
    );
  }
  return (
    SHADOW_TERTIARY[Math.floor(rng() * SHADOW_TERTIARY.length)] ??
    SHADOW_TERTIARY[0]
  );
}

function basePieceFields(
  rng: () => number,
  hints: StyleLayoutHints,
  rotCap: number,
  tier: PieceTier,
): Omit<
  PieceLayout,
  "xPct" | "yPct" | "widthPct" | "heightPct" | "rotate" | "zIndex" | "tier"
> {
  const profile: TearEdgeProfile =
    hints.tearEdgeIntensity === "riso"
      ? "riso"
      : hints.tearEdgeIntensity === "xerox"
        ? "xerox"
        : hints.tearEdgeIntensity === "painted"
          ? "painted"
          : "archive";
  const paper = buildPiecePaperEdge(rng, profile);
  const opacity =
    tier === 0
      ? clamp(0.9 + rng() * 0.07, 0.88, 0.98)
      : tier === 1
        ? clamp(0.86 + rng() * 0.09, 0.82, 0.97)
        : clamp(0.8 + rng() * 0.12, 0.74, 0.95);
  return {
    opacity,
    behindScale:
      hints.behindScaleMin +
      rng() * (hints.behindScaleMax - hints.behindScaleMin),
    behindRotate: styleRotation(rng, rotCap * (tier === 2 ? 1.05 : 0.92)),
    imageBlurPx:
      tier === 2 && rng() > 0.88
        ? 0.05 + rng() * 0.14
        : rng() > 0.92
          ? 0
          : 0.015 + rng() * 0.07,
    floatYOffsetPx: 0,
    layerShadow: pickLayerShadowForTier(hints, tier, rng),
    ...paper,
  };
}

function rotCapForMode(mode: CompositionModeId, hints: StyleLayoutHints): number {
  switch (mode) {
    case "chaotic":
      return Math.max(hints.rotationRange, 24);
    case "minimal":
      return Math.min(hints.rotationRange + 1, 8);
    case "editorial-zine":
      return Math.max(hints.rotationRange, 12);
    case "gallery-wall":
      return hints.rotationRange + 5;
    default:
      return hints.rotationRange + (mode === "poetic" ? 5 : 2);
  }
}

function decorScale(mode: CompositionModeId) {
  switch (mode) {
    case "minimal":
      return { tape: 0.48, scrap: 0.42 };
    case "chaotic":
      return { tape: 1.4, scrap: 1.45 };
    case "poetic":
      return { tape: 1.08, scrap: 1.12 };
    case "gallery-wall":
      return { tape: 0.82, scrap: 0.72 };
    case "floating-memory":
      return { tape: 1.18, scrap: 1.22 };
    case "editorial-zine":
      return { tape: 0.92, scrap: 0.58 };
    default:
      return { tape: 1, scrap: 1 };
  }
}

/**
 * Nuanced depth: focal usually reads first but does not tower over everything;
 * occasional accents float above for handmade / zine layering.
 */
function assignOrganicZ(
  pieces: PieceLayout[],
  focalIndex: number,
  rng: () => number,
  layoutProfile?: LayoutProfile,
) {
  const illustrated = layoutProfile === "illustrated-surreal";
  const riso = layoutProfile === "riso-graphic";
  const many = pieces.length >= 6;
  const others = pieces.map((_, i) => i).filter((i) => i !== focalIndex);
  shuffleInPlace(others, rng);
  const low = illustrated ? 18 : riso ? 24 : 20;
  const high = illustrated ? 48 : riso ? 40 : 44;
  const zs = others.map(() => low + Math.floor(rng() * (high - low)));
  zs.sort((a, b) => a - b);
  others.forEach((idx, rank) => {
    pieces[idx].zIndex = zs[rank] ?? 34;
  });
  const maxOther = others.reduce(
    (m, i) => Math.max(m, pieces[i].zIndex),
    0,
  );

  /** With many photos, keep focal lift gentler so fewer prints sit fully underneath. */
  const focalLift = illustrated
    ? 2 + Math.floor(rng() * 3)
    : riso
      ? 3 + Math.floor(rng() * 3)
      : many
        ? 2 + Math.floor(rng() * 4)
        : 4 + Math.floor(rng() * 6);
  pieces[focalIndex].zIndex = maxOther + focalLift;

  const accentChance = illustrated ? 0.18 : riso ? 0.08 : many ? 0.12 : 0.28;
  if (others.length > 0 && rng() < accentChance) {
    const accent = others[Math.floor(rng() * others.length)]!;
    if (rng() < 0.55) {
      pieces[accent].zIndex = pieces[focalIndex].zIndex + 1 + Math.floor(rng() * 5);
    } else {
      pieces[focalIndex].zIndex = maxOther - 1 + Math.floor(rng() * 5);
      pieces[accent].zIndex = maxOther + 6 + Math.floor(rng() * 8);
    }
  }
}

function assignRisoInkTreatments(
  pieces: PieceLayout[],
  focalIdx: number,
  rng: () => number,
) {
  const pool = [...RISO_INK_TREATMENT_IDS];
  shuffleInPlace(pool, rng);
  const vivid: RisoInkTreatmentId[] = [
    "magenta_flare",
    "cyan_veil",
    "ember_burst",
    "cutout_ink",
  ];
  const fp = pieces[focalIdx];
  if (fp) {
    fp.risoInkTreatment =
      rng() < 0.62
        ? vivid[Math.floor(rng() * vivid.length)]!
        : pool[Math.floor(rng() * pool.length)]!;
  }
  let u = Math.floor(rng() * pool.length);
  for (let i = 0; i < pieces.length; i++) {
    if (i === focalIdx) continue;
    const p = pieces[i];
    if (p) {
      p.risoInkTreatment = pool[u % pool.length]!;
      u++;
    }
  }
}

function jitter(
  mode: CompositionModeId,
  rng: () => number,
  x: number,
  y: number,
  amt: number,
) {
  const mul =
    mode === "chaotic" ? 1.55 : mode === "minimal" ? 0.38 : 1;
  return [
    x + (rng() - 0.5) * amt * mul,
    y + (rng() - 0.5) * amt * mul,
  ] as const;
}

/** Interest spread across thirds / diagonals — avoids one locked center mass */
function focalFieldAnchor(
  prof: LayoutProfile,
  rng: () => number,
): { fx: number; fy: number } {
  switch (prof) {
    case "right-weighted-poster":
      return { fx: rand(rng, 52, 66), fy: rand(rng, 36, 64) };
    case "left-weighted-poster":
      return { fx: rand(rng, 34, 48), fy: rand(rng, 36, 64) };
    case "mat-table":
      return { fx: rand(rng, 40, 60), fy: rand(rng, 44, 60) };
    case "rift-diagonal":
      return { fx: rand(rng, 32, 50), fy: rand(rng, 32, 52) };
    case "low-museum":
      return { fx: rand(rng, 38, 62), fy: rand(rng, 48, 70) };
    case "illustrated-surreal":
      return { fx: rand(rng, 32, 68), fy: rand(rng, 28, 68) };
    case "riso-graphic":
      return { fx: rand(rng, 36, 64), fy: rand(rng, 34, 58) };
    case "quiet-open":
    default:
      return { fx: rand(rng, 34, 66), fy: rand(rng, 34, 66) };
  }
}

/** Sweep secondaries along a diagonal / arc for editorial flow */
function diagonalSweepStart(prof: LayoutProfile, rng: () => number): number {
  switch (prof) {
    case "rift-diagonal":
      return rand(rng, -1.05, -0.42) * Math.PI;
    case "low-museum":
      return rand(rng, -0.35, 0.35) * Math.PI;
    case "mat-table":
      return rand(rng, 0.12, 0.58) * Math.PI;
    case "right-weighted-poster":
      return rand(rng, 0.35, 1.05) * Math.PI;
    case "left-weighted-poster":
      return rand(rng, -1.12, -0.48) * Math.PI;
    case "illustrated-surreal":
      return rand(rng, -0.25, 0.25) * Math.PI;
    case "riso-graphic":
      return rand(rng, -0.92, -0.15) * Math.PI;
    case "quiet-open":
    default:
      return rng() * Math.PI * 2;
  }
}

function cornerScatter(
  zone: number,
  rng: () => number,
  inset: number,
): { x: number; y: number } {
  const lo = inset + 10;
  const hi = 100 - inset - 10;
  const span = Math.max(6, Math.min(24, (hi - lo) * 0.42));
  switch (zone % 4) {
    case 0:
      return { x: lo + rng() * span, y: lo + rng() * span };
    case 1:
      return { x: hi - rng() * span, y: lo + rng() * span };
    case 2:
      return { x: lo + rng() * span, y: hi - rng() * span };
    default:
      return { x: hi - rng() * span, y: hi - rng() * span };
  }
}

/**
 * Riso / zine poster layout: layered but breathable — skips scrapbook overlap bias so
 * prints stay readable (especially on mobile density).
 */
function placeRisoGraphicPieces(
  mode: CompositionModeId,
  count: number,
  focal: number,
  rng: () => number,
  hints: StyleLayoutHints,
  rotCap: number,
  compositionKind: CanvasCompositionKind,
): PieceLayout[] {
  const pieces: PieceLayout[] = new Array(count);
  const others = Array.from({ length: count }, (_, i) => i).filter(
    (i) => i !== focal,
  );
  shuffleInPlace(others, rng);

  const packed = count >= 6;
  const packedTight = count >= 7;
  const maxSec = Math.max(1, count - 1);
  const secN = clamp(
    Math.floor(
      (count - 1) *
        (packed ? 0.52 + rng() * 0.14 : 0.44 + rng() * 0.16),
    ),
    Math.min(2, maxSec),
    maxSec,
  );
  const secondarySet = new Set(others.slice(0, secN));

  const fw = rand(rng, hints.focalWidthMin, hints.focalWidthMax);
  const fh = rand(rng, hints.focalHeightMin, hints.focalHeightMax);
  const anchor = focalFieldAnchor("riso-graphic", rng);
  let fx = anchor.fx + rand(rng, -10, 10);
  let fy = anchor.fy + rand(rng, -12, 12);
  fx = clamp(fx, 28, 72);
  fy = clamp(fy, 24, 76);

  switch (compositionKind) {
    case "vertical-story":
      fy = lerp(fy, rand(rng, 34, 44), 0.45);
      fx = lerp(fx, 50, 0.22);
      break;
    case "portrait-editorial":
      fy = lerp(fy, rand(rng, 38, 48), 0.4);
      break;
    case "portrait-journal":
      fx = lerp(fx, 50, 0.2);
      fy = lerp(fy, 50, 0.15);
      break;
    case "square-balanced":
      fx = lerp(fx, 50, 0.35);
      fy = lerp(fy, 50, 0.32);
      break;
    case "cinematic-wide":
      fx = lerp(
        fx,
        rng() > 0.5 ? rand(rng, 56, 68) : rand(rng, 32, 44),
        0.36,
      );
      fy = lerp(fy, rand(rng, 40, 56), 0.24);
      break;
    case "portrait-social":
    default:
      break;
  }

  const [fjx, fjy] = jitter(mode, rng, fx, fy, packed ? 10 : 13);
  const focalShrink = packed ? rand(rng, 0.8, 0.9) : rand(rng, 0.88, 0.99);
  let fwSized = fw * focalShrink * rand(rng, 1.02, 1.1);
  let fhSized = fh * focalShrink * rand(rng, 1.02, 1.1);
  let capW = 54;
  let capH = 50;

  switch (compositionKind) {
    case "vertical-story":
      capW = Math.min(capW, 44);
      capH = Math.min(capH + 4, 54);
      break;
    case "portrait-editorial":
      capW = Math.min(capW, 44);
      capH = Math.min(capH + 2, 52);
      break;
    case "portrait-journal":
      capW = Math.min(capW, 48);
      capH = Math.min(capH, 48);
      break;
    case "square-balanced":
      capW = Math.min(capW, 48);
      capH = Math.min(capH, 48);
      break;
    case "cinematic-wide":
      capW = Math.min(capW + 4, 56);
      capH = Math.min(capH, 42);
      break;
    case "portrait-social":
    default:
      break;
  }

  if (packed) {
    const pm = packedTight ? 0.8 : 0.86;
    fwSized *= pm;
    fhSized *= pm;
    capW = Math.min(capW, packedTight ? 44 : 46);
    capH = Math.min(capH, packedTight ? 40 : 44);
  }

  pieces[focal] = {
    ...basePieceFields(rng, hints, rotCap, 0),
    xPct: fjx,
    yPct: fjy,
    widthPct: Math.min(capW, fwSized),
    heightPct: Math.min(capH, fhSized),
    rotate: styleRotation(rng, rotCap * 0.72),
    zIndex: 0,
    floatYOffsetPx: rand(rng, -6, 8),
    tier: 0,
  };

  const focalW = pieces[focal]!.widthPct;
  const diag = diagonalSweepStart("riso-graphic", rng);
  const arcSpread =
    Math.PI * (packed ? 0.62 + rng() * 0.36 : 0.55 + rng() * 0.35);
  const rClear =
    (22 +
      focalW * 0.34 +
      rand(rng, 6, 18) +
      (packed ? 6 + (count - 6) * 2 : 0)) *
    rand(rng, 0.95, 1.08);

  let secRank = 0;
  for (const idx of others) {
    const tier: PieceTier = secondarySet.has(idx) ? 1 : 2;
    let x = 50;
    let y = 50;
    let w = 28;
    let h = 32;

    if (tier === 1) {
      secRank += 1;
      const slot = (secRank - 1) / Math.max(1, secN - 0.001);
      w = rand(rng, hints.secondaryWidthMin, hints.secondaryWidthMax);
      h = rand(rng, hints.secondaryHeightMin, hints.secondaryHeightMax);
      w *= rand(rng, 0.9, 0.98);
      h *= rand(rng, 0.9, 0.98);
      if (packed) {
        w = clamp(
          w * rand(rng, 0.97, 1.04),
          hints.secondaryWidthMin,
          hints.secondaryWidthMax + 2,
        );
        h = clamp(
          h * rand(rng, 0.97, 1.03),
          hints.secondaryHeightMin,
          hints.secondaryHeightMax + 2,
        );
      }

      let angle =
        diag + arcSpread * slot + styleRotation(rng, 0.32 + rng() * 0.18);
      let radX = rClear + rand(rng, 12, 30) * (0.52 + slot * 0.5);
      let radY = rClear * 0.92 + rand(rng, 8, 26) * (0.5 + slot * 0.48);
      if (packed) {
        radX *= rand(rng, 1.04, 1.12);
        radY *= rand(rng, 1.02, 1.1);
      }

      switch (compositionKind) {
        case "vertical-story":
          radX *= 0.76;
          radY *= 1.32;
          if (Math.sin(angle) < -0.12) {
            angle += rand(rng, 0.45, 1.2);
          }
          break;
        case "portrait-editorial":
          radY *= 1.2;
          radX *= 0.88;
          break;
        case "portrait-journal":
          radX *= 1.06;
          radY *= 1.06;
          break;
        case "square-balanced":
          radX *= 0.88;
          radY *= 0.88;
          break;
        case "cinematic-wide":
          radX *= 1.38;
          radY *= 0.7;
          break;
        case "portrait-social":
        default:
          radY *= 1.06;
          radX *= 0.96;
          break;
      }

      x = fx + Math.cos(angle) * radX;
      y = fy + Math.sin(angle) * radY;

      const drift = mode === "chaotic" ? 1.06 : mode === "minimal" ? 0.94 : 1;
      x = fx + (x - fx) * drift;
      y = fy + (y - fy) * drift;
    } else {
      const allowTiny = !packed && rng() < 0.1;
      if (allowTiny) {
        w = rand(rng, 8, 14);
        h = rand(rng, 10, 18);
        w *= rand(rng, 0.85, 0.94);
        h *= rand(rng, 0.85, 0.94);
      } else {
        w = rand(rng, hints.tertiaryWidthMin, hints.tertiaryWidthMax);
        h = rand(rng, hints.tertiaryHeightMin, hints.tertiaryHeightMax);
        w = Math.max(w, packed ? 12 : 11);
        h = Math.max(h, packed ? 13 : 12);
        w *= rand(rng, 0.85, 0.94);
        h *= rand(rng, 0.85, 0.94);
      }

      if (rng() < (packed ? 0.42 : 0.32)) {
        const c = cornerScatter(Math.floor(rng() * 4), rng, PHOTO_PAPER_INSET);
        x = c.x + (rng() - 0.5) * 6;
        y = c.y + (rng() - 0.5) * 6;
      } else {
        const ang = rng() * Math.PI * 2;
        const strandR = rand(rng, packed ? 22 : 16, packed ? 44 : 34);
        let squashX = 0.55 + rng() * 0.2;
        let squashY = 0.46 + rng() * 0.2;
        if (
          compositionKind === "vertical-story" ||
          compositionKind === "portrait-editorial"
        ) {
          squashY *= 1.28;
          squashX *= 0.88;
        } else if (compositionKind === "cinematic-wide") {
          squashX *= 1.28;
          squashY *= 0.85;
        } else if (compositionKind === "square-balanced") {
          squashX = squashY = 0.6 + rng() * 0.1;
        }
        x = 50 + Math.cos(ang) * strandR * squashX;
        y = 50 + Math.sin(ang) * strandR * squashY;
        x += (rng() - 0.5) * 8;
        y += (rng() - 0.5) * 8;
      }
    }

    const jitAmt = tier === 1 ? 14 + rng() * 4 : packed ? 14 + rng() * 3 : 22;
    const [jx, jy] = jitter(mode, rng, x, y, jitAmt);
    pieces[idx] = {
      ...basePieceFields(rng, hints, rotCap, tier),
      xPct: jx,
      yPct: jy,
      widthPct: w,
      heightPct: h,
      rotate: styleRotation(rng, rotCap * (tier === 2 ? 1.02 : 0.82)),
      zIndex: 0,
      floatYOffsetPx:
        tier === 2 ? rand(rng, -10, 12) : rand(rng, -8, 10),
      tier,
    };
  }

  finalizePiecePositions(pieces, focal, rng, { skipOverlapBias: true });
  return pieces;
}

/**
 * Mixed-media illustrated layout: spiral / ribbon flow, strong scale contrast,
 * foreground–background drift — avoids grid columns and “all equal rectangles”.
 */
function placeIllustratedSurrealPieces(
  mode: CompositionModeId,
  count: number,
  focal: number,
  rng: () => number,
  hints: StyleLayoutHints,
  rotCap: number,
  compositionKind: CanvasCompositionKind,
): PieceLayout[] {
  const pieces: PieceLayout[] = new Array(count);
  const others = Array.from({ length: count }, (_, i) => i).filter(
    (i) => i !== focal,
  );
  shuffleInPlace(others, rng);

  const packed = count >= 6;
  const maxSec = Math.max(1, count - 1);
  const secN = clamp(
    Math.floor((count - 1) * (packed ? 0.36 + rng() * 0.12 : 0.28 + rng() * 0.14)),
    1,
    maxSec,
  );
  const secondarySet = new Set(others.slice(0, secN));

  let surrealHero: number | null = null;
  if (count >= 4 && others.length >= 2) {
    const tertiaryPool = others.filter((i) => !secondarySet.has(i));
    const pool = tertiaryPool.length ? tertiaryPool : others;
    surrealHero = pool[Math.floor(rng() * pool.length)]!;
  }

  const anchor = focalFieldAnchor("illustrated-surreal", rng);
  let fx = anchor.fx;
  let fy = anchor.fy;

  switch (compositionKind) {
    case "vertical-story":
      fy = lerp(fy, rand(rng, 32, 42), 0.52);
      fx = lerp(fx, 50, 0.28);
      break;
    case "portrait-editorial":
      fy = lerp(fy, rand(rng, 36, 46), 0.45);
      break;
    case "portrait-journal":
      fx = lerp(fx, 50, 0.22);
      fy = lerp(fy, 50, 0.18);
      break;
    case "square-balanced":
      fx = lerp(fx, 50, 0.42);
      fy = lerp(fy, 50, 0.38);
      break;
    case "cinematic-wide":
      fx = lerp(
        fx,
        rng() > 0.5 ? rand(rng, 58, 70) : rand(rng, 30, 42),
        0.4,
      );
      fy = lerp(fy, rand(rng, 42, 58), 0.26);
      break;
    case "portrait-social":
    default:
      break;
  }

  fx += rand(rng, -10, 10);
  fy += rand(rng, -8, 8);
  fx = clamp(fx, 26, 74);
  fy = clamp(fy, 24, 76);

  const [fjx, fjy] = jitter(mode, rng, fx, fy, packed ? 12 : 16);
  const fw0 = rand(rng, hints.focalWidthMin, hints.focalWidthMax);
  const fh0 = rand(rng, hints.focalHeightMin, hints.focalHeightMax);
  const focalShrink = packed ? rand(rng, 0.78, 0.9) : rand(rng, 0.88, 0.99);
  let capW = 52;
  let capH = 54;
  switch (compositionKind) {
    case "vertical-story":
      capW = Math.min(capW, 44);
      capH = Math.min(capH + 4, 54);
      break;
    case "portrait-editorial":
      capW = Math.min(capW, 44);
      capH = Math.min(capH + 2, 52);
      break;
    case "cinematic-wide":
      capW = Math.min(capW + 4, 54);
      capH = Math.min(capH, 44);
      break;
    default:
      break;
  }

  pieces[focal] = {
    ...basePieceFields(rng, hints, rotCap, 0),
    xPct: fjx,
    yPct: fjy,
    widthPct: Math.min(capW, fw0 * focalShrink * rand(rng, 1.04, 1.12)),
    heightPct: Math.min(capH, fh0 * focalShrink * rand(rng, 1.04, 1.12)),
    rotate: styleRotation(rng, rotCap * 0.86),
    zIndex: 0,
    floatYOffsetPx: rand(rng, -10, 12),
    tier: 0,
  };

  const diag = diagonalSweepStart("illustrated-surreal", rng);
  const fp = pieces[focal]!;
  let spiralI = 0;

  for (const idx of others) {
    spiralI += 1;
    const isHero = surrealHero !== null && idx === surrealHero;
    const tier: PieceTier =
      isHero ? 1 : secondarySet.has(idx) ? 1 : 2;

    let w: number;
    let h: number;
    if (isHero) {
      w = rand(rng, 36, 52);
      h = rand(rng, 26, 42);
    } else if (tier === 1) {
      w = rand(rng, hints.secondaryWidthMin, hints.secondaryWidthMax + 6);
      h = rand(rng, hints.secondaryHeightMin, hints.secondaryHeightMax + 6);
      w *= rand(rng, 0.86, 0.95);
      h *= rand(rng, 0.86, 0.95);
    } else {
      const roll = rng();
      if (roll < 0.24) {
        w = rand(rng, hints.tertiaryWidthMin, hints.tertiaryWidthMin + 10);
        h = rand(rng, hints.tertiaryHeightMin, hints.tertiaryHeightMin + 12);
      } else if (roll < 0.5) {
        w = rand(rng, 26, 42);
        h = rand(rng, 12, 22);
      } else if (roll < 0.74) {
        w = rand(rng, 14, 26);
        h = rand(rng, 30, 48);
      } else {
        w = rand(rng, hints.tertiaryWidthMin, hints.tertiaryWidthMax + 6);
        h = rand(rng, hints.tertiaryHeightMin, hints.tertiaryHeightMax + 8);
      }
      w *= rand(rng, 0.85, 0.94);
      h *= rand(rng, 0.85, 0.94);
    }

    const slot = spiralI / Math.max(1, others.length);
    const theta =
      diag +
      slot * Math.PI * (2.05 + rng() * 0.95) +
      styleRotation(rng, 0.62);
    const rBase = 14 + Math.pow(slot, 0.82) * (packed ? 46 : 54);
    const r = rBase * (0.84 + rng() * 0.38);
    let x = fp.xPct + Math.cos(theta) * r * (0.9 + rng() * 0.2);
    let y =
      fp.yPct +
      Math.sin(theta) * r * (0.78 + rng() * 0.28) * (rng() < 0.5 ? 1.08 : 0.92);

    if (tier === 2 && rng() < 0.48) {
      y += rand(rng, 3, 16);
      x += rand(rng, -18, 18);
    }
    if (tier === 2 && w < 20 && rng() < 0.52) {
      y -= rand(rng, 6, 20);
    }

    if (isHero) {
      x = lerp(
        x,
        rng() > 0.5 ? rand(rng, 68, 90) : rand(rng, 12, 34),
        0.58,
      );
      y = lerp(y, rand(rng, 22, 78), 0.45);
    }

    if (spiralI % 5 === 0) {
      const c = cornerScatter(spiralI, rng, 6);
      x = lerp(x, c.x, 0.22 + rng() * 0.18);
      y = lerp(y, c.y, 0.22 + rng() * 0.18);
    }

    const jit = tier === 2 ? 17 : 12;
    const [jx, jy] = jitter(mode, rng, x, y, jit);
    x = jx;
    y = jy;

    if (tier === 2 && rng() < 0.26) {
      w *= rand(rng, 1.05, 1.28);
      h *= rand(rng, 0.72, 0.92);
    }

    pieces[idx] = {
      ...basePieceFields(rng, hints, rotCap, tier),
      xPct: x,
      yPct: y,
      widthPct: w,
      heightPct: h,
      rotate: styleRotation(rng, rotCap * (tier === 2 ? 1.12 : 0.95)),
      zIndex: 0,
      floatYOffsetPx:
        tier === 2 ? rand(rng, -16, 18) : rand(rng, -12, 14),
      tier,
    };
  }

  finalizePiecePositions(pieces, focal, rng);
  return pieces;
}

/**
 * Field collage: medium focal, satellites on a clearance arc, tertiaries in
 * corners and mid-board — breathable, asymmetrical, journal-like.
 */
function placePiecesUnified(
  mode: CompositionModeId,
  count: number,
  focal: number,
  rng: () => number,
  hints: StyleLayoutHints,
  rotCap: number,
  compositionKind: CanvasCompositionKind,
): PieceLayout[] {
  const pieces: PieceLayout[] = new Array(count);
  const prof: LayoutProfile = hints.layoutProfile;

  if (prof === "illustrated-surreal") {
    return placeIllustratedSurrealPieces(
      mode,
      count,
      focal,
      rng,
      hints,
      rotCap,
      compositionKind,
    );
  }

  if (prof === "riso-graphic") {
    return placeRisoGraphicPieces(
      mode,
      count,
      focal,
      rng,
      hints,
      rotCap,
      compositionKind,
    );
  }

  const others = Array.from({ length: count }, (_, i) => i).filter(
    (i) => i !== focal,
  );
  shuffleInPlace(others, rng);

  const packed = count >= 6;
  const packedTight = count >= 7;

  const maxSec = Math.max(1, count - 1);
  /** More secondaries (medium strips) when packed — fewer stamp-sized hiddens. */
  const secN = clamp(
    Math.floor(
      (count - 1) *
        (packed ? 0.46 + rng() * 0.3 : 0.36 + rng() * 0.44),
    ),
    1,
    maxSec,
  );
  const secondarySet = new Set(others.slice(0, secN));

  const fw = rand(rng, hints.focalWidthMin, hints.focalWidthMax);
  const fh = rand(rng, hints.focalHeightMin, hints.focalHeightMax);
  const anchor = focalFieldAnchor(prof, rng);
  let fx = anchor.fx;
  let fy = anchor.fy;

  switch (prof) {
    case "right-weighted-poster":
      fx += rand(rng, -4, 8);
      fy += rand(rng, -6, 6);
      break;
    case "left-weighted-poster":
      fx -= rand(rng, 2, 10);
      fy += rand(rng, -6, 6);
      break;
    case "mat-table":
      fx += rand(rng, -5, 5);
      fy += rand(rng, -5, 6);
      break;
    case "rift-diagonal":
      fx -= rand(rng, 0, 6);
      fy -= rand(rng, 0, 6);
      break;
    case "low-museum":
      fx += rand(rng, -6, 6);
      fy += rand(rng, -4, 6);
      break;
    case "quiet-open":
    default:
      fx += rand(rng, -6, 6);
      fy += rand(rng, -5, 5);
      break;
  }
  fx = clamp(fx, 26, 74);
  fy = clamp(fy, 22, 78);

  switch (compositionKind) {
    case "vertical-story":
      fy = lerp(fy, rand(rng, 32, 42), 0.52);
      fx = lerp(fx, 50, 0.28);
      break;
    case "portrait-editorial":
      fy = lerp(fy, rand(rng, 36, 46), 0.45);
      break;
    case "portrait-journal":
      fx = lerp(fx, 50, 0.22);
      fy = lerp(fy, 50, 0.18);
      break;
    case "square-balanced":
      fx = lerp(fx, 50, 0.42);
      fy = lerp(fy, 50, 0.38);
      break;
    case "cinematic-wide":
      fx = lerp(
        fx,
        rng() > 0.5 ? rand(rng, 58, 70) : rand(rng, 30, 42),
        0.4,
      );
      fy = lerp(fy, rand(rng, 42, 58), 0.26);
      break;
    case "portrait-social":
    default:
      break;
  }

  const [fjx, fjy] = jitter(mode, rng, fx, fy, packed ? 12 : 15);
  const focalShrink = packed ? rand(rng, 0.74, 0.86) : rand(rng, 0.86, 0.995);
  let fwSized = fw * focalShrink * rand(rng, 1.04, 1.12);
  let fhSized = fh * focalShrink * rand(rng, 1.04, 1.12);
  let capW = prof === "low-museum" && hints.focalWidthMax >= 52 ? 58 : 56;
  let capH = prof === "low-museum" && hints.focalHeightMax >= 52 ? 53 : 52;

  switch (compositionKind) {
    case "vertical-story":
      capW = Math.min(capW, 46);
      capH = Math.min(capH + 5, 56);
      break;
    case "portrait-editorial":
      capW = Math.min(capW, 46);
      capH = Math.min(capH + 3, 54);
      break;
    case "portrait-journal":
      capW = Math.min(capW, 50);
      capH = Math.min(capH + 1, 50);
      break;
    case "square-balanced":
      capW = Math.min(capW, 50);
      capH = Math.min(capH, 50);
      break;
    case "cinematic-wide":
      capW = Math.min(capW + 6, 58);
      capH = Math.min(capH, 44);
      break;
    case "portrait-social":
      capW = Math.min(capW, 50);
      capH = Math.min(capH + 2, 50);
      break;
    default:
      break;
  }

  if (packed) {
    const pm = packedTight ? 0.76 : 0.84;
    fwSized *= pm;
    fhSized *= pm;
    capW = Math.min(capW, packedTight ? 43 : 47);
    capH = Math.min(capH, packedTight ? 38 : 42);
  }

  pieces[focal] = {
    ...basePieceFields(rng, hints, rotCap, 0),
    xPct: fjx,
    yPct: fjy,
    widthPct: Math.min(capW, fwSized),
    heightPct: Math.min(capH, fhSized),
    rotate: styleRotation(rng, rotCap * 0.78),
    zIndex: 0,
    floatYOffsetPx: rand(rng, -8, 10),
    tier: 0,
  };

  const focalW = pieces[focal].widthPct;
  const diag = diagonalSweepStart(prof, rng);
  const arcSpread = Math.PI * (packed ? 0.58 + rng() * 0.42 : 0.52 + rng() * 0.38);
  const rClear =
    (20 +
      focalW * 0.3 +
      rand(rng, 4, 16) +
      (packed ? 8 + (count - 6) * 2.5 : 0)) *
    rand(rng, 0.88, 0.97);

  let secRank = 0;
  for (const idx of others) {
    const tier: PieceTier = secondarySet.has(idx) ? 1 : 2;
    let x = 50;
    let y = 50;
    let w = 28;
    let h = 32;

    if (tier === 1) {
      secRank += 1;
      const slot = (secRank - 1) / Math.max(1, secN - 0.001);
      w = rand(rng, hints.secondaryWidthMin, hints.secondaryWidthMax);
      h = rand(rng, hints.secondaryHeightMin, hints.secondaryHeightMax);
      w *= rand(rng, 0.88, 0.97);
      h *= rand(rng, 0.88, 0.97);
      if (packed) {
        w = clamp(w * rand(rng, 0.96, 1.05), hints.secondaryWidthMin, hints.secondaryWidthMax + 1);
        h = clamp(h * rand(rng, 0.96, 1.04), hints.secondaryHeightMin, hints.secondaryHeightMax + 1);
      }

      let angle =
        diag + arcSpread * slot + styleRotation(rng, 0.38 + rng() * 0.22);
      let radX = rClear + rand(rng, 10, 34) * (0.5 + slot * 0.55);
      let radY = rClear * 0.9 + rand(rng, 8, 28) * (0.5 + slot * 0.5);
      if (packed) {
        radX *= rand(rng, 1.06, 1.18);
        radY *= rand(rng, 1.04, 1.14);
      }

      switch (compositionKind) {
        case "vertical-story":
          radX *= 0.72;
          radY *= 1.38;
          if (Math.sin(angle) < -0.15) {
            angle += rand(rng, 0.5, 1.35);
          }
          break;
        case "portrait-editorial":
          radY *= 1.24;
          radX *= 0.86;
          break;
        case "portrait-journal":
          radX *= 1.04;
          radY *= 1.08;
          break;
        case "square-balanced":
          radX *= 0.86;
          radY *= 0.86;
          break;
        case "cinematic-wide":
          radX *= 1.44;
          radY *= 0.66;
          break;
        case "portrait-social":
        default:
          radY *= 1.08;
          radX *= 0.94;
          break;
      }

      x = fx + Math.cos(angle) * radX;
      y = fy + Math.sin(angle) * radY;

      if (prof === "right-weighted-poster") {
        x += rand(rng, 4, 14);
      } else if (prof === "left-weighted-poster") {
        x -= rand(rng, 4, 14);
      }

      const radialMul =
        mode === "chaotic" ? 1.1 : mode === "minimal" ? 0.9 : 1.02;
      x = fx + (x - fx) * radialMul;
      y = fy + (y - fy) * radialMul;
    } else {
      if (!packed && rng() < 0.18) {
        w = rand(rng, 7, 14);
        h = rand(rng, 9, 18);
        w *= rand(rng, 0.82, 0.92);
        h *= rand(rng, 0.82, 0.92);
      } else {
        w = rand(rng, hints.tertiaryWidthMin, hints.tertiaryWidthMax);
        h = rand(rng, hints.tertiaryHeightMin, hints.tertiaryHeightMax);
        w *= rand(rng, 0.82, 0.94);
        h *= rand(rng, 0.82, 0.94);
        if (packed) {
          w = Math.max(w, hints.tertiaryWidthMin + 1.5);
          h = Math.max(h, hints.tertiaryHeightMin + 2);
        }
      }

      if (rng() < (packed ? 0.58 : 0.4)) {
        const c = cornerScatter(Math.floor(rng() * 4), rng, PHOTO_PAPER_INSET);
        x = c.x + (rng() - 0.5) * 8;
        y = c.y + (rng() - 0.5) * 8;
      } else {
        const ang = rng() * Math.PI * 2;
        const strandR = rand(rng, packed ? 20 : 14, packed ? 42 : 32);
        let squashX = 0.58 + rng() * 0.22;
        let squashY = 0.48 + rng() * 0.22;
        if (
          compositionKind === "vertical-story" ||
          compositionKind === "portrait-editorial"
        ) {
          squashY *= 1.32;
          squashX *= 0.86;
        } else if (compositionKind === "cinematic-wide") {
          squashX *= 1.32;
          squashY *= 0.82;
        } else if (compositionKind === "square-balanced") {
          squashX = squashY = 0.62 + rng() * 0.12;
        }
        x = 50 + Math.cos(ang) * strandR * squashX;
        y = 50 + Math.sin(ang) * strandR * squashY;
        x += (rng() - 0.5) * 10;
        y += (rng() - 0.5) * 10;
      }
    }

    const jitAmt = tier === 1 ? 17 + rng() * 5 : packed ? 16 + rng() * 4 : 26;
    const [jx, jy] = jitter(mode, rng, x, y, jitAmt);
    pieces[idx] = {
      ...basePieceFields(rng, hints, rotCap, tier),
      xPct: jx,
      yPct: jy,
      widthPct: w,
      heightPct: h,
      rotate: styleRotation(rng, rotCap * (tier === 2 ? 1.08 : 0.9)),
      zIndex: 0,
      floatYOffsetPx:
        tier === 2 ? rand(rng, -14, 16) : rand(rng, -10, 12),
      tier,
    };
  }

  finalizePiecePositions(pieces, focal, rng);

  return pieces;
}

function nearFocal(
  rng: () => number,
  bias: number,
  fp: PieceLayout,
  scatterWide: () => { leftPct: number; topPct: number },
) {
  if (rng() < bias * 0.78) {
    return {
      leftPct: clamp(fp.xPct + rand(rng, -36, 36), 2, 98),
      topPct: clamp(fp.yPct + rand(rng, -32, 32), 2, 96),
    };
  }
  return scatterWide();
}

function applyLiteRenderToPieces(pieces: PieceLayout[]) {
  for (const p of pieces) {
    p.edgeDisplacementScale *= 0.52;
    p.edgeNoiseOctaves = Math.max(2, Math.min(3, Math.round(p.edgeNoiseOctaves * 0.75)));
    p.imageBlurPx = 0;
    p.wrinkleOpacity *= 0.45;
    p.edgeVignetteOpacity *= 0.78;
  }
}

function applyCozyRenderToPieces(pieces: PieceLayout[]) {
  for (const p of pieces) {
    p.edgeDisplacementScale *= 0.78;
    p.edgeNoiseOctaves = Math.max(2, Math.min(4, p.edgeNoiseOctaves));
    p.imageBlurPx *= 0.35;
    if (p.imageBlurPx < 0.02) p.imageBlurPx = 0;
    p.wrinkleOpacity *= 0.65;
  }
}

/**
 * Curated, asymmetrical collage layout — visual style drives structure; composition mode adds jitter.
 * Requires 3–8 images. Each (mood, salt, mode, count, layoutProfile, canvas) yields a distinct seed.
 */
export function computeCollageLayout(
  count: number,
  mood: string,
  salt: number,
  hints: StyleLayoutHints,
  compositionMode: CompositionModeId,
  canvasFormatId: string,
  compositionKind: CanvasCompositionKind,
  options?: CollageLayoutOptions,
): CollageLayoutResult {
  const safeCount = clamp(count, 3, 8);
  const seed =
    hashString(mood) ^
    salt ^
    safeCount * 2654435761 ^
    hashString(compositionMode) * 911382323 ^
    hashString(hints.layoutProfile) * 370248451 ^
    hashString(canvasFormatId) * 731164471 ^
    hashString(compositionKind) * 503316529;
  const rng = mulberry32(seed);

  const focalIndex = Math.floor(rng() * safeCount);
  const rotCap = rotCapForMode(compositionMode, hints);
  const pieces = placePiecesUnified(
    compositionMode,
    safeCount,
    focalIndex,
    rng,
    hints,
    rotCap,
    compositionKind,
  );
  if (safeCount >= 6) {
    for (const p of pieces) {
      if (p.tier < 2) p.imageBlurPx = 0;
      else if (p.imageBlurPx < 0.05) p.imageBlurPx = 0;
    }
  }
  assignOrganicZ(pieces, focalIndex, rng, hints.layoutProfile);

  if (hints.layoutProfile === "riso-graphic") {
    assignRisoInkTreatments(pieces, focalIndex, rng);
  }

  const perm = Array.from({ length: safeCount }, (_, i) => i);
  shuffleInPlace(perm, rng);

  const d0 = decorScale(compositionMode);
  const decorMul =
    options?.liteDecor && safeCount >= 6
      ? 0.42
      : options?.liteDecor
        ? 0.52
        : 1;
  const d = {
    tape: d0.tape * decorMul,
    scrap: d0.scrap * decorMul,
  };
  const fp = pieces[focalIndex];
  const decorBias = hints.decorClusterBias * (safeCount >= 6 ? 0.55 : 1);

  const tapeMax = options?.liteDecor ? 4 : 8;
  const scrapMax = options?.liteDecor ? 5 : 12;

  const tapeLoRaw = clamp(Math.min(hints.tapeCountMin, hints.tapeCountMax), 0, tapeMax);
  const tapeHiRaw = clamp(Math.max(hints.tapeCountMin, hints.tapeCountMax), tapeLoRaw, tapeMax);
  const tapeSpanInts = tapeHiRaw - tapeLoRaw;
  const tapeBaseDiscrete =
    tapeSpanInts <= 0
      ? tapeLoRaw
      : tapeLoRaw + Math.floor(rng() * (tapeSpanInts + 1));
  const tapeCount = clamp(Math.round(tapeBaseDiscrete * d.tape), tapeLoRaw, tapeHiRaw);
  const tapes: TapeLayout[] = [];
  for (let t = 0; t < tapeCount; t++) {
    const taper = rng();
    const tapeKind: "masking" | "opaque" = taper < 0.78 ? "masking" : "opaque";

    let leftPct = 50;
    let topPct = 50;
    let width: number;
    let height: number;
    let rotate: number;
    let tapeBack: boolean;

    if (tapeKind === "masking") {
      tapeBack = rng() < 0.12;
      width = 56 + rng() * 78;
      height = 6 + rng() * 9;
      const cornerPos =
        rng() < 0.76 ? placeTapeOnPieceCorner(pieces, focalIndex, rng) : null;
      if (cornerPos) {
        leftPct = cornerPos.leftPct;
        topPct = cornerPos.topPct;
        rotate = rand(rng, -64, 64) + (rng() - 0.5) * 14;
      } else {
        const pos = nearFocal(rng, decorBias * 0.55, fp, () => ({
          leftPct: rand(rng, 0, 100),
          topPct: rand(rng, 0, 100),
        }));
        leftPct = pos.leftPct;
        topPct = pos.topPct;
        rotate = rand(rng, -58, 58);
      }
    } else {
      tapeBack = rng() < 0.42;
      const pos = nearFocal(rng, decorBias, fp, () => ({
        leftPct: rand(rng, 0, 100),
        topPct: rand(rng, 0, 100),
      }));
      leftPct = pos.leftPct;
      topPct = pos.topPct;
      width = 38 + rng() * 72;
      height = 11 + rng() * 20;
      rotate = rand(rng, -52, 52);
    }

    const opacityMul = tapeKind === "masking" ? 0.82 + rng() * 0.14 : 1;

    tapes.push({
      leftPct,
      topPct,
      width,
      height,
      rotate,
      opacity:
        (hints.tapeOpacityMin +
          rng() * (hints.tapeOpacityMax - hints.tapeOpacityMin)) *
        opacityMul,
      zIndex: tapeBack
        ? 16 + Math.floor(rng() * 22)
        : tapeKind === "masking"
          ? 84 + Math.floor(rng() * 34)
          : 76 + Math.floor(rng() * 36),
      tapeKind,
    });
  }

  const scrapLoRaw = clamp(Math.min(hints.scrapCountMin, hints.scrapCountMax), 0, scrapMax);
  const scrapHiRaw = clamp(Math.max(hints.scrapCountMin, hints.scrapCountMax), scrapLoRaw, scrapMax);
  const scrapSpanInts = scrapHiRaw - scrapLoRaw;
  const scrapBaseDiscrete =
    scrapSpanInts <= 0
      ? scrapLoRaw
      : scrapLoRaw + Math.floor(rng() * (scrapSpanInts + 1));
  const scrapCount = clamp(
    Math.round(scrapBaseDiscrete * d.scrap),
    Math.max(0, scrapLoRaw),
    scrapHiRaw,
  );
  const palette = hints.scrapPalette;
  const scraps: ScrapLayout[] = [];
  for (let s = 0; s < scrapCount; s++) {
    const pos = nearFocal(rng, decorBias * 0.92, fp, () => ({
      leftPct: rand(rng, -8, 102),
      topPct: rand(rng, -8, 100),
    }));
    const scrapBack = rng() < 0.48;
    const bigScrap = !scrapBack && rng() < 0.35;
    scraps.push({
      ...pos,
      w: bigScrap ? 28 + rng() * 58 : 16 + rng() * 48,
      h: bigScrap ? 22 + rng() * 48 : 12 + rng() * 38,
      rotate: rand(rng, -52, 52),
      zIndex: scrapBack
        ? 2 + Math.floor(rng() * 16)
        : 64 + Math.floor(rng() * 36),
      bg: palette[Math.floor(rng() * palette.length)] ?? palette[0],
    });
  }

  const nPieces = pieces.length;
  const centerX =
    nPieces > 0
      ? pieces.reduce((acc, p) => acc + p.xPct, 0) / nPieces
      : 50;
  const prof = hints.layoutProfile;
  const captionAway = rng() < 0.5;
  let captionLeftPct = captionAway
    ? centerX > 50
      ? rand(rng, 4, 22)
      : rand(rng, 58, 88)
    : rand(rng, 8, 72);
  let captionTopPct =
    compositionMode === "minimal"
      ? rand(rng, 68, 94)
      : prof === "low-museum"
        ? rand(rng, 8, 28)
        : prof === "illustrated-surreal"
          ? rand(rng, 8, 34)
          : prof === "riso-graphic"
            ? rand(rng, 12, 38)
            : rand(rng, 52, 92);

  if (compositionKind === "vertical-story") {
    captionTopPct = captionAway ? rand(rng, 74, 92) : rand(rng, 62, 86);
  } else if (compositionKind === "portrait-editorial") {
    captionTopPct = rand(rng, 70, 90);
  } else if (compositionKind === "cinematic-wide") {
    captionTopPct = rand(rng, 68, 90);
    captionLeftPct = rand(rng, 6, 78);
  } else if (compositionKind === "square-balanced") {
    captionTopPct = rand(rng, 72, 92);
  } else if (compositionKind === "portrait-journal") {
    captionTopPct = rand(rng, 68, 92);
  }

  if (options?.liteRender) {
    applyLiteRenderToPieces(pieces);
  } else if (options?.liteDecor) {
    applyCozyRenderToPieces(pieces);
  }

  return {
    pieces,
    tapes,
    scraps,
    captionTilt: styleRotation(rng, rotCap * 0.42),
    captionLeftPct,
    captionTopPct,
    focalIndex,
    imagePermutation: perm,
  };
}
