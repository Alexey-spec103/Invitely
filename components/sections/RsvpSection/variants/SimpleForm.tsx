"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import type { RsvpSectionVariantProps } from "../types";
import EditableText from "@/components/site-editor/EditableText";
import { useEditableField } from "@/components/site-editor/EditableFieldContext";
import { getDictionary } from "@/lib/i18n/dictionary";
import styles from "./SimpleForm.module.css";

/** Shape persisted to localStorage for a self-service guest's own recall --
 * same fields as `RsvpSectionVariantProps["existingResponse"]` plus the few
 * extra bits (guestName, attendeeNames) the server-side lookup doesn't need
 * to round-trip since a personalized guest's name is already known from
 * `defaultGuestName`, but a self-service recall has nowhere else to get it. */
interface StoredRsvpResponse {
  guestName: string;
  attending: boolean;
  partySize: number;
  attendeeNames: string[];
  allergies: string;
  comment: string;
  answers: Record<string, string>;
}

function storageKey(): string {
  return `invimbo:rsvp:${window.location.pathname}`;
}

export default function SimpleForm({
  title,
  description,
  defaultGuestName,
  maxPartySize,
  questions,
  existingResponse,
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

  // A guest who arrived via their own personal invite link already has a
  // resolved name -- the common case for that audience is a single tap to
  // confirm or decline, not a multi-field form. A guest on the general
  // share link has no name yet, so there's nothing for a one-tap button to
  // confirm; that path keeps the full form as its only option.
  const isPersonalized = Boolean(defaultGuestName && defaultGuestName.trim());
  const [showFullForm, setShowFullForm] = useState(false);

  // Usability fix (2026-10-14): a guest revisiting their own link after
  // already RSVP'ing saw a blank form every time -- no memory of what they'd
  // already said, so fixing a typo or adding a dietary note meant retyping
  // the whole thing. `existingResponse` (server-looked-up, only ever set for
  // a personalized guest -- see app/e/[slug]/page.tsx) is authoritative and
  // wins when present. A self-service guest has no guest_id to look up
  // before they've typed a name once, so there's nothing to look up
  // server-side on first paint -- `storedResponse` below is this component's
  // own best-effort recall from localStorage instead, same browser only.
  const [storedResponse, setStoredResponse] = useState<StoredRsvpResponse | null>(null);
  useEffect(() => {
    if (existingResponse) return;
    try {
      const raw = localStorage.getItem(storageKey());
      if (raw) setStoredResponse(JSON.parse(raw) as StoredRsvpResponse);
    } catch {
      // Private-browsing/storage-restricted contexts, or a malformed stored
      // value -- either way, just fall through to the normal blank form.
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const priorResponse = existingResponse ?? storedResponse;
  const [editingPrior, setEditingPrior] = useState(false);

  const startEditingPrior = () => {
    if (!priorResponse) return;
    // Branching on which source supplied it, not an `in` check on
    // `priorResponse` itself -- the two shapes only differ by a couple of
    // extra fields (guestName/attendeeNames) that the server-side lookup
    // never needs to send (defaultGuestName already covers it for that
    // case), not a real discriminated union TS can narrow cleanly.
    if (!existingResponse && storedResponse) {
      setGuestName(storedResponse.guestName);
      setAttendeeNames(storedResponse.attendeeNames);
    } else {
      setGuestName(defaultGuestName ?? "");
      setAttendeeNames([]);
    }
    setAttending(priorResponse.attending);
    setPartySize(String(priorResponse.partySize));
    setAllergies(priorResponse.allergies ?? "");
    setComment(priorResponse.comment ?? "");
    setAnswers(priorResponse.answers ?? {});
    setShowFullForm(true);
    setEditingPrior(true);
  };

  // Persists a self-service guest's own answer for next visit's recall --
  // a personalized guest doesn't need this (page.tsx's server-side lookup
  // already covers them, on any device), but writing it unconditionally is
  // harmless and keeps this one code path simple rather than branching on
  // `isPersonalized` for a write that's a no-op either way next time.
  const persistForRecall = (input: StoredRsvpResponse) => {
    try {
      localStorage.setItem(storageKey(), JSON.stringify(input));
    } catch {
      // Non-fatal -- worst case, no local recall next visit.
    }
  };

  const handleQuickRsvp = async (attendingValue: boolean) => {
    setError(null);
    setPending(true);
    try {
      const result = await onSubmit({
        guestName: (defaultGuestName ?? "").trim(),
        attending: attendingValue,
        partySize: 1,
        honeypot,
        formRenderedAt,
      });
      if (!result.ok) throw new Error(result.message);
      setAttending(attendingValue);
      setSubmitted(true);
      persistForRecall({
        guestName: (defaultGuestName ?? "").trim(),
        attending: attendingValue,
        partySize: 1,
        attendeeNames: [],
        allergies: "",
        comment: "",
        answers: {},
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : t.genericError);
    } finally {
      setPending(false);
    }
  };

  // dashboard-audit critique 2026-10-04 (P1): the "fill in your name and
  // attendance" error used to stay on screen, unexplained, even after the
  // guest had already fixed both fields -- it only cleared on the next
  // submit attempt. Clearing it as soon as the guest resumes editing either
  // field matches heuristic 1 (visibility of system status) without needing
  // per-field validity tracking.
  useEffect(() => {
    if (error) setError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [guestName, attending]);

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
      persistForRecall({
        guestName: guestName.trim(),
        attending,
        partySize: clampedPartySize,
        attendeeNames: trimmedAttendeeNames,
        allergies: allergies.trim(),
        comment: comment.trim(),
        answers,
      });
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

  // Usability fix (2026-10-14): a returning guest with a prior answer on
  // file sees this instead of a blank form -- `priorResponse` is either the
  // server's authoritative lookup or this browser's own localStorage recall
  // (see the comment where it's defined above). Clicking "edit" pre-fills
  // and falls through to the normal full-form branch below.
  if (priorResponse && !editingPrior) {
    return (
      <section className={styles.section}>
        <div className={styles.card}>
          <span className={styles.flourishTopLeft} aria-hidden="true" />
          <span className={styles.flourishBottomRight} aria-hidden="true" />
          <h2 className={styles.title}>
            <EditableText field="title" value={title} style={styleOverrides?.["title"]} />
          </h2>
          <p className={styles.quickGreeting}>
            {priorResponse.attending
              ? t.alreadyRespondedAttending(priorResponse.partySize)
              : t.alreadyRespondedDeclining}
          </p>
          <button type="button" className={styles.quickMoreDetails} onClick={startEditingPrior}>
            {t.editResponseButton}
          </button>
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

        {isPersonalized && !showFullForm ? (
          <div>
            <p className={styles.quickGreeting}>{t.oneTapGreeting(defaultGuestName!.trim())}</p>
            {error && (
              <p className={styles.error} role="alert">
                {error}
              </p>
            )}
            <div className={styles.quickButtons}>
              <button
                type="button"
                disabled={pending}
                className={styles.quickAcceptButton}
                onClick={() => handleQuickRsvp(true)}
              >
                {t.oneTapAccept}
              </button>
              <button
                type="button"
                disabled={pending}
                className={styles.quickDeclineButton}
                onClick={() => handleQuickRsvp(false)}
              >
                {t.oneTapDecline}
              </button>
            </div>
            <button type="button" className={styles.quickMoreDetails} onClick={() => setShowFullForm(true)}>
              {t.oneTapMoreDetails}
            </button>
          </div>
        ) : (
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
              autoComplete="name"
              className={styles.input}
              value={guestName}
              onChange={(event) => setGuestName(event.target.value)}
              aria-invalid={error != null && !guestName.trim() ? true : undefined}
              aria-describedby={error ? "rsvp-form-error" : undefined}
            />
          </div>

          <div className={styles.field}>
            <span className={styles.label}>{t.willYouJoin}</span>
            <div className={styles.attendingToggle} aria-describedby={error ? "rsvp-form-error" : undefined}>
              <button
                type="button"
                aria-pressed={attending === true}
                className={attending === true ? styles.toggleButtonActive : styles.toggleButton}
                onClick={() => setAttending(true)}
              >
                {t.accepts}
              </button>
              <button
                type="button"
                aria-pressed={attending === false}
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
                <div key={index}>
                  {/* Accessibility audit (2026-10-19): placeholder text alone
                      is not a real accessible name -- it disappears the
                      moment a guest starts typing and isn't exposed as a
                      label by every screen reader (WCAG 3.3.2). A visually-
                      hidden label gives each dynamic field its own real
                      name (distinct per index: "guest 2", "guest 3", ...)
                      while the placeholder keeps doing its sighted-user job. */}
                  <label className="sr-only" htmlFor={`rsvp-attendee-name-${index}`}>
                    {t.guestNamePlaceholder(index + 2)}
                  </label>
                  <input
                    id={`rsvp-attendee-name-${index}`}
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
                </div>
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

          {error && (
            <p id="rsvp-form-error" className={styles.error} role="alert">
              {error}
            </p>
          )}

          <button type="submit" disabled={pending} className={styles.submitButton}>
            {pending ? t.sending : t.sendRsvp}
          </button>
        </form>
        )}
      </div>
    </section>
  );
}
