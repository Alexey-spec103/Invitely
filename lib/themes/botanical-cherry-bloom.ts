import type { Theme } from "./types";

// A dusty pink cherry-blossom botanical theme -- Fraunces headings for a
// slightly more editorial feel than Botanical Sage or Fern.
export const botanicalCherryBloom: Theme = {
  id: "botanical-cherry-bloom",
  name: "Cherry Bloom",
  category: "botanical",
  season: "spring",
  tags: ["Botanical", "Romantic", "Spring", "White Flowers"],
  vars: {
    "--theme-bg": "#F5EEE9",
    "--theme-text": "#423029",
    "--theme-accent": "#C48B78",
    "--theme-font-heading": "var(--font-fraunces), Georgia, serif",
    "--theme-font-body": "var(--font-inter), system-ui, sans-serif",
    "--theme-font-script": "var(--font-alex-brush), cursive",
  },
};
