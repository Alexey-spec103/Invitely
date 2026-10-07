import type { EventTypeId } from "@/lib/eventTypes";
import type { ThemeCategory } from "./types";

/** Hand-curated event-type -> theme-category shortlist for ThemeGallery's
 * "Occasion" chip row (Block C of the launch-readiness pass). Every theme
 * category still exists in search/the "Style" sidebar regardless of this
 * list -- this only narrows the default grid shown once a host's own event
 * type is known, so e.g. a Corporate Event host isn't wading through
 * Provence/Peony before reaching something that fits. Wedding stays
 * deliberately wide (it's still the flagship use case, per
 * EventTypesSection.tsx's own comment) rather than trimmed down like the
 * others. "other" has no entry on purpose -- a host whose event doesn't fit
 * a narrower box shouldn't have one guessed for them, so occasion filtering
 * is a no-op for it (every category shows, same as before this feature). */
export const OCCASION_CATEGORIES: Partial<Record<EventTypeId, ThemeCategory[]>> = {
  wedding: ["romantic", "botanical", "luxury", "vintage", "rustic", "boho", "marble", "provence", "peony"],
  anniversary: ["romantic", "luxury", "vintage", "marble", "provence"],
  engagement: ["romantic", "luxury", "botanical", "marble", "peony"],
  birthday: ["modern", "boho", "cosmic", "minimal", "dark"],
  baby_shower: ["botanical", "boho", "minimal", "peony", "provence"],
  kids_party: ["modern", "cosmic", "boho", "minimal"],
  quinceanera: ["luxury", "peony", "romantic", "marble", "provence"],
  graduation: ["modern", "minimal", "dark", "luxury"],
  corporate: ["modern", "minimal", "dark", "coastal", "luxury"],
  holiday: ["dark", "luxury", "modern", "marble"],
  retirement: ["vintage", "luxury", "modern", "minimal"],
};
