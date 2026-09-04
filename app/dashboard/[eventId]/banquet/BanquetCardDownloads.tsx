"use client";

import { useState } from "react";
import type { Theme } from "@/lib/themes";
import type { TableCardData } from "@/components/pdf/TableCardDocument";

interface BanquetCardDownloadsProps {
  theme: Theme;
  tables: TableCardData[];
  allGuestNames: string[];
  placeCardsFilteredByRsvp: boolean;
}

function saveBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export default function BanquetCardDownloads({
  theme,
  tables,
  allGuestNames,
  placeCardsFilteredByRsvp,
}: BanquetCardDownloadsProps) {
  const [pending, setPending] = useState<"tables" | "places" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const downloadTableCards = async () => {
    setError(null);
    setPending("tables");
    try {
      const [{ pdf }, { TableCardDocument }] = await Promise.all([
        import("@react-pdf/renderer"),
        import("@/components/pdf/TableCardDocument"),
      ]);
      const blob = await pdf(<TableCardDocument theme={theme} tables={tables} />).toBlob();
      saveBlob(blob, "table-cards.pdf");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate PDF");
    } finally {
      setPending(null);
    }
  };

  const downloadPlaceCards = async () => {
    setError(null);
    setPending("places");
    try {
      const [{ pdf }, { PlaceCardDocument }] = await Promise.all([
        import("@react-pdf/renderer"),
        import("@/components/pdf/PlaceCardDocument"),
      ]);
      const blob = await pdf(
        <PlaceCardDocument theme={theme} guestNames={allGuestNames} />
      ).toBlob();
      saveBlob(blob, "place-cards.pdf");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate PDF");
    } finally {
      setPending(null);
    }
  };

  return (
    <div className="mt-12 border-t border-gray-200 pt-8">
      <h2 className="dash-h2 text-lg text-[var(--dash-accent-text)]">Print cards</h2>
      <p className="mt-1 text-sm text-gray-500">
        Table cards list who&apos;s seated where; place cards are one per guest, ready to cut.
        {placeCardsFilteredByRsvp && " Place cards only include guests who've RSVP'd attending."}
      </p>

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={downloadTableCards}
          disabled={pending !== null || tables.length === 0}
          className="dash-btn dash-btn-primary"
        >
          {pending === "tables" ? "Generating..." : "Download table cards"}
        </button>
        <button
          type="button"
          onClick={downloadPlaceCards}
          disabled={pending !== null || allGuestNames.length === 0}
          className="dash-btn dash-btn-primary"
        >
          {pending === "places" ? "Generating..." : "Download all place cards"}
        </button>
      </div>

      {error && (
        <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}
    </div>
  );
}
