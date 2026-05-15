"use client";

import { useEffect } from "react";

/**
 * Minimal service worker so Chrome/Android can treat the site as installable alongside the web manifest.
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
    if (process.env.NODE_ENV !== "production") return;

    void navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {
      /* non-fatal */
    });
  }, []);

  return null;
}
