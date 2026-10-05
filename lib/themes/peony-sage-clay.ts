import type { Theme } from "./types";

export const peonySageClay: Theme = {
  id: "peony-sage-clay",
  name: "Sage & Clay Peony",
  category: "peony",
  season: "summer",
  tags: ["Peony", "Romantic", "Summer"],
  vars: {
    "--theme-bg": "#D8DCC8",
    "--theme-text": "#333829",
    // Contrast audit (automated, same technique as romantic-blush's earlier
    // manual fix): measured 2.97:1 against this theme's own #D8DCC8 bg --
    // below the 3:1 floor even for large/decorative text. Deepened within the
    // same hue and saturation (not re-picked), now passes 3.08:1.
    "--theme-accent": "#AE6845",
    "--theme-font-heading": "var(--font-marcellus), var(--font-cormorant-garamond), Georgia, serif",
    "--theme-font-body": "var(--font-eb-garamond), Georgia, serif",
    "--theme-font-script": "var(--font-alex-brush), var(--font-caveat), cursive",
  },
};
