"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { addGiftPreference, updateGiftPreference, deleteGiftPreference } from "./gift-actions";
import type { Tables } from "@/lib/supabase/database.types";

const giftFormSchema = z.object({
  title: z.string().min(1, "Enter a title"),
  type: z.string().min(1, "Enter a type"),
  url: z.string(),
  imageUrl: z.string(),
  description: z.string(),
});

type GiftFormValues = z.infer<typeof giftFormSchema>;

interface GiftWishesManagerProps {
  eventId: string;
  preferences: Tables<"gift_preferences">[];
}

function EditGiftForm({
  item,
  onDone,
  onCancel,
}: {
  item: Tables<"gift_preferences">;
  onDone: () => void;
  onCancel: () => void;
}) {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<GiftFormValues>({
    resolver: zodResolver(giftFormSchema),
    defaultValues: {
      title: item.title,
      type: item.type,
      url: item.url ?? "",
      imageUrl: item.image_url ?? "",
      description: item.description ?? "",
    },
  });

  const onSubmit = async (values: GiftFormValues) => {
    setFormError(null);
    try {
      await updateGiftPreference({ giftId: item.id, ...values });
      router.refresh();
      onDone();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to save");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-2 grid gap-3 sm:grid-cols-2" noValidate>
      <div>
        <label htmlFor={`edit-giftTitle-${item.id}`} className="block text-xs font-medium text-[var(--dash-text-muted)]">
          Title
        </label>
        <input
          id={`edit-giftTitle-${item.id}`}
          type="text"
          className="mt-1 dash-input-dark"
          {...register("title")}
        />
        {errors.title && <p className="mt-1 text-xs text-red-400">{errors.title.message}</p>}
      </div>

      <div>
        <label htmlFor={`edit-giftType-${item.id}`} className="block text-xs font-medium text-[var(--dash-text-muted)]">
          Type
        </label>
        <input
          id={`edit-giftType-${item.id}`}
          type="text"
          className="mt-1 dash-input-dark"
          {...register("type")}
        />
        {errors.type && <p className="mt-1 text-xs text-red-400">{errors.type.message}</p>}
      </div>

      <div>
        <label htmlFor={`edit-giftUrl-${item.id}`} className="block text-xs font-medium text-[var(--dash-text-muted)]">
          Link
        </label>
        <input
          id={`edit-giftUrl-${item.id}`}
          type="text"
          className="mt-1 dash-input-dark"
          {...register("url")}
        />
      </div>

      <div>
        <label htmlFor={`edit-giftImageUrl-${item.id}`} className="block text-xs font-medium text-[var(--dash-text-muted)]">
          Image URL
        </label>
        <input
          id={`edit-giftImageUrl-${item.id}`}
          type="text"
          className="mt-1 dash-input-dark"
          {...register("imageUrl")}
        />
      </div>

      <div className="sm:col-span-2">
        <label
          htmlFor={`edit-giftDescription-${item.id}`}
          className="block text-xs font-medium text-[var(--dash-text-muted)]"
        >
          Description
        </label>
        <textarea
          id={`edit-giftDescription-${item.id}`}
          rows={2}
          className="mt-1 dash-input-dark"
          {...register("description")}
        />
      </div>

      {formError && (
        <p className="sm:col-span-2 text-xs text-red-400">
          {formError}
        </p>
      )}

      <div className="flex items-center gap-3 sm:col-span-2">
        <button type="submit" disabled={isSubmitting} className="dash-btn dash-btn-primary px-3 py-1.5 text-xs">
          {isSubmitting ? "Saving..." : "Save"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="text-xs font-medium text-[var(--dash-text-muted)] hover:text-[var(--dash-text)]"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

export default function GiftWishesManager({ eventId, preferences }: GiftWishesManagerProps) {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<GiftFormValues>({
    resolver: zodResolver(giftFormSchema),
    defaultValues: { title: "", type: "", url: "", imageUrl: "", description: "" },
  });

  const onSubmit = async (values: GiftFormValues) => {
    setFormError(null);
    try {
      await addGiftPreference({ eventId, ...values });
      reset();
      router.refresh();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to save");
    }
  };

  const handleDelete = async (giftId: string) => {
    if (!window.confirm("Remove this gift preference?")) {
      return;
    }
    setDeletingId(giftId);
    try {
      await deleteGiftPreference(giftId);
      router.refresh();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to delete");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mt-6 grid gap-4 sm:grid-cols-2"
        noValidate
      >
        <div>
          <label htmlFor="giftTitle" className="block text-sm font-medium text-[var(--dash-text-muted)]">
            Title
          </label>
          <input
            id="giftTitle"
            type="text"
            placeholder="Honeymoon fund"
            className="mt-1 dash-input-dark"
            {...register("title")}
          />
          {errors.title && <p className="mt-1 text-sm text-red-400">{errors.title.message}</p>}
        </div>

        <div>
          <label htmlFor="giftType" className="block text-sm font-medium text-[var(--dash-text-muted)]">
            Type
          </label>
          <input
            id="giftType"
            type="text"
            placeholder="cash, registry, wishlist..."
            className="mt-1 dash-input-dark"
            {...register("type")}
          />
          {errors.type && <p className="mt-1 text-sm text-red-400">{errors.type.message}</p>}
        </div>

        <div>
          <label htmlFor="giftUrl" className="block text-sm font-medium text-[var(--dash-text-muted)]">
            Link <span className="text-[var(--dash-text-muted)]">(optional)</span>
          </label>
          <input
            id="giftUrl"
            type="text"
            placeholder="https://..."
            className="mt-1 dash-input-dark"
            {...register("url")}
          />
        </div>

        <div>
          <label htmlFor="giftImageUrl" className="block text-sm font-medium text-[var(--dash-text-muted)]">
            Image URL <span className="text-[var(--dash-text-muted)]">(optional)</span>
          </label>
          <input
            id="giftImageUrl"
            type="text"
            placeholder="https://..."
            className="mt-1 dash-input-dark"
            {...register("imageUrl")}
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="giftDescription" className="block text-sm font-medium text-[var(--dash-text-muted)]">
            Description <span className="text-[var(--dash-text-muted)]">(optional)</span>
          </label>
          <textarea
            id="giftDescription"
            rows={2}
            className="mt-1 dash-input-dark"
            {...register("description")}
          />
        </div>

        {formError && (
          <p className="sm:col-span-2 text-sm text-red-400">
            {formError}
          </p>
        )}

        <div className="sm:col-span-2">
          <button type="submit" disabled={isSubmitting} className="dash-btn dash-btn-primary">
            {isSubmitting ? "Adding..." : "Add gift preference"}
          </button>
        </div>
      </form>

      <ul className="mt-6 divide-y divide-[var(--dash-border)] border-t border-[var(--dash-border)]">
        {preferences.length === 0 && (
          <li className="list-none py-4">
            <button
              type="button"
              onClick={() => document.getElementById("giftTitle")?.focus()}
              className="flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[var(--dash-border)] p-8 text-center text-[var(--dash-text-muted)] transition hover:border-[var(--dash-accent)] hover:text-[var(--dash-accent)]"
            >
              <span className="text-2xl" aria-hidden="true">
                🎁
              </span>
              <span className="text-sm font-medium">No gift preferences yet</span>
              <span className="text-xs text-[var(--dash-text-muted)]">Fill in the form above to add one</span>
            </button>
          </li>
        )}
        {preferences.map((item) => (
          <li key={item.id} className="py-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[var(--dash-text)]">{item.title}</p>
                <p className="text-xs text-[var(--dash-text-muted)]">
                  {[item.type, item.description].filter(Boolean).join(" · ")}
                </p>
              </div>
              {editingId !== item.id && (
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setEditingId(item.id)}
                    className="text-sm font-medium text-[var(--dash-text-muted)] hover:text-[var(--dash-text)]"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(item.id)}
                    disabled={deletingId === item.id}
                    className="text-sm font-medium text-red-400 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {deletingId === item.id ? "Removing..." : "Remove"}
                  </button>
                </div>
              )}
            </div>
            {editingId === item.id && (
              <EditGiftForm
                item={item}
                onDone={() => setEditingId(null)}
                onCancel={() => setEditingId(null)}
              />
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
