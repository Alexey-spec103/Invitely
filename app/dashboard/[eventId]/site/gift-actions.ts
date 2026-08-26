"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

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

  const { count } = await supabase
    .from("gift_preferences")
    .select("*", { count: "exact", head: true })
    .eq("event_id", input.eventId);

  const { error } = await supabase.from("gift_preferences").insert({
    event_id: input.eventId,
    title: input.title,
    type: input.type,
    url: input.url || null,
    image_url: input.imageUrl || null,
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

  const { error } = await supabase
    .from("gift_preferences")
    .update({
      title: input.title,
      type: input.type,
      url: input.url || null,
      image_url: input.imageUrl || null,
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

  const { error } = await supabase.from("gift_preferences").delete().eq("id", giftId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard", "layout");
}
