import type { CSSProperties } from "react";
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
  BadgeCheck,
  Info,
  HelpCircle,
  Hotel,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import InvitelyLogo from "@/components/InvitelyLogo";
import { themes } from "@/lib/themes";
import { CANVAS_FONTS } from "@/lib/canvas/fonts";
import { plans } from "@/lib/plans";
import LandingThemeShowcase from "@/components/marketing/LandingThemeShowcase";
import InvitationCardPreview from "@/components/paper/InvitationCardPreview";
import MobileNav from "@/components/marketing/MobileNav";
import EventTypesSection from "@/components/marketing/EventTypesSection";
import ConstructorScreenshot from "@/components/marketing/ConstructorScreenshot";
import HeroPhoneShowcase from "@/components/marketing/HeroPhoneShowcase";
import AmbientVideoGlow from "@/components/marketing/AmbientVideoGlow";
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

// Anchors the €19 price to one concrete, real rendered design instead of a
// bare number -- reuses InvitationCardPreview (the same component the Paper
// tab and HeroPhoneShowcase render), not a new rendering path. A richly
// decorated, popular pick (see LandingThemeShowcase's own showcase list).
const PRICING_EXAMPLE_THEME_ID = "peony-blush-burgundy";

// Icon-only lookup tables -- the translated title/description text for each
// entry now lives in lib/i18n/translations/*.ts's `landing` namespace
// (indexed positionally against these arrays, built inside Home() once
// `t` is resolved) since it depends on the request's locale, not something
// module-level constants can hold.
const HERO_CHECKLIST_ICONS = [BadgeCheck, Palette, Wand2, ClipboardCheck, Printer];
const CONSTRUCTOR_FEATURE_ICONS = [Type, Palette, Wand2, Pencil, Printer, Sliders];
const MODULE_ICONS = [
  Wand2, Sparkles, Mail, Clock, MapPin, ClipboardCheck, Timer, MessagesSquare, Video, Printer, Users2, Globe,
  HelpCircle, Hotel,
];

// Each paid tier's own `features` array starts with "Everything in ..." for
// the /dashboard/[eventId]/plan page's cumulative comparison -- on the
// landing page that reads as the generic "SaaS grid" the audit flagged, so
// this shows only what a tier newly adds. Derived from the same `plans`
// data (not a second copy) so it can't drift out of sync.
//
// Falls back to the unfiltered list (keeping "Everything in Basic") only as
// a safety net if a tier's features are ever reduced to nothing but that
// line again -- an empty "WHAT THIS ADDS" list reads as broken, not
// "nothing new."
const planHighlights: Record<string, string[]> = Object.fromEntries(
  Object.values(plans).map((plan) => {
    const added = plan.features.filter((feature) => !feature.startsWith("Everything in"));
    return [plan.id, added.length > 0 ? added : plan.features];
  })
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
    // Competitor research (Zola, Joy): both lead their hero with "free," not
    // leave it implicit until a visitor scrolls to pricing. This is the one
    // checklist line that's true before any other choice is made, so it
    // goes first.
    { icon: HERO_CHECKLIST_ICONS[0], text: t.hero.checklistFree },
    { icon: HERO_CHECKLIST_ICONS[1], text: t.hero.checklistThemes(themeCount) },
    { icon: HERO_CHECKLIST_ICONS[2], text: t.hero.checklistFonts(fontCount) },
    { icon: HERO_CHECKLIST_ICONS[3], text: t.hero.checklistRsvp },
    { icon: HERO_CHECKLIST_ICONS[4], text: t.hero.checklistPaper },
  ];

  const statBar = [
    { value: `${themeCount}`, label: t.statBar.themes },
    { value: `${fontCount}+`, label: t.statBar.fonts },
    { value: `${t.whatsIncluded.modules.length}`, label: t.statBar.modules },
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
  // Premium's one real differentiator is removing the watermark from
  // personalized/banquet materials once a host wants the printable kit for
  // real. No fabricated "-20%"-style discount badges either: unlike
  // weddingpost.ru's pricing section, nothing here is ever actually
  // discounted, so a strikethrough price would be a fake one.
  const planBadges: Record<string, string> = {
    free: t.pricing.badgeFree,
    premium: t.pricing.badgePremium,
  };

  const pricingExampleTheme = themes[PRICING_EXAMPLE_THEME_ID] ?? Object.values(themes)[0];

  return (
    <div className="marketing-shell bg-white font-sans">
      {/* 2026-10-09 accessibility audit: a long page (60+ headings) with no
          way for a keyboard user to bypass the header/nav straight to the
          actual content -- sr-only until focused, same accent color as the
          page's own CTA so it reads as this page's chrome, not a generic
          browser default. */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-[var(--dash-accent-text)] focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white focus:shadow-lg"
      >
        {t.skipToContent}
      </a>
      {/* landing-audit.md priority 19: weddingpost.ru's own site opens with a
          bar above the header, on every screen, pre-empting the "can I even
          pay from here" objection before the visitor reaches the hero.
          Sticky together with the header (one shared sticky wrapper) so it
          stays pinned exactly like the original while scrolling, instead of
          scrolling away. */}
      <div className="sticky top-0 z-40">
        {/* impeccable audit: this used to be a purple-to-pink gradient --
            a hue family that appears nowhere else in the product (every
            other accent is the warm coral/orange in --dash-accent) and
            reads as generic AI-template decoration rather than a considered
            brand choice. Solid, on-brand color instead of a gradient. */}
        <div className="bg-[var(--dash-accent-text)] py-2 text-center text-xs font-medium text-white sm:text-sm">
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
              Invimbo
            </Link>
            <nav className="hidden items-center gap-8 text-sm font-medium text-stone-600 md:flex">
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
                // 2026-10-09 design audit: plain grey text next to a loud
                // orange primary CTA read as equal to the anchor-nav links
                // around it -- a returning user's eye skipped right past
                // it. Same outlined-pill shape as the filled .landing-cta,
                // same accent color family, just not competing with it.
                <Link
                  href="/login"
                  className="hidden rounded-full border border-[var(--dash-accent-text)] px-4 py-1.5 text-sm font-semibold text-[var(--dash-accent-text)] transition-colors hover:bg-[var(--dash-accent-text)] hover:text-white md:inline"
                >
                  {t.nav.login}
                </Link>
              )}
              <Link href={ctaHref} className="landing-cta px-5 py-2 text-sm">
                {ctaLabel}
              </Link>
            </div>
          </div>
        </header>
      </div>

      <section id="main-content" className="relative isolate overflow-hidden bg-gradient-to-b from-orange-50 via-orange-50 to-white">
        {/* Round 5: replaces round 4's side-by-side phone+video card
            entirely -- direct feedback: "что если видео как-то сделать на
            заднем фоне полностью вообще? чтобы это было мило, не мешало
            секции, было видно кольца и видео само" (what if the video
            becomes the full background instead -- nice, doesn't interfere
            with the section, the rings/video itself stay visible). Same
            "full-bleed video + gradient scrim + real content on top"
            pattern researched live against Framer.com/Apple's airpods-pro
            hero earlier this session -- the video sits behind the ENTIRE
            hero (text column and phone alike), never blurred into
            unrecognizability (that was round 1/2's mistake), with only a
            gradient scrim doing the legibility work. Heavier/more opaque
            over the text column (a lot of body copy needs to read easily),
            lighter toward the phone side so the footage itself stays
            genuinely visible there, per "видно кольца" -- reversing this
            would hide the video behind exactly the area meant to show it
            off. */}
        <AmbientVideoGlow
          src="/marketing/hero-video/details-rings.mp4"
          className="absolute inset-0 -z-10 h-full w-full object-cover"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-orange-50 via-orange-50/75 to-orange-50/20" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-orange-50/40 via-transparent to-white/70" />
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-16 sm:py-20 lg:grid-cols-2 lg:py-24">
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
            <h1
              className="hero-load-item font-[family-name:var(--font-source-serif-4)] text-4xl font-normal tracking-tight text-stone-900 sm:text-5xl lg:text-6xl"
              style={{ "--stagger-i": 0 } as CSSProperties}
            >
              {t.hero.headline}
            </h1>
            {/* landing-audit.md priority 18: the one deliberately "fancy"
                element on the screen -- a narrow, scoped exception to the
                single-CTA-color cleanup above (this is decorative text, not
                a button/interactive element). impeccable audit: this used
                to be a pink-purple-blue gradient, a hue family that appears
                nowhere else in the product -- reads as generic AI-template
                decoration. Solid brand accent instead; the script font
                itself already carries the "fancy" moment. */}
            <p
              className="hero-load-item mt-2 inline-block text-4xl text-[var(--dash-accent-text)]"
              style={{ fontFamily: "var(--font-alex-brush), cursive", "--stagger-i": 1 } as CSSProperties}
            >
              {t.hero.accent}
            </p>
            <p
              className="hero-load-item mt-6 max-w-md text-lg text-stone-600"
              style={{ "--stagger-i": 2 } as CSSProperties}
            >
              {t.hero.subtext}
            </p>
            <ul className="mt-8 space-y-3">
              {heroChecklist.map(({ icon: Icon, text }, i) => (
                <li
                  key={text}
                  className="hero-load-item flex items-center gap-3 text-stone-700"
                  style={{ "--stagger-i": i + 3 } as CSSProperties}
                >
                  <span className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-orange-50 text-[var(--dash-accent-text)]">
                    <Icon className="h-4 w-4" strokeWidth={2.25} />
                  </span>
                  {text}
                </li>
              ))}
            </ul>

            <div
              className="hero-load-item mt-10 flex flex-wrap items-center gap-4"
              style={{ "--stagger-i": 7 } as CSSProperties}
            >
              <Link href={ctaHref} className="landing-cta px-8 py-3.5 text-base">
                {ctaLabel}
              </Link>
              <a
                href="#constructor"
                className="text-sm font-semibold text-[var(--dash-accent-text)] underline decoration-1 underline-offset-4 transition-colors hover:text-stone-900"
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
            <h2 className="font-[family-name:var(--font-source-serif-4)] text-3xl font-normal tracking-tight text-stone-900 sm:text-4xl">
              {t.constructorSection.heading}
            </h2>
            <p className="mt-4 max-w-md text-stone-600">{t.constructorSection.subtext(fontCount)}</p>
            <div className="mt-8">
              <Link href={ctaHref} className="landing-cta px-6 py-3 text-sm">
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
          <h2 className="font-[family-name:var(--font-source-serif-4)] text-center text-3xl font-normal tracking-tight text-stone-900">
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
          <h2 className="font-[family-name:var(--font-source-serif-4)] text-center text-3xl font-normal tracking-tight text-stone-900">
            {t.whatsIncluded.heading}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-stone-600">{t.whatsIncluded.subtext}</p>
          {/* landing-audit.md polish pass, item 4: 12 identical cards single-file
              on mobile read as a long, monotonous scroll -- 2 columns from the
              smallest breakpoint up (matching EventTypesSection's own grid)
              roughly halves that without cramping the icon+title+description
              layout, which fits comfortably at half width. */}
          <div className="mt-16 grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3">
            {modules.map(({ icon: Icon, title, description }, i) => (
              <div
                key={title}
                className="landing-reveal-item rounded-xl border border-stone-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-stone-300 hover:shadow-md sm:p-6"
                style={{ "--stagger-i": i % 6 } as CSSProperties}
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
          <h2 className="font-[family-name:var(--font-source-serif-4)] text-center text-3xl font-normal tracking-tight text-stone-900">
            {t.pricing.heading}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-stone-600">{t.pricing.subtext}</p>
          <div className="mt-16 grid gap-10 lg:grid-cols-[auto_1fr] lg:items-start">
            {/* Anchors the price to a real, finished result rather than
                leaving it as an abstract number next to text -- see
                PRICING_EXAMPLE_THEME_ID's own comment. */}
            <div className="mx-auto w-48 shrink-0 -rotate-2 sm:w-56 lg:mx-0">
              {/* InvitationCardPreview's FlipCard renders its faces
                  `position: absolute`, which contributes zero height to a
                  block-level parent and collapses the whole card to 0px --
                  same bug class PlatformFanSection.module.css's `.item`
                  comment already documents. `grid` + a definite
                  `aspect-ratio` (same 420/595 ratio used there) is the
                  proven fix: the grid item stretches to fill the
                  aspect-ratio-derived box instead of collapsing. */}
              <div className="grid aspect-[420/595] overflow-hidden rounded-2xl shadow-[0_24px_50px_-20px_rgba(60,40,20,0.35)] ring-4 ring-white">
                <InvitationCardPreview
                  theme={pricingExampleTheme}
                  names={["Claire", "Nathaniel"]}
                  eventDate="2027-05-15"
                  side="front"
                  locale={locale}
                />
              </div>
              <p className="mt-3 hidden text-center text-xs text-stone-500 lg:block">{t.pricing.exampleCaption}</p>
            </div>
            <div>
              <p className="-mt-6 mb-6 text-center text-xs text-stone-500 lg:hidden">{t.pricing.exampleCaption}</p>
              <div className="grid gap-6 sm:grid-cols-3">
                {Object.values(plans).map((plan, i) => (
                  <div
                    key={plan.id}
                    className="landing-reveal-item relative rounded-xl border border-stone-200 bg-white p-6 transition hover:-translate-y-0.5 hover:border-stone-300 hover:shadow-md"
                    style={{ "--stagger-i": i } as CSSProperties}
                  >
                    {planBadges[plan.id] && (
                      <span className="absolute -top-3 left-6 rounded-full bg-[var(--dash-accent)] px-3 py-1 text-[11px] font-semibold text-white">
                        {planBadges[plan.id]}
                      </span>
                    )}
                    <p className="text-sm font-semibold text-stone-900">{plan.name}</p>
                    <p className="mt-2 text-3xl font-semibold text-stone-900">
                      {plan.priceEur === 0 ? t.pricing.free : `€${plan.priceEur}`}
                    </p>
                    {/* Verified true: app/dashboard/[eventId]/plan/actions.ts's
                        createCheckoutSession uses Stripe mode: "payment" (a
                        single charge), never mode: "subscription" -- matches
                        the identical claim already made on the dashboard's
                        own Plan page (PlanSelectForm.tsx). */}
                    {plan.priceEur > 0 && <p className="mt-0.5 text-xs text-stone-400">{t.pricing.oneTime}</p>}
                    <p className="mt-2 text-xs uppercase tracking-wide text-stone-400">
                      {plan.id === "free" ? t.pricing.whatYouGet : t.pricing.whatThisAdds}
                    </p>
                    <ul className="mt-3 space-y-2 text-sm text-stone-600">
                      {planHighlights[plan.id].map((feature) => (
                        <li key={feature}>{feature}</li>
                      ))}
                    </ul>
                    {/* Free really does publish a live site (see
                        app/e/[slug]/page.tsx -- visibility is gated on
                        event.status === "published", never on plan_id), so
                        removing this card would misrepresent the product.
                        The honest fix is naming its one trade-off here --
                        and naming it where a visitor actually reads it.
                        Direct product-owner correction: the original
                        text-xs/text-stone-500 treatment was the same muted
                        fine-print register as every other card's throwaway
                        detail, so it read as hedge-y small print rather
                        than the one fact most likely to change a visitor's
                        decision. A visitor deciding whether Free is enough
                        for them needs this to be the second thing they see
                        on this card, not the last. */}
                    {plan.id === "free" && (
                      <p className="mt-3 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-2.5 text-sm font-medium text-amber-900">
                        <Info className="mt-0.5 h-4 w-4 flex-none" aria-hidden="true" />
                        <span>{t.pricing.freeCaveat}</span>
                      </p>
                    )}
                  </div>
                ))}
              </div>
              <p className="mt-6 text-center text-sm text-stone-500 sm:text-left">{t.pricing.valueAnchor}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="landing-reveal relative isolate overflow-hidden border-t border-stone-100 bg-gradient-to-b from-white to-orange-50 py-24">
        {/* Round 2: a full-bleed blurred-past-recognition background here had
            the same "нет нашего видео" problem as the hero's old ambient
            glow -- and this clip is 9:16, so stretching/cropping it to fill
            a wide landscape section ("h-[140%] w-[140%]") also chopped the
            footage into something that read as broken/cut off
            ("оборванное"), not intentional. A vertical clip belongs in a
            vertical frame: a small tilted video card off to the side (same
            "real object peeking in" idea as the hero's own video card,
            phone, and paper stack) keeps its native 9:16 aspect intact and
            stays sharp instead of smeared. */}
        <div className="mx-auto grid max-w-4xl items-center gap-10 px-6 text-center md:grid-cols-[1fr_auto] md:text-left">
          <div>
            <h2 className="font-[family-name:var(--font-source-serif-4)] text-3xl font-normal tracking-tight text-stone-900">{t.finalCta.heading}</h2>
            <p className="mt-4 text-lg text-stone-600">{t.finalCta.subtext}</p>
            <div className="mt-8">
              <Link href={ctaHref} className="landing-cta px-8 py-3 text-base">
                {finalCtaLabel}
              </Link>
            </div>
          </div>
          {/* Bumped from w-36/sm:w-44 -- direct feedback on the hero's own
              video card applies here too: needs to read as a real,
              phone/tablet-scale showcase item, not a small accent. */}
          <div className="mx-auto w-52 shrink-0 -rotate-3 overflow-hidden rounded-2xl shadow-[0_24px_50px_-20px_rgba(60,40,20,0.35)] ring-4 ring-white sm:w-72">
            <AmbientVideoGlow
              src="/marketing/hero-video/details-garden-vertical.mp4"
              className="aspect-[9/16] w-full object-cover saturate-[1.1]"
            />
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
                Invimbo
              </p>
              <p className="mt-2 text-sm text-stone-400">{t.footer.tagline}</p>
              <div className="mt-6 flex items-center gap-3 text-xs font-semibold tracking-wide text-stone-400">
                <span className="rounded border border-stone-700 px-2 py-1">VISA</span>
                <span className="rounded border border-stone-700 px-2 py-1">MASTERCARD</span>
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
            <a href="mailto:support@invimbo.com" className="transition-colors hover:text-stone-300">
              support@invimbo.com
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
