"use client";

import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { updateLetterSection } from "./actions";
import { useAutosave } from "@/lib/useAutosave";
import AutosaveStatus from "@/components/ui/AutosaveStatus";
import type { LetterVariant } from "@/components/sections/LetterSection";

const letterFormSchema = z.object({
  title: z.string().min(1, "Enter a title"),
  body: z.string().min(1, "Enter the letter body"),
  quote: z.string(),
  note: z.string(),
  rsvpDeadline: z.string(),
  closingLine: z.string(),
  letterVariant: z.enum(["centered-card", "minimal-line", "ornate-border", "split-quote"]),
});

type LetterFormValues = z.infer<typeof letterFormSchema>;

const letterVariantOptions: { value: LetterVariant; label: string }[] = [
  { value: "centered-card", label: "Centered Card" },
  { value: "minimal-line", label: "Minimal Line" },
  { value: "ornate-border", label: "Ornate Border" },
  { value: "split-quote", label: "Split Quote" },
];

interface LetterEditFormProps {
  eventId: string;
  defaultValues: LetterFormValues;
}

export default function LetterEditForm({ eventId, defaultValues }: LetterEditFormProps) {
  const router = useRouter();

  const {
    register,
    control,
    formState: { errors, isValid },
  } = useForm<LetterFormValues>({
    resolver: zodResolver(letterFormSchema),
    defaultValues,
    mode: "onChange",
  });

  const values = useWatch({ control });
  const { state, error } = useAutosave(
    values,
    async (v) => {
      await updateLetterSection({ eventId, ...(v as LetterFormValues) });
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
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Letter title
        </label>
        <input
          id="title"
          type="text"
          placeholder="Dear guest!"
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
          {...register("title")}
        />
        {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>}
      </div>

      <div>
        <label htmlFor="body" className="block text-sm font-medium text-gray-700">
          Letter body
        </label>
        <textarea
          id="body"
          rows={5}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
          {...register("body")}
        />
        {errors.body && <p className="mt-1 text-sm text-red-600">{errors.body.message}</p>}
      </div>

      <div>
        <label htmlFor="quote" className="block text-sm font-medium text-gray-700">
          Quote <span className="text-gray-400">(optional)</span>
        </label>
        <textarea
          id="quote"
          rows={2}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
          {...register("quote")}
        />
        {errors.quote && <p className="mt-1 text-sm text-red-600">{errors.quote.message}</p>}
      </div>

      <div>
        <label htmlFor="note" className="block text-sm font-medium text-gray-700">
          Note <span className="text-gray-400">(optional)</span>
        </label>
        <textarea
          id="note"
          rows={2}
          placeholder="e.g. a request for guests about the day"
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
          {...register("note")}
        />
      </div>

      <div>
        <label htmlFor="rsvpDeadline" className="block text-sm font-medium text-gray-700">
          RSVP deadline <span className="text-gray-400">(optional)</span>
        </label>
        <input
          id="rsvpDeadline"
          type="date"
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
          {...register("rsvpDeadline")}
        />
      </div>

      <div>
        <label htmlFor="closingLine" className="block text-sm font-medium text-gray-700">
          Closing line <span className="text-gray-400">(optional)</span>
        </label>
        <input
          id="closingLine"
          type="text"
          placeholder="We can't wait to celebrate with you!"
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
          {...register("closingLine")}
        />
      </div>

      <div>
        <label htmlFor="letterVariant" className="block text-sm font-medium text-gray-700">
          Layout
        </label>
        <select
          id="letterVariant"
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
          {...register("letterVariant")}
        >
          {letterVariantOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </form>
  );
}
