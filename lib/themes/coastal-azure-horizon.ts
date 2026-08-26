import type { Theme } from "./types";

// A deeper azure-blue coastal theme -- more saturated than Navy Sail,
// EB Garamond for a romantic-Mediterranean rather than nautical register.
export const coastalAzureHorizon: Theme = {
  id: "coastal-azure-horizon",
  name: "Azure Horizon",
  category: "coastal",
  season: "summer",
  tags: ["Coastal", "Romantic", "Summer", "Marine"],
  vars: {
    "--theme-bg": "#EAF1F5",
    "--theme-text": "#1D3444",
    "--theme-accent": "#3E7FA3",
    "--theme-font-heading": "var(--font-eb-garamond), Georgia, serif",
    "--theme-font-body": "var(--font-inter), system-ui, sans-serif",
    "--theme-bg-texture": "url('/patterns/waves.svg')",
    "--theme-font-script": "var(--font-alex-brush), cursive",
  },
};
