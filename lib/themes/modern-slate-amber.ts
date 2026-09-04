import type { Theme } from "./types";

// A cool slate base with a warm amber accent -- deliberately year-round
// (no season) for a couple who wants "modern" without a seasonal read at all.
export const modernSlateAmber: Theme = {
  id: "modern-slate-amber",
  name: "Slate & Amber",
  category: "modern",
  tags: ["Modern", "Bold", "Abstract"],
  vars: {
    "--theme-bg": "#F5F4F2",
    "--theme-text": "#22252A",
    "--theme-accent": "#C77B3B",
    "--theme-font-heading": "var(--font-space-grotesk), system-ui, sans-serif",
    "--theme-font-body": "var(--font-space-grotesk), system-ui, sans-serif",
    "--theme-font-script": "var(--font-alex-brush), cursive",
  },
};
