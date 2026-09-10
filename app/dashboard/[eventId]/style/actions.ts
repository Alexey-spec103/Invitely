"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

/** dashboard-audit.md B11: weddingpost.ru's "Слоты стилей" -- a few
 * candidate themes a host can hold onto alongside the active one and switch
 * between, not an unbounded list (their own screenshot shows just one spare
 * "+" slot). Matches theme_slots' own scope: it only ever holds the *extra*
 * candidates, never the active theme itself (that stays site_config.theme_id,
 * the single source of truth switching it already goes through updateTheme). */
const MAX_EXTRA_SLOTS = 3;

interface AddThemeSlotInput {
  eventId: string;
  themeId: string;
}

export async function addThemeSlot(input: AddThemeSlotInput) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  const [{ data: siteConfig }, { data: existingSlots, error: fetchError }] = await Promise.all([
    supabase.from("site_config").select("theme_id").eq("event_id", input.eventId).maybeSingle(),
    supabase.from("theme_slots").select("id, theme_id").eq("event_id", input.eventId),
  ]);

  if (fetchError) {
    throw new Error(fetchError.message);
  }

  // Already the active theme, or already saved as a slot -- nothing to add.
  if (siteConfig?.theme_id === input.themeId || existingSlots?.some((slot) => slot.theme_id === input.themeId)) {
    return;
  }

  if ((existingSlots?.length ?? 0) >= MAX_EXTRA_SLOTS) {
    throw new Error(`You can only hold ${MAX_EXTRA_SLOTS} extra design slots at a time -- remove one first.`);
  }

  const { error: insertError } = await supabase
    .from("theme_slots")
    .insert({ event_id: input.eventId, theme_id: input.themeId });

  if (insertError) {
    throw new Error(insertError.message);
  }

  revalidatePath(`/dashboard/${input.eventId}/style`);
}

interface RemoveThemeSlotInput {
  eventId: string;
  slotId: string;
}

export async function removeThemeSlot(input: RemoveThemeSlotInput) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  const { error } = await supabase
    .from("theme_slots")
    .delete()
    .eq("id", input.slotId)
    .eq("event_id", input.eventId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/dashboard/${input.eventId}/style`);
}
