import type { CSSProperties } from "react";
import type { CollageLayoutResult } from "./collageLayout";

/** Mood line only — maps to CSS `font-family` (Google via `next/font` variables + stacks). */
export const MOOD_FONT_IDS = [
  "serif-editorial",
  "soft-classic",
  "handwritten",
  "typewriter",
  "poetic-script",
  "modern-clean",
] as const;

export type MoodFontId = (typeof MOOD_FONT_IDS)[number];

export type MoodFontSizePresetId = "small" | "medium" | "large" | "xl";

export type MoodTextPositionId =
  | "follow-layout"
  | "lower-third"
  | "center-quiet"
  | "upper-ribbon";

export const MOOD_FONT_OPTIONS: {
  id: MoodFontId;
  label: string;
  /** Human-readable stack for docs; actual CSS uses `moodFontFamilyCss`. */
  blurb: string;
}[] = [
  { id: "serif-editorial", label: "Serif editorial", blurb: "Georgia, serif" },
  {
    id: "soft-classic",
    label: "Soft classic",
    blurb: "Cormorant Garamond, serif",
  },
  { id: "handwritten", label: "Handwritten", blurb: "Shadows Into Light, cursive" },
  { id: "typewriter", label: "Typewriter", blurb: "Special Elite, monospace" },
  { id: "poetic-script", label: "Poetic script", blurb: "Homemade Apple, cursive" },
  { id: "modern-clean", label: "Modern clean", blurb: "Inter, sans-serif" },
];

export const MOOD_FONT_SIZE_PRESETS: {
  id: MoodFontSizePresetId;
  label: string;
  px: number;
}[] = [
  { id: "small", label: "Small", px: 16 },
  { id: "medium", label: "Medium", px: 20 },
  { id: "large", label: "Large", px: 26 },
  { id: "xl", label: "Extra large", px: 34 },
];

export const MOOD_TEXT_POSITION_OPTIONS: {
  id: MoodTextPositionId;
  label: string;
  hint: string;
}[] = [
  { id: "follow-layout", label: "Along layout", hint: "Uses the shuffle anchor for this collage." },
  { id: "lower-third", label: "Lower band", hint: "Wide ribbon near the bottom edge." },
  { id: "center-quiet", label: "Center hush", hint: "Breathing room in the middle." },
  { id: "upper-ribbon", label: "Upper band", hint: "A quiet ribbon along the upper area." },
];

export const DEFAULT_MOOD_FONT_ID: MoodFontId = "soft-classic";
export const DEFAULT_MOOD_FONT_SIZE_PX = 20;
export const DEFAULT_MOOD_TEXT_POSITION_ID: MoodTextPositionId = "follow-layout";

export function moodFontFamilyCss(id: MoodFontId): string {
  switch (id) {
    case "serif-editorial":
      return 'Georgia, "Times New Roman", Times, serif';
    case "soft-classic":
      return "var(--font-cormorant), Georgia, serif";
    case "handwritten":
      return "var(--font-shadows), cursive";
    case "typewriter":
      return 'var(--font-special-elite-mood), "Courier New", Courier, monospace';
    case "poetic-script":
      return "var(--font-homemade-apple-mood), cursive";
    case "modern-clean":
      return 'var(--font-inter-mood), ui-sans-serif, system-ui, sans-serif';
    default:
      return "Georgia, serif";
  }
}

export function moodCaptionTypographyStyle(args: {
  fontId: MoodFontId;
  fontSizePx: number;
}): CSSProperties {
  return {
    fontFamily: moodFontFamilyCss(args.fontId),
    fontSize: `${args.fontSizePx}px`,
    lineHeight: 1.33,
    wordWrap: "break-word",
    overflowWrap: "anywhere",
    whiteSpace: "normal",
    hyphens: "auto",
    WebkitHyphens: "auto",
    maxWidth: "100%",
    margin: 0,
  };
}

/** Outer “paper box” for the mood line — percentages are relative to the inner collage board. */
export function getMoodCaptionShellStyle(
  positionId: MoodTextPositionId,
  layout: CollageLayoutResult,
): {
  left: string;
  top: string;
  width: string;
  height: string;
  justifyContent: "flex-start" | "center" | "flex-end";
  transform: string;
  transformOrigin: string;
} {
  const tilt = layout.captionTilt;
  switch (positionId) {
    case "follow-layout":
      return {
        left: `${layout.captionLeftPct}%`,
        top: `${layout.captionTopPct}%`,
        width: "58%",
        height: "36%",
        justifyContent: "flex-end",
        transform: `rotate(${tilt}deg)`,
        transformOrigin: "left top",
      };
    case "lower-third":
      return {
        left: "7%",
        top: "62%",
        width: "86%",
        height: "34%",
        justifyContent: "flex-end",
        transform: `rotate(${tilt * 0.55}deg)`,
        transformOrigin: "8% 92%",
      };
    case "center-quiet":
      return {
        left: "10%",
        top: "36%",
        width: "80%",
        height: "38%",
        justifyContent: "center",
        transform: `rotate(${tilt * 0.35}deg)`,
        transformOrigin: "50% 50%",
      };
    case "upper-ribbon":
      return {
        left: "9%",
        top: "8%",
        width: "82%",
        height: "30%",
        justifyContent: "flex-start",
        transform: `rotate(${tilt * 0.45}deg)`,
        transformOrigin: "12% 0%",
      };
    default:
      return {
        left: `${layout.captionLeftPct}%`,
        top: `${layout.captionTopPct}%`,
        width: "58%",
        height: "36%",
        justifyContent: "flex-end",
        transform: `rotate(${tilt}deg)`,
        transformOrigin: "left top",
      };
  }
}

/**
 * Shrinks font size until the text fits the shell, or hits `minPx`.
 * Returns `{ px, overflow }` where `overflow` means still clipped at min size.
 */
export function fitMoodTextToShell(
  shell: HTMLElement,
  text: HTMLElement,
  basePx: number,
  minPx = 14,
): { px: number; overflow: boolean } {
  const maxW = shell.clientWidth;
  const maxH = shell.clientHeight;
  if (maxW < 8 || maxH < 8) {
    return { px: basePx, overflow: false };
  }
  let size = Math.min(Math.max(basePx, minPx), 48);
  text.style.fontSize = `${size}px`;
  while (size > minPx && (text.scrollHeight > maxH || text.scrollWidth > maxW)) {
    size -= 1;
    text.style.fontSize = `${size}px`;
  }
  const overflow =
    text.scrollHeight > maxH + 1 || text.scrollWidth > maxW + 1;
  return { px: size, overflow };
}
