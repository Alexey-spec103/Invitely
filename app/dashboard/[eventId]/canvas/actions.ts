"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { CanvasFrame } from "@/lib/canvas/types";
import type { Json } from "@/lib/supabase/database.types";

export async function saveCanvasFrames(
  eventId: string,
  frames: CanvasFrame[]
): Promise<{ ok: true } | { ok: false; message: string }> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("site_config")
    .update({ canvas: frames as unknown as Json })
    .eq("event_id", eventId);

  if (error) {
    return { ok: false, message: error.message };
  }

  revalidatePath(`/dashboard/${eventId}/canvas`);
  revalidatePath("/e/[slug]", "page");
  return { ok: true };
}

export async function setLayoutMode(eventId: string, mode: "structured" | "canvas") {
  const supabase = await createClient();

  const { error } = await supabase
    .from("site_config")
    .update({ layout_mode: mode })
    .eq("event_id", eventId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/dashboard/${eventId}/canvas`);
  revalidatePath("/e/[slug]", "page");
}
