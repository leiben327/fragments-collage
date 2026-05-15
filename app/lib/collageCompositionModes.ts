export const COMPOSITION_MODE_IDS = [
  "minimal",
  "chaotic",
  "poetic",
  "gallery-wall",
  "floating-memory",
  "editorial-zine",
] as const;

export type CompositionModeId = (typeof COMPOSITION_MODE_IDS)[number];

export const DEFAULT_COMPOSITION_MODE: CompositionModeId = "poetic";

export const COMPOSITION_MODE_META: Record<
  CompositionModeId,
  { label: string; blurb: string }
> = {
  minimal: {
    label: "Minimal",
    blurb: "Cinematic breath — one weight, generous quiet, edges that wander.",
  },
  chaotic: {
    label: "Chaotic",
    blurb: "Archive-table spill — overlaps, tilts, nothing politely centered.",
  },
  poetic: {
    label: "Poetic",
    blurb: "Diagonal drift and soft clusters, like turning journal pages.",
  },
  "gallery-wall": {
    label: "Gallery wall",
    blurb: "Broken rhythm — columns that disagree, heights that don’t line up.",
  },
  "floating-memory": {
    label: "Floating memory",
    blurb: "Fragments that hover at different heights, staggered and tender.",
  },
  "editorial-zine": {
    label: "Editorial zine",
    blurb: "Magazine gravity — a hero strip, counter-column, bold negative space.",
  },
};
