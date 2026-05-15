/** localStorage JSON array — portfolio collage items (image data URLs + meta). */
export const PORTFOLIO_STORAGE_KEY = "fragments_portfolio_items";

/** Previous key — migrated once on read when the new key is empty. */
export const PORTFOLIO_STORAGE_KEY_LEGACY = "soft-pages:my-portfolio";

/** Fired on window after portfolio is saved, edited, or cleared. */
export const PORTFOLIO_UPDATED_EVENT = "soft-pages:portfolio-updated";
