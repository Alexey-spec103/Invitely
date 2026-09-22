import type { TextStyleOverride } from "@/components/site-editor/EditableFieldContext";
import type { Locale } from "@/lib/i18n/locales";

export type BanquetNavigatorVariant = "simple-lookup";

export interface BanquetTableLookupResult {
  found: boolean;
  tableName: string | null;
  attending: boolean | null;
}

export interface BanquetNavigatorSectionVariantProps {
  title: string;
  description?: string;
  /** Already known when the guest arrived via their personal invite link and
   * has a table assigned -- skips the search entirely and just states it. */
  assignedTableName?: string;
  onLookup: (fullName: string) => Promise<BanquetTableLookupResult>;
  styleOverrides?: Record<string, TextStyleOverride>;
  /** A plain locale string, not the Dictionary object -- see
   * RsvpSection/types.ts's `locale` field for why. */
  locale: Locale;
}

export interface BanquetNavigatorSectionProps extends BanquetNavigatorSectionVariantProps {
  variant: BanquetNavigatorVariant;
}
