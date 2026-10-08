"use client";

import type { FaqItem } from "@/components/sections/FaqSection";

interface FaqItemsManagerProps {
  items: FaqItem[];
  onChange: (items: FaqItem[]) => void;
}

/** Same "boxed settings panel below the live section, labeled rows + a clear
 * Remove per row + one big Add at the bottom" shape as
 * TimelineEventsManager/DressCodeColorsManager. Question/answer are both
 * plain text inputs here (not edited inline via the live section) so a host
 * can add a new blank item that's immediately visible to type into, the same
 * reasoning TimelineEventsManager's own comment gives for its add button. */
export default function FaqItemsManager({ items, onChange }: FaqItemsManagerProps) {
  const updateItem = (index: number, patch: Partial<FaqItem>) => {
    onChange(items.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  };

  return (
    <div className="rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--dash-text-muted)]">Questions</p>
      <p className="mt-1 text-xs text-[var(--dash-text-muted)]">Add the questions guests actually ask you.</p>
      <div className="mt-3 space-y-3">
        {items.map((item, index) => (
          <div key={index} className="rounded-lg border border-[var(--dash-border)] bg-[var(--dash-surface-2)] p-2.5">
            <div className="flex items-end gap-2">
              <label className="flex min-w-[10rem] flex-1 flex-col gap-1 text-xs text-[var(--dash-text-muted)]">
                Question
                <input
                  type="text"
                  value={item.question}
                  onChange={(e) => updateItem(index, { question: e.target.value })}
                  placeholder="e.g. Is there parking at the venue?"
                  className="rounded-md border border-[var(--dash-border)] bg-[var(--dash-surface)] px-2 py-1 text-sm text-[var(--dash-text)]"
                />
              </label>
              <button
                type="button"
                onClick={() => onChange(items.filter((_, i) => i !== index))}
                className="dash-btn dash-btn-neutral text-xs"
              >
                Remove
              </button>
            </div>
            <label className="mt-2 flex flex-col gap-1 text-xs text-[var(--dash-text-muted)]">
              Answer
              <input
                type="text"
                value={item.answer}
                onChange={(e) => updateItem(index, { answer: e.target.value })}
                placeholder="e.g. Yes, free parking is available on-site."
                className="rounded-md border border-[var(--dash-border)] bg-[var(--dash-surface)] px-2 py-1 text-sm text-[var(--dash-text)]"
              />
            </label>
          </div>
        ))}
      </div>
      <div className="mt-3">
        <button
          type="button"
          onClick={() => onChange([...items, { question: "New question", answer: "" }])}
          className="dash-btn dash-btn-primary"
        >
          + Add question
        </button>
      </div>
    </div>
  );
}
