import Link from "next/link";
import {
  Sparkles,
  Mail,
  Clock,
  MapPin,
  ClipboardCheck,
  Timer,
  Printer,
  Users2,
  Palette,
  Globe,
  Wand2,
  MessagesSquare,
  Video,
  Type,
  Pencil,
  Sliders,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import InvitelyLogo from "@/components/InvitelyLogo";
import { themes } from "@/lib/themes";
import { CANVAS_FONTS } from "@/lib/canvas/fonts";
import { plans } from "@/lib/plans";
import LandingThemeShowcase from "@/components/marketing/LandingThemeShowcase";
import MobileNav from "@/components/marketing/MobileNav";
import EventTypesSection from "@/components/marketing/EventTypesSection";
import ConstructorScreenshot from "@/components/marketing/ConstructorScreenshot";
import HeroPhoneShowcase from "@/components/marketing/HeroPhoneShowcase";
import PlatformFanSection from "@/components/marketing/PlatformFanSection";
import HowItWorksSection from "@/components/marketing/HowItWorksSection";
import GuestTrackingSection from "@/components/marketing/GuestTrackingSection";
import SiteOrPaperSection from "@/components/marketing/SiteOrPaperSection";
import LanguageSwitcher from "@/components/site/LanguageSwitcher";
import { resolveGuestLocale } from "@/lib/i18n/resolveLocale";
import { getDictionary } from "@/lib/i18n/dictionary";
import { SUPPORTED_LOCALES } from "@/lib/i18n/locales";

const themeCount = Object.keys(themes).length;
const fontCount = CANVAS_FONTS.length;

// Icon-only lookup tables -- the translated title/description text for each
// entry now lives in lib/i18n/translations/*.ts's `landing` namespace
// (indexed positionally against these arrays, built inside Home() once
// `t` is resolved) since it depends on the request's locale, not something
// module-level constants can hold.
const HERO_CHECKLIST_ICONS = [Palette, Wand2, ClipboardCheck, Printer];
const CONSTRUCTOR_FEATURE_ICONS = [Type, Palette, Wand2, Pencil, Printer, Sliders];
const MODULE_ICONS = [Wand2, Sparkles, Mail, Clock, MapPin, ClipboardCheck, Timer, MessagesSquare, Video, Printer, Users2, Globe];

// Each paid tier's own `features` array starts with "Everything in ..." for
// the /dashboard/[eventId]/plan page's cumulative comparison -- on the
// landing page that reads as the generic "SaaS grid" the audit flagged, so
// this shows only what a tier newly adds. Derived from the same `plans`
// data (not a second copy) so it can't drift out of sync.
const planHighlights: Record<string, string[]> = Object.fromEntries(
  Object.values(plans).map((plan) => [plan.id, plan.features.filter((feature) => !feature.startsWith("Everything in"))])
);

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const showcaseThemes = Object.values(themes);
  const locale = await resolveGuestLocale();
  const dict = getDictionary(locale);
  const languageLabel = dict.languageSwitcher.label;
  const t = dict.landing;

  const ctaHref = user ? "/dashboard" : "/onboarding";
  // One primary-button style everywhere (see globals.css's shared
  // --dash-accent), but a distinct verb-led label per section for a
  // logged-out visitor -- matches weddingpost.ru's own pattern of a
  // different imperative per section instead of the same generic label
  // repeated. A returning logged-in user always sees "Go to dashboard"
  // instead -- accurate for them, and not the target of this pass (that's
  // a separate header/logo rework, not done yet).
  const ctaLabel = user ? t.cta.primaryLoggedIn : t.cta.primary;
  const constructorCtaLabel = user ? t.cta.constructorLoggedIn : t.cta.constructor;
  const finalCtaLabel = user ? t.cta.primaryLoggedIn : t.cta.final;

  const heroChecklist = [
    { icon: HERO_CHECKLIST_ICONS[0], text: t.hero.checklistThemes(themeCount) },
    { icon: HERO_CHECKLIST_ICONS[1], text: t.hero.checklistFonts(fontCount) },
    { icon: HERO_CHECKLIST_ICONS[2], text: t.hero.checklistRsvp },
    { icon: HERO_CHECKLIST_ICONS[3], text: t.hero.checklistPaper },
  ];

  const statBar = [
    { value: `${themeCount}`, label: t.statBar.themes },
    { value: `${fontCount}+`, label: t.statBar.fonts },
    { value: "12", label: t.statBar.modules },
    { value: "1", label: t.statBar.oneLink },
  ];

  const constructorFeatures = t.constructorSection.features.map((feature, index) => ({
    icon: CONSTRUCTOR_FEATURE_ICONS[index],
    title: feature.title,
    description: feature.description,
  }));

  const modules = t.whatsIncluded.modules.map((module, index) => ({
    icon: MODULE_ICONS[index],
    title: module.title,
    description: module.description,
  }));

  // Factual, not promotional -- the free tier really is unlimited to use, and
  // the only thing Premium actually does today is remove the watermark from
  // personalized/banquet materials (see lib/plans.ts's own comment) -- not an
  // "unlocks paper invitations" claim, since those already work on every
  // plan. No fabricated "-20%"-style discount badges either: unlike
  // weddingpost.ru's pricing section, nothing here is ever actually
  // discounted, so a strikethrough price would be a fake one.
  const planBadges: Record<string, string> = {
    free: t.pricing.badgeFree,
    premium: t.pricing.badgePremium,
  };

  return (
    <div className="bg-white font-sans">
      {/* landing-audit.md priority 19: weddingpost.ru's own site opens with a
          gradient bar above the header, on every screen, pre-empting the
          "can I even pay from here" objection before the visitor reaches the
          hero. Same lilac-to-pink pair as the "with a wow effect" accent
          (priority 18) -- one recognizable decorative accent reused in the
          two spots that call for it, not a third color. Sticky together with
          the header (one shared sticky wrapper) so it stays pinned exactly
          like the original while scrolling, instead of scrolling away. */}
      <div className="sticky top-0 z-40">
        <div className="bg-gradient-to-r from-violet-300 to-pink-300 py-2 text-center text-xs font-medium text-white sm:text-sm">
          {t.topBar}
        </div>
        <header className="relative border-b border-stone-100 bg-white/80 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-6 py-4">
            {/* landing-audit.md priority 20 / dashboard-audit.md D7: a bare
                wordmark gives no signal and doesn't stick in memory. Uses the
                same "Toast i" mark as the dashboard header now, rather than
                a second, different mark for the marketing site. */}
            <Link href="/" className="flex items-center gap-1.5 text-lg font-semibold tracking-tight text-stone-900">
              <InvitelyLogo className="h-5 w-5" />
              Invitely
            </Link>
            <nav className="hidden items-center gap-8 text-sm font-medium text-stone-600 sm:flex">
              <a href="#constructor" className="transition-colors hover:text-stone-900">
                {t.nav.constructor}
              </a>
              <a href="#themes" className="transition-colors hover:text-stone-900">
                {t.nav.themes}
              </a>
              <a href="#whats-included" className="transition-colors hover:text-stone-900">
                {t.nav.whatsIncluded}
              </a>
              <a href="#pricing" className="transition-colors hover:text-stone-900">
                {t.nav.pricing}
              </a>
            </nav>
            <div className="flex items-center gap-3 sm:gap-4">
              <LanguageSwitcher currentLocale={locale} availableLocales={SUPPORTED_LOCALES} label={languageLabel} />
              <MobileNav showLogin={!user} locale={locale} />
              {!user && (
                <Link
                  href="/login"
                  className="hidden text-sm font-medium text-stone-600 transition-colors hover:text-stone-900 sm:inline"
                >
                  {t.nav.login}
                </Link>
              )}
              <Link
                href={ctaHref}
                className="rounded-full bg-gradient-to-r from-[var(--dash-accent)] to-red-600 px-5 py-2 text-sm font-extrabold uppercase tracking-wide text-white shadow-sm transition hover:from-[var(--dash-accent-hover)] hover:to-red-700"
              >
                {ctaLabel}
              </Link>
            </div>
          </div>
        </header>
      </div>

      <section className="overflow-hidden bg-gradient-to-b from-orange-50 via-orange-50 to-white">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-16 sm:py-20 lg:grid-cols-2 lg:py-24">
          <div>
            {/* landing-audit.md brand pass: the "Toast i" mark (champagne
                flute) also lives in the header at 20px, small enough that
                almost no one clocks it as a real mark rather than a generic
                dot. A second, much larger showing here -- lightly rotated
                like a wax-seal stamp, with its own soft accent glow -- gives
                the detail a real moment to register, once per page. */}
            <div className="relative mb-6 inline-flex">
              <span
                aria-hidden="true"
                className="absolute inset-0 -m-4 rounded-full bg-[var(--dash-accent)]/25 blur-2xl"
              />
              <InvitelyLogo className="relative h-16 w-16 rotate-[-8deg] shadow-lg shadow-orange-900/15 sm:h-20 sm:w-20" />
            </div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--dash-accent-text)]">
              {t.hero.eyebrow}
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-stone-900 sm:text-5xl">
              {t.hero.headline}
            </h1>
            {/* landing-audit.md priority 18: the one deliberately "fancy"
                element on the screen, matching weddingpost.ru's own pink→
                purple→blue script accent -- a narrow, scoped exception to
                the single-CTA-color cleanup above (this is decorative text,
                not a button/interactive element). */}
            <p
              className="mt-2 inline-block bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-4xl text-transparent"
              style={{ fontFamily: "var(--font-alex-brush), cursive" }}
            >
              {t.hero.accent}
            </p>
            <p className="mt-6 max-w-md text-lg text-stone-600">{t.hero.subtext}</p>
            <ul className="mt-8 space-y-3">
              {heroChecklist.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-3 text-stone-700">
                  <span className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-orange-50 text-[var(--dash-accent-text)]">
                    <Icon className="h-4 w-4" strokeWidth={2.25} />
                  </span>
                  {text}
                </li>
              ))}
            </ul>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link
                href={ctaHref}
                className="inline-block rounded-full bg-gradient-to-r from-[var(--dash-accent)] to-red-600 px-8 py-3.5 text-base font-extrabold uppercase tracking-wide text-white shadow-md transition hover:from-[var(--dash-accent-hover)] hover:to-red-700"
              >
                {ctaLabel}
              </Link>
              <a
                href="#constructor"
                className="text-sm font-bold uppercase tracking-wide text-[var(--dash-accent-text)] transition-colors hover:text-red-700"
              >
                {t.hero.seeConstructor}
              </a>
            </div>
          </div>

          <HeroPhoneShowcase locale={locale} />
        </div>

        <div className="border-t border-orange-100/80 bg-white/60">
          <div className="mx-auto grid max-w-5xl grid-cols-2 gap-6 px-6 py-8 sm:grid-cols-4">
            {statBar.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl font-semibold text-stone-900 sm:text-3xl">{stat.value}</p>
                <p className="mt-1 text-xs text-stone-500 sm:text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="landing-reveal">
        <EventTypesSection ctaHref={ctaHref} locale={locale} />
      </div>

      <section className="landing-reveal border-t border-stone-100 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <PlatformFanSection locale={locale} />
        </div>
      </section>

      <section id="constructor" className="landing-reveal scroll-mt-[120px] py-24">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 lg:grid-cols-2">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--dash-accent-text)]">
              {t.constructorSection.eyebrow}
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-stone-900">
              {t.constructorSection.heading}
            </h2>
            <p className="mt-4 max-w-md text-stone-600">{t.constructorSection.subtext(fontCount)}</p>
            <div className="mt-8">
              <Link
                href={ctaHref}
                className="inline-block rounded-full bg-gradient-to-r from-[var(--dash-accent)] to-red-600 px-6 py-3 text-sm font-extrabold uppercase tracking-wide text-white transition hover:from-[var(--dash-accent-hover)] hover:to-red-700"
              >
                {constructorCtaLabel}
              </Link>
            </div>
          </div>
          <ConstructorScreenshot />
        </div>

        <div className="mx-auto mt-20 grid max-w-6xl grid-cols-1 gap-8 px-6 sm:grid-cols-2">
          {constructorFeatures.map(({ icon: Icon, title, description }) => (
            <div key={title} className="flex gap-4">
              <span className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-orange-50 text-[var(--dash-accent-text)]">
                <Icon className="h-5 w-5" strokeWidth={2} />
              </span>
              <div>
                <h3 className="text-base font-semibold text-stone-900">{title}</h3>
                <p className="mt-1 text-sm text-stone-600">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="landing-reveal">
        <HowItWorksSection ctaHref={ctaHref} ctaLabel={constructorCtaLabel} locale={locale} />
      </div>

      <section className="landing-reveal border-t border-stone-100 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <SiteOrPaperSection locale={locale} />
        </div>
      </section>

      <section id="themes" className="landing-reveal scroll-mt-[120px] border-t border-stone-100 bg-stone-50 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-center text-3xl font-semibold tracking-tight text-stone-900">
            {t.themesSection.heading}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-stone-600">{t.themesSection.subtext}</p>
          <div className="mt-16">
            <LandingThemeShowcase themes={showcaseThemes} />
          </div>
        </div>
      </section>

      <section id="whats-included" className="landing-reveal scroll-mt-[120px] py-24">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="text-center text-3xl font-semibold tracking-tight text-stone-900">
            {t.whatsIncluded.heading}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-stone-600">{t.whatsIncluded.subtext}</p>
          {/* landing-audit.md polish pass, item 4: 12 identical cards single-file
              on mobile read as a long, monotonous scroll -- 2 columns from the
              smallest breakpoint up (matching EventTypesSection's own grid)
              roughly halves that without cramping the icon+title+description
              layout, which fits comfortably at half width. */}
          <div className="mt-16 grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3">
            {modules.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="rounded-xl border border-stone-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-stone-300 hover:shadow-md sm:p-6"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-50 text-[var(--dash-accent-text)] sm:h-10 sm:w-10">
                  <Icon className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={2} />
                </span>
                <h3 className="mt-3 text-sm font-semibold text-stone-900 sm:mt-4 sm:text-base">{title}</h3>
                <p className="mt-1.5 text-xs text-stone-600 sm:mt-2 sm:text-sm">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="landing-reveal border-t border-stone-100 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <GuestTrackingSection locale={locale} />
        </div>
      </section>

      <section id="pricing" className="landing-reveal scroll-mt-[120px] border-t border-stone-100 bg-stone-50 py-24">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="text-center text-3xl font-semibold tracking-tight text-stone-900">
            {t.pricing.heading}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-stone-600">{t.pricing.subtext}</p>
          <div className="mt-16 grid gap-6 sm:grid-cols-3">
            {Object.values(plans).map((plan) => (
              <div
                key={plan.id}
                className="relative rounded-xl border border-stone-200 bg-white p-6 transition hover:-translate-y-0.5 hover:border-stone-300 hover:shadow-md"
              >
                {planBadges[plan.id] && (
                  <span className="absolute -top-3 left-6 rounded-full bg-gradient-to-r from-[var(--dash-accent)] to-red-600 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
                    {planBadges[plan.id]}
                  </span>
                )}
                <p className="text-sm font-semibold text-stone-900">{plan.name}</p>
                <p className="mt-2 text-3xl font-semibold text-stone-900">
                  {plan.priceEur === 0 ? t.pricing.free : `€${plan.priceEur}`}
                </p>
                <p className="mt-2 text-xs uppercase tracking-wide text-stone-400">
                  {plan.id === "free" ? t.pricing.whatYouGet : t.pricing.whatThisAdds}
                </p>
                <ul className="mt-3 space-y-2 text-sm text-stone-600">
                  {planHighlights[plan.id].map((feature) => (
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="landing-reveal border-t border-stone-100 bg-gradient-to-b from-white to-orange-50 py-24 text-center">
        <div className="mx-auto max-w-2xl px-6">
          <h2 className="text-3xl font-semibold tracking-tight text-stone-900">{t.finalCta.heading}</h2>
          <p className="mt-4 text-lg text-stone-600">{t.finalCta.subtext}</p>
          <div className="mt-8">
            <Link
              href={ctaHref}
              className="inline-block rounded-full bg-gradient-to-r from-[var(--dash-accent)] to-red-600 px-8 py-3 text-base font-extrabold uppercase tracking-wide text-white shadow-md transition hover:from-[var(--dash-accent-hover)] hover:to-red-700"
            >
              {finalCtaLabel}
            </Link>
          </div>
        </div>
      </section>

      {/* landing-audit.md priority 16/9: dark footer with real contact info,
          payment trust badges, and terms/privacy links -- the audit's
          concrete complaint was that a visitor about to pay hits a footer
          with no address, phone, or legal docs at all. We adapt rather than
          copy: weddingpost.ru's footer lists real RU business-registration
          numbers (ИНН/ОГРН/ОКВЭД) for their actual legal entity, which we
          don't have (no registered company behind this project) -- inventing
          fake registration numbers would be worse than having none, so this
          keeps only what's real (a support address) plus the payment badges
          and legal-doc links the audit's own "what to do" asks for. bg-stone-900
          reuses the one dark accent already used elsewhere (error/not-found
          pages) instead of introducing a new color. */}
      <footer className="bg-stone-900 py-16 text-stone-300">
        <div className="mx-auto max-w-5xl px-6">
          <div className="grid gap-10 sm:grid-cols-3">
            <div>
              <p className="flex items-center gap-1.5 text-lg font-semibold tracking-tight text-white">
                <InvitelyLogo className="h-5 w-5" />
                Invitely
              </p>
              <p className="mt-2 text-sm text-stone-400">{t.footer.tagline}</p>
              <div className="mt-6 flex items-center gap-3 text-xs font-semibold tracking-wide text-stone-400">
                <span className="rounded border border-stone-700 px-2 py-1">VISA</span>
                <span className="rounded border border-stone-700 px-2 py-1">MASTERCARD</span>
                <span className="rounded border border-stone-700 px-2 py-1">PAYPAL</span>
              </div>
              <p className="mt-2 text-xs text-stone-500">{t.footer.paymentAccepted}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-white">{t.footer.product}</p>
              <ul className="mt-3 space-y-2 text-sm text-stone-400">
                <li>
                  <a href="#constructor" className="transition-colors hover:text-white">
                    {t.nav.constructor}
                  </a>
                </li>
                <li>
                  <a href="#themes" className="transition-colors hover:text-white">
                    {t.nav.themes}
                  </a>
                </li>
                <li>
                  <a href="#whats-included" className="transition-colors hover:text-white">
                    {t.nav.whatsIncluded}
                  </a>
                </li>
                <li>
                  <a href="#pricing" className="transition-colors hover:text-white">
                    {t.nav.pricing}
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <p className="text-sm font-semibold text-white">{t.footer.legalAccount}</p>
              <ul className="mt-3 space-y-2 text-sm text-stone-400">
                <li>
                  <Link href="/terms" className="transition-colors hover:text-white">
                    {t.footer.terms}
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="transition-colors hover:text-white">
                    {t.footer.privacy}
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="transition-colors hover:text-white">
                    {t.footer.login}
                  </Link>
                </li>
                <li>
                  <Link href="/signup" className="transition-colors hover:text-white">
                    {t.footer.signUp}
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 flex flex-col gap-2 border-t border-stone-800 pt-6 text-sm text-stone-500 sm:flex-row sm:items-center sm:justify-between">
            <p>{t.footer.rightsReserved}</p>
            <a href="mailto:support@invitely.app" className="transition-colors hover:text-stone-300">
              support@invitely.app
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
