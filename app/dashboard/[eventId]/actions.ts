"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { deleteEvent } from "@/lib/events";
import { getEventType } from "@/lib/eventTypes";
import { parseContent } from "@/components/sections/registry";
import type { Json } from "@/lib/supabase/database.types";

export async function togglePublish(eventId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  const { data: existingEvent, error: fetchError } = await supabase
    .from("events")
    .select("status")
    .eq("id", eventId)
    .eq("owner_id", user.id)
    .single();

  if (fetchError || !existingEvent) {
    throw new Error(fetchError?.message ?? "Event not found");
  }

  const nextStatus = existingEvent.status === "published" ? "draft" : "published";

  const { error: updateError } = await supabase
    .from("events")
    .update({ status: nextStatus })
    .eq("id", eventId)
    .eq("owner_id", user.id);

  if (updateError) {
    throw new Error(updateError.message);
  }

  revalidatePath(`/dashboard/${eventId}`, "layout");
}

interface UpdateThemeInput {
  eventId: string;
  themeId: string;
}

export async function updateTheme(input: UpdateThemeInput) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  const { data: existingConfig } = await supabase
    .from("site_config")
    .select("id")
    .eq("event_id", input.eventId)
    .maybeSingle();

  const { error: configError } = existingConfig
    ? await supabase
        .from("site_config")
        .update({ theme_id: input.themeId })
        .eq("event_id", input.eventId)
    : await supabase.from("site_config").insert({
        event_id: input.eventId,
        theme_id: input.themeId,
        sections: [],
        content: {},
      });

  if (configError) {
    throw new Error(configError.message);
  }

  revalidatePath(`/dashboard/${input.eventId}`);
}

interface UpdateWeddingDataInput {
  eventId: string;
  eventType: string;
  name1: string;
  name2?: string;
  eventDate: string;
  venueName?: string;
  venueCity?: string;
  venueAddress?: string;
}

export async function updateWeddingData(input: UpdateWeddingDataInput) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  const type = getEventType(input.eventType);
  const names = type.namesMode === "couple" ? [input.name1, input.name2 ?? ""] : [input.name1];
  const title = type.titleTemplate(names);

  const { error } = await supabase
    .from("events")
    .update({
      title,
      subtitle_names: names,
      event_date: input.eventDate,
      venue_name: input.venueName || null,
      venue_city: input.venueCity || null,
      venue_address: input.venueAddress || null,
    })
    .eq("id", input.eventId)
    .eq("owner_id", user.id);

  if (error) {
    throw new Error(error.message);
  }

  // The public site's hero section reads names/date from site_config.content.hero,
  // not from the events row directly (see components/sections/registry.tsx) --
  // this used to be kept in sync by HeroEditForm's own save. Now that names/date
  // are edited here instead, this is the one place responsible for that mirror.
  const { data: existingConfig } = await supabase
    .from("site_config")
    .select("content")
    .eq("event_id", input.eventId)
    .maybeSingle();

  if (existingConfig) {
    const existingContent = parseContent(existingConfig.content);
    const existingHero =
      typeof existingContent.hero === "object" && existingContent.hero !== null
        ? (existingContent.hero as Record<string, unknown>)
        : {};

    const { error: contentError } = await supabase
      .from("site_config")
      .update({
        content: {
          ...existingContent,
          hero: { ...existingHero, names, eventDate: input.eventDate },
        } as unknown as Json,
      })
      .eq("event_id", input.eventId);

    if (contentError) {
      throw new Error(contentError.message);
    }
  }

  revalidatePath(`/dashboard/${input.eventId}`, "layout");
}

export async function deleteEventAction(eventId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  await deleteEvent(eventId, user.id);

  redirect("/dashboard");
}
