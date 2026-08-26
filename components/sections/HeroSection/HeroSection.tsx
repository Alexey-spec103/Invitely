import MonogramCenter from "./variants/MonogramCenter";
import PhotoFullBleed from "./variants/PhotoFullBleed";
import MinimalText from "./variants/MinimalText";
import EditorialSplit from "./variants/EditorialSplit";
import Signature from "./variants/Signature";
import EditorialMinimal from "./variants/EditorialMinimal";
import BotanicalFrame from "./variants/BotanicalFrame";
import HandLetteringHero from "./variants/HandLetteringHero";
import Letterpress from "./variants/Letterpress";
import ArtDecoCrest from "./variants/ArtDecoCrest";
import WatercolorBloom from "./variants/WatercolorBloom";
import CoastalWave from "./variants/CoastalWave";
import VintageOrnamental from "./variants/VintageOrnamental";
import BohoAsymmetric from "./variants/BohoAsymmetric";
import MonogramCrest from "./variants/MonogramCrest";
import FolkOrnament from "./variants/FolkOrnament";
import CollageScrapbook from "./variants/CollageScrapbook";
import type { HeroSectionProps } from "./types";

export default function HeroSection({ variant, ...variantProps }: HeroSectionProps) {
  switch (variant) {
    case "monogram-center":
      return <MonogramCenter {...variantProps} />;
    case "photo-full-bleed":
      return <PhotoFullBleed {...variantProps} />;
    case "minimal-text":
      return <MinimalText {...variantProps} />;
    case "editorial-split":
      return <EditorialSplit {...variantProps} />;
    case "signature":
      return <Signature {...variantProps} />;
    case "editorial-minimal":
      return <EditorialMinimal {...variantProps} />;
    case "botanical-frame":
      return <BotanicalFrame {...variantProps} />;
    case "hand-lettering":
      return <HandLetteringHero {...variantProps} />;
    case "letterpress":
      return <Letterpress {...variantProps} />;
    case "art-deco-crest":
      return <ArtDecoCrest {...variantProps} />;
    case "watercolor-bloom":
      return <WatercolorBloom {...variantProps} />;
    case "coastal-wave":
      return <CoastalWave {...variantProps} />;
    case "vintage-ornamental":
      return <VintageOrnamental {...variantProps} />;
    case "boho-asymmetric":
      return <BohoAsymmetric {...variantProps} />;
    case "monogram-crest":
      return <MonogramCrest {...variantProps} />;
    case "folk-ornament":
      return <FolkOrnament {...variantProps} />;
    case "collage-scrapbook":
      return <CollageScrapbook {...variantProps} />;
  }
}
