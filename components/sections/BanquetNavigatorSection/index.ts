export { default as BanquetNavigatorSection } from "./BanquetNavigatorSection";
export type {
  BanquetNavigatorSectionProps,
  BanquetNavigatorSectionVariantProps,
  BanquetNavigatorVariant,
  BanquetTableLookupResult,
} from "./types";

import type { BanquetNavigatorVariant } from "./types";

export const BANQUET_NAVIGATOR_VARIANTS: BanquetNavigatorVariant[] = ["simple-lookup"];
export const DEFAULT_BANQUET_NAVIGATOR_VARIANT: BanquetNavigatorVariant = "simple-lookup";
