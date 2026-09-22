import type { TextStyleOverride } from "@/components/site-editor/EditableFieldContext";
import type { Locale } from "@/lib/i18n/locales";

export type VideoVariant = "embed" | "full-bleed" | "framed-polaroid";

export interface VideoSectionVariantProps {
  title?: string;
  videoUrl: string;
  styleOverrides?: Record<string, TextStyleOverride>;
  /** A plain locale string, not the Dictionary object -- see
   * RsvpSection/types.ts's `locale` field for why. Only used for the
   * embedded iframe's a11y `title` fallback when the host hasn't set one --
   * the "Paste a video URL below." placeholder is host-editor-only chrome
   * (never shown to a real guest) and stays untranslated on purpose. */
  locale: Locale;
}

export interface VideoSectionProps extends VideoSectionVariantProps {
  variant: VideoVariant;
}
