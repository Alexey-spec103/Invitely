import type { Theme } from "./types";

// A soft dusty-rose boho theme -- the macrame/dried-flower end of boho
// rather than the desert/terracotta end, for a spring garden-boho wedding.
export const bohoDustyRoseMacrame: Theme = {
  id: "boho-dusty-rose-macrame",
  name: "Dusty Rose Macrame",
  category: "boho",
  season: "spring",
  tags: ["Boho", "Romantic", "Spring", "Macrame", "Lace"],
  vars: {
    "--theme-bg": "#F3E7E3",
    "--theme-text": "#4A342E",
    // Contrast audit (automated, same technique as romantic-blush's earlier
    // manual fix): measured 2.33:1 against this theme's own #F3E7E3 bg --
    // below the 3:1 floor even for large/decorative text. Deepened within the
    // same hue and saturation (not re-picked), now passes 3.08:1.
    "--theme-accent": "#B27567",
    "--theme-font-heading": "var(--font-fraunces), var(--font-cormorant-garamond), Georgia, serif",
    "--theme-font-body": "var(--font-inter), system-ui, sans-serif",
    "--theme-font-script": "var(--font-caveat), cursive",
  },
};
