import type { TextStyleOverride } from "@/components/site-editor/EditableFieldContext";
import type { ThemeCategory } from "@/lib/themes/types";
import type { Locale } from "@/lib/i18n/locales";

export type DressCodeVariant = "color-palette" | "swatch-grid" | "minimal-stripe";

export interface DressCodeColor {
  hex: string;
  label?: string;
}

export interface DressCodeSectionVariantProps {
  title: string;
  description?: string;
  colors: DressCodeColor[];
  styleOverrides?: Record<string, TextStyleOverride>;
  themeCategory?: ThemeCategory;
  /** Direct feedback (2026-10-14): the section's own `title` is fully
   * host-editable (and seeded to "Dress Code" by default, see registry.tsx's
   * SECTION_LABELS) -- a host who restyles it into something more personal
   * ("What to Wear", a theme-matched phrase, ...) unintentionally removes
   * the one word that actually tells a guest what this section is. Each
   * variant now also renders a small, fixed, non-editable eyebrow from the
   * guest-facing dictionary (lib/i18n/translations) alongside the editable
   * title, so "this is the dress code" survives no matter how the title
   * gets customized. Required (not optional), matching every other section
   * type's own `locale` field (see e.g. GuestbookSection/types.ts) -- both
   * real call sites (registry.tsx, SiteInlineEditor.tsx) always have one in
   * scope, so a future call site that forgets it is a compile error instead
   * of a silently-missing eyebrow. */
  locale: Locale;
}

export interface DressCodeSectionProps extends DressCodeSectionVariantProps {
  variant: DressCodeVariant;
}
