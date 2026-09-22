import { en, type Dictionary } from "./translations/en";
import { de } from "./translations/de";
import { fr } from "./translations/fr";
import { es } from "./translations/es";
import { it } from "./translations/it";
import { pl } from "./translations/pl";
import { ru } from "./translations/ru";
import { uk } from "./translations/uk";
import type { Locale } from "./locales";

const DICTIONARIES: Record<Locale, Dictionary> = { en, de, fr, es, it, pl, ru, uk };

export type { Dictionary };

export function getDictionary(locale: Locale): Dictionary {
  return DICTIONARIES[locale] ?? en;
}
