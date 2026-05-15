"use client";

import type {
  CollageBackgroundId,
  CollageBackgroundSurface,
} from "@/app/lib/collageBackgroundSurfaces";
import {
  COLLAGE_BACKGROUND_CATALOG,
  COLLAGE_BACKGROUND_SURFACES,
} from "@/app/lib/collageBackgroundSurfaces";
import { motion, useReducedMotion } from "framer-motion";

const easeSoft = [0.22, 1, 0.36, 1] as const;

/** Full-bleed paper stack on the export board (matches thumbnail layers). */
export function CollageBoardSurfaceLayers({
  surface,
}: {
  surface: CollageBackgroundSurface;
}) {
  return (
    <>
      {surface.overlays.map((o, i) => (
        <div
          key={i}
          className="pointer-events-none absolute inset-0"
          style={{
            opacity: o.opacity,
            mixBlendMode: o.mixBlendMode,
            background: o.background,
            filter: o.filter,
          }}
          aria-hidden
        />
      ))}
      {surface.edgeVignette && (
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            opacity: surface.edgeVignette.opacity,
            mixBlendMode: surface.edgeVignette.mixBlendMode,
            background: surface.edgeVignette.background,
          }}
          aria-hidden
        />
      )}
    </>
  );
}

export function CollageBackgroundPicker({
  selectedId,
  suggestedIds,
  onSelect,
}: {
  selectedId: CollageBackgroundId;
  suggestedIds: readonly CollageBackgroundId[];
  onSelect: (id: CollageBackgroundId) => void;
}) {
  const reduce = useReducedMotion();
  const suggested = new Set(suggestedIds);

  return (
    <div className="space-y-8">
      {COLLAGE_BACKGROUND_CATALOG.map(({ category, ids }) => (
        <div key={category}>
          <h3 className="font-body text-[0.65rem] uppercase tracking-[0.18em] text-ink-soft/88">
            {category}
          </h3>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {ids.map((id) => {
              const s = COLLAGE_BACKGROUND_SURFACES[id];
              const on = selectedId === id;
              const isSuggested = suggested.has(id);
              return (
                <motion.button
                  key={id}
                  type="button"
                  onClick={() => onSelect(id)}
                  whileHover={reduce ? {} : { y: -2 }}
                  whileTap={reduce ? {} : { scale: 0.99 }}
                  transition={{ duration: 0.35, ease: easeSoft }}
                  className={`group relative flex flex-col rounded-[3px_5px_4px_3px] border p-2 text-left transition-[border-color,box-shadow,background-color] duration-500 ${
                    on
                      ? "border-ink/38 bg-cream/90 shadow-[4px_14px_28px_var(--shadow)]"
                      : "border-ink/12 bg-cream/40 hover:border-ink/22 hover:bg-cream/78"
                  }`}
                >
                  {isSuggested && (
                    <span className="font-body absolute right-2 top-2 z-[2] rounded-full border border-ink/12 bg-blush/55 px-2 py-0.5 text-[0.55rem] uppercase tracking-[0.12em] text-ink/85 shadow-sm">
                      Style match
                    </span>
                  )}
                  <div
                    className="relative aspect-[4/3] w-full overflow-hidden rounded-[2px] border border-ink/14 shadow-[inset_0_0_0_1px_rgba(255,252,248,0.35)]"
                    aria-hidden
                  >
                    <div
                      className="absolute inset-0"
                      style={{ background: s.baseBackground }}
                    />
                    {s.overlays.map((o, i) => (
                      <div
                        key={i}
                        className="absolute inset-0"
                        style={{
                          opacity: o.opacity * 0.92,
                          mixBlendMode: o.mixBlendMode,
                          background: o.background,
                          filter: o.filter,
                        }}
                      />
                    ))}
                    {s.edgeVignette && (
                      <div
                        className="absolute inset-0"
                        style={{
                          opacity: s.edgeVignette.opacity * 0.85,
                          mixBlendMode: s.edgeVignette.mixBlendMode,
                          background: s.edgeVignette.background,
                        }}
                      />
                    )}
                    <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_22px_rgba(42,38,34,0.14)]" />
                  </div>
                  <span className="font-display mt-2 block text-[0.95rem] leading-tight text-ink">
                    {s.label}
                  </span>
                  <span className="font-body mt-1 line-clamp-2 text-[0.68rem] leading-snug text-ink-soft/95">
                    {s.hint}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
