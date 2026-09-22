"use server";

import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import type { RsvpFormInput } from "@/components/sections/RsvpSection";
import type { BanquetTableLookupResult } from "@/components/sections/BanquetNavigatorSection";
import type { Json } from "@/lib/supabase/database.types";
import { sendEmail } from "@/lib/email";

export async function submitRsvp(
  eventId: string,
  guestId: string | null,
  maxPlusOnes: number | null,
  input: RsvpFormInput
): Promise<{ ok: true } | { ok: false; message: string }> {
  // Anti-spam: a filled honeypot or a submission faster than any human could
  // plausibly manage is treated as spam and silently dropped -- returning
  // normally (not throwing) so a bot gets no signal it was rejected, rather
  // than an error it could use to refine its attempt. Both signals are only
  // ever meaningful when sent by the real public form (this server action
  // is directly callable, so client-side-only checks would be trivial to
  // bypass); undefined/missing values (e.g. a future non-SimpleForm variant
  // that doesn't send them) are treated as passing, not as spam.
  if (input.honeypot) {
    return { ok: true };
  }
  if (input.formRenderedAt != null && Date.now() - input.formRenderedAt < 1500) {
    return { ok: true };
  }

  const supabase = await createClient();

  // A guest arriving via the site's general share link (no personal invite
  // code) has no existing `guests` row -- find-or-create one by name so
  // they still show up in the host's guest list and banquet tools, instead
  // of only ever existing as an unmatched RSVP response. Same "share one
  // link, we build the list" flow weddingpost.ru's self-service invites
  // use. Routed through a security-definer RPC rather than a direct insert
  // so anonymous visitors never get a broad policy on `guests` (see
  // 20260818120000_self_service_guest_rsvp.sql).
  let resolvedGuestId = guestId;
  if (!resolvedGuestId && input.guestName.trim()) {
    const { data: foundOrCreatedId, error: findError } = await supabase.rpc(
      "find_or_create_self_service_guest",
      { p_event_id: eventId, p_full_name: input.guestName.trim() }
    );
    if (findError) {
      console.error("submitRsvp self-service guest lookup failed", findError);
    } else {
      resolvedGuestId = foundOrCreatedId;
    }
  }

  // The client already clamps to this cap, but a guest could call the
  // server action directly with an arbitrary party size -- re-clamp here
  // using the cap resolved server-side from the guest's own invite link,
  // never trusting a max the client might send.
  const partySize =
    input.attending && maxPlusOnes != null
      ? Math.min(input.partySize, maxPlusOnes + 1)
      : input.partySize;

  const row = {
    event_id: eventId,
    guest_id: resolvedGuestId,
    guest_name: input.guestName,
    attending: input.attending,
    party_size: input.attending ? partySize : 0,
    allergies: input.allergies || null,
    comment: input.comment || null,
    // Reused rather than adding a new column — this held a fixed
    // "meal preferences" concept that was never wired up anywhere in the
    // app; a generic questionId -> answer map covers meal prefs and any
    // other custom RSVP question the host defines (drinks, transfer,
    // lodging, etc.) without a migration.
    meal_preferences: input.answers ? (input.answers as unknown as Json) : null,
  };

  // A guest resolved to a real `guests` row -- via their invite link, or now
  // via the self-service find-or-create above -- can resubmit to change
  // their answer -- upsert on the same (event_id, guest_id) row rather than
  // accumulating duplicates. Only a guest whose name was blank (so no row
  // could be resolved) falls back to a plain insert.
  const { error } = resolvedGuestId
    ? await supabase.from("rsvp_responses").upsert(row, { onConflict: "event_id,guest_id" })
    : await supabase.from("rsvp_responses").insert(row);

  if (error) {
    console.error("submitRsvp failed", error);
    // Postgres RLS violations always carry this code -- the only way this
    // insert/upsert can hit it is the "published events only" policy on
    // rsvp_responses, so it's safe to name the real cause instead of the
    // generic message below.
    if (error.code === "42501") {
      return {
        ok: false,
        message: "This site isn't published yet, so RSVPs can't be submitted. Ask your host to publish it.",
      };
    }
    return { ok: false, message: "We couldn't submit your RSVP. Please try again in a moment." };
  }

  // Sync guest_attendees to the party's real names, but only when the guest
  // resolved to a real `guests` row -- there's no row to attach attendees to
  // otherwise. Delete-then-insert on every (re)submission (including a
  // decline, which clears the party to zero named attendees) rather than
  // diffing, matching this table's small expected size and keeping the sync
  // trivially idempotent.
  if (resolvedGuestId) {
    const { error: clearError } = await supabase
      .from("guest_attendees")
      .delete()
      .eq("guest_id", resolvedGuestId);
    if (clearError) {
      console.error("submitRsvp attendee sync (clear) failed", clearError);
    } else if (input.attending && input.attendeeNames && input.attendeeNames.length > 0) {
      const names = input.attendeeNames.filter((name) => name.trim().length > 0);
      if (names.length > 0) {
        const { error: attendeeError } = await supabase
          .from("guest_attendees")
          .insert(names.map((fullName) => ({ guest_id: resolvedGuestId, full_name: fullName })));
        if (attendeeError) {
          console.error("submitRsvp attendee sync (insert) failed", attendeeError);
        }
      }
    }
  }

  // Best-effort confirmation email -- never blocks or fails the RSVP itself.
  // Only guests resolved to a real `guests` row can have an email on file
  // (the public RSVP form itself never asks for one); most self-service
  // guests won't, and that's fine, there's just nothing to send to.
  if (resolvedGuestId) {
    try {
      const { data: guestEmail } = await supabase.rpc("get_guest_email_for_rsvp_confirmation", {
        p_event_id: eventId,
        p_guest_id: resolvedGuestId,
      });

      if (guestEmail) {
        const { data: event } = await supabase.from("events").select("title").eq("id", eventId).single();
        const eventTitle = event?.title ?? "the event";

        const html = input.attending
          ? `<p>Hi ${input.guestName},</p><p>Thank you, we'll see you there! Your RSVP for <strong>${eventTitle}</strong> is confirmed.</p>`
          : `<p>Hi ${input.guestName},</p><p>Thanks for letting us know you won't be able to make it to <strong>${eventTitle}</strong>. We'll miss you!</p>`;

        await sendEmail({
          to: guestEmail,
          subject: input.attending ? `You're confirmed for ${eventTitle}` : `RSVP received for ${eventTitle}`,
          html,
        });
      }
    } catch (emailError) {
      console.error("submitRsvp confirmation email failed", emailError);
    }
  }

  return { ok: true };
}

export async function lookupGuestTable(eventId: string, fullName: string): Promise<BanquetTableLookupResult> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .rpc("lookup_guest_table_by_name", { p_event_id: eventId, p_full_name: fullName })
    .maybeSingle();

  if (error || !data) {
    console.error("lookupGuestTable failed", error);
    return { found: false, tableName: null, attending: null };
  }

  return { found: data.found, tableName: data.table_name, attending: data.attending };
}

/** Verifies the guest-entered password against the event's hash entirely
 * inside the `verify_site_password` Postgres function -- the hash itself is
 * never read here (its column-level SELECT is revoked for every role; see
 * the site-password migration), only the opaque unlock token the function
 * returns on a correct guess. That token becomes the cookie value page.tsx
 * checks on future visits, so the guest isn't asked again. */
export async function unlockSitePassword(
  eventId: string,
  password: string
): Promise<{ ok: true } | { ok: false; message: string }> {
  const supabase = await createClient();

  const { data: token, error } = await supabase.rpc("verify_site_password", {
    p_event_id: eventId,
    p_password: password,
  });

  if (error || !token) {
    return { ok: false, message: "Incorrect password" };
  }

  const cookieStore = await cookies();
  cookieStore.set(`site_unlock_${eventId}`, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 180, // 180 days
  });
  return { ok: true };
}
