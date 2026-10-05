/** Source of truth for every guest-facing translation KEY (not just English
 * copy) -- every other locale file is typed against this shape (`Dictionary`
 * below), so a missing key in another locale is a compile error, not a
 * silent English leak discovered live. Only guest-facing site chrome lives
 * here (RSVP form, share menu, etc.) -- never the dashboard/onboarding UI
 * (host-facing, out of scope for this pass) and never a host's own typed
 * content (names, custom messages -- that's their words, never translated).
 *
 * An explicit interface (not `typeof en` off an `as const` object) on
 * purpose -- `as const` would infer each string as its own literal type
 * (e.g. `"Menu"`), which makes every other locale's translated string a
 * type error instead of the plain `string` every translation actually is. */
import type { EventTypeId } from "@/lib/eventTypes";

export interface Dictionary {
  siteHeader: {
    menu: string;
    share: string;
    addToCalendar: string;
    copyLink: string;
    linkCopied: string;
    playMusic: string;
    pauseMusic: string;
    shareText: (eventTitle?: string) => string;
  };
  /** Shown only to the event's own owner, previewing their own unpublished
   * draft by direct URL -- RLS (see supabase/migrations/
   * 20260811120000_owner_events_policies.sql) means no anonymous guest can
   * ever reach this page while unpublished at all (a real guest gets a plain
   * 404 instead), so this isn't guest-facing copy. It exists because a host
   * testing their own RSVP form before publishing got no warning that the
   * submission wouldn't be saved until the error appeared after clicking
   * submit -- confirmed live via dashboard-audit critique 2026-10-04. */
  unpublishedPreview: {
    message: string;
  };
  envelopeReveal: {
    tapToOpen: string;
    invitationFor: (guestName: string) => string;
    openInvitation: (coupleLabel?: string) => string;
  };
  rsvp: {
    yourName: string;
    willYouJoin: string;
    accepts: string;
    declines: string;
    numberOfGuests: string;
    upToGuestsTotal: (count: number) => string;
    whoElseIsComing: string;
    optional: string;
    guestNamePlaceholder: (index: number) => string;
    allergiesOrDietary: string;
    message: string;
    selectPlaceholder: string;
    sendRsvp: string;
    sending: string;
    missingFieldsError: string;
    genericError: string;
    successAttending: string;
    successDeclining: string;
    /** Server-side (submitRsvp) failure messages -- distinct from the
     * client-side missingFieldsError/genericError above, which only ever
     * guard against an empty form before it's even sent. */
    notPublishedError: string;
    submitFailedError: string;
  };
  languageSwitcher: {
    label: string;
  };
  countdown: {
    weeks: string;
    days: string;
    hours: string;
    minutes: string;
    seconds: string;
    /** Abbreviated forms for MinimalInline's compact inline layout ("12 hrs
     * · 34 min · 56 sec") -- distinct from the full words above, which
     * SimpleDigits/CircularRings use in their own more spacious layouts. */
    daysAbbr: string;
    hoursAbbr: string;
    minutesAbbr: string;
    secondsAbbr: string;
    reachedToday: string;
    reachedPast: string;
  };
  gift: {
    /** SimpleList/MinimalRows' "View" link on a gift item with a URL --
     * CompactBadges has no chrome of its own, nothing to translate there. */
    viewLink: string;
  };
  guestbook: {
    empty: string;
  };
  video: {
    /** iframe `title` attribute fallback (accessibility only, not visible
     * text) when the host hasn't set a section title. */
    iframeTitleFallback: string;
  };
  letter: {
    /** `date` is already formatted via LOCALE_TO_BCP47 before reaching here
     * -- this only supplies the surrounding sentence, which needs its own
     * word order per language (not every language puts the date at the end
     * the way English does). */
    confirmBy: (date: string) => string;
  };
  map: {
    /** iframe `title` attribute (accessibility only, not visible text) for
     * each embedded venue map, across all 3 variants. */
    mapTitle: (venueName: string) => string;
  };
  banquetNavigator: {
    yourName: string;
    findMyTable: string;
    looking: string;
    missingNameError: string;
    lookupFailedError: string;
    seatedAt: (tableName: string) => string;
    resultSeatedAt: (guestName: string, tableName: string) => string;
    resultNotFound: (guestName: string) => string;
    /** Recognized on the guest list (or already identified via a personal
     * invite link) but no table assigned yet -- the host just hasn't
     * finished seating. Distinct from resultNotFound so this never reads as
     * an error about a real, invited guest. */
    resultNotSeatedYet: (guestName: string) => string;
    /** Recognized on the guest list, but their own RSVP says they're not
     * attending -- asking about a table for someone not coming would read
     * as either a mistake or pressure to reconsider. */
    resultNotAttending: (guestName: string) => string;
  };
  landing: {
    topBar: string;
    nav: { constructor: string; themes: string; whatsIncluded: string; pricing: string; login: string };
    mobileNav: { openMenu: string; closeMenu: string };
    cta: { primary: string; primaryLoggedIn: string; constructor: string; constructorLoggedIn: string; final: string };
    hero: {
      eyebrow: string;
      headline: string;
      accent: string;
      subtext: string;
      checklistFree: string;
      checklistThemes: (themeCount: number) => string;
      checklistFonts: (fontCount: number) => string;
      checklistRsvp: string;
      checklistPaper: string;
      seeConstructor: string;
    };
    heroPhoneShowcase: { topCaption: string; bottomCaption: string };
    statBar: { themes: string; fonts: string; modules: string; oneLink: string };
    platformFan: { heading: string; subtext: string };
    eventTypes: {
      eyebrow: string;
      heading: string;
      subtext: string;
      cta: string;
      items: { label: string; blurb: string }[];
    };
    constructorSection: {
      eyebrow: string;
      heading: string;
      subtext: (fontCount: number) => string;
      features: { title: string; description: string }[];
    };
    howItWorksSection: {
      heading: string;
      subtext: string;
      steps: { title: string; bullets: string[] }[];
    };
    guestTracking: { eyebrow: string; heading: string; subtext: string };
    siteOrPaper: {
      heading: string;
      subtext: string;
      orBadge: string;
      website: { title: string; subtext: string; bullets: string[] };
      paper: { title: string; subtext: string; bullets: string[] };
    };
    themesSection: { heading: string; subtext: string };
    whatsIncluded: {
      heading: string;
      subtext: string;
      modules: { title: string; description: string }[];
    };
    pricing: {
      heading: string;
      subtext: string;
      free: string;
      whatYouGet: string;
      whatThisAdds: string;
      badgeFree: string;
      badgePremium: string;
    };
    finalCta: { heading: string; subtext: string };
    footer: {
      tagline: string;
      product: string;
      legalAccount: string;
      login: string;
      signUp: string;
      terms: string;
      privacy: string;
      rightsReserved: string;
      paymentAccepted: string;
    };
  };
  onboarding: {
    stepOf: (current: number, total: number) => string;
    back: string;
    next: string;
    createSite: string;
    saving: string;
    saveFailed: string;
    previewBadge: string;
    eventTypeStep: { heading: string; subtext: string };
    styleStep: { heading: string; subtext: string };
    photo: {
      label: string;
      help: string;
      dropHint: string;
      busyHint: string;
      changeLabel: string;
      removeLabel: string;
      errorFallback: string;
    };
    validation: { pickEventType: string; pickStyle: string; enterName: string; enterDate: string };
    howItWorks: {
      toggleLabel: string;
      show: string;
      hide: string;
      steps: { title: string; text: string }[];
    };
  };
  /** lib/eventTypes.ts stays the source of truth for ids/icon/namesMode/
   * seatingLabel/titleTemplate -- only the four fields a guest or host
   * actually reads move here, resolved via lib/eventTypesLocalized.ts's
   * getLocalizedEventType/getLocalizedEventTypeList rather than read off
   * EVENT_TYPES directly. Record<EventTypeId, ...> makes a missing event
   * type in any locale a compile error, same guarantee as every other key
   * in this file. */
  eventTypes: Record<EventTypeId, { label: string; namePrompts: string[]; dateLabel: string; heroEyebrow: string }>;
}

export const en: Dictionary = {
  siteHeader: {
    menu: "Menu",
    share: "Share",
    addToCalendar: "Add to calendar",
    copyLink: "Copy link",
    linkCopied: "Link copied!",
    playMusic: "Play music",
    pauseMusic: "Pause music",
    shareText: (eventTitle) => (eventTitle ? `You're invited: ${eventTitle}` : "You're invited!"),
  },
  unpublishedPreview: {
    message: "👀 You're previewing this site — it isn't published yet, so RSVPs submitted here are just a test and won't be saved.",
  },
  envelopeReveal: {
    tapToOpen: "Tap to open",
    invitationFor: (guestName) => `An invitation for ${guestName}`,
    openInvitation: (coupleLabel) => `Open your invitation${coupleLabel ? ` from ${coupleLabel}` : ""}`,
  },
  rsvp: {
    yourName: "Your name",
    willYouJoin: "Will you be joining us?",
    accepts: "Joyfully accepts",
    declines: "Regretfully declines",
    numberOfGuests: "Number of guests (including you)",
    upToGuestsTotal: (count) => `Up to ${count} ${count === 1 ? "guest" : "guests"} total, including you.`,
    whoElseIsComing: "Who else is coming?",
    optional: "(optional)",
    guestNamePlaceholder: (index) => `Guest ${index} name`,
    allergiesOrDietary: "Allergies or dietary needs",
    message: "Message",
    selectPlaceholder: "Select...",
    sendRsvp: "Send RSVP",
    sending: "Sending...",
    missingFieldsError: "Please fill in your name and let us know if you can make it.",
    genericError: "Something went wrong",
    successAttending: "You're on the list! We can't wait to celebrate with you. \u{1F389}",
    successDeclining: "Thanks for letting us know — you'll be missed!",
    notPublishedError: "This site isn't published yet, so RSVPs can't be submitted. Ask your host to publish it.",
    submitFailedError: "We couldn't submit your RSVP. Please try again in a moment.",
  },
  languageSwitcher: {
    label: "Language",
  },
  countdown: {
    weeks: "Weeks",
    days: "Days",
    hours: "Hours",
    minutes: "Minutes",
    seconds: "Seconds",
    daysAbbr: "days",
    hoursAbbr: "hrs",
    minutesAbbr: "min",
    secondsAbbr: "sec",
    reachedToday: "Today's the day!",
    reachedPast: "Thank you for celebrating with us!",
  },
  gift: {
    viewLink: "View",
  },
  guestbook: {
    empty: "Guests' RSVP comments will appear here.",
  },
  video: {
    iframeTitleFallback: "Video",
  },
  letter: {
    confirmBy: (date) => `Please confirm by ${date}`,
  },
  map: {
    mapTitle: (venueName) => `Map: ${venueName}`,
  },
  banquetNavigator: {
    yourName: "Your name",
    findMyTable: "Find my table",
    looking: "Looking...",
    missingNameError: "Enter the name your invitation was sent to.",
    lookupFailedError: "Something went wrong. Please try again in a moment.",
    seatedAt: (tableName) => `You're seated at ${tableName}`,
    resultSeatedAt: (guestName, tableName) => `${guestName} is seated at ${tableName}`,
    resultNotFound: (guestName) =>
      `We couldn't find "${guestName}" on the guest list — double-check the spelling, or ask the host.`,
    resultNotSeatedYet: (guestName) => `Hi ${guestName} — you're on the list! Seating is still being finalized, check back soon.`,
    resultNotAttending: (guestName) =>
      `Looks like ${guestName} is marked as not attending — reach out to the host if that's not right.`,
  },
  landing: {
    topBar: "Visa / Mastercard / PayPal accepted · Instant delivery — send your invite link anywhere in the world",
    nav: { constructor: "Constructor", themes: "Themes", whatsIncluded: "What's included", pricing: "Pricing", login: "Login" },
    mobileNav: { openMenu: "Open menu", closeMenu: "Close menu" },
    cta: {
      primary: "Create your invitations",
      primaryLoggedIn: "Go to dashboard",
      constructor: "Start building",
      constructorLoggedIn: "Go to dashboard",
      final: "Create your website",
    },
    hero: {
      eyebrow: "An event platform, not just an invitation",
      headline: "Your event, styled exactly how you imagined it",
      accent: "with a wow effect",
      subtext:
        "A beautiful event website, matching paper invitations, and guest seating — one style, everywhere your guests see it. Start from a designer theme, or drag your own together from a blank canvas.",
      checklistFree: "Free to design — pay only if you want this exact link live",
      checklistThemes: (themeCount) => `${themeCount} designer themes — or build your own from a blank canvas`,
      checklistFonts: (fontCount) => `Drag anything, ${fontCount}+ fonts, any color you like`,
      checklistRsvp: "RSVP tracking with your own custom questions",
      checklistPaper: "Personalized paper invitations with QR codes",
      seeConstructor: "See the constructor →",
    },
    heroPhoneShowcase: {
      topCaption: "Brides of 2027, you're going to love this \u{1F97A}\u{1F48D}",
      bottomCaption: "The invitations your friends will screenshot",
    },
    statBar: { themes: "designer themes", fonts: "fonts in the constructor", modules: "site modules", oneLink: "link for everything" },
    platformFan: {
      heading: "A wedding platform, not just an invitation",
      subtext: "From your invitation website and guest messaging to a fully styled banquet — seating cards included.",
    },
    eventTypes: {
      eyebrow: "Not just weddings",
      heading: "Every celebration gets its own site",
      subtext:
        "Pick your event type first, and everything after — the wording, the fields, even what the seating tool is called — is built around it.",
      cta: "Pick your event type",
      items: [
        { label: "Wedding", blurb: "The one this whole platform is built around." },
        { label: "Birthday", blurb: "A countdown, photos, and a gift list that isn't awkward." },
        { label: "Corporate event", blurb: "Share the agenda, get a real headcount for catering." },
        { label: "Graduation", blurb: "Ceremony details and the reception, one link." },
        { label: "Anniversary", blurb: "However many years in, still worth a proper site." },
        { label: "Baby shower", blurb: "Registry links and a guestbook full of wishes." },
        { label: "Quinceañera", blurb: "Court, dress code, and the dance schedule." },
        { label: "Retirement", blurb: "Toast a career, not just hand over a cake." },
        { label: "Kids' party", blurb: "Playful themes, RSVPs parents actually fill out." },
        { label: "Holiday party", blurb: "Office party details, dress code included." },
        { label: "Engagement", blurb: "Share the news, save the wedding site for later." },
        { label: "Anything else", blurb: "Whatever it is, it starts the same way: pick a theme." },
      ],
    },
    constructorSection: {
      eyebrow: "Designer themes",
      heading: "Every theme is complete, out of the box",
      subtext: (fontCount) =>
        `Pick a designer theme and it's already done — matching fonts, colors, and layout, ready to publish. Still want to change something? Any text, any color, any photo is yours to edit, from ${fontCount}+ fonts to your own palette. The exact design you choose carries over to your printed invitations too.`,
      features: [
        { title: "Curated fonts", description: "Script, serif, bold, or thin — swap the whole look with one click." },
        { title: "Any color you like", description: "Build your own palette to match your exact wedding colors." },
        { title: "Designer-curated variations", description: "Or start from color and pattern combinations, hand-picked by our designers." },
        { title: "Flexible text, anywhere", description: "Edit, resize, add, and move any text on your chosen design." },
        { title: "Paper add-ons & banquet cards", description: "Design the front and back of your invitation, plus matching banquet cards." },
        { title: "Toggle site modules on and off", description: "Turn the countdown, schedule, RSVP, map, and more on or off, per site." },
      ],
    },
    howItWorksSection: {
      heading: "How the constructor works",
      subtext: "Everything below happens live, right in your browser — no downloads, nothing to learn.",
      steps: [
        {
          title: "Choose your style",
          bullets: [
            "Pick from 100 designer themes, or start from a blank canvas",
            "Every theme comes fully color-coordinated, ready to use",
            "Switch styles any time — your content carries over",
          ],
        },
        {
          title: "Enter your event details",
          bullets: [
            "Names, date, venue — fill it in once",
            "It carries through your site, invitations, and banquet cards",
            "Edit any of it any time before or after you publish",
          ],
        },
        {
          title: "Turn on the modules you need",
          bullets: [
            "Countdown, RSVP, gift wishes, dress code, and more",
            "Each one has its own on/off switch",
            "Only show guests what's relevant to your event",
          ],
        },
        {
          title: "Get your link and PDF papers",
          bullets: [
            "One link, live instantly — share it however guests actually check messages",
            "Print-ready PDF invitations, envelopes, and banquet cards",
            "Update anything later — everyone sees the latest version",
          ],
        },
      ],
    },
    guestTracking: {
      eyebrow: "Beyond the invitation",
      heading: "Send it anywhere, track every reply",
      subtext:
        "Share your one link over WhatsApp, SMS, email, or however your guests actually check messages. Every RSVP flows straight back into your guest list — who's coming, who hasn't answered yet, and who you still need to invite. They don't need an account or an app to respond — just the link.",
    },
    siteOrPaper: {
      heading: "A website invitation, and/or paper",
      subtext: "Not an either-or — most couples use both.",
      orBadge: "AND/OR",
      website: {
        title: "Website invitation",
        subtext: "Simple and fast — invite every guest, wherever they live.",
        bullets: [
          "One link works on any phone, tablet, or laptop",
          "Update anything — everyone sees the latest version instantly",
        ],
      },
      paper: {
        title: "Paper invitations",
        subtext: "A keepsake for your closest family and friends.",
        bullets: [
          "Print-ready PDF invitations, envelopes, and program cards",
          "Each guest gets a personal QR code — their RSVP auto-matches",
        ],
      },
    },
    themesSection: {
      heading: "Choose your style",
      subtext:
        "The same theme carries through your site, paper invitations, and banquet cards — or skip it entirely and design from scratch in the constructor.",
    },
    whatsIncluded: {
      heading: "What's included",
      subtext: "Every site comes with these building blocks — mix and match to tell your story.",
      modules: [
        { title: "Drag-and-drop constructor", description: "Move any text or photo, pick any font or color, and undo/redo as you go." },
        { title: "Hero intro", description: "Your names, event date, and photo — several layouts to choose from." },
        { title: "Letter to your guests", description: "A personal note, gift wishes, and RSVP deadline in one card." },
        { title: "Event schedule", description: "Lay out the day, minute by minute — from the first toast to the last dance." },
        { title: "Venue & map", description: "Show guests exactly where to go, with an interactive map." },
        { title: "RSVP with custom questions", description: "Ask about meals, drinks, or transport — guests confirm online, straight to your list." },
        { title: "Countdown timer", description: "Build anticipation with a live countdown to the big day." },
        { title: "Guestbook wall", description: "Well-wishes guests leave at RSVP, shown as a public wall on your site." },
        { title: "Video", description: "Embed a YouTube or Vimeo video — your proposal, your story, your choice." },
        { title: "Paper invitations", description: "Print-ready PDF invites, envelopes, and program cards, personalized per guest with a QR code." },
        { title: "Banquet seating", description: "Assign tables — by name, not just headcount — and generate table & place cards to print." },
        { title: "Custom domain", description: "Point your own domain at your site, or keep the readable link we give you free." },
      ],
    },
    pricing: {
      heading: "The constructor is always free",
      subtext: "Design your site, invite guests, and track RSVPs at no cost. Pay only when you want a custom domain, paper invitations, or banquet seating.",
      free: "Free",
      whatYouGet: "What you get",
      whatThisAdds: "What this adds",
      badgeFree: "Always free",
      badgePremium: "Removes the watermark",
    },
    finalCta: {
      heading: "Free to start",
      subtext: "No credit card required. Create your site and publish it whenever you're ready.",
    },
    footer: {
      tagline: "Event websites, live in minutes.",
      product: "Product",
      legalAccount: "Legal & account",
      login: "Login",
      signUp: "Sign up",
      terms: "Terms of service",
      privacy: "Privacy policy",
      rightsReserved: "© 2026 Invimbo. All rights reserved.",
      paymentAccepted: "Visa / Mastercard / PayPal accepted",
    },
  },
  onboarding: {
    stepOf: (current, total) => `Step ${current} of ${total}`,
    back: "Back",
    next: "Next",
    createSite: "Create my site",
    saving: "Saving...",
    saveFailed: "Failed to save",
    previewBadge: "Preview",
    eventTypeStep: { heading: "\u{1F389} What are you celebrating?", subtext: "This shapes the questions we ask next." },
    styleStep: { heading: "\u{1F3A8} Pick your style", subtext: "You can always change this or design your own later." },
    photo: {
      label: "\u{1F4F7} Add a photo (optional)",
      help: "Shows up on your site's photo layouts — you can always add or change it later.",
      dropHint: "Drag a photo here, or click to browse",
      busyHint: "Adding your photo...",
      changeLabel: "Change photo",
      removeLabel: "Remove",
      errorFallback: "Couldn't add that photo",
    },
    validation: {
      pickEventType: "Pick an event type",
      pickStyle: "Pick a style",
      enterName: "Enter a name",
      enterDate: "Enter a date",
    },
    howItWorks: {
      toggleLabel: "\u{2728} New here? Here's how it works",
      show: "Show",
      hide: "Hide",
      steps: [
        { title: "Pick a style", text: "Browse styles until one feels right — swap it any time." },
        { title: "Add your details", text: "Names, date, a photo if you want one. That's it." },
        { title: "Share your site", text: "Get a live link guests can open on their phone." },
      ],
    },
  },
  eventTypes: {
    wedding: {
      label: "Wedding",
      namePrompts: ["First partner's name", "Second partner's name"],
      dateLabel: "When's the big day?",
      heroEyebrow: "We're getting married",
    },
    anniversary: {
      label: "Anniversary",
      namePrompts: ["First partner's name", "Second partner's name"],
      dateLabel: "When's the celebration?",
      heroEyebrow: "We're celebrating our anniversary",
    },
    engagement: {
      label: "Engagement",
      namePrompts: ["First partner's name", "Second partner's name"],
      dateLabel: "When's the party?",
      heroEyebrow: "We're engaged",
    },
    birthday: {
      label: "Birthday",
      namePrompts: ["Who's celebrating?"],
      dateLabel: "When's the party?",
      heroEyebrow: "It's a birthday celebration",
    },
    baby_shower: {
      label: "Baby Shower",
      namePrompts: ["Who's the shower for?"],
      dateLabel: "When's the shower?",
      heroEyebrow: "It's a baby shower",
    },
    kids_party: {
      label: "Kids' Party",
      namePrompts: ["Who's celebrating?"],
      dateLabel: "When's the party?",
      heroEyebrow: "It's a party",
    },
    quinceanera: {
      label: "Quinceañera",
      namePrompts: ["Who's celebrating?"],
      dateLabel: "When's the celebration?",
      heroEyebrow: "It's her Quinceañera",
    },
    graduation: {
      label: "Graduation",
      namePrompts: ["Who's graduating?"],
      dateLabel: "When's the celebration?",
      heroEyebrow: "It's a graduation celebration",
    },
    corporate: {
      label: "Corporate Event",
      namePrompts: ["What's the event called?"],
      dateLabel: "When's the event?",
      heroEyebrow: "You're invited",
    },
    holiday: {
      label: "Holiday Party",
      namePrompts: ["What's the event called?"],
      dateLabel: "When's the event?",
      heroEyebrow: "It's a holiday celebration",
    },
    retirement: {
      label: "Retirement",
      namePrompts: ["Who's retiring?"],
      dateLabel: "When's the celebration?",
      heroEyebrow: "It's a retirement celebration",
    },
    other: {
      label: "Other",
      namePrompts: ["What's the event called?"],
      dateLabel: "When's the event?",
      heroEyebrow: "You're invited",
    },
  },
};
