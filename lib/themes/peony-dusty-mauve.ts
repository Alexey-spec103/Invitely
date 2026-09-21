import type { Theme } from "./types";

export const peonyDustyMauve: Theme = {
  id: "peony-dusty-mauve",
  name: "Dusty Mauve Peony",
  category: "peony",
  season: "winter",
  tags: ["Peony", "Romantic", "Winter"],
  vars: {
    "--theme-bg": "#D9C2C5",
    "--theme-text": "#3A2429",
    "--theme-accent": "#7A3B39",
    "--theme-font-heading": "var(--font-gilda-display), Georgia, serif",
    "--theme-font-body": "var(--font-eb-garamond), Georgia, serif",
    "--theme-font-script": "var(--font-sacramento), cursive",
  },
};
