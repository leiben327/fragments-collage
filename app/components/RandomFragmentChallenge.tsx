"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useState } from "react";
import { ArchivalTableBackdrop } from "./ArchivalTableBackdrop";
import { FloatingMemoryArchive } from "./FloatingMemoryArchive";
import { SESSION_ACTIVE_FRAGMENT_CHALLENGE_KEY } from "@/app/lib/communityFragmentKeys";
import { useViewportEffectsBand } from "@/app/lib/useViewportEffectsBand";

const easeSoft = [0.22, 1, 0.36, 1] as const;

const FRAGMENT_CHALLENGES: string[] = [
  "Find 6 pink-toned images from your camera roll.",
  "Use only flower photographs.",
  "Build a collage from blurry memories.",
  "Collect soft blue fragments.",
  "Make a collage that feels like waiting.",
  "Use screenshots only.",
  "Gather images where the light is sideways or uncertain.",
  "Choose photographs taken through glass — windows, doors, rain.",
  "Use only images with a single dominant color, any hue.",
  "Build from textures: fabric, skin, wall, water — no sky.",
  "Pick six images you almost deleted; invite them back.",
  "Make a collage that feels like the hour before sleep.",
  "Use only square crops from larger pictures.",
  "Collect fragments that feel borrowed from someone else’s dream.",
  "Find images where no person appears, but a human presence lingers.",
];

function pickChallenge(exclude: string | null): string {
  const pool =
    exclude && FRAGMENT_CHALLENGES.filter((c) => c !== exclude).length > 0
      ? FRAGMENT_CHALLENGES.filter((c) => c !== exclude)
      : FRAGMENT_CHALLENGES;
  const i = Math.floor(Math.random() * pool.length);
  return pool[i] ?? FRAGMENT_CHALLENGES[0]!;
}

export function RandomFragmentChallenge() {
  const reduce = useReducedMotion();
  const viewportBand = useViewportEffectsBand();
  const richMotion = viewportBand === "full" && !reduce;
  const [challenge, setChallenge] = useState<string | null>(null);

  const draw = useCallback(() => {
    setChallenge((prev) => {
      const next = pickChallenge(prev);
      try {
        sessionStorage.setItem(SESSION_ACTIVE_FRAGMENT_CHALLENGE_KEY, next);
      } catch {
        /* private mode */
      }
      return next;
    });
  }, []);

  const scrollToStudio = useCallback(() => {
    document.getElementById("mood-collage-studio")?.scrollIntoView({
      behavior: reduce ? "auto" : "smooth",
      block: "start",
    });
  }, [reduce]);

  return (
    <section
      id="fragment-challenge"
      className="relative isolate min-h-[min(100vh,920px)] overflow-hidden border-t border-ink/10 px-6 py-24 sm:px-10"
      aria-labelledby="fragment-challenge-heading"
    >
      <ArchivalTableBackdrop />

      <div className="absolute inset-0 z-[1] overflow-hidden">
        <div className="relative mx-auto min-h-[min(72vh,640px)] w-full max-w-[1400px] px-3 sm:min-h-[min(78vh,720px)] sm:px-6">
          <FloatingMemoryArchive
            onActivate={scrollToStudio}
            activateAriaHint="Open the mood collage studio."
          />
        </div>
      </div>

      <div className="relative z-20 mx-auto w-full min-w-0 max-w-3xl">
        <motion.h2
          id="fragment-challenge-heading"
          className="font-display text-center text-3xl font-medium text-ink sm:text-4xl"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-70px" }}
          transition={
            reduce
              ? { duration: 0 }
              : richMotion
                ? { duration: 1.4, ease: easeSoft }
                : { duration: 0.4, ease: easeSoft }
          }
        >
          Random Fragment Challenge
        </motion.h2>
        <motion.p
          className="font-body mx-auto mt-4 max-w-2xl text-center text-sm italic leading-relaxed text-ink-soft sm:text-[0.95rem]"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-70px" }}
          transition={
            reduce
              ? { duration: 0 }
              : richMotion
                ? { duration: 1.3, delay: 0.08, ease: easeSoft }
                : { duration: 0.38 }
          }
        >
          Not sure where to begin? Draw a gentle creative challenge and rediscover forgotten
          colors, memories, and moments already living quietly in your camera roll.
        </motion.p>

        <div className="mt-12 flex flex-col items-center gap-4 sm:flex-row sm:flex-wrap sm:justify-center">
          <motion.button
            type="button"
            onClick={draw}
            className="font-body rounded-[3px_5px_4px_3px] border border-ink/22 bg-cream/85 px-8 py-3.5 text-ink shadow-[6px_20px_40px_var(--shadow)] transition-[background-color,box-shadow,border-color] duration-700 hover:border-ink/28 hover:bg-blush/40"
            whileHover={!richMotion ? {} : { scale: 1.02 }}
            whileTap={reduce ? {} : { scale: 0.99 }}
          >
            Draw a Fragment Challenge
          </motion.button>
          <motion.button
            type="button"
            onClick={draw}
            disabled={!challenge}
            className="font-body rounded-[2px_4px_3px_2px] border border-ink/12 bg-paper-deep/45 px-5 py-2.5 text-sm text-ink-soft shadow-inner transition-[background-color,border-color,opacity] duration-700 hover:border-ink/18 hover:bg-cream/70 disabled:pointer-events-none disabled:opacity-40"
            whileTap={reduce || !challenge ? {} : { scale: 0.99 }}
          >
            Shuffle Another
          </motion.button>
        </div>

        <div className="relative mx-auto mt-14 max-w-xl">
          <AnimatePresence mode="wait">
            {challenge ? (
              <motion.div
                key={challenge}
                role="status"
                aria-live="polite"
                initial={{ opacity: 0, y: 14, rotate: reduce ? 0 : -0.6 }}
                animate={{ opacity: 1, y: 0, rotate: 0 }}
                exit={{ opacity: 0, y: -8, transition: { duration: 0.35 } }}
                transition={reduce ? { duration: 0 } : { duration: 0.65, ease: easeSoft }}
                className="relative overflow-hidden rounded-[4px_6px_5px_4px] border border-ink/16 bg-gradient-to-b from-cream/95 via-paper/90 to-paper-deep/55 px-8 py-10 sm:px-10 sm:py-12"
                style={{
                  boxShadow:
                    "10px 32px 52px var(--shadow), inset 0 0 0 1px rgba(61,56,50,0.06), inset 0 1px 0 rgba(255,252,248,0.65)",
                  backgroundImage: `linear-gradient(165deg, rgba(255,252,248,0.5) 0%, transparent 45%), repeating-linear-gradient(0deg, transparent, transparent 5px, rgba(61,56,50,0.04) 5px, rgba(61,56,50,0.04) 6px)`,
                }}
              >
                <div
                  className="pointer-events-none absolute -right-6 top-6 h-24 w-10 rotate-12 rounded-[1px] border border-ink/10 bg-gradient-to-b from-paper-deep/60 to-blush/30 opacity-70 shadow-sm"
                  aria-hidden
                />
                <div
                  className="pointer-events-none absolute -left-3 bottom-8 h-16 w-8 -rotate-[10deg] rounded-[2px] border border-ink/8 bg-paper-deep/40 opacity-60"
                  aria-hidden
                />

                <p className="font-body relative z-[1] text-center text-lg leading-[1.65] text-ink sm:text-xl">
                  {challenge}
                </p>
                <p className="font-body relative z-[1] mt-8 text-center text-xs uppercase tracking-[0.22em] text-ink-soft/85">
                  fragment · keep or release
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="rounded-[4px_6px_5px_4px] border border-dashed border-ink/14 bg-cream/35 px-6 py-14 text-center shadow-inner"
              >
                <p className="font-body text-sm italic leading-relaxed text-ink-soft/90">
                  The drawer is closed. When you are ready, draw a fragment — something
                  small to hold in both hands.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {challenge && (
            <motion.div
              className="mt-10 flex justify-center"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={reduce ? { duration: 0 } : { duration: 0.5, ease: easeSoft }}
            >
              <motion.button
                type="button"
                onClick={scrollToStudio}
                className="font-body rounded-[2px_4px_3px_2px] border border-ink/18 bg-paper-deep/55 px-7 py-3 text-sm text-ink shadow-[4px_14px_30px_var(--shadow)] transition-[background-color,border-color] duration-700 hover:border-ink/24 hover:bg-sage/25"
                whileHover={reduce ? {} : { scale: 1.02 }}
                whileTap={reduce ? {} : { scale: 0.99 }}
              >
                Start this collage
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
