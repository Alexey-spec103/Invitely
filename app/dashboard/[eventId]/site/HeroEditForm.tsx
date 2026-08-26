"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, useWatch, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { updateHeroSection } from "./actions";
import { useAutosave } from "@/lib/useAutosave";
import AutosaveStatus from "@/components/ui/AutosaveStatus";
import PhotoDropzone from "@/components/ui/PhotoDropzone";
import HeroVariantPicker from "@/components/theme/HeroVariantPicker";
import { HERO_VARIANTS } from "@/components/sections/HeroSection";
import type { HeroVariant } from "@/components/sections/HeroSection";
import type { Theme } from "@/lib/themes";

const heroFormSchema = z.object({
  heroVariant: z.enum(HERO_VARIANTS as [HeroVariant, ...HeroVariant[]]),
  photoUrl: z.string(),
});

type HeroFormValues = z.infer<typeof heroFormSchema>;

interface HeroEditFormProps {
  eventId: string;
  theme: Theme;
  names: string[];
  eventDate: string | null;
  defaultValues: HeroFormValues;
}

export default function HeroEditForm({ eventId, theme, names, eventDate, defaultValues }: HeroEditFormProps) {
  const router = useRouter();

  const {
    control,
    formState: { isValid },
  } = useForm<HeroFormValues>({
    resolver: zodResolver(heroFormSchema),
    defaultValues,
    mode: "onChange",
  });

  const values = useWatch({ control });
  const { state, error } = useAutosave(
    values,
    async (v) => {
      await updateHeroSection({ eventId, ...(v as HeroFormValues) });
      router.refresh();
    },
    { enabled: isValid }
  );

  const previewNames = names.length > 0 ? names : ["Partner One", "Partner Two"];

  return (
    <form onSubmit={(e) => e.preventDefault()} className="space-y-5" noValidate>
      <div className="flex justify-end">
        <AutosaveStatus state={state} error={error} />
      </div>

      <p className="rounded-md bg-gray-50 px-3 py-2 text-xs text-gray-600">
        Names & date come from your{" "}
        <Link href={`/dashboard/${eventId}`} className="font-medium text-rose-700 underline underline-offset-2">
          Wedding data
        </Link>{" "}
        — edit them there and they&apos;ll update everywhere, including this section and your paper set.
      </p>

      <Controller
        control={control}
        name="photoUrl"
        render={({ field }) => (
          <PhotoDropzone
            value={field.value || undefined}
            onChange={(url) => field.onChange(url ?? "")}
            mode="upload"
            label="📷 Add a photo of you two"
            helpText="Shown on layouts like Photo Full Bleed and Editorial Split. Optional — plenty of layouts don't need one."
          />
        )}
      />

      <div>
        <p className="block text-sm font-medium text-gray-700">🎨 Layout</p>
        <p className="mt-0.5 text-xs text-gray-500">Pick how your names and date are arranged.</p>
        <Controller
          control={control}
          name="heroVariant"
          render={({ field }) => (
            <HeroVariantPicker
              theme={theme}
              names={previewNames}
              eventDate={eventDate ?? ""}
              photoUrl={values.photoUrl || undefined}
              value={field.value}
              onChange={field.onChange}
              variants={HERO_VARIANTS}
            />
          )}
        />
      </div>
    </form>
  );
}
