"use client";

import { useRouter } from "next/navigation";
import ThemeGallery from "@/components/theme/ThemeGallery";
import type { Theme } from "@/lib/themes";

interface LandingThemeGalleryProps {
  themes: Theme[];
}

/** Public, unauthenticated browsing of the same gallery used in the
 * dashboard/onboarding -- picking a card carries the theme id into signup
 * (`?theme=`), same click-through behavior ThemeShowcaseCard used to
 * provide via a plain Link. No owner-scoped data ever touches this
 * component: `Theme` is static config, not anything tied to a user. */
export default function LandingThemeGallery({ themes }: LandingThemeGalleryProps) {
  const router = useRouter();

  return <ThemeGallery themes={themes} onSelect={(themeId) => router.push(`/onboarding?theme=${themeId}`)} />;
}
