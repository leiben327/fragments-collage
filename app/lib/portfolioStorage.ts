import {
  PORTFOLIO_STORAGE_KEY,
  PORTFOLIO_STORAGE_KEY_LEGACY,
  PORTFOLIO_UPDATED_EVENT,
} from "@/app/lib/portfolioKeys";

/** One saved collage in the local portfolio (localStorage). */
export type PortfolioEntry = {
  id: string;
  imageDataUrl: string;
  moodSentence: string;
  collageStyle: string;
  canvasFormat: string;
  challengePrompt?: string;
  createdAt: number;
  title?: string;
  reflection?: string;
};

const MAX_ENTRIES = 40;

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

/** Normalize legacy rows (styleLabel / canvasFormatId, etc.) into the current shape. */
export function normalizePortfolioEntry(raw: Record<string, unknown>): PortfolioEntry | null {
  const id = typeof raw.id === "string" ? raw.id : "";
  const imageDataUrl = typeof raw.imageDataUrl === "string" ? raw.imageDataUrl : "";
  const moodSentence = typeof raw.moodSentence === "string" ? raw.moodSentence : "";
  const createdAt =
    typeof raw.createdAt === "number"
      ? raw.createdAt
      : typeof raw.createdAt === "string"
        ? Number(raw.createdAt)
        : NaN;
  if (!id || !imageDataUrl.startsWith("data:") || !moodSentence || !Number.isFinite(createdAt)) {
    return null;
  }

  const collageStyle =
    typeof raw.collageStyle === "string"
      ? raw.collageStyle
      : typeof raw.styleLabel === "string"
        ? raw.styleLabel
        : typeof raw.styleId === "string"
          ? raw.styleId
          : "";

  const canvasFormat =
    typeof raw.canvasFormat === "string"
      ? raw.canvasFormat
      : typeof raw.canvasFormatLabel === "string"
        ? raw.canvasFormatLabel
        : typeof raw.canvasFormatId === "string"
          ? raw.canvasFormatId
          : "";

  if (!collageStyle.trim() || !canvasFormat.trim()) return null;

  const challengePrompt =
    typeof raw.challengePrompt === "string"
      ? raw.challengePrompt || undefined
      : typeof raw.challengeTag === "string"
        ? raw.challengeTag || undefined
        : undefined;

  return {
    id,
    imageDataUrl,
    moodSentence,
    collageStyle,
    canvasFormat,
    challengePrompt,
    createdAt,
    title: typeof raw.title === "string" ? raw.title || undefined : undefined,
    reflection:
      typeof raw.reflection === "string" ? raw.reflection || undefined : undefined,
  };
}

export function newPortfolioId(): string {
  return `pf_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

export function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => {
      const r = fr.result;
      if (typeof r === "string") resolve(r);
      else reject(new Error("Could not read image."));
    };
    fr.onerror = () => reject(fr.error ?? new Error("Could not read image."));
    fr.readAsDataURL(blob);
  });
}

function parseStoredArray(raw: string | null): PortfolioEntry[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const out: PortfolioEntry[] = [];
    for (const row of parsed) {
      if (!isRecord(row)) continue;
      const n = normalizePortfolioEntry(row);
      if (n) out.push(n);
    }
    return out;
  } catch {
    return [];
  }
}

function migrateLegacyIfNeeded(): void {
  if (typeof window === "undefined") return;
  try {
    if (localStorage.getItem(PORTFOLIO_STORAGE_KEY)) return;
    const legacy = localStorage.getItem(PORTFOLIO_STORAGE_KEY_LEGACY);
    if (!legacy) return;
    localStorage.setItem(PORTFOLIO_STORAGE_KEY, legacy);
    localStorage.removeItem(PORTFOLIO_STORAGE_KEY_LEGACY);
    console.log(
      "[portfolio] migrated items from legacy key to",
      PORTFOLIO_STORAGE_KEY,
    );
  } catch (e) {
    console.warn("[portfolio] legacy migration skipped", e);
  }
}

export function loadPortfolio(): PortfolioEntry[] {
  if (typeof window === "undefined") return [];
  migrateLegacyIfNeeded();
  return parseStoredArray(localStorage.getItem(PORTFOLIO_STORAGE_KEY));
}

function persist(entries: PortfolioEntry[]): void {
  const json = JSON.stringify(entries);
  localStorage.setItem(PORTFOLIO_STORAGE_KEY, json);
  console.log(
    "[portfolio] localStorage updated:",
    PORTFOLIO_STORAGE_KEY,
    "count=",
    entries.length,
  );
  try {
    window.dispatchEvent(new CustomEvent(PORTFOLIO_UPDATED_EVENT));
  } catch {
    /* ignore */
  }
}

export function addPortfolioEntry(entry: PortfolioEntry): void {
  const next = [entry, ...loadPortfolio()].slice(0, MAX_ENTRIES);
  try {
    persist(next);
  } catch (e) {
    console.error("[portfolio] localStorage.setItem failed", e);
    throw e;
  }
}

export function updatePortfolioEntry(
  id: string,
  patch: Partial<Pick<PortfolioEntry, "title" | "reflection">>,
): void {
  const all = loadPortfolio();
  const idx = all.findIndex((e) => e.id === id);
  if (idx < 0) return;
  const cur = all[idx];
  if (!cur) return;
  all[idx] = {
    ...cur,
    title: patch.title !== undefined ? patch.title : cur.title,
    reflection: patch.reflection !== undefined ? patch.reflection : cur.reflection,
  };
  persist(all);
}

export function deletePortfolioEntry(id: string): void {
  persist(loadPortfolio().filter((e) => e.id !== id));
}

export async function downloadPortfolioPngs(entries: PortfolioEntry[]): Promise<void> {
  for (let i = 0; i < entries.length; i++) {
    const e = entries[i];
    if (!e) continue;
    const a = document.createElement("a");
    a.href = e.imageDataUrl;
    const stamp = new Date(e.createdAt).toISOString().slice(0, 10);
    a.download = `portfolio-${stamp}-${String(i + 1).padStart(2, "0")}.png`;
    a.rel = "noopener";
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    await new Promise<void>((r) => setTimeout(r, 380));
  }
}
