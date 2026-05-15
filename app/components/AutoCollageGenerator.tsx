"use client";

import { computeCollageLayout } from "@/app/lib/collageLayout";
import {
  COMPOSITION_MODE_IDS,
  DEFAULT_COMPOSITION_MODE,
  COMPOSITION_MODE_META,
  type CompositionModeId,
} from "@/app/lib/collageCompositionModes";
import {
  COLLAGE_STYLE_IDS,
  DEFAULT_COLLAGE_STYLE,
  getStylePreset,
  type CollageStyleId,
} from "@/app/lib/collageStylePresets";
import {
  CANVAS_FORMATS,
  DEFAULT_CANVAS_FORMAT_ID,
  getCanvasFormat,
  type CanvasFormatId,
} from "@/app/lib/collageCanvasFormats";
import {
  DEFAULT_MOOD_FONT_ID,
  DEFAULT_MOOD_FONT_SIZE_PX,
  DEFAULT_MOOD_TEXT_POSITION_ID,
  fitMoodTextToShell,
  getMoodCaptionShellStyle,
  moodCaptionTypographyStyle,
  moodFontFamilyCss,
  MOOD_FONT_OPTIONS,
  MOOD_FONT_SIZE_PRESETS,
  MOOD_TEXT_POSITION_OPTIONS,
  type MoodFontId,
  type MoodTextPositionId,
} from "@/app/lib/moodTextStyle";
import { SESSION_ACTIVE_FRAGMENT_CHALLENGE_KEY } from "@/app/lib/communityFragmentKeys";
import {
  addPortfolioEntry,
  blobToDataUrl,
  newPortfolioId,
} from "@/app/lib/portfolioStorage";
import {
  screenshotScaleForBand,
  useViewportEffectsBand,
  type ViewportEffectsBand,
} from "@/app/lib/useViewportEffectsBand";
import {
  newFragmentId,
  saveCommunityFragment,
} from "@/app/lib/communityFragmentsIndexedDb";
import {
  ShareCommunityFragmentModal,
  type ShareCommunityFragmentPayload,
} from "./ShareCommunityFragmentModal";
import { motion, useReducedMotion } from "framer-motion";
import { domToBlob } from "modern-screenshot";
import {
  startTransition,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";

const easeSoft = [0.22, 1, 0.36, 1] as const;

function formatExportFailure(err: unknown): string {
  if (typeof err === "string" && err.trim()) return err.trim();
  if (err instanceof Error && err.message.trim()) return err.message.trim();
  if (err instanceof DOMException && err.name)
    return `${err.name}${err.message ? `: ${err.message}` : ""}`;
  if (err && typeof err === "object") {
    const o = err as Record<string, unknown>;
    if (typeof o.message === "string" && o.message.trim()) return o.message.trim();
    if (typeof o.reason === "string" && o.reason.trim()) return o.reason.trim();
    const agg = err as AggregateError;
    if (Array.isArray(agg.errors) && agg.errors.length) {
      return agg.errors
        .map((e) => (e instanceof Error ? e.message : String(e)))
        .filter(Boolean)
        .join("; ");
    }
  }
  return "";
}

/** Inline style keys we override so the live DOM matches export pixels before capture. */
const EXPORT_BOARD_STYLE_KEYS = [
  "width",
  "height",
  "max-width",
  "max-height",
  "min-width",
  "min-height",
  "aspect-ratio",
  "margin",
  "margin-top",
  "margin-right",
  "margin-bottom",
  "margin-left",
  "transform",
] as const;

/**
 * `modern-screenshot` clones the node and sets export width/height on the clone, but
 * layout inside `<foreignObject>` can still resolve against the on-screen box — leaving a
 * small composition in a corner of a tall/wide PNG. Pinning the real element to the
 * export pixel box first makes percentage-based collage math match the downloaded file.
 */
async function withBoardPinnedToExportPixels<T>(
  el: HTMLElement,
  exportWidth: number,
  exportHeight: number,
  run: () => Promise<T>,
): Promise<T> {
  const previous = new Map<string, string>();
  for (const key of EXPORT_BOARD_STYLE_KEYS) {
    previous.set(key, el.style.getPropertyValue(key));
  }
  el.style.setProperty("width", `${exportWidth}px`, "important");
  el.style.setProperty("height", `${exportHeight}px`, "important");
  el.style.setProperty("max-width", "none", "important");
  el.style.setProperty("max-height", "none", "important");
  el.style.setProperty("min-width", "0", "important");
  el.style.setProperty("min-height", "0", "important");
  el.style.setProperty("aspect-ratio", "unset", "important");
  el.style.setProperty("margin", "0", "important");
  el.style.setProperty("transform", "none", "important");
  try {
    void el.offsetHeight;
    await new Promise<void>((r) => requestAnimationFrame(() => r()));
    await new Promise<void>((r) => requestAnimationFrame(() => r()));
    return await run();
  } finally {
    for (const key of EXPORT_BOARD_STYLE_KEYS) {
      const v = previous.get(key) ?? "";
      if (v === "") el.style.removeProperty(key);
      else el.style.setProperty(key, v);
    }
  }
}

async function collageNodeToPngBlob(
  node: HTMLElement,
  backgroundColor: string,
  exportWidth: number,
  exportHeight: number,
  scale: number,
): Promise<Blob> {
  const capture = () =>
    domToBlob(node, {
      font: false,
      scale,
      width: exportWidth,
      height: exportHeight,
      backgroundColor,
      type: "image/png",
      fetch: { bypassingCache: true },
      maximumCanvasSize: 16384,
      timeout: 60000,
      onCloneEachNode: (cloned) => {
        if (
          cloned instanceof HTMLElement &&
          cloned.hasAttribute("data-collage-export-strip-filter")
        ) {
          cloned.style.filter = "none";
        }
      },
    });

  let blob = await capture();
  if (!blob || blob.size < 64) {
    blob = await domToBlob(node, {
      font: false,
      scale,
      width: exportWidth,
      height: exportHeight,
      backgroundColor,
      type: "image/png",
      fetch: { bypassingCache: true },
      maximumCanvasSize: 16384,
      timeout: 60000,
      onCloneEachNode: (cloned) => {
        if (
          cloned instanceof HTMLElement &&
          cloned.hasAttribute("data-collage-export-strip-filter")
        ) {
          cloned.style.filter = "none";
        }
      },
    });
  }
  if (!blob || blob.size < 64) {
    throw new Error("The export step produced an empty file.");
  }
  return blob;
}

/** Same noise tile as site grain — layered on collage for export fidelity */
const GRAIN_DATA_URI =
  'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")';

/** Coarser grain — photocopy / crumple (per piece) */
const WRINKLE_DATA_URI =
  'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'w\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.055\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23w)\'/%3E%3C/svg%3E")';

function paperCurlOverlay(corner: 0 | 1 | 2 | 3): CSSProperties {
  const common: CSSProperties = {
    position: "absolute",
    pointerEvents: "none",
    zIndex: 12,
    mixBlendMode: "soft-light",
  };
  switch (corner) {
    case 0:
      return {
        ...common,
        top: 0,
        left: 0,
        width: "44%",
        height: "44%",
        background:
          "linear-gradient(140deg, rgba(255,252,248,0.62) 0%, rgba(42,36,32,0.08) 38%, transparent 72%)",
      };
    case 1:
      return {
        ...common,
        top: 0,
        right: 0,
        width: "44%",
        height: "44%",
        background:
          "linear-gradient(220deg, rgba(255,252,248,0.52) 0%, rgba(42,36,32,0.07) 40%, transparent 72%)",
      };
    case 2:
      return {
        ...common,
        bottom: 0,
        left: 0,
        width: "44%",
        height: "44%",
        background:
          "linear-gradient(42deg, rgba(255,252,248,0.48) 0%, rgba(42,36,32,0.09) 42%, transparent 72%)",
      };
    default:
      return {
        ...common,
        bottom: 0,
        right: 0,
        width: "44%",
        height: "44%",
        background:
          "linear-gradient(312deg, rgba(255,252,248,0.5) 0%, rgba(42,36,32,0.08) 40%, transparent 72%)",
      };
  }
}

type Slot = { file: File; url: string };

function useImageSlots() {
  const [slots, setSlots] = useState<Slot[]>([]);
  const slotsRef = useRef(slots);

  useEffect(() => {
    slotsRef.current = slots;
  }, [slots]);

  useEffect(() => {
    return () => {
      slotsRef.current.forEach((s) => URL.revokeObjectURL(s.url));
    };
  }, []);

  const addImageFiles = useCallback((files: File[]) => {
    if (!files.length) return;
    setSlots((prev) => {
      const merged: Slot[] = [...prev];
      for (const f of files) {
        if (merged.length >= 8) break;
        if (!f.type.startsWith("image/")) continue;
        merged.push({ file: f, url: URL.createObjectURL(f) });
      }
      return merged;
    });
  }, []);

  const removeAt = useCallback((index: number) => {
    setSlots((prev) => {
      const copy = [...prev];
      const [removed] = copy.splice(index, 1);
      if (removed) URL.revokeObjectURL(removed.url);
      return copy;
    });
  }, []);

  const clearAll = useCallback(() => {
    setSlots((prev) => {
      prev.forEach((s) => URL.revokeObjectURL(s.url));
      return [];
    });
  }, []);

  return { slots, addImageFiles, removeAt, clearAll };
}

export function AutoCollageGenerator() {
  const reduce = useReducedMotion();
  const viewportBand = useViewportEffectsBand();
  const fileInputId = useId();
  const edgeFilterUid = useId().replace(/:/g, "");
  const boardRef = useRef<HTMLDivElement>(null);
  const moodPreviewShellRef = useRef<HTMLDivElement>(null);
  const moodPreviewTextRef = useRef<HTMLParagraphElement>(null);
  const moodCaptionShellRef = useRef<HTMLDivElement>(null);
  const moodCaptionTextRef = useRef<HTMLParagraphElement>(null);
  const { slots, addImageFiles, removeAt, clearAll } = useImageSlots();

  const [styleId, setStyleId] = useState<CollageStyleId>(DEFAULT_COLLAGE_STYLE);
  const [compositionMode, setCompositionMode] = useState<CompositionModeId>(
    DEFAULT_COMPOSITION_MODE,
  );
  const [mood, setMood] = useState("");
  const [salt, setSalt] = useState(0);
  const [generated, setGenerated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [canvasFormatId, setCanvasFormatId] = useState<CanvasFormatId>(
    DEFAULT_CANVAS_FORMAT_ID,
  );
  const [exporting, setExporting] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [shareBusy, setShareBusy] = useState(false);
  const [shareChallengeTag, setShareChallengeTag] = useState<string | null>(null);
  const [portfolioBusy, setPortfolioBusy] = useState(false);
  const [portfolioMessage, setPortfolioMessage] = useState<string | null>(null);
  const [portfolioError, setPortfolioError] = useState<string | null>(null);
  const [moodFontId, setMoodFontId] = useState<MoodFontId>(DEFAULT_MOOD_FONT_ID);
  const [moodFontSizePx, setMoodFontSizePx] = useState(DEFAULT_MOOD_FONT_SIZE_PX);
  const [moodTextPositionId, setMoodTextPositionId] = useState<MoodTextPositionId>(
    DEFAULT_MOOD_TEXT_POSITION_ID,
  );
  const [moodAutoFit, setMoodAutoFit] = useState(true);
  const [moodFitCollagePx, setMoodFitCollagePx] = useState<number | null>(null);
  const [moodFitPreviewPx, setMoodFitPreviewPx] = useState<number | null>(null);
  const [moodFitWarnCollage, setMoodFitWarnCollage] = useState(false);
  const [moodFitWarnPreview, setMoodFitWarnPreview] = useState(false);

  const preset = useMemo(() => getStylePreset(styleId), [styleId]);
  const canvasFormat = useMemo(
    () => getCanvasFormat(canvasFormatId),
    [canvasFormatId],
  );

  const layoutEngineOptions = useMemo(
    () => ({
      liteDecor: viewportBand !== "full",
      liteRender: viewportBand === "compact",
    }),
    [viewportBand],
  );

  const boardFrameStyle = useMemo((): CSSProperties => {
    const W = canvasFormat.exportWidth;
    const H = canvasFormat.exportHeight;
    const portrait = H > W * 1.08;
    const maxPortraitH =
      viewportBand === "full"
        ? "min(1000px, min(88dvh, 92svh))"
        : viewportBand === "cozy"
          ? "min(720px, min(76dvh, 88svh))"
          : "min(520px, min(64dvh, 84svh))";
    return {
      aspectRatio: `${W} / ${H}`,
      ...(portrait
        ? {
            height: maxPortraitH,
            width: `min(96vw, calc(${maxPortraitH} * ${W / H}))`,
            maxWidth: "96vw",
          }
        : {
            width: "min(96vw, 1320px)",
            maxHeight:
              viewportBand === "full"
                ? "min(88dvh, 92svh)"
                : viewportBand === "cozy"
                  ? "min(76dvh, 86svh)"
                  : "min(64dvh, 82svh)",
          }),
    };
  }, [canvasFormat, viewportBand]);

  const layout = useMemo(() => {
    if (!generated || slots.length < 3 || slots.length > 8) return null;
    const moodKey = mood.trim() || "a hush between heartbeats";
    return computeCollageLayout(
      slots.length,
      moodKey,
      salt,
      preset.hints,
      compositionMode,
      canvasFormat.id,
      canvasFormat.compositionKind,
      layoutEngineOptions,
    );
  }, [
    generated,
    slots.length,
    mood,
    salt,
    preset,
    compositionMode,
    canvasFormat,
    layoutEngineOptions,
  ]);

  const onPickFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setGenerated(false);
    const list = e.target.files;
    const snapshot = list?.length ? Array.from(list) : [];
    e.target.value = "";
    if (snapshot.length) addImageFiles(snapshot);
  };

  const onGenerate = () => {
    setError(null);
    if (slots.length < 3) {
      setError("Choose at least three photographs — collages need a little chorus.");
      return;
    }
    if (slots.length > 8) return;
    startTransition(() => {
      setSalt(Date.now());
      setGenerated(true);
    });
  };

  const onShuffleLayout = () => {
    setError(null);
    if (slots.length < 3) {
      setError("Choose at least three photographs before shuffling.");
      return;
    }
    if (slots.length > 8) return;
    startTransition(() => {
      setSalt(Date.now());
      setGenerated(true);
    });
  };

  const captureCollagePng = useCallback(async (): Promise<Blob> => {
    const node = boardRef.current;
    if (!node || !layout) {
      throw new Error("Nothing to capture yet.");
    }
    const imgs = Array.from(node.querySelectorAll("img"));
    await Promise.all(
      imgs.map(
        (img) =>
          new Promise<void>((resolve) => {
            if (img.complete) {
              resolve();
              return;
            }
            img.onload = () => resolve();
            img.onerror = () => resolve();
          }),
      ),
    );

    await Promise.all(
      imgs.map(async (img) => {
        if (typeof img.decode === "function") {
          try {
            await img.decode();
          } catch {
            /* decode can reject on corrupt frames; draw may still work */
          }
        }
      }),
    );

    await new Promise<void>((r) => requestAnimationFrame(() => r()));
    await new Promise<void>((r) => requestAnimationFrame(() => r()));

    return withBoardPinnedToExportPixels(
      node,
      canvasFormat.exportWidth,
      canvasFormat.exportHeight,
      () =>
        collageNodeToPngBlob(
          node,
          preset.exportBackgroundColor,
          canvasFormat.exportWidth,
          canvasFormat.exportHeight,
          screenshotScaleForBand(viewportBand),
        ),
    );
  }, [layout, preset, canvasFormat, viewportBand]);

  const onDownload = useCallback(async () => {
    if (!layout) return;
    setExporting(true);
    setError(null);
    try {
      const blob = await captureCollagePng();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = `mood-collage-${canvasFormat.id}.png`;
      a.rel = "noopener";
      a.style.display = "none";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(objectUrl);
    } catch (err) {
      const detail = formatExportFailure(err);
      const hint = detail
        ? ` ${detail}`
        : " The browser did not report a specific reason.";
      setError(
        `Could not save the PNG.${hint} Try Chrome or Edge, use photos from your device (not pasted URLs), or zoom out slightly and export again.`,
      );
    } finally {
      setExporting(false);
    }
  }, [layout, captureCollagePng, canvasFormat.id]);

  const openShareModal = useCallback(() => {
    let tag: string | null = null;
    try {
      tag = sessionStorage.getItem(SESSION_ACTIVE_FRAGMENT_CHALLENGE_KEY);
    } catch {
      /* private mode */
    }
    setShareChallengeTag(tag);
    setShareOpen(true);
  }, []);

  useEffect(() => {
    if (!portfolioMessage) return;
    const t = window.setTimeout(() => setPortfolioMessage(null), 5200);
    return () => window.clearTimeout(t);
  }, [portfolioMessage]);

  useEffect(() => {
    if (!portfolioError) return;
    const t = window.setTimeout(() => setPortfolioError(null), 9000);
    return () => window.clearTimeout(t);
  }, [portfolioError]);

  const onSaveToPortfolio = useCallback(async () => {
    console.log("[portfolio] save started", {
      hasLayout: !!layout,
      hasBoardEl: !!boardRef.current,
    });
    setPortfolioBusy(true);
    setPortfolioMessage(null);
    setPortfolioError(null);
    setError(null);

    if (!layout || !boardRef.current) {
      const msg =
        "Collage is not ready to save yet. Try Generate collage again, then Save to My Portfolio.";
      console.warn("[portfolio] save aborted: missing layout or board node");
      setPortfolioError(msg);
      setPortfolioBusy(false);
      return;
    }

    try {
      const blob = await captureCollagePng();
      console.log(
        "[portfolio] raster capture succeeded (same domToBlob / board pipeline as Download PNG)",
        { bytes: blob.size, type: blob.type },
      );

      const imageDataUrl = await blobToDataUrl(blob);
      console.log("[portfolio] image data URL ready", {
        length: imageDataUrl.length,
        prefix: `${imageDataUrl.slice(0, 40)}…`,
      });

      let challengePrompt: string | undefined;
      try {
        const raw = sessionStorage.getItem(SESSION_ACTIVE_FRAGMENT_CHALLENGE_KEY);
        if (raw?.trim()) challengePrompt = raw.trim();
      } catch {
        /* private mode */
      }

      addPortfolioEntry({
        id: newPortfolioId(),
        createdAt: Date.now(),
        imageDataUrl,
        moodSentence: mood.trim() || "today feels quiet and blue.",
        collageStyle: preset.label,
        canvasFormat: canvasFormat.label,
        challengePrompt,
      });

      setPortfolioMessage("Saved to My Portfolio");
      document.getElementById("my-portfolio")?.scrollIntoView({
        behavior: reduce ? "auto" : "smooth",
        block: "start",
      });
    } catch (err) {
      const domName = err instanceof DOMException ? err.name : "";
      const errName = err instanceof Error ? err.name : "";
      if (domName === "QuotaExceededError" || errName === "QuotaExceededError") {
        const msg =
          "This browser ran out of storage for the portfolio. Remove older pieces or clear site data, then try again.";
        console.error("[portfolio] QuotaExceededError", err);
        setPortfolioError(msg);
      } else {
        const detail = formatExportFailure(err);
        const msg = detail
          ? `Could not save to portfolio. ${detail}`
          : "Could not save to portfolio. Try again in a moment.";
        console.error("[portfolio] save failed", err);
        setPortfolioError(msg);
      }
    } finally {
      setPortfolioBusy(false);
    }
  }, [
    layout,
    captureCollagePng,
    mood,
    preset.label,
    canvasFormat.label,
    reduce,
  ]);

  const onShareToCommunity = useCallback(
    async (payload: ShareCommunityFragmentPayload) => {
      if (!layout) return;
      setShareBusy(true);
      setError(null);
      try {
        const blob = await captureCollagePng();
        await saveCommunityFragment({
          id: newFragmentId(),
          createdAt: Date.now(),
          imageBlob: blob,
          meta: {
            moodSentence: mood.trim() || "today feels quiet and blue.",
            styleId,
            styleLabel: preset.label,
            canvasFormatId: canvasFormat.id,
            canvasFormatLabel: canvasFormat.label,
            title: payload.title || undefined,
            reflection: payload.reflection || undefined,
            challengeTag: shareChallengeTag ?? undefined,
            anonymous: payload.anonymous,
            authorLabel: payload.anonymous ? "Anonymous" : "A quiet neighbor",
          },
        });
        try {
          sessionStorage.removeItem(SESSION_ACTIVE_FRAGMENT_CHALLENGE_KEY);
        } catch {
          /* ignore */
        }
        setShareOpen(false);
      } catch (err) {
        const domName = err instanceof DOMException ? err.name : "";
        const errName = err instanceof Error ? err.name : "";
        if (domName === "QuotaExceededError" || errName === "QuotaExceededError") {
          setError(
            "The archive drawer is full in this browser. Try downloading the PNG instead, or clear older saved fragments from site data.",
          );
        } else {
          const detail = formatExportFailure(err);
          setError(
            detail
              ? `Could not place your fragment on the wall. ${detail}`
              : "Could not place your fragment on the wall. Try again in a moment.",
          );
        }
      } finally {
        setShareBusy(false);
      }
    },
    [
      layout,
      captureCollagePng,
      mood,
      styleId,
      preset.label,
      canvasFormat.id,
      canvasFormat.label,
      shareChallengeTag,
    ],
  );

  const moodLine = mood.trim() || "today feels quiet and blue.";
  const canGenerate = slots.length >= 3 && slots.length <= 8;
  const showCollageLayers = Boolean(generated && layout);
  const isZine = styleId === "vintage-zine";

  const collageMoodFontPx = moodAutoFit
    ? (moodFitCollagePx ?? moodFontSizePx)
    : moodFontSizePx;
  const previewMoodFontPx = moodAutoFit
    ? (moodFitPreviewPx ?? moodFontSizePx)
    : moodFontSizePx;

  useLayoutEffect(() => {
    if (!moodAutoFit) {
      queueMicrotask(() => {
        setMoodFitCollagePx(null);
        setMoodFitPreviewPx(null);
        setMoodFitWarnCollage(false);
        setMoodFitWarnPreview(false);
      });
      return;
    }

    const previewShell = moodPreviewShellRef.current;
    const previewText = moodPreviewTextRef.current;
    if (previewShell && previewText) {
      const r = fitMoodTextToShell(previewShell, previewText, moodFontSizePx);
      setMoodFitPreviewPx(r.px);
      setMoodFitWarnPreview(r.overflow);
    } else {
      setMoodFitPreviewPx(moodFontSizePx);
      setMoodFitWarnPreview(false);
    }

    const collageShell = moodCaptionShellRef.current;
    const collageText = moodCaptionTextRef.current;
    if (collageShell && collageText && layout) {
      const r2 = fitMoodTextToShell(collageShell, collageText, moodFontSizePx);
      setMoodFitCollagePx(r2.px);
      setMoodFitWarnCollage(r2.overflow);
    } else {
      setMoodFitCollagePx(null);
      setMoodFitWarnCollage(false);
    }
  }, [
    moodAutoFit,
    moodFontSizePx,
    moodFontId,
    moodLine,
    moodTextPositionId,
    layout,
    showCollageLayers,
    canvasFormatId,
    generated,
  ]);

  const moodFitGentleWarning =
    moodAutoFit && (moodFitWarnCollage || moodFitWarnPreview)
      ? "Try a shorter sentence for a cleaner collage."
      : null;

  const moodCaptionPlacement = useMemo(() => {
    if (!layout) return null;
    const s = getMoodCaptionShellStyle(moodTextPositionId, layout);
    const { justifyContent, ...shellRect } = s;
    return { justifyContent, shellRect };
  }, [layout, moodTextPositionId]);

  const richMotion = viewportBand === "full" && !reduce;
  const enterTrans = reduce
    ? { duration: 0 }
    : richMotion
      ? { duration: 1.6, ease: easeSoft }
      : { duration: 0.4, ease: easeSoft };
  const enterTransSoft = reduce
    ? { duration: 0 }
    : richMotion
      ? { duration: 1.5, delay: 0.1, ease: easeSoft }
      : { duration: 0.38, ease: easeSoft };
  const enterTransBlock = reduce
    ? { duration: 0 }
    : richMotion
      ? { duration: 1.6, delay: 0.15, ease: easeSoft }
      : { duration: 0.42, delay: 0.04, ease: easeSoft };

  const linedPaperBlur =
    reduce || viewportBand === "compact"
      ? undefined
      : viewportBand === "cozy"
        ? "blur(0.35px)"
        : "blur(0.65px)";
  const scannedPaperBlur =
    reduce || viewportBand === "compact"
      ? undefined
      : viewportBand === "cozy"
        ? "blur(0.35px)"
        : "blur(0.75px)";
  const grainOverlayBlur =
    reduce || viewportBand === "compact"
      ? undefined
      : viewportBand === "cozy"
        ? "blur(0.45px)"
        : "blur(0.9px)";
  const atmosphereOpacity =
    viewportBand === "full" ? 0.85 : viewportBand === "cozy" ? 0.68 : 0.55;
  const boardDropShadow =
    viewportBand === "full"
      ? `8px 28px 56px var(--shadow), ${preset.innerVignette}`
      : viewportBand === "cozy"
        ? `5px 18px 34px var(--shadow), ${preset.innerVignette}`
        : `3px 12px 24px var(--shadow), ${preset.innerVignette}`;
  const innerPaperShellClass =
    viewportBand === "full"
      ? "shadow-[inset_0_0_48px_rgba(61,56,50,0.045)]"
      : viewportBand === "cozy"
        ? "shadow-[inset_0_0_28px_rgba(61,56,50,0.038)]"
        : "shadow-[inset_0_0_18px_rgba(61,56,50,0.032)]";

  return (
    <section
      id="mood-collage-studio"
      className="relative overflow-x-hidden scroll-mt-24 border-t border-ink/10 px-6 py-24 sm:px-10 sm:scroll-mt-28"
      aria-labelledby="auto-collage-heading"
    >
      <StudioSectionScraps band={viewportBand} />

      <div className="pointer-events-none absolute left-[6%] top-32 z-[2] hidden h-16 w-16 rotate-12 bg-gradient-to-br from-paper-deep to-blush/40 opacity-50 shadow-md lg:block" />
      <div className="pointer-events-none absolute right-[8%] top-48 z-[2] hidden h-12 w-20 -rotate-6 bg-gradient-to-br from-sage/50 to-paper-deep opacity-40 shadow-md lg:block" />

      <div className="relative z-10 mx-auto w-full min-w-0 max-w-3xl">
        <motion.h2
          id="auto-collage-heading"
          className="font-display text-center text-3xl font-medium text-ink sm:text-4xl"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={enterTrans}
        >
          Mood collage studio
        </motion.h2>
        <motion.p
          className="font-body mx-auto mt-4 max-w-xl text-center text-ink-soft"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={enterTransSoft}
        >
          Pick a visual temperament, a composition mode, and a canvas format — then shuffle until
          the page feels like yours.
        </motion.p>

        <motion.div
          className="mt-14 space-y-10"
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={enterTransBlock}
        >
          <fieldset>
            <legend className="font-body text-sm italic text-ink-soft">
              Collage style
            </legend>
            <div
              className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3"
              role="radiogroup"
              aria-label="Collage style"
            >
              {COLLAGE_STYLE_IDS.map((id) => {
                const p = getStylePreset(id);
                const selected = styleId === id;
                return (
                  <button
                    key={id}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => {
                      setStyleId(id);
                      setGenerated(false);
                      setError(null);
                    }}
                    className={`font-body rounded-[3px_5px_4px_3px] border px-3 py-2.5 text-left text-sm leading-snug transition-[box-shadow,background-color,border-color] duration-500 ${
                      selected
                        ? "border-ink/35 bg-blush/40 shadow-[4px_12px_26px_var(--shadow)]"
                        : "border-ink/12 bg-cream/50 hover:border-ink/22 hover:bg-cream/80"
                    }`}
                  >
                    <span className="font-display block text-base text-ink">
                      {p.label}
                    </span>
                    <span className="mt-1 block text-xs text-ink-soft/95">
                      {p.blurb}
                    </span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          <fieldset className="min-w-0 border-0 p-0">
            <legend className="font-body text-sm italic text-ink-soft">
              Composition mode
            </legend>
            <div
              className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3"
              role="radiogroup"
              aria-label="Composition mode"
            >
              {COMPOSITION_MODE_IDS.map((id) => {
                const meta = COMPOSITION_MODE_META[id];
                const selected = compositionMode === id;
                return (
                  <button
                    key={id}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => {
                      setCompositionMode(id);
                      setGenerated(false);
                      setError(null);
                    }}
                    className={`font-body rounded-[3px_5px_4px_3px] border px-3 py-2.5 text-left text-sm leading-snug transition-[box-shadow,background-color,border-color] duration-500 ${
                      selected
                        ? "border-ink/35 bg-sage/25 shadow-[4px_12px_26px_var(--shadow)]"
                        : "border-ink/12 bg-cream/50 hover:border-ink/22 hover:bg-cream/80"
                    }`}
                  >
                    <span className="font-display block text-base text-ink">
                      {meta.label}
                    </span>
                    <span className="mt-1 block text-xs text-ink-soft/95">
                      {meta.blurb}
                    </span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          <fieldset className="min-w-0 border-0 p-0">
            <legend className="font-body text-sm italic text-ink-soft">
              Canvas format
            </legend>
            <p className="font-body mt-2 max-w-2xl text-xs leading-relaxed text-ink-soft/90">
              Each format uses a different composition for its aspect ratio — not a stretch of one layout.
              Export matches the pixel size shown.
            </p>
            <div
              className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4"
              role="radiogroup"
              aria-label="Canvas export format"
            >
              {CANVAS_FORMATS.map((f) => {
                const selected = canvasFormatId === f.id;
                return (
                  <motion.button
                    key={f.id}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    layout={richMotion}
                    onClick={() => {
                      setCanvasFormatId(f.id);
                      setError(null);
                    }}
                    className={`font-body flex flex-col items-stretch gap-2 rounded-[3px_5px_4px_3px] border px-2.5 py-2.5 text-left text-sm leading-snug transition-[box-shadow,background-color,border-color] duration-500 ${
                      selected
                        ? "border-ink/35 bg-cream/90 shadow-[4px_12px_26px_var(--shadow)]"
                        : "border-ink/12 bg-cream/50 hover:border-ink/22 hover:bg-cream/80"
                    }`}
                    whileTap={reduce ? {} : { scale: 0.99 }}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="shrink-0 rounded-[2px] border border-ink/20 bg-paper-deep/40 shadow-inner"
                        style={{
                          aspectRatio: `${f.exportWidth} / ${f.exportHeight}`,
                          width: "32px",
                          height: "auto",
                        }}
                        aria-hidden
                      />
                      <span className="font-display min-w-0 text-[0.95rem] leading-tight text-ink">
                        {f.label}
                      </span>
                    </div>
                    <span className="block text-[0.65rem] uppercase tracking-[0.14em] text-ink-soft/90">
                      {f.exportWidth}×{f.exportHeight}px
                    </span>
                    <span className="line-clamp-2 text-[0.7rem] text-ink-soft/95">
                      {f.blurb}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </fieldset>

          <div>
            <label
              htmlFor={fileInputId}
              className="font-body text-sm italic text-ink-soft"
            >
              images (3–8, multiple selection)
            </label>
            <div className="mt-3 flex flex-wrap items-center gap-4">
              <input
                id={fileInputId}
                type="file"
                accept="image/*"
                multiple
                className="sr-only"
                onChange={onPickFiles}
              />
              <label
                htmlFor={fileInputId}
                className="font-body inline-flex min-h-[44px] cursor-pointer touch-manipulation items-center rounded-[2px_4px_3px_2px] border border-ink/18 bg-cream/70 px-5 py-2.5 text-sm text-ink shadow-[3px_10px_24px_var(--shadow)] transition-[background-color,transform] duration-700 hover:bg-blush/35"
              >
                Add photographs…
              </label>
              {slots.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    clearAll();
                    setGenerated(false);
                    setError(null);
                  }}
                  className="font-body text-sm text-ink-soft underline decoration-ink/20 underline-offset-4 transition-colors duration-700 hover:text-ink"
                >
                  clear all
                </button>
              )}
              <span className="font-body text-sm text-ink-soft/90">
                {slots.length} / 8 chosen
              </span>
            </div>

            {slots.length > 0 && (
              <ul className="mt-5 flex flex-wrap gap-3" aria-label="Chosen images">
                {slots.map((s, i) => (
                  <li
                    key={`${s.url}-${i}`}
                    className="relative overflow-hidden rounded-[2px_3px] shadow-[3px_10px_22px_var(--shadow)] ring-1 ring-ink/10"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element -- local blob previews */}
                    <img
                      src={s.url}
                      alt={s.file.name || `Image ${i + 1}`}
                      className="h-20 w-20 object-cover sm:h-24 sm:w-24"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        removeAt(i);
                        setGenerated(false);
                      }}
                      className="font-body absolute right-1 top-1 rounded bg-paper/90 px-1.5 py-0.5 text-xs text-ink shadow"
                      aria-label={`Remove ${s.file.name || `image ${i + 1}`}`}
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <label
              htmlFor="auto-collage-mood"
              className="font-body text-sm italic text-ink-soft"
            >
              mood sentence (optional)
            </label>
            <textarea
              id="auto-collage-mood"
              rows={2}
              value={mood}
              onChange={(e) => {
                setMood(e.target.value);
                setGenerated(false);
              }}
              placeholder="today feels quiet and blue."
              className="font-body mt-3 w-full resize-none rounded-[3px_5px_4px_3px] border border-ink/15 bg-cream/70 px-4 py-3 text-ink shadow-inner outline-none transition-[box-shadow,border-color,background-color] duration-[1.1s] ease-out placeholder:text-ink-soft/45 focus:border-ink/25 focus:bg-cream focus:shadow-[0_0_0_1px_rgba(61,56,50,0.06)]"
            />

            <fieldset className="mt-6 min-w-0 border-0 p-0">
              <legend className="font-body text-sm italic text-ink-soft">Text style</legend>
              <p className="font-body mt-2 max-w-xl text-xs leading-relaxed text-ink-soft/90">
                Fonts load from the page — what you see here matches the collage and the PNG.
              </p>

              <div className="mt-4 space-y-5 rounded-[3px_5px_4px_3px] border border-ink/12 bg-paper-deep/25 px-4 py-4 shadow-inner sm:px-5 sm:py-5">
                <div>
                  <span className="font-body text-[0.65rem] uppercase tracking-[0.16em] text-ink-soft/85">
                    Font
                  </span>
                  <div
                    className="mt-2 grid grid-cols-1 gap-1.5 sm:grid-cols-2"
                    role="radiogroup"
                    aria-label="Mood sentence font"
                  >
                    {MOOD_FONT_OPTIONS.map((opt) => {
                      const on = moodFontId === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          role="radio"
                          aria-checked={on}
                          onClick={() => setMoodFontId(opt.id)}
                          className={`font-body rounded-[2px_4px_3px_2px] border px-2.5 py-2 text-left text-xs leading-snug transition-[box-shadow,background-color,border-color] duration-500 ${
                            on
                              ? "border-ink/32 bg-cream/90 shadow-[3px_10px_22px_var(--shadow)]"
                              : "border-ink/10 bg-cream/45 hover:border-ink/18 hover:bg-cream/75"
                          }`}
                        >
                          <span
                            className="block text-[0.95rem] text-ink"
                            style={{ fontFamily: moodFontFamilyCss(opt.id) }}
                          >
                            {opt.label}
                          </span>
                          <span className="mt-0.5 block text-[0.65rem] text-ink-soft/88">
                            {opt.blurb}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <span className="font-body text-[0.65rem] uppercase tracking-[0.16em] text-ink-soft/85">
                    Size
                  </span>
                  <div
                    className="mt-2 flex flex-wrap gap-1.5"
                    role="radiogroup"
                    aria-label="Mood sentence size preset"
                  >
                    {MOOD_FONT_SIZE_PRESETS.map((p) => {
                      const on = Math.abs(moodFontSizePx - p.px) < 0.6;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          role="radio"
                          aria-checked={on}
                          onClick={() => setMoodFontSizePx(p.px)}
                          className={`font-body rounded-[2px_4px_3px_2px] border px-3 py-1.5 text-xs transition-[box-shadow,background-color,border-color] duration-500 ${
                            on
                              ? "border-ink/30 bg-blush/35 text-ink shadow-[2px_8px_18px_var(--shadow)]"
                              : "border-ink/10 bg-cream/50 text-ink-soft hover:border-ink/16 hover:bg-cream/80"
                          }`}
                        >
                          {p.label}
                        </button>
                      );
                    })}
                  </div>
                  <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                    <label
                      htmlFor="mood-font-size-range"
                      className="font-body shrink-0 text-xs text-ink-soft"
                    >
                      Custom ({moodFontSizePx}px)
                    </label>
                    <input
                      id="mood-font-size-range"
                      type="range"
                      min={14}
                      max={48}
                      step={1}
                      value={moodFontSizePx}
                      onChange={(e) => setMoodFontSizePx(Number(e.target.value))}
                      className="font-body h-2 w-full min-w-0 flex-1 cursor-pointer appearance-none rounded-full bg-ink/10 accent-ink/55"
                    />
                  </div>
                </div>

                <div>
                  <span className="font-body text-[0.65rem] uppercase tracking-[0.16em] text-ink-soft/85">
                    Position on canvas
                  </span>
                  <div
                    className="mt-2 grid grid-cols-2 gap-1.5 sm:grid-cols-4"
                    role="radiogroup"
                    aria-label="Mood sentence position"
                  >
                    {MOOD_TEXT_POSITION_OPTIONS.map((p) => {
                      const on = moodTextPositionId === p.id;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          role="radio"
                          aria-checked={on}
                          title={p.hint}
                          onClick={() => setMoodTextPositionId(p.id)}
                          className={`font-body rounded-[2px_4px_3px_2px] border px-2 py-2 text-left text-[0.7rem] leading-snug transition-[box-shadow,background-color,border-color] duration-500 ${
                            on
                              ? "border-ink/30 bg-sage/20 text-ink shadow-[2px_8px_18px_var(--shadow)]"
                              : "border-ink/10 bg-cream/45 text-ink-soft hover:border-ink/16 hover:bg-cream/78"
                          }`}
                        >
                          {p.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-ink/10 pt-4">
                  <span className="font-body text-xs text-ink-soft">Auto-fit in the text frame</span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={moodAutoFit}
                    aria-label="Auto-fit mood text in its frame"
                    onClick={() => setMoodAutoFit((v) => !v)}
                    className="font-body group flex items-center gap-2.5 rounded-full border border-ink/14 bg-cream/60 px-2 py-1.5 text-xs text-ink-soft shadow-inner transition-[background-color,border-color] duration-500 hover:border-ink/22 hover:bg-cream/85"
                  >
                    <span
                      className={`relative h-7 w-12 shrink-0 rounded-full border border-ink/12 bg-paper-deep/50 transition-colors duration-500 ${
                        moodAutoFit ? "bg-blush/45" : ""
                      }`}
                      aria-hidden
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 h-6 w-6 rounded-full border border-ink/10 bg-cream shadow-sm transition-transform duration-500 ease-out ${
                          moodAutoFit ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </span>
                    <span className="pr-1 text-[0.7rem] tracking-wide text-ink/80">
                      {moodAutoFit ? "On" : "Off"}
                    </span>
                  </button>
                </div>

                <div>
                  <p className="font-body text-[0.65rem] uppercase tracking-[0.14em] text-ink-soft/80">
                    Paper preview
                  </p>
                  <div className="mt-2 rounded-[2px_4px_3px_2px] border border-ink/12 bg-gradient-to-br from-cream/90 to-paper-deep/50 p-3 shadow-[inset_0_1px_0_rgba(255,252,248,0.55)]">
                    <div
                      ref={moodPreviewShellRef}
                      className="relative mx-auto aspect-[5/3] w-full max-w-md overflow-hidden rounded-[2px] bg-paper-deep/25"
                    >
                      <p
                        ref={moodPreviewTextRef}
                        className="box-border h-full w-full px-2 text-ink"
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          justifyContent:
                            moodTextPositionId === "upper-ribbon"
                              ? "flex-start"
                              : moodTextPositionId === "center-quiet"
                                ? "center"
                                : "flex-end",
                          ...moodCaptionTypographyStyle({
                            fontId: moodFontId,
                            fontSizePx: previewMoodFontPx,
                          }),
                          color: preset.captionColor,
                          textShadow: preset.captionTextShadow,
                        }}
                      >
                        {moodLine}
                      </p>
                    </div>
                  </div>
                  {moodFitGentleWarning && (
                    <p
                      className="font-body mt-2 text-xs italic leading-relaxed text-ink-soft/95"
                      role="status"
                      aria-live="polite"
                    >
                      {moodFitGentleWarning}
                    </p>
                  )}
                </div>
              </div>
            </fieldset>
          </div>

          {error && (
            <p className="font-body text-center text-sm italic text-ink-soft" role="alert">
              {error}
            </p>
          )}

          <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center">
            <motion.button
              type="button"
              onClick={onGenerate}
              disabled={!canGenerate}
              className="font-body rounded-[2px_4px_3px_2px] border border-ink/20 bg-paper-deep/70 px-8 py-3 text-ink shadow-[5px_16px_36px_var(--shadow)] transition-[background-color,opacity] duration-700 hover:bg-blush/45 disabled:cursor-not-allowed disabled:opacity-45"
              whileHover={!richMotion || !canGenerate ? {} : { scale: 1.02 }}
              whileTap={reduce || !canGenerate ? {} : { scale: 0.99 }}
            >
              Generate collage
            </motion.button>
            <motion.button
              type="button"
              onClick={onShuffleLayout}
              disabled={!canGenerate}
              className="font-body rounded-[2px_4px_3px_2px] border border-ink/15 bg-cream/75 px-6 py-3 text-sm text-ink-soft shadow-[4px_12px_28px_var(--shadow)] transition-colors duration-700 hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
              whileHover={!richMotion || !canGenerate ? {} : { scale: 1.01 }}
              whileTap={reduce || !canGenerate ? {} : { scale: 0.99 }}
            >
              Shuffle layout
            </motion.button>
          </div>
        </motion.div>
      </div>

      <div className="relative z-10 mx-auto mt-12 w-full max-w-[min(98vw,1600px)] px-0 sm:px-2">
        <FloatingBits band={viewportBand} reduce={!!reduce} />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={
            reduce
              ? { duration: 0 }
              : richMotion
                ? { duration: 1.5, ease: easeSoft }
                : { duration: 0.45, ease: easeSoft }
          }
          className="relative overflow-hidden py-6 sm:py-10"
        >
          <motion.div
            ref={boardRef}
            key={canvasFormatId}
            data-collage-export
            initial={reduce ? false : { opacity: 0.92 }}
            animate={{ opacity: 1 }}
            transition={
              reduce
                ? { duration: 0 }
                : richMotion
                  ? { duration: 0.5, ease: easeSoft }
                  : { duration: 0.28, ease: easeSoft }
            }
            className="relative mx-auto overflow-hidden rounded-[4px_6px_5px_3px] border border-ink/10"
            style={{
              ...boardFrameStyle,
              background: preset.boardBackground,
              boxShadow: boardDropShadow,
            }}
            aria-label="Collage canvas"
          >
            {!showCollageLayers && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-paper/90 px-8 text-center">
                <p className="font-body max-w-sm text-sm italic leading-relaxed text-ink-soft">
                  Choose a style, add three to eight images, then generate — your
                  mood board will gather here.
                </p>
                <p className="font-display text-lg text-ink/50">· · ·</p>
              </div>
            )}

            {showCollageLayers && layout && (
              <>
                <div
                  className="pointer-events-none absolute inset-0"
                  style={{
                    opacity: preset.linedTextureOpacity,
                    backgroundImage:
                      `repeating-linear-gradient(${preset.linedAngleDeg}deg, transparent, transparent 4px, rgba(61,56,50,0.05) 4px, rgba(61,56,50,0.05) 5px)`,
                    filter: linedPaperBlur,
                  }}
                  aria-hidden
                />

                <div
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background: preset.atmosphereGradient,
                    mixBlendMode: preset.atmosphereBlendMode,
                    opacity: atmosphereOpacity,
                  }}
                  aria-hidden
                />

                <div
                  className="pointer-events-none absolute inset-0"
                  style={{
                    opacity: Math.min(0.92, preset.scannedPaperOpacity + 0.04),
                    mixBlendMode: "multiply",
                    backgroundImage: `repeating-linear-gradient(${preset.scannedAngleDeg}deg, rgba(61,56,50,0.022) 0px, rgba(61,56,50,0.022) 1px, transparent 1px, transparent 5px), repeating-linear-gradient(90deg, rgba(255,252,248,0.028) 0px, transparent 2px, transparent 6px)`,
                    filter: scannedPaperBlur,
                  }}
                  aria-hidden
                />

                <div
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background: preset.globalGradeGradient,
                    mixBlendMode: preset.globalGradeBlendMode,
                    opacity: preset.globalGradeOpacity,
                  }}
                  aria-hidden
                />

                <div
                  className={`absolute inset-[1.8%] overflow-hidden rounded-[2px_3px_2px_2px] ${innerPaperShellClass}`}
                >
                <svg
                  className="pointer-events-none absolute h-0 w-0 overflow-hidden"
                  aria-hidden
                >
                  <defs>
                    {layout.pieces.map((p, i) => (
                      <filter
                        key={`fe-${salt}-${i}`}
                        id={`collage-edge-${edgeFilterUid}-${salt}-${i}`}
                        x="-30%"
                        y="-30%"
                        width="160%"
                        height="160%"
                        colorInterpolationFilters="sRGB"
                      >
                        <feTurbulence
                          type="fractalNoise"
                          baseFrequency={p.edgeNoiseBaseFrequency}
                          numOctaves={p.edgeNoiseOctaves}
                          seed={p.edgeDisplacementSeed}
                          stitchTiles="stitch"
                          result="edgeNoise"
                        />
                        <feDisplacementMap
                          in="SourceGraphic"
                          in2="edgeNoise"
                          scale={reduce ? 0 : p.edgeDisplacementScale}
                          xChannelSelector="R"
                          yChannelSelector="G"
                        />
                      </filter>
                    ))}
                  </defs>
                </svg>

                {layout.scraps.map((s, i) => (
                  <div
                    key={`scrap-${salt}-${i}`}
                    className={`torn pointer-events-none absolute ${
                      viewportBand === "full"
                        ? s.zIndex < 22
                          ? "shadow-sm"
                          : "shadow-[6px_18px_32px_rgba(45,40,35,0.22)]"
                        : "shadow-sm"
                    }`}
                    style={{
                      left: `${s.leftPct}%`,
                      top: `${s.topPct}%`,
                      width: s.w,
                      height: s.h,
                      zIndex: s.zIndex,
                      opacity: 0.82,
                      mixBlendMode: "multiply",
                      transform: `translate(-50%, -50%) rotate(${s.rotate}deg)`,
                      background: s.bg,
                    }}
                    aria-hidden
                  />
                ))}

                {layout.pieces.map((p, i) => {
                  const slotIdx = layout.imagePermutation[i] ?? i;
                  const url = slots[slotIdx]?.url;
                  if (!url) return null;
                  const imgFilter = [preset.unifiedImageFilter];
                  if (p.imageBlurPx > 0)
                    imgFilter.push(`blur(${p.imageBlurPx.toFixed(2)}px)`);
                  const isFocal = i === layout.focalIndex;
                  const clipPaper: CSSProperties = {
                    clipPath: p.clipPathCss,
                    WebkitClipPath: p.clipPathCss,
                  };
                  const edgeFilterRef = `url(#collage-edge-${edgeFilterUid}-${salt}-${i})`;
                  const paperInset =
                    "inset 0 0 30px rgba(42,38,34,0.2), inset 0 0 12px rgba(255,252,248,0.08)";
                  const paperDepth = isFocal
                    ? `${paperInset}, 0 0 0 1px rgba(255,255,255,0.22)`
                    : paperInset;

                  return (
                    <motion.div
                      key={`piece-${salt}-${i}-${url}`}
                      className="absolute"
                      style={{
                        left: `${p.xPct}%`,
                        top: `${p.yPct}%`,
                        width: `${p.widthPct}%`,
                        height: `${p.heightPct}%`,
                        zIndex: p.zIndex,
                        transform: `translate(-50%, calc(-50% + ${p.floatYOffsetPx}px)) rotate(${p.rotate}deg)`,
                        transformOrigin: "center center",
                        boxShadow: p.layerShadow,
                      }}
                      initial={reduce ? { opacity: 1 } : { opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={
                        reduce
                          ? { duration: 0 }
                          : richMotion
                            ? {
                                delay: i * 0.07,
                                duration: 1.2,
                                ease: easeSoft,
                              }
                            : viewportBand === "cozy"
                              ? {
                                  delay: i * 0.04,
                                  duration: 0.55,
                                  ease: easeSoft,
                                }
                              : {
                                  delay: i * 0.02,
                                  duration: 0.34,
                                  ease: easeSoft,
                                }
                      }
                    >
                      <div className="relative h-full w-full">
                        <div
                          className="pointer-events-none absolute left-1/2 top-1/2 opacity-[0.88]"
                          style={{
                            ...clipPaper,
                            width: `${100 * p.behindScale}%`,
                            height: `${100 * p.behindScale}%`,
                            zIndex: 0,
                            transform: `translate(-50%, -50%) rotate(${p.behindRotate}deg)`,
                            background: preset.behindGradient,
                            boxShadow:
                              viewportBand === "full"
                                ? "5px 18px 30px rgba(61,56,50,0.15)"
                                : "2px 10px 18px rgba(61,56,50,0.1)",
                          }}
                          aria-hidden
                        />
                        <div
                          data-collage-export-strip-filter
                          className={`relative z-10 flex h-full w-full overflow-hidden bg-paper-deep/15 ${
                            isZine ? preset.frameClasses : "ring-1 ring-white/30"
                          }`}
                          style={{
                            ...clipPaper,
                            filter: edgeFilterRef,
                            boxShadow: paperDepth,
                          }}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element -- blob collage */}
                          <img
                            src={url}
                            alt=""
                            className="relative z-0 h-full w-full min-h-0 flex-1 object-cover [image-rendering:auto]"
                            draggable={false}
                            decoding="async"
                            fetchPriority={i === layout.focalIndex ? "high" : "auto"}
                            style={{
                              opacity: p.opacity,
                              filter: imgFilter.join(" "),
                            }}
                          />
                          <div
                            className="pointer-events-none absolute inset-0 z-[9]"
                            style={{
                              background: `radial-gradient(ellipse 78% 74% at 46% 44%, transparent 30%, rgba(32,28,24,${0.42 + p.edgeVignetteOpacity * 0.35}) 100%)`,
                              mixBlendMode: "multiply",
                              opacity: Math.min(0.58, p.edgeVignetteOpacity + 0.08),
                            }}
                            aria-hidden
                          />
                          <div
                            className="pointer-events-none absolute inset-0 z-[10]"
                            style={{
                              opacity: p.wrinkleOpacity,
                              mixBlendMode: "multiply",
                              backgroundImage: WRINKLE_DATA_URI,
                              backgroundSize: "200px 200px",
                            }}
                            aria-hidden
                          />
                          <div
                            className="pointer-events-none absolute inset-0 z-[11]"
                            style={{
                              background: preset.pieceInkOverlay,
                              mixBlendMode: preset.pieceInkOverlayBlend,
                              opacity: preset.pieceInkOverlayOpacity,
                            }}
                            aria-hidden
                          />
                          <div
                            className="pointer-events-none z-[12]"
                            style={paperCurlOverlay(p.curlCorner)}
                            aria-hidden
                          />
                        </div>
                      </div>
                    </motion.div>
                  );
                })}

                {layout.tapes.map((t, i) => (
                  <div
                    key={`tape-${salt}-${i}`}
                    className="pointer-events-none absolute rounded-[1px]"
                    style={{
                      left: `${t.leftPct}%`,
                      top: `${t.topPct}%`,
                      width: t.width,
                      height: t.height,
                      opacity: t.opacity,
                      mixBlendMode: isZine ? "normal" : "multiply",
                      transform: `translate(-50%, -50%) rotate(${t.rotate}deg)`,
                      zIndex: t.zIndex,
                      background: preset.tapeGradient,
                      boxShadow: preset.tapeBoxShadow,
                    }}
                    aria-hidden
                  />
                ))}

                {moodCaptionPlacement && (
                  <div
                    ref={moodCaptionShellRef}
                    className="pointer-events-none absolute z-[96] overflow-hidden"
                    style={moodCaptionPlacement.shellRect}
                  >
                    <p
                      ref={moodCaptionTextRef}
                      className="box-border w-full max-w-full text-pretty"
                      style={{
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: moodCaptionPlacement.justifyContent,
                        ...moodCaptionTypographyStyle({
                          fontId: moodFontId,
                          fontSizePx: collageMoodFontPx,
                        }),
                        color: preset.captionColor,
                        textShadow: preset.captionTextShadow,
                      }}
                    >
                      {moodLine}
                    </p>
                  </div>
                )}

                </div>

                <div
                  className="pointer-events-none absolute inset-0"
                  style={{
                    opacity: preset.grainSvgOpacity,
                    mixBlendMode: "multiply",
                    backgroundImage: GRAIN_DATA_URI,
                    filter: grainOverlayBlur,
                  }}
                  aria-hidden
                />
              </>
            )}
          </motion.div>
        </motion.div>

        <ShareCommunityFragmentModal
          open={shareOpen}
          onClose={() => !shareBusy && setShareOpen(false)}
          onShare={onShareToCommunity}
          challengeTag={shareChallengeTag}
          moodPreview={moodLine}
          styleLabel={preset.label}
          isSubmitting={shareBusy}
        />

        {showCollageLayers && layout && (
          <div className="relative z-[5] mx-auto mt-12 flex max-w-3xl flex-col items-stretch gap-4 px-4">
              <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-4">
                <motion.button
                  type="button"
                  onClick={onDownload}
                  disabled={exporting || portfolioBusy}
                  className="font-body rounded-[2px_4px_3px_2px] border border-ink/18 bg-cream/85 px-6 py-3 text-sm text-ink shadow-[4px_14px_30px_var(--shadow)] transition-[background-color,border-color] duration-700 hover:border-ink/24 hover:bg-paper-deep/55 disabled:opacity-45"
                  whileHover={!richMotion || exporting ? {} : { scale: 1.01 }}
                  whileTap={reduce || exporting ? {} : { scale: 0.99 }}
                >
                  {exporting
                    ? "Saving…"
                    : `Download PNG · ${canvasFormat.exportWidth}×${canvasFormat.exportHeight}`}
                </motion.button>
                <motion.button
                  type="button"
                  onClick={openShareModal}
                  disabled={shareBusy || portfolioBusy}
                  className="font-body rounded-[2px_4px_3px_2px] border border-ink/16 bg-blush/35 px-6 py-3 text-sm text-ink shadow-[4px_14px_28px_var(--shadow)] transition-[background-color,border-color] duration-700 hover:border-ink/22 hover:bg-blush/50 disabled:opacity-45"
                  whileHover={!richMotion ? {} : { scale: 1.01 }}
                  whileTap={reduce ? {} : { scale: 0.99 }}
                >
                  Share to Community Fragments
                </motion.button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    void onSaveToPortfolio();
                  }}
                  disabled={portfolioBusy || exporting || shareBusy}
                  className="font-body cursor-pointer rounded-[2px_4px_3px_2px] border border-ink/14 bg-paper-deep/55 px-6 py-3 text-sm text-ink shadow-inner transition-[background-color,border-color] duration-700 hover:border-ink/22 hover:bg-cream/85 disabled:cursor-not-allowed disabled:opacity-45"
                >
                  {portfolioBusy ? "Saving to portfolio…" : "Save to My Portfolio"}
                </button>
              </div>
              <div className="flex justify-center">
                <motion.button
                  type="button"
                  onClick={onShuffleLayout}
                  disabled={!canGenerate || portfolioBusy}
                  className="font-body rounded-[2px_4px_3px_2px] border border-ink/14 bg-paper-deep/50 px-6 py-2.5 text-sm text-ink-soft shadow-inner transition-colors duration-700 hover:border-ink/20 hover:bg-cream/80 hover:text-ink disabled:opacity-40"
                  whileTap={reduce || !canGenerate ? {} : { scale: 0.99 }}
                >
                  Regenerate layout
                </motion.button>
              </div>
              {portfolioMessage && (
                <p
                  className="font-body text-center text-sm italic text-ink/80"
                  role="status"
                  aria-live="polite"
                >
                  {portfolioMessage}
                </p>
              )}
              {portfolioError && (
                <p
                  className="font-body text-center text-sm italic text-rose-900/85"
                  role="alert"
                >
                  {portfolioError}
                </p>
              )}
            </div>
        )}

      </div>
    </section>
  );
}

/** Decorative torn-paper scraps framing the studio (not part of export). */
function StudioSectionScraps({ band }: { band: ViewportEffectsBand }) {
  const showMid = band === "cozy" || band === "full";
  const showRich = band === "full";

  return (
    <div
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      aria-hidden
    >
      <div
        className="torn absolute left-[0.5%] top-[8rem] h-10 w-[2.75rem] max-w-[12vw] -rotate-[10deg] bg-gradient-to-br from-paper-deep/92 to-blush/50 opacity-[0.44] shadow-sm mix-blend-multiply ring-1 ring-ink/[0.05] sm:left-[2%] sm:top-[9.5rem] sm:h-11 sm:w-12"
      />
      <div
        className="torn absolute right-[1%] top-[11rem] h-9 w-14 max-w-[14vw] rotate-[12deg] bg-gradient-to-bl from-sage/65 to-paper-deep/85 opacity-[0.4] shadow-sm mix-blend-multiply ring-1 ring-ink/[0.04] sm:right-[3%]"
      />

      {showMid && (
        <>
          <div
            className="torn absolute bottom-[38%] left-[4%] hidden h-14 w-10 -rotate-[6deg] bg-gradient-to-br from-[#dcd4c8]/90 to-paper-deep/75 opacity-[0.36] shadow-sm mix-blend-multiply ring-1 ring-ink/[0.04] sm:block md:bottom-[34%] md:left-[5%]"
          />
          <div
            className="torn absolute bottom-[42%] right-[3%] h-11 w-[2.6rem] max-w-[11vw] rotate-[9deg] bg-gradient-to-br from-blush/55 to-cream/80 opacity-[0.38] shadow-sm mix-blend-multiply ring-1 ring-ink/[0.035] sm:right-[6%]"
          />
          <div
            className="torn absolute left-[8%] top-[52%] h-9 w-16 max-w-[28vw] -rotate-[4deg] bg-gradient-to-r from-paper-deep/80 via-blush/35 to-transparent opacity-[0.32] mix-blend-multiply sm:top-[48%] md:left-[10%]"
          />
        </>
      )}

      {showRich && (
        <>
          <div className="torn absolute left-[12%] top-[28%] hidden h-12 w-11 rotate-[11deg] bg-gradient-to-br from-cream/90 to-sage/40 opacity-[0.33] shadow-[3px_10px_18px_rgba(61,56,50,0.08)] mix-blend-multiply ring-1 ring-ink/[0.04] lg:block" />
          <div className="torn absolute right-[10%] top-[36%] hidden h-10 w-20 max-w-[18vw] -rotate-[8deg] bg-gradient-to-bl from-paper-deep/88 to-[#c9bba8]/70 opacity-[0.34] shadow-sm mix-blend-multiply ring-1 ring-ink/[0.05] md:block" />
          <div className="torn absolute bottom-[12%] right-[12%] hidden h-14 w-12 rotate-[7deg] bg-gradient-to-br from-blush/50 to-paper-deep/82 opacity-[0.36] shadow-sm mix-blend-multiply ring-1 ring-ink/[0.04] lg:block" />
          <div className="torn absolute bottom-[20%] left-[14%] hidden h-8 w-24 max-w-[20vw] -rotate-[3deg] bg-gradient-to-r from-sage/45 via-paper-deep/60 to-transparent opacity-[0.28] mix-blend-multiply xl:block" />
        </>
      )}
    </div>
  );
}

function FloatingBits({
  band,
  reduce,
}: {
  band: ViewportEffectsBand;
  reduce: boolean;
}) {
  const drift = band === "full" && !reduce;
  return (
    <>
      <motion.div
        className="pointer-events-none absolute -left-2 top-[8%] h-10 w-14 rotate-[-14deg] bg-gradient-to-br from-paper-deep to-blush/50 opacity-55 shadow-md sm:left-0"
        aria-hidden
        animate={drift ? { y: [0, -6, 3, 0], rotate: [-14, -12, -15, -14] } : false}
        transition={
          drift
            ? {
                duration: 14,
                repeat: Infinity,
                ease: "easeInOut",
              }
            : { duration: 0 }
        }
      />
      <motion.div
        className="pointer-events-none absolute -right-1 bottom-[12%] h-12 w-12 rotate-[18deg] rounded-sm bg-gradient-to-br from-sage/60 to-paper-deep opacity-50 shadow-md sm:right-0"
        aria-hidden
        animate={drift ? { y: [0, 5, -4, 0], rotate: [18, 20, 16, 18] } : false}
        transition={
          drift
            ? {
                duration: 16,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5,
              }
            : { duration: 0 }
        }
      />
    </>
  );
}
