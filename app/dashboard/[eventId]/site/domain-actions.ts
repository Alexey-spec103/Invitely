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

  const { data: event, error: eventError } = await supabase
    .from("events")
    .select("plan_id, title, default_locale")
    .eq("id", input.eventId)
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
    throw new Error("That address is already taken — try another.");
  }

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
  const { error: verifyError } = await supabase.rpc("mark_custom_domain_verified", {
    p_event_id: input.eventId,
  });
  if (verifyError) {
    throw new Error(verifyError.message);
  }

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

  // Resets verified_at for the new domain via the same locked-column RPC
  // used everywhere else this column changes (see claimInvimboSubdomain) --
  // a fresh domain has no proof behind it yet, regardless of whether the
  // previous one did.
  const { error: clearError } = await supabase.rpc("clear_custom_domain_verification", {
    p_event_id: input.eventId,
  });
  if (clearError) {
    throw new Error(clearError.message);
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

  const { data: event, error } = await supabase
    .from("events")
    .select("custom_domain, custom_domain_verification_token, plan_id")
    .eq("id", input.eventId)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  if (!event.custom_domain || !event.custom_domain_verification_token) {
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

  const matches = records.some((chunks) => chunks.join("") === event.custom_domain_verification_token);

  if (!matches) {
    throw new Error("TXT record found, but the value doesn't match. Double-check what you pasted.");
  }

  // The real verification is the resolveTxt() call above, which only this
  // trusted server code can perform -- this RPC just records that it
  // succeeded. It can't be skipped to fake a verification: the column
  // itself is locked against direct writes from this client (see
  // claimInvimboSubdomain for the full reasoning).
  const { error: updateError } = await supabase.rpc("mark_custom_domain_verified", {
    p_event_id: input.eventId,
  });

  if (updateError) {
    throw new Error(updateError.message);
  }

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

  const { error: clearError } = await supabase.rpc("clear_custom_domain_verification", {
    p_event_id: input.eventId,
  });
  if (clearError) {
    throw new Error(clearError.message);
  }

  revalidatePath(`/dashboard/${input.eventId}/site`);
}
