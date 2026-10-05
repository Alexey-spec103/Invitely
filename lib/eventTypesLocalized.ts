import { EVENT_TYPES, DEFAULT_EVENT_TYPE_ID, type EventTypeDef, type EventTypeId } from "./eventTypes";
import { getDictionary } from "./i18n/dictionary";
import type { Locale } from "./i18n/locales";

/** lib/eventTypes.ts stays the single source of truth for id/icon/namesMode/
 * seatingLabel/titleTemplate -- none of those are guest-facing display text.
 * Only the four fields a guest or host actually reads (label, namePrompts,
 * dateLabel, heroEyebrow) get overlaid here from the current locale's
 * Dictionary.eventTypes entry, kept in a separate file (not lib/eventTypes.ts
 * itself) purely to avoid that dependency-free file importing from lib/i18n
 * -- this is the only file that imports both. */
function localize(base: EventTypeDef, locale: Locale): EventTypeDef {
  const strings = getDictionary(locale).eventTypes[base.id];
  return { ...base, label: strings.label, namePrompts: strings.namePrompts, dateLabel: strings.dateLabel, heroEyebrow: strings.heroEyebrow };
}

export function getLocalizedEventType(id: string, locale: Locale): EventTypeDef {
  const base = EVENT_TYPES[id as EventTypeId] ?? EVENT_TYPES[DEFAULT_EVENT_TYPE_ID];
  return localize(base, locale);
}

export function getLocalizedEventTypeList(locale: Locale): EventTypeDef[] {
  return Object.values(EVENT_TYPES).map((type) => localize(type, locale));
}
