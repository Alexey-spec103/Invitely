import type { Theme } from "./types";

// A cool storm-grey dark theme with a silver accent -- Space Grotesk
// headings for a sharper, more industrial-modern dark register.
export const darkStormSilver: Theme = {
  id: "dark-storm-silver",
  name: "Storm Silver",
  category: "dark",
  season: "winter",
  tags: ["Dark", "Modern", "Winter", "Dark Background", "Marble"],
  vars: {
    "--theme-bg": "#14171C",
    "--theme-text": "#E6E9EC",
    "--theme-accent": "#9AA6B2",
    "--theme-font-heading": "var(--font-space-grotesk), system-ui, sans-serif",
    "--theme-font-body": "var(--font-inter), system-ui, sans-serif",
    "--theme-bg-texture": "url('/patterns/grain-dark.svg')",
    "--theme-font-script": "var(--font-parisienne), cursive",
  },
};
