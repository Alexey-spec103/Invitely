"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CreditCard, LogOut, Settings, UserRound } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface UserMenuProps {
  userEmail: string;
  /** Plan is per-event, not a global account setting -- links to whichever
   * event the rail/switcher currently point at (same `navEventId` DashboardNav
   * itself uses), so this menu item always resolves to somewhere real. */
  planEventId: string;
}

/** dashboard-audit.md B1: `Plan` moves out of the rail and into "the user
 * menu" -- this is that menu, opened from the header's profile icon. */
export default function UserMenu({ userEmail, planEventId }: UserMenuProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  // An anonymous trial session has no email at all -- show a clear fallback
  // rather than a blank line/tooltip.
  const displayEmail = userEmail || "Guest";

  const handleSignOut = async () => {
    setSigningOut(true);
    const supabase = createClient();
    // scope: "local" -- end only this browser's session. Supabase's default
    // ("global") revokes the refresh token everywhere, signing the user out
    // of every other device/tab too, which isn't what "Sign out" here means.
    await supabase.auth.signOut({ scope: "local" });
    router.push("/login");
    router.refresh();
  };

  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        title={displayEmail}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--dash-border)] text-[var(--dash-text-muted)] transition hover:border-[var(--dash-accent)] hover:text-[var(--dash-accent)]"
      >
        <UserRound className="h-[18px] w-[18px]" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-20 mt-2 w-56 overflow-hidden rounded-lg border border-[var(--dash-border)] bg-[var(--dash-surface)] shadow-lg"
        >
          <p className="truncate border-b border-[var(--dash-border)] px-3.5 py-2.5 text-xs text-[var(--dash-text-muted)]">
            {displayEmail}
          </p>
          <Link
            href={`/dashboard/${planEventId}/plan`}
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-3.5 py-2.5 text-sm font-medium text-[var(--dash-text)] hover:bg-white/5"
          >
            <CreditCard className="h-4 w-4 text-[var(--dash-text-muted)]" aria-hidden="true" />
            Plan
          </Link>
          <Link
            href="/dashboard/account"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-3.5 py-2.5 text-sm font-medium text-[var(--dash-text)] hover:bg-white/5"
          >
            <Settings className="h-4 w-4 text-[var(--dash-text-muted)]" aria-hidden="true" />
            Account settings
          </Link>
          <button
            type="button"
            role="menuitem"
            onClick={handleSignOut}
            disabled={signingOut}
            className="flex w-full items-center gap-2.5 border-t border-[var(--dash-border)] px-3.5 py-2.5 text-left text-sm font-medium text-[var(--dash-text)] hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <LogOut className="h-4 w-4 text-[var(--dash-text-muted)]" aria-hidden="true" />
            {signingOut ? "Signing out..." : "Sign out"}
          </button>
        </div>
      )}
    </div>
  );
}
