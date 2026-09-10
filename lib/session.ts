import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export const getAuthedUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});

/** For Server Actions gating something that specifically requires a real
 * (non-anonymous) account -- publishing, changing plan/billing. Plain
 * (uncached) `supabase.auth.getUser()` call, matching how Server Actions in
 * this codebase already check auth inline rather than via `getAuthedUser`
 * (which is `cache()`-wrapped for Server Component dedup, not meant for
 * Server Actions). An anonymous Supabase session is a real, authenticated
 * session (RLS treats it identically to a real account) -- this is the one
 * place that draws the extra distinction. */
export async function requireRealUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("Not authenticated");
  }
  if (user.is_anonymous) {
    throw new Error("Create a free account to continue");
  }
  return user;
}
