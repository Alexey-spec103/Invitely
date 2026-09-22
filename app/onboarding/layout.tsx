export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  // max-w-6xl, not max-w-3xl -- raised so the theme-picking step (which
  // needs real room for ThemeGallery's sidebar + card grid) can use the
  // full width. OnboardingWizard.tsx re-adds its own max-w-3xl wrapper for
  // every other step, so their narrow single-column look is unchanged.
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-6xl">{children}</div>
    </div>
  );
}
