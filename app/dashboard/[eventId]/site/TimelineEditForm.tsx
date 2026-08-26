"use client";

import { useRouter } from "next/navigation";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { updateTimelineSection } from "./actions";
import { useAutosave } from "@/lib/useAutosave";
import AutosaveStatus from "@/components/ui/AutosaveStatus";
import type { TimelineVariant } from "@/components/sections/TimelineSection";

const timelineEventSchema = z.object({
  time: z.string().min(1, "Enter a time"),
  title: z.string().min(1, "Enter a title"),
  description: z.string(),
});

const timelineFormSchema = z.object({
  title: z.string().min(1, "Enter a title"),
  events: z.array(timelineEventSchema),
  timelineVariant: z.enum(["vertical-line", "alternating-sides", "horizontal-scroll"]),
});

type TimelineFormValues = z.infer<typeof timelineFormSchema>;

const timelineVariantOptions: { value: TimelineVariant; label: string }[] = [
  { value: "vertical-line", label: "Vertical Line" },
  { value: "alternating-sides", label: "Alternating Sides" },
  { value: "horizontal-scroll", label: "Horizontal Scroll" },
];

interface TimelineEditFormProps {
  eventId: string;
  defaultValues: TimelineFormValues;
}

export default function TimelineEditForm({ eventId, defaultValues }: TimelineEditFormProps) {
  const router = useRouter();

  const {
    register,
    control,
    formState: { errors, isValid },
  } = useForm<TimelineFormValues>({
    resolver: zodResolver(timelineFormSchema),
    defaultValues,
    mode: "onChange",
  });

  const { fields, append, remove } = useFieldArray({ control, name: "events" });
  const values = useWatch({ control });
  const { state, error } = useAutosave(
    values,
    async (v) => {
      await updateTimelineSection({ eventId, ...(v as TimelineFormValues) });
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
        <label htmlFor="timelineTitle" className="block text-sm font-medium text-gray-700">
          Title
        </label>
        <input
          id="timelineTitle"
          type="text"
          placeholder="Event Schedule"
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
          {...register("title")}
        />
        {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>}
      </div>

      <div>
        <label htmlFor="timelineVariant" className="block text-sm font-medium text-gray-700">
          Layout
        </label>
        <select
          id="timelineVariant"
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
          {...register("timelineVariant")}
        >
          {timelineVariantOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-4">
        {fields.map((field, index) => (
          <div key={field.id} className="space-y-2 rounded-md border border-gray-200 p-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label
                  htmlFor={`events.${index}.time`}
                  className="block text-sm font-medium text-gray-700"
                >
                  Time
                </label>
                <input
                  id={`events.${index}.time`}
                  type="text"
                  placeholder="12:00"
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
                  {...register(`events.${index}.time` as const)}
                />
                {errors.events?.[index]?.time && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.events[index]?.time?.message}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor={`events.${index}.title`}
                  className="block text-sm font-medium text-gray-700"
                >
                  Title
                </label>
                <input
                  id={`events.${index}.title`}
                  type="text"
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
                  {...register(`events.${index}.title` as const)}
                />
                {errors.events?.[index]?.title && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.events[index]?.title?.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor={`events.${index}.description`}
                className="block text-sm font-medium text-gray-700"
              >
                Description <span className="text-gray-400">(optional)</span>
              </label>
              <textarea
                id={`events.${index}.description`}
                rows={2}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
                {...register(`events.${index}.description` as const)}
              />
            </div>

            <button
              type="button"
              onClick={() => remove(index)}
              className="text-sm font-medium text-red-600 hover:text-red-700"
            >
              Remove event
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => append({ time: "", title: "", description: "" })}
        className="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-900 transition hover:bg-gray-50"
      >
        Add event
      </button>
    </form>
  );
}
