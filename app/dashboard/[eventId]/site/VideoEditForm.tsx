"use client";

import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { updateVideoSection } from "./actions";
import { useAutosave } from "@/lib/useAutosave";
import AutosaveStatus from "@/components/ui/AutosaveStatus";
import { resolveVideoEmbed } from "@/components/sections/VideoSection/videoEmbed";
import type { VideoVariant } from "@/components/sections/VideoSection";

const videoFormSchema = z.object({
  title: z.string(),
  videoUrl: z.string().min(1, "Enter a video URL"),
  videoVariant: z.enum(["embed", "full-bleed", "framed-polaroid"]),
});

type VideoFormValues = z.infer<typeof videoFormSchema>;

const videoVariantOptions: { value: VideoVariant; label: string }[] = [
  { value: "embed", label: "Framed Embed" },
  { value: "full-bleed", label: "Full Bleed" },
  { value: "framed-polaroid", label: "Framed Polaroid" },
];

interface VideoEditFormProps {
  eventId: string;
  defaultValues: VideoFormValues;
}

export default function VideoEditForm({ eventId, defaultValues }: VideoEditFormProps) {
  const router = useRouter();

  const {
    register,
    control,
    formState: { errors, isValid },
  } = useForm<VideoFormValues>({
    resolver: zodResolver(videoFormSchema),
    defaultValues,
    mode: "onChange",
  });

  const videoUrl = useWatch({ control, name: "videoUrl" });
  const embed = videoUrl?.trim() ? resolveVideoEmbed(videoUrl.trim()) : null;
  const values = useWatch({ control });
  const { state, error } = useAutosave(
    values,
    async (v) => {
      await updateVideoSection({ eventId, ...(v as VideoFormValues) });
      router.refresh();
    },
    { enabled: isValid }
  );

  return (
    <form onSubmit={(e) => e.preventDefault()} className="space-y-4" noValidate>
      <div className="flex justify-end">
        <AutosaveStatus state={state} error={error} />
      </div>

      <div>
        <label htmlFor="videoTitle" className="block text-sm font-medium text-gray-700">
          Title <span className="text-gray-400">(optional)</span>
        </label>
        <input
          id="videoTitle"
          type="text"
          placeholder="Our story"
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
          {...register("title")}
        />
      </div>

      <div>
        <label htmlFor="videoUrl" className="block text-sm font-medium text-gray-700">
          Video URL
        </label>
        <input
          id="videoUrl"
          type="text"
          placeholder="YouTube, Vimeo, or a direct .mp4 link"
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
          {...register("videoUrl")}
        />
        {errors.videoUrl && <p className="mt-1 text-sm text-red-600">{errors.videoUrl.message}</p>}
      </div>

      <div>
        <label htmlFor="videoVariant" className="block text-sm font-medium text-gray-700">
          Layout
        </label>
        <select
          id="videoVariant"
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
          {...register("videoVariant")}
        >
          {videoVariantOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {embed && (
        <div>
          <p className="mb-1 text-xs font-medium text-gray-500">Preview</p>
          {embed.kind === "iframe" ? (
            <iframe
              src={embed.src}
              className="aspect-video w-full max-w-sm rounded-md border border-gray-200"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <video
              src={embed.src}
              controls
              className="aspect-video w-full max-w-sm rounded-md border border-gray-200 bg-black"
            />
          )}
          <p className="mt-1 text-xs text-gray-400">
            {embed.kind === "iframe"
              ? "Recognized as an embeddable YouTube/Vimeo link."
              : "Not recognized as YouTube/Vimeo — treated as a direct video file. If it doesn't play above, guests won't be able to watch it either."}
          </p>
        </div>
      )}
    </form>
  );
}
