import type { Theme } from "./types";

export const modernMono: Theme = {
  id: "modern-mono",
  name: "Modern Mono",
  category: "minimal",
  tags: ["Modern", "Minimal", "Typography", "Minimalism"],
  vars: {
    "--theme-bg": "#ffffff",
    "--theme-text": "#111111",
    "--theme-accent": "#111111",
    "--theme-font-heading": "var(--font-inter), system-ui, sans-serif",
    "--theme-font-body": "var(--font-space-grotesk), system-ui, sans-serif",
    "--theme-bg-texture": "url('/patterns/grain-light.svg')",
    "--theme-font-script": "var(--font-alex-brush), cursive",
  },
};
