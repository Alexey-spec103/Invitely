import type { TextStyleOverride } from "@/components/site-editor/EditableFieldContext";

export type RsvpVariant = "simple-form";

export interface RsvpQuestion {
  id: string;
  label: string;
  type: "text" | "choice";
  options?: string[];
}

export interface RsvpFormInput {
  guestName: string;
  attending: boolean;
  partySize: number;
  allergies?: string;
  comment?: string;
  answers?: Record<string, string>;
  /** Names of the extra people in the party (partySize - 1), only ever
   * persisted server-side when the guest was resolved via their invite link
   * -- see `maxPartySize` below, which is only set in that same case. */
  attendeeNames?: string[];
  /** Anti-spam signals, both checked server-side (never trust the client
   * alone — the server action is directly callable, bypassing this form
   * entirely). `honeypot` is a field real guests never see or fill;
   * `formRenderedAt` lets the server reject submissions faster than any
   * human could plausibly fill the form. See `submitRsvp`. */
  honeypot?: string;
  formRenderedAt?: number;
}

export interface RsvpSectionVariantProps {
  title: string;
  description?: string;
  defaultGuestName?: string;
  /** Max party size (including the guest themself), from `guests.max_plus_ones + 1`
   * for a guest resolved via their invite link. Undefined when there's no cap to enforce. */
  maxPartySize?: number;
  questions?: RsvpQuestion[];
  onSubmit: (input: RsvpFormInput) => Promise<void>;
  styleOverrides?: Record<string, TextStyleOverride>;
}

export interface RsvpSectionProps extends RsvpSectionVariantProps {
  variant: RsvpVariant;
}
