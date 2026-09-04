"use client";

import { createContext, useContext } from "react";

/** Per-instance style overrides a host can apply to one editable text field.
 * Deliberately narrow -- matches exactly what weddingpost.ru's own floating
 * toolbar exposed (size/weight/color/align), confirmed via Chrome, not
 * guessed. Font family and line-height/letter-spacing stay theme-owned
 * (never exposed here) so a host can't fragment a theme's typography beyond
 * this bounded set. */
export interface TextStyleOverride {
  fontSize?: number;
  fontWeight?: number;
  color?: string;
  textAlign?: "left" | "center" | "right";
}

export type StyleOverrides = Record<string, TextStyleOverride>;

/** Deliberately carries NO data (no styleOverrides bag, no field values) --
 * only editor-mode plumbing. `styleOverrides` is normal data that flows down
 * as an ordinary prop (like `names`/`eventDate`) so it renders identically
 * on the public site (no provider) and in the dashboard editor (provider
 * present) alike. This context only toggles the *interactive chrome*
 * (selection outline, contentEditable, floating toolbar) on top of that. */
export interface EditableFieldContextValue {
  /** False on the public site and anywhere a section renders without a
   * provider (e.g. HeroVariantPicker) -- EditableText renders plain text
   * with zero extra DOM/behavior in that case, so this change can't regress
   * anything outside the new editor. */
  editable: boolean;
  selectedField: string | null;
  selectField: (field: string | null) => void;
  commitText: (field: string, value: string) => void;
  /** Pass `null` to clear the field's override entirely (reset to theme default). */
  commitStyle: (field: string, patch: TextStyleOverride | null) => void;
}

function noop() {}

const defaultValue: EditableFieldContextValue = {
  editable: false,
  selectedField: null,
  selectField: noop,
  commitText: noop,
  commitStyle: noop,
};

const EditableFieldContext = createContext<EditableFieldContextValue>(defaultValue);

export function useEditableField() {
  return useContext(EditableFieldContext);
}

export const EditableFieldProvider = EditableFieldContext.Provider;
