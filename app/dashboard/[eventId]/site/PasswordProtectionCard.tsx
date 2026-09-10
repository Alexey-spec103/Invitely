"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ModuleCard from "@/components/ui/ModuleCard";
import { setSitePassword, disableSitePassword } from "./password-actions";

interface PasswordProtectionCardProps {
  eventId: string;
  enabled: boolean;
}

/** Follows the Custom Domain card's precedent: `ModuleCard` used only for its
 * shell + status badge, not its enabled/onToggle switch -- that switch
 * persists the instant it's flipped, which doesn't fit "turning this on
 * requires a password first". The form below manages its own state instead,
 * the same way DomainEditForm does. Free on every plan -- no plan gate here,
 * unlike Custom Domain's `hasBasicAccess`. */
export default function PasswordProtectionCard({ eventId, enabled }: PasswordProtectionCardProps) {
  const router = useRouter();
  // Starts open whenever there's nothing else useful to show yet.
  const [showForm, setShowForm] = useState(!enabled);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDisabling, setIsDisabling] = useState(false);

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setIsSaving(true);
    try {
      await setSitePassword(eventId, password);
      setPassword("");
      setShowForm(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDisable = async () => {
    setError(null);
    setIsDisabling(true);
    try {
      await disableSitePassword(eventId);
      setShowForm(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to turn off");
    } finally {
      setIsDisabling(false);
    }
  };

  return (
    <ModuleCard
      icon="🔒"
      title="Password protection"
      status={{ label: enabled ? "On" : "Off", tone: enabled ? "on" : "off" }}
    >
      <div className="space-y-3">
        {enabled && !showForm && (
          <>
            <p className="text-sm text-[var(--dash-text-muted)]">
              🔒 Guests need this password to view your site.
            </p>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setShowForm(true)}
                className="text-sm font-semibold text-[var(--dash-accent)]"
              >
                Change password
              </button>
              <button
                type="button"
                onClick={handleDisable}
                disabled={isDisabling}
                className="text-sm font-medium text-[var(--dash-text-muted)] hover:text-[var(--dash-text)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isDisabling ? "Turning off…" : "Turn off"}
              </button>
            </div>
          </>
        )}

        {showForm && (
          <form onSubmit={handleSave} className="space-y-3">
            <p className="text-sm text-[var(--dash-text-muted)]">
              Require guests to enter a password before they can view your site.
            </p>
            <input
              type="text"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Choose a password"
              className="dash-input"
              autoComplete="off"
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
            <div className="flex items-center gap-3">
              <button type="submit" disabled={isSaving} className="dash-btn dash-btn-primary">
                {isSaving ? "Saving…" : enabled ? "Save new password" : "Turn on"}
              </button>
              {enabled && (
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setPassword("");
                    setError(null);
                  }}
                  className="text-sm font-medium text-[var(--dash-text-muted)] hover:text-[var(--dash-text)]"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        )}

        <p className="text-xs text-[var(--dash-text-muted)]">Free on every plan.</p>
      </div>
    </ModuleCard>
  );
}
