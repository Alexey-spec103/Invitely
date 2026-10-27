"use client";

import Link from "next/link";

interface TermsCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  beforeText: string;
  termsText: string;
  middleText: string;
  privacyText: string;
  afterText: string;
  id?: string;
  /** Lets each caller match its own surrounding text color (auth pages use
   * plain gray-* utilities; dashboard modals use --dash-text-muted) without
   * this shared component having to guess which theme it's rendering in. */
  className?: string;
}

/** Pre-launch legal pass (2026-10-27): every account-creation entry point
 * (signup, and the three anonymous-session upgrade flows -- see
 * lib/authUpgrade.ts's own callers) previously created a real account with
 * no explicit acceptance of the Terms/Privacy Policy, just an implied-by-
 * using-the-product clause buried in the Terms text itself. An unchecked
 * box blocks submission (via the `required` attribute, same browser-native
 * validation this codebase already relies on elsewhere rather than
 * reimplementing it in JS). */
export default function TermsCheckbox({
  checked,
  onChange,
  beforeText,
  termsText,
  middleText,
  privacyText,
  afterText,
  id = "agree-terms",
  className = "",
}: TermsCheckboxProps) {
  return (
    <label htmlFor={id} className={`flex items-start gap-2 text-sm ${className}`}>
      <input
        id={id}
        type="checkbox"
        required
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-0.5 h-4 w-4 shrink-0 rounded border-gray-300"
      />
      <span>
        {beforeText}
        <Link href="/terms" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
          {termsText}
        </Link>
        {middleText}
        <Link href="/privacy" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
          {privacyText}
        </Link>
        {afterText}
      </span>
    </label>
  );
}
