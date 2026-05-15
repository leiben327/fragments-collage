"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useId, useState } from "react";

const easeSoft = [0.22, 1, 0.36, 1] as const;

export type ShareCommunityFragmentPayload = {
  title: string;
  reflection: string;
  anonymous: boolean;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onShare: (payload: ShareCommunityFragmentPayload) => Promise<void>;
  challengeTag: string | null;
  moodPreview: string;
  styleLabel: string;
  isSubmitting: boolean;
};

export function ShareCommunityFragmentModal({
  open,
  onClose,
  onShare,
  challengeTag,
  moodPreview,
  styleLabel,
  isSubmitting,
}: Props) {
  const reduce = useReducedMotion();
  const titleId = useId();
  const reflectionId = useId();
  const [title, setTitle] = useState("");
  const [reflection, setReflection] = useState("");
  const [anonymous, setAnonymous] = useState(true);

  useEffect(() => {
    if (!open) return;
    queueMicrotask(() => {
      setTitle("");
      setReflection("");
      setAnonymous(true);
    });
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[200] flex items-end justify-center p-4 pb-10 sm:items-center sm:p-6"
          role="presentation"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0 : 0.35 }}
        >
          <motion.button
            type="button"
            aria-label="Close"
            className="absolute inset-0 bg-ink/25 backdrop-blur-[2px]"
            onClick={() => !isSubmitting && onClose()}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="share-fragment-dialog-title"
            className="relative z-[1] w-full max-w-md overflow-hidden rounded-[4px_6px_5px_4px] border border-ink/18 bg-gradient-to-b from-cream/98 via-paper/95 to-paper-deep/55 shadow-[12px_40px_72px_rgba(61,56,50,0.22),inset_0_1px_0_rgba(255,252,248,0.7)]"
            initial={{ opacity: 0, y: 24, rotate: reduce ? 0 : -0.4 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            exit={{ opacity: 0, y: 16, transition: { duration: 0.25 } }}
            transition={reduce ? { duration: 0 } : { duration: 0.45, ease: easeSoft }}
            style={{
              backgroundImage:
                "repeating-linear-gradient(0deg, transparent, transparent 6px, rgba(61,56,50,0.035) 6px, rgba(61,56,50,0.035) 7px)",
            }}
          >
            <div
              className="pointer-events-none absolute -right-4 top-5 h-20 w-9 rotate-[11deg] rounded-[1px] border border-ink/10 bg-paper-deep/45 opacity-70 shadow-sm"
              aria-hidden
            />
            <div className="relative px-6 py-7 sm:px-8 sm:py-8">
              <h2
                id="share-fragment-dialog-title"
                className="font-display text-xl font-medium text-ink sm:text-2xl"
              >
                Add to the shared archive
              </h2>
              <p className="font-body mt-2 text-sm leading-relaxed text-ink-soft">
                Your collage becomes a quiet fragment on the wall — not a post, just a
                small offering neighbors can hold gently.
              </p>

              <div className="mt-5 rounded-[2px_4px_3px_2px] border border-ink/10 bg-paper-deep/25 px-3 py-2.5 text-xs text-ink-soft shadow-inner">
                <span className="font-body uppercase tracking-[0.12em] text-ink-soft/80">
                  mood
                </span>
                <p className="font-body mt-1 italic leading-snug text-ink/90">{moodPreview}</p>
                <p className="font-body mt-2 text-[0.65rem] text-ink-soft/85">
                  style · {styleLabel}
                </p>
              </div>

              {challengeTag && (
                <div className="mt-4">
                  <span className="font-body text-[0.65rem] uppercase tracking-[0.18em] text-ink-soft/85">
                    fragment challenge
                  </span>
                  <p className="font-body mt-1 rounded-[2px] border border-sage/35 bg-sage/15 px-2.5 py-2 text-xs italic leading-relaxed text-ink/88">
                    {challengeTag}
                  </p>
                </div>
              )}

              <div className="mt-6 space-y-4">
                <div>
                  <label
                    htmlFor={titleId}
                    className="font-body text-xs italic text-ink-soft"
                  >
                    optional title
                  </label>
                  <input
                    id={titleId}
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    maxLength={80}
                    placeholder="e.g. sunday drawer light"
                    className="font-body mt-2 w-full rounded-[2px_4px_3px_2px] border border-ink/12 bg-cream/80 px-3 py-2 text-sm text-ink shadow-inner outline-none placeholder:text-ink-soft/40 focus:border-ink/22"
                  />
                </div>
                <div>
                  <label
                    htmlFor={reflectionId}
                    className="font-body text-xs italic text-ink-soft"
                  >
                    optional short reflection
                  </label>
                  <textarea
                    id={reflectionId}
                    rows={3}
                    value={reflection}
                    onChange={(e) => setReflection(e.target.value)}
                    maxLength={320}
                    placeholder="A sentence or two, if you like."
                    className="font-body mt-2 w-full resize-none rounded-[2px_4px_3px_2px] border border-ink/12 bg-cream/80 px-3 py-2 text-sm text-ink shadow-inner outline-none placeholder:text-ink-soft/40 focus:border-ink/22"
                  />
                </div>
              </div>

              <div className="mt-6 flex items-start gap-3 rounded-[2px] border border-ink/10 bg-cream/50 px-3 py-3">
                <input
                  id="share-anonymous"
                  type="checkbox"
                  checked={anonymous}
                  onChange={(e) => setAnonymous(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-ink/25 text-ink accent-ink/50"
                />
                <label htmlFor="share-anonymous" className="font-body text-sm leading-snug text-ink-soft">
                  <span className="text-ink">Share anonymously</span>
                  <span className="mt-1 block text-xs text-ink-soft/90">
                    If off, a gentle name appears beside your fragment — never an account
                    handle.
                  </span>
                </label>
              </div>

              <div className="mt-8 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="font-body rounded-[2px_4px_3px_2px] border border-ink/12 bg-transparent px-4 py-2.5 text-sm text-ink-soft transition-colors hover:text-ink disabled:opacity-40"
                >
                  Close
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() =>
                    onShare({
                      title: title.trim(),
                      reflection: reflection.trim(),
                      anonymous,
                    })
                  }
                  className="font-body rounded-[2px_4px_3px_2px] border border-ink/20 bg-paper-deep/70 px-5 py-2.5 text-sm text-ink shadow-[4px_14px_28px_var(--shadow)] transition-[background-color,border-color] hover:border-ink/26 hover:bg-blush/35 disabled:opacity-45"
                >
                  {isSubmitting ? "Placing on the wall…" : "Place on the community wall"}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
