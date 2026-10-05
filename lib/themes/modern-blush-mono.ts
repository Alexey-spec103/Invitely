import type { Theme } from "./types";

// Space Grotesk's geometric edge softened with a blush accent instead of
// Charcoal & Blush's darker text -- a lighter, airier modern-romantic hybrid.
export const modernBlushMono: Theme = {
  id: "modern-blush-mono",
  name: "Modern Blush",
  category: "modern",
  season: "spring",
  tags: ["Modern", "Romantic", "Spring", "Abstract"],
  vars: {
    "--theme-bg": "#FDF6F5",
    "--theme-text": "#2B2223",
    // Contrast audit (automated, same technique as romantic-blush's earlier
    // manual fix): measured 1.92:1 against this theme's own #FDF6F5 bg --
    // below the 3:1 floor even for large/decorative text. Deepened within the
    // same hue and saturation (not re-picked), now passes 3.02:1.
    "--theme-accent": "#D37474",
    "--theme-font-heading": "var(--font-space-grotesk), var(--font-inter), system-ui, sans-serif",
    "--theme-font-body": "var(--font-inter), system-ui, sans-serif",
    "--theme-font-script": "var(--font-alex-brush), var(--font-caveat), cursive",
  },
};
