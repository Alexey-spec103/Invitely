import type { Theme } from "./types";

// A warm ivory-and-tan romantic theme with EB Garamond headings -- softer
// and more neutral than Champagne Rose, aimed at a classic lace-and-linen
// invitation look.
export const romanticIvoryLace: Theme = {
  id: "romantic-ivory-lace",
  name: "Ivory Lace",
  category: "romantic",
  season: "spring",
  tags: ["Romantic", "Vintage", "Spring", "Lace"],
  vars: {
    "--theme-bg": "#FCF7F1",
    "--theme-text": "#4B3E37",
    // Contrast audit (automated, same technique as romantic-blush's earlier
    // manual fix): measured 2.07:1 against this theme's own #FCF7F1 bg --
    // below the 3:1 floor even for large/decorative text. Deepened within the
    // same hue and saturation (not re-picked), now passes 3.08:1.
    "--theme-accent": "#B2855B",
    "--theme-font-heading": "var(--font-marcellus), var(--font-cormorant-garamond), Georgia, serif",
    "--theme-font-body": "var(--font-inter), system-ui, sans-serif",
    "--theme-font-script": "var(--font-sacramento), var(--font-caveat), cursive",
  },
};
