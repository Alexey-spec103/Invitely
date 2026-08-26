"use client";

import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { updateCountdownSection } from "./actions";
import { useAutosave } from "@/lib/useAutosave";
import AutosaveStatus from "@/components/ui/AutosaveStatus";
import type { CountdownVariant } from "@/components/sections/CountdownSection";

const countdownFormSchema = z.object({
  title: z.string(),
  countdownVariant: z.enum(["simple-digits", "circular-rings", "minimal-inline"]),
});

type CountdownFormValues = z.infer<typeof countdownFormSchema>;

const countdownVariantOptions: { value: CountdownVariant; label: string }[] = [
  { value: "simple-digits", label: "Simple Digits" },
  { value: "circular-rings", label: "Circular Rings" },
  { value: "minimal-inline", label: "Minimal Inline" },
];

interface CountdownEditFormProps {
  eventId: string;
  defaultValues: CountdownFormValues;
}

export default function CountdownEditForm({ eventId, defaultValues }: CountdownEditFormProps) {
  const router = useRouter();

  const {
    register,
    control,
    formState: { isValid },
  } = useForm<CountdownFormValues>({
    resolver: zodResolver(countdownFormSchema),
    defaultValues,
    mode: "onChange",
  });

  const values = useWatch({ control });
  const { state, error } = useAutosave(
    values,
    async (v) => {
      await updateCountdownSection({ eventId, ...(v as CountdownFormValues) });
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
        <label htmlFor="countdownTitle" className="block text-sm font-medium text-gray-700">
          Title <span className="text-gray-400">(optional)</span>
        </label>
        <input
          id="countdownTitle"
          type="text"
          placeholder="Counting down to the big day"
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
          {...register("title")}
        />
      </div>

      <div>
        <label htmlFor="countdownVariant" className="block text-sm font-medium text-gray-700">
          Layout
        </label>
        <select
          id="countdownVariant"
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
          {...register("countdownVariant")}
        >
          {countdownVariantOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </form>
  );
}
