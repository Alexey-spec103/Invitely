"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateSiteSettings } from "./actions";
import { useAutosave } from "@/lib/useAutosave";
import AutosaveStatus from "@/components/ui/AutosaveStatus";
import MusicDropzone from "@/components/ui/MusicDropzone";

interface SiteSettingsFormValues {
  musicUrl: string;
}

interface SiteSettingsEditFormProps {
  eventId: string;
  defaultValues: SiteSettingsFormValues;
}

export default function SiteSettingsEditForm({ eventId, defaultValues }: SiteSettingsEditFormProps) {
  const router = useRouter();
  const [musicUrl, setMusicUrl] = useState(defaultValues.musicUrl);

  const { state, error } = useAutosave({ musicUrl }, async (v) => {
    const result = await updateSiteSettings({ eventId, ...v });
    if (!result.ok) throw new Error(result.message);
    router.refresh();
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <AutosaveStatus state={state} error={error} />
      </div>

      <div>
        <p className="block text-sm font-medium text-[var(--dash-text-muted)]">
          Background music <span className="text-[var(--dash-text-muted)]">(optional)</span>
        </p>
        <div className="mt-1">
          <MusicDropzone value={musicUrl || undefined} onChange={(url) => setMusicUrl(url ?? "")} />
        </div>
        <p className="mt-2 text-xs text-[var(--dash-text-muted)]">
          Guests will get a play/pause button in the header.
        </p>
      </div>
    </div>
  );
}
