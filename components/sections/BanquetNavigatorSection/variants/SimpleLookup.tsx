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
  onLookup,
  styleOverrides,
  locale,
}: BanquetNavigatorSectionVariantProps) {
  const { editable } = useEditableField();
  const t = getDictionary(locale).banquetNavigator;
  const [name, setName] = useState("");
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<{ tableName: string | null; searchedFor: string } | null>(null);
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
      setResult({ tableName: outcome.found ? outcome.tableName : null, searchedFor: name.trim() });
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
                {result.tableName ? t.resultSeatedAt(result.searchedFor, result.tableName) : t.resultNotFound(result.searchedFor)}
              </p>
            )}
          </>
        )}
      </div>
    </section>
  );
}
