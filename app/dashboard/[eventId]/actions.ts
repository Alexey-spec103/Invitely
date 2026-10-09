"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireRealUser } from "@/lib/session";
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

export async function togglePublish(
  eventId: string
): Promise<{ ok: true } | { ok: false; message: string }> {
  // Publishing requires a real account, not just any session -- an
  // anonymous trial user can build and preview freely, but guests can only
  // actually see the site once its owner has a real (non-anonymous) account.
  // Returned as a value, not thrown -- Next.js redacts thrown Server Action
  // error messages to a generic, unhelpful message in production builds
  // ("Minified React error #441"), which turned this expected, common case
  // (an anonymous host clicking Publish) into raw React internals shown to
  // a real customer instead of "Create a free account to continue".
  let user;
  try {
    user = await requireRealUser();
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : "Not authenticated" };
  }
  const supabase = await createClient();

  const { data: existingEvent, error: fetchError } = await supabase
    .from("events")
    .select("status")
    .eq("id", eventId)
    .eq("owner_id", user.id)
    .single();

  if (fetchError || !existingEvent) {
    return { ok: false, message: fetchError?.message ?? "Event not found" };
  }

  const nextStatus = existingEvent.status === "published" ? "draft" : "published";

  const { error: updateError } = await supabase
    .from("events")
    .update({ status: nextStatus })
    .eq("id", eventId)
    .eq("owner_id", user.id);

  if (updateError) {
    return { ok: false, message: updateError.message };
  }

  revalidatePath(`/dashboard/${eventId}`, "layout");
  return { ok: true };
}

interface UpdateThemeInput {
  eventId: string;
  themeId: string;
}

// The 5 decor-preserved canvas cards (Envelope/Program/Dress-code/Save-the-
// -Date/Thank-You) keep their own border+corner-decor chrome live-tracking
// the current theme, but a text element's *color* is a one-time snapshot of
// whatever the theme's text/accent color was at the moment a host first
// customized that card -- switching themes afterward left that color frozen,
// which could go illegible against a very different new background (e.g.
// pale cream text, fine on a dark theme, nearly invisible on a light one).
const CANVAS_RECOLOR_KEYS = [
  "envelopeCanvas",
  "programCanvas",
  "dressCodeCanvas",
  "saveTheDateCanvas",
  "thankYouCanvas",
] as const;

/** Re-colors only the text elements whose color exactly matches the OLD
 * theme's own --theme-text/--theme-accent tokens -- a value-matching
 * heuristic, not a stored "is this theme-derived" flag, so it covers
 * already-saved customizations from before this fix with no migration.
 * Anything that doesn't match (a host's genuine custom color pick, or an
 * element with no theme-linked color) is left exactly as the host set it. */
function recolorFrameForThemeChange(
  frame: unknown,
  oldTextColor: string,
  oldAccentColor: string,
  newTextColor: string,
  newAccentColor: string
): { frame: unknown; changed: boolean } {
  if (!frame || typeof frame !== "object" || !Array.isArray((frame as { elements?: unknown }).elements)) {
    return { frame, changed: false };
  }
  const f = frame as { elements: Array<Record<string, unknown>> };
  let changed = false;
  const elements = f.elements.map((el) => {
    if (el.type !== "text" || typeof el.color !== "string") return el;
    if (el.color === oldTextColor && oldTextColor !== newTextColor) {
      changed = true;
      return { ...el, color: newTextColor };
    }
    if (el.color === oldAccentColor && oldAccentColor !== newAccentColor) {
      changed = true;
      return { ...el, color: newAccentColor };
    }
    return el;
  });
  return { frame: changed ? { ...f, elements } : frame, changed };
}

/** Hero's layout has no manual picker anymore (removed along with the old
 * per-section forms -- layout is theme-owned now, matching how it already
 * worked at event-creation time via `recommendedHeroVariantFor`). For that
 * to actually hold after a theme *change* too, not just at creation, this
 * must re-derive and re-apply the recommended variant for the new theme's
 * category here -- otherwise an event would keep whatever Hero layout it
 * was created with forever, silently mismatched with every theme switched
 * to afterward. */
export async function updateTheme(
  input: UpdateThemeInput
): Promise<{ ok: true } | { ok: false; message: string }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, message: "Not authenticated" };
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
    .select("theme_id, sections, content")
    .eq("event_id", input.eventId)
    .maybeSingle();
  const previousThemeId = existingConfig?.theme_id;

  // Re-color any of the 5 decor-preserved canvas cards' text that matches
  // the OLD theme's own text/accent colors -- see recolorFrameForThemeChange
  // above for why. Never fails the theme switch itself: an unknown/deleted
  // old theme id just skips recoloring.
  let canvasRecolorPatch: Record<string, unknown> | undefined;
  if (previousThemeId && previousThemeId !== input.themeId) {
    try {
      const oldTheme = getTheme(previousThemeId);
      const newTheme = getTheme(input.themeId);
      const existingContentForRecolor = existingConfig ? parseContent(existingConfig.content) : {};
      const existingInvitations =
        typeof existingContentForRecolor.invitations === "object" && existingContentForRecolor.invitations !== null
          ? (existingContentForRecolor.invitations as Record<string, unknown>)
          : {};
      let anyChanged = false;
      const nextInvitations: Record<string, unknown> = { ...existingInvitations };
      for (const key of CANVAS_RECOLOR_KEYS) {
        if (key in existingInvitations) {
          const { frame: recoloredFrame, changed } = recolorFrameForThemeChange(
            existingInvitations[key],
            oldTheme.vars["--theme-text"],
            oldTheme.vars["--theme-accent"],
            newTheme.vars["--theme-text"],
            newTheme.vars["--theme-accent"]
          );
          if (changed) {
            nextInvitations[key] = recoloredFrame;
            anyChanged = true;
          }
        }
      }
      if (anyChanged) {
        canvasRecolorPatch = { ...existingContentForRecolor, invitations: nextInvitations };
      }
    } catch {
      // Unknown theme id on either side -- skip recoloring.
    }
  }

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
        // A color variant overrides colors on top of whatever theme is
        // currently selected -- switching theme entirely should reset to
        // the new theme's own colors, not silently carry an override picked
        // for a different (even same-category) theme forward.
        .update({
          theme_id: input.themeId,
          color_variant_id: null,
          sections: sectionsWithRecommendedVariants as unknown as Json,
          ...(canvasRecolorPatch ? { content: canvasRecolorPatch as unknown as Json } : {}),
        })
        .eq("event_id", input.eventId)
    : await supabase.from("site_config").insert({
        event_id: input.eventId,
        theme_id: input.themeId,
        sections: sectionsWithRecommendedVariants as unknown as Json,
        content: {},
      });

  if (configError) {
    return { ok: false, message: configError.message };
  }

  // dashboard-audit.md B11: a best-effort log of past theme choices (their
  // ⟲ "history" icon) -- only on a real change, not a no-op re-save, and
  // pruned to the most recent 20 rows per event so it can't grow unbounded.
  // Never blocks the theme update itself: a history-logging failure isn't a
  // reason to fail the save the user actually asked for.
  if (!previousThemeId || previousThemeId !== input.themeId) {
    const { error: historyError } = await supabase
      .from("theme_history")
      .insert({ event_id: input.eventId, theme_id: input.themeId });
    if (!historyError) {
      const { data: staleHistory } = await supabase
        .from("theme_history")
        .select("id")
        .eq("event_id", input.eventId)
        .order("changed_at", { ascending: false })
        .range(20, 1000);
      if (staleHistory && staleHistory.length > 0) {
        await supabase
          .from("theme_history")
          .delete()
          .in("id", staleHistory.map((row) => row.id));
      }
    }
  }

  revalidatePath(`/dashboard/${input.eventId}`);
  return { ok: true };
}

interface UpdateColorVariantInput {
  eventId: string;
  /** A same-category sibling theme's id to borrow bg/text/accent from, or
   * null to go back to the current theme's own colors. Re-validated server
   * side against lib/themes/applyColorVariant's own category check --
   * trusting the client here would let a crafted request mismatch a
   * fixed-palette category's decor with an unrelated accent color. */
  colorVariantId: string | null;
}

/** Deliberately its own action, not folded into updateTheme -- a color swap
 * changes none of theme_id/sections/hero variant, so it doesn't need (and
 * shouldn't trigger) any of that function's recommended-variant recompute or
 * theme_history logging. See lib/themes/index.ts's applyColorVariant for why
 * this only does anything for modern/minimal themes. */
export async function updateColorVariant(
  input: UpdateColorVariantInput
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
    .select("theme_id")
    .eq("event_id", input.eventId)
    .maybeSingle();

  if (!existingConfig) {
    return { ok: false, message: "No site found for this event yet" };
  }

  let colorVariantId = input.colorVariantId;
  if (colorVariantId) {
    try {
      const base = getTheme(existingConfig.theme_id);
      const variant = getTheme(colorVariantId);
      const isSameSafeCategory =
        (base.category === "modern" || base.category === "minimal") && variant.category === base.category;
      if (!isSameSafeCategory) {
        colorVariantId = null;
      }
    } catch {
      colorVariantId = null;
    }
  }

  const { error } = await supabase
    .from("site_config")
    .update({ color_variant_id: colorVariantId })
    .eq("event_id", input.eventId);

  if (error) {
    return { ok: false, message: error.message };
  }

  revalidatePath(`/dashboard/${input.eventId}`, "layout");
  return { ok: true };
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

export async function updateWeddingData(
  input: UpdateWeddingDataInput
): Promise<{ ok: true } | { ok: false; message: string }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, message: "Not authenticated" };
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
    return { ok: false, message: error.message };
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
      return { ok: false, message: contentError.message };
    }
  }

  revalidatePath(`/dashboard/${input.eventId}`, "layout");
  return { ok: true };
}

interface ChangeEventTypeInput {
  eventId: string;
  newEventType: string;
  name1: string;
  name2?: string;
}

/** Lets a host who picked the wrong card in onboarding fix it afterward --
 * `event_type` was previously write-once at creation (lib/events.ts's own
 * createEvent), with no path to change it anywhere in the dashboard. Reuses
 * updateWeddingData's exact title/subtitle_names/hero-mirror recipe rather
 * than inventing a second one, but deliberately leaves event_date and venue
 * fields untouched -- a type change isn't a reason to discard those. */
export async function changeEventType(
  input: ChangeEventTypeInput
): Promise<{ ok: true } | { ok: false; message: string }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, message: "Not authenticated" };
  }

  const type = getEventType(input.newEventType);
  const names = type.namesMode === "couple" ? [input.name1, input.name2 ?? ""] : [input.name1];
  const title = type.titleTemplate(names);

  const { error } = await supabase
    .from("events")
    .update({
      event_type: input.newEventType,
      title,
      subtitle_names: names,
    })
    .eq("id", input.eventId)
    .eq("owner_id", user.id);

  if (error) {
    return { ok: false, message: error.message };
  }

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
          hero: { ...existingHero, names },
        } as unknown as Json,
      })
      .eq("event_id", input.eventId);

    if (contentError) {
      return { ok: false, message: contentError.message };
    }
  }

  revalidatePath(`/dashboard/${input.eventId}`, "layout");
  return { ok: true };
}

export async function deleteEventAction(
  eventId: string
): Promise<{ ok: true } | { ok: false; message: string }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, message: "Not authenticated" };
  }

  try {
    await deleteEvent(eventId, user.id);
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : "Failed to delete event" };
  }

  redirect("/dashboard");
}
