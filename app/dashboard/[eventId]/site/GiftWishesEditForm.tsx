"use client";

import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { updateGiftWishesSection } from "./actions";
import { useAutosave } from "@/lib/useAutosave";
import AutosaveStatus from "@/components/ui/AutosaveStatus";
import type { GiftVariant } from "@/components/sections/GiftSection";

const giftWishesFormSchema = z.object({
  title: z.string(),
  description: z.string(),
  giftVariant: z.enum(["simple-list", "minimal-rows", "compact-badges"]),
});

type GiftWishesFormValues = z.infer<typeof giftWishesFormSchema>;

const giftVariantOptions: { value: GiftVariant; label: string }[] = [
  { value: "simple-list", label: "Simple List" },
  { value: "minimal-rows", label: "Minimal Rows" },
  { value: "compact-badges", label: "Compact Badges" },
];

interface GiftWishesEditFormProps {
  eventId: string;
  defaultValues: GiftWishesFormValues;
}

export default function GiftWishesEditForm({ eventId, defaultValues }: GiftWishesEditFormProps) {
  const router = useRouter();

  const {
    register,
    control,
    formState: { isValid },
  } = useForm<GiftWishesFormValues>({
    resolver: zodResolver(giftWishesFormSchema),
    defaultValues,
    mode: "onChange",
  });

  const values = useWatch({ control });
  const { state, error } = useAutosave(
    values,
    async (v) => {
      await updateGiftWishesSection({ eventId, ...(v as GiftWishesFormValues) });
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
        <label htmlFor="giftSectionTitle" className="block text-sm font-medium text-gray-700">
          Title <span className="text-gray-400">(optional)</span>
        </label>
        <input
          id="giftSectionTitle"
          type="text"
          placeholder="Gift wishes"
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
          {...register("title")}
        />
      </div>

      <div>
        <label htmlFor="giftSectionDescription" className="block text-sm font-medium text-gray-700">
          Description <span className="text-gray-400">(optional)</span>
        </label>
        <textarea
          id="giftSectionDescription"
          rows={3}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
          {...register("description")}
        />
      </div>

      <div>
        <label htmlFor="giftVariant" className="block text-sm font-medium text-gray-700">
          Layout
        </label>
        <select
          id="giftVariant"
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
          {...register("giftVariant")}
        >
          {giftVariantOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </form>
  );
}
