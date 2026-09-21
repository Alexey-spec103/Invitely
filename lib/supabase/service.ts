import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

/**
 * Service-role client -- bypasses RLS entirely. This project deliberately
 * has no service-role key anywhere else (every other write goes through a
 * real user session + RLS, or a `SECURITY DEFINER` Postgres function scoped
 * to `auth.uid()`); see the account-deletion and anonymous-trial plans for
 * why that was preferred. The Stripe webhook is the one genuine exception:
 * Stripe calls it server-to-server with no user session at all, so there's
 * no `auth.uid()` to scope a `SECURITY DEFINER` function to, and the
 * `events.plan_id` write has to happen on behalf of whichever event paid --
 * not the caller (there is no caller). Safe only because this client is
 * never constructed outside the webhook Route Handler, which independently
 * verifies the Stripe signature (`stripe.webhooks.constructEvent`) before
 * ever calling this -- unlike an RLS policy or anon-callable RPC, nothing
 * about this client's own access checks that the caller is legitimate, so
 * never expose it to a code path a browser can reach directly.
 */
export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not configured");
  }
  return createSupabaseClient<Database>(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
