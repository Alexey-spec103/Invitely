import type { Locale } from "./locales";

/** SEO fix (2026-10-19): app/layout.tsx's siteTitle/siteDescription are
 * hardcoded English constants, never translated -- fine when every locale
 * rendered at the same "/" URL anyway (there was only ever one <title> to
 * write), but now that /de, /fr, etc. are real, distinct, crawlable pages
 * (app/[locale]/page.tsx), an English snippet on a French results page
 * would undercut the entire point of giving each language its own URL.
 *
 * Descriptions are a light edit of each locale's own already-translated
 * `landing.hero.subtext` (lib/i18n/translations/*.ts) -- reusing real,
 * already-approved copy rather than inventing new phrasing, same as the
 * English siteDescription itself is a trimmed variant of the English
 * hero.subtext (drops the trailing "start from a theme..." sentence, which
 * reads as a call-to-action rather than a description of what the product
 * is).
 *
 * Titles are the page-specific fragment ONLY, no "Invimbo - " prefix --
 * app/layout.tsx's root `title.template` ("%s | Invimbo") already appends
 * the brand suffix to every child page's title, confirmed live this would
 * otherwise double up ("X - Invimbo | Invimbo"), the same bug just found
 * and fixed on app/privacy/page.tsx and app/terms/page.tsx (see their own
 * comments). Not sourced from the Dictionary type -- this is metadata
 * content for app/[locale]/page.tsx specifically, not UI copy the rest of
 * the app reads. */
export const LANDING_META: Record<Exclude<Locale, "en">, { title: string; description: string }> = {
  de: {
    title: "Event-Websites, live in Minuten",
    description:
      "Eine wunderschöne Event-Website, dazu passende Papiereinladungen und Sitzordnung - ein Stil, überall wo deine Gäste ihn sehen.",
  },
  fr: {
    title: "Sites événementiels en quelques minutes",
    description:
      "Un magnifique site événementiel, des invitations papier assorties et un plan de table - un seul style, partout où vos invités le voient.",
  },
  es: {
    title: "Sitios web de eventos, listos en minutos",
    description:
      "Un hermoso sitio web de evento, invitaciones de papel a juego y organización de invitados - un solo estilo, en todas partes donde tus invitados lo vean.",
  },
  it: {
    title: "Siti per eventi, online in pochi minuti",
    description:
      "Un bellissimo sito per il tuo evento, inviti cartacei coordinati e disposizione dei tavoli - un unico stile, ovunque i tuoi ospiti lo vedano.",
  },
  pl: {
    title: "Strony wydarzeń, gotowe w kilka minut",
    description:
      "Piękna strona wydarzenia, pasujące zaproszenia papierowe i rozmieszczenie gości - jeden styl, wszędzie tam, gdzie widzą go twoi goście.",
  },
  ru: {
    title: "Сайты для мероприятий за считаные минуты",
    description:
      "Красивый сайт-приглашение, подходящие бумажные приглашения и рассадка гостей - единый стиль везде, где его увидят ваши гости.",
  },
  uk: {
    title: "Сайти для подій за лічені хвилини",
    description:
      "Красивий сайт-запрошення, відповідні паперові запрошення та розсадка гостей - єдиний стиль скрізь, де його побачать ваші гості.",
  },
};
