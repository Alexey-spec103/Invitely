import type { TextStyleOverride } from "@/components/site-editor/EditableFieldContext";
import type { ThemeCategory } from "@/lib/themes/types";

export type GuestNotesVariant = "simple-note";

export interface GuestNotesSectionVariantProps {
  title?: string;
  /** Free text -- practical requests/notices to guests (parking, unplugged
   * ceremony, "please don't shout gorko", kids policy, etc.), distinct from
   * Letter's warm personal narrative. Design-audit finding: weddingpost.ru's
   * own real invitation (checked live) has this as its own block, separate
   * from the personal letter -- confirmed twice as a genuine, not merely
   * cosmetic, gap. */
  body?: string;
  styleOverrides?: Record<string, TextStyleOverride>;
  themeCategory?: ThemeCategory;
}

export interface GuestNotesSectionProps extends GuestNotesSectionVariantProps {
  variant: GuestNotesVariant;
}
