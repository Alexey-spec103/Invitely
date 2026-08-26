"use server";

import { createClient } from "@/lib/supabase/server";
import type { RsvpFormInput } from "@/components/sections/RsvpSection";
import type { BanquetTableLookupResult } from "@/components/sections/BanquetNavigatorSection";
import type { Json } from "@/lib/supabase/database.types";

export async function submitRsvp(
  eventId: string,
  guestId: string | null,
  maxPlusOnes: number | null,
  input: RsvpFormInput
) {
  // Anti-spam: a filled honeypot or a submission faster than any human could
  // plausibly manage is treated as spam and silently dropped -- returning
  // normally (not throwing) so a bot gets no signal it was rejected, rather
  // than an error it could use to refine its attempt. Both signals are only
  // ever meaningful when sent by the real public form (this server action
  // is directly callable, so client-side-only checks would be trivial to
  // bypass); undefined/missing values (e.g. a future non-SimpleForm variant
  // that doesn't send them) are treated as passing, not as spam.
  if (input.honeypot) {
    return;
  }
  if (input.formRenderedAt != null && Date.now() - input.formRenderedAt < 1500) {
    return;
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
    throw new Error("We couldn't submit your RSVP. Please try again in a moment.");
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
