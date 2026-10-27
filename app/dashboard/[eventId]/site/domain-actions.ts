"use server";

import { resolveTxt } from "node:dns/promises";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { planMeets } from "@/lib/plans";
import { sendEmail } from "@/lib/email";
import { getDictionary } from "@/lib/i18n/dictionary";
import { resolveEmailLocale } from "@/lib/i18n/locales";

const DOMAIN_PATTERN = /^(?!-)[a-z0-9-]{1,63}(?<!-)(\.(?!-)[a-z0-9-]{1,63}(?<!-))+$/i;
const SUBDOMAIN_PATTERN = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;

/** The domain this project itself is reachable on -- same env var
 * resolveCustomDomain (lib/supabase/proxy.ts) reads to tell "someone else's
 * domain" apart from "our own." Falls back to the real production domain
 * rather than throwing when unset (e.g. local dev, which never routes
 * subdomains anyway) so the claim form can still render a realistic preview. */
function appDomain(): string {
  return process.env.NEXT_PUBLIC_APP_DOMAIN ?? "invimbo.com";
}

/** Thin wrappers around the two locked-column RPCs (see
 * 20261012120000_lock_custom_domain_verified_at.sql), used by every
 * function below that touches custom_domain_verified_at. Centralizing
 * the error-handling here isn't just DRY -- it's what makes the
 * fail-closed call ordering below safe to reason about: every call site
 * raises the same way, so "RPC first, plain update second" behaves
 * identically everywhere it's used. */
async function markCustomDomainVerified(
  supabase: Awaited<ReturnType<typeof createClient>>,
  eventId: string
): Promise<void> {
  const { error } = await supabase.rpc("mark_custom_domain_verified", { p_event_id: eventId });
  if (error) {
    throw new Error(error.message);
  }
}

async function clearCustomDomainVerification(
  supabase: Awaited<ReturnType<typeof createClient>>,
  eventId: string
): Promise<void> {
  const { error } = await supabase.rpc("clear_custom_domain_verification", { p_event_id: eventId });
  if (error) {
    throw new Error(error.message);
  }
}

interface ClaimInvimboSubdomainInput {
  eventId: string;
  subdomain: string;
}

/** The recommended, no-external-purchase-needed "custom domain": a free
 * subdomain on invimbo.com itself (e.g. claire-and-nathaniel.invimbo.com),
 * auto-suggested from the couple's names but editable. Reuses the exact same
 * `custom_domain`/`custom_domain_verified_at` columns and routing
 * (resolveCustomDomain) as bring-your-own-domain below -- the only
 * difference is there's no external ownership to prove (we already own
 * invimbo.com), so this verifies itself immediately instead of waiting on a
 * DNS TXT record. Still gated to Basic+ up front (matching
 * checkDomainVerification's own gate) so a host on Free gets a clear reason
 * instead of claiming an address that silently won't route yet
 * (resolveCustomDomain re-checks the plan live on every request regardless). */
export async function claimInvimboSubdomain(input: ClaimInvimboSubdomainInput): Promise<string> {
  const subdomain = input.subdomain.trim().toLowerCase();
  if (!SUBDOMAIN_PATTERN.test(subdomain)) {
    throw new Error("Use lowercase letters, numbers, and hyphens only, e.g. claire-and-nathaniel");
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  // Pre-launch security pass (2026-10-27): same missing owner_id check as
  // checkDomainVerification below -- RLS's own update policy is correctly
  // owner-scoped (confirmed: "Owners can update their own events" requires
  // owner_id = auth.uid() on both USING and WITH CHECK, so the writes later
  // in this function can't actually land on someone else's row even
  // without this filter), but this SELECT alone could still read another
  // host's plan_id/title/default_locale if their event is published (the
  // public-read policy allows that by design, for the guest site). No
  // reason this read shouldn't already be scoped the same way the write is.
  const { data: event, error: eventError } = await supabase
    .from("events")
    .select("plan_id, title, default_locale")
    .eq("id", input.eventId)
    .eq("owner_id", user.id)
    .single();

  if (eventError || !event) {
    throw new Error(eventError?.message ?? "Event not found");
  }

  if (!planMeets(event.plan_id, "basic")) {
    throw new Error("A free invimbo.com address is a Basic-plan feature or above.");
  }

  const hostname = `${subdomain}.${appDomain()}`;

  const { data: taken } = await supabase
    .from("events")
    .select("id")
    .eq("custom_domain", hostname)
    .neq("id", input.eventId)
    .maybeSingle();

  if (taken) {
    throw new Error("That address is already taken - try another.");
  }

  // code-review (2026-10-12): custom_domain/custom_domain_verified_at used
  // to be one atomic .update() -- splitting the verified-at write into its
  // own locked-column RPC (above) turned this into multiple network calls,
  // which opens a partial-failure window if the call order isn't
  // deliberate. Clearing verified_at FIRST, before touching custom_domain
  // at all, means every possible failure point leaves this row
  // fail-closed (unverified) rather than fail-open (a stale verified_at
  // surviving onto a hostname it was never actually checked against):
  // fails here -> nothing changed yet; fails on the update below -> old
  // hostname, already unverified; fails on the final mark-verified call ->
  // new hostname, correctly unverified and safe to retry.
  await clearCustomDomainVerification(supabase, input.eventId);

  const { error } = await supabase
    .from("events")
    .update({
      custom_domain: hostname,
      custom_domain_verification_token: null,
    })
    .eq("id", input.eventId);

  if (error) {
    throw new Error(error.message);
  }

  // custom_domain_verified_at is the one column lib/supabase/proxy.ts trusts
  // as proof of ownership for routing -- it's locked against direct writes
  // from this (authenticated, not service-role) client (security-review,
  // 2026-10-12; see 20261012120000_lock_custom_domain_verified_at.sql) and
  // can only be set through this ownership-checked RPC. Legitimate here with
  // no DNS proof needed: this is a free invimbo.com subdomain, which we
  // already own outright.
  await markCustomDomainVerified(supabase, input.eventId);

  revalidatePath(`/dashboard/${input.eventId}/site`);

  // Best-effort confirmation email -- direct feedback: a host should get an
  // immediate, real confirmation of their new address, not just a UI toast
  // that's gone the moment they close the tab. Never blocks the claim
  // itself on the email succeeding.
  try {
    if (user.email) {
      const t = getDictionary(resolveEmailLocale(event.default_locale)).email;
      await sendEmail({
        to: user.email,
        subject: t.domainLive.subject(hostname),
        html: [t.domainLive.liveAt(hostname), t.domainLive.includedNote, t.domainLive.questionsNote].join("\n"),
      });
    }
  } catch (emailError) {
    console.error("claimInvimboSubdomain confirmation email failed", emailError);
  }

  return hostname;
}

interface RequestDomainVerificationInput {
  eventId: string;
  domain: string;
}

export async function requestDomainVerification(input: RequestDomainVerificationInput) {
  const domain = input.domain.trim().toLowerCase();

  if (!DOMAIN_PATTERN.test(domain)) {
    throw new Error("Enter a valid domain, e.g. yoursite.com");
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  // code-review (2026-10-12): cleared BEFORE the domain itself changes, not
  // after -- a fresh domain has no proof behind it yet regardless of
  // whether the previous one did, and clearing first means a failure on
  // the update below just leaves the OLD domain unverified (safe,
  // retryable) instead of leaving the NEW domain carrying a stale
  // verified_at it was never actually checked against (see
  // claimInvimboSubdomain for the full reasoning -- same fail-closed
  // ordering, applied here too).
  await clearCustomDomainVerification(supabase, input.eventId);

  const { error } = await supabase
    .from("events")
    .update({
      custom_domain: domain,
      custom_domain_verification_token: crypto.randomUUID(),
    })
    .eq("id", input.eventId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/dashboard/${input.eventId}/site`);
}

interface CheckDomainVerificationInput {
  eventId: string;
}

export async function checkDomainVerification(input: CheckDomainVerificationInput) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  // Pre-launch security pass (2026-10-27): this query had no owner_id
  // check at all, relying entirely on RLS -- harmless for a draft event
  // (RLS has no policy letting anyone but the owner read a draft row), but
  // for a PUBLISHED event the "public can read published events" policy
  // lets it through for ANY authenticated caller, not just this event's
  // owner. Fixed by adding the owner_id filter here; custom_domain_
  // verification_token itself is no longer selectable via this plain
  // query at all now (authenticated's own column grant excludes it as of
  // 20261027130000) -- fetched below through a SECURITY DEFINER RPC that
  // checks ownership internally instead, same pattern as
  // check_site_unlock_token.
  const { data: event, error } = await supabase
    .from("events")
    .select("custom_domain, plan_id")
    .eq("id", input.eventId)
    .eq("owner_id", user.id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  if (!event.custom_domain) {
    throw new Error("Set a domain first.");
  }

  const { data: verificationToken, error: tokenError } = await supabase.rpc(
    "get_own_domain_verification_token",
    { p_event_id: input.eventId }
  );

  if (tokenError) {
    throw new Error(tokenError.message);
  }

  if (!verificationToken) {
    throw new Error("Set a domain first.");
  }

  // dashboard-audit.md Block E part 2: checking the TXT record is the step
  // that actually marks the domain verified/live -- setting a domain and
  // seeing the instructions above stays free on every plan.
  if (!planMeets(event.plan_id, "basic")) {
    throw new Error("Verifying is free to try, but a domain only goes live on the Basic plan or above.");
  }

  let records: string[][];
  try {
    records = await resolveTxt(`_invitely-verify.${event.custom_domain}`);
  } catch {
    throw new Error("No TXT record found yet. DNS changes can take a few minutes to propagate.");
  }

  const matches = records.some((chunks) => chunks.join("") === verificationToken);

  if (!matches) {
    throw new Error("TXT record found, but the value doesn't match. Double-check what you pasted.");
  }

  // The real verification is the resolveTxt() call above, which only this
  // trusted server code can perform -- this RPC just records that it
  // succeeded. It can't be skipped to fake a verification: the column
  // itself is locked against direct writes from this client (see
  // claimInvimboSubdomain for the full reasoning). Single call, no
  // custom_domain write alongside it in this function -- no ordering
  // concern here the way the other three functions have.
  await markCustomDomainVerified(supabase, input.eventId);

  revalidatePath(`/dashboard/${input.eventId}/site`);
}

interface ClearDomainVerificationInput {
  eventId: string;
}

export async function clearDomainVerification(input: ClearDomainVerificationInput) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  // Cleared first -- same fail-closed ordering as the other three
  // functions above (see claimInvimboSubdomain for the full reasoning).
  await clearCustomDomainVerification(supabase, input.eventId);

  const { error } = await supabase
    .from("events")
    .update({
      custom_domain: null,
      custom_domain_verification_token: null,
    })
    .eq("id", input.eventId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/dashboard/${input.eventId}/site`);
}
