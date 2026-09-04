"use client";

import { useState } from "react";
import type { Theme } from "@/lib/themes";
import type { GuestListRow } from "@/components/pdf/GuestListDocument";

interface GuestListDownloadProps {
  theme: Theme;
  eventTitle: string;
  rows: GuestListRow[];
}

function saveBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export default function GuestListDownload({ theme, eventTitle, rows }: GuestListDownloadProps) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDownload = async () => {
    setError(null);
    setPending(true);
    try {
      const [{ pdf }, { GuestListDocument }] = await Promise.all([
        import("@react-pdf/renderer"),
        import("@/components/pdf/GuestListDocument"),
      ]);
      const blob = await pdf(
        <GuestListDocument theme={theme} eventTitle={eventTitle} rows={rows} />
      ).toBlob();
      saveBlob(blob, "guest-list.pdf");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate PDF");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="mt-8 border-t border-gray-200 pt-6">
      <button
        type="button"
        onClick={handleDownload}
        disabled={pending || rows.length === 0}
        className="dash-btn dash-btn-neutral"
      >
        {pending ? "Generating..." : "Download printable guest list (PDF)"}
      </button>
      <p className="mt-1 text-xs text-gray-500">
        A flat name/group/RSVP/table sheet — handy for door staff, a caterer, or day-of reference.
      </p>
      {error && (
        <p className="mt-2 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}
    </div>
  );
}
