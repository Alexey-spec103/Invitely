"use client";

import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { updateSiteSettings } from "./actions";
import { useAutosave } from "@/lib/useAutosave";
import AutosaveStatus from "@/components/ui/AutosaveStatus";

const siteSettingsFormSchema = z.object({
  musicUrl: z.string(),
});

type SiteSettingsFormValues = z.infer<typeof siteSettingsFormSchema>;

interface SiteSettingsEditFormProps {
  eventId: string;
  defaultValues: SiteSettingsFormValues;
}

export default function SiteSettingsEditForm({ eventId, defaultValues }: SiteSettingsEditFormProps) {
  const router = useRouter();

  const { register, control } = useForm<SiteSettingsFormValues>({
    resolver: zodResolver(siteSettingsFormSchema),
    defaultValues,
    mode: "onChange",
  });

  const values = useWatch({ control });
  const { state, error } = useAutosave(values, async (v) => {
    await updateSiteSettings({ eventId, ...(v as SiteSettingsFormValues) });
    router.refresh();
  });

  return (
    <form onSubmit={(e) => e.preventDefault()} className="space-y-4" noValidate>
      <div className="flex justify-end">
        <AutosaveStatus state={state} error={error} />
      </div>

      <div>
        <label htmlFor="musicUrl" className="block text-sm font-medium text-[var(--dash-text-muted)]">
          Background music URL <span className="text-[var(--dash-text-muted)]">(optional)</span>
        </label>
        <input
          id="musicUrl"
          type="text"
          placeholder="https://..."
          className="mt-1 dash-input-dark"
          {...register("musicUrl")}
        />
        <p className="mt-1 text-xs text-[var(--dash-text-muted)]">
          Link to a hosted audio file. Guests will get a play/pause button in the header.
        </p>
      </div>
    </form>
  );
}
