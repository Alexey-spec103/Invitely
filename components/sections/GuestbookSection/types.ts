import type { TextStyleOverride } from "@/components/site-editor/EditableFieldContext";
import type { Locale } from "@/lib/i18n/locales";

export type GuestbookVariant = "wall" | "quote-scroll" | "minimal-list";

export interface GuestbookMessageItem {
  guestName: string;
  comment: string;
  submittedAt: string | null;
}

export interface GuestbookSectionVariantProps {
  title?: string;
  messages: GuestbookMessageItem[];
  styleOverrides?: Record<string, TextStyleOverride>;
  /** A plain locale string, not the Dictionary object -- see
   * RsvpSection/types.ts's `locale` field for why. */
  locale: Locale;
}

export interface GuestbookSectionProps extends GuestbookSectionVariantProps {
  variant: GuestbookVariant;
}
