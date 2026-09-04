import type { Theme } from "./types";

export const nordicMinimal: Theme = {
  id: "nordic-minimal",
  name: "Nordic Minimal",
  category: "minimal",
  season: "winter",
  tags: ["Minimal", "Modern", "Winter", "Marble", "Minimalism"],
  vars: {
    "--theme-bg": "#FAFAF8",
    "--theme-text": "#1A1A1A",
    "--theme-accent": "#8B8378",
    "--theme-font-heading": "var(--font-inter), system-ui, sans-serif",
    "--theme-font-body": "var(--font-inter), system-ui, sans-serif",
    "--theme-font-accent": "var(--font-inter), system-ui, sans-serif",
    "--theme-font-script": "var(--font-alex-brush), cursive",
  },
};
