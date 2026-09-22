"use client";

import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { updateWeddingData } from "./actions";
import { useAutosave } from "@/lib/useAutosave";
import AutosaveStatus from "@/components/ui/AutosaveStatus";
import { getEventType } from "@/lib/eventTypes";

const weddingDataFormSchema = z.object({
  name1: z.string().min(1, "Enter a name"),
  name2: z.string(),
  eventDate: z.string().min(1, "Enter a date"),
  venueName: z.string(),
  venueCity: z.string(),
  venueAddress: z.string(),
});

type WeddingDataFormValues = z.infer<typeof weddingDataFormSchema>;

interface WeddingDataFormProps {
  eventId: string;
  eventType: string;
  defaultValues: WeddingDataFormValues;
}

/** The one canonical edit surface for names/date/venue -- the "wedding data"
 * source every module (Hero, Map's default venue) and the paper set read
 * from, replacing what used to be duplicate name/date inputs living inside
 * the Hero section's own form. */
export default function WeddingDataForm({ eventId, eventType, defaultValues }: WeddingDataFormProps) {
  const router = useRouter();
  const type = getEventType(eventType);
  const isCoupleMode = type.namesMode === "couple";

  const {
    register,
    control,
    formState: { errors, isValid },
  } = useForm<WeddingDataFormValues>({
    resolver: zodResolver(weddingDataFormSchema),
    defaultValues,
    mode: "onChange",
  });

  const values = useWatch({ control });
  const { state, error } = useAutosave(
    values,
    async (v) => {
      const result = await updateWeddingData({ eventId, eventType, ...(v as WeddingDataFormValues) });
      if (!result.ok) throw new Error(result.message);
      router.refresh();
    },
    { enabled: isValid }
  );

  return (
    <form onSubmit={(e) => e.preventDefault()} className="mt-4 space-y-4 rounded-md border border-gray-200 bg-white p-4" noValidate>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-900">{type.id === "wedding" ? "Wedding data" : "Event data"}</p>
        <AutosaveStatus state={state} error={error} />
      </div>

      <div>
        <label htmlFor="wd-name1" className="block text-sm font-medium text-gray-700">
          {isCoupleMode ? "👰 Partner 1's name" : `✨ ${type.namePrompts[0]}`}
        </label>
        <input
          id="wd-name1"
          type="text"
          defaultValue={defaultValues.name1}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
          {...register("name1")}
        />
        {errors.name1 && <p className="mt-1 text-sm text-red-600">{errors.name1.message}</p>}
      </div>

      {isCoupleMode && (
        <div>
          <label htmlFor="wd-name2" className="block text-sm font-medium text-gray-700">
            🤵 Partner 2&apos;s name
          </label>
          <input
            id="wd-name2"
            type="text"
            defaultValue={defaultValues.name2}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
            {...register("name2")}
          />
        </div>
      )}

      <div>
        <label htmlFor="wd-eventDate" className="block text-sm font-medium text-gray-700">
          📅 {type.id === "wedding" ? "Wedding date" : "Event date"}
        </label>
        <input
          id="wd-eventDate"
          type="date"
          defaultValue={defaultValues.eventDate}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
          {...register("eventDate")}
        />
        {errors.eventDate && <p className="mt-1 text-sm text-red-600">{errors.eventDate.message}</p>}
      </div>

      <div>
        <label htmlFor="wd-venueName" className="block text-sm font-medium text-gray-700">
          📍 Venue name
        </label>
        <input
          id="wd-venueName"
          type="text"
          placeholder="Name of the ZAGS, restaurant..."
          defaultValue={defaultValues.venueName}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
          {...register("venueName")}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="wd-venueCity" className="block text-sm font-medium text-gray-700">
            🏙️ City
          </label>
          <input
            id="wd-venueCity"
            type="text"
            defaultValue={defaultValues.venueCity}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
            {...register("venueCity")}
          />
        </div>
        <div>
          <label htmlFor="wd-venueAddress" className="block text-sm font-medium text-gray-700">
            🗺️ Address
          </label>
          <input
            id="wd-venueAddress"
            type="text"
            defaultValue={defaultValues.venueAddress}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
            {...register("venueAddress")}
          />
        </div>
      </div>
    </form>
  );
}
