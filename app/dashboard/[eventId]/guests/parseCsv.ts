/** Hand-rolled CSV parsing -- no new dependency for something this small.
 * Handles quoted fields (so a group name or note containing a comma doesn't
 * break column alignment), doubled-quote escaping (`""` -> `"`), and both
 * \n and \r\n line endings. Not a general CSV library -- just enough to
 * read back a spreadsheet export or the template this feature itself
 * offers for download. */
export function parseCsvText(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  let i = 0;
  const len = text.length;

  while (i < len) {
    const char = text[i];
    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i++;
        continue;
      }
      field += char;
      i++;
      continue;
    }
    if (char === '"') {
      inQuotes = true;
      i++;
      continue;
    }
    if (char === ",") {
      row.push(field);
      field = "";
      i++;
      continue;
    }
    if (char === "\r") {
      i++;
      continue;
    }
    if (char === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
      i++;
      continue;
    }
    field += char;
    i++;
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows.filter((r) => r.some((cell) => cell.trim() !== ""));
}

export interface ParsedCsvGuestRow {
  fullName: string;
  groupLabel: string;
  email: string;
  phone: string;
}

// Same forgiving spirit as parseGuestLines.ts's own header tolerance for
// pasted text -- a host's own spreadsheet export rarely uses this product's
// exact field names, so match on a normalized (lowercase, no punctuation)
// comparison against a few real variants people actually use.
const NAME_HEADERS = ["name", "fullname", "guestname", "guest"];
const GROUP_HEADERS = ["group", "grouplabel", "category", "side"];
const EMAIL_HEADERS = ["email", "emailaddress"];
const PHONE_HEADERS = ["phone", "phonenumber", "telephone", "mobile", "mobilenumber", "cell"];

function normalizeHeader(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
}

/** Turns parsed CSV cells into the same {fullName, groupLabel, email, phone}
 * shape parseGuestLines.ts already produces from pasted text, so callers can
 * feed the result through the exact same bulk-insert path (addGuestsBulk)
 * instead of this file needing its own database logic. If the first row
 * doesn't look like a recognizable header (no name-like column), every row
 * is treated as data in the template's own column order: name, group,
 * email, phone. */
export function mapCsvRowsToGuests(rows: string[][]): ParsedCsvGuestRow[] {
  if (rows.length === 0) return [];

  const headerCells = rows[0].map(normalizeHeader);
  const nameIdx = headerCells.findIndex((h) => NAME_HEADERS.includes(h));
  const hasHeader = nameIdx !== -1;

  const groupIdx = hasHeader ? headerCells.findIndex((h) => GROUP_HEADERS.includes(h)) : 1;
  const emailIdx = hasHeader ? headerCells.findIndex((h) => EMAIL_HEADERS.includes(h)) : 2;
  const phoneIdx = hasHeader ? headerCells.findIndex((h) => PHONE_HEADERS.includes(h)) : 3;
  const effectiveNameIdx = hasHeader ? nameIdx : 0;

  const dataRows = hasHeader ? rows.slice(1) : rows;

  return dataRows
    .map((cells) => ({
      fullName: (cells[effectiveNameIdx] ?? "").trim(),
      groupLabel: groupIdx >= 0 ? (cells[groupIdx] ?? "").trim() : "",
      email: emailIdx >= 0 ? (cells[emailIdx] ?? "").trim() : "",
      phone: phoneIdx >= 0 ? (cells[phoneIdx] ?? "").trim() : "",
    }))
    .filter((row) => row.fullName);
}

/** Re-serializes parsed CSV rows as the tab-separated "one guest per line"
 * text parseGuestLines.ts/addGuestsBulk already accept -- tabs, not commas,
 * since a real name/group/email practically never contains a literal tab,
 * while commas routinely do (e.g. "Smith, Jr." as a group label), so
 * joining with commas here would just reintroduce the exact ambiguity a
 * real CSV parser exists to avoid. */
export function guestRowsToBulkText(rows: ParsedCsvGuestRow[]): string {
  return rows.map((row) => [row.fullName, row.groupLabel, row.email, row.phone].join("\t")).join("\n");
}

/** One quoted CSV field -- doubles any embedded quotes, always quotes (safe
 * and simple over conditionally quoting only when a comma/quote is
 * present). */
function csvField(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}

export function toCsvText(headers: string[], rows: string[][]): string {
  const lines = [headers, ...rows].map((cells) => cells.map(csvField).join(","));
  return lines.join("\r\n");
}
