import {
  PORTFOLIO_STORAGE_KEY,
  PORTFOLIO_UPDATED_EVENT,
} from "@/app/lib/portfolioKeys";

export type PortfolioEntry = {
  id: string;
  createdAt: number;
  /** PNG data URL from the same export pipeline as Download PNG */
  imageDataUrl: string;
  moodSentence: string;
  styleId: string;
  styleLabel: string;
  canvasFormatId: string;
  canvasFormatLabel: string;
  challengeTag?: string;
  title?: string;
  reflection?: string;
};

const MAX_ENTRIES = 40;

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function isValidEntry(v: unknown): v is PortfolioEntry {
  if (!isRecord(v)) return false;
  if (typeof v.id !== "string" || !v.id) return false;
  if (typeof v.createdAt !== "number") return false;
  if (typeof v.imageDataUrl !== "string" || !v.imageDataUrl.startsWith("data:"))
    return false;
  if (typeof v.moodSentence !== "string") return false;
  if (typeof v.styleId !== "string") return false;
  if (typeof v.styleLabel !== "string") return false;
  if (typeof v.canvasFormatId !== "string") return false;
  if (typeof v.canvasFormatLabel !== "string") return false;
  return true;
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

export function loadPortfolio(): PortfolioEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(PORTFOLIO_STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isValidEntry);
  } catch {
    return [];
  }
}

function persist(entries: PortfolioEntry[]) {
  localStorage.setItem(PORTFOLIO_STORAGE_KEY, JSON.stringify(entries));
  try {
    window.dispatchEvent(new CustomEvent(PORTFOLIO_UPDATED_EVENT));
  } catch {
    /* ignore */
  }
}

export function addPortfolioEntry(entry: PortfolioEntry): void {
  const next = [entry, ...loadPortfolio()].slice(0, MAX_ENTRIES);
  persist(next);
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
