"use client";

import { useEffect, useState } from "react";

/** Defaults to `false` (motion enabled) on first render -- matches the
 * server-rendered markup, so there's no hydration mismatch to reconcile.
 * The real value lands a tick later via this effect, which always resolves
 * before any IntersectionObserver-gated reveal has had a chance to fire
 * (that requires an actual scroll-into-view, never synchronous on mount),
 * so callers never render a frame with the wrong preference in practice. */
export function usePrefersReducedMotion(): boolean {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(query.matches);
    const listener = (event: MediaQueryListEvent) => setReduceMotion(event.matches);
    query.addEventListener("change", listener);
    return () => query.removeEventListener("change", listener);
  }, []);

  return reduceMotion;
}
