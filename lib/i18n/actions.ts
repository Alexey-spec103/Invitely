"use server";

import { cookies } from "next/headers";
import { refresh } from "next/cache";
import { isSupportedLocale, LOCALE_COOKIE } from "./locales";

/** LanguageSwitcher.tsx used to write `document.cookie` directly from the
 * client and call the client-side `router.refresh()` (next/navigation) --
 * confirmed live this silently no-ops under Next 16: the cookie is written
 * correctly (a hard reload immediately picks it up), but `router.refresh()`
 * alone doesn't reliably re-render the already-mounted Server Component tree
 * with it. Next 16's own guide (node_modules/next/dist/docs/.../
 * interactive-apps.md) shows the supported pattern as a Server Action that
 * writes the cookie, then calls `refresh()` from `next/cache` -- that's what
 * this does instead. The one extra round trip is a non-issue for a locale
 * switch (infrequent, not latency-sensitive). */
export async function setLocale(locale: string): Promise<void> {
  if (!isSupportedLocale(locale)) return;
  const cookieStore = await cookies();
  cookieStore.set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  refresh();
}
