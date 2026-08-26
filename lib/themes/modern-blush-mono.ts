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
    "--theme-accent": "#E3A6A6",
    "--theme-font-heading": "var(--font-space-grotesk), system-ui, sans-serif",
    "--theme-font-body": "var(--font-inter), system-ui, sans-serif",
    "--theme-bg-texture": "url('/patterns/dot-grid.svg')",
    "--theme-font-script": "var(--font-alex-brush), cursive",
  },
};
