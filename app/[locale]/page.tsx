import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HomePageContent } from "@/components/marketing/HomePageContent";
import SyncLocaleFromUrl from "@/components/marketing/SyncLocaleFromUrl";
import { isSupportedLocale, NON_DEFAULT_LOCALES } from "@/lib/i18n/locales";
import { LANDING_META } from "@/lib/i18n/landingMeta";
import { buildHreflangAlternates } from "@/lib/i18n/hreflang";

/** SEO fix (2026-10-19): the homepage's 7 non-English language versions,
 * each at its own stable URL (/de, /fr, /es, /it, /pl, /ru, /uk) instead of
 * all 8 locales sitting invisibly behind a cookie at "/" -- see the plan
 * this came from for the full reasoning. English deliberately has no /en
 * route here (would be near-duplicate content of "/", which already is
 * English) -- NON_DEFAULT_LOCALES excludes it, and `dynamicParams = false`
 * below means anything else (including a literal "/en") 404s cleanly
 * instead of attempting a dynamic render. */
export function generateStaticParams() {
  return NON_DEFAULT_LOCALES.map((locale) => ({ locale }));
}
export const dynamicParams = false;

interface LocalePageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: LocalePageProps): Promise<Metadata> {
  const { locale } = await params;
  // Compared against the "en" literal, not DEFAULT_LOCALE, so TypeScript can
  // actually narrow `locale` to exclude it below -- DEFAULT_LOCALE is typed
  // as plain `Locale`, not the literal "en", so comparing against it alone
  // doesn't narrow (confirmed: LANDING_META's lookup below didn't type-check
  // without this).
  if (!isSupportedLocale(locale) || locale === "en") {
    return {};
  }
  const meta = LANDING_META[locale];
  // The root layout's title.template ("%s | Invimbo") only applies to the
  // actual <title> tag -- openGraph.title/twitter.title are independent
  // fields with no templating, so they need the brand spelled out
  // explicitly (same "Invimbo - X" shape as the root layout's own siteTitle
  // uses for its openGraph.title).
  const fullTitle = `Invimbo - ${meta.title}`;
  return {
    title: meta.title,
    description: meta.description,
    alternates: {
      canonical: `/${locale}`,
      languages: buildHreflangAlternates(),
    },
    openGraph: {
      title: fullTitle,
      description: meta.description,
      url: `/${locale}`,
      siteName: "Invimbo",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: meta.description,
    },
  };
}

export default async function LocalizedHome({ params }: LocalePageProps) {
  const { locale } = await params;
  // Defensive, mirrors generateMetadata's own check above: dynamicParams =
  // false already means a literal "/en" 404s before this ever runs, this
  // just keeps the two in sync rather than relying on that alone.
  if (!isSupportedLocale(locale) || locale === "en") {
    notFound();
  }
  return (
    <>
      <SyncLocaleFromUrl locale={locale} />
      <HomePageContent locale={locale} />
    </>
  );
}
