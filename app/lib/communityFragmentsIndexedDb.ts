/**
 * Local “community fragments” archive (IndexedDB for collage PNGs).
 * Soft reactions on the wall use localStorage (see `communityFragmentReactions.ts`).
 * No cloud database in this MVP — everything stays on the device.
 */

import { COMMUNITY_FRAGMENTS_UPDATED_EVENT } from "./communityFragmentKeys";

const DB_NAME = "soft-pages-community";
const DB_VERSION = 1;
const STORE = "fragments";

export type CommunityFragmentMeta = {
  moodSentence: string;
  styleId: string;
  styleLabel: string;
  canvasFormatId: string;
  canvasFormatLabel: string;
  title?: string;
  reflection?: string;
  /** Random Fragment Challenge line, if any, frozen at share time */
  challengeTag?: string | null;
  anonymous: boolean;
  /** Shown on the wall when not anonymous */
  authorLabel: string;
};

export type CommunityFragmentRow = {
  id: string;
  createdAt: number;
  meta: CommunityFragmentMeta;
  imageBlob: Blob;
};

function broadcastUpdated() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(COMMUNITY_FRAGMENTS_UPDATED_EVENT));
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onerror = () => reject(req.error ?? new Error("IndexedDB open failed"));
    req.onsuccess = () => resolve(req.result);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: "id" });
      }
    };
  });
}

export async function saveCommunityFragment(row: CommunityFragmentRow): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error("IndexedDB write failed"));
    tx.objectStore(STORE).put(row);
  });
  db.close();
  broadcastUpdated();
}

export async function deleteCommunityFragment(id: string): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error("IndexedDB delete failed"));
    tx.objectStore(STORE).delete(id);
  });
  db.close();
  broadcastUpdated();
}

export async function listCommunityFragments(): Promise<CommunityFragmentRow[]> {
  try {
    const db = await openDb();
    const rows = await new Promise<CommunityFragmentRow[]>((resolve, reject) => {
      const tx = db.transaction(STORE, "readonly");
      const req = tx.objectStore(STORE).getAll();
      req.onsuccess = () => resolve((req.result as CommunityFragmentRow[]) ?? []);
      req.onerror = () => reject(req.error ?? new Error("IndexedDB read failed"));
    });
    db.close();
    rows.sort((a, b) => b.createdAt - a.createdAt);
    return rows;
  } catch {
    return [];
  }
}

export function newFragmentId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}
