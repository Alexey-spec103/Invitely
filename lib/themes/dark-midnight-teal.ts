import type { Theme } from "./types";

// A near-black teal theme -- the catalog's first dark theme built on a
// blue-green rather than warm/gold or pink/purple accent.
export const darkMidnightTeal: Theme = {
  id: "dark-midnight-teal",
  name: "Midnight Teal",
  category: "dark",
  season: "winter",
  tags: ["Dark", "Modern", "Winter", "Dark Background"],
  vars: {
    "--theme-bg": "#0C1A1B",
    "--theme-text": "#E3ECEA",
    "--theme-accent": "#4E9C93",
    "--theme-font-heading": "var(--font-playfair-display), Georgia, serif",
    "--theme-font-body": "var(--font-inter), system-ui, sans-serif",
    "--theme-font-script": "var(--font-parisienne), cursive",
  },
};
