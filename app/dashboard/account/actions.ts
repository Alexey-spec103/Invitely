"use server";

import { createClient } from "@/lib/supabase/server";
import { listEvents, deleteEvent } from "@/lib/events";

/** Deletes every event the caller owns (reusing the same cleanup
 * `deleteEventAction` already relies on), then the account itself via the
 * `delete_own_account` Postgres function -- see
 * supabase/migrations/20260910160000_delete_own_account.sql for why that
 * needs a SECURITY DEFINER function rather than a service-role key. */
export async function deleteOwnAccount() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("Not authenticated");
  }

  const events = await listEvents(user.id);
  for (const event of events) {
    await deleteEvent(event.id, user.id);
  }

  const { error } = await supabase.rpc("delete_own_account");
  if (error) {
    throw new Error(error.message);
  }
}
