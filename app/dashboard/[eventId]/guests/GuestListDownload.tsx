"use client";

import { useState } from "react";
import type { Theme } from "@/lib/themes";
import type { GuestListRow } from "@/components/pdf/GuestListDocument";
import { toCsvText } from "./parseCsv";
import { getDictionary } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/locales";

interface GuestListDownloadProps {
  theme: Theme;
  eventTitle: string;
  rows: GuestListRow[];
  locale?: Locale;
}

function saveBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export default function GuestListDownload({ theme, eventTitle, rows, locale = "en" }: GuestListDownloadProps) {
  const t = getDictionary(locale).dashboard.guests.download;
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
      setError(err instanceof Error ? err.message : t.genericError);
    } finally {
      setPending(false);
    }
  };

  const handleDownloadCsv = () => {
    const csvHeaders = [
      t.csvHeaders.name,
      t.csvHeaders.group,
      t.csvHeaders.status,
      t.csvHeaders.partySize,
      t.csvHeaders.table,
      t.csvHeaders.notes,
    ];
    const csv = toCsvText(
      csvHeaders,
      rows.map((row) => [row.name, row.group, row.status, row.partySize, row.table, row.notes])
    );
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "guest-list.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mt-8 border-t border-gray-200 pt-6">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleDownload}
          disabled={pending || rows.length === 0}
          className="dash-btn dash-btn-neutral"
        >
          {pending ? t.generating : t.pdfButton}
        </button>
        <button
          type="button"
          onClick={handleDownloadCsv}
          disabled={rows.length === 0}
          className="dash-btn dash-btn-neutral"
        >
          {t.csvButton}
        </button>
      </div>
      <p className="mt-1 text-xs text-gray-500">
        {t.hint}
      </p>
      {error && (
        <p className="mt-2 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}
    </div>
  );
}
