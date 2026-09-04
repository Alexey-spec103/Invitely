import type { Theme } from "./types";

// A yellow-green "garden party" romantic theme -- unusual accent hue for
// the romantic category, most of which lean pink/gold/red.
export const romanticGardenParty: Theme = {
  id: "romantic-garden-party",
  name: "Garden Party",
  category: "romantic",
  season: "summer",
  tags: ["Romantic", "Botanical", "Summer", "Garden"],
  vars: {
    "--theme-bg": "#F4EFE3",
    "--theme-text": "#3A3B27",
    "--theme-accent": "#A8B074",
    "--theme-font-heading": "var(--font-fraunces), Georgia, serif",
    "--theme-font-body": "var(--font-inter), system-ui, sans-serif",
    "--theme-font-script": "var(--font-alex-brush), cursive",
  },
};
