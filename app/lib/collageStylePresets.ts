export const COLLAGE_STYLE_IDS = [
  "vintage-zine",
  "soft-archive",
  "desert-dream",
  "emotional-poster",
  "museum-scrapbook",
  "quiet-memory",
  "illustrated-collage",
] as const;

export type CollageStyleId = (typeof COLLAGE_STYLE_IDS)[number];

/** Drives focal mass, flow, and satellite placement — not random stacking */
export type LayoutProfile =
  | "right-weighted-poster"
  | "left-weighted-poster"
  | "mat-table"
  | "rift-diagonal"
  | "low-museum"
  | "quiet-open"
  | "illustrated-surreal";

export type StyleLayoutHints = {
  layoutProfile: LayoutProfile;
  focalWidthMin: number;
  focalWidthMax: number;
  focalHeightMin: number;
  focalHeightMax: number;
  secondaryWidthMin: number;
  secondaryWidthMax: number;
  secondaryHeightMin: number;
  secondaryHeightMax: number;
  tertiaryWidthMin: number;
  tertiaryWidthMax: number;
  tertiaryHeightMin: number;
  tertiaryHeightMax: number;
  /** 0–1: tapes & scraps drift toward focal for cohesion */
  decorClusterBias: number;
  rotationRange: number;
  radiusMul: number;
  scrapPalette: string[];
  tapeOpacityMin: number;
  tapeOpacityMax: number;
  tapeCountMin: number;
  tapeCountMax: number;
  scrapCountMin: number;
  scrapCountMax: number;
  labelCountMin: number;
  labelCountMax: number;
  behindScaleMin: number;
  behindScaleMax: number;
  labelPool: string[];
  /** archive = rough desk tear; xerox = cleaner; painted = cut-paper / gouache collage */
  tearEdgeIntensity: "archive" | "xerox" | "painted";
};

export type CollageStylePreset = {
  id: CollageStyleId;
  label: string;
  blurb: string;
  hints: StyleLayoutHints;
  boardBackground: string;
  exportBackgroundColor: string;
  linedTextureOpacity: number;
  linedAngleDeg: number;
  grainSvgOpacity: number;
  /** Second paper pass — scan / fiber */
  scannedPaperOpacity: number;
  scannedAngleDeg: number;
  atmosphereGradient: string;
  atmosphereBlendMode: "multiply" | "soft-light" | "overlay" | "normal";
  /** Full-board tonal wash (unifies all layers) */
  globalGradeGradient: string;
  globalGradeOpacity: number;
  globalGradeBlendMode: "multiply" | "soft-light" | "overlay" | "color";
  /** Subtle ink / press fade on each photo (empty = skip) */
  pieceInkOverlay: string;
  pieceInkOverlayOpacity: number;
  pieceInkOverlayBlend: "multiply" | "soft-light" | "overlay";
  /** Pressed / matted edge */
  innerVignette: string;
  tapeGradient: string;
  tapeBoxShadow: string;
  frameClasses: string;
  behindGradient: string;
  /** One filter string for every photograph — tonal unity */
  unifiedImageFilter: string;
  titleFontClass: string;
  captionFontClass: string;
  captionColor: string;
  captionTextShadow: string;
  titleColor: string;
  labelFontClass: string;
  labelColor: string;
  labelBg: string;
  labelBorder: string;
};

const H_SOFT = [
  "linear-gradient(145deg, #f5f0ea 0%, #e4dcd4 100%)",
  "linear-gradient(160deg, #faf6f1 0%, #e2d8cf 100%)",
  "linear-gradient(120deg, #f0ebe4 0%, #ddd3c8 100%)",
];

const H_MUSEUM = [
  "linear-gradient(145deg, #ebe4d8 0%, #cfc4b4 100%)",
  "linear-gradient(160deg, #f0e9de 0%, #c9bba8 100%)",
  "linear-gradient(90deg, #e6dfd4 0%, #b8ab9c 100%)",
];

export const COLLAGE_STYLE_PRESETS: Record<CollageStyleId, CollageStylePreset> = {
  "vintage-zine": {
    id: "vintage-zine",
    label: "Vintage Zine",
    blurb: "Xerox ink, cut lines, and a single loud quiet.",
    hints: {
      layoutProfile: "rift-diagonal",
      focalWidthMin: 38,
      focalWidthMax: 50,
      focalHeightMin: 40,
      focalHeightMax: 52,
      secondaryWidthMin: 24,
      secondaryWidthMax: 36,
      secondaryHeightMin: 24,
      secondaryHeightMax: 38,
      tertiaryWidthMin: 10,
      tertiaryWidthMax: 22,
      tertiaryHeightMin: 12,
      tertiaryHeightMax: 28,
      decorClusterBias: 0.5,
      rotationRange: 11,
      radiusMul: 0.92,
      scrapPalette: [
        "linear-gradient(90deg, #e6e2da 0%, #c8c4bc 100%)",
        "linear-gradient(180deg, #ece8e0 0%, #a8a49c 100%)",
        "linear-gradient(135deg, #eae6de 0%, #9c9890 100%)",
      ],
      tapeOpacityMin: 0.52,
      tapeOpacityMax: 0.82,
      tapeCountMin: 3,
      tapeCountMax: 5,
      scrapCountMin: 3,
      scrapCountMax: 6,
      labelCountMin: 3,
      labelCountMax: 5,
      behindScaleMin: 1.04,
      behindScaleMax: 1.14,
      tearEdgeIntensity: "xerox",
      labelPool: ["ISSUE", "READ", "PASTE", "STATIC", "FIELD", "CUT"],
    },
    boardBackground:
      "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(30,30,30,0.028) 2px, rgba(30,30,30,0.028) 3px), linear-gradient(182deg, #f0ede6 0%, #e2dfd6 55%, #d4d0c8 100%)",
    exportBackgroundColor: "#e8e4dc",
    linedTextureOpacity: 0.16,
    linedAngleDeg: 0,
    grainSvgOpacity: 0.13,
    scannedPaperOpacity: 0.07,
    scannedAngleDeg: -4,
    atmosphereGradient:
      "radial-gradient(ellipse at 40% 25%, rgba(0,0,0,0.06) 0%, transparent 50%)",
    atmosphereBlendMode: "multiply",
    globalGradeGradient:
      "linear-gradient(195deg, rgba(40,38,35,0.07) 0%, transparent 45%, rgba(255,252,245,0.04) 100%)",
    globalGradeOpacity: 0.14,
    globalGradeBlendMode: "multiply",
    pieceInkOverlay:
      "linear-gradient(195deg, rgba(255,255,255,0.12) 0%, transparent 42%, rgba(18,16,14,0.18) 100%)",
    pieceInkOverlayOpacity: 0.38,
    pieceInkOverlayBlend: "multiply",
    innerVignette: "inset 0 0 90px rgba(20,18,16,0.08)",
    tapeGradient:
      "linear-gradient(90deg, #1a1a1a 0%, #2e2e2e 42%, #1a1a1a 100%)",
    tapeBoxShadow: "3px 4px 0 rgba(0,0,0,0.22), inset 0 0 0 1px rgba(255,255,255,0.06)",
    frameClasses:
      "rounded-sm border-[3px] border-[#2a2a2a] shadow-[9px_9px_0_rgba(28,28,28,0.82)]",
    behindGradient:
      "linear-gradient(135deg, #faf8f4 0%, #d8d4cc 100%)",
    unifiedImageFilter:
      "grayscale(0.22) contrast(1.1) brightness(0.97) saturate(0.86)",
    titleFontClass: "font-editorial",
    captionFontClass: "font-editorial",
    captionColor: "rgba(24, 22, 20, 0.93)",
    captionTextShadow: "1px 1px 0 rgba(255,255,255,0.35)",
    titleColor: "rgba(18, 16, 14, 0.95)",
    labelFontClass: "font-editorial",
    labelColor: "#f6f4ee",
    labelBg: "rgba(22,20,18,0.9)",
    labelBorder: "2px solid #141414",
  },
  "soft-archive": {
    id: "soft-archive",
    label: "Soft Archive",
    blurb: "Linen light, whispered contrast, breath between frames.",
    hints: {
      layoutProfile: "quiet-open",
      focalWidthMin: 36,
      focalWidthMax: 48,
      focalHeightMin: 38,
      focalHeightMax: 50,
      secondaryWidthMin: 22,
      secondaryWidthMax: 34,
      secondaryHeightMin: 22,
      secondaryHeightMax: 36,
      tertiaryWidthMin: 9,
      tertiaryWidthMax: 20,
      tertiaryHeightMin: 11,
      tertiaryHeightMax: 26,
      decorClusterBias: 0.32,
      rotationRange: 7,
      radiusMul: 1.02,
      scrapPalette: H_SOFT,
      tapeOpacityMin: 0.34,
      tapeOpacityMax: 0.55,
      tapeCountMin: 2,
      tapeCountMax: 4,
      scrapCountMin: 3,
      scrapCountMax: 5,
      labelCountMin: 2,
      labelCountMax: 3,
      behindScaleMin: 1.06,
      behindScaleMax: 1.18,
      tearEdgeIntensity: "archive",
      labelPool: ["archived", "soft light", "still", "held"],
    },
    boardBackground:
      "radial-gradient(ellipse 65% 48% at 18% 22%, rgba(255,250,246,0.55) 0%, transparent 50%), radial-gradient(ellipse 50% 42% at 88% 78%, rgba(232,212,207,0.22) 0%, transparent 48%), linear-gradient(172deg, #faf7f2 0%, #f0ebe3 48%, #e8e0d8 100%)",
    exportBackgroundColor: "#f4efe8",
    linedTextureOpacity: 0.1,
    linedAngleDeg: -11,
    grainSvgOpacity: 0.1,
    scannedPaperOpacity: 0.06,
    scannedAngleDeg: 8,
    atmosphereGradient:
      "radial-gradient(circle at 55% 45%, rgba(255,252,248,0.45) 0%, rgba(232,200,192,0.1) 100%)",
    atmosphereBlendMode: "soft-light",
    globalGradeGradient:
      "linear-gradient(165deg, rgba(255,240,232,0.12) 0%, transparent 55%, rgba(200,188,180,0.06) 100%)",
    globalGradeOpacity: 0.11,
    globalGradeBlendMode: "soft-light",
    pieceInkOverlay:
      "linear-gradient(168deg, rgba(255,252,248,0.35) 0%, transparent 55%, rgba(92,78,70,0.06) 100%)",
    pieceInkOverlayOpacity: 0.28,
    pieceInkOverlayBlend: "soft-light",
    innerVignette: "inset 0 0 100px rgba(80,70,62,0.05)",
    tapeGradient:
      "linear-gradient(90deg, rgba(255,252,250,0.45) 0%, rgba(232,212,207,0.82) 48%, rgba(255,248,244,0.48) 100%)",
    tapeBoxShadow:
      "0 1px 2px rgba(61,56,50,0.09), inset 0 0 0 1px rgba(255,255,255,0.32)",
    frameClasses:
      "rounded-[6px_10px_8px_7px] ring-2 ring-white/50 shadow-[7px_22px_40px_rgba(61,56,50,0.12)]",
    behindGradient:
      "linear-gradient(135deg, #fffaf6 0%, #e8dcd4 50%, #dccfc6 100%)",
    unifiedImageFilter:
      "sepia(0.14) saturate(0.9) contrast(0.96) brightness(1.04)",
    titleFontClass: "font-hand-indie",
    captionFontClass: "font-hand-indie",
    captionColor: "rgba(68, 58, 54, 0.9)",
    captionTextShadow: "0 1px 0 rgba(255,252,250,0.85)",
    titleColor: "rgba(72, 62, 58, 0.88)",
    labelFontClass: "font-hand-shadows",
    labelColor: "rgba(70, 60, 56, 0.82)",
    labelBg: "rgba(255,252,250,0.5)",
    labelBorder: "1px solid rgba(61,56,50,0.1)",
  },
  "desert-dream": {
    id: "desert-dream",
    label: "Desert Dream",
    blurb: "Heat and dust held in one warm spectrum.",
    hints: {
      layoutProfile: "low-museum",
      focalWidthMin: 42,
      focalWidthMax: 54,
      focalHeightMin: 32,
      focalHeightMax: 44,
      secondaryWidthMin: 26,
      secondaryWidthMax: 38,
      secondaryHeightMin: 26,
      secondaryHeightMax: 40,
      tertiaryWidthMin: 11,
      tertiaryWidthMax: 24,
      tertiaryHeightMin: 14,
      tertiaryHeightMax: 30,
      decorClusterBias: 0.42,
      rotationRange: 9,
      radiusMul: 1.08,
      scrapPalette: [
        "linear-gradient(135deg, #ead8c6 0%, #cfae8c 100%)",
        "linear-gradient(165deg, #f2e4d4 0%, #d8c2a4 100%)",
        "linear-gradient(90deg, #e6d6c4 0%, #c4a882 100%)",
      ],
      tapeOpacityMin: 0.4,
      tapeOpacityMax: 0.68,
      tapeCountMin: 2,
      tapeCountMax: 4,
      scrapCountMin: 3,
      scrapCountMax: 6,
      labelCountMin: 2,
      labelCountMax: 3,
      behindScaleMin: 1.08,
      behindScaleMax: 1.22,
      tearEdgeIntensity: "archive",
      labelPool: ["mirage", "warm air", "horizon", "dust"],
    },
    boardBackground:
      "radial-gradient(ellipse 70% 45% at 75% 18%, #fff6ea 0%, transparent 52%), linear-gradient(198deg, #f7ead8 0%, #e9d6bc 42%, #dcc4a6 100%)",
    exportBackgroundColor: "#f0e4d4",
    linedTextureOpacity: 0.07,
    linedAngleDeg: -7,
    grainSvgOpacity: 0.08,
    scannedPaperOpacity: 0.05,
    scannedAngleDeg: -5,
    atmosphereGradient:
      "linear-gradient(185deg, rgba(255,210,160,0.14) 0%, transparent 42%, rgba(160,110,70,0.08) 100%)",
    atmosphereBlendMode: "multiply",
    globalGradeGradient:
      "linear-gradient(200deg, rgba(200,140,90,0.08) 0%, transparent 50%, rgba(255,230,200,0.06) 100%)",
    globalGradeOpacity: 0.12,
    globalGradeBlendMode: "multiply",
    pieceInkOverlay:
      "linear-gradient(200deg, rgba(255,230,200,0.25) 0%, transparent 40%, rgba(120,75,40,0.1) 100%)",
    pieceInkOverlayOpacity: 0.32,
    pieceInkOverlayBlend: "multiply",
    innerVignette: "inset 0 0 85px rgba(120,80,40,0.06)",
    tapeGradient:
      "linear-gradient(90deg, rgba(255,238,210,0.5) 0%, rgba(210,160,110,0.72) 50%, rgba(255,228,200,0.45) 100%)",
    tapeBoxShadow: "0 2px 5px rgba(90,60,30,0.12), inset 0 0 0 1px rgba(255,240,220,0.22)",
    frameClasses:
      "rounded-[5px_9px_7px_6px] ring-2 ring-amber-50/45 shadow-[8px_24px_36px_rgba(110,75,40,0.14)]",
    behindGradient:
      "linear-gradient(145deg, #fff4e8 0%, #e0c8a4 55%, #cfa882 100%)",
    unifiedImageFilter:
      "sepia(0.32) saturate(1.05) hue-rotate(-10deg) contrast(1.02) brightness(1.02)",
    titleFontClass: "font-hand-indie",
    captionFontClass: "font-hand-indie",
    captionColor: "rgba(88, 62, 42, 0.9)",
    captionTextShadow: "0 1px 0 rgba(255,245,230,0.65)",
    titleColor: "rgba(95, 68, 42, 0.9)",
    labelFontClass: "font-body",
    labelColor: "rgba(82, 58, 38, 0.86)",
    labelBg: "rgba(255,238,218,0.42)",
    labelBorder: "1px solid rgba(140,100,60,0.18)",
  },
  "emotional-poster": {
    id: "emotional-poster",
    label: "Emotional Poster",
    blurb: "One luminous weight, satellites in orbit.",
    hints: {
      layoutProfile: "right-weighted-poster",
      focalWidthMin: 38,
      focalWidthMax: 50,
      focalHeightMin: 40,
      focalHeightMax: 52,
      secondaryWidthMin: 26,
      secondaryWidthMax: 38,
      secondaryHeightMin: 28,
      secondaryHeightMax: 40,
      tertiaryWidthMin: 10,
      tertiaryWidthMax: 20,
      tertiaryHeightMin: 12,
      tertiaryHeightMax: 26,
      decorClusterBias: 0.52,
      rotationRange: 8,
      radiusMul: 0.98,
      scrapPalette: [
        "linear-gradient(135deg, #ebe6de 0%, #d0c8bc 100%)",
        "linear-gradient(160deg, #e8e0d6 0%, #b8b0a4 100%)",
        "linear-gradient(200deg, #f2ebe4 0%, #c4bbb0 100%)",
      ],
      tapeOpacityMin: 0.45,
      tapeOpacityMax: 0.7,
      tapeCountMin: 2,
      tapeCountMax: 4,
      scrapCountMin: 2,
      scrapCountMax: 5,
      labelCountMin: 2,
      labelCountMax: 4,
      behindScaleMin: 1.05,
      behindScaleMax: 1.16,
      tearEdgeIntensity: "archive",
      labelPool: ["HERE", "NOW", "EDGE", "GLOW", "TIDE"],
    },
    boardBackground:
      "radial-gradient(ellipse 55% 50% at 72% 38%, rgba(255,248,240,0.65) 0%, transparent 55%), linear-gradient(178deg, #f4f0ea 0%, #e6dfd6 50%, #dad2c8 100%)",
    exportBackgroundColor: "#ebe4dc",
    linedTextureOpacity: 0.09,
    linedAngleDeg: -9,
    grainSvgOpacity: 0.09,
    scannedPaperOpacity: 0.05,
    scannedAngleDeg: 6,
    atmosphereGradient:
      "radial-gradient(circle at 68% 42%, rgba(255,220,200,0.18) 0%, transparent 45%)",
    atmosphereBlendMode: "overlay",
    globalGradeGradient:
      "linear-gradient(210deg, rgba(255,255,255,0.1) 0%, rgba(80,60,50,0.05) 100%)",
    globalGradeOpacity: 0.1,
    globalGradeBlendMode: "soft-light",
    pieceInkOverlay:
      "radial-gradient(ellipse at 40% 35%, rgba(255,255,255,0.2) 0%, transparent 45%), linear-gradient(180deg, transparent 55%, rgba(45,38,32,0.1) 100%)",
    pieceInkOverlayOpacity: 0.26,
    pieceInkOverlayBlend: "overlay",
    innerVignette: "inset 0 0 70px rgba(45,38,32,0.07)",
    tapeGradient:
      "linear-gradient(90deg, rgba(255,252,248,0.4) 0%, rgba(220,200,185,0.75) 50%, rgba(250,240,232,0.4) 100%)",
    tapeBoxShadow: "0 3px 10px rgba(50,40,35,0.12), inset 0 0 0 1px rgba(255,255,255,0.2)",
    frameClasses:
      "rounded-[4px_8px_6px_5px] ring-1 ring-white/55 shadow-[12px_32px_48px_rgba(45,38,32,0.18)]",
    behindGradient:
      "linear-gradient(145deg, #faf8f4 0%, #e0d8ce 100%)",
    unifiedImageFilter:
      "saturate(0.94) contrast(1.06) brightness(1.02) sepia(0.08)",
    titleFontClass: "font-display",
    captionFontClass: "font-hand-shadows",
    captionColor: "rgba(48, 42, 38, 0.9)",
    captionTextShadow: "0 1px 0 rgba(255,252,248,0.8)",
    titleColor: "rgba(42, 36, 32, 0.92)",
    labelFontClass: "font-editorial",
    labelColor: "rgba(42, 36, 32, 0.88)",
    labelBg: "rgba(255,252,248,0.55)",
    labelBorder: "1px solid rgba(61,56,50,0.12)",
  },
  "museum-scrapbook": {
    id: "museum-scrapbook",
    label: "Museum Scrapbook",
    blurb: "Table case gravity — labels, kraft, and careful overlap.",
    hints: {
      layoutProfile: "mat-table",
      focalWidthMin: 40,
      focalWidthMax: 52,
      focalHeightMin: 42,
      focalHeightMax: 54,
      secondaryWidthMin: 24,
      secondaryWidthMax: 36,
      secondaryHeightMin: 24,
      secondaryHeightMax: 38,
      tertiaryWidthMin: 10,
      tertiaryWidthMax: 22,
      tertiaryHeightMin: 12,
      tertiaryHeightMax: 28,
      decorClusterBias: 0.48,
      rotationRange: 9,
      radiusMul: 1.05,
      scrapPalette: H_MUSEUM,
      tapeOpacityMin: 0.38,
      tapeOpacityMax: 0.62,
      tapeCountMin: 4,
      tapeCountMax: 6,
      scrapCountMin: 4,
      scrapCountMax: 7,
      labelCountMin: 2,
      labelCountMax: 4,
      behindScaleMin: 1.1,
      behindScaleMax: 1.24,
      tearEdgeIntensity: "archive",
      labelPool: ["catalog", "fragile", "held", "from the wall"],
    },
    boardBackground:
      "linear-gradient(170deg, #f3eee6 0%, #e8e0d4 38%, #ddd4c6 100%)",
    exportBackgroundColor: "#e9e2d6",
    linedTextureOpacity: 0.14,
    linedAngleDeg: -10,
    grainSvgOpacity: 0.11,
    scannedPaperOpacity: 0.08,
    scannedAngleDeg: -11,
    atmosphereGradient:
      "radial-gradient(ellipse at 50% 100%, rgba(90,70,55,0.07) 0%, transparent 42%)",
    atmosphereBlendMode: "multiply",
    globalGradeGradient:
      "linear-gradient(180deg, rgba(255,252,246,0.06) 0%, rgba(100,85,70,0.05) 100%)",
    globalGradeOpacity: 0.11,
    globalGradeBlendMode: "multiply",
    pieceInkOverlay:
      "linear-gradient(175deg, rgba(255,252,246,0.12) 0%, transparent 48%, rgba(55,48,40,0.12) 100%)",
    pieceInkOverlayOpacity: 0.34,
    pieceInkOverlayBlend: "multiply",
    innerVignette: "inset 0 0 95px rgba(55,48,40,0.06)",
    tapeGradient:
      "linear-gradient(90deg, rgba(250,247,242,0.42) 0%, rgba(232,212,207,0.88) 48%, rgba(245,236,228,0.45) 100%)",
    tapeBoxShadow:
      "0 1px 3px rgba(61,56,50,0.12), inset 0 0 0 1px rgba(61,56,50,0.06)",
    frameClasses:
      "torn rounded-[3px_7px_5px_4px] ring-1 ring-ink/12 shadow-[9px_26px_44px_rgba(61,56,50,0.16),2px_3px_0_rgba(61,56,50,0.06)]",
    behindGradient:
      "linear-gradient(135deg, #faf6ef 0%, #d8cfc2 52%, #c9bba8 100%)",
    unifiedImageFilter:
      "sepia(0.1) saturate(0.93) contrast(1.03) brightness(1.01)",
    titleFontClass: "font-hand-shadows",
    captionFontClass: "font-caption",
    captionColor: "rgba(52, 46, 40, 0.9)",
    captionTextShadow: "0 1px 0 rgba(255,252,248,0.75)",
    titleColor: "rgba(55, 48, 42, 0.9)",
    labelFontClass: "font-caption",
    labelColor: "rgba(52, 46, 40, 0.85)",
    labelBg: "rgba(255,252,248,0.48)",
    labelBorder: "1px dashed rgba(61,56,50,0.22)",
  },
  "quiet-memory": {
    id: "quiet-memory",
    label: "Quiet Memory",
    blurb: "Cool air over warm paper — distance and closeness at once.",
    hints: {
      layoutProfile: "left-weighted-poster",
      focalWidthMin: 36,
      focalWidthMax: 46,
      focalHeightMin: 38,
      focalHeightMax: 50,
      secondaryWidthMin: 22,
      secondaryWidthMax: 34,
      secondaryHeightMin: 22,
      secondaryHeightMax: 36,
      tertiaryWidthMin: 9,
      tertiaryWidthMax: 19,
      tertiaryHeightMin: 11,
      tertiaryHeightMax: 26,
      decorClusterBias: 0.3,
      rotationRange: 6,
      radiusMul: 1.0,
      scrapPalette: [
        "linear-gradient(135deg, #e2e6ec 0%, #c4ccd8 100%)",
        "linear-gradient(160deg, #eaeef4 0%, #b8c2d0 100%)",
        "linear-gradient(200deg, #dce0e8 0%, #9ca8bc 100%)",
      ],
      tapeOpacityMin: 0.36,
      tapeOpacityMax: 0.58,
      tapeCountMin: 2,
      tapeCountMax: 3,
      scrapCountMin: 2,
      scrapCountMax: 5,
      labelCountMin: 1,
      labelCountMax: 3,
      behindScaleMin: 1.05,
      behindScaleMax: 1.17,
      tearEdgeIntensity: "archive",
      labelPool: ["blue hour", "hush", "far", "still"],
    },
    boardBackground:
      "radial-gradient(ellipse 60% 48% at 50% 0%, rgba(210,218,232,0.45) 0%, transparent 55%), linear-gradient(186deg, #eceef4 0%, #d8dde6 48%, #c8d0dc 100%)",
    exportBackgroundColor: "#dce2ea",
    linedTextureOpacity: 0.09,
    linedAngleDeg: -8,
    grainSvgOpacity: 0.1,
    scannedPaperOpacity: 0.05,
    scannedAngleDeg: 7,
    atmosphereGradient:
      "linear-gradient(185deg, rgba(50,65,90,0.1) 0%, transparent 48%, rgba(30,40,58,0.08) 100%)",
    atmosphereBlendMode: "multiply",
    globalGradeGradient:
      "linear-gradient(195deg, rgba(200,210,230,0.12) 0%, transparent 55%, rgba(255,252,248,0.05) 100%)",
    globalGradeOpacity: 0.12,
    globalGradeBlendMode: "soft-light",
    pieceInkOverlay:
      "linear-gradient(200deg, rgba(200,210,230,0.22) 0%, transparent 45%, rgba(24,32,52,0.14) 100%)",
    pieceInkOverlayOpacity: 0.36,
    pieceInkOverlayBlend: "multiply",
    innerVignette: "inset 0 0 88px rgba(25,35,55,0.07)",
    tapeGradient:
      "linear-gradient(90deg, rgba(230,236,248,0.55) 0%, rgba(150,165,190,0.5) 50%, rgba(215,222,236,0.48) 100%)",
    tapeBoxShadow: "0 2px 6px rgba(25,35,55,0.12), inset 0 0 0 1px rgba(255,255,255,0.14)",
    frameClasses:
      "rounded-[4px_7px_6px_5px] border border-slate-400/30 ring-1 ring-slate-200/35 shadow-[6px_20px_38px_rgba(30,42,62,0.14)]",
    behindGradient:
      "linear-gradient(145deg, #f0f2f8 0%, #b4bcc8 100%)",
    unifiedImageFilter:
      "saturate(0.86) hue-rotate(8deg) contrast(1.04) brightness(0.98)",
    titleFontClass: "font-caption",
    captionFontClass: "font-caption",
    captionColor: "rgba(28, 36, 52, 0.9)",
    captionTextShadow: "0 1px 0 rgba(236,240,252,0.55)",
    titleColor: "rgba(24, 32, 48, 0.92)",
    labelFontClass: "font-editorial",
    labelColor: "rgba(236,240,252,0.94)",
    labelBg: "rgba(28, 36, 52, 0.75)",
    labelBorder: "1px solid rgba(170,185,210,0.35)",
  },
  "illustrated-collage": {
    id: "illustrated-collage",
    label: "Illustrated Collage",
    blurb:
      "Painted paper, ink doodles, and dream logic — photos drift through a hand-made scene.",
    hints: {
      layoutProfile: "illustrated-surreal",
      focalWidthMin: 28,
      focalWidthMax: 40,
      focalHeightMin: 30,
      focalHeightMax: 44,
      secondaryWidthMin: 20,
      secondaryWidthMax: 36,
      secondaryHeightMin: 22,
      secondaryHeightMax: 40,
      tertiaryWidthMin: 10,
      tertiaryWidthMax: 28,
      tertiaryHeightMin: 12,
      tertiaryHeightMax: 30,
      decorClusterBias: 0.48,
      rotationRange: 14,
      radiusMul: 1.12,
      scrapPalette: [
        "linear-gradient(135deg, rgba(255,200,190,0.95) 0%, rgba(255,140,120,0.55) 100%)",
        "linear-gradient(160deg, rgba(190,230,220,0.92) 0%, rgba(80,160,150,0.45) 100%)",
        "linear-gradient(200deg, rgba(255,236,160,0.9) 0%, rgba(255,180,90,0.5) 100%)",
        "linear-gradient(120deg, rgba(200,210,255,0.88) 0%, rgba(120,130,210,0.42) 100%)",
        "linear-gradient(175deg, rgba(240,220,255,0.9) 0%, rgba(180,140,220,0.48) 100%)",
      ],
      tapeOpacityMin: 0.34,
      tapeOpacityMax: 0.55,
      tapeCountMin: 2,
      tapeCountMax: 4,
      scrapCountMin: 4,
      scrapCountMax: 8,
      labelCountMin: 1,
      labelCountMax: 2,
      behindScaleMin: 1.02,
      behindScaleMax: 1.14,
      tearEdgeIntensity: "painted",
      labelPool: ["here", "float", "soft", "glow", "ripple"],
    },
    boardBackground:
      "radial-gradient(ellipse 70% 55% at 22% 18%, rgba(255,220,200,0.5) 0%, transparent 52%), radial-gradient(ellipse 55% 50% at 82% 28%, rgba(180,220,255,0.35) 0%, transparent 48%), radial-gradient(ellipse 60% 45% at 48% 88%, rgba(200,255,210,0.28) 0%, transparent 50%), linear-gradient(168deg, #f2ebe4 0%, #e4d8ec 38%, #d4e8f0 72%, #c8e0dc 100%)",
    exportBackgroundColor: "#e8e0ec",
    linedTextureOpacity: 0.06,
    linedAngleDeg: -14,
    grainSvgOpacity: 0.11,
    scannedPaperOpacity: 0.06,
    scannedAngleDeg: -6,
    atmosphereGradient:
      "radial-gradient(ellipse 80% 60% at 40% 45%, rgba(255,200,190,0.18) 0%, transparent 50%), radial-gradient(ellipse 55% 45% at 70% 70%, rgba(120,170,255,0.12) 0%, transparent 55%)",
    atmosphereBlendMode: "soft-light",
    globalGradeGradient:
      "linear-gradient(195deg, rgba(255,255,255,0.12) 0%, transparent 40%, rgba(90,120,160,0.08) 100%)",
    globalGradeOpacity: 0.14,
    globalGradeBlendMode: "soft-light",
    pieceInkOverlay:
      "radial-gradient(ellipse 65% 55% at 40% 40%, rgba(255,240,230,0.35) 0%, transparent 55%), linear-gradient(185deg, transparent 35%, rgba(80,110,160,0.12) 100%)",
    pieceInkOverlayOpacity: 0.28,
    pieceInkOverlayBlend: "soft-light",
    innerVignette: "inset 0 0 72px rgba(45,55,90,0.06)",
    tapeGradient:
      "linear-gradient(90deg, rgba(255,252,250,0.55) 0%, rgba(200,210,240,0.55) 50%, rgba(255,236,220,0.5) 100%)",
    tapeBoxShadow: "0 2px 8px rgba(50,60,100,0.1), inset 0 0 0 1px rgba(255,255,255,0.28)",
    frameClasses:
      "rounded-[8px_12px_10px_9px] ring-2 ring-white/40 shadow-[8px_24px_40px_rgba(60,80,120,0.12)]",
    behindGradient:
      "linear-gradient(155deg, #fff8f4 0%, #e8dcf8 40%, #d0e8f4 100%)",
    unifiedImageFilter:
      "saturate(1.08) contrast(1.03) brightness(1.04) hue-rotate(-4deg)",
    titleFontClass: "font-hand-indie",
    captionFontClass: "font-hand-indie",
    captionColor: "rgba(38, 42, 72, 0.9)",
    captionTextShadow: "0 0 14px rgba(255,252,250,0.75), 0 1px 0 rgba(255,255,255,0.5)",
    titleColor: "rgba(32, 36, 62, 0.92)",
    labelFontClass: "font-hand-shadows",
    labelColor: "rgba(42, 48, 78, 0.88)",
    labelBg: "rgba(255,252,248,0.55)",
    labelBorder: "1px solid rgba(100,120,180,0.2)",
  },
};

export const DEFAULT_COLLAGE_STYLE: CollageStyleId = "soft-archive";

export function getStylePreset(id: CollageStyleId): CollageStylePreset {
  return COLLAGE_STYLE_PRESETS[id];
}
