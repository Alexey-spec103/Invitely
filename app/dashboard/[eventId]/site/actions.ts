"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  parseSections,
  parseContent,
  SECTION_ORDER,
  DEFAULT_VARIANTS,
  type SectionType,
} from "@/components/sections/registry";
import type { HeroVariant } from "@/components/sections/HeroSection";
import type { LetterVariant } from "@/components/sections/LetterSection";
import type { TimelineVariant } from "@/components/sections/TimelineSection";
import type { MapVariant } from "@/components/sections/MapSection";
import type { CountdownVariant } from "@/components/sections/CountdownSection";
import type { GiftVariant } from "@/components/sections/GiftSection";
import type { DressCodeVariant } from "@/components/sections/DressCodeSection";
import type { GuestbookVariant } from "@/components/sections/GuestbookSection";
import type { VideoVariant } from "@/components/sections/VideoSection";
import type { BanquetNavigatorVariant } from "@/components/sections/BanquetNavigatorSection";
import type { Json } from "@/lib/supabase/database.types";
import { DEFAULT_THEME_ID } from "@/lib/themes";

interface UpdateSiteSettingsInput {
  eventId: string;
  musicUrl?: string;
}

export async function updateSiteSettings(input: UpdateSiteSettingsInput) {
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
    settings: {
      musicUrl: input.musicUrl || undefined,
    },
  };

  const { error: configError } = existingConfig
    ? await supabase
        .from("site_config")
        .update({
          content: content as unknown as Json,
        })
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

  revalidatePath(`/dashboard/${input.eventId}/site`);
}

/** The single thing every module card's header switch calls -- on/off is
 * fully decoupled from content now (see the individual `update*Section`
 * actions below, which never touch `enabled`), so flipping a switch never
 * has to open a form or wait on its autosave. Never removes an entry from
 * `sections`, only flips its flag, so a module's variant/content always
 * survive being toggled off and back on. */
export async function toggleSection(eventId: string, type: SectionType, enabled: boolean) {
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

  const sections = existingSections.some((section) => section.type === type)
    ? existingSections.map((section) => (section.type === type ? { ...section, enabled } : section))
    : [
        ...existingSections,
        { type, variant: DEFAULT_VARIANTS[type], order: SECTION_ORDER[type], enabled },
      ];

  const { error } = existingConfig
    ? await supabase
        .from("site_config")
        .update({ sections: sections as unknown as Json })
        .eq("event_id", eventId)
    : await supabase.from("site_config").insert({
        event_id: eventId,
        theme_id: DEFAULT_THEME_ID,
        sections: sections as unknown as Json,
        content: {} as unknown as Json,
      });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/dashboard/${eventId}/site`);
}

interface UpdateHeroSectionInput {
  eventId: string;
  heroVariant: HeroVariant;
  photoUrl?: string;
}

/** Names/date are no longer accepted here -- they're owned by the "Wedding
 * data" form (app/dashboard/[eventId]/WeddingDataForm.tsx, via updateWeddingData)
 * as a single shared source. This only ever touches variant + photo, and reads
 * the event's current names/date to keep content.hero's mirror in sync. */
export async function updateHeroSection(input: UpdateHeroSectionInput) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  const { data: event, error: eventError } = await supabase
    .from("events")
    .select("subtitle_names, event_date")
    .eq("id", input.eventId)
    .eq("owner_id", user.id)
    .single();

  if (eventError || !event) {
    throw new Error(eventError?.message ?? "Event not found");
  }

  const names = event.subtitle_names ?? [];

  const { data: existingConfig } = await supabase
    .from("site_config")
    .select("*")
    .eq("event_id", input.eventId)
    .maybeSingle();

  const existingSections = existingConfig ? parseSections(existingConfig.sections) : [];
  const existingContent = existingConfig ? parseContent(existingConfig.content) : {};

  const sections = existingSections.some((section) => section.type === "hero")
    ? existingSections.map((section) =>
        section.type === "hero" ? { ...section, variant: input.heroVariant } : section
      )
    : [{ type: "hero", variant: input.heroVariant, order: SECTION_ORDER.hero, enabled: true }, ...existingSections];

  const content = {
    ...existingContent,
    hero: {
      names,
      eventDate: event.event_date,
      photoUrl: input.photoUrl ?? "",
    },
  };

  const { error: configError } = existingConfig
    ? await supabase
        .from("site_config")
        .update({
          sections: sections as unknown as Json,
          content: content as unknown as Json,
        })
        .eq("event_id", input.eventId)
    : await supabase.from("site_config").insert({
        event_id: input.eventId,
        theme_id: DEFAULT_THEME_ID,
        sections: sections as unknown as Json,
        content: content as unknown as Json,
      });

  if (configError) {
    throw new Error(configError.message);
  }

  revalidatePath(`/dashboard/${input.eventId}/site`);
}

interface UpdateTimelineSectionInput {
  eventId: string;
  title: string;
  events: { time: string; title: string; description: string }[];
  timelineVariant: TimelineVariant;
}

export async function updateTimelineSection(input: UpdateTimelineSectionInput) {
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

  const sections = existingSections.some((section) => section.type === "timeline")
    ? existingSections.map((section) =>
        section.type === "timeline" ? { ...section, variant: input.timelineVariant } : section
      )
    : [
        ...existingSections,
        { type: "timeline", variant: input.timelineVariant, order: SECTION_ORDER.timeline, enabled: false },
      ];

  const content = {
    ...existingContent,
    timeline: {
      title: input.title,
      events: input.events,
    },
  };

  const { error: configError } = existingConfig
    ? await supabase
        .from("site_config")
        .update({
          sections: sections as unknown as Json,
          content: content as unknown as Json,
        })
        .eq("event_id", input.eventId)
    : await supabase.from("site_config").insert({
        event_id: input.eventId,
        theme_id: DEFAULT_THEME_ID,
        sections: sections as unknown as Json,
        content: content as unknown as Json,
      });

  if (configError) {
    throw new Error(configError.message);
  }

  revalidatePath(`/dashboard/${input.eventId}/site`);
}

interface UpdateMapSectionInput {
  eventId: string;
  title: string;
  venues: { name: string; address: string }[];
  mapVariant: MapVariant;
}

export async function updateMapSection(input: UpdateMapSectionInput) {
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

  const sections = existingSections.some((section) => section.type === "map")
    ? existingSections.map((section) =>
        section.type === "map" ? { ...section, variant: input.mapVariant } : section
      )
    : [...existingSections, { type: "map", variant: input.mapVariant, order: SECTION_ORDER.map, enabled: false }];

  const content = {
    ...existingContent,
    map: {
      title: input.title,
      venues: input.venues,
    },
  };

  const { error: configError } = existingConfig
    ? await supabase
        .from("site_config")
        .update({
          sections: sections as unknown as Json,
          content: content as unknown as Json,
        })
        .eq("event_id", input.eventId)
    : await supabase.from("site_config").insert({
        event_id: input.eventId,
        theme_id: DEFAULT_THEME_ID,
        sections: sections as unknown as Json,
        content: content as unknown as Json,
      });

  if (configError) {
    throw new Error(configError.message);
  }

  revalidatePath(`/dashboard/${input.eventId}/site`);
}

interface UpdateCountdownSectionInput {
  eventId: string;
  title?: string;
  countdownVariant: CountdownVariant;
}

export async function updateCountdownSection(input: UpdateCountdownSectionInput) {
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

  const sections = existingSections.some((section) => section.type === "countdown")
    ? existingSections.map((section) =>
        section.type === "countdown" ? { ...section, variant: input.countdownVariant } : section
      )
    : [
        ...existingSections,
        { type: "countdown", variant: input.countdownVariant, order: SECTION_ORDER.countdown, enabled: false },
      ];

  const content = {
    ...existingContent,
    countdown: {
      title: input.title || undefined,
    },
  };

  const { error: configError } = existingConfig
    ? await supabase
        .from("site_config")
        .update({
          sections: sections as unknown as Json,
          content: content as unknown as Json,
        })
        .eq("event_id", input.eventId)
    : await supabase.from("site_config").insert({
        event_id: input.eventId,
        theme_id: DEFAULT_THEME_ID,
        sections: sections as unknown as Json,
        content: content as unknown as Json,
      });

  if (configError) {
    throw new Error(configError.message);
  }

  revalidatePath(`/dashboard/${input.eventId}/site`);
}

interface UpdateGiftWishesSectionInput {
  eventId: string;
  title?: string;
  description?: string;
  giftVariant: GiftVariant;
}

export async function updateGiftWishesSection(input: UpdateGiftWishesSectionInput) {
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

  const sections = existingSections.some((section) => section.type === "gift")
    ? existingSections.map((section) =>
        section.type === "gift" ? { ...section, variant: input.giftVariant } : section
      )
    : [
        ...existingSections,
        { type: "gift", variant: input.giftVariant, order: SECTION_ORDER.gift, enabled: false },
      ];

  const content = {
    ...existingContent,
    gift: {
      title: input.title || undefined,
      description: input.description || undefined,
    },
  };

  const { error: configError } = existingConfig
    ? await supabase
        .from("site_config")
        .update({
          sections: sections as unknown as Json,
          content: content as unknown as Json,
        })
        .eq("event_id", input.eventId)
    : await supabase.from("site_config").insert({
        event_id: input.eventId,
        theme_id: DEFAULT_THEME_ID,
        sections: sections as unknown as Json,
        content: content as unknown as Json,
      });

  if (configError) {
    throw new Error(configError.message);
  }

  revalidatePath(`/dashboard/${input.eventId}/site`);
}

interface UpdateDressCodeSectionInput {
  eventId: string;
  title: string;
  description?: string;
  colors: { hex: string; label?: string }[];
  dressCodeVariant: DressCodeVariant;
}

export async function updateDressCodeSection(input: UpdateDressCodeSectionInput) {
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

  const sections = existingSections.some((section) => section.type === "dressCode")
    ? existingSections.map((section) =>
        section.type === "dressCode" ? { ...section, variant: input.dressCodeVariant } : section
      )
    : [
        ...existingSections,
        { type: "dressCode", variant: input.dressCodeVariant, order: SECTION_ORDER.dressCode, enabled: false },
      ];

  const content = {
    ...existingContent,
    dressCode: {
      title: input.title,
      description: input.description || undefined,
      colors: input.colors,
    },
  };

  const { error: configError } = existingConfig
    ? await supabase
        .from("site_config")
        .update({
          sections: sections as unknown as Json,
          content: content as unknown as Json,
        })
        .eq("event_id", input.eventId)
    : await supabase.from("site_config").insert({
        event_id: input.eventId,
        theme_id: DEFAULT_THEME_ID,
        sections: sections as unknown as Json,
        content: content as unknown as Json,
      });

  if (configError) {
    throw new Error(configError.message);
  }

  revalidatePath(`/dashboard/${input.eventId}/site`);
}

interface UpdateVideoSectionInput {
  eventId: string;
  title?: string;
  videoUrl: string;
  videoVariant: VideoVariant;
}

export async function updateVideoSection(input: UpdateVideoSectionInput) {
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

  const sections = existingSections.some((section) => section.type === "video")
    ? existingSections.map((section) =>
        section.type === "video" ? { ...section, variant: input.videoVariant } : section
      )
    : [
        ...existingSections,
        { type: "video", variant: input.videoVariant, order: SECTION_ORDER.video, enabled: false },
      ];

  const content = {
    ...existingContent,
    video: {
      title: input.title || undefined,
      videoUrl: input.videoUrl,
    },
  };

  const { error: configError } = existingConfig
    ? await supabase
        .from("site_config")
        .update({
          sections: sections as unknown as Json,
          content: content as unknown as Json,
        })
        .eq("event_id", input.eventId)
    : await supabase.from("site_config").insert({
        event_id: input.eventId,
        theme_id: DEFAULT_THEME_ID,
        sections: sections as unknown as Json,
        content: content as unknown as Json,
      });

  if (configError) {
    throw new Error(configError.message);
  }

  revalidatePath(`/dashboard/${input.eventId}/site`);
}

interface UpdateGuestbookSectionInput {
  eventId: string;
  title?: string;
  guestbookVariant: GuestbookVariant;
}

export async function updateGuestbookSection(input: UpdateGuestbookSectionInput) {
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

  const sections = existingSections.some((section) => section.type === "guestbook")
    ? existingSections.map((section) =>
        section.type === "guestbook" ? { ...section, variant: input.guestbookVariant } : section
      )
    : [
        ...existingSections,
        { type: "guestbook", variant: input.guestbookVariant, order: SECTION_ORDER.guestbook, enabled: false },
      ];

  const content = {
    ...existingContent,
    guestbook: {
      title: input.title || undefined,
    },
  };

  const { error: configError } = existingConfig
    ? await supabase
        .from("site_config")
        .update({
          sections: sections as unknown as Json,
          content: content as unknown as Json,
        })
        .eq("event_id", input.eventId)
    : await supabase.from("site_config").insert({
        event_id: input.eventId,
        theme_id: DEFAULT_THEME_ID,
        sections: sections as unknown as Json,
        content: content as unknown as Json,
      });

  if (configError) {
    throw new Error(configError.message);
  }

  revalidatePath(`/dashboard/${input.eventId}/site`);
}

interface UpdateRsvpSectionInput {
  eventId: string;
  title: string;
  description?: string;
  questions: { id: string; label: string; type: "text" | "choice"; options?: string }[];
}

export async function updateRsvpSection(input: UpdateRsvpSectionInput) {
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

  const sections = existingSections.some((section) => section.type === "rsvp")
    ? existingSections
    : [
        ...existingSections,
        { type: "rsvp", variant: "simple-form", order: SECTION_ORDER.rsvp, enabled: false },
      ];

  const content = {
    ...existingContent,
    rsvp: {
      title: input.title,
      description: input.description || undefined,
      questions: input.questions
        .filter((question) => question.label.trim().length > 0)
        .map((question) => ({
          id: question.id,
          label: question.label.trim(),
          type: question.type,
          options:
            question.type === "choice"
              ? (question.options ?? "")
                  .split(",")
                  .map((option) => option.trim())
                  .filter(Boolean)
              : undefined,
        })),
    },
  };

  const { error: configError } = existingConfig
    ? await supabase
        .from("site_config")
        .update({
          sections: sections as unknown as Json,
          content: content as unknown as Json,
        })
        .eq("event_id", input.eventId)
    : await supabase.from("site_config").insert({
        event_id: input.eventId,
        theme_id: DEFAULT_THEME_ID,
        sections: sections as unknown as Json,
        content: content as unknown as Json,
      });

  if (configError) {
    throw new Error(configError.message);
  }

  revalidatePath(`/dashboard/${input.eventId}/site`);
}

interface UpdateBanquetNavigatorSectionInput {
  eventId: string;
  title: string;
  description?: string;
  banquetNavigatorVariant: BanquetNavigatorVariant;
}

export async function updateBanquetNavigatorSection(input: UpdateBanquetNavigatorSectionInput) {
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

  const sections = existingSections.some((section) => section.type === "banquetNavigator")
    ? existingSections.map((section) =>
        section.type === "banquetNavigator"
          ? { ...section, variant: input.banquetNavigatorVariant }
          : section
      )
    : [
        ...existingSections,
        {
          type: "banquetNavigator",
          variant: input.banquetNavigatorVariant,
          order: SECTION_ORDER.banquetNavigator,
          enabled: false,
        },
      ];

  const content = {
    ...existingContent,
    banquetNavigator: {
      title: input.title,
      description: input.description || undefined,
    },
  };

  const { error: configError } = existingConfig
    ? await supabase
        .from("site_config")
        .update({
          sections: sections as unknown as Json,
          content: content as unknown as Json,
        })
        .eq("event_id", input.eventId)
    : await supabase.from("site_config").insert({
        event_id: input.eventId,
        theme_id: DEFAULT_THEME_ID,
        sections: sections as unknown as Json,
        content: content as unknown as Json,
      });

  if (configError) {
    throw new Error(configError.message);
  }

  revalidatePath(`/dashboard/${input.eventId}/site`);
}

/** Swaps a section's `order` with its neighbor in the current sort order --
 * the same adjacent-swap convention already used for canvas frame reordering
 * and z-index layering elsewhere in this app, rather than rewriting every
 * section's order value on each move. */
export async function reorderSection(eventId: string, sectionType: string, direction: "up" | "down") {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  const { data: existingConfig } = await supabase
    .from("site_config")
    .select("sections")
    .eq("event_id", eventId)
    .maybeSingle();

  if (!existingConfig) return;

  const allSections = parseSections(existingConfig.sections);
  const liveSections = allSections.filter((section) => section.enabled);
  const index = liveSections.findIndex((section) => section.type === sectionType);
  const swapWith = direction === "up" ? index - 1 : index + 1;
  if (index === -1 || swapWith < 0 || swapWith >= liveSections.length) return;

  const indexOrder = liveSections[index].order;
  const swapOrder = liveSections[swapWith].order;
  const reordered = allSections.map((section) => {
    if (section.type === liveSections[index].type) return { ...section, order: swapOrder };
    if (section.type === liveSections[swapWith].type) return { ...section, order: indexOrder };
    return section;
  });

  const { error } = await supabase
    .from("site_config")
    .update({ sections: reordered as unknown as Json })
    .eq("event_id", eventId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/dashboard/${eventId}/site`);
}

interface UpdateLetterSectionInput {
  eventId: string;
  title: string;
  body: string;
  quote: string;
  note: string;
  rsvpDeadline: string;
  closingLine: string;
  letterVariant: LetterVariant;
}

export async function updateLetterSection(input: UpdateLetterSectionInput) {
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

  const sections = existingSections.some((section) => section.type === "letter")
    ? existingSections.map((section) =>
        section.type === "letter" ? { ...section, variant: input.letterVariant } : section
      )
    : [
        ...existingSections,
        { type: "letter", variant: input.letterVariant, order: SECTION_ORDER.letter, enabled: false },
      ];

  const content = {
    ...existingContent,
    letter: {
      title: input.title,
      body: input.body,
      quote: input.quote,
      note: input.note || undefined,
      rsvpDeadline: input.rsvpDeadline || undefined,
      closingLine: input.closingLine || undefined,
    },
  };

  const { error: configError } = existingConfig
    ? await supabase
        .from("site_config")
        .update({
          sections: sections as unknown as Json,
          content: content as unknown as Json,
        })
        .eq("event_id", input.eventId)
    : await supabase.from("site_config").insert({
        event_id: input.eventId,
        theme_id: DEFAULT_THEME_ID,
        sections: sections as unknown as Json,
        content: content as unknown as Json,
      });

  if (configError) {
    throw new Error(configError.message);
  }

  revalidatePath(`/dashboard/${input.eventId}/site`);
}
