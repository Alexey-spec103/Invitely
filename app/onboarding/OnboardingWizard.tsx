"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useForm, useWatch, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import {
  Heart,
  Sparkles,
  Gem,
  Cake,
  Baby,
  PartyPopper,
  Crown,
  GraduationCap,
  Building2,
  Award,
  CalendarHeart,
  type LucideIcon,
} from "lucide-react";
import { HeroSection, DEFAULT_HERO_VARIANT, HERO_VARIANTS } from "@/components/sections/HeroSection";
import type { HeroVariant } from "@/components/sections/HeroSection";
import ThemeProvider from "@/components/theme/ThemeProvider";
import ThemeGallery from "@/components/theme/ThemeGallery";
import PhotoDropzone from "@/components/ui/PhotoDropzone";
import HowItWorksClip from "./HowItWorksClip";
import { themes, DEFAULT_THEME_ID, getTheme } from "@/lib/themes";
import { recommendedHeroVariantFor } from "@/lib/themes/recommendedHeroVariant";
import { EVENT_TYPE_LIST, DEFAULT_EVENT_TYPE_ID, getEventType } from "@/lib/eventTypes";
import { completeOnboarding } from "./actions";

const EVENT_TYPE_ICONS: Record<string, LucideIcon> = {
  Heart,
  Sparkles,
  Gem,
  Cake,
  Baby,
  PartyPopper,
  Crown,
  GraduationCap,
  Building2,
  Award,
  CalendarHeart,
};

const onboardingSchema = z
  .object({
    eventType: z.string().min(1, "Pick an event type"),
    themeId: z.string().min(1, "Pick a style"),
    name1: z.string().min(1, "Enter a name"),
    name2: z.string(),
    photoUrl: z.string(),
    eventDate: z.string().min(1, "Enter a date"),
  })
  .superRefine((data, ctx) => {
    if (getEventType(data.eventType).namesMode === "couple" && !data.name2?.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Enter a name", path: ["name2"] });
    }
  });

type OnboardingFormValues = z.infer<typeof onboardingSchema>;

const STEPS = ["eventType", "themeId", "names", "eventDate"] as const;
type StepKey = (typeof STEPS)[number];
const STEP_FIELDS: Record<StepKey, (keyof OnboardingFormValues)[]> = {
  eventType: ["eventType"],
  themeId: ["themeId"],
  names: ["name1", "name2"],
  eventDate: ["eventDate"],
};

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
export default function OnboardingWizard() {
  const searchParams = useSearchParams();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    trigger,
    control,
    setValue,
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

  const eventType = getEventType(eventTypeId);
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

  const goToStep = (next: number, dir: 1 | -1) => {
    setDirection(dir);
    setStep(next);
  };

  const handleNext = async () => {
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
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to save");
    }
  };

  // The theme step's own ThemeGalleryCard already renders a live mockup per
  // card, so the side "Preview" panel below is redundant noise for this one
  // step -- dropped here and the form widened to fill both columns instead,
  // giving the gallery real room (matches the dashboard's own unconstrained
  // ThemeSelectForm sizing, app/dashboard/[eventId]/style/ThemeSelectForm.tsx)
  // rather than squeezing a sidebar+card-grid component into half a narrow
  // column, which was making style names/thumbnails too small to read.
  const isThemeStep = stepKey === "themeId";

  return (
    <div
      className={
        isThemeStep
          ? "block"
          : "mx-auto grid max-w-3xl gap-8 sm:grid-cols-2 sm:items-center"
      }
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm"
        noValidate
      >
        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
          Step {step + 1} of {STEPS.length}
        </p>

        <motion.div
          key={stepKey}
          initial={{ opacity: 0, x: 24 * direction }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
            {stepKey === "eventType" && (
              <div className="mt-4">
                <label className="block text-lg font-semibold text-gray-900">
                  🎉 What are you celebrating?
                </label>
                <p className="mt-1 text-sm text-gray-500">This shapes the questions we ask next.</p>

                <div className="relative mt-4">
                  <div className="grid max-h-80 grid-cols-2 gap-2 overflow-y-auto pr-1">
                    {EVENT_TYPE_LIST.map((type) => {
                      const Icon = EVENT_TYPE_ICONS[type.icon] ?? CalendarHeart;
                      const isSelected = type.id === eventTypeId;
                      return (
                        <button
                          key={type.id}
                          type="button"
                          onClick={() => setValue("eventType", type.id, { shouldValidate: true })}
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
                <label className="block text-lg font-semibold text-gray-900">🎨 Pick your style</label>
                <p className="mt-1 text-sm text-gray-500">
                  You can always change this or design your own later.
                </p>

                <HowItWorksClip />

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
                  💑 {eventType.namePrompts[0]}
                </label>
                <input
                  id="name1"
                  type="text"
                  autoFocus
                  className="mt-4 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
                  {...register("name1")}
                />
                {errors.name1 && <p className="mt-1 text-sm text-red-600">{errors.name1.message}</p>}

                {isCoupleMode && (
                  <>
                    <label htmlFor="name2" className="mt-4 block text-lg font-semibold text-gray-900">
                      {eventType.namePrompts[1]}
                    </label>
                    <input
                      id="name2"
                      type="text"
                      className="mt-4 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
                      {...register("name2")}
                    />
                    {errors.name2 && <p className="mt-1 text-sm text-red-600">{errors.name2.message}</p>}
                  </>
                )}

                <div className="mt-5">
                  <Controller
                    control={control}
                    name="photoUrl"
                    render={({ field }) => (
                      <PhotoDropzone
                        value={field.value || undefined}
                        onChange={(url) => field.onChange(url ?? "")}
                        label="📷 Add a photo (optional)"
                        helpText="Shows up on your site's photo layouts — you can always add or change it later."
                      />
                    )}
                  />
                </div>
              </div>
            )}

            {stepKey === "eventDate" && (
              <div className="mt-4">
                <label htmlFor="eventDate" className="block text-lg font-semibold text-gray-900">
                  📅 {eventType.dateLabel}
                </label>
                <input
                  id="eventDate"
                  type="date"
                  autoFocus
                  className="mt-4 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
                  {...register("eventDate")}
                />
                {errors.eventDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.eventDate.message}</p>
                )}
              </div>
            )}
        </motion.div>

        {formError && (
          <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{formError}</p>
        )}

        <div className="mt-6 flex items-center justify-between">
          <button
            type="button"
            onClick={handleBack}
            disabled={step === 0}
            className="text-sm font-medium text-gray-500 transition hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-0"
          >
            Back
          </button>

          {isLastStep ? (
            <motion.button
              type="submit"
              disabled={isSubmitting}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="rounded-full bg-rose-600 px-6 py-2 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Saving..." : "Create my site"}
            </motion.button>
          ) : (
            <motion.button
              type="button"
              onClick={handleNext}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="rounded-full bg-rose-600 px-6 py-2 text-sm font-semibold text-white transition hover:bg-rose-700"
            >
              Next
            </motion.button>
          )}
        </div>
      </form>

      {!isThemeStep && (
        <div className="relative h-[420px] overflow-hidden rounded-xl border border-gray-200 bg-white">
          <span className="absolute left-3 top-3 z-10 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-500 shadow-sm">
            Preview
          </span>
          <div className="absolute top-1/2 left-1/2 w-[200%] -translate-x-1/2 -translate-y-1/2 scale-50">
            <ThemeProvider theme={selectedTheme}>
              <HeroSection
                variant={previewHeroVariant}
                names={previewNames}
                eventDate={eventDate || ""}
                photoUrl={photoUrl || undefined}
                eyebrow={eventType.heroEyebrow}
              />
            </ThemeProvider>
          </div>
        </div>
      )}
    </div>
  );
}
