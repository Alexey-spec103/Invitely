"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { addGuestsBulk, addGuestsStructured } from "./actions";
import { parseGuestLines, normalizeGuestName } from "./parseGuestLines";
import { parseCsvText, mapCsvRowsToGuests, guestRowsToBulkText, toCsvText, type ParsedCsvGuestRow } from "./parseCsv";
import type { Tables } from "@/lib/supabase/database.types";

interface BulkAddGuestsProps {
  eventId: string;
  existingGuests: Tables<"guests">[];
}

function saveBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

const CSV_TEMPLATE_HEADERS = ["Full Name", "Group", "Email", "Phone"];
const CSV_TEMPLATE_EXAMPLE_ROW = ["Maria Test", "Family", "maria@example.com", "+1 555 0100"];

export default function BulkAddGuests({ eventId, existingGuests }: BulkAddGuestsProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addedCount, setAddedCount] = useState<number | null>(null);
  const [csvNotice, setCsvNotice] = useState<string | null>(null);
  // Tracks a CSV upload's structured rows + the exact preview text they
  // produced. parseGuestLines/addGuestsBulk splits a line on tabs OR
  // commas -- fine for hand-pasted text, but wrong for a name a real CSV
  // file correctly parsed as one field despite an internal comma (e.g.
  // "Lee, David"). As long as the textarea still reads exactly what the CSV
  // produced, submit goes through addGuestsStructured with these rows
  // directly, bypassing that lossy text format entirely. Any edit to the
  // textarea (including typing more on top of an upload) falls back to the
  // plain-text path below, same as if nothing had been uploaded -- correct
  // for plain pasted text, and a pre-existing, accepted limitation of that
  // path for anyone who happens to hand-type a comma into a name.
  const [csvRows, setCsvRows] = useState<ParsedCsvGuestRow[] | null>(null);
  const [csvPreviewText, setCsvPreviewText] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parsed = useMemo(() => parseGuestLines(text), [text]);
  const usingStructuredCsv = csvRows !== null && text === csvPreviewText;

  const handleDownloadTemplate = () => {
    const csv = toCsvText(CSV_TEMPLATE_HEADERS, [CSV_TEMPLATE_EXAMPLE_ROW]);
    saveBlob(new Blob([csv], { type: "text/csv;charset=utf-8" }), "guest-list-template.csv");
  };

  const handleCsvFile = async (file: File) => {
    setError(null);
    setCsvNotice(null);
    try {
      const raw = await file.text();
      const guestRows = mapCsvRowsToGuests(parseCsvText(raw));
      if (guestRows.length === 0) {
        setError("Couldn't find any names in that file — make sure one column has each guest's name.");
        return;
      }
      // Replaces rather than appends: mixing a CSV upload with separately
      // pasted text would mean losing the structured-row safety for names
      // with commas in them, for the sake of a rare combination. Uploading
      // twice (or pasting, then uploading) is still fine -- each submit just
      // does one or the other.
      const preview = guestRowsToBulkText(guestRows);
      setText(preview);
      setCsvRows(guestRows);
      setCsvPreviewText(preview);
      setCsvNotice(`Read ${guestRows.length} guest${guestRows.length === 1 ? "" : "s"} from "${file.name}" — review below, then add.`);
    } catch {
      setError("Couldn't read that file — make sure it's a .csv file exported from a spreadsheet.");
    }
  };

  const duplicateNames = useMemo(() => {
    const existingNames = new Set(existingGuests.map((guest) => normalizeGuestName(guest.full_name)));
    return parsed
      .filter((row) => existingNames.has(normalizeGuestName(row.fullName)))
      .map((row) => row.fullName);
  }, [parsed, existingGuests]);

  const handleSubmit = async () => {
    if (
      duplicateNames.length > 0 &&
      !window.confirm(
        `${duplicateNames.length} of these names (${duplicateNames.slice(0, 3).join(", ")}${duplicateNames.length > 3 ? ", ..." : ""}) look like guests you already have. Add them anyway?`
      )
    ) {
      return;
    }
    setError(null);
    setAddedCount(null);
    setSubmitting(true);
    try {
      const result = usingStructuredCsv
        ? await addGuestsStructured(eventId, csvRows!)
        : await addGuestsBulk(eventId, text);
      if (!result.ok) throw new Error(result.message);
      setAddedCount(result.count);
      setText("");
      setCsvNotice(null);
      setCsvRows(null);
      setCsvPreviewText(null);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add guests");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-6 border-t border-gray-200 pt-6">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="text-sm font-medium text-gray-700 underline hover:text-gray-900"
      >
        {open ? "Hide bulk add" : "Add many guests at once →"}
      </button>

      {open && (
        <div className="mt-3">
          <p className="text-xs text-gray-500">
            Paste one guest per line — from a spreadsheet or typed by hand. Optionally add group,
            email, and phone after a comma or tab: <code>Maria Test, Family, maria@example.com</code>
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void handleCsvFile(file);
                event.target.value = "";
              }}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="font-medium text-gray-700 underline hover:text-gray-900"
            >
              Or upload a CSV file →
            </button>
            <button
              type="button"
              onClick={handleDownloadTemplate}
              className="text-gray-500 underline hover:text-gray-700"
            >
              Download a blank template (.csv)
            </button>
          </div>

          {csvNotice && <p className="mt-2 text-xs text-green-700">{csvNotice}</p>}

          <textarea
            rows={6}
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder={"Maria Test\nIvan Petrov, Friends\nOlga Sidorova, Family, olga@example.com"}
            className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-xs text-gray-900 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
          />

          {duplicateNames.length > 0 && (
            <p className="mt-2 text-xs text-amber-700">
              {duplicateNames.length} name{duplicateNames.length === 1 ? "" : "s"} look like guests
              you already have: {duplicateNames.slice(0, 3).join(", ")}
              {duplicateNames.length > 3 ? ", ..." : ""}
            </p>
          )}

          <div className="mt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting || parsed.length === 0}
              className="dash-btn dash-btn-primary"
            >
              {submitting
                ? "Adding..."
                : parsed.length > 0
                  ? `Add ${parsed.length} guest${parsed.length === 1 ? "" : "s"}`
                  : "Add guests"}
            </button>
            {addedCount !== null && (
              <span className="text-sm text-green-700">Added {addedCount} guests</span>
            )}
          </div>

          {error && (
            <p className="mt-2 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
          )}
        </div>
      )}
    </div>
  );
}
