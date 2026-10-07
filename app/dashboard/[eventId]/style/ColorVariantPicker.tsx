"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { colorVariantOptionsFor } from "@/lib/themes";
import type { Theme } from "@/lib/themes";
import { updateColorVariant } from "../actions";

interface ColorVariantPickerProps {
  eventId: string;
  /** The currently selected base theme -- only rendered by the caller when
   * this is `modern` or `minimal` (see colorVariantOptionsFor's own
   * comment for why only those two categories are safe to recolor). */
  theme: Theme;
  currentColorVariantId: string | null;
}

/** A small swatch row letting a modern/minimal theme borrow a same-category
 * sibling's bg/text/accent -- every other category's decor is a fixed-
 * palette illustration that would clash with an unrelated accent (see
 * lib/themes/decorMotifs.ts), so this never renders for those. Reuses
 * already-designed, already-contrast-checked sibling palettes rather than
 * inventing new colors -- zero new color-design risk. */
export default function ColorVariantPicker({ eventId, theme, currentColorVariantId }: ColorVariantPickerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const options = colorVariantOptionsFor(theme);
  if (options.length === 0) return null;

  const apply = (colorVariantId: string | null) => {
    setError(null);
    startTransition(async () => {
      const result = await updateColorVariant({ eventId, colorVariantId });
      if (result.ok) {
        router.refresh();
      } else {
        setError(result.message);
      }
    });
  };

  return (
    <div className="mt-4 flex flex-wrap items-center gap-2 rounded-md border border-gray-200 bg-white p-3">
      <span className="text-xs font-medium text-gray-500">Color</span>
      <button
        type="button"
        onClick={() => apply(null)}
        disabled={isPending}
        title={theme.name}
        aria-label={`Use ${theme.name}'s own colors`}
        className={`h-7 w-7 shrink-0 rounded-full border-2 transition ${
          !currentColorVariantId ? "border-gray-900" : "border-transparent hover:border-gray-300"
        }`}
        style={{ backgroundColor: theme.vars["--theme-accent"] }}
      />
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          onClick={() => apply(option.id)}
          disabled={isPending}
          title={option.name}
          aria-label={`Use ${option.name}'s colors`}
          className={`h-7 w-7 shrink-0 rounded-full border-2 transition ${
            currentColorVariantId === option.id ? "border-gray-900" : "border-transparent hover:border-gray-300"
          }`}
          style={{ backgroundColor: option.vars["--theme-accent"] }}
        />
      ))}
      {error && <p className="w-full text-xs text-red-600">{error}</p>}
    </div>
  );
}
