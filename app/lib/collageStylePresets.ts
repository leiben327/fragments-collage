export const COLLAGE_STYLE_IDS = [
  "vintage-zine",
  "soft-archive",
  "desert-dream",
  "emotional-poster",
  "tactile-memory",
  "quiet-memory",
  "illustrated-collage",
  "riso-dream",
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
  | "illustrated-surreal"
  | "riso-graphic";

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
  /** archive = rough desk tear; xerox = cleaner; painted = cut-paper / gouache collage; riso = print sheet edge */
  tearEdgeIntensity: "archive" | "xerox" | "painted" | "riso";
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

/** Warm kraft, cream, and foxing for hand-assembled memory collages */
const H_TACTILE = [
  "linear-gradient(145deg, #f4efe6 0%, #dfd4c6 100%)",
  "linear-gradient(162deg, #ebe4d9 0%, #cbc0b0 100%)",
  "linear-gradient(95deg, #f0ebe2 0%, #cfc4b4 100%)",
  "linear-gradient(178deg, #e8dfd4 0%, #bcb2a4 100%)",
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
  "tactile-memory": {
    id: "tactile-memory",
    label: "Tactile Memory",
    blurb:
      "Found paper, masking tape, and faded ink — a hand-assembled drawer of almost-lost days.",
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
      decorClusterBias: 0.36,
      rotationRange: 8,
      radiusMul: 1.02,
      scrapPalette: H_TACTILE,
      tapeOpacityMin: 0.42,
      tapeOpacityMax: 0.68,
      tapeCountMin: 3,
      tapeCountMax: 5,
      scrapCountMin: 4,
      scrapCountMax: 7,
      labelCountMin: 2,
      labelCountMax: 3,
      behindScaleMin: 1.06,
      behindScaleMax: 1.2,
      tearEdgeIntensity: "archive",
      labelPool: ["keep", "passage", "soft fold", "held", "yours", "still"],
    },
    boardBackground:
      "radial-gradient(ellipse 52% 44% at 82% 18%, rgba(200,210,228,0.22) 0%, transparent 50%), radial-gradient(ellipse 58% 48% at 14% 82%, rgba(225,205,190,0.35) 0%, transparent 52%), repeating-linear-gradient(0deg, rgba(72,62,52,0.02) 0px, transparent 1px, transparent 6px, rgba(72,62,52,0.018) 6px, rgba(72,62,52,0.018) 7px), linear-gradient(172deg, #f6f2ec 0%, #ebe4da 46%, #dfd6cc 100%)",
    exportBackgroundColor: "#ebe4da",
    linedTextureOpacity: 0.11,
    linedAngleDeg: -9,
    grainSvgOpacity: 0.12,
    scannedPaperOpacity: 0.095,
    scannedAngleDeg: -8,
    atmosphereGradient:
      "linear-gradient(188deg, rgba(195,208,226,0.14) 0%, transparent 42%, rgba(95,82,72,0.06) 100%)",
    atmosphereBlendMode: "multiply",
    globalGradeGradient:
      "linear-gradient(198deg, rgba(255,252,246,0.1) 0%, transparent 48%, rgba(180,172,158,0.07) 100%)",
    globalGradeOpacity: 0.13,
    globalGradeBlendMode: "soft-light",
    pieceInkOverlay:
      "radial-gradient(ellipse 62% 50% at 38% 38%, rgba(255,252,248,0.2) 0%, transparent 50%), linear-gradient(188deg, rgba(210,218,232,0.12) 0%, transparent 50%, rgba(48,42,38,0.08) 100%)",
    pieceInkOverlayOpacity: 0.32,
    pieceInkOverlayBlend: "multiply",
    innerVignette: "inset 0 0 92px rgba(55,50,46,0.055)",
    tapeGradient:
      "linear-gradient(92deg, rgba(255,250,238,0.55) 0%, rgba(235,226,212,0.85) 45%, rgba(248,238,226,0.52) 100%)",
    tapeBoxShadow:
      "0 1px 4px rgba(61,56,48,0.11), inset 0 0 0 1px rgba(255,252,246,0.35)",
    frameClasses:
      "torn rounded-[4px_8px_6px_5px] ring-1 ring-stone-300/35 shadow-[8px_24px_40px_rgba(58,52,46,0.14),2px_3px_0_rgba(90,82,74,0.05)]",
    behindGradient:
      "linear-gradient(142deg, #faf7f2 0%, #e8e0d6 52%, #d8cec2 100%)",
    unifiedImageFilter:
      "saturate(0.87) hue-rotate(4deg) contrast(1.02) brightness(1.02) sepia(0.08)",
    titleFontClass: "font-hand-shadows",
    captionFontClass: "font-hand-indie",
    captionColor: "rgba(52, 48, 44, 0.9)",
    captionTextShadow: "0 1px 0 rgba(255,252,246,0.78), 0 0 20px rgba(252,248,242,0.5)",
    titleColor: "rgba(48, 44, 40, 0.9)",
    labelFontClass: "font-hand-shadows",
    labelColor: "rgba(58, 52, 48, 0.84)",
    labelBg: "rgba(255,252,248,0.42)",
    labelBorder: "1px dashed rgba(88,82,74,0.2)",
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
  "riso-dream": {
    id: "riso-dream",
    label: "Riso Dream",
    blurb:
      "Fluorescent inks, misregistered layers, and zine-poster logic — photographs dissolve into a printed dream.",
    hints: {
      layoutProfile: "riso-graphic",
      focalWidthMin: 32,
      focalWidthMax: 44,
      focalHeightMin: 34,
      focalHeightMax: 46,
      secondaryWidthMin: 22,
      secondaryWidthMax: 38,
      secondaryHeightMin: 24,
      secondaryHeightMax: 40,
      tertiaryWidthMin: 12,
      tertiaryWidthMax: 24,
      tertiaryHeightMin: 14,
      tertiaryHeightMax: 28,
      decorClusterBias: 0.22,
      rotationRange: 11,
      radiusMul: 1.02,
      scrapPalette: [
        "linear-gradient(118deg, rgba(255,52,152,0.72) 0%, rgba(255,120,90,0.38) 100%)",
        "linear-gradient(142deg, rgba(0,210,220,0.55) 0%, rgba(20,70,120,0.42) 100%)",
        "linear-gradient(168deg, rgba(255,200,255,0.5) 0%, rgba(255,60,130,0.35) 100%)",
        "linear-gradient(92deg, rgba(16,38,78,0.65) 0%, rgba(0,160,175,0.28) 100%)",
        "linear-gradient(155deg, rgba(255,248,235,0.55) 0%, rgba(255,180,120,0.22) 100%)",
      ],
      tapeOpacityMin: 0.22,
      tapeOpacityMax: 0.38,
      tapeCountMin: 0,
      tapeCountMax: 1,
      scrapCountMin: 4,
      scrapCountMax: 9,
      labelCountMin: 0,
      labelCountMax: 1,
      behindScaleMin: 1.01,
      behindScaleMax: 1.08,
      tearEdgeIntensity: "riso",
      labelPool: ["RISO", "DRIFT", "INK", "RUN", "PLATE", "GHOST"],
    },
    boardBackground:
      "radial-gradient(ellipse 70% 55% at 18% 22%, rgba(255,80,160,0.45) 0%, transparent 52%), radial-gradient(ellipse 55% 48% at 82% 18%, rgba(0,200,210,0.35) 0%, transparent 50%), radial-gradient(ellipse 60% 50% at 48% 88%, rgba(255,130,70,0.22) 0%, transparent 55%), linear-gradient(168deg, #f7f2e8 0%, #efe6dc 38%, #e2ecf2 68%, #dce8ee 100%)",
    exportBackgroundColor: "#f4efe6",
    linedTextureOpacity: 0.05,
    linedAngleDeg: -8,
    grainSvgOpacity: 0.14,
    scannedPaperOpacity: 0.1,
    scannedAngleDeg: -3,
    atmosphereGradient:
      "radial-gradient(ellipse 78% 58% at 42% 38%, rgba(255,60,140,0.14) 0%, transparent 52%), radial-gradient(ellipse 50% 44% at 72% 72%, rgba(0,180,200,0.12) 0%, transparent 55%), radial-gradient(ellipse 45% 40% at 28% 78%, rgba(255,110,60,0.08) 0%, transparent 50%)",
    atmosphereBlendMode: "multiply",
    globalGradeGradient:
      "linear-gradient(198deg, rgba(255,255,252,0.2) 0%, transparent 38%, rgba(12,52,112,0.08) 100%)",
    globalGradeOpacity: 0.12,
    globalGradeBlendMode: "soft-light",
    pieceInkOverlay:
      "linear-gradient(192deg, rgba(255,255,252,0.15) 0%, transparent 45%, rgba(255,52,142,0.08) 100%)",
    pieceInkOverlayOpacity: 0.22,
    pieceInkOverlayBlend: "multiply",
    innerVignette: "inset 0 0 80px rgba(16,52,108,0.07)",
    tapeGradient:
      "linear-gradient(90deg, rgba(255,248,238,0.75) 0%, rgba(0,210,218,0.35) 50%, rgba(255,92,172,0.32) 100%)",
    tapeBoxShadow:
      "1px 2px 0 rgba(255,60,130,0.12), inset 0 0 0 1px rgba(255,255,252,0.35)",
    frameClasses:
      "rounded-[2px_4px_3px_2px] ring-1 ring-[#0c2a54]/25 shadow-[2px_8px_0_rgba(255,52,142,0.12)]",
    behindGradient:
      "linear-gradient(158deg, #fffbf4 0%, rgba(0,206,218,0.22) 42%, rgba(255,238,248,0.92) 100%)",
    unifiedImageFilter: "contrast(1.1) saturate(0.94) brightness(1.03)",
    titleFontClass: "font-display",
    captionFontClass: "font-editorial",
    captionColor: "rgba(12, 42, 78, 0.88)",
    captionTextShadow:
      "0 0 12px rgba(255,248,240,0.75), 0 1px 0 rgba(255,255,255,0.4)",
    titleColor: "rgba(14, 38, 72, 0.92)",
    labelFontClass: "font-display",
    labelColor: "rgba(254,246,238,0.96)",
    labelBg: "rgba(255,48,138,0.72)",
    labelBorder: "1px solid rgba(0,200,212,0.45)",
  },
};

export const DEFAULT_COLLAGE_STYLE: CollageStyleId = "soft-archive";

export function getStylePreset(id: CollageStyleId): CollageStylePreset {
  return COLLAGE_STYLE_PRESETS[id];
}
