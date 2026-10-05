import type { Theme } from "./types";

// A muted, brownish-pink "antique" rose -- warmer and dustier than Vintage
// Rosewood's mauve, for an autumn romantic register.
export const romanticAntiqueRose: Theme = {
  id: "romantic-antique-rose",
  name: "Antique Rose",
  category: "romantic",
  season: "autumn",
  tags: ["Romantic", "Vintage", "Autumn", "Antique"],
  vars: {
    "--theme-bg": "#F7EDE9",
    "--theme-text": "#45322E",
    // Contrast audit (automated, same technique as romantic-blush's earlier
    // manual fix): measured 2.96:1 against this theme's own #F7EDE9 bg --
    // below the 3:1 floor even for large/decorative text. Deepened within the
    // same hue and saturation (not re-picked), now passes 3.06:1.
    "--theme-accent": "#B7796B",
    "--theme-font-heading": "var(--font-gilda-display), var(--font-cormorant-garamond), Georgia, serif",
    "--theme-font-body": "var(--font-inter), system-ui, sans-serif",
    "--theme-font-script": "var(--font-sacramento), var(--font-caveat), cursive",
  },
};
