import type { Theme } from "./types";

// A graphite-and-teal modern theme -- the catalog's first teal accent,
// bold enough to read as a genuine color choice rather than a neutral.
export const modernGraphiteTeal: Theme = {
  id: "modern-graphite-teal",
  name: "Graphite & Teal",
  category: "modern",
  season: "summer",
  tags: ["Modern", "Bold", "Summer", "Abstract"],
  vars: {
    "--theme-bg": "#F2F4F4",
    "--theme-text": "#1E2422",
    "--theme-accent": "#2F8C82",
    "--theme-font-heading": "var(--font-space-grotesk), system-ui, sans-serif",
    "--theme-font-body": "var(--font-inter), system-ui, sans-serif",
    "--theme-font-script": "var(--font-parisienne), cursive",
  },
};
