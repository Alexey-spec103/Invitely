import type { TextStyleOverride } from "@/components/site-editor/EditableFieldContext";

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
}

export interface GuestbookSectionProps extends GuestbookSectionVariantProps {
  variant: GuestbookVariant;
}
