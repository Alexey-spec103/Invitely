"use client";

import { useEffect, useRef, useState } from "react";

export type AutosaveState = "idle" | "saving" | "saved" | "error";

interface UseAutosaveOptions {
  /** Ms of quiet after the last change before saving. Debounced rather than
   * literal onBlur, so tabbing through untouched fields never triggers a
   * write and fast typing doesn't fire a save per keystroke. */
  delay?: number;
  /** Skip saving while false -- e.g. while the watched values fail zod
   * validation, so a half-typed required field never overwrites good data. */
  enabled?: boolean;
}

/** Replaces a manual per-form Save button with autosave: watches `values`,
 * and `delay` ms after they settle, calls `save(values)`. The first render
 * (the form's initial defaultValues) is never saved -- only real edits are. */
export function useAutosave<T>(values: T, save: (values: T) => Promise<void>, options?: UseAutosaveOptions) {
  const delay = options?.delay ?? 900;
  const enabled = options?.enabled ?? true;
  const [state, setState] = useState<AutosaveState>("idle");
  const [error, setError] = useState<string | null>(null);
  const isFirstRun = useRef(true);
  const savedSnapshot = useRef<string>(JSON.stringify(values));
  const saveRef = useRef(save);
  // The most recently *requested* save, kept in sync every render (not just
  // when a new save is actually scheduled below) -- lets an in-flight save
  // tell, once its request finally resolves, whether a newer edit has since
  // superseded it.
  const latestSnapshot = useRef<string>(JSON.stringify(values));

  const snapshot = JSON.stringify(values);
  latestSnapshot.current = snapshot;

  useEffect(() => {
    saveRef.current = save;
  }, [save]);

  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }
    if (!enabled || snapshot === savedSnapshot.current) return;

    setState("saving");
    const timeout = setTimeout(async () => {
      const requestedSnapshot = snapshot;
      try {
        await saveRef.current(values);
        // On a slow connection, an older save can resolve *after* a newer
        // one -- confirmed reachable: type, wait past the debounce so a save
        // starts, type again before it resolves, and let the two requests
        // land out of order. Without this check the stale response would
        // flip the status back to "saved" and record the old value as the
        // last-known-saved one, even though a newer save (resolved or still
        // in flight) already superseded it.
        if (requestedSnapshot === latestSnapshot.current) {
          savedSnapshot.current = requestedSnapshot;
          setState("saved");
          setError(null);
        }
      } catch (err) {
        if (requestedSnapshot === latestSnapshot.current) {
          setState("error");
          setError(err instanceof Error ? err.message : "Couldn't save");
        }
      }
    }, delay);

    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [snapshot, enabled, delay]);

  return { state, error };
}
