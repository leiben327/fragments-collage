"use client";

import { useEffect, useState } from "react";

/**
 * Drives “full desktop atmosphere” vs lighter tablet/phone chrome.
 * - `full`: lg+ — rich shadows, motion, decor density
 * - `cozy`: sm–lg — simplified overlays / decor
 * - `compact`: phone — fastest path, smallest live canvas chrome
 */
export type ViewportEffectsBand = "compact" | "cozy" | "full";

function resolveBand(width: number): ViewportEffectsBand {
  if (width >= 1024) return "full";
  if (width >= 640) return "cozy";
  return "compact";
}

export function useViewportEffectsBand(): ViewportEffectsBand {
  const [band, setBand] = useState<ViewportEffectsBand>("full");

  useEffect(() => {
    const read = () => setBand(resolveBand(window.innerWidth));
    read();
    const mqLg = window.matchMedia("(min-width: 1024px)");
    const mqSm = window.matchMedia("(min-width: 640px)");
    mqLg.addEventListener("change", read);
    mqSm.addEventListener("change", read);
    window.addEventListener("resize", read);
    return () => {
      mqLg.removeEventListener("change", read);
      mqSm.removeEventListener("change", read);
      window.removeEventListener("resize", read);
    };
  }, []);

  return band;
}

/** PNG raster scale for `modern-screenshot` — at least 2× for sharp downloads. */
export function screenshotScaleForBand(band: ViewportEffectsBand): number {
  return band === "full" ? 3 : 2;
}
