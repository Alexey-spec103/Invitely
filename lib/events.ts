import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { DEFAULT_THEME_ID, getTheme } from "@/lib/themes";
import { recommendedHeroVariantFor } from "@/lib/themes/recommendedHeroVariant";
import { DEFAULT_HERO_VARIANT, HERO_VARIANTS } from "@/components/sections/HeroSection";
import type { HeroVariant } from "@/components/sections/HeroSection";
import { DEFAULT_VARIANTS, SECTION_ORDER, DEFAULT_CONTENT_ON_ENABLE } from "@/components/sections/registry";
import type { Json } from "@/lib/supabase/database.types";
import { QUOTE_SUGGESTIONS } from "@/lib/quoteSuggestions";
import { getEventType } from "@/lib/eventTypes";

// `site_password_hash` is deliberately excluded: its column-level SELECT is
// revoked from anon/authenticated at the DB level (see the site-password
// migration), so a plain `select("*")` against `events` fails outright for
// every role -- Postgres denies `*` if any column is inaccessible, not just
// that one column. Nothing here ever needs the raw hash anyway (only
// `site_password_enabled`, which stays fully selectable).
// A single string literal (not built via `+`, which widens to plain `string`)
// so supabase-js can still statically infer the resulting row shape from the
// literal type -- a `string`-typed select falls back to an untyped result.
// Direct feedback: adding a brand-new column here once broke every page
// that calls getEventById -- this project's migrations only ever apply once
// the user runs them by hand in the Supabase SQL Editor (the CLI hangs
// non-interactively in this environment), so a column that exists only in
// a migration *file* isn't actually there yet. A feature needing a
// just-added column should fetch it with its own narrow, defensively-coded
// query (see guests/page.tsx's own rsvp_email_notifications read) instead
// of widening this shared constant, so a not-yet-applied migration degrades
// only that one feature rather than the entire dashboard.
export const EVENT_COLUMNS =
  "id, owner_id, slug, title, subtitle_names, event_type, event_date, event_time, venue_name, venue_address, venue_city, venue_lat, venue_lng, plan_id, status, default_locale, supported_locales, custom_domain, custom_domain_verification_token, custom_domain_verified_at, site_password_enabled, site_password_unlock_token, created_at, updated_at" as const;

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
    .select(EVENT_COLUMNS)
    .eq("owner_id", userId)
    .order("updated_at", { ascending: false })
    .limit(1);

  return existingEvents?.[0] ?? null;
});

export async function listEvents(userId: string) {
  const supabase = await createClient();

  const { data } = await supabase
    .from("events")
    .select(EVENT_COLUMNS)
    .eq("owner_id", userId)
    .order("updated_at", { ascending: false });

  return data ?? [];
}

export async function getEventById(eventId: string, userId: string) {
  const supabase = await createClient();

  const { data } = await supabase
    .from("events")
    .select(EVENT_COLUMNS)
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
      .select(EVENT_COLUMNS)
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

  // A fresh event used to seed `sections` with only `hero` -- a brand-new
  // host finishing onboarding landed on a site that was just a name-and-date
  // banner, with Welcome Letter, Schedule, Location, and (worst of all)
  // RSVP all showing as off in the Modules panel. Confirmed live: creating
  // a new event through the real onboarding flow produced exactly that.
  // Letter/Timeline/Map still won't actually render for guests with no
  // owner-written content (`sectionWillRender`/DEFAULT_CONTENT_ON_ENABLE's
  // own comment both gate on that deliberately), but starting them enabled
  // means their editing UI is open and inviting on first visit to the Site
  // tab, not collapsed behind a toggle the host has to discover first. RSVP
  // does have real zero-content seed data (DEFAULT_CONTENT_ON_ENABLE.rsvp),
  // so it renders for guests immediately, not just in the dashboard.
  const CORE_SECTION_TYPES = ["letter", "timeline", "map", "rsvp"] as const;
  const coreSections = CORE_SECTION_TYPES.map((type) => ({
    type,
    variant: DEFAULT_VARIANTS[type],
    order: SECTION_ORDER[type],
    enabled: true,
  }));
  const coreContent = Object.fromEntries(
    CORE_SECTION_TYPES.filter((type) => type in DEFAULT_CONTENT_ON_ENABLE).map((type) => [
      type,
      DEFAULT_CONTENT_ON_ENABLE[type],
    ])
  );

  const { error: configError } = await supabase.from("site_config").insert({
    event_id: newEvent.id,
    theme_id: themeId,
    sections: [
      { type: "hero", variant: heroVariant, order: 0, enabled: true },
      ...coreSections,
    ] as unknown as Json,
    content: {
      ...coreContent,
      hero: {
        names: input.names,
        eventDate: input.eventDate,
        photoUrl: input.photoUrl ?? "",
      },
      // A blank quote field gives a new host no sense of what belongs
      // there ("сделать понятно что там можно что-то писать") -- seeding
      // one real example up front, freely editable or removable (the
      // Letter SectionHeader's "Suggest a quote" picker already has a
      // "Clear quote" option), beats an empty box with no cue at all.
      // Picked once here, not at render time, so it stays stable across
      // reloads instead of changing every time the page is fetched.
      // QUOTE_SUGGESTIONS is "two souls"/"two hearts" couple-romantic
      // material (see its own file comment: scoped to weddings) -- seeding
      // it unconditionally put a wedding-vow line on every brand-new event
      // regardless of type, confirmed live on a fresh Birthday event. Only
      // couple-mode event types (wedding, anniversary, engagement) actually
      // have "two" of anything for these lines to describe; single/title
      // modes get the same blank-with-placeholder state the comment above
      // already considers an acceptable (if less inviting) fallback.
      letter:
        getEventType(input.eventType).namesMode === "couple"
          ? { quote: QUOTE_SUGGESTIONS[Math.floor(Math.random() * QUOTE_SUGGESTIONS.length)] }
          : {},
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
