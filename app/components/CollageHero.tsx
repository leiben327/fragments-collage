"use client";

import { motion, useReducedMotion } from "framer-motion";

type Fragment = {
  w: number;
  h: number;
  x: string;
  y: string;
  rotate: number;
  delay: number;
  duration: number;
  bg: string;
  z: number;
};

const fragments: Fragment[] = [
  {
    w: 140,
    h: 180,
    x: "8%",
    y: "18%",
    rotate: -8,
    delay: 0,
    duration: 14,
    bg: "linear-gradient(145deg, #f0e6dc 0%, #dccfc4 55%, #cbb8a8 100%)",
    z: 2,
  },
  {
    w: 96,
    h: 120,
    x: "72%",
    y: "12%",
    rotate: 11,
    delay: 1.2,
    duration: 16,
    bg: "linear-gradient(160deg, #e8dfd4 0%, #d8cfc5 40%, #c9b8a8 100%)",
    z: 3,
  },
  {
    w: 110,
    h: 95,
    x: "58%",
    y: "52%",
    rotate: -4,
    delay: 0.4,
    duration: 18,
    bg: "linear-gradient(200deg, #efe8df 0%, #e0d5c8 70%, #d1c4b6 100%)",
    z: 1,
  },
  {
    w: 72,
    h: 88,
    x: "22%",
    y: "58%",
    rotate: 14,
    delay: 2,
    duration: 15,
    bg: "linear-gradient(120deg, #ead9d4 0%, #dcc8c0 100%)",
    z: 4,
  },
  {
    w: 64,
    h: 64,
    x: "42%",
    y: "8%",
    rotate: -12,
    delay: 0.8,
    duration: 12,
    bg: "radial-gradient(circle at 30% 30%, #f7f0e6, #dcd2c6)",
    z: 5,
  },
  {
    w: 120,
    h: 72,
    x: "6%",
    y: "38%",
    rotate: 6,
    delay: 1.6,
    duration: 17,
    bg: "linear-gradient(90deg, #e5e8df 0%, #d2d6c8 100%)",
    z: 1,
  },
  {
    w: 88,
    h: 130,
    x: "84%",
    y: "42%",
    rotate: -6,
    delay: 0.2,
    duration: 19,
    bg: "linear-gradient(180deg, #f4ebe3 0%, #e3d6ca 50%, #d0c0b2 100%)",
    z: 2,
  },
  {
    w: 52,
    h: 52,
    x: "48%",
    y: "68%",
    rotate: 22,
    delay: 2.4,
    duration: 11,
    bg: "linear-gradient(45deg, #ebe4db, #cfc3b5)",
    z: 6,
  },
];

const floatY = (reduce: boolean) =>
  reduce ? 0 : [0, -10, 4, -6, 0];

const floatRotate = (base: number, reduce: boolean) =>
  reduce ? base : [base, base + 1.5, base - 1, base + 0.8, base];

export function CollageHero() {
  const reduce = useReducedMotion();

  return (
    <section
      id="fragments"
      className="relative isolate overflow-x-hidden px-6 pb-28 pt-16 sm:px-10 sm:pb-32 sm:pt-20"
      aria-labelledby="hero-heading"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(232,212,207,0.45),transparent_55%),radial-gradient(ellipse_at_80%_60%,rgba(197,203,184,0.28),transparent_50%)]"
        aria-hidden
      />

      {fragments.map((f, i) => (
        <motion.div
          key={i}
          className="pointer-events-none absolute shadow-[4px_12px_28px_var(--shadow)]"
          style={{
            width: f.w,
            height: f.h,
            left: f.x,
            top: f.y,
            zIndex: f.z,
            background: f.bg,
            borderRadius: "2px 4px 3px 2px / 3px 2px 4px 3px",
          }}
          initial={{ opacity: 0, y: 24, rotate: f.rotate - 4 }}
          animate={{
            opacity: 1,
            y: floatY(!!reduce),
            rotate: floatRotate(f.rotate, !!reduce),
          }}
          transition={{
            opacity: { duration: 2.2, delay: f.delay * 0.15, ease: [0.22, 1, 0.36, 1] },
            y: reduce
              ? { duration: 0 }
              : {
                  duration: f.duration,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: f.delay,
                },
            rotate: reduce
              ? { duration: 0 }
              : {
                  duration: f.duration * 1.1,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: f.delay + 0.3,
                },
          }}
        >
          <span
            className="absolute inset-0 opacity-[0.12]"
            style={{
              backgroundImage:
                "repeating-linear-gradient(-12deg, transparent, transparent 3px, rgba(61,56,50,0.06) 3px, rgba(61,56,50,0.06) 4px)",
            }}
          />
        </motion.div>
      ))}

      <div className="relative z-10 mx-auto w-full min-w-0 max-w-2xl">
        <motion.h1
          id="hero-heading"
          className="font-display text-center text-[clamp(2.6rem,6vw,4.25rem)] font-medium leading-[1.05] tracking-tight text-ink"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 2.4, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        >
          Fragments
        </motion.h1>
        <motion.div
          className="font-body mt-10 space-y-5 text-left text-base leading-relaxed text-ink-soft sm:mt-12 sm:text-[1.05rem] sm:leading-[1.7]"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 2.2, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="text-ink/92">
            We take thousands of photos and forget most of them.
          </p>
          <p className="whitespace-pre-line">
            {`Some stay hidden in camera rolls for years —
a blurry sunset,
flowers from a quiet afternoon,
a screenshot from someone we miss,
light falling across a kitchen table.`}
          </p>
          <p>
            Fragments is a space for turning those forgotten images into emotional
            collages, visual journals, and shared memory archives.
          </p>
          <p>
            Upload photos from your camera roll, draw a creative challenge, choose a
            mood, and let your memories transform into handmade collage compositions
            filled with texture, paper, movement, and atmosphere.
          </p>
          <p className="whitespace-pre-line">
            {`Not every image needs to be perfect.
Sometimes the blurry ones hold the most feeling.`}
          </p>
          <p className="whitespace-pre-line">
            {`Fragments is not about productivity or social media perfection.
It is a slower, softer space for collecting moments, emotions, colors, and pieces of everyday life.`}
          </p>
          <p className="whitespace-pre-line">
            {`Create your own mood collages.
Share them with the Community Fragments archive.
Discover how other people remember, feel, and see the world through images.`}
          </p>
          <p className="pb-2 text-ink/88 italic">
            A living archive of small moments, quietly kept.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
