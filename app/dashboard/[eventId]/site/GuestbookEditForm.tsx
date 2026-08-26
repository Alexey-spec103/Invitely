"use client";

import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { updateGuestbookSection } from "./actions";
import { useAutosave } from "@/lib/useAutosave";
import AutosaveStatus from "@/components/ui/AutosaveStatus";
import type { GuestbookVariant } from "@/components/sections/GuestbookSection";

const guestbookFormSchema = z.object({
  title: z.string(),
  guestbookVariant: z.enum(["wall", "quote-scroll", "minimal-list"]),
});

type GuestbookFormValues = z.infer<typeof guestbookFormSchema>;

const guestbookVariantOptions: { value: GuestbookVariant; label: string }[] = [
  { value: "wall", label: "Wall" },
  { value: "quote-scroll", label: "Quote Scroll" },
  { value: "minimal-list", label: "Minimal List" },
];

interface GuestbookEditFormProps {
  eventId: string;
  defaultValues: GuestbookFormValues;
}

export default function GuestbookEditForm({ eventId, defaultValues }: GuestbookEditFormProps) {
  const router = useRouter();

  const {
    register,
    control,
    formState: { isValid },
  } = useForm<GuestbookFormValues>({
    resolver: zodResolver(guestbookFormSchema),
    defaultValues,
    mode: "onChange",
  });

  const values = useWatch({ control });
  const { state, error } = useAutosave(
    values,
    async (v) => {
      await updateGuestbookSection({ eventId, ...(v as GuestbookFormValues) });
      router.refresh();
    },
    { enabled: isValid }
  );

  return (
    <form onSubmit={(e) => e.preventDefault()} className="space-y-4" noValidate>
      <div className="flex justify-end">
        <AutosaveStatus state={state} error={error} />
      </div>
      <p className="text-sm text-gray-500">
        Shows a public wall of wishes, built from the comments guests leave when they RSVP. You can
        hide any individual message from the guest list below.
      </p>

      <div>
        <label htmlFor="guestbookTitle" className="block text-sm font-medium text-gray-700">
          Title <span className="text-gray-400">(optional)</span>
        </label>
        <input
          id="guestbookTitle"
          type="text"
          placeholder="Wishes from our guests"
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
          {...register("title")}
        />
      </div>

      <div>
        <label htmlFor="guestbookVariant" className="block text-sm font-medium text-gray-700">
          Layout
        </label>
        <select
          id="guestbookVariant"
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
          {...register("guestbookVariant")}
        >
          {guestbookVariantOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </form>
  );
}
