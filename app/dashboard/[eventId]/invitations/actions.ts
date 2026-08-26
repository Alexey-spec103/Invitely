"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { parseSections, parseContent } from "@/components/sections/registry";
import type { Json } from "@/lib/supabase/database.types";
import { DEFAULT_THEME_ID } from "@/lib/themes";

interface UpdateInvitationBackMessageInput {
  eventId: string;
  backMessage: string;
}

export async function updateInvitationBackMessage(input: UpdateInvitationBackMessageInput) {
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
    .eq("event_id", input.eventId)
    .maybeSingle();

  const existingSections = existingConfig ? parseSections(existingConfig.sections) : [];
  const existingContent = existingConfig ? parseContent(existingConfig.content) : {};

  const content = {
    ...existingContent,
    invitations: {
      backMessage: input.backMessage || undefined,
    },
  };

  const { error: configError } = existingConfig
    ? await supabase
        .from("site_config")
        .update({ content: content as unknown as Json })
        .eq("event_id", input.eventId)
    : await supabase.from("site_config").insert({
        event_id: input.eventId,
        theme_id: DEFAULT_THEME_ID,
        sections: existingSections as unknown as Json,
        content: content as unknown as Json,
      });

  if (configError) {
    throw new Error(configError.message);
  }

  revalidatePath(`/dashboard/${input.eventId}/invitations`);
}
