/**
 * Procedural hand-torn paper silhouettes for collage pieces.
 * Each call yields a unique clip-path — no shared SVG wave templates.
 */

export type TearEdgeProfile = "archive" | "xerox";

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function rand(rng: () => number, a: number, b: number) {
  return a + rng() * (b - a);
}

/** Unique CSS clip-path value, e.g. polygon(0.2% 1.1%, ...) */
export function buildHandTornClipPath(
  rng: () => number,
  profile: TearEdgeProfile,
): string {
  const archive = profile === "archive";
  const perpWild = archive ? rand(rng, 5.5, 11) : rand(rng, 2.8, 5.5);
  const perpBias = archive ? rand(rng, 1.2, 3.8) : rand(rng, 0.5, 2.1);
  const tangJ = archive ? rand(rng, 1.4, 3.6) : rand(rng, 0.6, 1.8);
  const fiberChance = archive ? 0.26 : 0.14;
  const hairChance = archive ? 0.12 : 0.06;

  const pts: Array<[number, number]> = [];

  function push(x: number, y: number) {
    const xx = clamp(x, -14, 114);
    const yy = clamp(y, -14, 114);
    const last = pts[pts.length - 1];
    if (last && Math.abs(last[0] - xx) < 0.05 && Math.abs(last[1] - yy) < 0.05) {
      return;
    }
    pts.push([xx, yy]);
  }

  function walkEdge(
    x0: number,
    y0: number,
    x1: number,
    y1: number,
    inNx: number,
    inNy: number,
    skipFirst: boolean,
  ) {
    const segs = clamp(
      Math.floor(7 + rng() * 11 + (archive ? rng() * 5 : rng() * 2)),
      6,
      22,
    );
    const dx = x1 - x0;
    const dy = y1 - y0;
    const len = Math.hypot(dx, dy) || 1;
    const tx = dx / len;
    const ty = dy / len;
    for (let s = 0; s < segs; s++) {
      if (skipFirst && s === 0) continue;
      const u = s / Math.max(1, segs - 1);
      let x = x0 + dx * u;
      let y = y0 + dy * u;
      x += (rng() - 0.5) * tangJ * tx * 4;
      y += (rng() - 0.5) * tangJ * ty * 4;
      const bite = (rng() - 0.5) * 2 * perpWild + (rng() - 0.5) * perpBias;
      x += inNx * bite;
      y += inNy * bite;
      push(x, y);

      if (rng() < fiberChance && s > 0 && s < segs - 1) {
        const spur = rand(rng, 0.35, 2.8);
        const zig = (rng() - 0.5) * 2.2;
        push(
          x + inNx * spur * 2.2 + tx * zig,
          y + inNy * spur * 2.2 + ty * zig,
        );
        push(x + (rng() - 0.5) * 0.9, y + (rng() - 0.5) * 0.9);
      }

      if (rng() < hairChance) {
        const hair = rand(rng, 0.8, 3.2);
        push(x - inNx * hair + (rng() - 0.5) * 0.6, y - inNy * hair + (rng() - 0.5) * 0.6);
        push(x, y);
      }
    }
  }

  walkEdge(0, 0, 100, 0, 0, 1, false);
  walkEdge(100, 0, 100, 100, -1, 0, true);
  walkEdge(100, 100, 0, 100, 0, -1, true);
  walkEdge(0, 100, 0, 0, 1, 0, true);

  const first = pts[0];
  const last = pts[pts.length - 1];
  if (first && last && (first[0] !== last[0] || first[1] !== last[1])) {
    push(first[0], first[1]);
  }

  const inner = pts.map(([x, y]) => `${x.toFixed(2)}% ${y.toFixed(2)}%`).join(", ");
  return `polygon(${inner})`;
}

export function buildEdgeNoiseParams(rng: () => number, profile: TearEdgeProfile) {
  return {
    edgeDisplacementSeed: 1 + Math.floor(rng() * 998),
    edgeDisplacementScale:
      profile === "archive" ? rand(rng, 2.2, 5.2) : rand(rng, 1.1, 2.8),
    edgeNoiseBaseFrequency: rand(rng, 0.016, 0.042),
    edgeNoiseOctaves: profile === "archive" ? 4 : 3,
    curlCorner: Math.floor(rng() * 4) as 0 | 1 | 2 | 3,
    edgeVignetteOpacity: rand(rng, 0.22, 0.42),
    wrinkleOpacity: rand(rng, 0.06, 0.14),
  };
}

export function buildPiecePaperEdge(rng: () => number, profile: TearEdgeProfile) {
  const clipPathCss = buildHandTornClipPath(rng, profile);
  return {
    clipPathCss,
    ...buildEdgeNoiseParams(rng, profile),
  };
}
