import type { Theme } from "./types";

// A crisper, more nautical coastal theme -- deep navy accent on near-white,
// Space Grotesk headings, for a yacht-club or marina wedding rather than a
// soft beach one.
export const coastalNavySail: Theme = {
  id: "coastal-navy-sail",
  name: "Navy Sail",
  category: "coastal",
  season: "summer",
  tags: ["Coastal", "Modern", "Summer", "Marine"],
  vars: {
    "--theme-bg": "#EEF3F5",
    "--theme-text": "#1B2A38",
    "--theme-accent": "#2E6E8E",
    "--theme-font-heading": "var(--font-space-grotesk), system-ui, sans-serif",
    "--theme-font-body": "var(--font-inter), system-ui, sans-serif",
    "--theme-bg-texture": "url('/patterns/waves.svg')",
    "--theme-font-script": "var(--font-alex-brush), cursive",
  },
};
