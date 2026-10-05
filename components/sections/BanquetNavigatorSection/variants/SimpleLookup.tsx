"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import type { BanquetNavigatorSectionVariantProps } from "../types";
import EditableText from "@/components/site-editor/EditableText";
import { useEditableField } from "@/components/site-editor/EditableFieldContext";
import { getDictionary } from "@/lib/i18n/dictionary";
import styles from "./SimpleLookup.module.css";

export default function SimpleLookup({
  title,
  description,
  assignedTableName,
  knownGuestName,
  onLookup,
  styleOverrides,
  locale,
}: BanquetNavigatorSectionVariantProps) {
  const { editable } = useEditableField();
  const t = getDictionary(locale).banquetNavigator;
  const [name, setName] = useState("");
  const [pending, setPending] = useState(false);
  // Direct feedback: `found: false` (never on the list -- likely a typo) and
  // `found: true, tableName: null` (a real, recognized guest whose host just
  // hasn't finished seating yet) both used to collapse into the exact same
  // "couldn't find a table" message -- alarming for the second case, which
  // is the common one early in planning. The lookup RPC already returns
  // `found`/`attending` distinctly (see the 20260818130000 migration); this
  // just finally reads them instead of only ever checking `tableName`.
  const [result, setResult] = useState<{
    searchedFor: string;
    found: boolean;
    tableName: string | null;
    attending: boolean | null;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim()) {
      setError(t.missingNameError);
      return;
    }
    setError(null);
    setPending(true);
    try {
      const outcome = await onLookup(name.trim());
      setResult({
        searchedFor: name.trim(),
        found: outcome.found,
        tableName: outcome.tableName,
        attending: outcome.attending,
      });
    } catch {
      setError(t.lookupFailedError);
    } finally {
      setPending(false);
    }
  };

  return (
    <section className={styles.section}>
      <div className={styles.card}>
        <span className={styles.flourishTopLeft} aria-hidden="true" />
        <span className={styles.flourishBottomRight} aria-hidden="true" />
        <h2 className={styles.title}>
          <EditableText field="title" value={title} style={styleOverrides?.["title"]} />
        </h2>
        {(description || editable) && (
          <p className={styles.description}>
            <EditableText field="description" value={description ?? ""} style={styleOverrides?.["description"]} />
          </p>
        )}

        {assignedTableName ? (
          <p className={styles.tableAnswer}>{t.seatedAt(assignedTableName)}</p>
        ) : knownGuestName ? (
          <p className={styles.tableAnswer}>{t.resultNotSeatedYet(knownGuestName)}</p>
        ) : (
          <>
            <form className={styles.form} onSubmit={handleSubmit}>
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder={t.yourName}
                className={styles.input}
                aria-label={t.yourName}
              />
              <button type="submit" disabled={pending} className={styles.submitButton}>
                {pending ? t.looking : t.findMyTable}
              </button>
            </form>
            {error && <p className={styles.error}>{error}</p>}
            {result && (
              <p className={styles.tableAnswer}>
                {!result.found
                  ? t.resultNotFound(result.searchedFor)
                  : result.tableName
                    ? t.resultSeatedAt(result.searchedFor, result.tableName)
                    : result.attending === false
                      ? t.resultNotAttending(result.searchedFor)
                      : t.resultNotSeatedYet(result.searchedFor)}
              </p>
            )}
          </>
        )}
      </div>
    </section>
  );
}
