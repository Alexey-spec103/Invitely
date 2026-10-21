"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, Loader2 } from "lucide-react";
import type { AutosaveState } from "@/lib/useAutosave";
import { usePrefersReducedMotion } from "@/components/usePrefersReducedMotion";

interface AutosaveStatusProps {
  state: AutosaveState;
  error?: string | null;
}

/** Small status pill that replaces a manual "Save" button -- shows what
 * autosave is doing without demanding a click. Idle renders nothing so a
 * freshly-loaded form doesn't show a stale "Saved". */
export default function AutosaveStatus({ state, error }: AutosaveStatusProps) {
  const reduceMotion = usePrefersReducedMotion();
  // motion-audit 2026-10-21: this pill can flip states on nearly every
  // keystroke in an active editing session -- Emil's high-frequency rule
  // applies even though the rest of this product leans Jakub/Jhey. Left
  // unset, framer-motion's default transition runs ~300ms+; explicit and
  // fast (150ms, plain ease -- a spring would just add settle time a
  // status pill this small doesn't need) keeps it feeling like live status,
  // not a flourish competing for attention while someone is mid-edit.
  const transition = { duration: reduceMotion ? 0 : 0.15, ease: "easeOut" as const };
  return (
    <div className="flex h-5 items-center text-xs">
      <AnimatePresence mode="wait">
        {state === "saving" && (
          <motion.span
            key="saving"
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0 }}
            transition={transition}
            className="flex items-center gap-1.5 text-gray-400"
          >
            <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
            Saving...
          </motion.span>
        )}
        {state === "saved" && (
          <motion.span
            key="saved"
            initial={reduceMotion ? false : { opacity: 0, y: -2 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0 }}
            transition={transition}
            className="flex items-center gap-1.5 text-emerald-600"
          >
            <Check className="h-3 w-3" aria-hidden="true" />
            Saved
          </motion.span>
        )}
        {state === "error" && (
          <motion.span
            key="error"
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0 }}
            transition={transition}
            className="text-red-600"
          >
            {error ?? "Couldn't save"}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}
