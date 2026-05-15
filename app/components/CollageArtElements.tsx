"use client";

import type { CSSProperties } from "react";
import type { CollageStyleId } from "@/app/lib/collageStylePresets";
import type { ArtLayoutElement } from "@/app/lib/collageArtElements";

type ArtPalette = {
  newsA: string;
  newsB: string;
  bookA: string;
  bookB: string;
  tapeMask: string;
  tapeClear: string;
  ink: string;
  stitch: string;
  botanical: string;
  tracing: string;
  labelLine: string;
  pencil: string;
  fabricA: string;
  fabricB: string;
  noteLine: string;
  notePaper: string;
  metal: string;
  organic: string;
  organicDeep: string;
  /** Illustrated collage — painted washes & cut paper */
  washA?: string;
  washB?: string;
  washC?: string;
  cutPaperA?: string;
  cutPaperB?: string;
  sketchInk?: string;
  bubbleStroke?: string;
  bubbleFill?: string;
};

function artPalette(styleId: CollageStyleId): ArtPalette {
  switch (styleId) {
    case "vintage-zine":
      return {
        newsA: "rgba(38,38,42,0.22)",
        newsB: "rgba(28,28,32,0.14)",
        bookA: "#c8c4bc",
        bookB: "#9a958c",
        tapeMask: "linear-gradient(180deg, rgba(245,240,228,0.92), rgba(220,212,198,0.78))",
        tapeClear:
          "linear-gradient(125deg, rgba(255,255,255,0.42), rgba(255,255,255,0.08), rgba(240,236,230,0.35))",
        ink: "rgba(22,22,28,0.55)",
        stitch: "rgba(42,40,38,0.45)",
        botanical: "rgba(58,62,52,0.22)",
        tracing: "rgba(252,250,246,0.22)",
        labelLine: "rgba(48,46,44,0.28)",
        pencil: "rgba(55,52,48,0.35)",
        fabricA: "rgba(70,66,60,0.12)",
        fabricB: "rgba(40,38,36,0.08)",
        noteLine: "rgba(62,90,120,0.18)",
        notePaper: "rgba(248,244,236,0.88)",
        metal: "rgba(110,108,104,0.55)",
        organic: "rgba(48,46,44,0.14)",
        organicDeep: "rgba(32,30,28,0.12)",
      };
    case "soft-archive":
      return {
        newsA: "rgba(72,68,62,0.08)",
        newsB: "rgba(52,48,44,0.06)",
        bookA: "#e6dcc8",
        bookB: "#c9b89e",
        tapeMask: "linear-gradient(180deg, rgba(236,228,214,0.9), rgba(210,198,182,0.72))",
        tapeClear:
          "linear-gradient(110deg, rgba(255,252,248,0.5), rgba(255,255,255,0.12), rgba(232,224,210,0.4))",
        ink: "rgba(48,44,40,0.32)",
        stitch: "rgba(88,78,68,0.28)",
        botanical: "rgba(92,86,72,0.18)",
        tracing: "rgba(255,252,248,0.35)",
        labelLine: "rgba(72,66,58,0.22)",
        pencil: "rgba(80,72,64,0.28)",
        fabricA: "rgba(120,108,92,0.1)",
        fabricB: "rgba(88,80,70,0.08)",
        noteLine: "rgba(96,110,125,0.16)",
        notePaper: "rgba(252,248,240,0.9)",
        metal: "rgba(118,112,102,0.45)",
        organic: "rgba(100,92,80,0.12)",
        organicDeep: "rgba(72,66,58,0.1)",
      };
    case "desert-dream":
      return {
        newsA: "rgba(120,82,58,0.1)",
        newsB: "rgba(92,62,48,0.08)",
        bookA: "#dcc8a8",
        bookB: "#b89878",
        tapeMask: "linear-gradient(180deg, rgba(244,220,196,0.88), rgba(210,176,148,0.65))",
        tapeClear:
          "linear-gradient(130deg, rgba(255,236,216,0.45), rgba(255,255,255,0.1), rgba(230,200,170,0.38))",
        ink: "rgba(92,58,42,0.35)",
        stitch: "rgba(130,88,62,0.32)",
        botanical: "rgba(118,92,58,0.28)",
        tracing: "rgba(255,238,220,0.28)",
        labelLine: "rgba(110,78,56,0.26)",
        pencil: "rgba(120,86,58,0.3)",
        fabricA: "rgba(160,120,88,0.14)",
        fabricB: "rgba(110,78,56,0.1)",
        noteLine: "rgba(130,100,72,0.2)",
        notePaper: "rgba(252,234,210,0.88)",
        metal: "rgba(140,112,88,0.42)",
        organic: "rgba(150,110,78,0.16)",
        organicDeep: "rgba(110,78,56,0.14)",
      };
    case "emotional-poster":
      return {
        newsA: "rgba(52,72,58,0.1)",
        newsB: "rgba(42,62,52,0.08)",
        bookA: "#dce8d8",
        bookB: "#a8c4a8",
        tapeMask: "linear-gradient(180deg, rgba(232,244,232,0.88), rgba(196,220,198,0.65))",
        tapeClear:
          "linear-gradient(120deg, rgba(255,255,255,0.48), rgba(255,255,255,0.1), rgba(220,236,222,0.4))",
        ink: "rgba(48,72,58,0.28)",
        stitch: "rgba(62,88,70,0.32)",
        botanical: "rgba(72,110,78,0.32)",
        tracing: "rgba(248,255,248,0.3)",
        labelLine: "rgba(58,78,64,0.22)",
        pencil: "rgba(68,88,72,0.28)",
        fabricA: "rgba(100,130,102,0.14)",
        fabricB: "rgba(72,98,76,0.1)",
        noteLine: "rgba(72,96,82,0.18)",
        notePaper: "rgba(244,252,244,0.9)",
        metal: "rgba(108,124,112,0.42)",
        organic: "rgba(88,120,92,0.18)",
        organicDeep: "rgba(62,88,68,0.14)",
      };
    case "museum-scrapbook":
      return {
        newsA: "rgba(58,54,50,0.12)",
        newsB: "rgba(42,40,38,0.08)",
        bookA: "#e2d8c8",
        bookB: "#c4b8a4",
        tapeMask: "linear-gradient(180deg, rgba(242,236,226,0.92), rgba(214,206,192,0.75))",
        tapeClear:
          "linear-gradient(115deg, rgba(255,252,248,0.5), rgba(255,255,255,0.12), rgba(232,226,216,0.42))",
        ink: "rgba(42,40,38,0.38)",
        stitch: "rgba(62,58,54,0.35)",
        botanical: "rgba(78,74,66,0.2)",
        tracing: "rgba(255,252,246,0.32)",
        labelLine: "rgba(58,54,50,0.26)",
        pencil: "rgba(64,60,56,0.32)",
        fabricA: "rgba(96,88,78,0.12)",
        fabricB: "rgba(72,66,60,0.09)",
        noteLine: "rgba(72,82,96,0.16)",
        notePaper: "rgba(250,246,238,0.9)",
        metal: "rgba(112,106,98,0.5)",
        organic: "rgba(88,82,74,0.14)",
        organicDeep: "rgba(62,58,54,0.12)",
      };
    case "quiet-memory":
      return {
        newsA: "rgba(58,68,82,0.12)",
        newsB: "rgba(48,58,72,0.08)",
        bookA: "#d4d8e2",
        bookB: "#a8b0c4",
        tapeMask: "linear-gradient(180deg, rgba(228,232,240,0.88), rgba(196,202,216,0.68))",
        tapeClear:
          "linear-gradient(125deg, rgba(255,255,255,0.42), rgba(255,255,255,0.1), rgba(220,226,236,0.45))",
        ink: "rgba(48,58,78,0.38)",
        stitch: "rgba(72,82,98,0.35)",
        botanical: "rgba(72,88,96,0.22)",
        tracing: "rgba(248,250,255,0.38)",
        labelLine: "rgba(62,70,84,0.24)",
        pencil: "rgba(72,80,94,0.3)",
        fabricA: "rgba(100,110,128,0.12)",
        fabricB: "rgba(72,80,96,0.09)",
        noteLine: "rgba(80,92,110,0.18)",
        notePaper: "rgba(244,246,252,0.9)",
        metal: "rgba(108,114,128,0.48)",
        organic: "rgba(88,96,112,0.14)",
        organicDeep: "rgba(62,70,84,0.12)",
      };
    case "illustrated-collage":
      return {
        newsA: "rgba(90,72,120,0.1)",
        newsB: "rgba(72,110,130,0.08)",
        bookA: "#f0e4f8",
        bookB: "#c8d8f0",
        tapeMask:
          "linear-gradient(165deg, rgba(255,236,220,0.88) 0%, rgba(200,220,255,0.55) 100%)",
        tapeClear:
          "linear-gradient(130deg, rgba(255,255,255,0.55), rgba(255,255,255,0.12), rgba(240,220,255,0.45))",
        ink: "rgba(38,42,72,0.42)",
        stitch: "rgba(72,62,110,0.38)",
        botanical: "rgba(58,110,88,0.32)",
        tracing: "rgba(255,252,250,0.42)",
        labelLine: "rgba(52,58,92,0.26)",
        pencil: "rgba(48,52,82,0.34)",
        fabricA: "rgba(180,140,200,0.14)",
        fabricB: "rgba(120,160,200,0.12)",
        noteLine: "rgba(90,100,140,0.2)",
        notePaper: "rgba(252,248,255,0.92)",
        metal: "rgba(120,118,140,0.48)",
        organic: "rgba(255,160,150,0.22)",
        organicDeep: "rgba(120,140,220,0.2)",
        washA: "rgba(255,190,200,0.42)",
        washB: "rgba(160,210,255,0.38)",
        washC: "rgba(200,255,210,0.28)",
        cutPaperA:
          "linear-gradient(148deg, rgba(255,200,180,0.95) 0%, rgba(255,120,140,0.5) 100%)",
        cutPaperB:
          "linear-gradient(168deg, rgba(200,240,230,0.92) 0%, rgba(80,160,180,0.45) 100%)",
        sketchInk: "rgba(32,36,62,0.52)",
        bubbleStroke: "rgba(38,42,72,0.45)",
        bubbleFill: "rgba(255,252,250,0.55)",
      };
    default:
      return {
        newsA: "rgba(58,68,82,0.12)",
        newsB: "rgba(48,58,72,0.08)",
        bookA: "#d4d8e2",
        bookB: "#a8b0c4",
        tapeMask: "linear-gradient(180deg, rgba(228,232,240,0.88), rgba(196,202,216,0.68))",
        tapeClear:
          "linear-gradient(125deg, rgba(255,255,255,0.42), rgba(255,255,255,0.1), rgba(220,226,236,0.45))",
        ink: "rgba(48,58,78,0.38)",
        stitch: "rgba(72,82,98,0.35)",
        botanical: "rgba(72,88,96,0.22)",
        tracing: "rgba(248,250,255,0.38)",
        labelLine: "rgba(62,70,84,0.24)",
        pencil: "rgba(72,80,94,0.3)",
        fabricA: "rgba(100,110,128,0.12)",
        fabricB: "rgba(72,80,96,0.09)",
        noteLine: "rgba(80,92,110,0.18)",
        notePaper: "rgba(244,246,252,0.9)",
        metal: "rgba(108,114,128,0.48)",
        organic: "rgba(88,96,112,0.14)",
        organicDeep: "rgba(62,70,84,0.12)",
      };
  }
}

function CollageArtElementView({
  el,
  pal,
  isZine,
}: {
  el: ArtLayoutElement;
  pal: ArtPalette;
  isZine: boolean;
}) {
  const v = el.variant;
  const base: CSSProperties = {
    position: "absolute",
    left: `${el.leftPct}%`,
    top: `${el.topPct}%`,
    width: `${el.widthPct}%`,
    height: `${el.heightPct}%`,
    opacity: el.opacity,
    zIndex: el.zIndex,
    transform: `translate(-50%, -50%) rotate(${el.rotate}deg)`,
    mixBlendMode: (el.mixBlendMode as CSSProperties["mixBlendMode"]) ?? undefined,
    pointerEvents: "none",
  };

  switch (el.kind) {
    case "tape_masking":
      return (
        <div
          key={el.id}
          className="rounded-[1px] shadow-[1px_2px_4px_rgba(42,38,34,0.18)]"
          style={{
            ...base,
            background: pal.tapeMask,
            mixBlendMode: isZine ? "normal" : "multiply",
          }}
          aria-hidden
        />
      );
    case "tape_clear":
      return (
        <div
          key={el.id}
          className="rounded-[2px] ring-1 ring-white/25"
          style={{
            ...base,
            background: pal.tapeClear,
            boxShadow: "inset 0 0 6px rgba(255,255,255,0.35)",
          }}
          aria-hidden
        />
      );
    case "scrap_newspaper":
      return (
        <div key={el.id} className="torn overflow-hidden" style={base} aria-hidden>
          <div
            className="absolute -inset-[12%]"
            style={{
              background: `
                repeating-linear-gradient(0deg, ${pal.newsA} 0px, transparent 1px, transparent 2px),
                repeating-linear-gradient(88deg, ${pal.newsB} 0px, transparent 1px, transparent 3px),
                linear-gradient(${105 + (v % 17)}deg, rgba(240,238,232,0.95), rgba(200,198,192,0.85))`,
              filter: "blur(1.1px) contrast(0.82) saturate(0.35)",
            }}
          />
        </div>
      );
    case "scrap_book":
      return (
        <div key={el.id} className="torn overflow-hidden shadow-sm" style={base} aria-hidden>
          <div
            className="absolute inset-0"
            style={{
              background: `
                repeating-linear-gradient(0deg, transparent, transparent 5px, rgba(72,68,62,0.06) 5px, rgba(72,68,62,0.06) 6px),
                linear-gradient(165deg, ${pal.bookA}, ${pal.bookB})`,
              filter: "blur(0.6px)",
            }}
          />
        </div>
      );
    case "note_handwritten":
      return (
        <div key={el.id} className="torn overflow-hidden shadow-sm" style={base} aria-hidden>
          <div
            className="absolute inset-0"
            style={{
              background: `
                repeating-linear-gradient(0deg, transparent, transparent 7px, ${pal.noteLine} 7px, ${pal.noteLine} 8px),
                linear-gradient(180deg, ${pal.notePaper}, rgba(244,240,232,0.7))`,
            }}
          />
        </div>
      );
    case "stitch_line": {
      const dash = 3 + (v % 5);
      return (
        <div key={el.id} style={base} aria-hidden>
          <svg
            className="h-full w-full overflow-visible"
            viewBox="0 0 100 8"
            preserveAspectRatio="none"
          >
            <line
              x1="4"
              y1="4"
              x2="96"
              y2="4"
              stroke={pal.stitch}
              strokeWidth="1.2"
              strokeDasharray={`${dash} ${2 + (v % 3)}`}
              strokeLinecap="round"
            />
          </svg>
        </div>
      );
    }
    case "pencil":
      return (
        <div
          key={el.id}
          className="rounded-full"
          style={{
            ...base,
            background: `linear-gradient(90deg, transparent, ${pal.pencil}, transparent)`,
            filter: "blur(0.35px)",
          }}
          aria-hidden
        />
      );
    case "ink":
      return (
        <div
          key={el.id}
          className="rounded-[40%_55%_48%_52%]"
          style={{
            ...base,
            background: `
              radial-gradient(ellipse at 30% 35%, ${pal.ink} 0%, transparent 62%),
              radial-gradient(ellipse at 70% 60%, ${pal.ink} 0%, transparent 55%)`,
            filter: "blur(0.8px)",
          }}
          aria-hidden
        />
      );
    case "label":
      return (
        <div
          key={el.id}
          className="rounded-[2px] ring-1 ring-ink/[0.08]"
          style={{
            ...base,
            background: `linear-gradient(180deg, rgba(252,250,246,0.92), rgba(232,228,220,0.75))`,
            boxShadow: "1px 2px 5px rgba(42,38,34,0.12)",
          }}
          aria-hidden
        >
          <div
            className="absolute inset-[18%_12%]"
            style={{
              background: `
                linear-gradient(180deg, transparent 20%, ${pal.labelLine} 20%, ${pal.labelLine} 22%, transparent 22%),
                linear-gradient(180deg, transparent 42%, ${pal.labelLine} 42%, ${pal.labelLine} 44%, transparent 44%),
                linear-gradient(180deg, transparent 64%, ${pal.labelLine} 64%, ${pal.labelLine} 66%, transparent 66%)`,
              opacity: 0.55,
            }}
          />
        </div>
      );
    case "tracing":
      return (
        <div
          key={el.id}
          className="rounded-[3px]"
          style={{
            ...base,
            background: pal.tracing,
            border: "1px solid rgba(255,255,255,0.35)",
            boxShadow: "inset 0 0 18px rgba(255,255,255,0.25)",
          }}
          aria-hidden
        />
      );
    case "paper_shadow":
      return (
        <div
          key={el.id}
          className="rounded-[4px_6px_5px_4px]"
          style={{
            ...base,
            background: "rgba(42,38,34,0.04)",
            boxShadow: `
              4px 10px 22px rgba(42,38,34,0.14),
              1px 3px 8px rgba(42,38,34,0.1),
              inset 0 0 20px rgba(255,252,248,0.12)`,
          }}
          aria-hidden
        />
      );
    case "organic_shape":
      return (
        <div
          key={el.id}
          className="torn"
          style={{
            ...base,
            borderRadius: `${38 + (v % 12)}% ${62 - (v % 8)}% ${48 + (v % 10)}% ${52 - (v % 6)}% / ${55 + (v % 9)}% ${45 - (v % 7)}% ${35 + (v % 11)}% ${65 - (v % 9)}%`,
            background: `linear-gradient(${128 + (v % 40)}deg, ${pal.organic}, ${pal.organicDeep})`,
            filter: "blur(0.45px)",
          }}
          aria-hidden
        />
      );
    case "paint_wash": {
      const wa = pal.washA ?? "rgba(255,200,210,0.35)";
      const wb = pal.washB ?? "rgba(160,200,255,0.3)";
      const wc = pal.washC ?? "rgba(210,255,220,0.22)";
      return (
        <div
          key={el.id}
          className="overflow-hidden rounded-[42%_58%_48%_52%/55%_45%_38%_62%]"
          style={{
            ...base,
            background: `
              radial-gradient(ellipse 70% 55% at ${28 + (v % 18)}% ${32 + (v % 22)}%, ${wa} 0%, transparent 68%),
              radial-gradient(ellipse 55% 50% at ${72 - (v % 16)}% ${58 + (v % 14)}%, ${wb} 0%, transparent 62%),
              radial-gradient(ellipse 45% 40% at 50% 78%, ${wc} 0%, transparent 55%)`,
            filter: "blur(1.4px) saturate(1.08)",
          }}
          aria-hidden
        />
      );
    }
    case "cut_color_paper": {
      const grad = (v % 2 === 0 ? pal.cutPaperA : pal.cutPaperB) ?? pal.organic;
      return (
        <div
          key={el.id}
          className="torn shadow-sm"
          style={{
            ...base,
            borderRadius: `${42 + (v % 10)}% ${58 - (v % 8)}% ${50 + (v % 12)}% ${50 - (v % 6)}% / ${48 + (v % 9)}% ${52 - (v % 7)}% ${40 + (v % 11)}% ${60 - (v % 9)}%`,
            background: typeof grad === "string" && grad.includes("gradient(") ? grad : `linear-gradient(155deg, ${grad}, ${pal.organicDeep})`,
            filter: "blur(0.55px)",
          }}
          aria-hidden
        />
      );
    }
    case "ink_sketch": {
      const stroke = pal.sketchInk ?? pal.ink;
      const mode = v % 4;
      return (
        <div key={el.id} style={base} aria-hidden>
          <svg className="h-full w-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
            {mode === 0 && (
              <>
                <path
                  d="M12 28 Q 50 8 88 26"
                  fill="none"
                  stroke={stroke}
                  strokeWidth="1.1"
                  strokeLinecap="round"
                  opacity="0.85"
                />
                <circle cx="24" cy="62" r="1.2" fill={stroke} opacity="0.7" />
                <circle cx="38" cy="70" r="0.9" fill={stroke} opacity="0.55" />
                <circle cx="58" cy="66" r="1.1" fill={stroke} opacity="0.65" />
                <path
                  d="M72 22 L76 14 L80 22 Z"
                  fill="none"
                  stroke={stroke}
                  strokeWidth="0.9"
                  strokeLinejoin="round"
                />
              </>
            )}
            {mode === 1 && (
              <path
                d="M8 52 Q 28 38 48 52 T 92 48"
                fill="none"
                stroke={stroke}
                strokeWidth="1.15"
                strokeLinecap="round"
                opacity="0.88"
              />
            )}
            {mode === 2 && (
              <>
                <path
                  d="M50 88 Q 44 52 50 18 Q 56 52 50 88"
                  fill="none"
                  stroke={stroke}
                  strokeWidth="1"
                  strokeLinecap="round"
                />
                <path
                  d="M50 42 Q 32 36 22 44 M50 48 Q 68 40 78 46 M50 54 Q 34 62 26 72 M50 58 Q 70 64 74 74"
                  fill="none"
                  stroke={stroke}
                  strokeWidth="0.85"
                  strokeLinecap="round"
                  opacity="0.8"
                />
              </>
            )}
            {mode === 3 && (
              <>
                <path
                  d="M18 72 C 34 20 66 20 82 72"
                  fill="none"
                  stroke={stroke}
                  strokeWidth="0.9"
                  strokeLinecap="round"
                  opacity="0.75"
                />
                <path
                  d="M22 78 L26 76 M30 80 L34 78"
                  fill="none"
                  stroke={stroke}
                  strokeWidth="0.7"
                  strokeLinecap="round"
                />
              </>
            )}
          </svg>
        </div>
      );
    }
    case "speech_bubble": {
      const bs = pal.bubbleStroke ?? pal.ink;
      const bf = pal.bubbleFill ?? "rgba(255,252,250,0.5)";
      const thought = v % 2 === 1;
      return (
        <div key={el.id} style={{ ...base, filter: "drop-shadow(1px 3px 4px rgba(40,44,72,0.12))" }} aria-hidden>
          {thought ? (
            <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
              <circle cx="72" cy="78" r="4" fill="none" stroke={bs} strokeWidth="1.2" opacity="0.75" />
              <circle cx="62" cy="86" r="2.2" fill="none" stroke={bs} strokeWidth="0.9" opacity="0.65" />
              <path
                d="M22 38 C 22 18 78 18 78 38 C 78 58 22 58 22 38 Z"
                fill={bf}
                stroke={bs}
                strokeWidth="1.4"
                strokeLinejoin="round"
                opacity="0.9"
              />
            </svg>
          ) : (
            <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
              <path
                d="M18 28 Q 18 14 50 14 Q 82 14 82 34 Q 82 52 58 56 L 52 68 L 44 56 Q 18 52 18 28 Z"
                fill={bf}
                stroke={bs}
                strokeWidth="1.35"
                strokeLinejoin="round"
                opacity="0.92"
              />
            </svg>
          )}
        </div>
      );
    }
    case "fabric":
      return (
        <div
          key={el.id}
          className="torn overflow-hidden opacity-90"
          style={{
            ...base,
            background: `
              repeating-linear-gradient(0deg, ${pal.fabricA}, ${pal.fabricA} 1px, transparent 1px, transparent 3px),
              repeating-linear-gradient(90deg, ${pal.fabricB}, ${pal.fabricB} 1px, transparent 1px, transparent 4px)`,
            mixBlendMode: "multiply",
          }}
          aria-hidden
        />
      );
    case "botanical":
      return (
        <div key={el.id} className="overflow-hidden" style={base} aria-hidden>
          <div
            className="absolute inset-[-8%]"
            style={{
              background: `
                radial-gradient(ellipse 70% 45% at ${30 + (v % 20)}% ${40 + (v % 15)}%, ${pal.botanical}, transparent 70%),
                radial-gradient(ellipse 55% 40% at ${72 - (v % 15)}% ${62 + (v % 12)}%, ${pal.botanical}, transparent 68%)`,
              filter: "blur(0.9px)",
              opacity: 0.85,
            }}
          />
        </div>
      );
    case "pin":
      return (
        <div key={el.id} className="relative flex flex-col items-center" style={base} aria-hidden>
          <div
            className="rounded-full shadow-sm ring-1 ring-black/10"
            style={{
              width: "42%",
              height: "42%",
              maxWidth: "14px",
              maxHeight: "14px",
              background: `radial-gradient(circle at 32% 32%, #f4f2ee, ${pal.metal})`,
            }}
          />
          <div
            style={{
              width: "2px",
              flex: 1,
              minHeight: "55%",
              marginTop: "-1px",
              background: `linear-gradient(180deg, ${pal.metal}, rgba(42,38,34,0.25))`,
              borderRadius: "1px",
            }}
          />
        </div>
      );
    case "clip":
      return (
        <div
          key={el.id}
          className="relative"
          style={{
            ...base,
            perspective: "80px",
          }}
          aria-hidden
        >
          <div
            className="absolute left-[8%] top-[12%] h-[76%] w-[38%] rounded-[2px] shadow-sm"
            style={{
              background: `linear-gradient(180deg, ${pal.metal}, rgba(72,70,66,0.55))`,
              transform: "skewY(-8deg)",
            }}
          />
          <div
            className="absolute right-[8%] top-[12%] h-[76%] w-[38%] rounded-[2px] shadow-sm"
            style={{
              background: `linear-gradient(180deg, ${pal.metal}, rgba(72,70,66,0.55))`,
              transform: "skewY(8deg)",
            }}
          />
        </div>
      );
    default:
      return null;
  }
}

export function CollageArtElementsLayer({
  elements,
  styleId,
}: {
  elements: ArtLayoutElement[];
  styleId: CollageStyleId;
}) {
  if (!elements.length) return null;
  const pal = artPalette(styleId);
  const isZine = styleId === "vintage-zine";
  return (
    <>
      {elements.map((el) => (
        <CollageArtElementView key={el.id} el={el} pal={pal} isZine={isZine} />
      ))}
    </>
  );
}
