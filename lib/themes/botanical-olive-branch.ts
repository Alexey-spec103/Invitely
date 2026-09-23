import type { Theme } from "./types";

// A summer olive-branch botanical theme -- straddles botanical and rustic,
// filed as botanical since the leaf motif and Cormorant heading lead.
export const botanicalOliveBranch: Theme = {
  id: "botanical-olive-branch",
  name: "Olive Branch",
  category: "botanical",
  season: "summer",
  tags: ["Botanical", "Rustic", "Summer", "Greenery"],
  vars: {
    "--theme-bg": "#EEEEE1",
    "--theme-text": "#363A2A",
    // Contrast audit (automated, same technique as romantic-blush's earlier
    // manual fix): measured 2.79:1 against this theme's own #EEEEE1 bg --
    // below the 3:1 floor even for large/decorative text. Deepened within the
    // same hue and saturation (not re-picked), now passes 3.00:1.
    "--theme-accent": "#818E63",
    "--theme-font-heading": "var(--font-cormorant-garamond), Georgia, serif",
    "--theme-font-body": "var(--font-inter), system-ui, sans-serif",
    "--theme-font-script": "var(--font-alex-brush), cursive",
  },
};
