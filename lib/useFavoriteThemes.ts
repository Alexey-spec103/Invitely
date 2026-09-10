"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "invitely:favoriteThemes";

/** dashboard-audit.md B6/B9: a minimal, functional stand-in for B9's full
 * "heart on the card" treatment -- per-browser (localStorage, not per-event
 * or per-account; there's no server-side favorites table), just enough for
 * B6's "Любимые N" entry to be a real filter instead of a permanent "(0)".
 * B9 can layer the nicer hover-heart card UI on top of this same hook later
 * without changing where favorites are stored. */
export function useFavoriteThemes() {
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Deferred, not called directly in the effect body -- same convention as
    // FirstVisitTour's own localStorage read, avoids a synchronous
    // cascading render on mount.
    const timeout = setTimeout(() => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) setFavoriteIds(new Set(JSON.parse(raw) as string[]));
      } catch {
        // Private browsing / storage disabled -- start empty, non-fatal.
      }
    }, 0);
    return () => clearTimeout(timeout);
  }, []);

  const toggleFavorite = useCallback((themeId: string) => {
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      if (next.has(themeId)) {
        next.delete(themeId);
      } else {
        next.add(themeId);
      }
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(next)));
      } catch {
        // Non-fatal -- worst case the toggle doesn't persist across reloads.
      }
      return next;
    });
  }, []);

  return { favoriteIds, toggleFavorite };
}
