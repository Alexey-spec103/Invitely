import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTheme } from "@/lib/themes";
import { previewNamesFor, previewPhotoFor, previewTargetDateFor, formatPreviewDate } from "@/lib/themes/previewMedia";
import { recommendedHeroVariantFor } from "@/lib/themes/recommendedHeroVariant";
import { HeroSection, HERO_VARIANTS, DEFAULT_HERO_VARIANT } from "@/components/sections/HeroSection";
import type { HeroVariant } from "@/components/sections/HeroSection";
import ThemeProvider from "@/components/theme/ThemeProvider";

/** The scannable-QR destination for ThemeGalleryCard's "scan to preview"
 * corner badge (dashboard-audit.md-style honesty check: reuses the exact
 * same demo data the card's own inline phone mockup already renders --
 * previewNamesFor/previewPhotoFor/previewTargetDateFor -- rather than
 * inventing new synthetic content, so what a guest sees on their phone
 * always matches the card they scanned. Public, no auth: a shopper hasn't
 * created an event yet, that's the whole point of letting them scan first. */
export async function generateMetadata({ params }: PageProps<"/preview/[themeId]">): Promise<Metadata> {
  const { themeId } = await params;
  let theme;
  try {
    theme = getTheme(themeId);
  } catch {
    return { title: "Style not found" };
  }
  return {
    title: `${theme.name} — live preview`,
    // Synthetic demo content repeated once per theme (~100 near-identical
    // pages) -- not worth indexing, and duplicate-content-shaped besides.
    robots: { index: false, follow: false },
  };
}

export default async function ThemePreviewPage({ params }: PageProps<"/preview/[themeId]">) {
  const { themeId } = await params;
  let theme;
  try {
    theme = getTheme(themeId);
  } catch {
    notFound();
  }

  const [name1, name2] = previewNamesFor(theme.id);
  const photoUrl = `${previewPhotoFor(theme.id, theme.category)}?w=1600&q=75&fit=crop&auto=format`;
  const targetDate = previewTargetDateFor(theme.id, theme.season);
  const dateLabel = formatPreviewDate(targetDate);
  const recommendedVariant = recommendedHeroVariantFor(theme.id, theme.category);
  const heroVariant: HeroVariant = HERO_VARIANTS.includes(recommendedVariant as HeroVariant)
    ? (recommendedVariant as HeroVariant)
    : DEFAULT_HERO_VARIANT;

  return (
    <>
      <div className="sticky top-0 z-40 flex items-center justify-between gap-3 border-b border-stone-200 bg-white/90 px-4 py-2.5 backdrop-blur">
        <p className="text-xs text-stone-500">
          <span className="font-semibold text-stone-900">{theme.name}</span> — live demo preview
        </p>
        <Link
          href={`/onboarding?theme=${theme.id}`}
          className="shrink-0 rounded-full bg-[#ff6b45] px-3.5 py-1.5 text-xs font-bold text-white transition hover:bg-[#e85a37]"
        >
          Use this style →
        </Link>
      </div>
      <ThemeProvider theme={theme}>
        <HeroSection variant={heroVariant} names={[name1, name2]} eventDate={dateLabel} photoUrl={photoUrl} />
      </ThemeProvider>
    </>
  );
}
