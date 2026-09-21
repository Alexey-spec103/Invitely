import type { ThemeCategory } from "./types";

/**
 * Every theme supports the exact same full feature set (confirmed against
 * lib/events.ts and recommendedSectionVariants.ts -- no theme lacks a
 * recommended Countdown/Gift/DressCode/Guestbook/Video variant), so there is
 * no honest "this theme has X, that one doesn't" claim to make here. This is
 * a curated 3-item sample of genuinely real, working capabilities, varied by
 * category purely for catalog browsing variety -- never an exclusivity
 * claim. Every word below is a real, shipped feature (cross-checked against
 * app/dashboard/[eventId]/site/FeatureCarousel.tsx's own verified claims and
 * components/sections/registry.tsx's section types).
 */
const CATEGORY_HIGHLIGHT_FEATURES: Record<ThemeCategory, string[]> = {
  romantic: ["RSVP", "GUESTBOOK", "PHOTOS"],
  botanical: ["RSVP", "GUESTBOOK", "PHOTOS"],
  boho: ["RSVP", "GUESTBOOK", "PHOTOS"],
  coastal: ["RSVP", "GUESTBOOK", "PHOTOS"],
  rustic: ["RSVP", "GUESTBOOK", "PHOTOS"],
  modern: ["RSVP", "COUNTDOWN", "QR CODE"],
  minimal: ["RSVP", "COUNTDOWN", "QR CODE"],
  luxury: ["RSVP", "GIFTS", "DRESS CODE"],
  vintage: ["RSVP", "GIFTS", "DRESS CODE"],
  dark: ["RSVP", "GIFTS", "DRESS CODE"],
  marble: ["RSVP", "GIFTS", "DRESS CODE"],
  cosmic: ["RSVP", "GIFTS", "DRESS CODE"],
  peony: ["RSVP", "GUESTBOOK", "PHOTOS"],
  provence: ["RSVP", "GUESTBOOK", "PHOTOS"],
};

export function highlightFeaturesFor(category: ThemeCategory): string[] {
  return CATEGORY_HIGHLIGHT_FEATURES[category];
}
