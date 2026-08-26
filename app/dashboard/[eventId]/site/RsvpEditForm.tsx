"use client";

import { useRouter } from "next/navigation";
import { useForm, useWatch, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { updateRsvpSection } from "./actions";
import { useAutosave } from "@/lib/useAutosave";
import AutosaveStatus from "@/components/ui/AutosaveStatus";

const rsvpQuestionSchema = z.object({
  id: z.string(),
  label: z.string(),
  type: z.enum(["text", "choice"]),
  options: z.string(),
});

const rsvpFormSchema = z.object({
  title: z.string().min(1, "Enter a title"),
  description: z.string(),
  questions: z.array(rsvpQuestionSchema),
});

type RsvpFormValues = z.infer<typeof rsvpFormSchema>;

interface RsvpEditFormProps {
  eventId: string;
  defaultValues: RsvpFormValues;
}

function makeQuestionId() {
  return crypto.randomUUID();
}

export default function RsvpEditForm({ eventId, defaultValues }: RsvpEditFormProps) {
  const router = useRouter();

  const {
    register,
    control,
    formState: { errors, isValid },
  } = useForm<RsvpFormValues>({
    resolver: zodResolver(rsvpFormSchema),
    defaultValues,
    mode: "onChange",
  });

  const { fields, append, remove } = useFieldArray({ control, name: "questions" });
  const questionTypes = useWatch({ control, name: "questions" });
  const values = useWatch({ control });
  const { state, error } = useAutosave(
    values,
    async (v) => {
      await updateRsvpSection({ eventId, ...(v as RsvpFormValues) });
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
        <label htmlFor="rsvpTitle" className="block text-sm font-medium text-gray-700">
          Title
        </label>
        <input
          id="rsvpTitle"
          type="text"
          placeholder="Will you join us?"
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
          {...register("title")}
        />
        {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>}
      </div>

      <div>
        <label htmlFor="rsvpDescription" className="block text-sm font-medium text-gray-700">
          Description <span className="text-gray-400">(optional)</span>
        </label>
        <textarea
          id="rsvpDescription"
          rows={3}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
          {...register("description")}
        />
      </div>

      <div className="rounded-md border border-gray-200 p-4">
        <p className="text-sm font-medium text-gray-700">
          Custom questions <span className="font-normal text-gray-400">(optional)</span>
        </p>
        <p className="mt-1 text-xs text-gray-500">
          Ask guests anything beyond the basics — meal choice, drink preference, whether they need
          a ride or a place to stay.
        </p>

        <div className="mt-3 space-y-3">
          {fields.map((field, index) => (
            <div key={field.id} className="grid grid-cols-[1fr_auto_auto] items-start gap-2">
              <div>
                <input
                  type="text"
                  placeholder="Question, e.g. Chicken or fish?"
                  className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm text-gray-900 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
                  {...register(`questions.${index}.label` as const)}
                />
                {questionTypes?.[index]?.type === "choice" && (
                  <input
                    type="text"
                    placeholder="Options, comma-separated: Chicken, Fish, Vegetarian"
                    className="mt-1.5 w-full rounded-md border border-gray-300 px-2 py-1.5 text-xs text-gray-900 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
                    {...register(`questions.${index}.options` as const)}
                  />
                )}
              </div>
              <select
                className="rounded-md border border-gray-300 px-2 py-1.5 text-sm text-gray-900 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
                {...register(`questions.${index}.type` as const)}
              >
                <option value="text">Free text</option>
                <option value="choice">Multiple choice</option>
              </select>
              <button
                type="button"
                onClick={() => remove(index)}
                className="mt-1.5 text-sm font-medium text-red-600 hover:text-red-700"
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => append({ id: makeQuestionId(), label: "", type: "text", options: "" })}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-900 transition hover:bg-gray-50"
          >
            + Add question
          </button>
          <button
            type="button"
            onClick={() =>
              append({
                id: makeQuestionId(),
                label: "Meal preference",
                type: "choice",
                options: "Chicken, Fish, Vegetarian",
              })
            }
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-900 transition hover:bg-gray-50"
          >
            + Meal preference
          </button>
          <button
            type="button"
            onClick={() =>
              append({
                id: makeQuestionId(),
                label: "Do you need transport or a place to stay?",
                type: "text",
                options: "",
              })
            }
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-900 transition hover:bg-gray-50"
          >
            + Transport / lodging
          </button>
        </div>
      </div>
    </form>
  );
}
