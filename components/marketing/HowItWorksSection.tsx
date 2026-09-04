import Link from "next/link";

interface HowItWorksStep {
  number: string;
  title: string;
  bullets: string[];
  image: string;
  alt: string;
}

const STEPS: HowItWorksStep[] = [
  {
    number: "1",
    title: "Customize your design",
    bullets: [
      "Pick from 100 designer themes, or start from a blank canvas",
      "Every theme comes fully color-coordinated, ready to use",
      "Switch styles any time — your content carries over",
    ],
    image: "/marketing/how-it-works-1.png",
    alt: "Invitely's real Style tab: choosing a designer theme",
  },
  {
    number: "2",
    title: "Edit any text, your way",
    bullets: [
      "Choose from 149+ fonts, each one previewed in its own typeface",
      "Change color, size, spacing, and alignment",
      "Click any text on the canvas to edit it instantly",
    ],
    image: "/marketing/how-it-works-2.png",
    alt: "Invitely's real font picker, open in the canvas editor",
  },
  {
    number: "3",
    title: "Add photos, video, and more",
    bullets: [
      "Upload your own photos anywhere on the design",
      "Add a video clip to bring your story to life",
      "Drop in as many text blocks as you need",
    ],
    image: "/marketing/how-it-works-3.png",
    alt: "Invitely's real \"Add element\" modal: Text, Image, and Video",
  },
  {
    number: "4",
    title: "Turn modules on and off",
    bullets: [
      "Countdown, RSVP, gift wishes, dress code, and more",
      "Each one has its own on/off switch",
      "Only show guests what's relevant to your event",
    ],
    image: "/marketing/how-it-works-4.png",
    alt: "Invitely's real module toggle, with the live countdown it controls",
  },
];

/** weddingpost.ru's "Как работает конструктор" -- the one dark section on an
 * otherwise light landing page, a numbered vertical timeline, and a real cut
 * of the actual editor UI next to each step (not an illustration). Every
 * image here is a genuine screenshot of Invitely's own dashboard, captured
 * from a real session -- see docs/research/landing-audit.md priority 8. */
interface HowItWorksSectionProps {
  ctaHref: string;
  ctaLabel: string;
}

export default function HowItWorksSection({ ctaHref, ctaLabel }: HowItWorksSectionProps) {
  return (
    <section id="how-it-works" className="bg-stone-900 py-24 text-white">
      <div className="mx-auto max-w-5xl px-6">
        <h2 className="text-center text-3xl font-semibold tracking-tight sm:text-4xl">
          How the constructor works
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-stone-400">
          Everything below happens live, right in your browser — no downloads, nothing to learn.
        </p>

        <div className="mt-16 space-y-16">
          {STEPS.map((step) => (
            <div key={step.number} className="grid gap-8 sm:grid-cols-[auto_1fr_auto] sm:items-start">
              <div className="flex sm:flex-col sm:items-center">
                <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-gradient-to-br from-[var(--dash-accent)] to-red-600 text-sm font-semibold text-white">
                  {step.number}
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
                  <img src={step.image} alt={step.alt} className="w-full" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 flex justify-center">
          <Link
            href={ctaHref}
            className="inline-block rounded-full bg-gradient-to-r from-[var(--dash-accent)] to-red-600 px-8 py-3.5 text-base font-extrabold uppercase tracking-wide text-white shadow-md transition hover:from-[var(--dash-accent-hover)] hover:to-red-700"
          >
            {ctaLabel}
          </Link>
        </div>
      </div>
    </section>
  );
}
