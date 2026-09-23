import type { Theme } from "./types";

export const provenceStoneLavender: Theme = {
  id: "provence-stone-lavender",
  name: "Stone & Lavender Provence",
  category: "provence",
  tags: ["Provence", "Elegant", "Neutral"],
  vars: {
    "--theme-bg": "#DAD0C0",
    "--theme-text": "#38332A",
    // Contrast audit (automated, same technique as romantic-blush's earlier
    // manual fix): measured 2.66:1 against this theme's own #DAD0C0 bg --
    // below the 3:1 floor even for large/decorative text. Deepened within the
    // same hue and saturation (not re-picked), now passes 3.11:1.
    "--theme-accent": "#806A98",
    "--theme-font-heading": "var(--font-libre-baskerville), Georgia, serif",
    "--theme-font-body": "var(--font-eb-garamond), Georgia, serif",
    "--theme-font-script": "var(--font-caveat), cursive",
  },
};
