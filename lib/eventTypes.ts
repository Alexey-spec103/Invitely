export type NamesMode = "couple" | "single" | "title";

export interface EventTypeDef {
  id: string;
  label: string;
  icon: string;
  namesMode: NamesMode;
  namePrompts: string[];
  /** Short first-impression line shown above the names on Hero variants that
   * have an eyebrow/kicker slot (HandLetteringHero, EditorialMinimal,
   * Letterpress) -- was hardcoded to "We're getting married"/"Save the
   * date" regardless of event type; this is what actually makes the event
   * type legible to a guest at a glance instead of always reading as a
   * wedding. */
  heroEyebrow: string;
  dateLabel: string;
  /** Dashboard nav label for the table/seating-assignment tab -- "Banquet" is
   * wedding-specific jargon that reads oddly for a graduation or corporate
   * event, even though the underlying seating feature is generically useful. */
  seatingLabel: string;
  titleTemplate: (names: string[]) => string;
}

function possessive(name: string): string {
  return name.endsWith("s") ? `${name}'` : `${name}'s`;
}

export const EVENT_TYPES: Record<string, EventTypeDef> = {
  wedding: {
    id: "wedding",
    label: "Wedding",
    icon: "Heart",
    namesMode: "couple",
    namePrompts: ["First partner's name", "Second partner's name"],
    heroEyebrow: "We're getting married",
    dateLabel: "When's the big day?",
    seatingLabel: "Banquet",
    titleTemplate: (names) => `${names[0]} & ${names[1]}`,
  },
  anniversary: {
    id: "anniversary",
    label: "Anniversary",
    icon: "Sparkles",
    namesMode: "couple",
    namePrompts: ["First partner's name", "Second partner's name"],
    heroEyebrow: "We're celebrating our anniversary",
    dateLabel: "When's the celebration?",
    seatingLabel: "Seating",
    titleTemplate: (names) => `${names[0]} & ${names[1]}`,
  },
  engagement: {
    id: "engagement",
    label: "Engagement",
    icon: "Gem",
    namesMode: "couple",
    namePrompts: ["First partner's name", "Second partner's name"],
    heroEyebrow: "We're engaged",
    dateLabel: "When's the party?",
    seatingLabel: "Seating",
    titleTemplate: (names) => `${names[0]} & ${names[1]}`,
  },
  birthday: {
    id: "birthday",
    label: "Birthday",
    icon: "Cake",
    namesMode: "single",
    namePrompts: ["Who's celebrating?"],
    heroEyebrow: "It's a birthday celebration",
    dateLabel: "When's the party?",
    seatingLabel: "Seating",
    titleTemplate: (names) => `${possessive(names[0])} Birthday`,
  },
  baby_shower: {
    id: "baby_shower",
    label: "Baby Shower",
    icon: "Baby",
    namesMode: "single",
    namePrompts: ["Who's the shower for?"],
    heroEyebrow: "It's a baby shower",
    dateLabel: "When's the shower?",
    seatingLabel: "Seating",
    titleTemplate: (names) => `${possessive(names[0])} Baby Shower`,
  },
  kids_party: {
    id: "kids_party",
    label: "Kids' Party",
    icon: "PartyPopper",
    namesMode: "single",
    namePrompts: ["Who's celebrating?"],
    heroEyebrow: "It's a party",
    dateLabel: "When's the party?",
    seatingLabel: "Seating",
    titleTemplate: (names) => `${possessive(names[0])} Party`,
  },
  quinceanera: {
    id: "quinceanera",
    label: "Quinceañera",
    icon: "Crown",
    namesMode: "single",
    namePrompts: ["Who's celebrating?"],
    heroEyebrow: "It's her Quinceañera",
    dateLabel: "When's the celebration?",
    seatingLabel: "Seating",
    titleTemplate: (names) => `${possessive(names[0])} Quinceañera`,
  },
  graduation: {
    id: "graduation",
    label: "Graduation",
    icon: "GraduationCap",
    namesMode: "single",
    namePrompts: ["Who's graduating?"],
    heroEyebrow: "It's a graduation celebration",
    dateLabel: "When's the celebration?",
    seatingLabel: "Seating",
    titleTemplate: (names) => `${possessive(names[0])} Graduation`,
  },
  corporate: {
    id: "corporate",
    label: "Corporate Event",
    icon: "Building2",
    namesMode: "title",
    namePrompts: ["What's the event called?"],
    heroEyebrow: "You're invited",
    dateLabel: "When's the event?",
    seatingLabel: "Seating",
    titleTemplate: (names) => names[0],
  },
  holiday: {
    id: "holiday",
    label: "Holiday Party",
    icon: "PartyPopper",
    namesMode: "title",
    namePrompts: ["What's the event called?"],
    heroEyebrow: "It's a holiday celebration",
    dateLabel: "When's the event?",
    seatingLabel: "Seating",
    titleTemplate: (names) => names[0],
  },
  retirement: {
    id: "retirement",
    label: "Retirement",
    icon: "Award",
    namesMode: "single",
    namePrompts: ["Who's retiring?"],
    heroEyebrow: "It's a retirement celebration",
    dateLabel: "When's the celebration?",
    seatingLabel: "Seating",
    titleTemplate: (names) => `${possessive(names[0])} Retirement`,
  },
  other: {
    id: "other",
    label: "Other",
    icon: "CalendarHeart",
    namesMode: "title",
    namePrompts: ["What's the event called?"],
    heroEyebrow: "You're invited",
    dateLabel: "When's the event?",
    seatingLabel: "Seating",
    titleTemplate: (names) => names[0],
  },
};

export const EVENT_TYPE_LIST = Object.values(EVENT_TYPES);

export const DEFAULT_EVENT_TYPE_ID = "wedding";

export function getEventType(id: string): EventTypeDef {
  return EVENT_TYPES[id] ?? EVENT_TYPES[DEFAULT_EVENT_TYPE_ID];
}
