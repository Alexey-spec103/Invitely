import {
  Heart,
  Sparkles,
  Gem,
  Cake,
  Baby,
  Candy,
  PartyPopper,
  Crown,
  GraduationCap,
  Building2,
  Award,
  CalendarHeart,
  type LucideIcon,
} from "lucide-react";

/** Keyed by `EventTypeDef.icon` (see lib/eventTypes.ts) -- the single source
 * every icon-by-event-type lookup should read from, so a duplicate (two
 * types sharing one icon, confirmed live as a real bug once already) can't
 * silently reappear the way it did when OnboardingWizard and the landing
 * page's EventTypesSection each kept their own hand-written copy of this
 * same map. */
export const EVENT_TYPE_ICON_COMPONENTS: Record<string, LucideIcon> = {
  Heart,
  Sparkles,
  Gem,
  Cake,
  Baby,
  Candy,
  PartyPopper,
  Crown,
  GraduationCap,
  Building2,
  Award,
  CalendarHeart,
};
