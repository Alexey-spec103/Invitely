"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { getDictionary } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/locales";

interface MobileNavProps {
  /** 2026-10-09 usability audit (reversing the prior approach documented
   * here): login buried one tap inside this dropdown, with no always-visible
   * affordance, was confirmed live as a real discoverability failure --
   * a generic hamburger icon next to a loud orange CTA gives a visitor no
   * reason to expect "login" lives behind it. Now rendered as a small,
   * always-visible text link in the compact header row itself, next to the
   * hamburger -- only when logged out, matching the desktop header's own
   * `!user` check. No longer duplicated inside the dropdown below. */
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
    <div className="flex items-center gap-1 md:hidden">
      {showLogin && (
        <Link
          href="/login"
          className="rounded-full px-2.5 py-1.5 text-sm font-semibold text-stone-600 transition-colors hover:bg-stone-100 hover:text-stone-900"
        >
          {t.nav.login}
        </Link>
      )}
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
          </nav>
        </div>
      )}
    </div>
  );
}
