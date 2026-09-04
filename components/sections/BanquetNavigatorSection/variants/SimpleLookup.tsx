"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import type { BanquetNavigatorSectionVariantProps } from "../types";
import EditableText from "@/components/site-editor/EditableText";
import { useEditableField } from "@/components/site-editor/EditableFieldContext";
import styles from "./SimpleLookup.module.css";

export default function SimpleLookup({
  title,
  description,
  assignedTableName,
  onLookup,
  styleOverrides,
}: BanquetNavigatorSectionVariantProps) {
  const { editable } = useEditableField();
  const [name, setName] = useState("");
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<{ tableName: string | null; searchedFor: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim()) {
      setError("Enter the name your invitation was sent to.");
      return;
    }
    setError(null);
    setPending(true);
    try {
      const outcome = await onLookup(name.trim());
      setResult({ tableName: outcome.found ? outcome.tableName : null, searchedFor: name.trim() });
    } catch {
      setError("Something went wrong. Please try again in a moment.");
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
          <p className={styles.tableAnswer}>
            You&apos;re seated at <strong>{assignedTableName}</strong>
          </p>
        ) : (
          <>
            <form className={styles.form} onSubmit={handleSubmit}>
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Your name"
                className={styles.input}
                aria-label="Your name"
              />
              <button type="submit" disabled={pending} className={styles.submitButton}>
                {pending ? "Looking..." : "Find my table"}
              </button>
            </form>
            {error && <p className={styles.error}>{error}</p>}
            {result && (
              <p className={styles.tableAnswer}>
                {result.tableName ? (
                  <>
                    {result.searchedFor} is seated at <strong>{result.tableName}</strong>
                  </>
                ) : (
                  <>We couldn&apos;t find a table for &ldquo;{result.searchedFor}&rdquo; yet — check with the host.</>
                )}
              </p>
            )}
          </>
        )}
      </div>
    </section>
  );
}
