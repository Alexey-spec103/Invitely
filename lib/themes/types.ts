export interface ThemeVars {
  "--theme-bg": string;
  "--theme-text": string;
  "--theme-accent": string;
  "--theme-font-heading": string;
  "--theme-font-body": string;
  /** Handwritten/italic font for pull quotes. Omit for themes with no accent font. */
  "--theme-font-accent"?: string;
  /** Genuine cursive/handwriting font for signature-style flourishes (quotes, timeline event titles). */
  "--theme-font-script": string;
}

/** Primary style bucket -- one per theme, drives the gallery's category
 * sidebar (with live counts). Freeform `tags` still exist for secondary
 * descriptors (color/motif/mood) that don't need their own sidebar entry. */
export type ThemeCategory =
  | "romantic"
  | "modern"
  | "botanical"
  | "boho"
  | "luxury"
  | "dark"
  | "coastal"
  | "rustic"
  | "vintage"
  | "minimal"
  | "marble"
  | "cosmic"
  | "peony"
  | "provence";

/** Seasonal collection -- a cross-cutting filter (like weddingpost's season
 * nav), not a category. Optional: a theme with no strong seasonal read
 * (e.g. a year-round minimalist palette) can omit it. */
export type ThemeSeason = "spring" | "summer" | "autumn" | "winter";

export interface Theme {
  id: string;
  name: string;
  category: ThemeCategory;
  season?: ThemeSeason;
  tags: string[];
  vars: ThemeVars;
}
