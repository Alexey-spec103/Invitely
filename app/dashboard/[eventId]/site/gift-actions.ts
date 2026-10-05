"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

/** A host typing "amazon.com/registry" (no protocol) into a plain `z.string()`
 * field used to save exactly that -- rendered as `<a href="amazon.com/registry">`
 * on the public site, the browser resolves it as a path relative to the
 * current page instead of an external link, landing the guest on a 404 on
 * invimbo.com's own domain. Prepending `https://` when no scheme is present
 * is more forgiving than rejecting the input outright for a non-technical
 * host who doesn't know why "amazon.com/registry" would be "invalid". */
function normalizeUrl(url: string | undefined): string | null {
  const trimmed = url?.trim();
  if (!trimmed) return null;
  return /^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

interface AddGiftPreferenceInput {
  eventId: string;
  title: string;
  type: string;
  url?: string;
  imageUrl?: string;
  description?: string;
}

export async function addGiftPreference(input: AddGiftPreferenceInput) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  const { count } = await supabase
    .from("gift_preferences")
    .select("*", { count: "exact", head: true })
    .eq("event_id", input.eventId);

  const { error } = await supabase.from("gift_preferences").insert({
    event_id: input.eventId,
    title: input.title,
    type: input.type,
    url: normalizeUrl(input.url),
    image_url: normalizeUrl(input.imageUrl),
    description: input.description || null,
    order_index: count ?? 0,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/dashboard/${input.eventId}/site`);
}

interface UpdateGiftPreferenceInput {
  giftId: string;
  title: string;
  type: string;
  url?: string;
  imageUrl?: string;
  description?: string;
}

export async function updateGiftPreference(input: UpdateGiftPreferenceInput) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  const { error } = await supabase
    .from("gift_preferences")
    .update({
      title: input.title,
      type: input.type,
      url: normalizeUrl(input.url),
      image_url: normalizeUrl(input.imageUrl),
      description: input.description || null,
    })
    .eq("id", input.giftId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard", "layout");
}

export async function deleteGiftPreference(giftId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  const { error } = await supabase.from("gift_preferences").delete().eq("id", giftId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard", "layout");
}
