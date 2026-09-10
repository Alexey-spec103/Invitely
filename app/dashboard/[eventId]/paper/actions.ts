"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { parseSections, parseContent } from "@/components/sections/registry";
import type { Json } from "@/lib/supabase/database.types";
import type { CanvasFrame } from "@/lib/canvas/types";
import { DEFAULT_THEME_ID } from "@/lib/themes";

async function patchInvitationsContent(eventId: string, patch: Record<string, unknown>) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  const { data: existingConfig } = await supabase
    .from("site_config")
    .select("*")
    .eq("event_id", eventId)
    .maybeSingle();

  const existingSections = existingConfig ? parseSections(existingConfig.sections) : [];
  const existingContent = existingConfig ? parseContent(existingConfig.content) : {};
  const existingInvitations =
    typeof existingContent.invitations === "object" && existingContent.invitations !== null
      ? (existingContent.invitations as Record<string, unknown>)
      : {};

  const content = {
    ...existingContent,
    invitations: { ...existingInvitations, ...patch },
  };

  const { error: configError } = existingConfig
    ? await supabase
        .from("site_config")
        .update({ content: content as unknown as Json })
        .eq("event_id", eventId)
    : await supabase.from("site_config").insert({
        event_id: eventId,
        theme_id: DEFAULT_THEME_ID,
        sections: existingSections as unknown as Json,
        content: content as unknown as Json,
      });

  if (configError) {
    throw new Error(configError.message);
  }

  revalidatePath(`/dashboard/${eventId}/paper`);
  revalidatePath(`/dashboard/${eventId}/invitations`);
}

export async function updateInvitationBackCanvas(input: { eventId: string; frame: CanvasFrame }) {
  await patchInvitationsContent(input.eventId, { backCanvas: input.frame as unknown as Json });
}
