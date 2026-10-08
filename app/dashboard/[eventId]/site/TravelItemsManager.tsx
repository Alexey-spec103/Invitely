"use client";

import type { TravelItem } from "@/components/sections/TravelSection";

interface TravelItemsManagerProps {
  items: TravelItem[];
  onChange: (items: TravelItem[]) => void;
}

/** Same shape as TimelineEventsManager/FaqItemsManager. `bookingUrl` lives
 * here, not inline in the live section -- same reasoning as Gift's own `url`
 * field (a link target has nothing for a guest to click into as text). */
export default function TravelItemsManager({ items, onChange }: TravelItemsManagerProps) {
  const updateItem = (index: number, patch: Partial<TravelItem>) => {
    onChange(items.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  };

  return (
    <div className="rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--dash-text-muted)]">
        Places to stay
      </p>
      <p className="mt-1 text-xs text-[var(--dash-text-muted)]">
        Name and description edit directly on the card above -- promo code, price, and the booking link live here.
      </p>
      <div className="mt-3 space-y-3">
        {items.map((item, index) => (
          <div key={index} className="rounded-lg border border-[var(--dash-border)] bg-[var(--dash-surface-2)] p-2.5">
            <div className="flex flex-wrap items-end gap-2">
              <label className="flex flex-col gap-1 text-xs text-[var(--dash-text-muted)]">
                Promo code (optional)
                <input
                  type="text"
                  value={item.promoCode ?? ""}
                  onChange={(e) => updateItem(index, { promoCode: e.target.value })}
                  placeholder="e.g. SMITH2026"
                  className="w-36 rounded-md border border-[var(--dash-border)] bg-[var(--dash-surface)] px-2 py-1 text-sm text-[var(--dash-text)]"
                />
              </label>
              <label className="flex min-w-[10rem] flex-1 flex-col gap-1 text-xs text-[var(--dash-text-muted)]">
                Booking link (optional)
                <input
                  type="url"
                  value={item.bookingUrl ?? ""}
                  onChange={(e) => updateItem(index, { bookingUrl: e.target.value })}
                  placeholder="https://…"
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
          </div>
        ))}
      </div>
      <div className="mt-3">
        <button
          type="button"
          onClick={() =>
            onChange([...items, { name: "New place", description: "", promoCode: "", priceText: "", bookingUrl: "" }])
          }
          className="dash-btn dash-btn-primary"
        >
          + Add a place to stay
        </button>
      </div>
    </div>
  );
}
