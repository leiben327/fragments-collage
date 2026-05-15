/**
 * Per-piece ink / filter paths for the Riso Dream collage style —
 * duotone-like CSS stacks, poster contrast, and cutout reads.
 */
export type RisoInkTreatmentId =
  | "cyan_veil"
  | "magenta_flare"
  | "ember_burst"
  | "teal_noir"
  | "duo_offset"
  | "xerox_fog"
  | "cutout_ink"
  | "lift_natural";

export const RISO_INK_TREATMENT_IDS: RisoInkTreatmentId[] = [
  "cyan_veil",
  "magenta_flare",
  "ember_burst",
  "teal_noir",
  "duo_offset",
  "xerox_fog",
  "cutout_ink",
  "lift_natural",
];

/** Image filter chained after preset unified filter */
export function risoTreatmentFilters(id: RisoInkTreatmentId): string {
  switch (id) {
    case "cyan_veil":
      return "saturate(0.58) hue-rotate(168deg) contrast(1.22) brightness(1.06)";
    case "magenta_flare":
      return "saturate(0.82) hue-rotate(298deg) contrast(1.2) brightness(1.03)";
    case "ember_burst":
      return "saturate(0.92) hue-rotate(-14deg) contrast(1.24) brightness(1.05)";
    case "teal_noir":
      return "saturate(0.42) hue-rotate(158deg) contrast(1.32) brightness(0.94)";
    case "duo_offset":
      return "saturate(0.72) hue-rotate(210deg) contrast(1.28) brightness(1.02)";
    case "xerox_fog":
      return "saturate(0.08) contrast(1.35) brightness(1.06)";
    case "cutout_ink":
      return "saturate(0.85) contrast(1.45) brightness(0.92)";
    case "lift_natural":
    default:
      return "saturate(1.02) contrast(1.08) brightness(1.03)";
  }
}

/** Multiply / soft-light overlays per treatment (semi-transparent inks) */
export function risoTreatmentInkOverlay(id: RisoInkTreatmentId): string {
  switch (id) {
    case "cyan_veil":
      return `linear-gradient(168deg, rgba(0,200,210,0.42) 0%, transparent 52%, rgba(20,48,92,0.22) 100%)`;
    case "magenta_flare":
      return `linear-gradient(195deg, rgba(255,40,140,0.38) 0%, transparent 45%, rgba(120,24,72,0.2) 100%)`;
    case "ember_burst":
      return `radial-gradient(ellipse 90% 80% at 45% 40%, rgba(255,118,62,0.35) 0%, transparent 55%), linear-gradient(8deg, rgba(255,200,72,0.22) 0%, transparent 60%)`;
    case "teal_noir":
      return `linear-gradient(210deg, rgba(12,92,118,0.45) 0%, transparent 50%, rgba(8,28,58,0.35) 100%)`;
    case "duo_offset":
      return `linear-gradient(128deg, rgba(255,90,152,0.28) 0%, rgba(0,196,216,0.32) 48%, transparent 92%)`;
    case "xerox_fog":
      return `repeating-linear-gradient(92deg, rgba(40,38,72,0.06) 0px, transparent 1px, transparent 3px), radial-gradient(circle at 60% 40%, transparent 42%, rgba(28,26,54,0.18) 100%)`;
    case "cutout_ink":
      return `radial-gradient(ellipse 70% 60% at 50% 50%, transparent 35%, rgba(16,22,72,0.55) 100%)`;
    case "lift_natural":
    default:
      return `linear-gradient(188deg, rgba(255,252,246,0.18) 0%, transparent 40%, rgba(255,118,172,0.12) 100%)`;
  }
}
