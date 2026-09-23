"use client";

import { useEffect, useRef, useState } from "react";
import { QUOTE_SUGGESTIONS } from "@/lib/quoteSuggestions";

interface QuoteSuggestionPickerProps {
  onSelect: (quote: string) => void;
  onClear: () => void;
}

/** Trigger-button + dropdown-panel, same shape as FontPicker.tsx (the
 * codebase's existing "pick from a curated set" pattern) -- no new
 * dependency, entirely optional for the host: picking a quote is one
 * click, "Clear quote" always sits at the top of the list, and doing
 * nothing at all leaves the field exactly as it was. */
export default function QuoteSuggestionPicker({ onSelect, onClear }: QuoteSuggestionPickerProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="dash-btn dash-btn-secondary text-xs"
        title="Suggest a quote"
      >
        ✨ Suggest a quote
      </button>
      {open && (
        <div className="absolute right-0 z-20 mt-1 w-72 rounded-md border border-[var(--dash-border)] bg-[var(--dash-surface)] shadow-[0_8px_24px_rgba(0,0,0,0.5)]">
          <div className="max-h-72 overflow-auto py-1">
            <button
              type="button"
              onClick={() => {
                onClear();
                setOpen(false);
              }}
              className="block w-full px-3 py-1.5 text-left text-sm text-[var(--dash-text-muted)] hover:bg-white/5"
            >
              Clear quote
            </button>
            <div className="my-1 border-t border-[var(--dash-border)]" />
            {QUOTE_SUGGESTIONS.map((quote) => (
              <button
                key={quote}
                type="button"
                onClick={() => {
                  onSelect(quote);
                  setOpen(false);
                }}
                className="block w-full px-3 py-1.5 text-left text-sm text-[var(--dash-text)] hover:bg-white/5"
              >
                {quote}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
