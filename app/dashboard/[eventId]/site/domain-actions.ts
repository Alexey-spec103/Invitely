"use server";

import { resolveTxt } from "node:dns/promises";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { planMeets } from "@/lib/plans";

const DOMAIN_PATTERN = /^(?!-)[a-z0-9-]{1,63}(?<!-)(\.(?!-)[a-z0-9-]{1,63}(?<!-))+$/i;

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

  const { error } = await supabase
    .from("events")
    .update({
      custom_domain: domain,
      custom_domain_verification_token: crypto.randomUUID(),
      custom_domain_verified_at: null,
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

  const { error: updateError } = await supabase
    .from("events")
    .update({ custom_domain_verified_at: new Date().toISOString() })
    .eq("id", input.eventId);

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

  const { error } = await supabase
    .from("events")
    .update({
      custom_domain: null,
      custom_domain_verification_token: null,
      custom_domain_verified_at: null,
    })
    .eq("id", input.eventId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/dashboard/${input.eventId}/site`);
}
