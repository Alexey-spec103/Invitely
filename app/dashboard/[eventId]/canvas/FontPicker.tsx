"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CANVAS_FONTS, ensureCanvasFontLoaded } from "@/lib/canvas/fonts";

interface FontPickerProps {
  value: string;
  onChange: (family: string) => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  serif: "Serif",
  "sans-serif": "Sans-serif",
  script: "Script",
  display: "Display",
};

export default function FontPicker({ value, onChange }: FontPickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
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

  // Load stylesheets for whatever's currently visible in the list so the
  // dropdown itself renders each option in its own font, not just the
  // eventually-selected one.
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q ? CANVAS_FONTS.filter((f) => f.family.toLowerCase().includes(q)) : CANVAS_FONTS;
    return list.slice(0, 40);
  }, [query]);

  useEffect(() => {
    if (!open) return;
    for (const font of filtered) {
      ensureCanvasFontLoaded(font.family);
    }
  }, [open, filtered]);

  const grouped = useMemo(() => {
    const groups: Record<string, typeof filtered> = {};
    for (const font of filtered) {
      groups[font.category] ??= [];
      groups[font.category].push(font);
    }
    return groups;
  }, [filtered]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{ fontFamily: value }}
        className="min-w-[10rem] rounded-md border border-gray-300 px-2 py-1.5 text-left text-sm"
      >
        {value}
      </button>
      {open && (
        <div className="absolute z-20 mt-1 w-64 rounded-md border border-gray-200 bg-white shadow-lg">
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search fonts..."
            className="w-full border-b border-gray-200 px-3 py-2 text-sm outline-none"
          />
          <div className="max-h-72 overflow-auto py-1">
            {Object.entries(grouped).map(([category, fonts]) => (
              <div key={category}>
                <div className="px-3 pt-2 pb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">
                  {CATEGORY_LABELS[category] ?? category}
                </div>
                {fonts.map((font) => (
                  <button
                    key={font.family}
                    type="button"
                    style={{ fontFamily: font.family }}
                    onClick={() => {
                      onChange(font.family);
                      setOpen(false);
                      setQuery("");
                    }}
                    className={
                      font.family === value
                        ? "block w-full px-3 py-1.5 text-left text-sm bg-rose-50 text-rose-700"
                        : "block w-full px-3 py-1.5 text-left text-sm hover:bg-gray-50"
                    }
                  >
                    {font.family}
                  </button>
                ))}
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="px-3 py-4 text-center text-sm text-gray-400">No fonts found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
