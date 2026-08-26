"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, Loader2 } from "lucide-react";
import type { AutosaveState } from "@/lib/useAutosave";

interface AutosaveStatusProps {
  state: AutosaveState;
  error?: string | null;
}

/** Small status pill that replaces a manual "Save" button -- shows what
 * autosave is doing without demanding a click. Idle renders nothing so a
 * freshly-loaded form doesn't show a stale "Saved". */
export default function AutosaveStatus({ state, error }: AutosaveStatusProps) {
  return (
    <div className="flex h-5 items-center text-xs">
      <AnimatePresence mode="wait">
        {state === "saving" && (
          <motion.span
            key="saving"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-1.5 text-gray-400"
          >
            <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
            Saving...
          </motion.span>
        )}
        {state === "saved" && (
          <motion.span
            key="saved"
            initial={{ opacity: 0, y: -2 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-1.5 text-emerald-600"
          >
            <Check className="h-3 w-3" aria-hidden="true" />
            Saved
          </motion.span>
        )}
        {state === "error" && (
          <motion.span
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-red-600"
          >
            {error ?? "Couldn't save"}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}
