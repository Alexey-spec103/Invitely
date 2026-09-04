import type { Theme } from "./types";

// A near-black theme with a true crimson accent -- bolder and more
// saturated than Burgundy Velvet's wine-dark background, using Cinzel for
// a sharper, more graphic register.
export const darkCrimsonNoir: Theme = {
  id: "dark-crimson-noir",
  name: "Crimson Noir",
  category: "dark",
  season: "winter",
  tags: ["Dark", "Luxury", "Winter", "Dark Background"],
  vars: {
    "--theme-bg": "#170D0F",
    "--theme-text": "#EFE3E1",
    "--theme-accent": "#B23A3A",
    "--theme-font-heading": "var(--font-cinzel), Georgia, serif",
    "--theme-font-body": "var(--font-inter), system-ui, sans-serif",
    "--theme-font-script": "var(--font-parisienne), cursive",
  },
};
