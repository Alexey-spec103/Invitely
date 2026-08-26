"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { updateMapSection } from "./actions";
import { useAutosave } from "@/lib/useAutosave";
import AutosaveStatus from "@/components/ui/AutosaveStatus";
import type { MapVariant } from "@/components/sections/MapSection";

const venueSchema = z.object({
  name: z.string().min(1, "Enter a venue name"),
  address: z.string().min(1, "Enter an address"),
});

const mapFormSchema = z.object({
  title: z.string().min(1, "Enter a title"),
  venues: z.array(venueSchema).min(1, "Add at least one venue"),
  mapVariant: z.enum(["embed-static", "side-by-side-cards", "minimal-list"]),
});

type MapFormValues = z.infer<typeof mapFormSchema>;

const mapVariantOptions: { value: MapVariant; label: string }[] = [
  { value: "embed-static", label: "Framed Cards" },
  { value: "side-by-side-cards", label: "Side by Side Cards" },
  { value: "minimal-list", label: "Minimal List" },
];

interface MapEditFormProps {
  eventId: string;
  defaultValues: MapFormValues;
}

export default function MapEditForm({ eventId, defaultValues }: MapEditFormProps) {
  const router = useRouter();

  const {
    register,
    control,
    formState: { errors, isValid },
  } = useForm<MapFormValues>({
    resolver: zodResolver(mapFormSchema),
    defaultValues,
    mode: "onChange",
  });

  const { fields, append, remove } = useFieldArray({ control, name: "venues" });
  const values = useWatch({ control });
  const { state, error } = useAutosave(
    values,
    async (v) => {
      await updateMapSection({ eventId, ...(v as MapFormValues) });
      router.refresh();
    },
    { enabled: isValid }
  );

  return (
    <form onSubmit={(e) => e.preventDefault()} className="space-y-4" noValidate>
      <div className="flex justify-end">
        <AutosaveStatus state={state} error={error} />
      </div>

      <p className="rounded-md bg-gray-50 px-3 py-2 text-xs text-gray-600">
        Your first venue is pre-filled from your{" "}
        <Link href={`/dashboard/${eventId}`} className="font-medium text-rose-700 underline underline-offset-2">
          Wedding data
        </Link>{" "}
        — edit it there, or change it below just for this section.
      </p>

      <p className="text-xs text-gray-500">
        Add one venue for a single-location event, or several — e.g. ceremony and reception at
        different addresses.
      </p>

      <div>
        <label htmlFor="mapTitle" className="block text-sm font-medium text-gray-700">
          Title
        </label>
        <input
          id="mapTitle"
          type="text"
          placeholder="How to get there"
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
          {...register("title")}
        />
        {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>}
      </div>

      <div>
        <label htmlFor="mapVariant" className="block text-sm font-medium text-gray-700">
          Layout
        </label>
        <select
          id="mapVariant"
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
          {...register("mapVariant")}
        >
          {mapVariantOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-4">
        {fields.map((field, index) => (
          <div key={field.id} className="space-y-2 rounded-md border border-gray-200 p-3">
            <div>
              <label
                htmlFor={`venues.${index}.name`}
                className="block text-sm font-medium text-gray-700"
              >
                Venue name
              </label>
              <input
                id={`venues.${index}.name`}
                type="text"
                placeholder="e.g. Ceremony — St. Anne's Chapel"
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
                {...register(`venues.${index}.name` as const)}
              />
              {errors.venues?.[index]?.name && (
                <p className="mt-1 text-sm text-red-600">{errors.venues[index]?.name?.message}</p>
              )}
            </div>

            <div>
              <label
                htmlFor={`venues.${index}.address`}
                className="block text-sm font-medium text-gray-700"
              >
                Venue address
              </label>
              <input
                id={`venues.${index}.address`}
                type="text"
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
                {...register(`venues.${index}.address` as const)}
              />
              {errors.venues?.[index]?.address && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.venues[index]?.address?.message}
                </p>
              )}
            </div>

            {fields.length > 1 && (
              <button
                type="button"
                onClick={() => remove(index)}
                className="text-sm font-medium text-red-600 hover:text-red-700"
              >
                Remove venue
              </button>
            )}
          </div>
        ))}
        {errors.venues?.root && (
          <p className="text-sm text-red-600">{errors.venues.root.message}</p>
        )}
      </div>

      <button
        type="button"
        onClick={() => append({ name: "", address: "" })}
        className="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-900 transition hover:bg-gray-50"
      >
        + Add venue
      </button>
    </form>
  );
}
