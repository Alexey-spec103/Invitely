import type { Theme } from "./types";

// A near-black, true-green forest theme -- darker and cooler than Emerald
// Grove's lighter forest green, for a moodier winter-evening register.
export const darkForestNoir: Theme = {
  id: "dark-forest-noir",
  name: "Forest Noir",
  category: "dark",
  season: "winter",
  tags: ["Dark", "Botanical", "Winter", "Dark Background", "Landscape"],
  vars: {
    "--theme-bg": "#10160F",
    "--theme-text": "#E6E9E1",
    "--theme-accent": "#7FA07A",
    "--theme-font-heading": "var(--font-fraunces), Georgia, serif",
    "--theme-font-body": "var(--font-inter), system-ui, sans-serif",
    "--theme-font-script": "var(--font-alex-brush), cursive",
  },
};
