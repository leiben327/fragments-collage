import { LOCAL_REACTIONS_KEY, LOCAL_VISITOR_ID_KEY } from "./communityFragmentKeys";

export type SoftReactionKind = "felt" | "saved" | "heart" | "bookmark";

type PostReactions = Partial<Record<SoftReactionKind, boolean>>;

function readMap(): Record<string, PostReactions> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(LOCAL_REACTIONS_KEY);
    if (!raw) return {};
    const o = JSON.parse(raw) as unknown;
    return o && typeof o === "object" ? (o as Record<string, PostReactions>) : {};
  } catch {
    return {};
  }
}

function writeMap(m: Record<string, PostReactions>) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCAL_REACTIONS_KEY, JSON.stringify(m));
  } catch {
    /* quota */
  }
}

export function getOrCreateVisitorId(): string {
  if (typeof window === "undefined") return "ssr";
  try {
    let id = localStorage.getItem(LOCAL_VISITOR_ID_KEY);
    if (!id) {
      id =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      localStorage.setItem(LOCAL_VISITOR_ID_KEY, id);
    }
    return id;
  } catch {
    return "unknown";
  }
}

export function getReactionsForPost(postId: string): PostReactions {
  return { ...readMap()[postId] };
}

export function removeReactionsForPost(postId: string): void {
  const map = readMap();
  if (!map[postId]) return;
  delete map[postId];
  writeMap(map);
}

export function toggleSoftReaction(
  postId: string,
  kind: SoftReactionKind,
): PostReactions {
  const map = readMap();
  const prev = { ...(map[postId] ?? {}) };
  prev[kind] = !prev[kind];
  if (!prev[kind]) delete prev[kind];
  map[postId] = Object.keys(prev).length ? prev : {};
  if (!Object.keys(map[postId] ?? {}).length) delete map[postId];
  writeMap(map);
  return { ...map[postId] };
}
