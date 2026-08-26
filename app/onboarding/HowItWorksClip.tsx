"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Palette, PenLine, Share2 } from "lucide-react";

const STEPS = [
  { icon: Palette, title: "Pick a style", text: "Browse styles until one feels right — swap it any time." },
  { icon: PenLine, title: "Add your details", text: "Names, date, a photo if you want one. That's it." },
  { icon: Share2, title: "Share your site", text: "Get a live link guests can open on their phone." },
];

/** A tiny, always-available "how it works" explainer for non-technical
 * visitors landing on the style gallery for the first time -- three quick
 * steps instead of a recorded screencast (no video hosting/autoplay-policy
 * risk, same reassurance). Collapsible so it doesn't eat space for anyone
 * who already gets it. */
export default function HowItWorksClip() {
  const [open, setOpen] = useState(true);

  return (
    <div className="mt-3 rounded-lg border border-rose-100 bg-rose-50/60 p-3">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between text-left text-xs font-semibold text-rose-700"
      >
        <span>✨ New here? Here&apos;s how it works</span>
        <span className="text-rose-400">{open ? "Hide" : "Show"}</span>
      </button>

      {open && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          transition={{ duration: 0.2 }}
          className="mt-2 grid grid-cols-3 gap-2"
        >
          {STEPS.map(({ icon: Icon, title, text }, i) => (
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
          ))}
        </motion.div>
      )}
    </div>
  );
}
