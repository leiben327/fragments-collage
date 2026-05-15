/** Session flag: last drawn Random Fragment Challenge text (for share modal tag). */
export const SESSION_ACTIVE_FRAGMENT_CHALLENGE_KEY = "soft-pages:active-fragment-challenge";

/** Fired on window after a new fragment is saved locally. */
export const COMMUNITY_FRAGMENTS_UPDATED_EVENT = "soft-pages:community-fragments-updated";

/** Stable id for this browser — soft reactions are keyed per visitor. */
export const LOCAL_VISITOR_ID_KEY = "soft-pages:visitor-id";

/** localStorage JSON map: postId → { felt?, saved?, heart?, bookmark? } */
export const LOCAL_REACTIONS_KEY = "soft-pages:fragment-reactions";
