"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { deleteEvent } from "@/lib/events";
import { getEventType } from "@/lib/eventTypes";
import { parseContent, parseSections, SECTION_ORDER } from "@/components/sections/registry";
import type { Json } from "@/lib/supabase/database.types";
import { getTheme } from "@/lib/themes";
import { recommendedHeroVariantFor } from "@/lib/themes/recommendedHeroVariant";
import {
  recommendedCountdownVariantFor,
  recommendedGiftVariantFor,
  recommendedDressCodeVariantFor,
  recommendedGuestbookVariantFor,
  recommendedVideoVariantFor,
} from "@/lib/themes/recommendedSectionVariants";
import { HERO_VARIANTS, DEFAULT_HERO_VARIANT } from "@/components/sections/HeroSection";
import type { HeroVariant } from "@/components/sections/HeroSection";
import type { SectionConfig } from "@/components/sections/registry";

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

/** Hero's layout has no manual picker anymore (removed along with the old
 * per-section forms -- layout is theme-owned now, matching how it already
 * worked at event-creation time via `recommendedHeroVariantFor`). For that
 * to actually hold after a theme *change* too, not just at creation, this
 * must re-derive and re-apply the recommended variant for the new theme's
 * category here -- otherwise an event would keep whatever Hero layout it
 * was created with forever, silently mismatched with every theme switched
 * to afterward. */
export async function updateTheme(input: UpdateThemeInput) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  let heroVariant: HeroVariant = DEFAULT_HERO_VARIANT;
  let category;
  try {
    category = getTheme(input.themeId).category;
    const recommended = recommendedHeroVariantFor(input.themeId, category);
    if (HERO_VARIANTS.includes(recommended as HeroVariant)) {
      heroVariant = recommended as HeroVariant;
    }
  } catch {
    // Unknown theme id -- keep the default variant.
  }

  // Same reasoning as Hero above, extended to the 5 other section types that
  // lost their manual variant switcher in the same pass -- a section only
  // gets its variant re-derived if it's already configured (never created
  // here; these are opt-in, off-by-default sections, and creating one as a
  // side effect of a theme change would be a surprising, unrequested action).
  const RECOMMENDED_BY_TYPE: Partial<Record<SectionConfig["type"], (themeId: string) => string>> = category
    ? {
        countdown: (themeId) => recommendedCountdownVariantFor(themeId, category),
        gift: (themeId) => recommendedGiftVariantFor(themeId, category),
        dressCode: (themeId) => recommendedDressCodeVariantFor(themeId, category),
        guestbook: (themeId) => recommendedGuestbookVariantFor(themeId, category),
        video: (themeId) => recommendedVideoVariantFor(themeId, category),
      }
    : {};

  const { data: existingConfig } = await supabase
    .from("site_config")
    .select("sections")
    .eq("event_id", input.eventId)
    .maybeSingle();

  const existingSections = existingConfig ? parseSections(existingConfig.sections) : [];
  const sections: SectionConfig[] = existingSections.some((section) => section.type === "hero")
    ? existingSections.map((section) => (section.type === "hero" ? { ...section, variant: heroVariant } : section))
    : [{ type: "hero", variant: heroVariant, order: SECTION_ORDER.hero, enabled: true }, ...existingSections];
  const sectionsWithRecommendedVariants: SectionConfig[] = sections.map((section) => {
    const recommend = RECOMMENDED_BY_TYPE[section.type as SectionConfig["type"]];
    return recommend ? { ...section, variant: recommend(input.themeId) } : section;
  });

  const { error: configError } = existingConfig
    ? await supabase
        .from("site_config")
        .update({ theme_id: input.themeId, sections: sectionsWithRecommendedVariants as unknown as Json })
        .eq("event_id", input.eventId)
    : await supabase.from("site_config").insert({
        event_id: input.eventId,
        theme_id: input.themeId,
        sections: sectionsWithRecommendedVariants as unknown as Json,
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
  // this is the one place responsible for keeping that mirror in sync, whether
  // the edit came from this form or from SiteInlineEditor's inline name editing
  // (both call this action; neither writes content.hero.names directly).
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
