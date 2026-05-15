"use client";

import { LayoutGroup, motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { COMMUNITY_FRAGMENTS_UPDATED_EVENT } from "@/app/lib/communityFragmentKeys";
import {
  getReactionsForPost,
  removeReactionsForPost,
  toggleSoftReaction,
  type SoftReactionKind,
} from "@/app/lib/communityFragmentReactions";
import {
  deleteCommunityFragment,
  listCommunityFragments,
  type CommunityFragmentRow,
} from "@/app/lib/communityFragmentsIndexedDb";
import {
  useViewportEffectsBand,
  type ViewportEffectsBand,
} from "@/app/lib/useViewportEffectsBand";

const easeSoft = [0.22, 1, 0.36, 1] as const;
const PAGE_SIZE = 12;

type UserWallItem = CommunityFragmentRow & { objectUrl: string };

const REACTION_LABELS: Record<
  SoftReactionKind,
  { label: string }
> = {
  felt: { label: "Felt this" },
  saved: { label: "Quietly saved" },
  heart: { label: "Soft heart" },
  bookmark: { label: "Gentle bookmark" },
};

function SoftReactionRibbon({ postId }: { postId: string }) {
  const [local, setLocal] = useState(() => getReactionsForPost(postId));

  const onToggle = (kind: SoftReactionKind) => {
    const next = toggleSoftReaction(postId, kind);
    setLocal(next);
  };

  return (
    <div className="mt-4 flex flex-wrap gap-1.5">
      {(Object.keys(REACTION_LABELS) as SoftReactionKind[]).map((kind) => {
        const on = Boolean(local[kind]);
        return (
          <button
            key={kind}
            type="button"
            onClick={() => onToggle(kind)}
            className={`font-body rounded-full border px-2.5 py-1 text-[0.65rem] tracking-wide transition-[background-color,border-color,box-shadow] duration-500 ${
              on
                ? "border-ink/22 bg-blush/40 text-ink shadow-sm"
                : "border-ink/10 bg-cream/50 text-ink-soft hover:border-ink/16 hover:bg-cream/85"
            }`}
          >
            {REACTION_LABELS[kind].label}
          </button>
        );
      })}
    </div>
  );
}

function itemEnterTransition(i: number, reduce: boolean) {
  if (reduce) return { duration: 0 };
  return {
    duration: 0.85,
    delay: Math.min(i, 20) * 0.04,
    ease: easeSoft,
  };
}

function floatLoop(
  reduce: boolean,
  seed: number,
  band: ViewportEffectsBand,
) {
  if (reduce || band !== "full") return undefined;
  const phase = seed % 3;
  const y = phase === 0 ? [0, -2.5, 1.5, 0] : phase === 1 ? [0, 2, -1.5, 0] : [0, -1, 2, 0];
  return {
    y,
    transition: {
      duration: 14 + (seed % 5),
      repeat: Infinity,
      ease: "easeInOut" as const,
      delay: seed * 0.09,
    },
  };
}

export function CommunityGallery() {
  const reduce = useReducedMotion();
  const viewportBand = useViewportEffectsBand();
  const richMotion = viewportBand === "full" && !reduce;
  const urlRef = useRef<string[]>([]);
  const [userItems, setUserItems] = useState<UserWallItem[]>([]);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const loadUserFragments = useCallback(async () => {
    urlRef.current.forEach((u) => URL.revokeObjectURL(u));
    urlRef.current = [];
    const rows = await listCommunityFragments();
    const mapped: UserWallItem[] = rows.map((r) => {
      const objectUrl = URL.createObjectURL(r.imageBlob);
      urlRef.current.push(objectUrl);
      return { ...r, objectUrl };
    });
    setUserItems(mapped);
  }, []);

  useEffect(() => {
    void loadUserFragments();
    const onUpdate = () => {
      void loadUserFragments();
    };
    window.addEventListener(COMMUNITY_FRAGMENTS_UPDATED_EVENT, onUpdate);
    return () => {
      window.removeEventListener(COMMUNITY_FRAGMENTS_UPDATED_EVENT, onUpdate);
      urlRef.current.forEach((u) => URL.revokeObjectURL(u));
      urlRef.current = [];
    };
  }, [loadUserFragments]);

  const sliceEnd =
    userItems.length === 0 ? 0 : Math.min(visibleCount, userItems.length);
  const displayed = userItems.slice(0, sliceEnd);
  const hasMore = userItems.length > 0 && visibleCount < userItems.length;

  return (
    <section
      className="relative overflow-x-hidden border-t border-ink/10 bg-paper-deep/25 px-6 py-24 sm:px-10"
      aria-labelledby="gallery-heading"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04] mix-blend-multiply max-lg:opacity-[0.025] [background-image:repeating-linear-gradient(92deg,transparent,transparent_48px,rgba(61,56,50,0.08)_48px,rgba(61,56,50,0.08)_49px)]"
        aria-hidden
      />

      <div className="relative mx-auto max-w-[min(100%,88rem)]">
        <motion.h2
          id="gallery-heading"
          className="font-display text-center text-3xl font-medium text-ink sm:text-4xl"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={
            reduce
              ? { duration: 0 }
              : richMotion
                ? { duration: 1.6, ease: easeSoft }
                : { duration: 0.42, ease: easeSoft }
          }
        >
          Community fragments
        </motion.h2>
        <motion.p
          className="font-body mx-auto mt-4 max-w-xl text-center text-sm leading-relaxed text-ink-soft sm:text-[0.95rem]"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={
            reduce
              ? { duration: 0 }
              : richMotion
                ? { duration: 1.5, delay: 0.12 }
                : { duration: 0.38 }
          }
        >
          A wall that keeps growing — each piece is a small weather someone left behind.
          Nothing is ranked; the newest drift in at the top, and the rest settle softly
          below.
        </motion.p>

        {userItems.length === 0 ? (
          <motion.div
            className="mx-auto mt-20 max-w-md rounded-[3px_6px_4px_3px] border border-dashed border-ink/14 bg-cream/40 px-8 py-14 text-center shadow-inner"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={reduce ? { duration: 0 } : { duration: 1.2, ease: easeSoft }}
          >
            <p className="font-body text-sm italic leading-relaxed text-ink-soft/95">
              The wall is quiet for now. When you finish a collage upstairs, you can place
              a fragment here — it will find its own space among the others, like paper on
              a studio table.
            </p>
          </motion.div>
        ) : (
          <>
            <LayoutGroup id="community-wall">
              <ul
                className="mt-16 columns-1 [column-fill:balance] [column-gap:1.75rem] sm:columns-2 sm:[column-gap:2rem] lg:columns-3 lg:[column-gap:2.25rem] xl:columns-4 xl:[column-gap:2.5rem]"
                aria-label="Shared collage fragments"
              >
                {displayed.map((item, i) => (
                  <FragmentWallCard
                    key={item.id}
                    item={item}
                    index={i}
                    reduce={!!reduce}
                    viewportBand={viewportBand}
                    richMotion={richMotion}
                  />
                ))}
              </ul>
            </LayoutGroup>

            {hasMore && (
              <div className="mt-14 flex justify-center">
                <motion.button
                  type="button"
                  onClick={() =>
                    setVisibleCount((c) =>
                      Math.min(c + PAGE_SIZE, userItems.length),
                    )
                  }
                  className="font-body rounded-[2px_4px_3px_2px] border border-ink/14 bg-cream/70 px-6 py-2.5 text-sm text-ink-soft shadow-inner transition-[background-color,border-color,color] duration-700 hover:border-ink/22 hover:bg-paper-deep/40 hover:text-ink"
                  whileHover={!richMotion ? {} : { scale: 1.02 }}
                  whileTap={!richMotion ? {} : { scale: 0.99 }}
                >
                  Load more fragments
                </motion.button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}

function FragmentWallCard({
  item,
  index,
  reduce,
  viewportBand,
  richMotion,
}: {
  item: UserWallItem;
  index: number;
  reduce: boolean;
  viewportBand: ViewportEffectsBand;
  richMotion: boolean;
}) {
  const m = item.meta;
  const [removeBusy, setRemoveBusy] = useState(false);
  const title = m.title?.trim() ?? "";
  const rot = ((index % 5) - 2) * 0.55 + (index % 2 === 0 ? 0.15 : -0.1);
  const date = new Date(item.createdAt).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
  const drift = floatLoop(reduce, index, viewportBand);

  const cardShadow =
    viewportBand === "full"
      ? "shadow-[6px_22px_40px_rgba(61,56,50,0.1)]"
      : viewportBand === "cozy"
        ? "shadow-[4px_14px_26px_rgba(61,56,50,0.08)]"
        : "shadow-[2px_10px_18px_rgba(61,56,50,0.07)]";

  return (
    <motion.li
      layout={viewportBand === "full"}
      className="mb-8 break-inside-avoid sm:mb-10"
      initial={{
        opacity: 0,
        y: 18,
        filter: reduce || viewportBand !== "full" ? "none" : "blur(4px)",
      }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={itemEnterTransition(index, reduce)}
    >
      <motion.div className="relative" animate={drift ?? false}>
        <div style={{ transform: `rotate(${rot}deg)` }}>
          <motion.article
            layout={viewportBand === "full"}
            className={`group relative overflow-visible rounded-[3px_6px_4px_2px] border border-ink/10 bg-gradient-to-b from-cream/90 via-paper/88 to-paper-deep/45 p-4 pb-5 ring-1 ring-ink/5 sm:p-5 ${cardShadow}`}
            whileHover={
              !richMotion
                ? {}
                : {
                    y: -8,
                    scale: 1.04,
                    boxShadow:
                      "14px 38px 56px rgba(61,56,50,0.16), 0 0 0 1px rgba(255,252,248,0.35)",
                    transition: { type: "spring", stiffness: 280, damping: 20 },
                  }
            }
            transition={{ type: "spring", stiffness: 120, damping: 18 }}
          >
        <div className="pointer-events-none absolute -left-1.5 top-10 z-[1] h-14 w-6 -rotate-[14deg] rounded-[1px] border border-ink/8 bg-paper-deep/35 opacity-55 shadow-sm max-lg:hidden" />
        <div className="pointer-events-none absolute -right-0.5 bottom-16 z-[1] h-11 w-7 rotate-[12deg] rounded-[1px] border border-ink/8 bg-blush/25 opacity-50 max-lg:hidden" />

        <div className="relative z-[2] w-full overflow-hidden rounded-[1px] shadow-[inset_0_0_0_1px_rgba(61,56,50,0.06)] ring-1 ring-ink/8">
          {/* eslint-disable-next-line @next/next/no-img-element -- blob URL from IndexedDB */}
          <img
            src={item.objectUrl}
            alt=""
            loading="lazy"
            decoding="async"
            className="block h-auto w-full max-w-full object-contain [image-rendering:auto]"
          />
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.11] mix-blend-multiply"
            style={{
              backgroundImage:
                "repeating-linear-gradient(6deg, transparent, transparent 6px, rgba(61,56,50,0.055) 6px, rgba(61,56,50,0.055) 7px)",
            }}
          />
        </div>

        {title ? (
          <h3 className="font-display mt-4 text-lg font-medium leading-snug text-ink sm:text-xl">
            {title}
          </h3>
        ) : null}
        <p
          className={`font-body text-sm italic leading-relaxed text-ink-soft ${
            title ? "mt-2" : "mt-4"
          }`}
        >
          {m.moodSentence}
        </p>
        {m.reflection && (
          <p className="font-body mt-3 border-l border-ink/14 pl-3 text-xs leading-relaxed text-ink-soft/95">
            {m.reflection}
          </p>
        )}
        <div className="font-body mt-3 flex flex-wrap gap-x-2 gap-y-1 text-[0.62rem] uppercase tracking-[0.16em] text-ink-soft/72">
          <span className="max-w-[10rem] truncate sm:max-w-none">{m.styleLabel}</span>
          <span aria-hidden>·</span>
          <span className="max-w-[9rem] truncate sm:max-w-none">{m.canvasFormatLabel}</span>
          {m.challengeTag && (
            <>
              <span aria-hidden>·</span>
              <span className="max-w-full basis-full normal-case italic tracking-normal text-ink-soft/88 sm:basis-auto sm:max-w-[18rem] sm:truncate">
                {m.challengeTag}
              </span>
            </>
          )}
        </div>
        <p className="font-body mt-2 text-[0.68rem] text-ink-soft/68">
          {m.anonymous ? "Anonymous" : m.authorLabel} · {date}
        </p>
        <SoftReactionRibbon postId={item.id} />
        <button
          type="button"
          disabled={removeBusy}
          onClick={async (e) => {
            e.preventDefault();
            if (
              !window.confirm(
                "Remove this fragment from this browser only? This cannot be undone.",
              )
            ) {
              return;
            }
            setRemoveBusy(true);
            try {
              await deleteCommunityFragment(item.id);
              removeReactionsForPost(item.id);
            } catch {
              window.alert("Could not remove this fragment. Please try again.");
              setRemoveBusy(false);
            }
          }}
          className="font-body mt-3 text-left text-[0.65rem] text-ink-soft/70 underline decoration-ink/15 underline-offset-4 transition-colors hover:text-ink-soft disabled:opacity-40"
        >
          {removeBusy ? "Removing…" : "Remove from this browser"}
        </button>
          </motion.article>
        </div>
      </motion.div>
    </motion.li>
  );
}
