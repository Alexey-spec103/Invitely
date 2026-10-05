import type { CSSProperties } from "react";
import Link from "next/link";
import { getDictionary } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/locales";

interface HowItWorksStepMeta {
  number: string;
  image: string;
  alt: string;
}

// number/image/alt are design data, not copy -- zipped by index against
// landing.howItWorksSection.steps (title/bullets) below. alt text stays
// English (accessibility-only screenshot descriptions of the constructor
// UI, not something a guest reads).
const STEP_META: HowItWorksStepMeta[] = [
  { number: "1", image: "/marketing/how-it-works-1.png", alt: "Invimbo's real Style tab: choosing a designer theme" },
  { number: "2", image: "/marketing/how-it-works-2.png", alt: "Invimbo's real Wedding data form: names, date, and venue" },
  { number: "3", image: "/marketing/how-it-works-3.png", alt: "Invimbo's real module toggle, with the live countdown it controls" },
  { number: "4", image: "/marketing/how-it-works-4.png", alt: "Invimbo's real invitation kit: paper cards and the live site link" },
];

/** weddingpost.ru's "Как работает конструктор" -- the one dark section on an
 * otherwise light landing page, a numbered vertical timeline, and a real cut
 * of the actual editor UI next to each step (not an illustration). Every
 * image here is a genuine screenshot of Invimbo's own dashboard, captured
 * from a real session -- see docs/research/landing-audit.md priority 8. */
interface HowItWorksSectionProps {
  ctaHref: string;
  ctaLabel: string;
  locale: Locale;
}

export default function HowItWorksSection({ ctaHref, ctaLabel, locale }: HowItWorksSectionProps) {
  const t = getDictionary(locale).landing.howItWorksSection;

  return (
    <section id="how-it-works" className="bg-stone-900 py-24 text-white">
      <div className="mx-auto max-w-5xl px-6">
        <h2 className="text-center text-3xl font-semibold tracking-tight sm:text-4xl">{t.heading}</h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-stone-400">{t.subtext}</p>

        <div className="mt-16 space-y-16">
          {t.steps.map((step, index) => {
            const meta = STEP_META[index];
            return (
              <div
                key={meta.number}
                className="landing-reveal-item grid gap-8 sm:grid-cols-[auto_1fr_auto] sm:items-start"
                style={{ "--stagger-i": index } as CSSProperties}
              >
                <div className="flex sm:flex-col sm:items-center">
                  <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-[var(--dash-accent)] text-sm font-semibold text-white">
                    {meta.number}
                  </span>
                  <span
                    className="ml-4 hidden w-px flex-1 bg-gradient-to-b from-[var(--dash-accent)] to-transparent sm:mt-2 sm:ml-0 sm:block"
                    aria-hidden="true"
                  />
                </div>

                <div className="sm:pt-1">
                  <h3 className="text-xl font-semibold">{step.title}</h3>
                  <ul className="mt-4 space-y-2 text-sm text-stone-400">
                    {step.bullets.map((bullet) => (
                      <li key={bullet} className="flex gap-2">
                        <span className="mt-1.5 h-1 w-1 flex-none rounded-full bg-[var(--dash-accent)]" />
                        {bullet}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="sm:w-[280px]">
                  <div className="overflow-hidden rounded-xl border border-white/10 bg-black/20 shadow-2xl">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={meta.image} alt={meta.alt} className="w-full" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-16 flex justify-center">
          <Link href={ctaHref} className="landing-cta px-8 py-3.5 text-base">
            {ctaLabel}
          </Link>
        </div>
      </div>
    </section>
  );
}
