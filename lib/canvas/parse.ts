import type { Json } from "@/lib/supabase/database.types";
import type { CanvasFrame } from "./types";

/** `site_config.canvas` is a nullable `jsonb` column — shape is only a
 * convention, not a guarantee. Same defensive-parse pattern as
 * `parseSections`/`parseContent` in components/sections/registry.tsx. */
export function parseCanvasFrames(raw: Json | null): CanvasFrame[] {
  if (!Array.isArray(raw)) {
    return [];
  }
  return raw as unknown as CanvasFrame[];
}
