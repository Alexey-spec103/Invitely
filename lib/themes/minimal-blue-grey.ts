import type { Theme } from "./types";

// A cool blue-grey minimal winter theme -- Space Grotesk headings, distinct
// from Dusty Blue Winter's warmer serif-headed take on a similar palette.
export const minimalBlueGrey: Theme = {
  id: "minimal-blue-grey",
  name: "Blue Grey",
  category: "minimal",
  season: "winter",
  tags: ["Minimal", "Modern", "Winter", "Marble"],
  vars: {
    "--theme-bg": "#F3F5F6",
    "--theme-text": "#23282B",
    "--theme-accent": "#6E8A99",
    "--theme-font-heading": "var(--font-space-grotesk), system-ui, sans-serif",
    "--theme-font-body": "var(--font-inter), system-ui, sans-serif",
    "--theme-font-script": "var(--font-parisienne), cursive",
  },
};
