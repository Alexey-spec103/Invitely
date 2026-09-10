"use client";

import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { updateSocialImage } from "./actions";
import { useAutosave } from "@/lib/useAutosave";
import AutosaveStatus from "@/components/ui/AutosaveStatus";
import PhotoDropzone from "@/components/ui/PhotoDropzone";

const formSchema = z.object({
  socialImageUrl: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface LinkPreviewCardProps {
  eventId: string;
  defaultValues: FormValues;
  /** Hero photo, used as the mockup's image whenever no custom one is set --
   * matches what generateMetadata itself falls back to, so this preview is
   * never wrong about what a messenger will actually show. */
  fallbackImageUrl?: string;
  title: string;
  description: string;
}

/** dashboard-audit.md B14 "Превью": mocks up how this site's link will
 * render when pasted into a messenger (WhatsApp/Telegram/iMessage), plus an
 * optional custom image upload -- otherwise falling back to the Hero photo.
 * Modeled on WhatsApp's own link-preview card since that's the most common
 * target, not a generic/unstyled one. */
export default function LinkPreviewCard({
  eventId,
  defaultValues,
  fallbackImageUrl,
  title,
  description,
}: LinkPreviewCardProps) {
  const router = useRouter();

  const { control, setValue } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
    mode: "onChange",
  });

  const values = useWatch({ control });
  const { state, error } = useAutosave(values, async (v) => {
    await updateSocialImage(eventId, (v as FormValues).socialImageUrl);
    router.refresh();
  });

  const previewImage = values.socialImageUrl || fallbackImageUrl;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <AutosaveStatus state={state} error={error} />
      </div>

      <div>
        <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-[var(--dash-text-muted)]">
          As seen in a messenger
        </p>
        <div className="overflow-hidden rounded-xl border border-[var(--dash-border)] bg-[var(--dash-bg)]">
          <div className="aspect-[1.91/1] w-full bg-black/10">
            {previewImage ? (
              // eslint-disable-next-line @next/next/no-img-element -- small dashboard mockup, not a public-site asset
              <img src={previewImage} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs text-[var(--dash-text-muted)]">
                No photo yet
              </div>
            )}
          </div>
          <div className="space-y-0.5 px-3 py-2">
            <p className="truncate text-sm font-semibold text-[var(--dash-text)]">{title}</p>
            <p className="line-clamp-2 text-xs text-[var(--dash-text-muted)]">{description}</p>
          </div>
        </div>
      </div>

      <PhotoDropzone
        label="Custom preview image (optional)"
        helpText="Defaults to your start screen photo if left blank."
        value={values.socialImageUrl}
        onChange={(url) => setValue("socialImageUrl", url, { shouldDirty: true })}
      />
    </div>
  );
}
