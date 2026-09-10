"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

/** Hashing happens entirely inside the `set_site_password` Postgres function
 * (see the site-password migration) -- the plaintext is never written to any
 * column here, only passed as an RPC argument. Regenerates the guest unlock
 * token too, so any previously-issued cookie stops working once the password
 * changes. */
export async function setSitePassword(eventId: string, password: string) {
  const trimmed = password.trim();
  if (!trimmed) {
    throw new Error("Enter a password");
  }
  // bcrypt (used by the DB function) ignores bytes past 72 -- reject well
  // before that rather than silently hashing a truncated password.
  if (trimmed.length > 60) {
    throw new Error("Password is too long");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("Not authenticated");
  }

  const { error } = await supabase.rpc("set_site_password", {
    p_event_id: eventId,
    p_password: trimmed,
  });
  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/dashboard/${eventId}/site`);
}

export async function disableSitePassword(eventId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("Not authenticated");
  }

  const { error } = await supabase
    .from("events")
    .update({ site_password_enabled: false })
    .eq("id", eventId)
    .eq("owner_id", user.id);
  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/dashboard/${eventId}/site`);
}
