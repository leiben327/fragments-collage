import type { CollageStyleId, CollageStylePreset } from "@/app/lib/collageStylePresets";

export const COLLAGE_BACKGROUND_IDS = [
  "vintage-newspaper",
  "old-book-pages",
  "grid-paper",
  "fabric-linen",
  "craft-paper",
  "tracing-paper",
  "botanical-paper",
  "blueprint-paper",
  "watercolor-wash",
  "film-grain-paper",
  "soft-cream-archive",
  "photocopy-texture",
] as const;

export type CollageBackgroundId = (typeof COLLAGE_BACKGROUND_IDS)[number];

export type CollageBackgroundOverlay = {
  opacity: number;
  mixBlendMode: "multiply" | "soft-light" | "overlay" | "normal";
  background: string;
  filter?: string;
};

export type CollageBackgroundSurface = {
  id: CollageBackgroundId;
  label: string;
  category: string;
  /** One line for thumbnails / helper text */
  hint: string;
  /** Full-bleed base — stacked imperfect gradients, never a single flat wash */
  baseBackground: string;
  exportBackgroundColor: string;
  /** Multiply / soft-light passes on top of base, still under ruled lines */
  overlays: CollageBackgroundOverlay[];
  /** Faded, slightly dirty edges — archival shelf wear */
  edgeVignette: {
    opacity: number;
    mixBlendMode: "multiply" | "soft-light";
    background: string;
  } | null;
  atmosphereOpacityMul: number;
  /** Added to preset scanned fiber opacity before cap */
  scannedOpacityAdd: number;
  linedOpacityMul: number;
  grainOpacityMul: number;
  globalGradeOpacityMul: number;
  /** Appended to preset caption text-shadow (comma-separated) */
  extraCaptionTextShadow: string;
};

function shadowJoin(preset: string, extra: string): string {
  const e = extra.trim();
  if (!e) return preset;
  return preset.trim() ? `${preset.trim()}, ${e}` : e;
}

export function resolveCaptionTextShadow(
  preset: CollageStylePreset,
  surface: CollageBackgroundSurface,
): string {
  return shadowJoin(preset.captionTextShadow, surface.extraCaptionTextShadow);
}

export const COLLAGE_BACKGROUND_SURFACES: Record<
  CollageBackgroundId,
  CollageBackgroundSurface
> = {
  "vintage-newspaper": {
    id: "vintage-newspaper",
    label: "Vintage Newspaper",
    category: "Print & ink",
    hint: "Yellowed newsprint, faint column ghosts, scan dust.",
    baseBackground: `
      repeating-linear-gradient(88deg, rgba(42,40,36,0.04) 0px, transparent 1px, transparent 3px, rgba(42,40,36,0.025) 3px, rgba(42,40,36,0.025) 4px),
      repeating-linear-gradient(0deg, rgba(38,36,32,0.028) 0px, transparent 1px, transparent 2px, rgba(38,36,32,0.02) 2px, rgba(38,36,32,0.02) 3px),
      radial-gradient(ellipse 85% 70% at 18% 12%, rgba(255,248,220,0.55) 0%, transparent 52%),
      radial-gradient(ellipse 60% 45% at 88% 88%, rgba(210,198,175,0.35) 0%, transparent 50%),
      linear-gradient(182deg, #ebe6dc 0%, #ddd4c6 38%, #cfc6b4 100%)`,
    exportBackgroundColor: "#ddd4c6",
    overlays: [
      {
        opacity: 0.26,
        mixBlendMode: "multiply",
        background:
          "radial-gradient(ellipse 120% 80% at 40% 30%, rgba(55,48,38,0.12) 0%, transparent 55%)",
      },
      {
        opacity: 0.14,
        mixBlendMode: "soft-light",
        background:
          "repeating-linear-gradient(0deg, rgba(90,82,72,0.06) 0px, transparent 1px, transparent 6px, rgba(90,82,72,0.04) 6px, rgba(90,82,72,0.04) 7px)",
        filter: "blur(0.35px)",
      },
    ],
    edgeVignette: {
      opacity: 0.38,
      mixBlendMode: "multiply",
      background:
        "radial-gradient(ellipse 95% 90% at 50% 50%, transparent 42%, rgba(62,54,44,0.14) 100%)",
    },
    atmosphereOpacityMul: 1.12,
    scannedOpacityAdd: 0.04,
    linedOpacityMul: 1.15,
    grainOpacityMul: 1.25,
    globalGradeOpacityMul: 1.08,
    extraCaptionTextShadow:
      "0 0 18px rgba(252,250,246,0.75), 0 1px 0 rgba(255,252,248,0.55)",
  },
  "old-book-pages": {
    id: "old-book-pages",
    label: "Old Book Pages",
    category: "Archival paper",
    hint: "Foxing, fiber, uneven cream — open folio stack.",
    baseBackground: `
      radial-gradient(ellipse 70% 55% at 22% 78%, rgba(198,175,145,0.22) 0%, transparent 48%),
      radial-gradient(ellipse 50% 40% at 82% 18%, rgba(255,252,244,0.5) 0%, transparent 45%),
      repeating-linear-gradient(0deg, rgba(72,62,52,0.03) 0px, transparent 1px, transparent 7px, rgba(72,62,52,0.025) 7px, rgba(72,62,52,0.025) 8px),
      linear-gradient(168deg, #f6f0e6 0%, #ebe2d4 45%, #dccfb8 100%)`,
    exportBackgroundColor: "#ebe2d4",
    overlays: [
      {
        opacity: 0.2,
        mixBlendMode: "multiply",
        background:
          "radial-gradient(circle at 68% 42%, rgba(160,130,95,0.15) 0%, transparent 38%), radial-gradient(circle at 28% 62%, rgba(140,118,88,0.12) 0%, transparent 35%)",
      },
      {
        opacity: 0.12,
        mixBlendMode: "soft-light",
        background:
          "linear-gradient(95deg, rgba(255,255,255,0.08) 0%, transparent 35%, rgba(92,78,62,0.05) 100%)",
      },
    ],
    edgeVignette: {
      opacity: 0.32,
      mixBlendMode: "multiply",
      background:
        "radial-gradient(ellipse 100% 100% at 50% 50%, transparent 38%, rgba(88,72,58,0.1) 100%)",
    },
    atmosphereOpacityMul: 1.05,
    scannedOpacityAdd: 0.035,
    linedOpacityMul: 0.92,
    grainOpacityMul: 1.12,
    globalGradeOpacityMul: 1.05,
    extraCaptionTextShadow: "0 0 14px rgba(255,252,246,0.65)",
  },
  "grid-paper": {
    id: "grid-paper",
    label: "Grid Paper",
    category: "Ruled & measured",
    hint: "Faint blue grid, punch-margin ghost, desk wear.",
    baseBackground: `
      repeating-linear-gradient(0deg, rgba(72,118,168,0.07) 0px, transparent 1px, transparent 15px, rgba(72,118,168,0.07) 15px, rgba(72,118,168,0.07) 16px),
      repeating-linear-gradient(90deg, rgba(72,118,168,0.055) 0px, transparent 1px, transparent 15px, rgba(72,118,168,0.055) 15px, rgba(72,118,168,0.055) 16px),
      linear-gradient(90deg, rgba(255,252,248,0.35) 0%, rgba(255,252,248,0.08) 8%, transparent 10%),
      linear-gradient(178deg, #f4f2ec 0%, #e8e6e0 55%, #dcdad4 100%)`,
    exportBackgroundColor: "#e8e6e0",
    overlays: [
      {
        opacity: 0.18,
        mixBlendMode: "multiply",
        background:
          "repeating-linear-gradient(180deg, rgba(62,90,130,0.04) 0px, transparent 1px, transparent 48px, rgba(62,90,130,0.035) 48px, rgba(62,90,130,0.035) 49px)",
      },
      {
        opacity: 0.1,
        mixBlendMode: "soft-light",
        background:
          "radial-gradient(circle at 6% 50%, rgba(200,200,210,0.25) 0%, transparent 12%)",
      },
    ],
    edgeVignette: {
      opacity: 0.28,
      mixBlendMode: "multiply",
      background:
        "radial-gradient(ellipse 100% 100% at 50% 50%, transparent 55%, rgba(70,82,98,0.08) 100%)",
    },
    atmosphereOpacityMul: 0.95,
    scannedOpacityAdd: 0.03,
    linedOpacityMul: 0.55,
    grainOpacityMul: 1.08,
    globalGradeOpacityMul: 1.02,
    extraCaptionTextShadow: "0 0 12px rgba(252,252,250,0.7)",
  },
  "fabric-linen": {
    id: "fabric-linen",
    label: "Fabric Linen",
    category: "Textile",
    hint: "Warm weave under the collage — tablecloth grain.",
    baseBackground: `
      repeating-linear-gradient(45deg, rgba(120,102,88,0.04) 0px, transparent 1px, transparent 2px, rgba(120,102,88,0.04) 2px, rgba(120,102,88,0.04) 3px),
      repeating-linear-gradient(-35deg, rgba(100,88,76,0.035) 0px, transparent 1px, transparent 3px, rgba(100,88,76,0.035) 3px, rgba(100,88,76,0.035) 4px),
      radial-gradient(ellipse 80% 60% at 50% 40%, rgba(255,248,238,0.4) 0%, transparent 55%),
      linear-gradient(165deg, #ebe4d8 0%, #ddd2c4 50%, #cec2b2 100%)`,
    exportBackgroundColor: "#ddd2c4",
    overlays: [
      {
        opacity: 0.22,
        mixBlendMode: "multiply",
        background:
          "repeating-linear-gradient(0deg, rgba(88,76,64,0.06) 0px, transparent 1px, transparent 4px, rgba(88,76,64,0.04) 4px, rgba(88,76,64,0.04) 5px)",
        filter: "blur(0.25px)",
      },
      {
        opacity: 0.14,
        mixBlendMode: "soft-light",
        background:
          "radial-gradient(ellipse 70% 50% at 30% 70%, rgba(255,240,220,0.2) 0%, transparent 50%)",
      },
    ],
    edgeVignette: {
      opacity: 0.3,
      mixBlendMode: "multiply",
      background:
        "radial-gradient(ellipse 100% 100% at 50% 50%, transparent 45%, rgba(72,62,52,0.11) 100%)",
    },
    atmosphereOpacityMul: 1.08,
    scannedOpacityAdd: 0.025,
    linedOpacityMul: 0.75,
    grainOpacityMul: 1.18,
    globalGradeOpacityMul: 1.06,
    extraCaptionTextShadow: "0 0 16px rgba(255,250,242,0.7)",
  },
  "craft-paper": {
    id: "craft-paper",
    label: "Craft Paper",
    category: "Fiber kraft",
    hint: "Kraft tooth, organic flecks, studio-table brown.",
    baseBackground: `
      radial-gradient(ellipse 55% 45% at 70% 25%, rgba(255,236,210,0.25) 0%, transparent 50%),
      repeating-linear-gradient(12deg, rgba(92,72,52,0.035) 0px, transparent 1px, transparent 4px, rgba(92,72,52,0.02) 4px, rgba(92,72,52,0.02) 5px),
      linear-gradient(188deg, #d8c8b0 0%, #c8b29a 42%, #b89a82 100%)`,
    exportBackgroundColor: "#c8b29a",
    overlays: [
      {
        opacity: 0.28,
        mixBlendMode: "multiply",
        background:
          "radial-gradient(circle at 40% 60%, rgba(72,52,38,0.18) 0%, transparent 40%), radial-gradient(circle at 85% 15%, rgba(110,88,62,0.12) 0%, transparent 38%)",
      },
      {
        opacity: 0.12,
        mixBlendMode: "overlay",
        background:
          "repeating-linear-gradient(90deg, rgba(255,248,235,0.04) 0 2px, transparent 2px 5px)",
      },
    ],
    edgeVignette: {
      opacity: 0.42,
      mixBlendMode: "multiply",
      background:
        "radial-gradient(ellipse 100% 100% at 50% 50%, transparent 40%, rgba(62,48,36,0.18) 100%)",
    },
    atmosphereOpacityMul: 1.15,
    scannedOpacityAdd: 0.045,
    linedOpacityMul: 0.88,
    grainOpacityMul: 1.22,
    globalGradeOpacityMul: 1.1,
    extraCaptionTextShadow:
      "0 0 14px rgba(255,244,228,0.55), 0 1px 0 rgba(255,248,238,0.4)",
  },
  "tracing-paper": {
    id: "tracing-paper",
    label: "Tracing Paper",
    category: "Translucent",
    hint: "Milky vellum, soft folds, graphite haze.",
    baseBackground: `
      linear-gradient(168deg, rgba(255,255,255,0.55) 0%, rgba(244,242,238,0.92) 35%, rgba(232,230,226,0.98) 100%),
      repeating-linear-gradient(93deg, rgba(180,182,188,0.04) 0px, transparent 1px, transparent 5px, rgba(180,182,188,0.03) 5px, rgba(180,182,188,0.03) 6px),
      linear-gradient(178deg, #f2f0ec 0%, #e4e2de 100%)`,
    exportBackgroundColor: "#e8e6e2",
    overlays: [
      {
        opacity: 0.2,
        mixBlendMode: "soft-light",
        background:
          "radial-gradient(ellipse 90% 70% at 50% 20%, rgba(255,255,255,0.5) 0%, transparent 50%)",
      },
      {
        opacity: 0.14,
        mixBlendMode: "multiply",
        background:
          "linear-gradient(105deg, rgba(200,200,208,0.12) 0%, transparent 40%, rgba(200,200,208,0.08) 100%)",
      },
    ],
    edgeVignette: {
      opacity: 0.22,
      mixBlendMode: "multiply",
      background:
        "radial-gradient(ellipse 100% 100% at 50% 50%, transparent 50%, rgba(120,122,128,0.08) 100%)",
    },
    atmosphereOpacityMul: 0.92,
    scannedOpacityAdd: 0.02,
    linedOpacityMul: 0.65,
    grainOpacityMul: 1.05,
    globalGradeOpacityMul: 0.95,
    extraCaptionTextShadow: "0 0 12px rgba(255,255,255,0.85)",
  },
  "botanical-paper": {
    id: "botanical-paper",
    label: "Botanical Paper",
    category: "Organic",
    hint: "Pressed-leaf shadows, green pulp, garden haze.",
    baseBackground: `
      radial-gradient(ellipse 45% 38% at 72% 68%, rgba(92,130,88,0.14) 0%, transparent 55%),
      radial-gradient(ellipse 50% 42% at 18% 32%, rgba(118,148,102,0.12) 0%, transparent 50%),
      repeating-linear-gradient(0deg, rgba(62,88,62,0.025) 0px, transparent 1px, transparent 5px, rgba(62,88,62,0.02) 5px, rgba(62,88,62,0.02) 6px),
      linear-gradient(172deg, #eef2e8 0%, #dde6d8 48%, #ccd8c8 100%)`,
    exportBackgroundColor: "#dde6d8",
    overlays: [
      {
        opacity: 0.24,
        mixBlendMode: "multiply",
        background:
          "radial-gradient(ellipse 60% 45% at 55% 75%, rgba(48,72,48,0.14) 0%, transparent 55%)",
      },
      {
        opacity: 0.1,
        mixBlendMode: "soft-light",
        background:
          "radial-gradient(ellipse 80% 30% at 40% 10%, rgba(255,255,250,0.35) 0%, transparent 45%)",
      },
    ],
    edgeVignette: {
      opacity: 0.3,
      mixBlendMode: "multiply",
      background:
        "radial-gradient(ellipse 100% 100% at 50% 50%, transparent 48%, rgba(52,72,52,0.1) 100%)",
    },
    atmosphereOpacityMul: 1.1,
    scannedOpacityAdd: 0.03,
    linedOpacityMul: 0.85,
    grainOpacityMul: 1.1,
    globalGradeOpacityMul: 1.04,
    extraCaptionTextShadow: "0 0 14px rgba(244,252,244,0.75)",
  },
  "blueprint-paper": {
    id: "blueprint-paper",
    label: "Blueprint Paper",
    category: "Cool technical",
    hint: "Cyanotype wash, chalk grid, erased lines.",
    baseBackground: `
      repeating-linear-gradient(0deg, rgba(255,255,255,0.09) 0px, transparent 1px, transparent 17px, rgba(255,255,255,0.07) 17px, rgba(255,255,255,0.07) 18px),
      repeating-linear-gradient(90deg, rgba(255,255,255,0.07) 0px, transparent 1px, transparent 17px, rgba(255,255,255,0.055) 17px, rgba(255,255,255,0.055) 18px),
      radial-gradient(ellipse 90% 70% at 50% 100%, rgba(72,110,148,0.12) 0%, transparent 50%),
      linear-gradient(185deg, #dce6f0 0%, #c8d4e4 52%, #b4c4d8 100%)`,
    exportBackgroundColor: "#c8d4e4",
    overlays: [
      {
        opacity: 0.22,
        mixBlendMode: "multiply",
        background:
          "radial-gradient(ellipse 70% 50% at 30% 25%, rgba(40,72,108,0.14) 0%, transparent 50%)",
      },
      {
        opacity: 0.14,
        mixBlendMode: "soft-light",
        background:
          "linear-gradient(195deg, rgba(255,255,255,0.2) 0%, transparent 45%, rgba(30,52,78,0.08) 100%)",
      },
    ],
    edgeVignette: {
      opacity: 0.34,
      mixBlendMode: "multiply",
      background:
        "radial-gradient(ellipse 100% 100% at 50% 50%, transparent 42%, rgba(28,48,72,0.12) 100%)",
    },
    atmosphereOpacityMul: 1.08,
    scannedOpacityAdd: 0.035,
    linedOpacityMul: 0.7,
    grainOpacityMul: 1.15,
    globalGradeOpacityMul: 1.06,
    extraCaptionTextShadow:
      "0 0 16px rgba(236,242,252,0.9), 0 0 8px rgba(255,255,255,0.65)",
  },
  "watercolor-wash": {
    id: "watercolor-wash",
    label: "Watercolor Wash",
    category: "Painterly",
    hint: "Bleeding pigment pools, paper cockle.",
    baseBackground: `
      radial-gradient(ellipse 55% 48% at 28% 38%, rgba(220,200,235,0.22) 0%, transparent 50%),
      radial-gradient(ellipse 50% 45% at 78% 62%, rgba(200,220,235,0.2) 0%, transparent 48%),
      radial-gradient(ellipse 60% 50% at 52% 82%, rgba(235,215,195,0.25) 0%, transparent 52%),
      linear-gradient(175deg, #f4f0ee 0%, #e8e2de 45%, #dcd4d0 100%)`,
    exportBackgroundColor: "#e8e2de",
    overlays: [
      {
        opacity: 0.2,
        mixBlendMode: "multiply",
        background:
          "radial-gradient(ellipse 80% 60% at 45% 50%, rgba(140,120,160,0.08) 0%, transparent 55%)",
      },
      {
        opacity: 0.16,
        mixBlendMode: "soft-light",
        background:
          "radial-gradient(circle at 20% 80%, rgba(255,240,230,0.35) 0%, transparent 40%)",
      },
    ],
    edgeVignette: {
      opacity: 0.26,
      mixBlendMode: "multiply",
      background:
        "radial-gradient(ellipse 100% 100% at 50% 50%, transparent 50%, rgba(88,78,72,0.09) 100%)",
    },
    atmosphereOpacityMul: 1.06,
    scannedOpacityAdd: 0.03,
    linedOpacityMul: 0.8,
    grainOpacityMul: 1.12,
    globalGradeOpacityMul: 1.04,
    extraCaptionTextShadow: "0 0 14px rgba(255,252,250,0.72)",
  },
  "film-grain-paper": {
    id: "film-grain-paper",
    label: "Film Grain Paper",
    category: "Analog",
    hint: "Silver halide grit, cool neutral base.",
    baseBackground: `
      repeating-linear-gradient(0deg, rgba(48,48,52,0.035) 0px, transparent 1px, transparent 2px, rgba(48,48,52,0.02) 2px, rgba(48,48,52,0.02) 3px),
      linear-gradient(178deg, #e6e6ea 0%, #d8d8de 50%, #cacad2 100%)`,
    exportBackgroundColor: "#d8d8de",
    overlays: [
      {
        opacity: 0.18,
        mixBlendMode: "multiply",
        background:
          "radial-gradient(ellipse 100% 80% at 50% 0%, rgba(40,40,48,0.1) 0%, transparent 45%)",
      },
      {
        opacity: 0.22,
        mixBlendMode: "overlay",
        background:
          "repeating-linear-gradient(45deg, rgba(255,255,255,0.04) 0px, transparent 1px, transparent 3px, rgba(0,0,0,0.02) 3px, rgba(0,0,0,0.02) 4px)",
      },
    ],
    edgeVignette: {
      opacity: 0.35,
      mixBlendMode: "multiply",
      background:
        "radial-gradient(ellipse 100% 100% at 50% 50%, transparent 44%, rgba(32,32,40,0.14) 100%)",
    },
    atmosphereOpacityMul: 1.02,
    scannedOpacityAdd: 0.05,
    linedOpacityMul: 0.95,
    grainOpacityMul: 1.45,
    globalGradeOpacityMul: 1.08,
    extraCaptionTextShadow: "0 0 12px rgba(248,248,252,0.8)",
  },
  "soft-cream-archive": {
    id: "soft-cream-archive",
    label: "Soft Cream Archive",
    category: "Archival paper",
    hint: "Museum drawer cream — gentle, hushed.",
    baseBackground: `
      radial-gradient(ellipse 65% 50% at 20% 22%, rgba(255,252,246,0.65) 0%, transparent 52%),
      radial-gradient(ellipse 55% 45% at 88% 78%, rgba(232,218,205,0.28) 0%, transparent 48%),
      repeating-linear-gradient(2deg, rgba(72,68,62,0.018) 0px, transparent 1px, transparent 4px, rgba(72,68,62,0.012) 4px, rgba(72,68,62,0.012) 5px),
      linear-gradient(172deg, #faf7f2 0%, #f0ebe4 48%, #e4dcd2 100%)`,
    exportBackgroundColor: "#f0ebe4",
    overlays: [
      {
        opacity: 0.14,
        mixBlendMode: "multiply",
        background:
          "radial-gradient(ellipse 90% 70% at 50% 100%, rgba(100,88,78,0.06) 0%, transparent 45%)",
      },
      {
        opacity: 0.1,
        mixBlendMode: "soft-light",
        background:
          "linear-gradient(168deg, rgba(255,255,255,0.25) 0%, transparent 55%)",
      },
    ],
    edgeVignette: {
      opacity: 0.24,
      mixBlendMode: "multiply",
      background:
        "radial-gradient(ellipse 100% 100% at 50% 50%, transparent 58%, rgba(92,82,74,0.07) 100%)",
    },
    atmosphereOpacityMul: 0.98,
    scannedOpacityAdd: 0.02,
    linedOpacityMul: 1.0,
    grainOpacityMul: 1.0,
    globalGradeOpacityMul: 0.98,
    extraCaptionTextShadow: "0 0 10px rgba(255,252,248,0.55)",
  },
  "photocopy-texture": {
    id: "photocopy-texture",
    label: "Photocopy Texture",
    category: "Print & ink",
    hint: "Xerox banding, toner speckle, office gray.",
    baseBackground: `
      repeating-linear-gradient(0deg, rgba(42,42,48,0.05) 0px, transparent 1px, transparent 2px, rgba(42,42,48,0.035) 2px, rgba(42,42,48,0.035) 3px),
      repeating-linear-gradient(90deg, rgba(38,38,44,0.04) 0px, transparent 1px, transparent 3px, rgba(38,38,44,0.03) 3px, rgba(38,38,44,0.03) 4px),
      linear-gradient(182deg, #e4e2de 0%, #d8d6d2 45%, #cccac6 100%)`,
    exportBackgroundColor: "#d8d6d2",
    overlays: [
      {
        opacity: 0.26,
        mixBlendMode: "multiply",
        background:
          "linear-gradient(180deg, rgba(35,35,40,0.08) 0%, transparent 18%, transparent 82%, rgba(35,35,40,0.1) 100%)",
      },
      {
        opacity: 0.16,
        mixBlendMode: "soft-light",
        background:
          "repeating-linear-gradient(0deg, rgba(255,255,255,0.06) 0px, transparent 1px, transparent 1px, rgba(0,0,0,0.02) 2px, rgba(0,0,0,0.02) 3px)",
        filter: "blur(0.4px)",
      },
    ],
    edgeVignette: {
      opacity: 0.36,
      mixBlendMode: "multiply",
      background:
        "radial-gradient(ellipse 100% 100% at 50% 50%, transparent 40%, rgba(28,28,32,0.16) 100%)",
    },
    atmosphereOpacityMul: 1.1,
    scannedOpacityAdd: 0.05,
    linedOpacityMul: 1.1,
    grainOpacityMul: 1.35,
    globalGradeOpacityMul: 1.12,
    extraCaptionTextShadow:
      "0 0 14px rgba(252,252,250,0.85), 0 1px 0 rgba(255,255,255,0.5)",
  },
};

export function getCollageBackgroundSurface(id: CollageBackgroundId): CollageBackgroundSurface {
  return COLLAGE_BACKGROUND_SURFACES[id];
}

/** First id is the default when switching to this collage style */
export function suggestedBackgroundIdsForStyle(
  styleId: CollageStyleId,
): CollageBackgroundId[] {
  switch (styleId) {
    case "vintage-zine":
      return ["photocopy-texture", "vintage-newspaper", "film-grain-paper", "grid-paper"];
    case "soft-archive":
      return ["old-book-pages", "soft-cream-archive", "tracing-paper", "fabric-linen"];
    case "desert-dream":
      return ["craft-paper", "watercolor-wash", "fabric-linen", "soft-cream-archive"];
    case "emotional-poster":
      return ["botanical-paper", "watercolor-wash", "soft-cream-archive", "tracing-paper"];
    case "museum-scrapbook":
      return ["craft-paper", "grid-paper", "soft-cream-archive", "film-grain-paper"];
    case "illustrated-collage":
      return ["watercolor-wash", "botanical-paper", "tracing-paper", "craft-paper"];
    case "quiet-memory":
    default:
      return ["blueprint-paper", "tracing-paper", "film-grain-paper", "soft-cream-archive"];
  }
}

export const COLLAGE_BACKGROUND_CATALOG: { category: string; ids: CollageBackgroundId[] }[] =
  [
    {
      category: "Print & ink",
      ids: ["vintage-newspaper", "photocopy-texture", "grid-paper", "blueprint-paper"],
    },
    {
      category: "Archival paper",
      ids: ["old-book-pages", "soft-cream-archive", "tracing-paper"],
    },
    { category: "Organic & painterly", ids: ["botanical-paper", "watercolor-wash"] },
    { category: "Fiber & textile", ids: ["craft-paper", "fabric-linen"] },
    { category: "Analog", ids: ["film-grain-paper"] },
  ];
