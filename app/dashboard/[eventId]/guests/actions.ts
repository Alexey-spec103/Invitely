"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { parseGuestLines } from "./parseGuestLines";
import { sendEmail } from "@/lib/email";

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

export async function addGuest(
  input: AddGuestInput
): Promise<{ ok: true } | { ok: false; message: string }> {
  try {
    assertValidContact(input.email, input.phone);
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : "Invalid contact info" };
  }
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, message: "Not authenticated" };
  }

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
    return { ok: false, message: error.message };
  }

  revalidatePath(`/dashboard/${input.eventId}/guests`);
  return { ok: true };
}

export async function setInvitationSent(guestId: string, sent: boolean) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

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
 * status" given Invimbo has no real SMS/email backend to report true
 * delivery receipts from. Also flips `invitation_sent_at` the same way
 * `setInvitationSent(guestId, true)` already does, so "Sent" status and
 * channel history stay in sync regardless of which action set them. */
export async function recordInvitationSent(guestId: string, channel: SendChannel) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

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

/** Real server-side delivery for the "Email" option in SendInviteMenu,
 * replacing the mailto: compose window with an actual sent email. Guest and
 * event details are re-fetched here (not trusted from the caller) so this
 * only ever sends using an email address on file for a guest the caller
 * actually owns -- RLS on both selects already enforces that, matching
 * every other action in this file. */
export async function sendGuestInvitationEmail(
  guestId: string,
  rsvpUrl: string
): Promise<{ ok: true } | { ok: false; message: string }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, message: "Not authenticated" };
  }

  const { data: guest, error: guestError } = await supabase
    .from("guests")
    .select("full_name, email, event_id")
    .eq("id", guestId)
    .single();

  if (guestError || !guest) {
    return { ok: false, message: guestError?.message ?? "Guest not found" };
  }
  if (!guest.email) {
    return { ok: false, message: "This guest has no email on file" };
  }

  const { data: event, error: eventError } = await supabase
    .from("events")
    .select("title")
    .eq("id", guest.event_id)
    .single();

  if (eventError || !event) {
    return { ok: false, message: eventError?.message ?? "Event not found" };
  }

  await sendEmail({
    to: guest.email,
    subject: `You're invited to ${event.title}`,
    html: `<p>Hi ${guest.full_name},</p><p>You're invited to <strong>${event.title}</strong>.</p><p><a href="${rsvpUrl}">RSVP here</a></p>`,
  });

  await recordInvitationSent(guestId, "email");
  return { ok: true };
}

/** Reminder counterpart to sendGuestInvitationEmail above -- same delivery
 * path (real email via Resend, same RSVP link), different copy and no
 * recordInvitationSent call: a reminder isn't a new invitation, so it
 * shouldn't touch invitation_sent_at/sent_channels or move the guest's
 * status pill, which already reads "Sent" correctly for this guest. */
export async function sendGuestReminderEmail(
  guestId: string,
  rsvpUrl: string
): Promise<{ ok: true } | { ok: false; message: string }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, message: "Not authenticated" };
  }

  const { data: guest, error: guestError } = await supabase
    .from("guests")
    .select("full_name, email, event_id")
    .eq("id", guestId)
    .single();

  if (guestError || !guest) {
    return { ok: false, message: guestError?.message ?? "Guest not found" };
  }
  if (!guest.email) {
    return { ok: false, message: "This guest has no email on file" };
  }

  const { data: event, error: eventError } = await supabase
    .from("events")
    .select("title")
    .eq("id", guest.event_id)
    .single();

  if (eventError || !event) {
    return { ok: false, message: eventError?.message ?? "Event not found" };
  }

  await sendEmail({
    to: guest.email,
    subject: `Don't forget to RSVP for ${event.title}`,
    html: `<p>Hi ${guest.full_name},</p><p>Just a friendly reminder -- we haven't heard back from you yet for <strong>${event.title}</strong>.</p><p><a href="${rsvpUrl}">RSVP here</a></p>`,
  });

  return { ok: true };
}

interface BulkGuestRow {
  fullName: string;
  groupLabel?: string;
  email?: string;
  phone?: string;
}

// Shared by both bulk-add paths below. A bulk paste/import is forgiving by
// design (that's the whole point of the feature) -- rejecting the entire
// batch over one malformed field would undo that. Drop just that field
// rather than the whole row, so a name still imports even if e.g. a phone
// number landed in the email column during a spreadsheet paste.
async function insertGuestRows(
  eventId: string,
  rows: BulkGuestRow[]
): Promise<{ ok: true; count: number } | { ok: false; message: string }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, message: "Not authenticated" };
  }

  if (rows.length === 0) {
    return { ok: false, message: "No guest names found." };
  }

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
    return { ok: false, message: error.message };
  }

  revalidatePath(`/dashboard/${eventId}/guests`);
  return { ok: true, count: rows.length };
}

export async function addGuestsBulk(
  eventId: string,
  rawText: string
): Promise<{ ok: true; count: number } | { ok: false; message: string }> {
  const rows = parseGuestLines(rawText);
  if (rows.length === 0) {
    return { ok: false, message: "No guest names found — paste one name per line." };
  }
  return insertGuestRows(eventId, rows);
}

// CSV import's own insert path -- deliberately NOT routed through
// addGuestsBulk/parseGuestLines. That text format splits a line on tabs OR
// commas, which is exactly wrong for a name that legitimately contains a
// comma (e.g. "Lee, David") -- a real CSV file already parses that
// correctly as one field, so re-flattening it into comma-sensitive text
// just to re-split it would reintroduce the very bug CSV parsing exists to
// avoid. This takes already-structured rows straight to the same insert
// `insertGuestRows` uses for the paste flow, with no lossy text step
// between.
export async function addGuestsStructured(
  eventId: string,
  rows: BulkGuestRow[]
): Promise<{ ok: true; count: number } | { ok: false; message: string }> {
  return insertGuestRows(eventId, rows);
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

export async function updateGuest(
  input: UpdateGuestInput
): Promise<{ ok: true } | { ok: false; message: string }> {
  try {
    assertValidContact(input.email, input.phone);
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : "Invalid contact info" };
  }
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, message: "Not authenticated" };
  }

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
    return { ok: false, message: error.message };
  }

  revalidatePath("/dashboard", "layout");
  return { ok: true };
}

export async function deleteGuest(
  guestId: string
): Promise<{ ok: true } | { ok: false; message: string }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, message: "Not authenticated" };
  }

  const { error } = await supabase.from("guests").delete().eq("id", guestId);

  if (error) {
    return { ok: false, message: error.message };
  }

  revalidatePath("/dashboard", "layout");
  return { ok: true };
}

export async function addGuestAttendee(guestId: string, fullName: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

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

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  const { error } = await supabase.from("guest_attendees").delete().eq("id", attendeeId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard", "layout");
}

export async function toggleGuestbookVisibility(
  responseId: string,
  hidden: boolean
): Promise<{ ok: true } | { ok: false; message: string }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, message: "Not authenticated" };
  }

  const { error } = await supabase
    .from("rsvp_responses")
    .update({ guestbook_hidden: hidden })
    .eq("id", responseId);

  if (error) {
    return { ok: false, message: error.message };
  }

  revalidatePath("/dashboard", "layout");
  return { ok: true };
}

export async function setAllGuestbookVisibility(
  eventId: string,
  hidden: boolean
): Promise<{ ok: true } | { ok: false; message: string }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, message: "Not authenticated" };
  }

  const { error } = await supabase
    .from("rsvp_responses")
    .update({ guestbook_hidden: hidden })
    .eq("event_id", eventId)
    .not("comment", "is", null);

  if (error) {
    return { ok: false, message: error.message };
  }

  revalidatePath("/dashboard", "layout");
  return { ok: true };
}

interface LinkRsvpResponseToGuestInput {
  responseId: string;
  guestId: string | null;
}

export async function linkRsvpResponseToGuest(
  input: LinkRsvpResponseToGuestInput
): Promise<{ ok: true } | { ok: false; message: string }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, message: "Not authenticated" };
  }

  const { error } = await supabase
    .from("rsvp_responses")
    .update({ guest_id: input.guestId })
    .eq("id", input.responseId);

  if (error) {
    return { ok: false, message: error.message };
  }

  revalidatePath("/dashboard", "layout");
  return { ok: true };
}

export async function deleteRsvpResponse(
  responseId: string
): Promise<{ ok: true } | { ok: false; message: string }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, message: "Not authenticated" };
  }

  const { error } = await supabase.from("rsvp_responses").delete().eq("id", responseId);

  if (error) {
    return { ok: false, message: error.message };
  }

  revalidatePath("/dashboard", "layout");
  return { ok: true };
}

/** Direct feedback: a host had no way to turn off the "you got an RSVP"
 * email (app/e/[slug]/actions.ts's submitRsvp sends one on every response,
 * unconditionally) -- some hosts want to just check the dashboard
 * themselves instead. `.eq("owner_id", user.id)` is the actual enforcement
 * here (not just RLS) since this writes to `events` directly, a broader
 * table than the guest-scoped rows most of this file's other actions touch. */
export async function updateRsvpEmailNotifications(
  eventId: string,
  enabled: boolean
): Promise<{ ok: true } | { ok: false; message: string }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, message: "Not authenticated" };
  }

  const { error } = await supabase
    .from("events")
    .update({ rsvp_email_notifications: enabled })
    .eq("id", eventId)
    .eq("owner_id", user.id);

  if (error) {
    return { ok: false, message: error.message };
  }

  revalidatePath("/dashboard", "layout");
  return { ok: true };
}

/** Companion to updateRsvpEmailNotifications above, for the separate daily
 * digest (app/api/cron/rsvp-digest/route.ts) rather than the instant
 * per-response email -- a host can have either, both, or neither on. */
export async function updateRsvpDigestEmail(
  eventId: string,
  enabled: boolean
): Promise<{ ok: true } | { ok: false; message: string }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, message: "Not authenticated" };
  }

  const { error } = await supabase
    .from("events")
    .update({ rsvp_digest_email: enabled })
    .eq("id", eventId)
    .eq("owner_id", user.id);

  if (error) {
    return { ok: false, message: error.message };
  }

  revalidatePath("/dashboard", "layout");
  return { ok: true };
}

/** Bulk counterpart to sendGuestInvitationEmail above -- one click through
 * every guest with an email on file that hasn't already been emailed,
 * instead of opening SendInviteMenu once per person. Sequential (not
 * Promise.all) so a slow/failing send never races recordInvitationSent
 * writes against each other for different guests, and so a host sending to
 * a large list doesn't fire everything at Resend at once. Best-effort per
 * guest: one failure is recorded in `failed` and the loop continues, rather
 * than aborting the whole batch. */
export async function sendBulkGuestInvitationEmails(
  eventId: string,
  baseUrl: string
): Promise<
  | { ok: true; sent: number; skipped: number; failed: { name: string; message: string }[] }
  | { ok: false; message: string }
> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, message: "Not authenticated" };
  }

  const { data: event, error: eventError } = await supabase
    .from("events")
    .select("title, slug")
    .eq("id", eventId)
    .eq("owner_id", user.id)
    .single();

  if (eventError || !event) {
    return { ok: false, message: eventError?.message ?? "Event not found" };
  }

  const { data: guests, error: guestsError } = await supabase
    .from("guests")
    .select("id, full_name, email, invite_code, invitation_sent_at, site_enabled")
    .eq("event_id", eventId);

  if (guestsError) {
    return { ok: false, message: guestsError.message };
  }

  const eligible = (guests ?? []).filter(
    (guest) => guest.site_enabled && guest.email && guest.invite_code && !guest.invitation_sent_at
  );

  let sent = 0;
  const failed: { name: string; message: string }[] = [];

  for (const guest of eligible) {
    const url = `${baseUrl}/e/${event.slug}?invite=${guest.invite_code}`;
    try {
      // sendGuestInvitationEmail's own {ok:false} path only covers its
      // guard clauses (no email on file, event/guest not found) -- the
      // underlying sendEmail() call throws on a real provider error (e.g.
      // Resend rejecting a test address), which would otherwise escape this
      // loop entirely and abort every guest after the one that failed.
      const result = await sendGuestInvitationEmail(guest.id, url);
      if (result.ok) {
        sent += 1;
      } else {
        failed.push({ name: guest.full_name, message: result.message });
      }
    } catch (err) {
      failed.push({ name: guest.full_name, message: err instanceof Error ? err.message : "Failed to send" });
    }
  }

  const skipped = (guests ?? []).length - eligible.length - failed.length;

  revalidatePath("/dashboard", "layout");
  return { ok: true, sent, skipped: Math.max(skipped, 0), failed };
}

/** Bulk counterpart to sendGuestReminderEmail above -- same shape as
 * sendBulkGuestInvitationEmails, but eligibility is the opposite population:
 * guests who've already received an invitation (invitation_sent_at set) and
 * still have no row at all in rsvp_responses, matching the same "Sent"
 * status pill getGuestStatus already shows for them on this page (an
 * accepted/declined guest has a response row and is correctly excluded). */
export async function sendBulkGuestReminderEmails(
  eventId: string,
  baseUrl: string
): Promise<
  | { ok: true; sent: number; skipped: number; failed: { name: string; message: string }[] }
  | { ok: false; message: string }
> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, message: "Not authenticated" };
  }

  const { data: event, error: eventError } = await supabase
    .from("events")
    .select("title, slug")
    .eq("id", eventId)
    .eq("owner_id", user.id)
    .single();

  if (eventError || !event) {
    return { ok: false, message: eventError?.message ?? "Event not found" };
  }

  const { data: guests, error: guestsError } = await supabase
    .from("guests")
    .select("id, full_name, email, invite_code, invitation_sent_at, site_enabled")
    .eq("event_id", eventId);

  if (guestsError) {
    return { ok: false, message: guestsError.message };
  }

  const { data: responses, error: responsesError } = await supabase
    .from("rsvp_responses")
    .select("guest_id")
    .eq("event_id", eventId);

  if (responsesError) {
    return { ok: false, message: responsesError.message };
  }

  const respondedGuestIds = new Set((responses ?? []).map((response) => response.guest_id).filter(Boolean));

  const eligible = (guests ?? []).filter(
    (guest) =>
      guest.site_enabled &&
      guest.email &&
      guest.invite_code &&
      guest.invitation_sent_at != null &&
      !respondedGuestIds.has(guest.id)
  );

  let sent = 0;
  const failed: { name: string; message: string }[] = [];

  for (const guest of eligible) {
    const url = `${baseUrl}/e/${event.slug}?invite=${guest.invite_code}`;
    try {
      const result = await sendGuestReminderEmail(guest.id, url);
      if (result.ok) {
        sent += 1;
      } else {
        failed.push({ name: guest.full_name, message: result.message });
      }
    } catch (err) {
      failed.push({ name: guest.full_name, message: err instanceof Error ? err.message : "Failed to send" });
    }
  }

  const skipped = (guests ?? []).length - eligible.length - failed.length;

  return { ok: true, sent, skipped: Math.max(skipped, 0), failed };
}
