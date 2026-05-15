import type { CompositionModeId } from "./collageCompositionModes";
import type { CanvasCompositionKind } from "./collageCanvasFormats";
import type { LayoutProfile, StyleLayoutHints } from "./collageStylePresets";
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
};

export type TapeLayout = {
  leftPct: number;
  topPct: number;
  width: number;
  height: number;
  rotate: number;
  opacity: number;
  zIndex: number;
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
  "14px 36px 52px rgba(28,24,20,0.32), 0 0 0 1px rgba(255,255,255,0.1)",
  "12px 32px 48px rgba(32,28,24,0.3), -1px -1px 0 rgba(255,255,255,0.06)",
  "16px 40px 56px rgba(38,32,28,0.28), inset 0 -1px 0 rgba(255,252,248,0.1)",
];

const SHADOW_SECONDARY = [
  "14px 38px 56px rgba(45,40,35,0.32)",
  "10px 28px 44px rgba(61,56,50,0.26), 0 0 0 1px rgba(255,255,255,0.07)",
  "20px 48px 60px rgba(35,32,28,0.28)",
  "8px 22px 38px rgba(61,56,50,0.2), 6px 22px 36px rgba(61,56,50,0.14)",
  "16px 40px 48px rgba(50,45,40,0.24), -2px -2px 0 rgba(255,255,255,0.05)",
];

const SHADOW_TERTIARY = [
  "8px 22px 38px rgba(61,56,50,0.2), 0 0 0 1px rgba(255,255,255,0.06)",
  "10px 26px 42px rgba(50,45,40,0.18)",
  "6px 16px 30px rgba(61,56,50,0.16)",
  "12px 30px 44px rgba(45,40,35,0.18)",
];

/** % margin from paper edge — photo centers clamped so full bbox stays inside */
const PHOTO_PAPER_INSET = 7;

function clampPhotoCenterInsidePaper(p: PieceLayout, inset: number) {
  const hw = p.widthPct * 0.5;
  const hh = p.heightPct * 0.5;
  p.xPct = clamp(p.xPct, inset + hw, 100 - inset - hw);
  p.yPct = clamp(p.yPct, inset + hh, 100 - inset - hh);
}

/** Gentle pull when centers hug the outer rim (avoids “floating off the sheet”) */
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

function pickLayerShadowForTier(tier: PieceTier, rng: () => number) {
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
    hints.tearEdgeIntensity === "xerox" ? "xerox" : "archive";
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
      tier === 2 && rng() > 0.72
        ? 0.08 + rng() * 0.28
        : rng() > 0.82
          ? 0
          : 0.04 + rng() * 0.16,
    floatYOffsetPx: 0,
    layerShadow: pickLayerShadowForTier(tier, rng),
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
) {
  const others = pieces.map((_, i) => i).filter((i) => i !== focalIndex);
  shuffleInPlace(others, rng);
  const low = 20;
  const high = 44;
  const zs = others.map(() => low + Math.floor(rng() * (high - low)));
  zs.sort((a, b) => a - b);
  others.forEach((idx, rank) => {
    pieces[idx].zIndex = zs[rank] ?? 34;
  });
  const maxOther = others.reduce(
    (m, i) => Math.max(m, pieces[i].zIndex),
    0,
  );

  const focalLift = 4 + Math.floor(rng() * 6);
  pieces[focalIndex].zIndex = maxOther + focalLift;

  if (others.length > 0 && rng() < 0.28) {
    const accent = others[Math.floor(rng() * others.length)]!;
    if (rng() < 0.55) {
      pieces[accent].zIndex = pieces[focalIndex].zIndex + 1 + Math.floor(rng() * 5);
    } else {
      pieces[focalIndex].zIndex = maxOther - 1 + Math.floor(rng() * 5);
      pieces[accent].zIndex = maxOther + 6 + Math.floor(rng() * 8);
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

  const others = Array.from({ length: count }, (_, i) => i).filter(
    (i) => i !== focal,
  );
  shuffleInPlace(others, rng);

  const maxSec = Math.max(1, count - 1);
  const secN = clamp(
    Math.floor((count - 1) * (0.36 + rng() * 0.44)),
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

  const [fjx, fjy] = jitter(mode, rng, fx, fy, 12);
  const focalShrink = rand(rng, 0.82, 0.95);
  const fwSized = fw * focalShrink;
  const fhSized = fh * focalShrink;
  let capW = prof === "low-museum" && hints.focalWidthMax >= 52 ? 56 : 52;
  let capH = prof === "low-museum" && hints.focalHeightMax >= 52 ? 50 : 48;

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

  pieces[focal] = {
    ...basePieceFields(rng, hints, rotCap, 0),
    xPct: fjx,
    yPct: fjy,
    widthPct: Math.min(capW, fwSized),
    heightPct: Math.min(capH, fhSized),
    rotate: styleRotation(rng, rotCap * 0.72),
    zIndex: 0,
    floatYOffsetPx: rand(rng, -8, 10),
    tier: 0,
  };

  const focalW = pieces[focal].widthPct;
  const diag = diagonalSweepStart(prof, rng);
  const arcSpread = Math.PI * (0.52 + rng() * 0.38);
  const rClear = 20 + focalW * 0.3 + rand(rng, 4, 16);

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

      let angle =
        diag + arcSpread * slot + styleRotation(rng, 0.38 + rng() * 0.22);
      let radX = rClear + rand(rng, 10, 34) * (0.5 + slot * 0.55);
      let radY = rClear * 0.9 + rand(rng, 8, 28) * (0.5 + slot * 0.5);

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
      if (rng() < 0.18) {
        w = rand(rng, 7, 14);
        h = rand(rng, 9, 18);
      } else {
        w = rand(rng, hints.tertiaryWidthMin, hints.tertiaryWidthMax);
        h = rand(rng, hints.tertiaryHeightMin, hints.tertiaryHeightMax);
      }

      if (rng() < 0.4) {
        const c = cornerScatter(Math.floor(rng() * 4), rng, PHOTO_PAPER_INSET);
        x = c.x + (rng() - 0.5) * 8;
        y = c.y + (rng() - 0.5) * 8;
      } else {
        const ang = rng() * Math.PI * 2;
        const strandR = rand(rng, 14, 32);
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

    const jitAmt = tier === 1 ? 14 : 22;
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

  containAllPhotosOnPaper(pieces, rng);

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
    p.imageBlurPx *= 0.35;
    if (p.imageBlurPx < 0.03) p.imageBlurPx = 0;
    p.wrinkleOpacity *= 0.5;
    p.edgeVignetteOpacity *= 0.82;
  }
}

function applyCozyRenderToPieces(pieces: PieceLayout[]) {
  for (const p of pieces) {
    p.edgeDisplacementScale *= 0.78;
    p.edgeNoiseOctaves = Math.max(2, Math.min(4, p.edgeNoiseOctaves));
    p.imageBlurPx *= 0.65;
    if (p.imageBlurPx < 0.02) p.imageBlurPx = 0;
    p.wrinkleOpacity *= 0.72;
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
  assignOrganicZ(pieces, focalIndex, rng);

  const perm = Array.from({ length: safeCount }, (_, i) => i);
  shuffleInPlace(perm, rng);

  const d0 = decorScale(compositionMode);
  const decorMul = options?.liteDecor ? 0.52 : 1;
  const d = {
    tape: d0.tape * decorMul,
    scrap: d0.scrap * decorMul,
  };
  const fp = pieces[focalIndex];
  const decorBias = hints.decorClusterBias;

  const tapeMax = options?.liteDecor ? 4 : 8;
  const scrapMax = options?.liteDecor ? 5 : 12;

  const tapeCount = clamp(
    Math.round(
      (hints.tapeCountMin +
        rng() * (hints.tapeCountMax - hints.tapeCountMin + 1)) *
        d.tape,
    ),
    1,
    tapeMax,
  );
  const tapes: TapeLayout[] = [];
  for (let t = 0; t < tapeCount; t++) {
    const pos = nearFocal(rng, decorBias, fp, () => ({
      leftPct: rand(rng, 0, 100),
      topPct: rand(rng, 0, 100),
    }));
    const tapeBack = rng() < 0.42;
    tapes.push({
      ...pos,
      width: 38 + rng() * 72,
      height: 11 + rng() * 20,
      rotate: rand(rng, -52, 52),
      opacity:
        hints.tapeOpacityMin +
        rng() * (hints.tapeOpacityMax - hints.tapeOpacityMin),
      zIndex: tapeBack
        ? 18 + Math.floor(rng() * 22)
        : 78 + Math.floor(rng() * 34),
    });
  }

  const scrapCount = clamp(
    Math.round(
      (hints.scrapCountMin +
        rng() * (hints.scrapCountMax - hints.scrapCountMin + 1)) *
        d.scrap,
    ),
    1,
    scrapMax,
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
