import type { Theme } from "./types";

// A mossy, cabin-in-the-woods rustic palette -- pairs the leaf texture
// (usually reserved for Romantic/Botanical) with Libre Baskerville and a
// darker olive-on-parchment mix for an autumn woodland register.
export const rusticForestCabin: Theme = {
  id: "rustic-forest-cabin",
  name: "Forest Cabin",
  category: "rustic",
  season: "autumn",
  tags: ["Rustic", "Botanical", "Autumn", "Landscape"],
  vars: {
    "--theme-bg": "#E8E2D5",
    "--theme-text": "#33362B",
    "--theme-accent": "#5B6B4A",
    "--theme-font-heading": "var(--font-libre-baskerville), Georgia, serif",
    "--theme-font-body": "var(--font-inter), system-ui, sans-serif",
    "--theme-bg-texture": "url('/patterns/leaves.svg')",
    "--theme-font-script": "var(--font-caveat), cursive",
  },
};
