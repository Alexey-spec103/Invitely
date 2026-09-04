export { default as MapSection } from "./MapSection";
export type { MapSectionProps, MapSectionVariantProps, MapVariant, MapVenue } from "./types";

import type { MapVariant } from "./types";

export const MAP_VARIANTS: MapVariant[] = ["embed-static", "side-by-side-cards", "minimal-list"];
export const DEFAULT_MAP_VARIANT: MapVariant = "embed-static";
