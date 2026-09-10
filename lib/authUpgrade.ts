"use client";

import { createClient } from "@/lib/supabase/client";

export interface UpgradeResult {
  /** True if email confirmation is still needed (`is_anonymous` stayed
   * true right after the call) -- false if this project doesn't require
   * confirmation and the account is already fully real. */
  pendingConfirmation: boolean;
}

/** Converts the *current* anonymous session into a real email/password
 * account in place -- same `auth.uid()`, so every row already created under
 * it (events, site_config, ...) stays exactly where it is. This is
 * Supabase's documented anonymous-to-permanent path for password auth
 * (`updateUser`, not `linkIdentity`, which is for OAuth providers). */
export async function upgradeAnonymousAccount(email: string, password: string): Promise<UpgradeResult> {
  const supabase = createClient();
  const { data, error } = await supabase.auth.updateUser(
    { email, password },
    { emailRedirectTo: `${window.location.origin}/dashboard` }
  );
  if (error) {
    throw error;
  }
  return { pendingConfirmation: data.user?.is_anonymous === true };
}
