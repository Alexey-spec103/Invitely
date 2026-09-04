import type { Theme } from "./types";

// First theme to pair Space Grotesk (geometric sans) with a dusty rose
// accent -- gives "modern" its own soft-but-structured register, distinct
// from Modern Mono's true monochrome and Nordic Minimal's cooler grey.
export const modernCharcoalBlush: Theme = {
  id: "modern-charcoal-blush",
  name: "Charcoal & Blush",
  category: "modern",
  season: "spring",
  tags: ["Modern", "Minimal", "Spring", "Abstract"],
  vars: {
    "--theme-bg": "#F7F5F3",
    "--theme-text": "#1F1F1F",
    "--theme-accent": "#D98A8A",
    "--theme-font-heading": "var(--font-space-grotesk), system-ui, sans-serif",
    "--theme-font-body": "var(--font-inter), system-ui, sans-serif",
    "--theme-font-accent": "var(--font-space-grotesk), system-ui, sans-serif",
    "--theme-font-script": "var(--font-parisienne), cursive",
  },
};
