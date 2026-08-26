import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { DEFAULT_THEME_ID, getTheme } from "@/lib/themes";
import { recommendedHeroVariantFor } from "@/lib/themes/recommendedHeroVariant";
import { DEFAULT_HERO_VARIANT, HERO_VARIANTS } from "@/components/sections/HeroSection";
import type { HeroVariant } from "@/components/sections/HeroSection";
import type { Json } from "@/lib/supabase/database.types";

const COMBINING_DIACRITICS = /[̀-ͯ]/g;

function slugifyName(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(COMBINING_DIACRITICS, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Slugifies the event's composed title, keeping the existing "anna-and-peter"
 * shape for couple-style titles (joined with " & ") while working sensibly
 * for any other title too (e.g. "Sarah's 30th Birthday" -> "sarahs-30th-birthday"). */
function baseSlug(title: string): string {
  const normalized = title.replace(/\s*&\s*/g, "-and-");
  const slug = slugifyName(normalized);
  return slug || crypto.randomUUID().slice(0, 8);
}

export const getEvent = cache(async (userId: string) => {
  const supabase = await createClient();

  const { data: existingEvents } = await supabase
    .from("events")
    .select("*")
    .eq("owner_id", userId)
    .order("updated_at", { ascending: false })
    .limit(1);

  return existingEvents?.[0] ?? null;
});

export async function listEvents(userId: string) {
  const supabase = await createClient();

  const { data } = await supabase
    .from("events")
    .select("*")
    .eq("owner_id", userId)
    .order("updated_at", { ascending: false });

  return data ?? [];
}

export async function getEventById(eventId: string, userId: string) {
  const supabase = await createClient();

  const { data } = await supabase
    .from("events")
    .select("*")
    .eq("id", eventId)
    .eq("owner_id", userId)
    .maybeSingle();

  return data ?? null;
}

interface CreateEventInput {
  eventType: string;
  names: string[];
  title: string;
  eventDate: string;
  themeId?: string;
  photoUrl?: string;
}

export async function createEvent(userId: string, input: CreateEventInput) {
  const supabase = await createClient();
  const base = baseSlug(input.title);

  let newEvent = null;
  for (let attempt = 0; attempt < 20; attempt++) {
    const slug = attempt === 0 ? base : `${base}-${attempt + 1}`;

    const { data, error: insertError } = await supabase
      .from("events")
      .insert({
        owner_id: userId,
        slug,
        event_type: input.eventType,
        title: input.title,
        subtitle_names: input.names,
        event_date: input.eventDate,
        status: "draft",
      })
      .select("*")
      .single();

    if (!insertError) {
      newEvent = data;
      break;
    }

    // Only a slug collision (with some other event) can throw 23505 now that
    // events can no longer collide on owner_id -- retry with a numbered suffix.
    if (insertError.code !== "23505") {
      throw new Error(insertError.message);
    }
  }

  if (!newEvent) {
    throw new Error("Could not create a unique event link. Please try again.");
  }

  const themeId = input.themeId || DEFAULT_THEME_ID;
  // Every theme gets an archetype-appropriate default Hero layout instead
  // of all 100 themes starting from the same "monogram-center" composition
  // -- validated against HERO_VARIANTS since recommendedHeroVariantFor
  // returns a plain string, not a statically-checked HeroVariant.
  let heroVariant: HeroVariant = DEFAULT_HERO_VARIANT;
  try {
    const recommended = recommendedHeroVariantFor(themeId, getTheme(themeId).category);
    if (HERO_VARIANTS.includes(recommended as HeroVariant)) {
      heroVariant = recommended as HeroVariant;
    }
  } catch {
    // Unknown theme id -- keep the default variant.
  }

  const { error: configError } = await supabase.from("site_config").insert({
    event_id: newEvent.id,
    theme_id: themeId,
    sections: [
      { type: "hero", variant: heroVariant, order: 0, enabled: true },
    ] as unknown as Json,
    content: {
      hero: {
        names: input.names,
        eventDate: input.eventDate,
        photoUrl: input.photoUrl ?? "",
      },
    } as unknown as Json,
  });

  if (configError) {
    throw new Error(configError.message);
  }

  return newEvent;
}

/** Explicitly clears every table that references this event before deleting
 * the event row itself, rather than relying on FK cascade behavior --
 * several of these tables (site_config, guests, gift_preferences,
 * rsvp_responses) predate this repo's migration history, so their `on
 * delete` behavior isn't something this codebase can verify. Deleting an
 * already-cascaded row is a harmless no-op, so doing it explicitly here is
 * the safe option regardless of what the DB actually does. */
export async function deleteEvent(eventId: string, userId: string) {
  const supabase = await createClient();

  const owned = await getEventById(eventId, userId);
  if (!owned) {
    throw new Error("Event not found");
  }

  await supabase.from("banquet_tables").delete().eq("event_id", eventId);
  await supabase.from("gift_preferences").delete().eq("event_id", eventId);
  await supabase.from("rsvp_responses").delete().eq("event_id", eventId);
  await supabase.from("guests").delete().eq("event_id", eventId);
  await supabase.from("site_config").delete().eq("event_id", eventId);

  const { error } = await supabase
    .from("events")
    .delete()
    .eq("id", eventId)
    .eq("owner_id", userId);

  if (error) {
    throw new Error(error.message);
  }
}
