import type { Theme, ThemeCategory, ThemeSeason } from "./types";
import { layoutLabelFor } from "./recommendedHeroVariant";
import { romanticBlush } from "./romantic-blush";
import { modernMono } from "./modern-mono";
import { botanicalSage } from "./botanical-sage";
import { nordicMinimal } from "./nordic-minimal";
import { bohoTerracotta } from "./boho-terracotta";
import { editorialNoir } from "./editorial-noir";
import { coastalBreeze } from "./coastal-breeze";
import { vintageRosewood } from "./vintage-rosewood";
import { gildedIvory } from "./gilded-ivory";
import { emeraldGrove } from "./emerald-grove";
import { burgundyVelvet } from "./burgundy-velvet";
import { sageAndClay } from "./sage-and-clay";
import { artDecoNoir } from "./art-deco-noir";
import { dustyBlueWinter } from "./dusty-blue-winter";
import { champagneRose } from "./champagne-rose";
import { regalNavyGold } from "./regal-navy-gold";
import { modernCharcoalBlush } from "./modern-charcoal-blush";
import { modernCobalt } from "./modern-cobalt";
import { modernTerracottaGrid } from "./modern-terracotta-grid";
import { rusticBarnwood } from "./rustic-barnwood";
import { rusticWheatfield } from "./rustic-wheatfield";
import { rusticForestCabin } from "./rustic-forest-cabin";
import { coastalLinen } from "./coastal-linen";
import { coastalNavySail } from "./coastal-navy-sail";
import { coastalSandDune } from "./coastal-sand-dune";
import { vintageSepiaLace } from "./vintage-sepia-lace";
import { vintageMintParlor } from "./vintage-mint-parlor";
import { vintagePostcard } from "./vintage-postcard";
import { bohoDesertClay } from "./boho-desert-clay";
import { bohoLavenderFields } from "./boho-lavender-fields";
import { botanicalFern } from "./botanical-fern";
import { botanicalEucalyptus } from "./botanical-eucalyptus";
import { darkOnyxRose } from "./dark-onyx-rose";
import { darkForestNoir } from "./dark-forest-noir";
import { darkPlumVelvet } from "./dark-plum-velvet";
import { luxuryEmeraldGold } from "./luxury-emerald-gold";
import { luxuryIvoryPlatinum } from "./luxury-ivory-platinum";
import { minimalStone } from "./minimal-stone";
import { minimalInk } from "./minimal-ink";
import { romanticPeony } from "./romantic-peony";
import { romanticIvoryLace } from "./romantic-ivory-lace";
import { modernSlateAmber } from "./modern-slate-amber";
import { modernBlushMono } from "./modern-blush-mono";
import { modernGraphiteTeal } from "./modern-graphite-teal";
import { rusticCopperOak } from "./rustic-copper-oak";
import { rusticOliveGrove } from "./rustic-olive-grove";
import { rusticTerracottaPot } from "./rustic-terracotta-pot";
import { romanticCherryBlossom } from "./romantic-cherry-blossom";
import { romanticAntiqueRose } from "./romantic-antique-rose";
import { romanticBlushGold } from "./romantic-blush-gold";
import { minimalTaupe } from "./minimal-taupe";
import { minimalBlueGrey } from "./minimal-blue-grey";
import { botanicalOliveBranch } from "./botanical-olive-branch";
import { botanicalWildflower } from "./botanical-wildflower";
import { botanicalMoss } from "./botanical-moss";
import { bohoSunsetRust } from "./boho-sunset-rust";
import { bohoTurquoiseTribal } from "./boho-turquoise-tribal";
import { bohoDustyRoseMacrame } from "./boho-dusty-rose-macrame";
import { darkMidnightTeal } from "./dark-midnight-teal";
import { darkCrimsonNoir } from "./dark-crimson-noir";
import { coastalSeafoamBreeze } from "./coastal-seafoam-breeze";
import { coastalDriftwood } from "./coastal-driftwood";
import { coastalAzureHorizon } from "./coastal-azure-horizon";
import { vintageDustyPlum } from "./vintage-dusty-plum";
import { vintageTobaccoLeaf } from "./vintage-tobacco-leaf";
import { vintagePowderBlue } from "./vintage-powder-blue";
import { luxuryBlackDiamond } from "./luxury-black-diamond";
import { luxuryChampagnePearl } from "./luxury-champagne-pearl";
import { modernIvoryNoir } from "./modern-ivory-noir";
import { modernCoralPop } from "./modern-coral-pop";
import { modernSageGrid } from "./modern-sage-grid";
import { modernLilacGrid } from "./modern-lilac-grid";
import { rusticHoneyHive } from "./rustic-honey-hive";
import { rusticCornflowerFarm } from "./rustic-cornflower-farm";
import { rusticCranberryHarvest } from "./rustic-cranberry-harvest";
import { rusticSunflowerField } from "./rustic-sunflower-field";
import { romanticRosewater } from "./romantic-rosewater";
import { romanticChampagneBlush } from "./romantic-champagne-blush";
import { romanticGardenParty } from "./romantic-garden-party";
import { minimalPorcelain } from "./minimal-porcelain";
import { minimalSageLine } from "./minimal-sage-line";
import { minimalClayLine } from "./minimal-clay-line";
import { botanicalLavenderSprig } from "./botanical-lavender-sprig";
import { botanicalIvyManor } from "./botanical-ivy-manor";
import { botanicalCherryBloom } from "./botanical-cherry-bloom";
import { bohoMarigoldFestival } from "./boho-marigold-festival";
import { bohoEarthenClay } from "./boho-earthen-clay";
import { bohoIndigoDye } from "./boho-indigo-dye";
import { darkEspressoGold } from "./dark-espresso-gold";
import { darkStormSilver } from "./dark-storm-silver";
import { darkWineNoir } from "./dark-wine-noir";
import { coastalMistGrey } from "./coastal-mist-grey";
import { coastalShellPink } from "./coastal-shell-pink";
import { coastalHarborBlue } from "./coastal-harbor-blue";
import { vintageAmberGlass } from "./vintage-amber-glass";
import { vintageLilacParlor } from "./vintage-lilac-parlor";
import { vintageForestEmerald } from "./vintage-forest-emerald";
import { luxurySapphireSilver } from "./luxury-sapphire-silver";
import { luxuryRoseGold } from "./luxury-rose-gold";
import { luxuryObsidianCopper } from "./luxury-obsidian-copper";
import { marbleSageGold } from "./marble-sage-gold";
import { marbleTealGold } from "./marble-teal-gold";
import { marbleNoirRust } from "./marble-noir-rust";
import { marbleOnyxSage } from "./marble-onyx-sage";
import { marbleIvoryCharcoal } from "./marble-ivory-charcoal";
import { marbleChampagneTeal } from "./marble-champagne-teal";
import { cosmicMidnightGold } from "./cosmic-midnight-gold";
import { cosmicVioletSilver } from "./cosmic-violet-silver";
import { cosmicIndigoBronze } from "./cosmic-indigo-bronze";
import { cosmicObsidianStarlight } from "./cosmic-obsidian-starlight";
import { cosmicPlumGold } from "./cosmic-plum-gold";
import { cosmicNavyCopper } from "./cosmic-navy-copper";
import { peonyBlushBurgundy } from "./peony-blush-burgundy";
import { peonyTerracottaCream } from "./peony-terracotta-cream";
import { peonyDustyMauve } from "./peony-dusty-mauve";
import { peonySageClay } from "./peony-sage-clay";
import { peonyWineIvory } from "./peony-wine-ivory";
import { peonyChampagneTerracotta } from "./peony-champagne-terracotta";
import { provenceLavenderSage } from "./provence-lavender-sage";
import { provenceCoralSage } from "./provence-coral-sage";
import { provencePeriwinkleRose } from "./provence-periwinkle-rose";
import { provenceSageTerracotta } from "./provence-sage-terracotta";
import { provenceDustyLilac } from "./provence-dusty-lilac";
import { provenceStoneLavender } from "./provence-stone-lavender";

export const themes: Record<string, Theme> = {
  [romanticBlush.id]: romanticBlush,
  [modernMono.id]: modernMono,
  [botanicalSage.id]: botanicalSage,
  [nordicMinimal.id]: nordicMinimal,
  [bohoTerracotta.id]: bohoTerracotta,
  [editorialNoir.id]: editorialNoir,
  [coastalBreeze.id]: coastalBreeze,
  [vintageRosewood.id]: vintageRosewood,
  [gildedIvory.id]: gildedIvory,
  [emeraldGrove.id]: emeraldGrove,
  [burgundyVelvet.id]: burgundyVelvet,
  [sageAndClay.id]: sageAndClay,
  [artDecoNoir.id]: artDecoNoir,
  [dustyBlueWinter.id]: dustyBlueWinter,
  [champagneRose.id]: champagneRose,
  [regalNavyGold.id]: regalNavyGold,
  [modernCharcoalBlush.id]: modernCharcoalBlush,
  [modernCobalt.id]: modernCobalt,
  [modernTerracottaGrid.id]: modernTerracottaGrid,
  [rusticBarnwood.id]: rusticBarnwood,
  [rusticWheatfield.id]: rusticWheatfield,
  [rusticForestCabin.id]: rusticForestCabin,
  [coastalLinen.id]: coastalLinen,
  [coastalNavySail.id]: coastalNavySail,
  [coastalSandDune.id]: coastalSandDune,
  [vintageSepiaLace.id]: vintageSepiaLace,
  [vintageMintParlor.id]: vintageMintParlor,
  [vintagePostcard.id]: vintagePostcard,
  [bohoDesertClay.id]: bohoDesertClay,
  [bohoLavenderFields.id]: bohoLavenderFields,
  [botanicalFern.id]: botanicalFern,
  [botanicalEucalyptus.id]: botanicalEucalyptus,
  [darkOnyxRose.id]: darkOnyxRose,
  [darkForestNoir.id]: darkForestNoir,
  [darkPlumVelvet.id]: darkPlumVelvet,
  [luxuryEmeraldGold.id]: luxuryEmeraldGold,
  [luxuryIvoryPlatinum.id]: luxuryIvoryPlatinum,
  [minimalStone.id]: minimalStone,
  [minimalInk.id]: minimalInk,
  [romanticPeony.id]: romanticPeony,
  [romanticIvoryLace.id]: romanticIvoryLace,
  [modernSlateAmber.id]: modernSlateAmber,
  [modernBlushMono.id]: modernBlushMono,
  [modernGraphiteTeal.id]: modernGraphiteTeal,
  [rusticCopperOak.id]: rusticCopperOak,
  [rusticOliveGrove.id]: rusticOliveGrove,
  [rusticTerracottaPot.id]: rusticTerracottaPot,
  [romanticCherryBlossom.id]: romanticCherryBlossom,
  [romanticAntiqueRose.id]: romanticAntiqueRose,
  [romanticBlushGold.id]: romanticBlushGold,
  [minimalTaupe.id]: minimalTaupe,
  [minimalBlueGrey.id]: minimalBlueGrey,
  [botanicalOliveBranch.id]: botanicalOliveBranch,
  [botanicalWildflower.id]: botanicalWildflower,
  [botanicalMoss.id]: botanicalMoss,
  [bohoSunsetRust.id]: bohoSunsetRust,
  [bohoTurquoiseTribal.id]: bohoTurquoiseTribal,
  [bohoDustyRoseMacrame.id]: bohoDustyRoseMacrame,
  [darkMidnightTeal.id]: darkMidnightTeal,
  [darkCrimsonNoir.id]: darkCrimsonNoir,
  [coastalSeafoamBreeze.id]: coastalSeafoamBreeze,
  [coastalDriftwood.id]: coastalDriftwood,
  [coastalAzureHorizon.id]: coastalAzureHorizon,
  [vintageDustyPlum.id]: vintageDustyPlum,
  [vintageTobaccoLeaf.id]: vintageTobaccoLeaf,
  [vintagePowderBlue.id]: vintagePowderBlue,
  [luxuryBlackDiamond.id]: luxuryBlackDiamond,
  [luxuryChampagnePearl.id]: luxuryChampagnePearl,
  [modernIvoryNoir.id]: modernIvoryNoir,
  [modernCoralPop.id]: modernCoralPop,
  [modernSageGrid.id]: modernSageGrid,
  [modernLilacGrid.id]: modernLilacGrid,
  [rusticHoneyHive.id]: rusticHoneyHive,
  [rusticCornflowerFarm.id]: rusticCornflowerFarm,
  [rusticCranberryHarvest.id]: rusticCranberryHarvest,
  [rusticSunflowerField.id]: rusticSunflowerField,
  [romanticRosewater.id]: romanticRosewater,
  [romanticChampagneBlush.id]: romanticChampagneBlush,
  [romanticGardenParty.id]: romanticGardenParty,
  [minimalPorcelain.id]: minimalPorcelain,
  [minimalSageLine.id]: minimalSageLine,
  [minimalClayLine.id]: minimalClayLine,
  [botanicalLavenderSprig.id]: botanicalLavenderSprig,
  [botanicalIvyManor.id]: botanicalIvyManor,
  [botanicalCherryBloom.id]: botanicalCherryBloom,
  [bohoMarigoldFestival.id]: bohoMarigoldFestival,
  [bohoEarthenClay.id]: bohoEarthenClay,
  [bohoIndigoDye.id]: bohoIndigoDye,
  [darkEspressoGold.id]: darkEspressoGold,
  [darkStormSilver.id]: darkStormSilver,
  [darkWineNoir.id]: darkWineNoir,
  [coastalMistGrey.id]: coastalMistGrey,
  [coastalShellPink.id]: coastalShellPink,
  [coastalHarborBlue.id]: coastalHarborBlue,
  [vintageAmberGlass.id]: vintageAmberGlass,
  [vintageLilacParlor.id]: vintageLilacParlor,
  [vintageForestEmerald.id]: vintageForestEmerald,
  [luxurySapphireSilver.id]: luxurySapphireSilver,
  [luxuryRoseGold.id]: luxuryRoseGold,
  [luxuryObsidianCopper.id]: luxuryObsidianCopper,
  [marbleSageGold.id]: marbleSageGold,
  [marbleTealGold.id]: marbleTealGold,
  [marbleNoirRust.id]: marbleNoirRust,
  [marbleOnyxSage.id]: marbleOnyxSage,
  [marbleIvoryCharcoal.id]: marbleIvoryCharcoal,
  [marbleChampagneTeal.id]: marbleChampagneTeal,
  [cosmicMidnightGold.id]: cosmicMidnightGold,
  [cosmicVioletSilver.id]: cosmicVioletSilver,
  [cosmicIndigoBronze.id]: cosmicIndigoBronze,
  [cosmicObsidianStarlight.id]: cosmicObsidianStarlight,
  [cosmicPlumGold.id]: cosmicPlumGold,
  [cosmicNavyCopper.id]: cosmicNavyCopper,
  [peonyBlushBurgundy.id]: peonyBlushBurgundy,
  [peonyTerracottaCream.id]: peonyTerracottaCream,
  [peonyDustyMauve.id]: peonyDustyMauve,
  [peonySageClay.id]: peonySageClay,
  [peonyWineIvory.id]: peonyWineIvory,
  [peonyChampagneTerracotta.id]: peonyChampagneTerracotta,
  [provenceLavenderSage.id]: provenceLavenderSage,
  [provenceCoralSage.id]: provenceCoralSage,
  [provencePeriwinkleRose.id]: provencePeriwinkleRose,
  [provenceSageTerracotta.id]: provenceSageTerracotta,
  [provenceDustyLilac.id]: provenceDustyLilac,
  [provenceStoneLavender.id]: provenceStoneLavender,
};

export const DEFAULT_THEME_ID = romanticBlush.id;

/** dashboard-audit.md B6: weddingpost.ru's "Популярные"/"Новые" entries rank
 * by real usage/upload date -- neither exists here (all 100 themes shipped
 * in one batch, confirmed via git history), so these are a deliberate
 * editorial curation for visual spread across categories, not a computed
 * metric pretending to be one. */
export const POPULAR_THEME_IDS: string[] = [
  "romantic-blush",
  "modern-mono",
  "botanical-sage",
  "gilded-ivory",
  "coastal-breeze",
  "boho-terracotta",
  "luxury-rose-gold",
  "minimal-ink",
];

export const NEW_THEME_IDS: string[] = [
  "romantic-cherry-blossom",
  "coastal-azure-horizon",
  "dark-storm-silver",
  "vintage-amber-glass",
  "boho-marigold-festival",
  "rustic-honey-hive",
  "minimal-porcelain",
  "luxury-obsidian-copper",
];

export const THEME_TAGS: string[] = Array.from(
  new Set(Object.values(themes).flatMap((theme) => theme.tags))
).sort();

export const THEME_CATEGORIES: Record<ThemeCategory, number> = Object.values(themes).reduce(
  (counts, theme) => {
    counts[theme.category] = (counts[theme.category] ?? 0) + 1;
    return counts;
  },
  {} as Record<ThemeCategory, number>
);

export const THEME_SEASONS: Record<ThemeSeason, number> = Object.values(themes).reduce(
  (counts, theme) => {
    if (theme.season) {
      counts[theme.season] = (counts[theme.season] ?? 0) + 1;
    }
    return counts;
  },
  {} as Record<ThemeSeason, number>
);

/** A second, independent taxonomy axis -- "what is this design built
 * from" (Line Art, Watercolor, Photo Invitation, Monogram, ...) -- derived
 * from each theme's recommended Hero archetype rather than hand-tagged, so
 * it always reflects the real composition. See `recommendedHeroVariant.ts`. */
export const THEME_LAYOUTS: Record<string, number> = Object.values(themes).reduce(
  (counts, theme) => {
    const label = layoutLabelFor(theme.id, theme.category);
    counts[label] = (counts[label] ?? 0) + 1;
    return counts;
  },
  {} as Record<string, number>
);

export function getTheme(id: string): Theme {
  const theme = themes[id];
  if (!theme) {
    throw new Error(`Unknown theme id: "${id}"`);
  }
  return theme;
}

export type { Theme, ThemeVars, ThemeCategory, ThemeSeason } from "./types";
export { layoutLabelFor } from "./recommendedHeroVariant";
