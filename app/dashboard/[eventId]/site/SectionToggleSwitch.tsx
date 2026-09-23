"use client";

/** Shared big pill toggle -- used by SectionModulesPanel's module/envelope
 * rows and by SectionHeader's own inline toggle in the live preview, so
 * "off" always looks the same regardless of which panel you toggled it
 * from. Extracted rather than duplicated a third time. */
export default function SectionToggleSwitch({
  checked,
  onChange,
  disabled,
  label,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative h-7 w-12 shrink-0 rounded-full border-2 transition disabled:opacity-50 ${
        checked ? "border-[var(--dash-accent)] bg-[var(--dash-accent)]" : "border-[var(--dash-text-muted)] bg-[var(--dash-surface)]"
      }`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full shadow transition-all ${
          checked ? "right-0.5 bg-white" : "left-0.5 bg-[var(--dash-text-muted)]"
        }`}
      />
    </button>
  );
}
