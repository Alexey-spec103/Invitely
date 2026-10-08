"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { parseSections, parseContent } from "@/components/sections/registry";
import type { Json } from "@/lib/supabase/database.types";
import type { CanvasFrame } from "@/lib/canvas/types";
import { DEFAULT_THEME_ID } from "@/lib/themes";

async function patchInvitationsContent(
  eventId: string,
  patch: Record<string, unknown>
): Promise<{ ok: true } | { ok: false; message: string }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, message: "Not authenticated" };
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
    return { ok: false, message: configError.message };
  }

  revalidatePath(`/dashboard/${eventId}/paper`);
  revalidatePath(`/dashboard/${eventId}/invitations`);
  return { ok: true };
}

export async function updateInvitationBackCanvas(input: {
  eventId: string;
  frame: CanvasFrame;
}): Promise<{ ok: true } | { ok: false; message: string }> {
  return patchInvitationsContent(input.eventId, { backCanvas: input.frame as unknown as Json });
}

export async function updateInvitationFrontCanvas(input: {
  eventId: string;
  frame: CanvasFrame;
}): Promise<{ ok: true } | { ok: false; message: string }> {
  return patchInvitationsContent(input.eventId, { frontCanvas: input.frame as unknown as Json });
}

/** Clears a saved front-canvas design, returning the card to its original
 * static (names/date/venue-from-Site-tab) preview -- the "Revert to
 * default" control. `null` (not omitting the key) is what actually erases
 * it: patchInvitationsContent only ever merges keys in, so leaving
 * `frontCanvas` out of the patch would keep the old saved value. */
export async function clearInvitationFrontCanvas(
  eventId: string
): Promise<{ ok: true } | { ok: false; message: string }> {
  return patchInvitationsContent(eventId, { frontCanvas: null });
}

export async function updateInvitationEnvelopeCanvas(input: {
  eventId: string;
  frame: CanvasFrame;
}): Promise<{ ok: true } | { ok: false; message: string }> {
  return patchInvitationsContent(input.eventId, { envelopeCanvas: input.frame as unknown as Json });
}

export async function updateInvitationProgramCanvas(input: {
  eventId: string;
  frame: CanvasFrame;
}): Promise<{ ok: true } | { ok: false; message: string }> {
  return patchInvitationsContent(input.eventId, { programCanvas: input.frame as unknown as Json });
}

export async function updateInvitationDressCodeCanvas(input: {
  eventId: string;
  frame: CanvasFrame;
}): Promise<{ ok: true } | { ok: false; message: string }> {
  return patchInvitationsContent(input.eventId, { dressCodeCanvas: input.frame as unknown as Json });
}

export async function updateInvitationSaveTheDateCanvas(input: {
  eventId: string;
  frame: CanvasFrame;
}): Promise<{ ok: true } | { ok: false; message: string }> {
  return patchInvitationsContent(input.eventId, { saveTheDateCanvas: input.frame as unknown as Json });
}

export async function updateInvitationThankYouCanvas(input: {
  eventId: string;
  frame: CanvasFrame;
}): Promise<{ ok: true } | { ok: false; message: string }> {
  return patchInvitationsContent(input.eventId, { thankYouCanvas: input.frame as unknown as Json });
}
