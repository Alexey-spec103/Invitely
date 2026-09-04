import type { Theme } from "./types";

// A crisp harbor-blue coastal theme -- Space Grotesk headings, more
// graphic/modern than Navy Sail's classic nautical take.
export const coastalHarborBlue: Theme = {
  id: "coastal-harbor-blue",
  name: "Harbor Blue",
  category: "coastal",
  season: "summer",
  tags: ["Coastal", "Modern", "Summer", "Marine"],
  vars: {
    "--theme-bg": "#E8F0F3",
    "--theme-text": "#1E3341",
    "--theme-accent": "#4B87A6",
    "--theme-font-heading": "var(--font-space-grotesk), system-ui, sans-serif",
    "--theme-font-body": "var(--font-inter), system-ui, sans-serif",
    "--theme-font-script": "var(--font-alex-brush), cursive",
  },
};
