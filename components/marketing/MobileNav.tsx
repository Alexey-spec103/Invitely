"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { getDictionary } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/locales";

interface MobileNavProps {
  /** Login stays out of the always-visible mobile header row (Logo + hamburger
   * + CTA is already tight at 390px) and lives in this dropdown instead, next
   * to the same anchor links -- only when logged out, matching the desktop
   * header's own `!user` check. */
  showLogin: boolean;
  locale: Locale;
}

/** landing mobile audit: the desktop anchor nav (`hidden ... sm:flex`) has no
 * mobile counterpart, so Constructor/Themes/What's included/Pricing become
 * completely unreachable below the sm breakpoint -- this is that missing
 * counterpart, not a redesign of the desktop nav. */
export default function MobileNav({ showLogin, locale }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const t = getDictionary(locale).landing;

  // Derived from the same dict.landing.nav keys the desktop header uses
  // (app/page.tsx), not a second copy -- can't drift out of sync with it.
  const navLinks = [
    { href: "#constructor", label: t.nav.constructor },
    { href: "#themes", label: t.nav.themes },
    { href: "#whats-included", label: t.nav.whatsIncluded },
    { href: "#pricing", label: t.nav.pricing },
  ];

  return (
    <div className="sm:hidden">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-label={open ? t.mobileNav.closeMenu : t.mobileNav.openMenu}
        className="flex h-9 w-9 items-center justify-center rounded-full text-stone-600 hover:bg-stone-100 hover:text-stone-900"
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>
      {open && (
        <div className="absolute inset-x-0 top-full border-b border-stone-100 bg-white px-6 py-3 shadow-sm">
          <nav className="flex flex-col gap-1">
            {navLinks.map((link) => (
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
                {t.nav.login}
              </Link>
            )}
          </nav>
        </div>
      )}
    </div>
  );
}
