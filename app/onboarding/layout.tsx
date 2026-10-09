import Link from "next/link";
import LanguageSwitcher from "@/components/site/LanguageSwitcher";
import { resolveGuestLocale } from "@/lib/i18n/resolveLocale";
import { getDictionary } from "@/lib/i18n/dictionary";
import { SUPPORTED_LOCALES } from "@/lib/i18n/locales";
import { createClient } from "@/lib/supabase/server";

export default async function OnboardingLayout({ children }: { children: React.ReactNode }) {
  // max-w-6xl, not max-w-3xl -- raised so the theme-picking step (which
  // needs real room for ThemeGallery's sidebar + card grid) can use the
  // full width. OnboardingWizard.tsx re-adds its own max-w-3xl wrapper for
  // every other step, so their narrow single-column look is unchanged.
  const locale = await resolveGuestLocale();
  const languageLabel = getDictionary(locale).languageSwitcher.label;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex min-h-screen flex-col items-center bg-gray-50 px-4 py-12">
      {/* 2026-10-09 usability audit: every logged-out CTA on the landing page
          points here, and this was the one entry point with no way back to
          login at all -- a returning user had no path except the browser's
          back button or scrolling all the way to the footer on a different
          page. Same cross-link copy/style LoginForm.tsx already uses. Gated
          on `!user` like every other login link on the site -- a user who's
          already logged in and came here to start a second event shouldn't
          be told "already have an account?". */}
      <div className="mb-4 flex w-full max-w-6xl items-center justify-between">
        {user ? (
          <span />
        ) : (
          <p className="text-sm text-gray-500">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-gray-900 underline underline-offset-2">
              Log in
            </Link>
          </p>
        )}
        <LanguageSwitcher currentLocale={locale} availableLocales={SUPPORTED_LOCALES} label={languageLabel} />
      </div>
      <div className="flex w-full max-w-6xl flex-1 items-center">
        <div className="w-full">{children}</div>
      </div>
    </div>
  );
}
