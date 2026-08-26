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

  const snapshot = JSON.stringify(values);

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
      try {
        await saveRef.current(values);
        savedSnapshot.current = snapshot;
        setState("saved");
        setError(null);
      } catch (err) {
        setState("error");
        setError(err instanceof Error ? err.message : "Couldn't save");
      }
    }, delay);

    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [snapshot, enabled, delay]);

  return { state, error };
}
