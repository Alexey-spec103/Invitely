"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm, useWatch, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { track } from "@vercel/analytics";
import { motion } from "framer-motion";
import { usePrefersReducedMotion } from "@/components/usePrefersReducedMotion";
import { HeroSection, DEFAULT_HERO_VARIANT, HERO_VARIANTS } from "@/components/sections/HeroSection";
import type { HeroVariant } from "@/components/sections/HeroSection";
import ThemeProvider from "@/components/theme/ThemeProvider";
import ThemeGallery from "@/components/theme/ThemeGallery";
import PhotoDropzone from "@/components/ui/PhotoDropzone";
import HowItWorksClip from "./HowItWorksClip";
import { themes, DEFAULT_THEME_ID, getTheme } from "@/lib/themes";
import { recommendedHeroVariantFor } from "@/lib/themes/recommendedHeroVariant";
import { effectiveDecorCategory } from "@/lib/themes/decorMotifs";
import { DEFAULT_EVENT_TYPE_ID, getEventType } from "@/lib/eventTypes";
import { getLocalizedEventType, getLocalizedEventTypeList } from "@/lib/eventTypesLocalized";
import { EVENT_TYPE_ICON_COMPONENTS } from "@/lib/eventTypeIcons";
import { CalendarHeart } from "lucide-react";
import { completeOnboarding } from "./actions";
import { getDictionary, type Dictionary } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/locales";

// Built per-locale (see buildOnboardingSchema below, called via useMemo keyed
// on `dict`) rather than as a single module-level constant, since every
// validation message needs to come out in the guest's own language -- the
// shape (which fields, which are required) never changes across locales,
// only the messages do.
function buildOnboardingSchema(t: Dictionary["onboarding"]) {
  return z
    .object({
      eventType: z.string().min(1, t.validation.pickEventType),
      themeId: z.string().min(1, t.validation.pickStyle),
      name1: z.string().min(1, t.validation.enterName),
      name2: z.string(),
      photoUrl: z.string(),
      eventDate: z.string().min(1, t.validation.enterDate),
    })
    .superRefine((data, ctx) => {
      if (getEventType(data.eventType).namesMode === "couple" && !data.name2?.trim()) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: t.validation.enterName, path: ["name2"] });
      }
    });
}

type OnboardingFormValues = z.infer<ReturnType<typeof buildOnboardingSchema>>;

// multi-step-form-design + onboarding-wizard-design audits (2026-10-12):
// two independent findings on the old 4-step order, both acted on here.
// (1) themeId used to come right after eventType, before the user had
// typed anything personal -- the highest-effort, most-browsing step
// opened the form instead of a low-friction identity step building
// investment first. Names now comes second, theme last.
// (2) eventDate was a single-field step on its own -- the textbook
// "arbitrary chunking" anti-pattern (1-2 fields, no reason to be its own
// page). Folded into the names step as a combined "who & when" step --
// neither is individually high-effort, and it drops the wizard from 4
// steps to 3 without losing any real staging.
const STEPS = ["eventType", "names", "themeId"] as const;
type StepKey = (typeof STEPS)[number];
const STEP_FIELDS: Record<StepKey, (keyof OnboardingFormValues)[]> = {
  eventType: ["eventType"],
  names: ["name1", "name2", "eventDate"],
  themeId: ["themeId"],
};

// onboarding-wizard-design + multi-step-form-design audits (2026-10-12),
// both independently flagged the same gap: wizard state lived only in
// React component state, so a refresh, an accidental tab close, or any
// interruption mid-flow (realistic for event planning done on a phone)
// lost everything, including an uploaded photo and a theme pick made
// after browsing up to 124 options. Same localStorage-draft shape this
// session's FeatureCarousel already uses for its own dismiss-persistence.
const ONBOARDING_DRAFT_KEY = "invimbo:onboardingDraft:v1";
// A months-old abandoned draft resurfacing without context would read as
// a bug, not a feature -- expiring it keeps "resume where I left off"
// limited to genuinely recent interruptions.
const ONBOARDING_DRAFT_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

interface OnboardingDraft {
  savedAt: number;
  step: number;
  values: OnboardingFormValues;
}

function readOnboardingDraft(): OnboardingDraft | null {
  try {
    const raw = localStorage.getItem(ONBOARDING_DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<OnboardingDraft>;
    if (typeof parsed.savedAt !== "number" || typeof parsed.step !== "number" || !parsed.values) {
      return null;
    }
    if (Date.now() - parsed.savedAt > ONBOARDING_DRAFT_MAX_AGE_MS) {
      return null;
    }
    return parsed as OnboardingDraft;
  } catch {
    // Private-browsing/restricted storage, or malformed JSON -- treat the
    // same as "no draft," never crash the wizard over this.
    return null;
  }
}

function writeOnboardingDraft(step: number, values: OnboardingFormValues) {
  try {
    const draft: OnboardingDraft = { savedAt: Date.now(), step, values };
    localStorage.setItem(ONBOARDING_DRAFT_KEY, JSON.stringify(draft));
  } catch {
    // Storage full/restricted -- draft just won't persist, not fatal.
  }
}

function clearOnboardingDraft() {
  try {
    localStorage.removeItem(ONBOARDING_DRAFT_KEY);
  } catch {
    // ignore
  }
}

function resolveInitialThemeId(requested: string | null): string {
  if (!requested) return DEFAULT_THEME_ID;
  try {
    return getTheme(requested).id;
  } catch {
    return DEFAULT_THEME_ID;
  }
}

/** A real (anonymous, if they had no session at all) session always exists
 * by the time this renders -- see `lib/supabase/proxy.ts` -- so every
 * completed wizard, logged in or not, persists the same way: one
 * `completeOnboarding` call after the last step, straight into the
 * dashboard. Account creation is a separate, later, dismissible prompt
 * (`AnonymousAccountBanner`), not a step in here. */
export default function OnboardingWizard({ locale }: { locale: Locale }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const reduceMotion = usePrefersReducedMotion();
  const [formError, setFormError] = useState<string | null>(null);
  // zodResolver validates the whole schema on every trigger() call (Zod has
  // no concept of partial-object validation once a .superRefine() is
  // involved), so an early step's own trigger() already resolves later,
  // still-untouched fields as invalid and stores that in `errors` -- without
  // this gate, eventDate's "required" message was showing in red the
  // instant its step first rendered, before the date input had been
  // touched at all. Scoped per step (not per field): each step's JSX only ever
  // reads the error(s) belonging to that step, so one Set suffices.
  const [attemptedSteps, setAttemptedSteps] = useState<Set<number>>(new Set());

  const dict = getDictionary(locale);
  const t = dict.onboarding;
  const onboardingSchema = useMemo(() => buildOnboardingSchema(t), [t]);

  const {
    register,
    handleSubmit,
    trigger,
    control,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<OnboardingFormValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      eventType: DEFAULT_EVENT_TYPE_ID,
      themeId: resolveInitialThemeId(searchParams.get("theme")),
      name1: "",
      name2: "",
      photoUrl: "",
      eventDate: "",
    },
  });

  const eventTypeId = useWatch({ control, name: "eventType" });
  const themeId = useWatch({ control, name: "themeId" });
  const name1 = useWatch({ control, name: "name1" });
  const name2 = useWatch({ control, name: "name2" });
  const photoUrl = useWatch({ control, name: "photoUrl" });
  const eventDate = useWatch({ control, name: "eventDate" });

  const eventType = getLocalizedEventType(eventTypeId, locale);
  const isCoupleMode = eventType.namesMode === "couple";

  const isLastStep = step === STEPS.length - 1;
  const stepKey = STEPS[step];

  let selectedTheme;
  try {
    selectedTheme = getTheme(themeId);
  } catch {
    selectedTheme = getTheme(DEFAULT_THEME_ID);
  }

  const previewHeroVariant = (() => {
    const recommended = recommendedHeroVariantFor(selectedTheme.id, selectedTheme.category);
    return HERO_VARIANTS.includes(recommended as HeroVariant)
      ? (recommended as HeroVariant)
      : DEFAULT_HERO_VARIANT;
  })();

  const previewNames = isCoupleMode
    ? [name1 || eventType.namePrompts[0], name2 || eventType.namePrompts[1]]
    : [name1 || eventType.namePrompts[0]];

  // Restores a saved draft once, on mount -- deliberately not combined
  // with the save-effect below despite both touching the same data, so
  // this runs exactly once regardless of how often the watched fields
  // change afterward. Any divergence between this effect's run and the
  // save-effect seeing stale (pre-restore) values on this same first
  // commit self-corrects on the very next render once reset()/setStep()
  // land, which the skip-first-run guard below prevents from mattering
  // anyway (see isFirstDraftSaveRef).
  useEffect(() => {
    const draft = readOnboardingDraft();
    if (draft) {
      // A `?theme=` link (e.g. "Start with this theme" elsewhere in the
      // product) is a fresh, explicit choice made just now -- it should win
      // over whatever an older abandoned draft happened to have selected,
      // not get silently overridden by it.
      const requestedTheme = searchParams.get("theme");
      reset(requestedTheme ? { ...draft.values, themeId: resolveInitialThemeId(requestedTheme) } : draft.values);
      setStep(Math.min(Math.max(draft.step, 0), STEPS.length - 1));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Skips the very first effect run (the initial mount, before the
  // restore effect above has had a chance to land its reset()/setStep()
  // in a committed render) so this never has a window to write blank
  // defaults over a draft that was just read -- only real, user-driven
  // changes (including the change reset()/setStep() themselves cause)
  // persist from here on.
  const isFirstDraftSaveRef = useRef(true);
  useEffect(() => {
    if (isFirstDraftSaveRef.current) {
      isFirstDraftSaveRef.current = false;
      return;
    }
    writeOnboardingDraft(step, { eventType: eventTypeId, themeId, name1, name2, photoUrl, eventDate });
  }, [step, eventTypeId, themeId, name1, name2, photoUrl, eventDate]);

  // onboarding-wizard-design audit (2026-10-12): zero drop-off
  // instrumentation existed anywhere in this flow -- no way to know which
  // step loses people, or whether completing the wizard correlates with
  // actually using the product afterward. `stepKey` dependency (not
  // `step`) means this also fires correctly on a restored draft landing
  // on a step other than 0.
  useEffect(() => {
    track("onboarding_step_view", { step: stepKey, stepIndex: step });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepKey]);

  const goToStep = (next: number, dir: 1 | -1) => {
    setDirection(dir);
    setStep(next);
  };

  const handleNext = async () => {
    setAttemptedSteps((prev) => new Set(prev).add(step));
    const isValid = await trigger(STEP_FIELDS[stepKey]);
    if (isValid) {
      goToStep(step + 1, 1);
    }
  };

  const handleBack = () => {
    setFormError(null);
    goToStep(Math.max(0, step - 1), -1);
  };

  const onSubmit = async (values: OnboardingFormValues) => {
    setFormError(null);
    try {
      const result = await completeOnboarding(values);
      if (!result.ok) throw new Error(result.message);
      track("onboarding_completed", { eventType: values.eventType });
      clearOnboardingDraft();
      // Straight to this event's own Site tab (skips /dashboard's own
      // redirect-to-events[0] hop), flagged as a first visit so the Site
      // page can lead with the finished site instead of the settings/
      // upsell cards -- see SitePage's own firstVisit handling.
      router.push(`/dashboard/${result.eventId}/site?firstVisit=1`);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : t.saveFailed);
    }
  };

  // The theme step's own ThemeGalleryCard already renders a live mockup per
  // card, so the side "Preview" panel below is redundant noise for this one
  // step -- dropped here and the form widened to fill both columns instead,
  // giving the gallery real room (matches the dashboard's own unconstrained
  // ThemeSelectForm sizing, app/dashboard/[eventId]/style/ThemeSelectForm.tsx)
  // rather than squeezing a sidebar+card-grid component into half a narrow
  // column, which was making style names/thumbnails too small to read.
  //
  // eventType gets the same wide/no-preview treatment for a different
  // reason: the side "Preview" panel always renders the same generic
  // monogram-card mockup on this step regardless of which event type is
  // picked (nothing about the choice changes it), so it's pure dead weight
  // here -- confirmed live and flagged directly. Widening the category
  // grid instead gives the 12 event types more visible room.
  const hidesPreviewPanel = stepKey === "themeId" || stepKey === "eventType";

  return (
    <div
      className={
        hidesPreviewPanel
          ? "block"
          : "mx-auto grid max-w-3xl gap-8 sm:grid-cols-2 sm:items-center"
      }
    >
      <form
        onSubmit={handleSubmit(onSubmit, () => setAttemptedSteps((prev) => new Set(prev).add(step)))}
        className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm"
        noValidate
      >
        {/* accessibility-audit (2026-10-12): a sighted user sees this counter
            update on every step change; a screen-reader user previously got
            no signal at all that the step/page had changed beyond whatever
            content happened to differ. aria-live="polite" announces it
            without interrupting whatever the user was already doing. */}
        <p className="text-xs font-medium uppercase tracking-wide text-gray-500" aria-live="polite">
          {t.stepOf(step + 1, STEPS.length)}
        </p>

        {/* URGENT fix (2026-10-15): this used to be an AnimatePresence
            (mode="wait") wrapping this motion.div, animating both the
            outgoing step's exit and the incoming step's enter. Confirmed
            live, including on production, that the exit transition could
            get stuck indefinitely: the outgoing panel stayed rendered at
            its full resting style (opacity:1, no transform -- never even
            reaching its own exit target, let alone completing it), and
            since AnimatePresence in "wait" mode holds the next step back
            until the exit it's tracking resolves, the real step 2/3 content
            underneath simply never appeared -- a dead end blocking every
            new visitor from finishing onboarding at all. Root cause wasn't
            pinned down further (reproducible on a clean build, not a dev/
            HMR artifact) -- correctness over polish: dropped AnimatePresence
            entirely. The entering step still gets its own fade/slide-in via
            a plain keyed motion.div (no `exit` prop, so React just unmounts
            the previous one immediately on key change, no animated exit to
            get stuck on). */}
        <motion.div
          key={stepKey}
          initial={reduceMotion ? false : { opacity: 0, x: 24 * direction }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
            {stepKey === "eventType" && (
              <div className="mt-4">
                <label className="block text-lg font-semibold text-gray-900">
                  {t.eventTypeStep.heading}
                </label>
                <p className="mt-1 text-sm text-gray-500">{t.eventTypeStep.subtext}</p>

                <div className="relative mt-4">
                  <div className="grid max-h-[28rem] grid-cols-2 gap-2 overflow-y-auto pr-1 sm:grid-cols-3 lg:grid-cols-4">
                    {getLocalizedEventTypeList(locale).map((type) => {
                      const Icon = EVENT_TYPE_ICON_COMPONENTS[type.icon] ?? CalendarHeart;
                      const isSelected = type.id === eventTypeId;
                      return (
                        <button
                          key={type.id}
                          type="button"
                          onClick={() => setValue("eventType", type.id, { shouldValidate: true })}
                          aria-pressed={isSelected}
                          className={
                            isSelected
                              ? "flex items-center gap-2 rounded-lg border-2 border-rose-600 p-3 text-left transition"
                              : "flex items-center gap-2 rounded-lg border border-gray-200 p-3 text-left transition hover:border-gray-300"
                          }
                        >
                          <Icon className="h-4 w-4 shrink-0 text-rose-600" aria-hidden="true" />
                          <span className="text-sm font-medium text-gray-900">{type.label}</span>
                        </button>
                      );
                    })}
                  </div>
                  {/* All 12 types always overflow this fixed max-height, so a
                      static fade (not scroll-position-tracked) is enough to
                      show more sits below the fold -- the audit found the
                      thin scrollbar alone easy to miss, reading as "the list
                      ends at Holiday Party." */}
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-white to-transparent"
                  />
                </div>
              </div>
            )}

            {stepKey === "themeId" && (
              <div className="mt-4">
                <label className="block text-lg font-semibold text-gray-900">{t.styleStep.heading}</label>
                <p className="mt-1 text-sm text-gray-500">{t.styleStep.subtext}</p>

                <HowItWorksClip locale={locale} />

                <div className="mt-4 max-h-[52rem] overflow-y-auto pr-1">
                  <ThemeGallery
                    themes={Object.values(themes)}
                    selectedId={themeId}
                    onSelect={(id) => setValue("themeId", id, { shouldValidate: true })}
                  />
                </div>
              </div>
            )}

            {stepKey === "names" && (
              <div className="mt-4">
                <label htmlFor="name1" className="block text-lg font-semibold text-gray-900">
                  {isCoupleMode ? "💑" : "✨"} {eventType.namePrompts[0]}
                </label>
                <input
                  id="name1"
                  type="text"
                  autoFocus
                  className="mt-4 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
                  aria-invalid={attemptedSteps.has(step) && errors.name1 ? true : undefined}
                  aria-describedby={attemptedSteps.has(step) && errors.name1 ? "name1-error" : undefined}
                  {...register("name1")}
                />
                {attemptedSteps.has(step) && errors.name1 && (
                  <p id="name1-error" role="alert" className="mt-1 text-sm text-red-600">
                    {errors.name1.message}
                  </p>
                )}
                {/* Single/title-mode titleTemplate appends a possessive +
                    the event type (e.g. "{name}'s Birthday") on top of
                    whatever's typed here -- confirmed live this reads as
                    broken ("Mia's 7th Birthday Bash & Celebration's
                    Birthday") the moment a host types a fuller phrase
                    instead of a bare first name, which this field's own
                    generic "Who's celebrating?" prompt does nothing to
                    discourage. The dashboard/browser-tab title is the only
                    place that ever showed the composed form before now --
                    surfacing it live, right where the host can still just
                    shorten what they typed, beats discovering it after the
                    site already exists. */}
                {!isCoupleMode && name1?.trim() && (
                  <p className="mt-2 text-sm text-gray-500">
                    Your site will be titled "{eventType.titleTemplate([name1.trim()])}"
                  </p>
                )}

                {isCoupleMode && (
                  <>
                    <label htmlFor="name2" className="mt-4 block text-lg font-semibold text-gray-900">
                      {eventType.namePrompts[1]}
                    </label>
                    <input
                      id="name2"
                      type="text"
                      className="mt-4 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
                      aria-invalid={attemptedSteps.has(step) && errors.name2 ? true : undefined}
                      aria-describedby={attemptedSteps.has(step) && errors.name2 ? "name2-error" : undefined}
                      {...register("name2")}
                    />
                    {attemptedSteps.has(step) && errors.name2 && (
                      <p id="name2-error" role="alert" className="mt-1 text-sm text-red-600">
                        {errors.name2.message}
                      </p>
                    )}
                  </>
                )}

                {/* multi-step-form-design audit (2026-10-12): eventDate used
                    to be its own step -- a single field with nothing else on
                    it, the "arbitrary chunking" anti-pattern this skill
                    flags by name. Folded in here instead: neither "who" nor
                    "when" is individually high-effort, so combining them
                    loses no real staging while cutting the wizard from 4
                    steps to 3. */}
                <label htmlFor="eventDate" className="mt-5 block text-lg font-semibold text-gray-900">
                  📅 {eventType.dateLabel}
                </label>
                <input
                  id="eventDate"
                  type="date"
                  className="mt-4 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
                  aria-invalid={attemptedSteps.has(step) && errors.eventDate ? true : undefined}
                  aria-describedby={attemptedSteps.has(step) && errors.eventDate ? "eventDate-error" : undefined}
                  {...register("eventDate")}
                />
                {attemptedSteps.has(step) && errors.eventDate && (
                  <p id="eventDate-error" role="alert" className="mt-1 text-sm text-red-600">{errors.eventDate.message}</p>
                )}

                <div className="mt-5">
                  <Controller
                    control={control}
                    name="photoUrl"
                    render={({ field }) => (
                      <PhotoDropzone
                        value={field.value || undefined}
                        onChange={(url) => field.onChange(url ?? "")}
                        label={t.photo.label}
                        helpText={t.photo.help}
                        dropHint={t.photo.dropHint}
                        busyHint={t.photo.busyHint}
                        changeLabel={t.photo.changeLabel}
                        removeLabel={t.photo.removeLabel}
                        errorFallback={t.photo.errorFallback}
                      />
                    )}
                  />
                </div>
              </div>
            )}
        </motion.div>

        {formError && (
          <p role="alert" className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{formError}</p>
        )}

        {/* sticky, not just mt-6 -- step 2's theme gallery renders inside its
            own max-h-[52rem] scroll container, which on a typical viewport
            is itself taller than the screen. A user scrolling *inside* the
            gallery looking for a way to confirm their pick never finds one
            there, and the real Next button sits below it, out of view,
            discoverable only by then scrolling the *outer* page too -- the
            same nested-scroll confusion behind the login-link complaint
            found elsewhere today. Pinning the footer to the viewport bottom
            means Next/Back are always reachable regardless of how tall any
            given step's own content gets, not just a one-off fix sized to
            today's 124-theme count. bg-white matches the card's own
            background so scrolled content doesn't show through underneath;
            the negative margins + matching padding let the bar span the
            card's full width (the form has its own p-8) instead of just the
            inner content column. z-10 -- confirmed live: without it, step
            2's own per-card countdown-timer demo (ThemeGallery.module.css's
            .phoneTimer, z-index: 2 inside the scrollable gallery) visibly
            bled through this bar's white background whenever a card's
            bottom edge happened to scroll to the same screen position as
            this footer -- a plain opaque bg-white isn't enough on its own
            to win a stacking fight against a positioned descendant with its
            own z-index. */}
        <div className="relative z-10 -mx-8 sticky bottom-0 mt-6 flex items-center justify-between border-t border-gray-100 bg-white px-8 py-4">
          <button
            type="button"
            onClick={handleBack}
            disabled={step === 0}
            className="text-sm font-medium text-gray-500 transition hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-0"
          >
            {t.back}
          </button>

          {/* Explicit, distinct `key`s on these two branches -- without them,
              React reconciles both as "the same motion.button in this JSX
              slot" and mutates the existing DOM node's `type` attribute in
              place instead of swapping elements. If `handleNext`'s trigger()
              resolves (and advances `step`) inside the brief window between
              a click's mousedown and mouseup, the physical button a real
              click is mid-gesture on flips from type="button" to
              type="submit" under the user's finger -- so the SAME click that
              was meant to move off the names step also fires a real,
              premature form submission on whatever step comes next.
              Confirmed live: this is exactly how eventDate's "required"
              error was appearing before the date field had ever been
              touched. Distinct keys force a real unmount/remount instead. */}
          {isLastStep ? (
            <motion.button
              key="submit"
              type="submit"
              disabled={isSubmitting}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="rounded-full bg-rose-600 px-6 py-2 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? t.saving : t.createSite}
            </motion.button>
          ) : (
            <motion.button
              key="next"
              type="button"
              onClick={handleNext}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="rounded-full bg-rose-600 px-6 py-2 text-sm font-semibold text-white transition hover:bg-rose-700"
            >
              {t.next}
            </motion.button>
          )}
        </div>
      </form>

      {!hidesPreviewPanel && (
        <div className="relative h-[420px] overflow-hidden rounded-xl border border-gray-200 bg-white">
          <span className="absolute left-3 top-3 z-10 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-500 shadow-sm">
            {t.previewBadge}
          </span>
          <div className="absolute top-1/2 left-1/2 w-[200%] -translate-x-1/2 -translate-y-1/2 scale-50">
            <ThemeProvider theme={selectedTheme}>
              <HeroSection
                variant={previewHeroVariant}
                names={previewNames}
                eventDate={eventDate || ""}
                locale={locale}
                photoUrl={photoUrl || undefined}
                eyebrow={eventType.heroEyebrow}
                themeCategory={effectiveDecorCategory(selectedTheme)}
              />
            </ThemeProvider>
          </div>
        </div>
      )}
    </div>
  );
}
