"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { parseGuestLines } from "./parseGuestLines";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^[0-9+\-()\s]{6,20}$/;

// The client already validates via zod, but this server action is directly
// callable, so the check has to be re-run here too (same standing rule as
// every other user-supplied field in this project) -- throws for the
// single-guest paths (add/edit), where a host is deliberately typing one
// entry and should see the same rejection as the client would show.
function assertValidContact(email?: string, phone?: string) {
  if (email && !EMAIL_PATTERN.test(email)) {
    throw new Error("Enter a valid email");
  }
  if (phone && !PHONE_PATTERN.test(phone)) {
    throw new Error("Enter a valid phone number");
  }
}

interface AddGuestInput {
  eventId: string;
  fullName: string;
  email?: string;
  phone?: string;
  groupLabel?: string;
  maxPlusOnes?: number;
  paperEnabled?: boolean;
  siteEnabled?: boolean;
}

export async function addGuest(input: AddGuestInput) {
  assertValidContact(input.email, input.phone);
  const supabase = await createClient();

  const { error } = await supabase.from("guests").insert({
    event_id: input.eventId,
    full_name: input.fullName,
    email: input.email || null,
    phone: input.phone || null,
    group_label: input.groupLabel || null,
    max_plus_ones: input.maxPlusOnes ?? null,
    paper_enabled: input.paperEnabled ?? true,
    site_enabled: input.siteEnabled ?? true,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/dashboard/${input.eventId}/guests`);
}

export async function setInvitationSent(guestId: string, sent: boolean) {
  const supabase = await createClient();

  // A manual "mark as not sent" also clears the channel record -- otherwise
  // toggling it back on later would misleadingly still show whichever
  // channel was used before this reset.
  const { error } = await supabase
    .from("guests")
    .update({
      invitation_sent_at: sent ? new Date().toISOString() : null,
      ...(sent ? {} : { sent_channels: [] }),
    })
    .eq("id", guestId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard", "layout");
}

export type SendChannel = "link" | "sms" | "whatsapp" | "email";

/** dashboard-audit.md B18: records which channel(s) a host actually used to
 * reach a guest -- the honest equivalent of weddingpost.ru's "delivery
 * status" given Invitely has no real SMS/email backend to report true
 * delivery receipts from. Also flips `invitation_sent_at` the same way
 * `setInvitationSent(guestId, true)` already does, so "Sent" status and
 * channel history stay in sync regardless of which action set them. */
export async function recordInvitationSent(guestId: string, channel: SendChannel) {
  const supabase = await createClient();

  const { data: guest, error: fetchError } = await supabase
    .from("guests")
    .select("sent_channels, invitation_sent_at")
    .eq("id", guestId)
    .single();

  if (fetchError) {
    throw new Error(fetchError.message);
  }

  const channels = new Set(guest.sent_channels ?? []);
  channels.add(channel);

  const { error } = await supabase
    .from("guests")
    .update({
      sent_channels: Array.from(channels),
      invitation_sent_at: guest.invitation_sent_at ?? new Date().toISOString(),
    })
    .eq("id", guestId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard", "layout");
}

export async function addGuestsBulk(eventId: string, rawText: string) {
  const supabase = await createClient();
  const rows = parseGuestLines(rawText);

  if (rows.length === 0) {
    throw new Error("No guest names found — paste one name per line.");
  }

  // A bulk paste is forgiving by design (that's the whole point of the
  // feature) -- rejecting the entire batch over one misaligned column would
  // undo that. Drop just the malformed field rather than the whole row, so
  // a name still imports even if e.g. a phone number landed in the email
  // column during a spreadsheet paste.
  const { error } = await supabase.from("guests").insert(
    rows.map((row) => ({
      event_id: eventId,
      full_name: row.fullName,
      group_label: row.groupLabel || null,
      email: row.email && EMAIL_PATTERN.test(row.email) ? row.email : null,
      phone: row.phone && PHONE_PATTERN.test(row.phone) ? row.phone : null,
    }))
  );

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/dashboard/${eventId}/guests`);
  return rows.length;
}

interface UpdateGuestInput {
  guestId: string;
  fullName: string;
  email?: string;
  phone?: string;
  groupLabel?: string;
  maxPlusOnes?: number;
  paperEnabled: boolean;
  siteEnabled: boolean;
}

export async function updateGuest(input: UpdateGuestInput) {
  assertValidContact(input.email, input.phone);
  const supabase = await createClient();

  const { error } = await supabase
    .from("guests")
    .update({
      full_name: input.fullName,
      email: input.email || null,
      phone: input.phone || null,
      group_label: input.groupLabel || null,
      max_plus_ones: input.maxPlusOnes ?? null,
      paper_enabled: input.paperEnabled,
      site_enabled: input.siteEnabled,
    })
    .eq("id", input.guestId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard", "layout");
}

export async function deleteGuest(guestId: string) {
  const supabase = await createClient();

  const { error } = await supabase.from("guests").delete().eq("id", guestId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard", "layout");
}

export async function addGuestAttendee(guestId: string, fullName: string) {
  const supabase = await createClient();

  const { error } = await supabase.from("guest_attendees").insert({
    guest_id: guestId,
    full_name: fullName,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard", "layout");
}

export async function deleteGuestAttendee(attendeeId: string) {
  const supabase = await createClient();

  const { error } = await supabase.from("guest_attendees").delete().eq("id", attendeeId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard", "layout");
}

export async function toggleGuestbookVisibility(responseId: string, hidden: boolean) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("rsvp_responses")
    .update({ guestbook_hidden: hidden })
    .eq("id", responseId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard", "layout");
}

export async function setAllGuestbookVisibility(eventId: string, hidden: boolean) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("rsvp_responses")
    .update({ guestbook_hidden: hidden })
    .eq("event_id", eventId)
    .not("comment", "is", null);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard", "layout");
}

interface LinkRsvpResponseToGuestInput {
  responseId: string;
  guestId: string | null;
}

export async function linkRsvpResponseToGuest(input: LinkRsvpResponseToGuestInput) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("rsvp_responses")
    .update({ guest_id: input.guestId })
    .eq("id", input.responseId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard", "layout");
}

export async function deleteRsvpResponse(responseId: string) {
  const supabase = await createClient();

  const { error } = await supabase.from("rsvp_responses").delete().eq("id", responseId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard", "layout");
}
