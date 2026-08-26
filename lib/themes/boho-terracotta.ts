import type { Theme } from "./types";

export const bohoTerracotta: Theme = {
  id: "boho-terracotta",
  name: "Boho Terracotta",
  category: "boho",
  season: "autumn",
  tags: ["Boho", "Warm", "Autumn", "Dried Flowers"],
  vars: {
    "--theme-bg": "#F4E9DD",
    "--theme-text": "#5C3D2E",
    "--theme-accent": "#C1633B",
    "--theme-font-heading": "var(--font-fraunces), Georgia, serif",
    "--theme-font-body": "var(--font-inter), system-ui, sans-serif",
    "--theme-font-accent": "var(--font-fraunces), Georgia, serif",
    "--theme-font-script": "var(--font-alex-brush), cursive",
  },
};
