"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

const NAV_LINKS = [
  { href: "#constructor", label: "Constructor" },
  { href: "#themes", label: "Themes" },
  { href: "#whats-included", label: "What's included" },
  { href: "#pricing", label: "Pricing" },
];

interface MobileNavProps {
  /** Login stays out of the always-visible mobile header row (Logo + hamburger
   * + CTA is already tight at 390px) and lives in this dropdown instead, next
   * to the same anchor links -- only when logged out, matching the desktop
   * header's own `!user` check. */
  showLogin: boolean;
}

/** landing mobile audit: the desktop anchor nav (`hidden ... sm:flex`) has no
 * mobile counterpart, so Constructor/Themes/What's included/Pricing become
 * completely unreachable below the sm breakpoint -- this is that missing
 * counterpart, not a redesign of the desktop nav. */
export default function MobileNav({ showLogin }: MobileNavProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="sm:hidden">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-label={open ? "Close menu" : "Open menu"}
        className="flex h-9 w-9 items-center justify-center rounded-full text-stone-600 hover:bg-stone-100 hover:text-stone-900"
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>
      {open && (
        <div className="absolute inset-x-0 top-full border-b border-stone-100 bg-white px-6 py-3 shadow-sm">
          <nav className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-2 py-2 text-sm font-medium text-stone-600 hover:bg-stone-50 hover:text-stone-900"
              >
                {link.label}
              </a>
            ))}
            {showLogin && (
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="rounded-lg px-2 py-2 text-sm font-medium text-stone-600 hover:bg-stone-50 hover:text-stone-900"
              >
                Login
              </Link>
            )}
          </nav>
        </div>
      )}
    </div>
  );
}
