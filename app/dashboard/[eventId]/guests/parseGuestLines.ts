/** Case/whitespace-insensitive identity key for a guest name -- used to warn
 * a host before creating an accidental duplicate (pasting the same
 * spreadsheet range twice, or two people separately adding the same guest),
 * not to silently block anything. Deliberately exact-normalized-match only,
 * not fuzzy/Levenshtein -- two different guests can share a very similar
 * name (e.g. siblings), so guessing at "close enough" risks more false
 * warnings than it prevents real duplicates. */
export function normalizeGuestName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, " ");
}

/** Parses one guest per line, pasted from a spreadsheet or typed by hand.
 * Each line's fields can be tab-separated (pasting a spreadsheet column
 * range preserves tabs) or comma-separated (typing by hand): name, then
 * optionally group, email, phone in that order. Plain module (not a server
 * action) so both the bulk-insert action and the client-side live preview
 * count can share the exact same parsing logic. */
export function parseGuestLines(rawText: string) {
  return rawText
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [fullName, groupLabel, email, phone] = line.split(/\t|,/).map((part) => part.trim());
      return { fullName, groupLabel, email, phone };
    })
    .filter((row) => row.fullName);
}
