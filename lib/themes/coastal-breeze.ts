import type { Theme } from "./types";

export const coastalBreeze: Theme = {
  id: "coastal-breeze",
  name: "Coastal Breeze",
  category: "coastal",
  season: "summer",
  tags: ["Coastal", "Minimal", "Summer", "Marine"],
  vars: {
    "--theme-bg": "#EFF6F5",
    "--theme-text": "#1F3B3E",
    "--theme-accent": "#3B7A8C",
    "--theme-font-heading": "var(--font-inter), system-ui, sans-serif",
    "--theme-font-body": "var(--font-inter), system-ui, sans-serif",
    "--theme-font-script": "var(--font-parisienne), cursive",
  },
};
