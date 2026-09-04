"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { reorderSection } from "./actions";
import { SECTION_LABELS, type SectionType } from "@/components/sections/registry";

interface SectionOrderManagerProps {
  eventId: string;
  sectionTypes: SectionType[];
}

export default function SectionOrderManager({ eventId, sectionTypes }: SectionOrderManagerProps) {
  const router = useRouter();
  const [pending, setPending] = useState<string | null>(null);

  const move = async (sectionType: SectionType, direction: "up" | "down") => {
    setPending(sectionType);
    try {
      await reorderSection(eventId, sectionType, direction);
      router.refresh();
    } finally {
      setPending(null);
    }
  };

  if (sectionTypes.length < 2) {
    return null;
  }

  return (
    <div className="mb-8 rounded-md border border-[var(--dash-border)] bg-[var(--dash-surface)] p-4">
      <h2 className="dash-h2 text-sm text-[var(--dash-accent)]">Section order</h2>
      <p className="mt-1 text-xs text-[var(--dash-text-muted)]">
        Change the order sections appear in on your public site.
      </p>
      <ul className="mt-3 space-y-1">
        {sectionTypes.map((type, index) => (
          <li
            key={type}
            className="flex items-center justify-between rounded-md bg-[var(--dash-surface-2)] px-3 py-1.5 text-sm text-[var(--dash-text)]"
          >
            <span>{SECTION_LABELS[type]}</span>
            <span className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => move(type, "up")}
                disabled={index === 0 || pending !== null}
                className="rounded px-1.5 py-0.5 text-[var(--dash-text-muted)] hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
                aria-label={`Move ${SECTION_LABELS[type]} up`}
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => move(type, "down")}
                disabled={index === sectionTypes.length - 1 || pending !== null}
                className="rounded px-1.5 py-0.5 text-[var(--dash-text-muted)] hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
                aria-label={`Move ${SECTION_LABELS[type]} down`}
              >
                ↓
              </button>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
