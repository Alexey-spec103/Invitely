import type { Theme } from "./types";

// A spring cherry-blossom pink -- softer and cooler-toned than Peony's
// saturated pink, with EB Garamond for a gentler classical register.
export const romanticCherryBlossom: Theme = {
  id: "romantic-cherry-blossom",
  name: "Cherry Blossom",
  category: "romantic",
  season: "spring",
  tags: ["Romantic", "Botanical", "Spring", "White Flowers"],
  vars: {
    "--theme-bg": "#FCF0F1",
    "--theme-text": "#4A2E33",
    "--theme-accent": "#E0A8B5",
    "--theme-font-heading": "var(--font-eb-garamond), Georgia, serif",
    "--theme-font-body": "var(--font-inter), system-ui, sans-serif",
    "--theme-font-script": "var(--font-alex-brush), cursive",
  },
};
