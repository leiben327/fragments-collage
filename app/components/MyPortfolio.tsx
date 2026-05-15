"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import { PORTFOLIO_UPDATED_EVENT } from "@/app/lib/portfolioKeys";
import {
  deletePortfolioEntry,
  downloadPortfolioPngs,
  loadPortfolio,
  updatePortfolioEntry,
  type PortfolioEntry,
} from "@/app/lib/portfolioStorage";

const easeSoft = [0.22, 1, 0.36, 1] as const;

export function MyPortfolio() {
  const reduce = useReducedMotion();
  const [items, setItems] = useState<PortfolioEntry[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftReflection, setDraftReflection] = useState("");
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const sync = () => setItems(loadPortfolio());
    queueMicrotask(sync);
    window.addEventListener(PORTFOLIO_UPDATED_EVENT, sync);
    return () => window.removeEventListener(PORTFOLIO_UPDATED_EVENT, sync);
  }, []);

  const beginEdit = (e: PortfolioEntry) => {
    setEditingId(e.id);
    setDraftTitle(e.title ?? "");
    setDraftReflection(e.reflection ?? "");
  };

  const saveEdit = () => {
    if (!editingId) return;
    updatePortfolioEntry(editingId, {
      title: draftTitle.trim() || undefined,
      reflection: draftReflection.trim() || undefined,
    });
    setEditingId(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraftTitle("");
    setDraftReflection("");
  };

  const onExportPngs = async () => {
    if (!items.length || exporting) return;
    setExporting(true);
    try {
      await downloadPortfolioPngs(items);
    } finally {
      setExporting(false);
    }
  };

  return (
    <section
      id="my-portfolio"
      className="relative scroll-mt-24 border-t border-ink/10 bg-[radial-gradient(ellipse_90%_60%_at_50%_0%,rgba(250,247,242,0.9),transparent_55%),linear-gradient(180deg,var(--paper)_0%,#ebe4d8_100%)] px-6 py-24 sm:px-10 sm:scroll-mt-28"
      aria-labelledby="portfolio-heading"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.045] mix-blend-multiply [background-image:repeating-linear-gradient(0deg,transparent,transparent_14px,rgba(61,56,50,0.04)_14px,rgba(61,56,50,0.04)_15px)]"
        aria-hidden
      />

      <div className="relative mx-auto max-w-[min(100%,88rem)]">
        <p className="font-body text-center text-[0.65rem] uppercase tracking-[0.22em] text-ink-soft/80">
          This device only · not shared
        </p>
        <motion.h2
          id="portfolio-heading"
          className="font-display mt-3 text-center text-3xl font-medium text-ink sm:text-4xl"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={reduce ? { duration: 0 } : { duration: 1.1, ease: easeSoft }}
        >
          My visual archive
        </motion.h2>
        <motion.p
          className="font-body mx-auto mt-4 max-w-lg text-center text-sm leading-relaxed text-ink-soft sm:text-[0.95rem]"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={reduce ? { duration: 0 } : { duration: 0.9, delay: 0.06 }}
        >
          A quiet drawer for finished collages — titles and notes are optional, and
          everything stays in your browser until you remove it.
        </motion.p>

        {items.length > 0 && (
          <div className="mt-10 flex justify-center">
            <button
              type="button"
              onClick={() => void onExportPngs()}
              disabled={exporting}
              className="font-body rounded-[2px_4px_3px_2px] border border-ink/16 bg-cream/80 px-6 py-2.5 text-sm text-ink shadow-[3px_12px_22px_var(--shadow)] transition-[background-color,border-color] duration-500 hover:border-ink/22 hover:bg-paper-deep/50 disabled:opacity-45"
            >
              {exporting ? "Preparing downloads…" : "Export portfolio · PNGs"}
            </button>
          </div>
        )}
        <p className="font-body mx-auto mt-3 max-w-md text-center text-xs italic text-ink-soft/75">
          PDF bundles can come later — for now, each piece downloads as its own PNG in
          order, with a short pause so the browser keeps up.
        </p>

        {items.length === 0 ? (
          <motion.div
            className="mx-auto mt-20 max-w-md rounded-[3px_6px_4px_3px] border border-dashed border-ink/16 bg-cream/35 px-8 py-14 text-center shadow-inner"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={reduce ? { duration: 0 } : { duration: 0.8, ease: easeSoft }}
          >
            <p className="font-body text-sm italic leading-relaxed text-ink-soft/95">
              Nothing in the drawer yet. When a collage feels finished upstairs, use
              <span className="not-italic text-ink/80"> Save to My Portfolio</span> — it
              will land here as a private keepsake on this device.
            </p>
          </motion.div>
        ) : (
          <ul
            className="mt-16 columns-1 gap-x-0 [column-fill:balance] [column-gap:1.5rem] sm:columns-2 sm:[column-gap:1.75rem] lg:columns-3 lg:[column-gap:2rem]"
            aria-label="Saved collages in your portfolio"
          >
            {items.map((item, i) => (
              <PortfolioCard
                key={item.id}
                item={item}
                index={i}
                reduce={!!reduce}
                editing={editingId === item.id}
                draftTitle={draftTitle}
                draftReflection={draftReflection}
                onDraftTitle={setDraftTitle}
                onDraftReflection={setDraftReflection}
                onBeginEdit={() => beginEdit(item)}
                onSaveEdit={saveEdit}
                onCancelEdit={cancelEdit}
                onDelete={() => {
                  if (
                    !window.confirm(
                      "Remove this piece from your portfolio on this browser only?",
                    )
                  ) {
                    return;
                  }
                  deletePortfolioEntry(item.id);
                  if (editingId === item.id) cancelEdit();
                }}
              />
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function PortfolioCard({
  item,
  index,
  reduce,
  editing,
  draftTitle,
  draftReflection,
  onDraftTitle,
  onDraftReflection,
  onBeginEdit,
  onSaveEdit,
  onCancelEdit,
  onDelete,
}: {
  item: PortfolioEntry;
  index: number;
  reduce: boolean;
  editing: boolean;
  draftTitle: string;
  draftReflection: string;
  onDraftTitle: (v: string) => void;
  onDraftReflection: (v: string) => void;
  onBeginEdit: () => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onDelete: () => void;
}) {
  const date = new Date(item.createdAt).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const displayTitle = item.title?.trim() || "Untitled piece";

  return (
    <motion.li
      className="mb-8 break-inside-avoid sm:mb-10"
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={
        reduce
          ? { duration: 0 }
          : { duration: 0.65, delay: Math.min(index, 12) * 0.04, ease: easeSoft }
      }
    >
      <article className="group relative rounded-[3px_5px_4px_3px] border border-ink/12 bg-gradient-to-b from-cream/92 via-paper/90 to-paper-deep/40 p-4 pb-5 shadow-[4px_18px_32px_rgba(61,56,50,0.08)] ring-1 ring-ink/[0.06] sm:p-5">
        <div className="relative overflow-hidden rounded-[2px] ring-1 ring-ink/10">
          {/* eslint-disable-next-line @next/next/no-img-element -- data URL from portfolio */}
          <img
            src={item.imageDataUrl}
            alt=""
            className="block h-auto w-full object-contain"
            loading="lazy"
            decoding="async"
          />
        </div>

        {!editing ? (
          <h3 className="font-display mt-4 text-lg font-medium leading-snug text-ink sm:text-xl">
            {displayTitle}
          </h3>
        ) : null}

        {editing ? (
          <div className="mt-3 space-y-3 border-t border-ink/10 pt-3">
            <label className="block">
              <span className="font-body text-[0.65rem] uppercase tracking-[0.14em] text-ink-soft">
                Title
              </span>
              <input
                value={draftTitle}
                onChange={(e) => onDraftTitle(e.target.value)}
                className="font-body mt-1 w-full rounded-[2px] border border-ink/14 bg-paper/80 px-3 py-2 text-sm text-ink outline-none ring-0 focus:border-ink/28"
                placeholder="Optional title"
              />
            </label>
            <label className="block">
              <span className="font-body text-[0.65rem] uppercase tracking-[0.14em] text-ink-soft">
                Reflection
              </span>
              <textarea
                value={draftReflection}
                onChange={(e) => onDraftReflection(e.target.value)}
                rows={3}
                className="font-body mt-1 w-full resize-y rounded-[2px] border border-ink/14 bg-paper/80 px-3 py-2 text-sm text-ink outline-none focus:border-ink/28"
                placeholder="A few quiet lines (optional)"
              />
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={onSaveEdit}
                className="font-body rounded-[2px_3px_2px_2px] border border-ink/18 bg-blush/40 px-4 py-1.5 text-xs text-ink"
              >
                Save caption
              </button>
              <button
                type="button"
                onClick={onCancelEdit}
                className="font-body text-xs text-ink-soft underline decoration-ink/15 underline-offset-4"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            {item.reflection?.trim() ? (
              <p className="font-body mt-3 border-l border-ink/12 pl-3 text-xs italic leading-relaxed text-ink-soft/95">
                {item.reflection}
              </p>
            ) : null}
            <p className="font-body mt-3 text-sm italic leading-relaxed text-ink-soft">
              {item.moodSentence}
            </p>
          </>
        )}

        <div className="font-body mt-3 flex flex-wrap gap-x-2 gap-y-1 text-[0.62rem] uppercase tracking-[0.14em] text-ink-soft/72">
          <span>{item.styleLabel}</span>
          <span aria-hidden>·</span>
          <span>{item.canvasFormatLabel}</span>
          {item.challengeTag ? (
            <>
              <span aria-hidden>·</span>
              <span className="max-w-full basis-full normal-case italic tracking-normal text-ink-soft/85 sm:basis-auto">
                {item.challengeTag}
              </span>
            </>
          ) : null}
        </div>
        <p className="font-body mt-2 text-[0.68rem] text-ink-soft/65">{date}</p>

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onBeginEdit}
            className="font-body text-left text-xs text-ink-soft underline decoration-ink/15 underline-offset-4 transition-colors hover:text-ink"
          >
            Edit title / reflection
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="font-body text-left text-xs text-ink-soft/80 underline decoration-ink/12 underline-offset-4 transition-colors hover:text-ink-soft"
          >
            Remove from portfolio
          </button>
        </div>
      </article>
    </motion.li>
  );
}
