"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Palette, PenLine, Share2 } from "lucide-react";
import { getDictionary } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/locales";

// Icons only -- title/text come from dict.onboarding.howItWorks.steps
// (same order: Pick a style, Add your details, Share your site), zipped by
// index below.
const STEP_ICONS = [Palette, PenLine, Share2];

/** A tiny, always-available "how it works" explainer for non-technical
 * visitors landing on the style gallery for the first time -- three quick
 * steps instead of a recorded screencast (no video hosting/autoplay-policy
 * risk, same reassurance). Collapsible so it doesn't eat space for anyone
 * who already gets it. */
export default function HowItWorksClip({ locale }: { locale: Locale }) {
  const [open, setOpen] = useState(true);
  const t = getDictionary(locale).onboarding.howItWorks;

  return (
    <div className="mt-3 rounded-lg border border-rose-100 bg-rose-50/60 p-3">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between text-left text-xs font-semibold text-rose-700"
      >
        <span>{t.toggleLabel}</span>
        <span className="text-rose-400">{open ? t.hide : t.show}</span>
      </button>

      {open && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          transition={{ duration: 0.2 }}
          className="mt-2 grid grid-cols-3 gap-2"
        >
          {t.steps.map(({ title, text }, i) => {
            const Icon = STEP_ICONS[i];
            return (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="rounded-md bg-white p-2 text-center shadow-sm"
            >
              <Icon className="mx-auto h-4 w-4 text-rose-500" aria-hidden="true" />
              <p className="mt-1 text-[11px] font-semibold text-gray-900">{title}</p>
              <p className="mt-0.5 text-[10px] leading-tight text-gray-500">{text}</p>
            </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}
