"use client";

import { useRouter } from "next/navigation";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { updateDressCodeSection } from "./actions";
import { useAutosave } from "@/lib/useAutosave";
import AutosaveStatus from "@/components/ui/AutosaveStatus";
import type { DressCodeVariant } from "@/components/sections/DressCodeSection";

const dressCodeColorSchema = z.object({
  hex: z.string().min(1, "Enter a color"),
  label: z.string(),
});

const dressCodeFormSchema = z.object({
  title: z.string().min(1, "Enter a title"),
  description: z.string(),
  colors: z.array(dressCodeColorSchema),
  dressCodeVariant: z.enum(["color-palette", "swatch-grid", "minimal-stripe"]),
});

type DressCodeFormValues = z.infer<typeof dressCodeFormSchema>;

const dressCodeVariantOptions: { value: DressCodeVariant; label: string }[] = [
  { value: "color-palette", label: "Color Palette" },
  { value: "swatch-grid", label: "Swatch Grid" },
  { value: "minimal-stripe", label: "Minimal Stripe" },
];

interface DressCodeEditFormProps {
  eventId: string;
  defaultValues: DressCodeFormValues;
}

export default function DressCodeEditForm({ eventId, defaultValues }: DressCodeEditFormProps) {
  const router = useRouter();

  const {
    register,
    control,
    formState: { errors, isValid },
  } = useForm<DressCodeFormValues>({
    resolver: zodResolver(dressCodeFormSchema),
    defaultValues,
    mode: "onChange",
  });

  const { fields, append, remove } = useFieldArray({ control, name: "colors" });
  const values = useWatch({ control });
  const { state, error } = useAutosave(
    values,
    async (v) => {
      await updateDressCodeSection({ eventId, ...(v as DressCodeFormValues) });
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
        <label htmlFor="dressCodeTitle" className="block text-sm font-medium text-gray-700">
          Title
        </label>
        <input
          id="dressCodeTitle"
          type="text"
          placeholder="Dress code"
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
          {...register("title")}
        />
        {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>}
      </div>

      <div>
        <label htmlFor="dressCodeDescription" className="block text-sm font-medium text-gray-700">
          Description <span className="text-gray-400">(optional)</span>
        </label>
        <textarea
          id="dressCodeDescription"
          rows={2}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
          {...register("description")}
        />
      </div>

      <div>
        <label htmlFor="dressCodeVariant" className="block text-sm font-medium text-gray-700">
          Layout
        </label>
        <select
          id="dressCodeVariant"
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
          {...register("dressCodeVariant")}
        >
          {dressCodeVariantOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-3">
        {fields.map((field, index) => (
          <div key={field.id} className="grid grid-cols-[auto_1fr_auto] items-end gap-2">
            <div>
              <label
                htmlFor={`colors.${index}.hex`}
                className="block text-sm font-medium text-gray-700"
              >
                Color
              </label>
              <input
                id={`colors.${index}.hex`}
                type="text"
                placeholder="#C9A96E"
                className="mt-1 w-28 rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
                {...register(`colors.${index}.hex` as const)}
              />
              {errors.colors?.[index]?.hex && (
                <p className="mt-1 text-sm text-red-600">{errors.colors[index]?.hex?.message}</p>
              )}
            </div>
            <div>
              <label
                htmlFor={`colors.${index}.label`}
                className="block text-sm font-medium text-gray-700"
              >
                Label <span className="text-gray-400">(optional)</span>
              </label>
              <input
                id={`colors.${index}.label`}
                type="text"
                placeholder="Guests"
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
                {...register(`colors.${index}.label` as const)}
              />
            </div>
            <button
              type="button"
              onClick={() => remove(index)}
              className="mb-1 text-sm font-medium text-red-600 hover:text-red-700"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => append({ hex: "", label: "" })}
        className="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-900 transition hover:bg-gray-50"
      >
        Add color
      </button>
    </form>
  );
}
