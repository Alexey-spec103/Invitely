import type { Theme } from "./types";

// A brighter spring-green botanical theme, warmer than Botanical Sage's
// grey-green base -- pairs Cormorant Garamond with a Playfair accent.
export const botanicalFern: Theme = {
  id: "botanical-fern",
  name: "Fern",
  category: "botanical",
  season: "spring",
  tags: ["Botanical", "Spring", "Greenery"],
  vars: {
    "--theme-bg": "#EEF1E9",
    "--theme-text": "#33402F",
    "--theme-accent": "#6C8354",
    "--theme-font-heading": "var(--font-cormorant-garamond), Georgia, serif",
    "--theme-font-body": "var(--font-cormorant-garamond), Georgia, serif",
    "--theme-font-accent": "var(--font-playfair-display), Georgia, serif",
    "--theme-font-script": "var(--font-alex-brush), cursive",
  },
};
