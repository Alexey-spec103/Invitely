import { NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import * as Sentry from "@sentry/nextjs";
import type { Database } from "@/lib/supabase/database.types";

/** Launch-readiness audit (2026-10-27): an external uptime monitor needs
 * something to ping that actually proves the app can talk to its database,
 * not just that Next.js itself is up (a server that's up but can't reach
 * Supabase is just as dead to a real guest trying to RSVP). Deliberately
 * the anon key, not `lib/supabase/service.ts`'s service-role client -- that
 * client's own comment is explicit that it must never sit behind a code
 * path a browser (or, here, any external pinger) can reach unauthenticated.
 * No cookies/session needed -- this never reads or writes on behalf of a
 * particular visitor, so the cookie-aware `lib/supabase/server.ts` client
 * would just be dead weight. */
export async function GET() {
  try {
    const supabase = createSupabaseClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );
    const { error } = await supabase.from("events").select("id").limit(1);
    if (error) throw error;
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error("healthcheck: database query failed", error);
    Sentry.captureException(error);
    // Generic message only -- never echo the real Postgres/Supabase error
    // text back to an unauthenticated caller.
    return NextResponse.json({ ok: false, error: "unavailable" }, { status: 503 });
  }
}
