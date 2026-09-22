"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import type { RsvpSectionVariantProps } from "../types";
import EditableText from "@/components/site-editor/EditableText";
import { useEditableField } from "@/components/site-editor/EditableFieldContext";
import { getDictionary } from "@/lib/i18n/dictionary";
import styles from "./SimpleForm.module.css";

export default function SimpleForm({
  title,
  description,
  defaultGuestName,
  maxPartySize,
  questions,
  onSubmit,
  styleOverrides,
  locale,
}: RsvpSectionVariantProps) {
  const t = getDictionary(locale).rsvp;
  const { editable } = useEditableField();
  const [guestName, setGuestName] = useState(defaultGuestName ?? "");
  const [attending, setAttending] = useState<boolean | null>(null);
  const [partySize, setPartySize] = useState("1");
  const [attendeeNames, setAttendeeNames] = useState<string[]>([]);
  const [allergies, setAllergies] = useState("");
  const [comment, setComment] = useState("");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  // Anti-spam: a real guest never sees or fills this field; a script that
  // blindly fills every input on the page will. Combined with formRenderedAt
  // (rejects submissions faster than any human could plausibly fill this
  // form) server-side in submitRsvp -- see RsvpFormInput.
  const [honeypot, setHoneypot] = useState("");
  const [formRenderedAt] = useState(() => Date.now());

  const [pending, setPending] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!guestName.trim() || attending === null) {
      setError(t.missingFieldsError);
      return;
    }

    setError(null);
    setPending(true);
    try {
      const clampedPartySize = maxPartySize
        ? Math.min(Math.max(1, Number(partySize) || 1), maxPartySize)
        : Math.max(1, Number(partySize) || 1);
      const trimmedAttendeeNames = attendeeNames.slice(0, clampedPartySize - 1).map((name) => name.trim());

      const result = await onSubmit({
        guestName: guestName.trim(),
        attending,
        partySize: clampedPartySize,
        allergies: allergies.trim() || undefined,
        comment: comment.trim() || undefined,
        answers: Object.keys(answers).length > 0 ? answers : undefined,
        attendeeNames: trimmedAttendeeNames.some(Boolean) ? trimmedAttendeeNames : undefined,
        honeypot,
        formRenderedAt,
      });
      if (!result.ok) throw new Error(result.message);
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.genericError);
    } finally {
      setPending(false);
    }
  };

  if (submitted) {
    return (
      <section className={styles.section}>
        <div className={styles.card}>
          <span className={styles.flourishTopLeft} aria-hidden="true" />
          <span className={styles.flourishBottomRight} aria-hidden="true" />
          <p className={styles.successMessage}>
            {attending ? t.successAttending : t.successDeclining}
          </p>
        </div>
      </section>
    );
  }

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

        <form className={styles.form} onSubmit={handleSubmit}>
          <div style={{ position: "absolute", left: "-9999px", width: 1, height: 1, overflow: "hidden" }} aria-hidden="true">
            <label htmlFor="rsvp-website">Website</label>
            <input
              id="rsvp-website"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={honeypot}
              onChange={(event) => setHoneypot(event.target.value)}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="rsvp-guest-name">
              {t.yourName}
            </label>
            <input
              id="rsvp-guest-name"
              type="text"
              className={styles.input}
              value={guestName}
              onChange={(event) => setGuestName(event.target.value)}
            />
          </div>

          <div className={styles.field}>
            <span className={styles.label}>{t.willYouJoin}</span>
            <div className={styles.attendingToggle}>
              <button
                type="button"
                className={attending === true ? styles.toggleButtonActive : styles.toggleButton}
                onClick={() => setAttending(true)}
              >
                {t.accepts}
              </button>
              <button
                type="button"
                className={attending === false ? styles.toggleButtonActive : styles.toggleButton}
                onClick={() => setAttending(false)}
              >
                {t.declines}
              </button>
            </div>
          </div>

          {attending === true && (
            <div className={styles.field}>
              <label className={styles.label} htmlFor="rsvp-party-size">
                {t.numberOfGuests}
              </label>
              <input
                id="rsvp-party-size"
                type="number"
                min={1}
                max={maxPartySize}
                className={styles.input}
                value={partySize}
                onChange={(event) => setPartySize(event.target.value)}
              />
              {maxPartySize && <p className={styles.optional}>{t.upToGuestsTotal(maxPartySize)}</p>}
            </div>
          )}

          {attending === true && maxPartySize && Number(partySize) > 1 && (
            <div className={styles.field}>
              <span className={styles.label}>
                {t.whoElseIsComing} <span className={styles.optional}>{t.optional}</span>
              </span>
              {Array.from({ length: Math.min(Number(partySize), maxPartySize) - 1 }).map((_, index) => (
                <input
                  key={index}
                  type="text"
                  placeholder={t.guestNamePlaceholder(index + 2)}
                  className={styles.input}
                  style={{ marginTop: index > 0 ? 8 : 0 }}
                  value={attendeeNames[index] ?? ""}
                  onChange={(event) =>
                    setAttendeeNames((prev) => {
                      const next = [...prev];
                      next[index] = event.target.value;
                      return next;
                    })
                  }
                />
              ))}
            </div>
          )}

          <div className={styles.field}>
            <label className={styles.label} htmlFor="rsvp-allergies">
              {t.allergiesOrDietary} <span className={styles.optional}>{t.optional}</span>
            </label>
            <input
              id="rsvp-allergies"
              type="text"
              className={styles.input}
              value={allergies}
              onChange={(event) => setAllergies(event.target.value)}
            />
          </div>

          {questions?.map((question, index) => (
            <div className={styles.field} key={question.id}>
              <label className={styles.label} htmlFor={`rsvp-question-${question.id}`}>
                <EditableText field={`questions.${index}.label`} value={question.label} style={styleOverrides?.[`questions.${index}.label`]} />
              </label>
              {question.type === "choice" && question.options && question.options.length > 0 ? (
                <select
                  id={`rsvp-question-${question.id}`}
                  className={styles.input}
                  value={answers[question.id] ?? ""}
                  onChange={(event) =>
                    setAnswers((prev) => ({ ...prev, [question.id]: event.target.value }))
                  }
                >
                  <option value="">{t.selectPlaceholder}</option>
                  {question.options.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  id={`rsvp-question-${question.id}`}
                  type="text"
                  className={styles.input}
                  value={answers[question.id] ?? ""}
                  onChange={(event) =>
                    setAnswers((prev) => ({ ...prev, [question.id]: event.target.value }))
                  }
                />
              )}
            </div>
          ))}

          <div className={styles.field}>
            <label className={styles.label} htmlFor="rsvp-comment">
              {t.message} <span className={styles.optional}>{t.optional}</span>
            </label>
            <textarea
              id="rsvp-comment"
              rows={3}
              className={styles.textarea}
              value={comment}
              onChange={(event) => setComment(event.target.value)}
            />
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <button type="submit" disabled={pending} className={styles.submitButton}>
            {pending ? t.sending : t.sendRsvp}
          </button>
        </form>
      </div>
    </section>
  );
}
