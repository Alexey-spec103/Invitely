"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { seedHeroFrame } from "@/lib/canvas/seed";
import type { Json } from "@/lib/supabase/database.types";

/** Phase 7a proof-of-concept only: seeds the current owner's event with the
 * hand-built seed frame and flips it into canvas layout mode, so the new
 * CanvasRenderer pipeline can be verified end-to-end before any editor UI
 * exists. Mirrors the dev-only convention already established by
 * app/dev/themes/page.tsx. */
export async function applyCanvasSeed(eventId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("site_config")
    .update({
      layout_mode: "canvas",
      canvas: [seedHeroFrame] as unknown as Json,
    })
    .eq("event_id", eventId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/e/[slug]", "page");
}

export async function revertToStructured(eventId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("site_config")
    .update({ layout_mode: "structured" })
    .eq("event_id", eventId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/e/[slug]", "page");
}
