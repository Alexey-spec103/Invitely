import type { Theme } from "./types";

// A summer olive-grove rustic theme -- pairs Fraunces with a muted olive
// accent, distinct from Forest Cabin's darker autumn moss.
export const rusticOliveGrove: Theme = {
  id: "rustic-olive-grove",
  name: "Olive Grove",
  category: "rustic",
  season: "summer",
  tags: ["Rustic", "Botanical", "Summer", "Landscape"],
  vars: {
    "--theme-bg": "#EDE9D8",
    "--theme-text": "#3B3A28",
    "--theme-accent": "#6E7A45",
    "--theme-font-heading": "var(--font-fraunces), Georgia, serif",
    "--theme-font-body": "var(--font-inter), system-ui, sans-serif",
    "--theme-font-script": "var(--font-caveat), cursive",
  },
};
