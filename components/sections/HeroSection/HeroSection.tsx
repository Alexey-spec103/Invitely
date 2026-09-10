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
import GothicFrame from "./variants/GothicFrame";
import BareBranch from "./variants/BareBranch";
import PostageStamp from "./variants/PostageStamp";
import VictorianCameo from "./variants/VictorianCameo";
import LeftAligned from "./variants/LeftAligned";
import StackedGrid from "./variants/StackedGrid";
import WatercolorBotanical from "./variants/WatercolorBotanical";
import AlcoholInkGold from "./variants/AlcoholInkGold";
import type { HeroSectionProps } from "./types";
import { formatEventDate } from "@/components/paper/formatEventDate";

/** dashboard-audit.md finding #6: every one of the 24 variants below just
 * displays `eventDate` as-is (`<p>{eventDate}</p>`, confirmed by grep --
 * none format it themselves), and it arrives here as the raw ISO string
 * from Wedding Data / `events.event_date` -- formatted once, in this one
 * shared dispatcher, using the same canonical formatter Paper's own
 * invitation/envelope previews already use, rather than in each variant. */
export default function HeroSection({ variant, eventDate, ...variantProps }: HeroSectionProps) {
  // Real event data always arrives here as a raw "YYYY-MM-DD" date (Wedding
  // Data / `events.event_date`) -- but several marketing/theme-gallery
  // preview call sites (HeroPhoneShowcase, ThemeGallery, etc.) pass an
  // already human-formatted string like "May 8, 2027" for their own
  // synthetic demo data, predating this component's own formatting. Onboarding's
  // live preview also renders this before a date has been chosen at all.
  // Only reformat what actually looks like a raw ISO date -- confirmed live
  // that blindly reformatting an already-formatted or empty string produces
  // "Invalid Date" instead of leaving it alone.
  const formattedEventDate = /^\d{4}-\d{2}-\d{2}$/.test(eventDate) ? formatEventDate(eventDate) : eventDate;
  switch (variant) {
    case "monogram-center":
      return <MonogramCenter {...variantProps} eventDate={formattedEventDate} />;
    case "photo-full-bleed":
      return <PhotoFullBleed {...variantProps} eventDate={formattedEventDate} />;
    case "minimal-text":
      return <MinimalText {...variantProps} eventDate={formattedEventDate} />;
    case "editorial-split":
      return <EditorialSplit {...variantProps} eventDate={formattedEventDate} />;
    case "signature":
      return <Signature {...variantProps} eventDate={formattedEventDate} />;
    case "editorial-minimal":
      return <EditorialMinimal {...variantProps} eventDate={formattedEventDate} />;
    case "botanical-frame":
      return <BotanicalFrame {...variantProps} eventDate={formattedEventDate} />;
    case "hand-lettering":
      return <HandLetteringHero {...variantProps} eventDate={formattedEventDate} />;
    case "letterpress":
      return <Letterpress {...variantProps} eventDate={formattedEventDate} />;
    case "art-deco-crest":
      return <ArtDecoCrest {...variantProps} eventDate={formattedEventDate} />;
    case "watercolor-bloom":
      return <WatercolorBloom {...variantProps} eventDate={formattedEventDate} />;
    case "coastal-wave":
      return <CoastalWave {...variantProps} eventDate={formattedEventDate} />;
    case "vintage-ornamental":
      return <VintageOrnamental {...variantProps} eventDate={formattedEventDate} />;
    case "boho-asymmetric":
      return <BohoAsymmetric {...variantProps} eventDate={formattedEventDate} />;
    case "monogram-crest":
      return <MonogramCrest {...variantProps} eventDate={formattedEventDate} />;
    case "folk-ornament":
      return <FolkOrnament {...variantProps} eventDate={formattedEventDate} />;
    case "collage-scrapbook":
      return <CollageScrapbook {...variantProps} eventDate={formattedEventDate} />;
    case "gothic-frame":
      return <GothicFrame {...variantProps} eventDate={formattedEventDate} />;
    case "bare-branch":
      return <BareBranch {...variantProps} eventDate={formattedEventDate} />;
    case "postage-stamp":
      return <PostageStamp {...variantProps} eventDate={formattedEventDate} />;
    case "victorian-cameo":
      return <VictorianCameo {...variantProps} eventDate={formattedEventDate} />;
    case "left-aligned":
      return <LeftAligned {...variantProps} eventDate={formattedEventDate} />;
    case "stacked-grid":
      return <StackedGrid {...variantProps} eventDate={formattedEventDate} />;
    case "watercolor-botanical":
      return <WatercolorBotanical {...variantProps} eventDate={formattedEventDate} />;
    case "alcohol-ink-gold":
      return <AlcoholInkGold {...variantProps} eventDate={formattedEventDate} />;
  }
}
