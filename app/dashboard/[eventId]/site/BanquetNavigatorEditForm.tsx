"use client";

import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { updateBanquetNavigatorSection } from "./actions";
import { useAutosave } from "@/lib/useAutosave";
import AutosaveStatus from "@/components/ui/AutosaveStatus";
import { DEFAULT_BANQUET_NAVIGATOR_VARIANT } from "@/components/sections/BanquetNavigatorSection";

const banquetNavigatorFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string(),
});

type BanquetNavigatorFormValues = z.infer<typeof banquetNavigatorFormSchema>;

interface BanquetNavigatorEditFormProps {
  eventId: string;
  defaultValues: BanquetNavigatorFormValues;
}

export default function BanquetNavigatorEditForm({ eventId, defaultValues }: BanquetNavigatorEditFormProps) {
  const router = useRouter();

  const {
    register,
    control,
    formState: { isValid },
  } = useForm<BanquetNavigatorFormValues>({
    resolver: zodResolver(banquetNavigatorFormSchema),
    defaultValues,
    mode: "onChange",
  });

  const values = useWatch({ control });
  const { state, error } = useAutosave(
    values,
    async (v) => {
      await updateBanquetNavigatorSection({
        eventId,
        ...(v as BanquetNavigatorFormValues),
        banquetNavigatorVariant: DEFAULT_BANQUET_NAVIGATOR_VARIANT,
      });
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
        Lets a guest look up their assigned banquet table. Guests who arrived via their personal
        invite link see their table right away; everyone else can search by name.
      </p>

      <div>
        <label htmlFor="banquetNavigatorTitle" className="block text-sm font-medium text-gray-700">
          Title
        </label>
        <input
          id="banquetNavigatorTitle"
          type="text"
          placeholder="Find your table"
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
          {...register("title")}
        />
      </div>

      <div>
        <label htmlFor="banquetNavigatorDescription" className="block text-sm font-medium text-gray-700">
          Description <span className="text-gray-400">(optional)</span>
        </label>
        <textarea
          id="banquetNavigatorDescription"
          rows={2}
          placeholder="Enter your name below to find your seat at the reception."
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
          {...register("description")}
        />
      </div>
    </form>
  );
}
