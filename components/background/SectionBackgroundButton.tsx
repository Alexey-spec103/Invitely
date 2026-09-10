"use client";

import { useEffect, useRef, useState } from "react";
import { Palette } from "lucide-react";
import BackgroundPicker from "./BackgroundPicker";
import type { BackgroundFill } from "@/lib/backgroundFills";

interface SectionBackgroundButtonProps {
  value: BackgroundFill | undefined;
  onChange: (fill: BackgroundFill | undefined) => void;
}

/** dashboard-audit.md B12: the per-section "🎨 Background" control in the
 * Site editor -- same outside-click/Escape popover pattern as HowItWorksButton
 * and UserMenu, wrapping the shared BackgroundPicker also used by Canvas/
 * Paper's LayersPanel. Dropped into SectionHeader's existing `extra` slot at
 * each section's call site, so it doesn't need its own layout work. */
export default function SectionBackgroundButton({ value, onChange }: SectionBackgroundButtonProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative" onClick={(event) => event.stopPropagation()}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label="Section background"
        title="Background"
        className={
          "flex h-6 w-6 items-center justify-center rounded-full transition " +
          (value
            ? "text-[var(--dash-accent)]"
            : "text-[var(--dash-text-muted)] hover:text-[var(--dash-text)]")
        }
      >
        <Palette className="h-3.5 w-3.5" aria-hidden="true" />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-20 mt-2 w-64 rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-3 shadow-xl">
          <BackgroundPicker value={value} onChange={onChange} />
        </div>
      )}
    </div>
  );
}
