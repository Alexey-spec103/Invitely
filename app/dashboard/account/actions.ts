"use server";

import { createClient } from "@/lib/supabase/server";
import { listEvents, deleteEvent } from "@/lib/events";

/** Deletes every event the caller owns (reusing the same cleanup
 * `deleteEventAction` already relies on), then the account itself via the
 * `delete_own_account` Postgres function -- see
 * supabase/migrations/20260910160000_delete_own_account.sql for why that
 * needs a SECURITY DEFINER function rather than a service-role key. */
export async function deleteOwnAccount(): Promise<{ ok: true } | { ok: false; message: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, message: "Not authenticated" };
  }

  try {
    const events = await listEvents(user.id);
    for (const event of events) {
      await deleteEvent(event.id, user.id);
    }
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : "Failed to delete account" };
  }

  const { error } = await supabase.rpc("delete_own_account");
  if (error) {
    return { ok: false, message: error.message };
  }
  return { ok: true };
}
