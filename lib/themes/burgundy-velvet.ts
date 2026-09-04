import type { Theme } from "./types";

export const burgundyVelvet: Theme = {
  id: "burgundy-velvet",
  name: "Burgundy Velvet",
  category: "luxury",
  season: "winter",
  tags: ["Luxury", "Dark", "Winter", "Dark Background"],
  vars: {
    "--theme-bg": "#3C0F1A",
    "--theme-text": "#F2E4D8",
    "--theme-accent": "#CBA25B",
    "--theme-font-heading": "var(--font-playfair-display), Georgia, serif",
    "--theme-font-body": "var(--font-inter), system-ui, sans-serif",
    "--theme-font-accent": "var(--font-playfair-display), Georgia, serif",
    "--theme-font-script": "var(--font-alex-brush), cursive",
  },
};
