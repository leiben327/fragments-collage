/**
 * Social / print export presets + composition kinds for aspect-aware layout
 * (not a uniform stretch of one layout).
 */

export const CANVAS_FORMAT_IDS = [
  "ig-post",
  "ig-story",
  "pinterest",
  "tiktok",
  "desktop-poster",
  "a4-journal",
  "a5-zine",
  "square-polaroid",
] as const;

export type CanvasFormatId = (typeof CANVAS_FORMAT_IDS)[number];

/** Drives placement math in `collageLayout.ts` */
export type CanvasCompositionKind =
  | "vertical-story"
  | "portrait-social"
  | "portrait-editorial"
  | "portrait-journal"
  | "square-balanced"
  | "cinematic-wide";

export type CanvasFormat = {
  id: CanvasFormatId;
  label: string;
  blurb: string;
  exportWidth: number;
  exportHeight: number;
  compositionKind: CanvasCompositionKind;
};

export const CANVAS_FORMATS: readonly CanvasFormat[] = [
  {
    id: "ig-post",
    label: "Instagram Post",
    blurb: "4:5 feed — balanced vertical rhythm.",
    exportWidth: 1080,
    exportHeight: 1350,
    compositionKind: "portrait-social",
  },
  {
    id: "ig-story",
    label: "Instagram Story",
    blurb: "9:16 full-bleed story flow.",
    exportWidth: 1080,
    exportHeight: 1920,
    compositionKind: "vertical-story",
  },
  {
    id: "pinterest",
    label: "Pinterest Poster",
    blurb: "2:3 editorial pillar layout.",
    exportWidth: 1000,
    exportHeight: 1500,
    compositionKind: "portrait-editorial",
  },
  {
    id: "tiktok",
    label: "TikTok cover",
    blurb: "9:16 vertical hero stack.",
    exportWidth: 1080,
    exportHeight: 1920,
    compositionKind: "vertical-story",
  },
  {
    id: "desktop-poster",
    label: "Desktop poster",
    blurb: "16:9 cinematic widescreen.",
    exportWidth: 1920,
    exportHeight: 1080,
    compositionKind: "cinematic-wide",
  },
  {
    id: "a4-journal",
    label: "A4 journal page",
    blurb: "ISO A4 portrait spread.",
    exportWidth: 1240,
    exportHeight: 1754,
    compositionKind: "portrait-journal",
  },
  {
    id: "a5-zine",
    label: "A5 zine",
    blurb: "Handheld zine proportions.",
    exportWidth: 874,
    exportHeight: 1240,
    compositionKind: "portrait-journal",
  },
  {
    id: "square-polaroid",
    label: "Square polaroid",
    blurb: "1:1 centered album frame.",
    exportWidth: 1080,
    exportHeight: 1080,
    compositionKind: "square-balanced",
  },
] as const;

export const DEFAULT_CANVAS_FORMAT_ID: CanvasFormatId = "ig-post";

export function getCanvasFormat(id: CanvasFormatId): CanvasFormat {
  const f = CANVAS_FORMATS.find((x) => x.id === id);
  return f ?? CANVAS_FORMATS[0];
}
