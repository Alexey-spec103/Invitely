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
    // Contrast audit (automated, same technique as romantic-blush's earlier
    // manual fix): measured 2.98:1 against this theme's own #F1ECF2 bg --
    // below the 3:1 floor even for large/decorative text. Deepened within the
    // same hue and saturation (not re-picked), now passes 3.08:1.
    "--theme-accent": "#997CAE",
    "--theme-font-heading": "var(--font-gilda-display), var(--font-cormorant-garamond), Georgia, serif",
    "--theme-font-body": "var(--font-inter), system-ui, sans-serif",
    "--theme-font-script": "var(--font-caveat), cursive",
  },
};
