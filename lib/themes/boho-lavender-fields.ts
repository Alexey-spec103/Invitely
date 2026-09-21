import type { Theme } from "./types";

// A cooler, purple-toned boho palette -- lavender-field register, distinct
// from the warm terracotta/clay boho themes elsewhere in the catalog.
export const bohoLavenderFields: Theme = {
  id: "boho-lavender-fields",
  name: "Lavender Fields",
  category: "boho",
  season: "summer",
  tags: ["Boho", "Romantic", "Summer", "Provence"],
  vars: {
    "--theme-bg": "#F1ECF2",
    "--theme-text": "#3E3548",
    "--theme-accent": "#9B7FB0",
    "--theme-font-heading": "var(--font-gilda-display), Georgia, serif",
    "--theme-font-body": "var(--font-inter), system-ui, sans-serif",
    "--theme-font-script": "var(--font-caveat), cursive",
  },
};
