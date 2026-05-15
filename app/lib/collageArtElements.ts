import type { CollageStyleId } from "@/app/lib/collageStylePresets";
import type { PieceLayout } from "@/app/lib/collageLayout";

export type ArtDensityId = "minimal" | "balanced" | "rich";

export type ArtElementKind =
  | "tape_masking"
  | "tape_clear"
  | "scrap_newspaper"
  | "scrap_book"
  | "note_handwritten"
  | "stitch_line"
  | "pin"
  | "clip"
  | "botanical"
  | "fabric"
  | "tracing"
  | "pencil"
  | "ink"
  | "label"
  | "paper_shadow"
  | "organic_shape";

export type ArtLayoutElement = {
  id: string;
  kind: ArtElementKind;
  leftPct: number;
  topPct: number;
  widthPct: number;
  heightPct: number;
  rotate: number;
  opacity: number;
  zIndex: number;
  variant: number;
  mixBlendMode?: string;
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

function rand(rng: () => number, a: number, b: number) {
  return a + rng() * (b - a);
}

type Rect = { l: number; t: number; r: number; b: number };

function pieceRect(p: PieceLayout): Rect {
  const halfW = p.widthPct / 2;
  const halfH = p.heightPct / 2;
  return {
    l: p.xPct - halfW,
    t: p.yPct - halfH,
    r: p.xPct + halfW,
    b: p.yPct + halfH,
  };
}

function inflate(r: Rect, padPct: number): Rect {
  return {
    l: r.l - padPct,
    t: r.t - padPct,
    r: r.r + padPct,
    b: r.b + padPct,
  };
}

function intersects(a: Rect, b: Rect): boolean {
  return !(a.r < b.l || a.l > b.r || a.b < b.t || a.t > b.b);
}

function centerBoxRect(
  cx: number,
  cy: number,
  wPct: number,
  hPct: number,
): Rect {
  const hw = wPct / 2;
  const hh = hPct / 2;
  return { l: cx - hw, t: cy - hh, r: cx + hw, b: cy + hh };
}

function stylePool(styleId: CollageStyleId): ArtElementKind[] {
  switch (styleId) {
    case "vintage-zine":
      return [
        "scrap_newspaper",
        "scrap_newspaper",
        "tape_masking",
        "pencil",
        "ink",
        "label",
        "paper_shadow",
        "tape_clear",
        "organic_shape",
      ];
    case "soft-archive":
      return [
        "scrap_book",
        "label",
        "tracing",
        "tape_clear",
        "paper_shadow",
        "ink",
        "note_handwritten",
        "stitch_line",
      ];
    case "desert-dream":
      return [
        "fabric",
        "botanical",
        "tape_masking",
        "paper_shadow",
        "organic_shape",
        "stitch_line",
        "ink",
        "scrap_book",
      ];
    case "emotional-poster":
      return [
        "botanical",
        "organic_shape",
        "fabric",
        "stitch_line",
        "pin",
        "tracing",
        "tape_masking",
        "paper_shadow",
      ];
    case "museum-scrapbook":
      return [
        "tape_masking",
        "clip",
        "organic_shape",
        "paper_shadow",
        "pencil",
        "scrap_book",
        "pin",
        "tape_clear",
      ];
    case "quiet-memory":
      return [
        "tracing",
        "tape_clear",
        "stitch_line",
        "ink",
        "scrap_book",
        "label",
        "pencil",
        "paper_shadow",
      ];
    default:
      return [
        "tracing",
        "paper_shadow",
        "stitch_line",
        "ink",
        "organic_shape",
      ];
  }
}

function elementSize(kind: ArtElementKind, rng: () => number): { w: number; h: number } {
  switch (kind) {
    case "stitch_line":
      return { w: rand(rng, 14, 32), h: rand(rng, 0.4, 1.2) };
    case "pencil":
      return { w: rand(rng, 10, 28), h: rand(rng, 0.25, 0.55) };
    case "tape_masking":
    case "tape_clear":
      return { w: rand(rng, 6, 14), h: rand(rng, 2.5, 6.5) };
    case "pin":
    case "clip":
      return { w: rand(rng, 1.8, 3.2), h: rand(rng, 2.2, 4.2) };
    case "label":
      return { w: rand(rng, 10, 22), h: rand(rng, 3, 6) };
    case "botanical":
      return { w: rand(rng, 8, 16), h: rand(rng, 10, 18) };
    case "organic_shape":
      return { w: rand(rng, 9, 20), h: rand(rng, 8, 16) };
    case "tracing":
      return { w: rand(rng, 18, 38), h: rand(rng, 14, 28) };
    case "paper_shadow":
      return { w: rand(rng, 16, 30), h: rand(rng, 10, 20) };
    case "ink":
      return { w: rand(rng, 4, 11), h: rand(rng, 4, 11) };
    default:
      return { w: rand(rng, 8, 18), h: rand(rng, 6, 14) };
  }
}

function pickZ(kind: ArtElementKind, layer: "back" | "front", rng: () => number): number {
  if (layer === "back") {
    if (kind === "paper_shadow" || kind === "tracing") return Math.floor(rand(rng, 7, 14));
    return Math.floor(rand(rng, 10, 19));
  }
  if (kind === "tape_masking" || kind === "tape_clear" || kind === "clip" || kind === "pin")
    return Math.floor(rand(rng, 62, 76));
  if (kind === "stitch_line") return Math.floor(rand(rng, 42, 54));
  return Math.floor(rand(rng, 22, 41));
}

/** Tape / clip anchored to a photo edge so it reads as “holding” the print. */
function placeNearPieceEdge(
  pieces: PieceLayout[],
  rng: () => number,
  wPct: number,
  hPct: number,
): { leftPct: number; topPct: number } | null {
  if (!pieces.length) return null;
  const p = pieces[Math.floor(rng() * pieces.length)]!;
  const edge = Math.floor(rng() * 4);
  const jx = () => (rng() - 0.5) * Math.min(14, p.widthPct * 0.45);
  const jy = () => (rng() - 0.5) * Math.min(14, p.heightPct * 0.45);
  const halfW = p.widthPct / 2;
  const halfH = p.heightPct / 2;
  let leftPct = p.xPct;
  let topPct = p.yPct;
  if (edge === 0) {
    topPct = p.yPct - halfH - hPct * 0.42;
    leftPct = p.xPct + jx();
  } else if (edge === 1) {
    topPct = p.yPct + halfH + hPct * 0.42;
    leftPct = p.xPct + jx();
  } else if (edge === 2) {
    leftPct = p.xPct - halfW - wPct * 0.38;
    topPct = p.yPct + jy();
  } else {
    leftPct = p.xPct + halfW + wPct * 0.38;
    topPct = p.yPct + jy();
  }
  return { leftPct, topPct };
}

export type ComputeArtElementsParams = {
  mood: string;
  salt: number;
  styleId: CollageStyleId;
  density: ArtDensityId;
  pieces: PieceLayout[];
  focalIndex: number;
  /** Fewer decorations on phone/tablet layout pass */
  liteDecor?: boolean;
  /** 6+ photos: slightly fewer art bits so faces stay visible */
  manyPhotos?: boolean;
};

/**
 * Procedural mixed-media collage decorations (CSS/SVG). Print-like scraps use blur and
 * line texture only — no readable random text. Optional PNG strips can later load from
 * `/public/textures/` when assets exist.
 */
export function computeCollageArtElements(
  params: ComputeArtElementsParams,
): ArtLayoutElement[] {
  const { mood, salt, styleId, density, pieces, focalIndex, liteDecor, manyPhotos } =
    params;
  const seed =
    hashString(mood) ^
    salt ^
    hashString(styleId) ^
    hashString(density) ^
    (focalIndex + 1) * 374761393;
  const rng = mulberry32(seed);

  let count =
    density === "minimal"
      ? Math.floor(rand(rng, 5, 7))
      : density === "balanced"
        ? Math.floor(rand(rng, 7, 10))
        : Math.floor(rand(rng, 9, 13));
  if (liteDecor) count = Math.max(4, Math.floor(count * 0.55));
  if (manyPhotos) count = Math.max(4, Math.floor(count * 0.88));

  const focal = pieces[focalIndex];
  const avoidFocal = focal ? inflate(pieceRect(focal), 9) : null;
  const avoidSecondary = pieces
    .map((p, i) => (i !== focalIndex && p.tier !== 2 ? inflate(pieceRect(p), 5) : null))
    .filter((r): r is Rect => r !== null);

  const pool = stylePool(styleId);
  const out: ArtLayoutElement[] = [];

  for (let i = 0; i < count; i++) {
    const kind = pool[Math.floor(rng() * pool.length)] ?? "paper_shadow";
    const { w, h } = elementSize(kind, rng);
    const layer: "back" | "front" =
      kind === "paper_shadow" ||
      kind === "tracing" ||
      (kind === "scrap_book" && rng() < 0.45) ||
      (kind === "scrap_newspaper" && rng() < 0.5)
        ? "back"
        : rng() < 0.38
          ? "back"
          : "front";

    const tapeLike =
      kind === "tape_masking" ||
      kind === "tape_clear" ||
      kind === "clip" ||
      (kind === "pin" && rng() < 0.55);

    let leftPct = 50;
    let topPct = 50;
    let ok = false;

    if (tapeLike && pieces.length > 0 && rng() < 0.68) {
      const edgePos = placeNearPieceEdge(pieces, rng, w, h);
      if (edgePos) {
        leftPct = edgePos.leftPct;
        topPct = edgePos.topPct;
        const box = centerBoxRect(leftPct, topPct, w, h);
        const margin = { l: 3, t: 3, r: 97, b: 97 };
        if (box.l >= margin.l && box.t >= margin.t && box.r <= margin.r && box.b <= margin.b) {
          ok = true;
        }
      }
    }

    if (!ok) {
      for (let attempt = 0; attempt < 36; attempt++) {
        leftPct = rand(rng, 10, 90);
        topPct = rand(rng, 10, 90);
        const box = centerBoxRect(leftPct, topPct, w, h);
        const margin = { l: 4, t: 4, r: 96, b: 96 };
        if (box.l < margin.l || box.t < margin.t || box.r > margin.r || box.b > margin.b)
          continue;
        if (tapeLike) {
          /* Tapes and clips may sit on photographs — only respect paper bounds. */
        } else if (avoidFocal && intersects(box, avoidFocal)) continue;
        if (layer === "back") {
          if (avoidSecondary.some((r) => intersects(box, r))) continue;
        } else if (!tapeLike) {
          if (rng() < 0.35 && avoidFocal && intersects(box, inflate(avoidFocal, -3))) continue;
        }
        ok = true;
        break;
      }
    }
    if (!ok) continue;

    const zIndex = pickZ(kind, layer, rng);
    const opacity = clamp(
      (layer === "back" ? 0.22 : 0.38) + rng() * (layer === "back" ? 0.2 : 0.28),
      0.12,
      0.78,
    );
    const rotate = rand(rng, -38, 38);
    const variant = Math.floor(rng() * 1000);

    out.push({
      id: `art-${salt}-${i}-${Math.floor(rng() * 1e9).toString(36)}`,
      kind,
      leftPct,
      topPct,
      widthPct: w,
      heightPct: h,
      rotate,
      opacity,
      zIndex,
      variant,
      mixBlendMode:
        kind === "tracing" || kind === "tape_clear"
          ? "soft-light"
          : kind === "ink" || kind === "scrap_newspaper"
            ? "multiply"
            : undefined,
    });
  }

  out.sort((a, b) => a.zIndex - b.zIndex);
  return out;
}
