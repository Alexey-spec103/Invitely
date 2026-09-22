import LanguageSwitcher from "@/components/site/LanguageSwitcher";
import { resolveGuestLocale } from "@/lib/i18n/resolveLocale";
import { getDictionary } from "@/lib/i18n/dictionary";
import { SUPPORTED_LOCALES } from "@/lib/i18n/locales";

export default async function OnboardingLayout({ children }: { children: React.ReactNode }) {
  // max-w-6xl, not max-w-3xl -- raised so the theme-picking step (which
  // needs real room for ThemeGallery's sidebar + card grid) can use the
  // full width. OnboardingWizard.tsx re-adds its own max-w-3xl wrapper for
  // every other step, so their narrow single-column look is unchanged.
  const locale = await resolveGuestLocale();
  const languageLabel = getDictionary(locale).languageSwitcher.label;

  return (
    <div className="flex min-h-screen flex-col items-center bg-gray-50 px-4 py-12">
      <div className="mb-4 flex w-full max-w-6xl justify-end">
        <LanguageSwitcher currentLocale={locale} availableLocales={SUPPORTED_LOCALES} label={languageLabel} />
      </div>
      <div className="flex w-full max-w-6xl flex-1 items-center">
        <div className="w-full">{children}</div>
      </div>
    </div>
  );
}
