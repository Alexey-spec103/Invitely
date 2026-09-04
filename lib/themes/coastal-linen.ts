import type { Theme } from "./types";

// A softer, more elegant coastal register than Coastal Breeze's sans-serif
// take -- EB Garamond headings, for a seaside wedding that wants romance
// more than minimalism.
export const coastalLinen: Theme = {
  id: "coastal-linen",
  name: "Coastal Linen",
  category: "coastal",
  season: "summer",
  tags: ["Coastal", "Minimal", "Summer", "Marine"],
  vars: {
    "--theme-bg": "#F5F2EA",
    "--theme-text": "#2B3A3A",
    "--theme-accent": "#7B9E9E",
    "--theme-font-heading": "var(--font-eb-garamond), Georgia, serif",
    "--theme-font-body": "var(--font-inter), system-ui, sans-serif",
    "--theme-font-script": "var(--font-parisienne), cursive",
  },
};
