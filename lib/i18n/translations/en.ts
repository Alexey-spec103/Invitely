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
    /** Accessibility audit (2026-10-22): the only way past the header's own
     * controls (menu/language/music/share/calendar) to reach the actual
     * page content was tabbing through every one of them -- no skip link
     * existed anywhere on the guest site (WCAG 2.4.1). Visually hidden
     * until focused (sr-only / focus:not-sr-only), same pattern as every
     * other visually-hidden label added in this session's accessibility
     * pass. Targets the <main id="main-content"> landmark added the same
     * session. */
    skipToContent: string;
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
   * submit -- confirmed live via dashboard-audit critique 2026-10-04.
   * impeccable critique (2026-10-22): the original wording here ("just a
   * test and won't be saved") implied the submission would go through
   * silently -- it doesn't. submit_rsvp_response hard-rejects with
   * EVENT_NOT_PUBLISHED (see app/e/[slug]/actions.ts's notPublishedError
   * handling), so a host testing their own form got the honest warning here
   * followed immediately by an error that contradicted it. Reworded to
   * match the real, confirmed-live behavior. */
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
    /** Shown alongside the "Sending..." button once a submission has been
     * pending unusually long (SimpleForm.tsx's own timeout, not a server
     * response) -- reassures a guest staring at a stuck-looking spinner that
     * the attempt is still in flight, not silently broken. */
    takingLonger: string;
    /** impeccable critique (2026-10-22): missingFieldsError names both
     * conditions ("your name AND let us know if you can make it") even
     * when only one is actually empty -- the component already knows
     * which (see the focus/scroll branch right next to where this is
     * set), so these two let the copy match instead of always reading
     * the combined message. missingFieldsError stays as the true-both-
     * empty case. */
    missingNameError: string;
    missingAttendanceError: string;
    missingFieldsError: string;
    genericError: string;
    successAttending: string;
    successDeclining: string;
    /** Server-side (submitRsvp) failure messages -- distinct from the
     * client-side missingFieldsError/genericError above, which only ever
     * guard against an empty form before it's even sent. */
    notPublishedError: string;
    submitFailedError: string;
    /** One-tap path, shown only to a guest already identified via their own
     * personal invite link -- see SimpleForm.tsx's own comment. */
    oneTapGreeting: (name: string) => string;
    oneTapAccept: string;
    oneTapDecline: string;
    oneTapMoreDetails: string;
    /** Shown instead of a blank form when a guest who already RSVP'd comes
     * back to the same link -- a personalized guest via a fresh server-side
     * lookup (always accurate, any device), a self-service guest via a
     * localStorage recall (best-effort, same browser only). See
     * SimpleForm.tsx's own comment on why self-service can't be looked up
     * server-side before the guest has typed their name. */
    alreadyRespondedAttending: (partySize: number) => string;
    alreadyRespondedDeclining: string;
    editResponseButton: string;
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
  travel: {
    /** Travel section card's external booking link, and the label in front
     * of a host-entered promo code -- the only two fixed chrome strings on
     * an otherwise free-text card (name/description/price are host-typed). */
    bookingLink: string;
    promoCodeLabel: string;
  };
  guestbook: {
    empty: string;
  };
  /** Direct feedback (2026-10-14): the section's own `title` is fully
   * host-editable text (seeded to "Dress Code" but freely rewritable) -- a
   * guest had no fixed, guaranteed label telling them what this section
   * actually was once a host customized it. Rendered as a small eyebrow
   * alongside the editable title in every DressCodeSection variant. */
  dressCode: {
    eyebrow: string;
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
    /** Shown instead of the iframe when a venue has no address yet (an
     * empty/placeholder query to Google's embed API resolves to a globe-wide
     * zoomed-out view, not a 404 -- see mapEmbedSrc's own comment). */
    mapPlaceholder: string;
    /** UX audit (2026-10-26): a host who enables Location before adding any
     * venue previously shipped guests a completely empty section -- no map,
     * no address, no message, visually indistinguishable from a bug. Shown
     * only in guest (non-editable) view when the venues list is empty; the
     * editable dashboard view already has its own "add a venue" affordance
     * so doesn't need this. */
    noVenuesYet: string;
  };
  /** The guest-facing shared photo album at /e/[slug]/photos -- no login, a
   * guest scans the host's QR code and adds their own event photos. */
  guestPhotos: {
    heading: string;
    subtitle: (eventTitle: string) => string;
    addPhotosButton: string;
    uploading: string;
    uploaded: string;
    genericError: string;
    notPublished: string;
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
    skipToContent: string;
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
    themesSection: {
      heading: string;
      subtext: string;
      /** UX audit (2026-10-26): was a hardcoded "100+" on the showcase's
       * final tile overlay, stale against the real, dynamic theme count
       * (124 and growing) shown correctly two screens earlier in the hero
       * checklist/stat bar -- a visitor who notices both numbers reads it
       * as sloppy. `count` is the REMAINING theme count not already shown
       * in the showcase (total minus the showcase tiles), not the total
       * itself. */
      seeMoreStyles: (count: number) => string;
    };
    whatsIncluded: {
      heading: string;
      subtext: string;
      // UX audit (2026-10-26): clarity critique flagged this as a flat
      // 14-item grid with no subheadings, over the skill's "≤4 items per
      // group" chunking guideline -- these two group labels split it by
      // what a visitor actually needs to understand ("is this for my
      // guests, or for me as the host"), not an arbitrary bucket. Module
      // order stays fixed and identical across every locale (confirmed) --
      // the two groups are rendered by a fixed index split in
      // HomePageContent.tsx, not by reordering this array.
      guestFacingLabel: string;
      hostToolsLabel: string;
      modules: { title: string; description: string }[];
    };
    pricing: {
      heading: string;
      subtext: string;
      free: string;
      whatYouGet: string;
      whatThisAdds: string;
      badgeFree: string;
      badgeBasic: string;
      badgePremium: string;
      /** Disclosed directly on the Free card -- Free really does publish a
       * live, working site (not a preview-only tier), so the honest fix is
       * naming its one real trade-off up front, not implying it doesn't
       * exist. See PlanSelectForm.tsx's own "what guests will actually see
       * on Free" disclosure for the same honesty bar applied here. */
      freeCaveat: string;
      /** Matches PlanSelectForm.tsx's own exact wording ("one-time, not a
       * subscription") for the same claim made in two places. */
      oneTime: string;
      exampleCaption: string;
      valueAnchor: string;
      /** Launch-readiness pass (2026-10-27): HomePageContent.tsx used to
       * render lib/plans.ts's own `features` strings directly -- plain
       * English, on every locale including the 7 non-English /[locale]
       * URLs this same session added. Same order/length as each plan's
       * `features` array (including the leading "Everything in ..." line,
       * even though the component usually filters it out) so the two stay
       * index-correlated -- the filter itself still runs against the
       * English array to decide WHICH index to drop, since matching
       * `startsWith("Everything in")` against translated text wouldn't
       * work in any other language. */
      planFeatures: {
        free: [string, string, string];
        basic: [string, string, string, string];
        premium: [string, string, string];
      };
    };
    /** The marketing page's own "What's included" grid sells hosts an FAQ
     * module for THEIR guests -- this section is the same idea turned on the
     * marketing page itself, answering the real objections a skeptical
     * visitor has before they'll act. Placed after pricing/trust signals,
     * right before the final CTA, so doubts are resolved right before the
     * ask -- not a generic SaaS FAQ, every answer ties to a claim already
     * made elsewhere on this page or in the product (free-tier watermark,
     * one-time pricing, no-account guest flow, real theme breadth). */
    faq: {
      heading: string;
      items: { question: string; answer: string }[];
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
    /** Form-strategy audit (2026-10-19): completeOnboarding had zero
     * abuse-resistance -- any session (anonymous ones are free to create)
     * could call it in a loop, each call creating a real event row.
     * Distinct from saveFailed (which just says "try again") -- this tells
     * the rare legitimate case (someone retrying onboarding a few times)
     * WHY, so they know to wait rather than hammer retry. */
    rateLimited: string;
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
  /** email-audit (2026-10-10): this product's 6 transactional emails
   * (lib/email.ts's sendEmail() callers) were hardcoded English regardless
   * of the recipient's real language, the one surface this app's otherwise-
   * complete 8-locale coverage never reached. Locale for every email is the
   * sending event's own `default_locale` (guest-facing and host-facing
   * alike) -- there's no per-guest or per-account locale preference stored
   * anywhere in the schema, and `default_locale` is the language the host
   * themselves set the event up in, the same reasoning this app already
   * uses for host-facing UI. Grouped by the 6 real email types that
   * actually get sent, not by raw string key -- `common` holds the two
   * fragments genuinely shared across more than one email (so a
   * translation only needs updating in one place), everything else stays
   * local to its own email so each translator can read one email's copy
   * as a coherent whole instead of a scattered flat list. */
  email: {
    common: {
      greeting: (guestName: string) => string;
      rsvpLinkLabel: string;
    };
    guestInvitation: {
      subject: (eventTitle: string) => string;
      invitedTo: (eventTitle: string) => string;
    };
    guestReminder: {
      subject: (eventTitle: string) => string;
      reminderText: (eventTitle: string) => string;
    };
    guestConfirmation: {
      acceptedSubject: (eventTitle: string) => string;
      declinedSubject: (eventTitle: string) => string;
      acceptedBody: (guestName: string, eventTitle: string) => string;
      declinedBody: (guestName: string, eventTitle: string) => string;
    };
    hostNewRsvp: {
      acceptedSubject: (guestName: string) => string;
      declinedSubject: (guestName: string) => string;
      headline: (guestName: string, eventTitle: string, attending: boolean) => string;
      responseSummary: (total: number, yes: number, no: number) => string;
      partySize: (size: number) => string;
      namesLabel: (names: string) => string;
      allergiesLabel: (text: string) => string;
      messageLabel: (text: string) => string;
    };
    hostDigest: {
      subject: (count: number, eventTitle: string) => string;
      intro: (count: number, eventTitle: string) => string;
      guestYes: (guestName: string) => string;
      guestNo: (guestName: string) => string;
      previousHeading: (count: number) => string;
      runningTotal: (total: number, yes: number, no: number) => string;
      manageNote: (guestsUrl: string) => string;
    };
    domainLive: {
      subject: (hostname: string) => string;
      liveAt: (hostname: string) => string;
      includedNote: string;
      questionsNote: string;
    };
  };
  /** Host-facing dashboard UI (NOT the guest-facing site, which is
   * everything above). First real dashboard namespace, added after a host
   * reported the dashboard showing a random English/[locale] mix: a few
   * strings (via getLocalizedEventType, built for onboarding) happened to
   * translate while ~95% of the dashboard's own chrome stayed hardcoded
   * English -- confirmed "критично" (critical), not cosmetic, from the
   * product owner directly. This is phase 1 of a multi-phase rollout -- only
   * the Site tab and its direct dependencies are covered so far (see
   * `site` below); other tabs (Style/Paper/Guests) get their own
   * `dashboard.*` additions in later phases, same pattern. `common` holds
   * small chrome shared by components reused across tabs (FirstVisitTour,
   * ModuleCard) so a later phase can reuse it instead of re-adding the same
   * four words under a different key. */
  /** Pre-launch i18n pass (2026-10-27): the whole auth flow (login, signup,
   * forgot/reset password -- all 4 pages under app/(auth)/) was 100%
   * hardcoded English, the same gap PlanSelectForm.tsx had before this
   * session's own fix. Each sub-key below matches one page 1:1. Reuses
   * dashboard.shell.anonBanner's existing agreeTerms-prefixed and
   * genericError keys where the exact same concept already has a
   * translated string (the
   * ToS/Privacy checkbox text, and "Failed to create account") rather than
   * duplicating them here. */
  auth: {
    login: {
      heading: string;
      subtitle: string;
      justRegisteredMessage: string;
      emailLabel: string;
      passwordLabel: string;
      forgotPassword: string;
      emailInvalid: string;
      passwordRequired: string;
      submitButton: string;
      submitButtonPending: string;
      noAccount: string;
      signUpLink: string;
    };
    signup: {
      heading: string;
      subtitle: string;
      emailLabel: string;
      passwordLabel: string;
      confirmPasswordLabel: string;
      emailInvalid: string;
      passwordMin: string;
      confirmPasswordRequired: string;
      passwordsDontMatch: string;
      submitButton: string;
      submitButtonPending: string;
      alreadyHaveAccount: string;
      logInLink: string;
    };
    forgotPassword: {
      heading: string;
      subtitle: string;
      sentMessage: string;
      emailLabel: string;
      emailInvalid: string;
      submitButton: string;
      submitButtonPending: string;
      backToLogin: string;
    };
    resetPassword: {
      heading: string;
      linkInvalidMessage: string;
      requestNewLink: string;
      checkingLink: string;
      newPasswordLabel: string;
      confirmNewPasswordLabel: string;
      passwordMin: string;
      confirmPasswordRequired: string;
      passwordsDontMatch: string;
      submitButton: string;
      submitButtonPending: string;
    };
  };
  /** Shown site-wide (marketing + dashboard + guest sites), not nested under
   * `landing`/`dashboard` -- a single consent decision covers every surface,
   * so its copy shouldn't live under just one of them. Gates Microsoft
   * Clarity specifically (session recording + cookies) -- Vercel Analytics
   * stays unconditional since it's genuinely cookieless (Vercel's own docs),
   * so it was never the thing needing consent in the first place. */
  cookieConsent: {
    message: string;
    acceptButton: string;
    declineButton: string;
    privacyLinkText: string;
  };
  dashboard: {
    common: {
      statusOn: string;
      statusNotSet: string;
      statusVerified: string;
      statusPending: string;
      tour: { skip: string; back: string; next: string; gotIt: string };
      /** Reopens a page's FirstVisitTour on demand -- see TourReplayButton.
       * Shared across every tab that pairs a tour with this button, so it
       * only needs translating once instead of per tab. */
      replayTourButton: string;
      /** Shown next to an inline failure banner (add/remove guest, send
       * email, generate PDF, etc.) so a failed action can be re-attempted
       * without re-filling a form or re-finding the original control. */
      retry: string;
      /** Shown instead of `retry` once a Retry click has failed with the
       * same error again -- covers PDF downloads, where the failure is
       * often a dynamic-import chunk load that got cached as rejected and
       * won't resolve differently no matter how many more times `retry`
       * re-invokes the same function; only a fresh page load clears it. */
      reloadPage: string;
      /** Visually hidden until focused -- the dashboard shell's header (logo,
       * event switcher, 4+ action buttons) and left nav sit before any page
       * content in document order on every single dashboard page, so a
       * keyboard user re-tabs through all of it on every navigation without
       * this. */
      skipToContent: string;
      moduleCard: {
        notSetYet: string;
        couldntSave: string;
        close: string;
        edit: string;
        toggleAriaLabel: (title: string, turningOn: boolean) => string;
      };
      backgroundPicker: {
        noFill: string;
        colorAriaLabel: (color: string) => string;
        customColor: string;
        pickCustomColor: string;
        opacity: string;
      };
      upgradeModal: {
        featureSuffix: (planName: string) => string;
        defaultConsequence: string;
        upgradeSentence: (planName: string, priceEur: number, benefit: string) => string;
        defaultBenefit: string;
        upgradeButton: (planName: string) => string;
        continueWithWatermark: string;
        notNow: string;
        close: string;
      };
      upgradeNote: {
        warning: string;
        upgradeLinkText: (priceEur: number) => string;
        removeSuffix: string;
      };
      hubStrip: {
        weddingStyle: string;
        eventStyle: string;
        edit: string;
        weddingDetails: string;
        eventDetails: string;
        fillWeddingDetails: string;
        fillEventDetails: string;
        percentComplete: (percent: number) => string;
        yourPlan: string;
        noPaymentCollected: string;
        changePlan: string;
      };
    };
    site: {
      pageTitle: string;
      freeCanvas: string;
      freeCanvasAria: string;
      // UX audit (2026-10-26): clarity critique -- the boundary between
      // "these 6 cards are site-wide settings" and "everything else is
      // content you edit by clicking it in the live preview" was only ever
      // taught once, via the skippable first-visit coachmark. A host who
      // skips the tour, or just comes back later, had no persistent cue.
      // This small label renders once, right above the settings-card
      // column (page.tsx), not per-card.
      siteSettingsLabel: string;
      checkoutPending: { title: string; body: string };
      weddingDataReminder: { wedding: string; generic: string; cta: (typeLabel: string) => string };
      startScreen: { title: string; body: string; editInPreview: string };
      music: { title: string };
      linkPreview: { title: string };
      customDomain: { title: string; verified: string; pending: string };
      editorPreviewLabel: string;
      openFullPreview: string;
      removeBadge: (priceEur: number) => string;
      tourSteps: { title: string; body: string }[];
      modules: {
        heading: string;
        description: string;
        groups: { core: string; funExtras: string; logistics: string };
        labels: {
          letter: string;
          timeline: string;
          map: string;
          rsvp: string;
          countdown: string;
          gift: string;
          dressCode: string;
          guestbook: string;
          video: string;
          banquetNavigator: string;
          guestNotes: string;
          faq: string;
          travel: string;
        };
        toggleAriaLabel: (label: string, turningOn: boolean) => string;
        basicBadge: string;
        emptyBadge: string;
        emptyBadgeHint: string;
        personalizeBadge: string;
        personalizeBadgeHint: string;
        gatedOnButHidden: string;
        gatedPreviewOnly: string;
        addSeatGuestsLink: string;
        envelopeReveal: { label: string; description: string; toggleAriaLabel: (turningOn: boolean) => string };
        failedToSave: string;
        upgradeModal: { action: (label: string) => string; consequence: string; benefit: string; continueLabel: string };
      };
      weddingData: {
        cardTitle: (typeLabel: string) => string;
        complete: (percent: number) => string;
        helper: string;
        dateLabel: (typeLabel: string) => string;
        venueName: string;
        venueNamePlaceholder: string;
        city: string;
        address: string;
        titleWillBe: (title: string) => string;
        errorEnterName: string;
        errorEnterDate: string;
      };
      eventTypeSwitcher: {
        switchTo: (label: string) => string;
        whatCelebrating: string;
        close: string;
        updateNotice: (label: string) => string;
        namesModeChangeNote: string;
        titleWillBe: (title: string) => string;
        saving: string;
        switchButton: (label: string) => string;
        back: string;
      };
      editor: {
        undo: string;
        redo: string;
        previewDesktop: string;
        previewPhone: string;
        previewTablet: string;
        previewLabel: string;
        previewLanguageAria: string;
        /** impeccable critique (2026-10-23): this used to say "Hero photo"
         * -- the same section the Modules quick-settings card calls "Start
         * screen" (see startScreen.title above) and the Editable Blocks
         * panel's own divider used to hardcode as a literal, untranslated
         * "Hero" (see SiteInlineEditor.tsx's sectionHeaderRow("hero", ...)
         * call, now fixed to read this same key instead) -- three names
         * for one concept, confirmed as a real match-system-to-real-world
         * gap in a first-timer's path ("Edit in preview" from the Start
         * screen card lands on a section labeled something else
         * entirely"). All three now say "Start screen". */
        heroPhotoLabel: string;
        /** Same fix, same reasoning as heroPhotoLabel above -- this is the
         * Editable Blocks panel's section-divider label for Hero, which
         * used to hardcode a literal, untranslated "Hero" directly in
         * SiteInlineEditor.tsx instead of reading any dictionary key at
         * all. A plain duplicate of startScreen.title's English wording
         * (not a cross-namespace reference -- that string lives under
         * dashboard.site directly, this one under dashboard.site.editor)
         * so every locale says the same thing here as the Modules card. */
        startScreenSectionLabel: string;
        photoLabel: string;
        noPhotoInLayout: string;
        sectionLabels: {
          letter: string;
          timeline: string;
          map: string;
          rsvp: string;
          countdown: string;
          gift: string;
          dressCode: string;
          guestbook: string;
          video: string;
          banquetNavigator: string;
          guestNotes: string;
          faq: string;
          travel: string;
        };
        jumpToSectionAria: string;
        collapsedNote: (label: string) => string;
        editableBlocks: {
          heading: string;
          hide: string;
          show: string;
          description: string;
          showBlock: string;
          hideBlock: string;
          deleteLabel: string;
          /** dashboard critique (2026-10-23), P1: a confirm gate for the
           * trash icon here and the floating toolbar's own matching one --
           * both used to delete a Timeline event / Map venue / RSVP
           * question / DressCode color / FAQ item / Travel place instantly,
           * with no confirmation and no way to undo it. */
          deleteConfirm: (label: string) => string;
        };
        rsvpPreviewOnly: string;
        lookupPreviewOnly: string;
      };
      sendingGuide: {
        title: string;
        copied: string;
        copy: string;
        open: string;
        helperWithEmail: string;
        helperWithoutEmail: string;
        qrTitle: string;
        qrCaption: string;
        download: string;
        downloadPapers: string;
      };
      featureCarousel: {
        dismiss: string;
        items: { title: string; body: string }[];
        newBadge: string;
      };
    };
    style: {
      header: { title: string; subtitle: string; helper: string; previewFullSet: string };
      howItWorks: {
        button: string;
        heading: string;
        step1: string;
        step2: string;
        step3: string;
        gotIt: string;
      };
      colorVariant: {
        label: string;
        useOwnColors: (themeName: string) => string;
        useColors: (optionName: string) => string;
      };
      designSlots: {
        active: string;
        addSlot: string;
        historyLabel: string;
        recentStyles: string;
        noPastStyles: string;
        removeSlot: (themeName: string) => string;
        justNow: string;
        minutesAgo: (minutes: number) => string;
        hoursAgo: (hours: number) => string;
        daysAgo: (days: number) => string;
        failedToAdd: string;
        failedToRemove: string;
        addModalEyebrow: string;
        addModalHint: string;
        close: string;
      };
      materialsPreview: {
        eyebrow: string;
        close: string;
        invitations: string;
        banquet: string;
        website: string;
        paperInvitation: string;
        togetherWithFamilies: string;
        yourEventDate: string;
        tableLabel: string;
        tableNumberCaption: string;
        guestName: string;
        tableWithNumber: (tableNumber: number) => string;
        placeCard: string;
        footerNote: string;
      };
      gallery: {
        searchPlaceholder: string;
        popular: string;
        new: string;
        favorites: string;
        seasonYear: (seasonLabel: string, year: number) => string;
        orPickSpecific: string;
        allStyles: string;
        season: string;
        allYear: string;
        favoriteTitle: string;
        favoriteSubtext: string;
        resultsCount: (count: number) => string;
        hoverHint: string;
        noMatch: string;
        showMore: (remaining: number) => string;
        /** dashboard critique (2026-10-23), P2: the sidebar's "OR PICK A
         * SPECIFIC STYLE" category list collapses to the top 4 by count --
         * this is its "collapse back down" toggle. showMore above (already
         * generic -- "Show more styles (N more)") doubles as its "show more"
         * counterpart, so only the reverse direction needed a new key. */
        showFewerStyles: string;
        categories: Record<
          "romantic" | "modern" | "botanical" | "boho" | "luxury" | "dark" | "coastal" | "rustic" | "vintage" | "minimal" | "marble" | "cosmic" | "peony" | "provence",
          string
        >;
        seasons: { spring: string; summer: string; autumn: string; winter: string };
      };
      card: {
        scanToPreview: string;
        removeFavorite: string;
        addFavorite: string;
        chooseStyle: string;
        customize: string;
        builtForPhoto: string;
        builtForPhotoTitle: string;
        addToCalendar: string;
        letterTitle: string;
        letterBody: string;
        scheduleTitle: string;
        timelineCeremony: string;
        timelineCocktail: string;
        timelineReception: string;
        domainCaption: string;
        customizeFurther: string;
        countdown: { weeks: string; days: string; hours: string; minutes: string; seconds: string };
      };
      /** dashboard critique (2026-10-23), P2: picking a theme from the main
       * gallery used to commit instantly with zero confirmation or safety
       * net -- the single highest-stakes click on this whole tab (it defines
       * the entire event's look), with worse reversibility than deleting a
       * guest already has. Same toast shell as GuestManager's removal
       * undo -- switching back to the previous theme is itself just another
       * selection, so "Undo" here is literally handleSelect(previousId). */
      switchToast: {
        switched: (themeName: string) => string;
        undo: string;
      };
    };
    paper: {
      pageTitle: string;
      pageSubtitle: string;
      tourSteps: { title: string; body: string }[];
      downloadHeading: string;
      downloadSubtitle: string;
      groups: { invitation: string; extras: string; banquet: string };
      items: {
        front: string;
        back: string;
        envelope: string;
        program: string;
        dressCode: string;
        saveTheDate: string;
        thankYou: string;
        seatingChart: string;
        placeCards: string;
        tableNumbers: string;
      };
      seed: {
        guestAddress: string;
        orderOfTheDay: string;
        dressCodeTitle: string;
        saveTheDate: string;
        formalInvitationToFollow: string;
        thankYouTitle: string;
        thankYouBody: string;
      };
      customizeText: string;
      editText: string;
      revertToDefault: string;
      /** dashboard critique (2026-10-23), re-run P1: "Revert to default"
       * discarded a host's whole custom front-invitation design in one
       * click, no confirm, no undo -- the same stakes class as a destructive
       * action this codebase already gates elsewhere (CanvasEditor's page
       * delete, DomainEditForm's domain removal), just missed here. */
      revertToDefaultConfirm: string;
      flipToBack: string;
      done: string;
      zoomOut: string;
      zoomIn: string;
      previous: string;
      next: string;
      generating: string;
      downloadAllAsPdf: (count: number) => string;
      failedToGeneratePdf: string;
      editorHint: {
        back: string;
        front: string;
        envelope: string;
        program: string;
        dressCode: string;
        saveTheDate: string;
        thankYou: string;
      };
      caption: {
        customEdit: string;
        frontDefault: (dataLinkLabel: string) => string;
        envelopeDefault: string;
        programDefault: (siteTabLabel: string) => string;
        dressCodeDefault: (siteTabLabel: string) => string;
        saveTheDateDefault: string;
        thankYouDefault: string;
        seatingChartHint: (seatingLabel: string) => string;
        placeCardsHint: string;
        placeCardsRsvpNote: string;
        tableNumbersHint: (seatingLabel: string) => string;
        seatingTabSuffix: string;
      };
      upgradePrompt: { seatingChart: string; placeCards: string; tableNumbers: string };
      canvas: {
        addElement: string;
        uploading: string;
        undo: string;
        redo: string;
        newTextDefault: string;
        elementDeletedToast: string;
        addElementModal: {
          heading: string;
          close: string;
          text: { label: string; body: string };
          image: { label: string; body: string };
          video: { label: string; body: string };
          qr: { label: string; body: string };
        };
        toolbar: {
          fontSize: string;
          color: string;
          bold: string;
          align: (direction: string) => string;
          alignLeft: string;
          alignCenter: string;
          alignRight: string;
          lineHeight: string;
          letterSpacing: string;
          qrLinksTo: string;
          qrSiteLink: string;
          qrGuestLink: string;
          qrCaptionPlaceholder: string;
          animationDuration: string;
          previewAnimation: string;
          bringToFront: string;
          bringForward: string;
          sendBackward: string;
          sendToBack: string;
          duplicate: string;
          delete: string;
        };
        layers: {
          heading: string;
          empty: string;
          video: string;
          qrCode: string;
          image: string;
          emptyText: string;
          desktopOnlyOn: string;
          desktopOnlyOff: string;
          hiddenOn: string;
          hiddenOff: string;
          delete: string;
          backgroundHeading: string;
          addPhoto: string;
          changeImage: string;
          removeImage: string;
          openPanel: string;
          closePanel: string;
        };
        fontPicker: {
          searchPlaceholder: string;
          noFontsFound: string;
          categories: { serif: string; sansSerif: string; script: string; display: string };
        };
        couldntUploadPhoto: string;
        couldntUploadVideo: string;
      };
      downloads: {
        heading: string;
        description: string;
        canvasNote: string;
        generic: string;
        custom: string;
        envelope: string;
        program: string;
        dressCode: string;
        saveTheDate: string;
        thankYou: string;
        generating: string;
        generatingProgress: (done: number, total: number) => string;
        downloadAllAsZip: (count: number) => string;
        noGuestsYet: string;
        addGuestsHint: string;
        downloadPdf: string;
        failedToGeneratePdfs: string;
      };
    };
    shell: {
      nav: { style: string; site: string; paper: string; guests: string };
      copyLink: { copied: string; copyFull: string; copyShort: string };
      seeWhatGuestsSee: string;
      publish: {
        saving: string;
        unpublish: string;
        publish: string;
        visibleNote: string;
        hiddenNote: string;
        accountModalTitle: string;
        accountModalBody: string;
        confirmEmailToPublish: string;
      };
      newEvent: string;
      anonBanner: {
        saveProgress: string;
        createAccount: string;
        notNow: string;
        creating: string;
        cancel: string;
        emailPlaceholder: string;
        passwordPlaceholder: string;
        pendingConfirmation: string;
        genericError: string;
        /** Pre-launch legal pass (2026-10-27): split around the two embedded
         * links (Terms, Privacy) the same way this file already splits
         * alreadyOnPlanBodyBefore/After around one -- composes to "I agree
         * to the [Terms of Service] and [Privacy Policy]." regardless of
         * how a given locale reorders the two link labels around the
         * connecting words. */
        agreeTermsBefore: string;
        termsOfServiceLink: string;
        agreeTermsMiddle: string;
        privacyPolicyLink: string;
        agreeTermsAfter: string;
      };
      planBadge: {
        removeBadgeShort: (priceEur: number) => string;
        removeBadgeFull: (priceEur: number) => string;
        current: string;
        free: string;
        seePlanDetails: string;
        managePlan: string;
      };
      userMenu: { plan: string; accountSettings: string; signOut: string; signingOut: string; guestFallback: string };
      funnelNav: { backTo: (label: string) => string; getYourLink: string };
      supportWidget: { openLabel: string; closeLabel: string; needHand: string; body: string };
    };
    guests: {
      // dashboard critique (2026-10-24), eighth re-run P1: the page-level
      // "Guests"/"RSVP" anchor links (page.tsx's nav row) had nothing to
      // actually land on -- GuestManager.tsx carried no heading of its
      // own, and the #rsvp wrapper's only heading belongs to
      // RsvpResponses further down, not the notification-settings block
      // right at its top. Two standalone headings, not reused copy from
      // elsewhere, so each anchor's destination is unambiguous on arrival.
      listHeading: string;
      rsvpSettingsHeading: string;
      page: {
        title: string;
        subtitle: string;
        attending: string;
        notAttending: string;
        awaitingResponse: string;
        notYetContacted: string;
        seatingHeading: string;
        seatingBodyOn: string;
        seatingBodyOff: string;
        nav: {
          guests: string;
          rsvp: string;
          photos: string;
          seating: string;
        };
      };
      tour: {
        step1Title: string;
        step1Body: string;
        step2Title: string;
        step2Body: string;
        step3Title: string;
        step3Body: string;
      };
      shareLink: {
        prompt: string;
        body1: string;
        body2: string;
        copyLink: string;
        linkCopied: string;
        shareLink: string;
        shareWhatsapp: string;
        shareSms: string;
        shareEmail: string;
        shareMessage: (eventTitle: string, url: string) => string;
        personalMessage: (guestName: string, eventTitle: string, url: string) => string;
      };
      form: {
        paperInviteLabel: string;
        paperInviteHint: string;
        siteInviteLabel: string;
        siteInviteHint: string;
        fullNameLabel: string;
        fullNamePlaceholder: string;
        errorEnterName: string;
        errorEnterEmail: string;
        errorEnterPhone: string;
        groupLabel: string;
        optional: string;
        groupPlaceholder: string;
        emailLabel: string;
        emailPlaceholder: string;
        phoneLabel: string;
        phonePlaceholder: string;
        plusOnesLabel: string;
        moreDetails: string;
        addGuest: string;
        adding: string;
        duplicateConfirm: (name: string) => string;
        genericError: string;
      };
      editForm: {
        fullNameLabel: string;
        groupLabel: string;
        emailLabel: string;
        phoneLabel: string;
        plusOnesLabel: string;
        save: string;
        saving: string;
        cancel: string;
        genericError: string;
      };
      attendeeList: {
        addMore: string;
        removeConfirm: (name: string) => string;
        placeholder: string;
        add: string;
        adding: string;
        remove: string;
        genericAddError: string;
        genericRemoveError: string;
      };
      statusFilters: { all: string; created: string; sent: string; accepted: string; declined: string };
      guestRow: {
        dear: (name: string) => string;
        confirmed: string;
        declined: string;
        selectAriaLabel: (name: string) => string;
        edit: string;
        remove: string;
      };
      invitationSent: {
        sent: string;
        notSent: string;
        sentVia: (channels: string) => string;
        clickToMarkNotSent: string;
        clickToMarkSent: string;
        genericError: string;
      };
      channelLabels: { link: string; whatsapp: string; sms: string; email: string };
      copyInviteLink: { copied: string; copy: string };
      sendMenu: { send: string; whatsapp: string; sms: string; email: string; sending: string; genericError: string };
      search: {
        placeholder: string;
        countOf: (filtered: number, total: number) => string;
        noMatchQuery: (query: string) => string;
        noMatchFilter: string;
      };
      selection: { selected: (count: number) => string; removeSelected: string; clearSelection: string; selectAll: string };
      bulkEmail: {
        sendButton: (count: number) => string;
        sending: string;
        sentSummary: (count: number) => string;
        skippedSummary: (count: number) => string;
        failedSummary: (count: number) => string;
        genericError: string;
      };
      bulkReminder: {
        sendButton: (count: number) => string;
        sending: string;
        sentSummary: (count: number) => string;
        skippedSummary: (count: number) => string;
        failedSummary: (count: number) => string;
        genericError: string;
      };
      emptyState: { createFirst: string; fillForm: string };
      removalToast: { removed: (label: string) => string; undo: string; bulkCountLabel: (count: number) => string };
      addedToast: { added: (name: string) => string };
      bulkAdd: {
        toggleOpen: string;
        toggleClose: string;
        csvTemplateHeaders: { fullName: string; group: string; email: string; phone: string };
        instructions: string;
        uploadCsv: string;
        downloadTemplate: string;
        csvReadSummary: (count: number, filename: string) => string;
        csvNoNamesError: string;
        csvReadError: string;
        textareaPlaceholder: string;
        duplicateWarning: (count: number, names: string) => string;
        duplicateConfirm: (count: number, names: string) => string;
        submitDefault: string;
        submitWithCount: (count: number) => string;
        submitting: string;
        addedSummary: (count: number) => string;
        genericError: string;
      };
      rsvpResponses: {
        heading: string;
        subtitle: string;
        guestbookWall: (count: number) => string;
        hideAll: string;
        hidingAll: string;
        showAll: string;
        showingAll: string;
        searchPlaceholder: string;
        emptyHeading: string;
        emptySubtitle: string;
        noMatch: (query: string) => string;
        attending: string;
        notAttending: string;
        guestCountSuffix: (count: number) => string;
        hiddenShow: string;
        visibleHide: string;
        matchToGuestLabel: string;
        unmatchedOption: string;
        delete: string;
        deleting: string;
        deleteConfirm: string;
        genericError: string;
      };
      notifications: {
        emailMeTitle: string;
        emailMeBody: string;
        dailyTitle: string;
        dailyBody: string;
        genericError: string;
      };
      photos: {
        heading: string;
        subtitle: string;
        printHint: string;
        loading: string;
        empty: string;
        deleteAria: string;
        deletedToast: string;
      };
      download: {
        pdfButton: string;
        generating: string;
        csvButton: string;
        hint: string;
        genericError: string;
        csvHeaders: { name: string; group: string; status: string; partySize: string; table: string; notes: string };
        statusAttending: string;
        statusNotAttending: string;
        statusAwaiting: string;
        statusNotContacted: string;
      };
      banquet: {
        addTable: string;
        adding: string;
        tableNameLabel: string;
        tableNamePlaceholder: string;
        errorEnterTableName: string;
        seatsLabel: string;
        optional: string;
        seatsPlaceholder: string;
        save: string;
        saving: string;
        cancel: string;
        genericError: string;
        seatsCount: (seated: number, capacity: number) => string;
        removeTableAria: string;
        removeTableConfirm: string;
        noGuestsYet: string;
        addGuestsHint: string;
        chooseGuestOption: string;
        addGuestButton: string;
        everyGuestSeated: string;
        assignHeading: string;
        assignSubtitle: string;
        overCapacity: (list: string) => string;
        searchPlaceholder: string;
        unassignedOnly: string;
        attendingOnly: string;
        countOf: (filtered: number, total: number) => string;
        chooseTableOption: string;
        assignAll: (count: number) => string;
        assigning: string;
        emptyHeading: string;
        emptySubtitle: string;
        noMatch: string;
        unassignedOption: string;
      };
      supportCard: {
        heading: string;
        bulletPdf: string;
        bulletNoAccount: string;
        bulletNoWaiting: string;
        bulletContact: string;
        questionsCaption: string;
      };
    };
    /** Launch-readiness pass (2026-10-27): PlanSelectForm.tsx -- the actual
     * payment screen, where a host clicks "Get your link - EUR19" and goes
     * to Stripe checkout -- was 100% hardcoded English until now, discovered
     * during a pricing-locale-consistency sweep. Reuses
     * landing.pricing.oneTime/planFeatures, dashboard.shell.publish.publish,
     * and dashboard.shell.anonBanner.email/passwordPlaceholder rather than
     * duplicating those strings a second time. */
    plan: {
      heading: string;
      subtitle: string;
      designFreeBadge: string;
      checkoutSuccess: string;
      checkoutCancelled: string;
      alreadyOnPlan: (planName: string) => string;
      alreadyOnPlanBodyBefore: string;
      alreadyOnPlanBodyAfter: string;
      finishedResultSuffix: string;
      getYourLink: (priceEur: number) => string;
      redirecting: string;
      processedByStripe: string;
      orPublishFreeInstead: (badgeName: string) => string;
      freeWarningHeading: string;
      guestViewLabel: string;
      madeWithInvimboBadge: string;
      badgePermanentWarning: string;
      freeModulesLockedBullet: string;
      publishFreeInstead: string;
      printingHeading: string;
      premiumDescription: (priceEur: number) => string;
      youreOnPremium: string;
      upgradeButton: (priceEur: number) => string;
      checkEmailTitle: string;
      checkEmailBodyBefore: string;
      checkEmailBodyAfter: string;
      gotIt: string;
      oneLastStepTitle: string;
      oneLastStepBody: string;
      createAccountButton: string;
      creatingAccount: string;
      notNow: string;
    };
  };
}

export const en: Dictionary = {
  siteHeader: {
    skipToContent: "Skip to content",
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
    message: "👀 You're previewing this site - it isn't published yet, so RSVPs can't be submitted here until you publish.",
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
    takingLonger: "This is taking longer than expected - hang tight, or try again in a moment.",
    missingNameError: "Please fill in your name.",
    missingAttendanceError: "Please let us know if you can make it.",
    missingFieldsError: "Please fill in your name and let us know if you can make it.",
    genericError: "Something went wrong",
    successAttending: "You're on the list! We can't wait to celebrate with you. \u{1F389}",
    successDeclining: "Thanks for letting us know - you'll be missed!",
    notPublishedError: "This site isn't published yet, so RSVPs can't be submitted. Ask your host to publish it.",
    submitFailedError: "We couldn't submit your RSVP. Please try again in a moment.",
    oneTapGreeting: (name) => `Will you be there, ${name}?`,
    oneTapAccept: "I'll be there",
    oneTapDecline: "Can't make it",
    oneTapMoreDetails: "Add details (meal, guests, a message)",
    alreadyRespondedAttending: (partySize) =>
      `You already said yes - ${partySize} ${partySize === 1 ? "guest" : "guests"}.`,
    alreadyRespondedDeclining: "You already let us know you can't make it.",
    editResponseButton: "Edit your response",
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
  travel: {
    bookingLink: "Book now",
    promoCodeLabel: "Promo code",
  },
  guestbook: {
    empty: "Guests' RSVP comments will appear here.",
  },
  dressCode: {
    eyebrow: "Dress Code",
  },
  video: {
    iframeTitleFallback: "Video",
  },
  letter: {
    confirmBy: (date) => `Please confirm by ${date}`,
  },
  map: {
    mapTitle: (venueName) => `Map: ${venueName}`,
    mapPlaceholder: "Add an address to preview the map",
    noVenuesYet: "Venue details coming soon.",
  },
  guestPhotos: {
    heading: "Add your photos",
    subtitle: (eventTitle) => `Share your photos from ${eventTitle} - no account needed.`,
    addPhotosButton: "Add photos",
    uploading: "Uploading...",
    uploaded: "Added! Thank you.",
    genericError: "That photo couldn't be uploaded. Please try again.",
    notPublished: "This site isn't published yet, so photos can't be added. Ask your host to publish it.",
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
      `We couldn't find "${guestName}" on the guest list - double-check the spelling, or ask the host.`,
    resultNotSeatedYet: (guestName) => `Hi ${guestName} - you're on the list! Seating is still being finalized, check back soon.`,
    resultNotAttending: (guestName) =>
      `Looks like ${guestName} is marked as not attending - reach out to the host if that's not right.`,
  },
  landing: {
    skipToContent: "Skip to content",
    topBar: "Visa / Mastercard accepted · Instant delivery - send your invite link anywhere in the world",
    nav: { constructor: "Constructor", themes: "Themes", whatsIncluded: "What's included", pricing: "Pricing", login: "Login" },
    mobileNav: { openMenu: "Open menu", closeMenu: "Close menu" },
    // CRO audit (2026-10-19): `primary` was "Create your invitations" --
    // the header's and hero's own CTA pill (the most-clicked, first-seen
    // button on the page), promising a different product than the hero's
    // own headline/subtext one paragraph below it actually describe
    // ("A beautiful event website, matching paper invitations..." --
    // website-first, paper invitations as a complement, not the other way
    // around). `final` already had the correctly-framed copy; reused it
    // here instead of inventing a third variant, so the same promise now
    // appears consistently at the top AND bottom of the page. `constructor`
    // (a third wording, "Start building") is left alone -- that's a
    // different, contextually-apt moment (right next to a live screenshot
    // of the editor), not the same inconsistency.
    cta: {
      primary: "Create your website",
      primaryLoggedIn: "Go to dashboard",
      constructor: "Start building",
      constructorLoggedIn: "Go to dashboard",
      final: "Create your website",
    },
    hero: {
      eyebrow: "An event platform, not just an invitation",
      headline: "Your event, styled exactly how you imagined it",
      accent: "down to the last place card",
      subtext:
        "A beautiful event website, matching paper invitations, and guest seating - one style, everywhere your guests see it. Start from a designer theme, or drag your own together from a blank canvas.",
      checklistFree: "Free to design - pay only if you want this exact link live",
      checklistThemes: (themeCount) => `${themeCount} designer themes - or build your own from a blank canvas`,
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
      // UX audit (2026-10-26): was "A wedding platform, not just an
      // invitation" -- directly contradicted the eventTypes section
      // immediately above it ("Every celebration gets its own site", 12
      // event types shown), found live in a clarity critique. Generalized
      // while keeping the "not just an invitation" structure that made the
      // line work in the first place.
      heading: "A full event platform, not just an invitation",
      subtext: "From your invitation website and guest messaging to a fully styled banquet - seating cards included.",
    },
    eventTypes: {
      eyebrow: "Not just weddings",
      heading: "Every celebration gets its own site",
      subtext:
        "Pick your event type first, and everything after - the wording, the fields, even what the seating tool is called - is built around it.",
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
        `Pick a designer theme and it's already done - matching fonts, colors, and layout, ready to publish. Still want to change something? Any text, any color, any photo is yours to edit, from ${fontCount}+ fonts to your own palette. The exact design you choose carries over to your printed invitations too.`,
      features: [
        { title: "Curated fonts", description: "Script, serif, bold, or thin - swap the whole look with one click." },
        { title: "Any color you like", description: "Build your own palette to match your exact wedding colors." },
        { title: "Designer-curated variations", description: "Or start from color and pattern combinations, hand-picked by our designers." },
        { title: "Flexible text, anywhere", description: "Edit, resize, add, and move any text on your chosen design." },
        { title: "Paper add-ons & banquet cards", description: "Design the front and back of your invitation, plus matching banquet cards." },
        { title: "Toggle site modules on and off", description: "Turn the countdown, schedule, RSVP, map, and more on or off, per site." },
      ],
    },
    howItWorksSection: {
      heading: "How the constructor works",
      // UX audit (2026-10-26): clarity critique found this section reads as
      // repeating the "Every theme is complete, out of the box" capability
      // grid right above it -- same builder sold twice in a row. That grid
      // answers "what can I customize"; this one is the literal step-by-
      // step flow, with real screenshots of the actual editor per step
      // (STEP_META in HowItWorksSection.tsx), not a repeat. Rewrote the
      // opener to say so explicitly instead of leaving a skimmer to infer
      // it from two differently-shaped sections in a row.
      subtext: "You've seen what you can customize - here's exactly how it comes together, step by step, right in your browser.",
      steps: [
        {
          title: "Choose your style",
          bullets: [
            "Pick from dozens of designer themes, or start from a blank canvas",
            "Every theme comes fully color-coordinated, ready to use",
            "Switch styles any time - your content carries over",
          ],
        },
        {
          title: "Enter your event details",
          bullets: [
            "Names, date, venue - fill it in once",
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
            "One link, live instantly - share it however guests actually check messages",
            "Print-ready PDF invitations, envelopes, and banquet cards",
            "Update anything later - everyone sees the latest version",
          ],
        },
      ],
    },
    guestTracking: {
      eyebrow: "Beyond the invitation",
      heading: "Send it anywhere, track every reply",
      subtext:
        "Share your one link over WhatsApp, SMS, email, or however your guests actually check messages. Every RSVP flows straight back into your guest list - who's coming, who hasn't answered yet, and who you still need to invite. They don't need an account or an app to respond - just the link.",
    },
    siteOrPaper: {
      heading: "A website invitation, and/or paper",
      subtext: "Not an either-or - most couples use both.",
      orBadge: "AND/OR",
      website: {
        title: "Website invitation",
        subtext: "Simple and fast - invite every guest, wherever they live.",
        bullets: [
          "One link works on any phone, tablet, or laptop",
          "Update anything - everyone sees the latest version instantly",
        ],
      },
      paper: {
        title: "Paper invitations",
        subtext: "A keepsake for your closest family and friends.",
        bullets: [
          "Print-ready PDF invitations, envelopes, and program cards",
          "Each guest gets a personal QR code - their RSVP auto-matches",
        ],
      },
    },
    themesSection: {
      heading: "Choose your style",
      subtext:
        "The same theme carries through your site, paper invitations, and banquet cards - or skip it entirely and design from scratch in the constructor.",
      seeMoreStyles: (count) => `See ${count}+ more styles →`,
    },
    whatsIncluded: {
      heading: "What's included",
      subtext: "Every site comes with these building blocks - mix and match to tell your story.",
      guestFacingLabel: "What your guests see",
      hostToolsLabel: "What you get as the host",
      modules: [
        { title: "Drag-and-drop constructor", description: "Move any text or photo, pick any font or color, and undo/redo as you go." },
        { title: "Hero intro", description: "Your names, event date, and photo - several layouts to choose from." },
        { title: "Letter to your guests", description: "A personal note, gift wishes, and RSVP deadline in one card." },
        { title: "Event schedule", description: "Lay out the day, minute by minute - from the first toast to the last dance." },
        { title: "Venue & map", description: "Show guests exactly where to go, with an interactive map." },
        { title: "RSVP with custom questions", description: "Ask about meals, drinks, or transport - guests confirm online, straight to your list." },
        { title: "Countdown timer", description: "Build anticipation with a live countdown to the big day." },
        { title: "Guestbook wall", description: "Well-wishes guests leave at RSVP, shown as a public wall on your site." },
        { title: "Video", description: "Embed a YouTube or Vimeo video - your proposal, your story, your choice." },
        { title: "Paper invitations", description: "Print-ready PDF invites, envelopes, and program cards, personalized per guest with a QR code." },
        { title: "Banquet seating", description: "Assign tables - by name, not just headcount - and generate table & place cards to print." },
        { title: "Custom domain", description: "Point your own domain at your site, or keep the readable link we give you free." },
        { title: "FAQ for your guests", description: "Answer the questions you'll get asked over and over - parking, plus-ones, timing - right on your site." },
        { title: "Travel & accommodations", description: "Recommend hotels with promo codes and booking links, so out-of-town guests know where to stay." },
      ],
    },
    pricing: {
      heading: "The constructor is always free",
      subtext: "Design your site, invite guests, and track RSVPs at no cost - publish it live whenever you're ready. Pay when you want your own address with no Invimbo badge, or watermark-free paper invitations.",
      free: "Free",
      whatYouGet: "What you get",
      whatThisAdds: "What this adds",
      badgeFree: "Always free",
      // UX audit (2026-10-26): Basic had no badge at all, unlike Free and
      // Premium -- a skimmer reading only badges got a clear reason to pick
      // either of those and none for Basic. Custom domain is the one Basic
      // feature Free lacks and Premium doesn't repeat as its own headline
      // (Premium's badge is about the paper watermark specifically).
      badgeBasic: "Your own domain",
      badgePremium: "Removes the watermark",
      freeCaveat: "Shows a repeating \"Invimbo\" watermark across your live site, plus a watermark on printed paper.",
      oneTime: "One-time, not a subscription",
      exampleCaption: "A real Invimbo design - yours can look like this.",
      valueAnchor: "Printed, mailed invitations usually cost more than this per guest. One flat fee here covers your whole guest list, however many people you're inviting.",
      planFeatures: {
        free: ["Event website with a designer theme", "Guest list", "RSVP tracking"],
        basic: [
          "Everything in Free",
          "Custom domain",
          "Countdown, gift wishes & dress-code modules",
          "No \"Made with Invimbo\" site badge",
        ],
        premium: [
          "Everything in Basic",
          "No paper watermark on personalized invitations",
          "No paper watermark on banquet & table cards",
        ],
      },
    },
    faq: {
      heading: "Questions before you start",
      items: [
        {
          question: "Do I need to know how to design or code?",
          answer:
            "No. Pick a designer theme and everything - fonts, colors, layout - is already done. Click any text on the live page to edit it; nothing to learn, nothing to install.",
        },
        {
          question: "Is it really free, or is there a catch?",
          answer:
            "The constructor itself is free with no time limit - design your whole site, invite guests, and track RSVPs at no cost. The only trade-off on Free is a repeating \"Invimbo\" watermark across your live site and on printed paper, both shown to you up front, not after you've built something.",
        },
        {
          question: "Is this a subscription?",
          answer: "No. Every paid plan is one flat, one-time fee - not a recurring charge.",
        },
        {
          question: "Do my guests need an account or an app?",
          answer:
            "No. They open your link, see your site, and RSVP - nothing to download, nothing to sign up for.",
        },
        {
          question: "Will it actually look like MY event, not a generic template?",
          answer:
            "Every theme is a real starting point, not a locked layout - swap colors, fonts, and photos, drag elements anywhere, or start from a blank canvas. Browse the full gallery above before you decide.",
        },
        {
          question: "How is this different from other wedding site builders?",
          answer:
            "Most charge a recurring subscription just for a website. Here it's one flat fee, once - and that same theme carries through to your printed invitations and banquet cards too, not just the site. No app for guests, no subscription for you.",
        },
      ],
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
      paymentAccepted: "Visa / Mastercard accepted",
    },
  },
  onboarding: {
    stepOf: (current, total) => `Step ${current} of ${total}`,
    back: "Back",
    next: "Next",
    createSite: "Create my site",
    saving: "Saving...",
    saveFailed: "Failed to save",
    rateLimited: "Too many attempts - please wait a few minutes and try again.",
    previewBadge: "Preview",
    eventTypeStep: { heading: "\u{1F389} What are you celebrating?", subtext: "This shapes the questions we ask next." },
    styleStep: { heading: "\u{1F3A8} Pick your style", subtext: "You can always change this or design your own later." },
    photo: {
      label: "\u{1F4F7} Add a photo (optional)",
      help: "Shows up on your site's photo layouts - you can always add or change it later.",
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
        { title: "Pick a style", text: "Browse styles until one feels right - swap it any time." },
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
  email: {
    common: {
      greeting: (guestName) => `Hi ${guestName},`,
      rsvpLinkLabel: "RSVP here",
    },
    guestInvitation: {
      subject: (eventTitle) => `You're invited to ${eventTitle}`,
      invitedTo: (eventTitle) => `You're invited to <strong>${eventTitle}</strong>.`,
    },
    guestReminder: {
      subject: (eventTitle) => `Don't forget to RSVP for ${eventTitle}`,
      reminderText: (eventTitle) =>
        `Just a friendly reminder - we haven't heard back from you yet for <strong>${eventTitle}</strong>.`,
    },
    guestConfirmation: {
      acceptedSubject: (eventTitle) => `You're confirmed for ${eventTitle}`,
      declinedSubject: (eventTitle) => `RSVP received for ${eventTitle}`,
      acceptedBody: (guestName, eventTitle) =>
        `<p>Hi ${guestName},</p><p>Thank you, we'll see you there! Your RSVP for <strong>${eventTitle}</strong> is confirmed.</p>`,
      declinedBody: (guestName, eventTitle) =>
        `<p>Hi ${guestName},</p><p>Thanks for letting us know you won't be able to make it to <strong>${eventTitle}</strong>. We'll miss you!</p>`,
    },
    hostNewRsvp: {
      acceptedSubject: (guestName) => `New RSVP: ${guestName} is coming`,
      declinedSubject: (guestName) => `New RSVP: ${guestName} can't make it`,
      headline: (guestName, eventTitle, attending) =>
        `<p><strong>${guestName}</strong> ${attending ? "is coming" : "can't make it"} to ${eventTitle}.</p>`,
      responseSummary: (total, yes, no) =>
        `<p style="color:#6b7280;font-size:13px;">${total} response${total === 1 ? "" : "s"} so far: ${yes} yes, ${no} no.</p>`,
      partySize: (size) => `<p>Party size: ${size}</p>`,
      namesLabel: (names) => `<p>Names: ${names}</p>`,
      allergiesLabel: (text) => `<p>Allergies / dietary needs: ${text}</p>`,
      messageLabel: (text) => `<p>Message: ${text}</p>`,
    },
    hostDigest: {
      subject: (count, eventTitle) => `RSVP summary: ${count} new response${count === 1 ? "" : "s"} for ${eventTitle}`,
      intro: (count, eventTitle) =>
        `<p style="margin:0 0 4px;">${count} new response${count === 1 ? "" : "s"} for <strong>${eventTitle}</strong> since your last update:</p>`,
      guestYes: (guestName) =>
        `<tr><td style="padding:8px 0;border-bottom:1px solid #eee5d8;font-weight:600;color:#2b2621;">${guestName}</td><td style="padding:8px 0;border-bottom:1px solid #eee5d8;text-align:right;font-weight:700;color:#1f8a4c;white-space:nowrap;">Yes</td></tr>`,
      guestNo: (guestName) =>
        `<tr><td style="padding:8px 0;border-bottom:1px solid #eee5d8;font-weight:600;color:#2b2621;">${guestName}</td><td style="padding:8px 0;border-bottom:1px solid #eee5d8;text-align:right;font-weight:700;color:#9a3b32;white-space:nowrap;">No</td></tr>`,
      previousHeading: (count) =>
        `<p style="margin:20px 0 4px;font-size:12px;font-weight:700;color:#9a9282;text-transform:uppercase;letter-spacing:0.04em;">Responded earlier (${count})</p>`,
      runningTotal: (total, yes, no) =>
        `<p style="color:#6b7280;font-size:13px;margin:18px 0 0;">Running total: ${total} responded, ${yes} yes, ${no} no.</p>`,
      manageNote: (guestsUrl) =>
        `<p style="color:#9ca3af;font-size:12px;margin:10px 0 0;">Get this every day? <a href="${guestsUrl}" style="color:#9ca3af;">Turn it off anytime</a> from your event's Guests tab.</p>`,
    },
    domainLive: {
      subject: (hostname) => `Your invimbo.com address is live: ${hostname}`,
      liveAt: (hostname) => `<p>Your event site is now reachable at <strong>https://${hostname}</strong>, alongside your original link.</p>`,
      includedNote:
        "<p>This address is included with your plan for as long as it's active - nothing to renew, no extra domain purchase, no expiry date to track.</p>",
      questionsNote: "<p>Questions? Just reply to this email or reach us at support@invimbo.com.</p>",
    },
  },
  auth: {
    login: {
      heading: "Login",
      subtitle: "Log in to your account to continue.",
      justRegisteredMessage: "Check your email to confirm your registration, then log in.",
      emailLabel: "Email",
      passwordLabel: "Password",
      forgotPassword: "Forgot password?",
      emailInvalid: "Enter a valid email",
      passwordRequired: "Enter your password",
      submitButton: "Log in",
      submitButtonPending: "Logging in...",
      noAccount: "Don't have an account?",
      signUpLink: "Sign up",
    },
    signup: {
      heading: "Sign up",
      subtitle: "Create an account to continue.",
      emailLabel: "Email",
      passwordLabel: "Password",
      confirmPasswordLabel: "Confirm password",
      emailInvalid: "Enter a valid email",
      passwordMin: "At least 6 characters",
      confirmPasswordRequired: "Confirm your password",
      passwordsDontMatch: "Passwords don't match",
      submitButton: "Sign up",
      submitButtonPending: "Signing up...",
      alreadyHaveAccount: "Already have an account?",
      logInLink: "Log in",
    },
    forgotPassword: {
      heading: "Reset your password",
      subtitle: "Enter your email and we'll send you a link to reset your password.",
      sentMessage: "Check your email for a link to reset your password.",
      emailLabel: "Email",
      emailInvalid: "Enter a valid email",
      submitButton: "Send reset link",
      submitButtonPending: "Sending...",
      backToLogin: "Back to login",
    },
    resetPassword: {
      heading: "Set a new password",
      linkInvalidMessage: "This reset link is invalid or has expired. Request a new one below.",
      requestNewLink: "Request a new link",
      checkingLink: "Checking your reset link...",
      newPasswordLabel: "New password",
      confirmNewPasswordLabel: "Confirm new password",
      passwordMin: "At least 6 characters",
      confirmPasswordRequired: "Confirm your password",
      passwordsDontMatch: "Passwords don't match",
      submitButton: "Set new password",
      submitButtonPending: "Saving...",
    },
  },
  cookieConsent: {
    message:
      "We use essential cookies to run this site, plus optional analytics (session recordings) to see what's confusing and fix it. Analytics only load if you say yes.",
    acceptButton: "Accept analytics",
    declineButton: "Essential only",
    privacyLinkText: "Privacy Policy",
  },
  dashboard: {
    common: {
      statusOn: "On",
      statusNotSet: "Not set",
      statusVerified: "Verified",
      statusPending: "Pending",
      tour: { skip: "Skip", back: "Back", next: "Next", gotIt: "Got it" },
      replayTourButton: "How this works",
      retry: "Retry",
      reloadPage: "Reload page",
      skipToContent: "Skip to content",
      moduleCard: {
        notSetYet: "Not set yet",
        couldntSave: "Couldn't save",
        close: "Close",
        edit: "Edit",
        toggleAriaLabel: (title, turningOn) => `Turn ${title} ${turningOn ? "on" : "off"}`,
      },
      backgroundPicker: {
        noFill: "None",
        colorAriaLabel: (color) => `Color ${color}`,
        customColor: "Custom color",
        pickCustomColor: "Pick a custom color",
        opacity: "Opacity",
      },
      upgradeModal: {
        featureSuffix: (planName) => `${planName} feature`,
        defaultConsequence: 'adds a "Made with Invimbo" watermark on your current plan.',
        upgradeSentence: (planName, priceEur, benefit) => `Upgrade to ${planName} (€${priceEur}) to ${benefit}.`,
        defaultBenefit: "remove it from every invitation and banquet card",
        upgradeButton: (planName) => `Upgrade to ${planName}`,
        continueWithWatermark: "Continue with watermark",
        notNow: "Not now",
        close: "Close",
      },
      upgradeNote: {
        warning: "This is a paid feature - downloads with a watermark on Free and Basic.",
        upgradeLinkText: (priceEur) => `Upgrade to Premium (€${priceEur})`,
        removeSuffix: "to remove it.",
      },
      hubStrip: {
        weddingStyle: "Wedding style",
        eventStyle: "Event style",
        edit: "Edit",
        weddingDetails: "Wedding details",
        eventDetails: "Event details",
        fillWeddingDetails: "Fill in your wedding details to complete your invitation text",
        fillEventDetails: "Fill in your event details to complete your invitation text",
        percentComplete: (percent) => `${percent}% complete`,
        yourPlan: "Your plan",
        noPaymentCollected: "🔓 No payment collected",
        changePlan: "Change plan",
      },
    },
    site: {
      pageTitle: "Site",
      freeCanvas: "🎨 Free canvas",
      freeCanvasAria: "Design from a blank canvas in a separate, freeform editor",
      siteSettingsLabel: "Site settings",
      checkoutPending: {
        title: "⏳ Confirming your payment…",
        body: "Stripe is finishing up - this page will unlock automatically in a few seconds. If it doesn't, refresh, or contact support if your card was charged and this still doesn't update.",
      },
      weddingDataReminder: {
        wedding: "Fill in your wedding details to complete your site and paper set.",
        generic: "Fill in your event details to complete your site and paper set.",
        cta: (typeLabel) => `${typeLabel} data`,
      },
      startScreen: {
        title: "Start screen",
        body: "Your cover photo, names and date are edited directly in the live preview.",
        editInPreview: "Edit in the preview",
      },
      music: { title: "Music" },
      linkPreview: { title: "Link preview" },
      customDomain: { title: "Custom domain", verified: "Verified", pending: "Pending" },
      editorPreviewLabel: "Site editor - click any text to edit it in place",
      openFullPreview: "Open full preview in a new tab",
      removeBadge: (priceEur) => `Happy with it? Remove the badge - €${priceEur}`,
      tourSteps: [
        {
          title: "👋 Welcome to your site editor",
          body: "Everything here saves itself as you type - there's no Save button to remember.",
        },
        {
          title: "✏️ Click any text to edit it",
          body: "No separate editor-vs-preview split - click straight on a name, date, or line of copy on the live page below and start typing.",
        },
        {
          title: "📷 Add your photos",
          body: "Drag a photo straight into any photo field. We'll resize it automatically.",
        },
        {
          title: "🧩 Turn modules on or off",
          body: "Countdown, RSVP, gift wishes, dress code and more - each has its own on/off switch right here.",
        },
        {
          title: "🔎 Can't find something?",
          body: "Editable blocks (below the preview) lists every text and photo on your site, grouped by section, so you can jump straight to it.",
        },
      ],
      modules: {
        heading: "Modules",
        description:
          "Guests won't see a module until it's turned on here - drag to change the order they appear in on your public site.",
        groups: { core: "Core", funExtras: "Fun extras", logistics: "Logistics" },
        labels: {
          letter: "Welcome Letter",
          timeline: "Schedule",
          map: "Location",
          rsvp: "RSVP",
          countdown: "Countdown",
          gift: "Gifts",
          dressCode: "Dress Code",
          guestbook: "Guestbook",
          video: "Video",
          banquetNavigator: "Find My Table",
          guestNotes: "Notes for Guests",
          faq: "FAQ",
          travel: "Travel & Stay",
        },
        toggleAriaLabel: (label, turningOn) => `Turn ${label} ${turningOn ? "on" : "off"}`,
        basicBadge: "Basic",
        emptyBadge: "Empty",
        emptyBadgeHint: "This is on, but there's nothing in it yet - guests won't see it until you add content.",
        personalizeBadge: "Add your words",
        personalizeBadgeHint:
          "Right now this only shows a quote - write a short welcome message in your own words so it feels personal.",
        gatedOnButHidden:
          "Visible to you here, but it won't show on your published site until you're on the Basic plan or above.",
        gatedPreviewOnly:
          "Turn this on and preview it freely - it only shows on your published site once you're on the Basic plan or above.",
        addSeatGuestsLink: "Add & seat your guests on the Guests tab",
        envelopeReveal: {
          label: "Envelope reveal",
          description: "A brief animated envelope guests tap open before seeing your site.",
          toggleAriaLabel: (turningOn) => `Turn envelope reveal ${turningOn ? "on" : "off"}`,
        },
        failedToSave: "Failed to save - please try again.",
        upgradeModal: {
          action: (label) => `Turning on ${label}`,
          consequence: "won't show on your published site until you upgrade.",
          benefit: "show it (and unlock the rest of Basic) on your site",
          continueLabel: "Continue (preview only)",
        },
      },
      weddingData: {
        cardTitle: (typeLabel) => `${typeLabel} data`,
        complete: (percent) => `${percent}% complete`,
        helper: "Names, date & venue - used across your site and paper set.",
        dateLabel: (typeLabel) => `${typeLabel} date`,
        venueName: "Venue name",
        venueNamePlaceholder: "Name of the venue, restaurant, or hall...",
        city: "City",
        address: "Address",
        titleWillBe: (title) => `Your site will be titled "${title}"`,
        errorEnterName: "Enter a name",
        errorEnterDate: "Enter a date",
      },
      eventTypeSwitcher: {
        switchTo: (label) => `Switch to ${label}?`,
        whatCelebrating: "What are you celebrating?",
        close: "Close",
        updateNotice: (label) => `Your site's title, prompts, and labels will update to match ${label}.`,
        namesModeChangeNote: "This type asks for names a little differently - check the field below.",
        titleWillBe: (title) => `Your site will be titled "${title}"`,
        saving: "Saving...",
        switchButton: (label) => `Switch to ${label}`,
        back: "Back",
      },
      editor: {
        undo: "Undo",
        redo: "Redo",
        previewDesktop: "Preview at desktop width",
        previewPhone: "Preview at phone width",
        previewTablet: "Preview at tablet width",
        previewLabel: "Preview:",
        previewLanguageAria: "Preview language",
        heroPhotoLabel: "Start screen photo",
        startScreenSectionLabel: "Start screen",
        photoLabel: "📷 Photo",
        noPhotoInLayout:
          'This layout doesn\'t display a photo in the Hero section. Pick a "Photo Invitation" style from the theme gallery if you\'d like your photo front and center.',
        sectionLabels: {
          letter: "Letter",
          timeline: "Timeline",
          map: "Map",
          rsvp: "RSVP",
          countdown: "Countdown",
          gift: "Gift wishes",
          dressCode: "Dress code",
          guestbook: "Guestbook",
          video: "Video",
          banquetNavigator: "Seating navigator",
          guestNotes: "Notes for guests",
          faq: "FAQ",
          travel: "Travel & Stay",
        },
        // UX audit (2026-10-26): label for the new section-jump nav row
        // (SiteInlineEditor.tsx) -- a clarity critique found no way to see
        // what's on the site, or jump back to one section, without
        // scrolling the whole live preview from the top every time.
        jumpToSectionAria: "Jump to section",
        collapsedNote: (label) => `${label} is off, so guests won't see it - nothing you've written here is lost. Flip the switch above to bring it back.`,
        editableBlocks: {
          heading: "Editable blocks",
          hide: "Hide",
          show: "Show",
          description:
            "Every text and photo from the site above, in one list - click a row to jump straight to it, or 👁 to hide/show it without deleting what you typed.",
          showBlock: "Show block",
          hideBlock: "Hide block",
          deleteLabel: "Delete",
          deleteConfirm: (label) => `Delete "${label}"? You can still undo this with the Undo button above.`,
        },
        rsvpPreviewOnly: "This is a preview - guests submit RSVPs from your live site, not from here.",
        lookupPreviewOnly: "This is a preview - guests look up their table from your live site, not from here.",
      },
      sendingGuide: {
        title: "🔗 Your invitation link",
        copied: "Copied!",
        copy: "Copy",
        open: "Open",
        helperWithEmail:
          "Send it however you like (text, email, WhatsApp) - guests open it, RSVP, and a reply lands in your inbox the moment they answer (you can also check the Guests tab anytime).",
        helperWithoutEmail:
          "Send it however you like (text, email, WhatsApp) - guests open it, RSVP, and you can check their answer anytime in the Guests tab (email alerts are off - turn them back on there).",
        qrTitle: "QR code for your link",
        qrCaption: "Print it on a welcome sign, table cards, or a thank-you note.",
        download: "Download",
        downloadPapers: "Download your watermark-free paper PDFs",
      },
      featureCarousel: {
        dismiss: "Dismiss",
        newBadge: "NEW",
        items: [
          {
            title: "Edit your site by clicking on it",
            body: "No separate editor-vs-preview split - click any text on the live page, type, and it autosaves.",
          },
          {
            title: "A QR code on every invitation",
            body: "Guests scan and land straight on their own RSVP page, name already filled in - nothing to type, nowhere to get lost.",
          },
          {
            title: "A blank canvas, when you want one",
            body: "Drop in text, photos, video and QR codes anywhere - a second, freeform way to design, alongside the guided one.",
          },
          {
            title: "Send invites your way",
            body: "WhatsApp, SMS, email or a plain link - one click opens it pre-filled, and we keep track of who's been sent what.",
          },
          {
            title: "Nothing's ever locked while you decide",
            body: "Every PDF downloads on every plan - Premium only removes the watermark, it doesn't unlock a download you couldn't get before.",
          },
          {
            title: "A nicer address for your site",
            body: "Claim a free claire-and-nathaniel.invimbo.com address, or point a domain you already own at your site instead.",
          },
        ],
      },
    },
    style: {
      header: {
        title: "Style",
        subtitle: "Let's find the style and design for your event.",
        helper: "Everything here can be customized further in the constructor.",
        previewFullSet: "Preview full material set",
      },
      howItWorks: {
        button: "How does this work?",
        heading: "Pick a look, not a final answer",
        step1: "Browse styles below with your own names and date already filled in.",
        step2: "Pick whichever feels closest - nothing is locked in.",
        step3: "Fine-tune colors, photos, and every section afterwards in the constructor.",
        gotIt: "Got it",
      },
      colorVariant: {
        label: "Color",
        useOwnColors: (themeName) => `Use ${themeName}'s own colors`,
        useColors: (optionName) => `Use ${optionName}'s colors`,
      },
      designSlots: {
        active: "Active",
        addSlot: "Add a design slot",
        historyLabel: "Design version history",
        recentStyles: "Recent styles",
        noPastStyles: "No past styles yet.",
        removeSlot: (themeName) => `Remove ${themeName} slot`,
        justNow: "just now",
        minutesAgo: (minutes) => `${minutes}m ago`,
        hoursAgo: (hours) => `${hours}h ago`,
        daysAgo: (days) => `${days}d ago`,
        failedToAdd: "Failed to add slot",
        failedToRemove: "Failed to remove slot",
        addModalEyebrow: "Add a design slot",
        addModalHint: "Pick a theme to keep as a candidate - it won't go live until you switch to it.",
        close: "Close",
      },
      materialsPreview: {
        eyebrow: "Full material set",
        close: "Close",
        invitations: "Invitations",
        banquet: "Banquet",
        website: "Website",
        paperInvitation: "Paper invitation",
        togetherWithFamilies: "Together with their families",
        yourEventDate: "Your event date",
        tableLabel: "Table",
        tableNumberCaption: "Table number",
        guestName: "Guest Name",
        tableWithNumber: (tableNumber) => `Table ${tableNumber}`,
        placeCard: "Place card",
        footerNote:
          "One style, applied everywhere your guests see it - change it once here and it carries through the site, invitations, and banquet cards.",
      },
      gallery: {
        searchPlaceholder: "Search styles...",
        popular: "Popular",
        new: "New",
        favorites: "Favorites",
        seasonYear: (seasonLabel, year) => `${seasonLabel} ${year}`,
        orPickSpecific: "Or pick a specific style",
        allStyles: "All styles",
        season: "Season",
        allYear: "All year",
        favoriteTitle: "Our favorite styles",
        favoriteSubtext: "Hand-picked across every category - tap any style to preview it, or use the filters to narrow it down.",
        resultsCount: (count) => `${count} ${count === 1 ? "style" : "styles"}`,
        hoverHint: "Preview any style before choosing",
        noMatch: "No styles match - try clearing a filter or search.",
        showMore: (remaining) => `Show more styles (${remaining} more)`,
        showFewerStyles: "Show fewer styles",
        categories: {
          romantic: "Romantic",
          modern: "Modern",
          botanical: "Botanical",
          boho: "Boho",
          luxury: "Luxury",
          dark: "Dark & Moody",
          coastal: "Coastal",
          rustic: "Rustic",
          vintage: "Vintage",
          minimal: "Minimal",
          marble: "Marble",
          cosmic: "Cosmic",
          peony: "Peony",
          provence: "Provence",
        },
        seasons: { spring: "Spring", summer: "Summer", autumn: "Autumn", winter: "Winter" },
      },
      card: {
        scanToPreview: "Scan to preview",
        removeFavorite: "Remove from favorites",
        addFavorite: "Add to favorites",
        chooseStyle: "Choose this style",
        customize: "Customize →",
        builtForPhoto: "📷 Built for a photo",
        builtForPhotoTitle: "This style is built around a photo - add yours for the full look",
        addToCalendar: "Add to calendar",
        letterTitle: "A Note From Us",
        letterBody: "We can't wait to celebrate this day surrounded by the people we love most.",
        scheduleTitle: "Schedule",
        timelineCeremony: "Ceremony",
        timelineCocktail: "Cocktail Hour",
        timelineReception: "Reception & Dinner",
        domainCaption: "yourname.com",
        customizeFurther: "Everything can be customized further in the constructor",
        countdown: { weeks: "weeks", days: "days", hours: "hours", minutes: "minutes", seconds: "seconds" },
      },
      switchToast: {
        switched: (themeName) => `Switched to ${themeName}`,
        undo: "Undo",
      },
    },
    paper: {
      pageTitle: "Paper",
      pageSubtitle: "Design, personalize, and download every printable piece - invitation, envelope, seating cards, and more.",
      tourSteps: [
        {
          title: "👋 Welcome to your paper set",
          body: "The list on the left is every printable piece - invitation, envelope, program, and more, grouped by kind.",
        },
        {
          title: "🔍 Zoom and flip",
          body: "Use − / + to zoom the preview, and \"↺ Flip to back\" on the invitation to see the reverse side.",
        },
        {
          title: "🖊️ Design the back",
          body: "The back of your invitation is its own small canvas - add text, a photo, or a QR code. It saves itself as you go.",
        },
        {
          title: "💍 Where the data comes from",
          body: "Names, date, venue, timeline and dress code are edited in the Site tab - update them there and these cards follow automatically.",
        },
        {
          title: "🍽️ Banquet materials",
          body: "Seating charts, place cards and table numbers preview one card at a time - use the arrows to flip through the rest.",
        },
        {
          title: "⬇️ Download when ready",
          body: "Each \"Download all\" button turns every card in that set into a ready-to-print PDF.",
        },
        {
          title: "💬 Stuck on something?",
          body: "The button in the bottom-left corner reaches a real person on our support team, any time.",
        },
      ],
      downloadHeading: "Download",
      downloadSubtitle:
        "Each guest gets a QR code linking straight to your site with them already identified, so their RSVP is matched automatically.",
      groups: { invitation: "Invitation", extras: "Extras", banquet: "Banquet" },
      items: {
        front: "Front",
        back: "Back",
        envelope: "Envelope",
        program: "Program card",
        dressCode: "Dress-code card",
        saveTheDate: "Save the date",
        thankYou: "Thank you",
        seatingChart: "Seating chart",
        placeCards: "Place cards",
        tableNumbers: "Table numbers",
      },
      seed: {
        guestAddress: "Guest address",
        orderOfTheDay: "Order of the day",
        dressCodeTitle: "Dress Code",
        saveTheDate: "Save the date",
        formalInvitationToFollow: "Formal invitation to follow",
        thankYouTitle: "Thank You",
        thankYouBody: "Thank you for celebrating with us - your presence meant more than words can say.",
      },
      customizeText: "Customize text",
      editText: "Edit text",
      revertToDefault: "Revert to default",
      revertToDefaultConfirm: "Discard your custom design and go back to the default? This can't be undone.",
      flipToBack: "↺ Flip to back",
      done: "Done",
      zoomOut: "Zoom out",
      zoomIn: "Zoom in",
      previous: "Previous",
      next: "Next",
      generating: "Generating...",
      downloadAllAsPdf: (count) => `Download all (${count}) as PDF`,
      failedToGeneratePdf: "Failed to generate PDF",
      editorHint: {
        back: "Design the back of your invitation - add text, photos, or a QR code linking to your site.",
        front: "Write whatever you want on the front - move, resize, or replace any line. Starts from your current names/date/venue.",
        envelope: "Write whatever you want on the envelope - move, resize, or replace any line. Starts from your current names/date.",
        program:
          "Write whatever you want on the program card - move, resize, or replace any line. Starts from your current schedule.",
        dressCode:
          "Write whatever you want on the dress-code card - move, resize, or replace any line. Starts from your current wording.",
        saveTheDate:
          "Write whatever you want on the save-the-date card - move, resize, or replace any line. Starts from your current names/date.",
        thankYou: "Write whatever you want on the thank-you card - move, resize, or replace any line. Starts from your current names.",
      },
      caption: {
        customEdit: 'This card now uses your own custom text - click "Edit text" to change it, or rearrange/resize anything.',
        frontDefault: (dataLinkLabel) =>
          `Names, date & venue come from your ${dataLinkLabel}. Edit them there and this card updates automatically - or click "Customize text" to write your own instead.`,
        envelopeDefault: 'The return address uses the same names & date as your invitation. Click "Customize text" to write your own instead.',
        programDefault: (siteTabLabel) =>
          `Edit your schedule in the ${siteTabLabel}'s Timeline card, or click "Customize text" to write your own instead.`,
        dressCodeDefault: (siteTabLabel) =>
          `Edit your palette in the ${siteTabLabel}'s Dress code card, or click "Customize text" to write your own instead.`,
        saveTheDateDefault: 'Uses your event\'s names and date. Click "Customize text" to write your own instead.',
        thankYouDefault: 'Uses your event\'s names. Click "Customize text" to write your own instead.',
        seatingChartHint: (seatingLabel) => `One card per table, listing everyone seated there. Manage tables and seating in the ${seatingLabel} tab.`,
        placeCardsHint: "One card per guest, ready to cut.",
        placeCardsRsvpNote: " Only includes guests who've RSVP'd attending.",
        tableNumbersHint: (seatingLabel) => `A freestanding number card for each table. Manage tables in the ${seatingLabel} tab.`,
        seatingTabSuffix: "tab",
      },
      upgradePrompt: {
        seatingChart: "Downloading the seating chart",
        placeCards: "Downloading place cards",
        tableNumbers: "Downloading table numbers",
      },
      canvas: {
        addElement: "+ Add element",
        uploading: "Uploading...",
        undo: "Undo",
        redo: "Redo",
        newTextDefault: "New text",
        elementDeletedToast: "Element deleted",
        addElementModal: {
          heading: "Add element",
          close: "Close",
          text: { label: "Text", body: "A heading, name, or line of copy" },
          image: { label: "Image", body: "Upload a photo from your device" },
          video: { label: "Video", body: "Upload a short clip from your device" },
          qr: { label: "QR code", body: "Links to your site, or a guest's invite" },
        },
        toolbar: {
          fontSize: "Font size",
          color: "Color",
          bold: "Bold",
          align: (direction) => `Align ${direction}`,
          alignLeft: "left",
          alignCenter: "center",
          alignRight: "right",
          lineHeight: "Line height",
          letterSpacing: "Letter spacing (px)",
          qrLinksTo: "What this QR code links to",
          qrSiteLink: "Site link",
          qrGuestLink: "Guest's personal invite",
          qrCaptionPlaceholder: "Caption (optional)",
          animationDuration: "Entrance animation duration (seconds)",
          previewAnimation: "Preview animation",
          bringToFront: "Bring to front",
          bringForward: "Bring forward",
          sendBackward: "Send backward",
          sendToBack: "Send to back",
          duplicate: "Duplicate",
          delete: "Delete",
        },
        layers: {
          heading: "Layers",
          empty: "Nothing on this page yet.",
          video: "Video",
          qrCode: "QR code",
          image: "Image",
          emptyText: "(empty text)",
          desktopOnlyOn: "Shown on desktop only - click to show everywhere",
          desktopOnlyOff: "Show on desktop only",
          hiddenOn: "Hidden from your site - click to show",
          hiddenOff: "Hide from your site",
          delete: "Delete",
          backgroundHeading: "Background",
          addPhoto: "Add photo",
          changeImage: "Change image",
          removeImage: "Remove image",
          openPanel: "Open layers panel",
          closePanel: "Close layers panel",
        },
        fontPicker: {
          searchPlaceholder: "Search fonts...",
          noFontsFound: "No fonts found",
          categories: { serif: "Serif", sansSerif: "Sans-serif", script: "Script", display: "Display" },
        },
        couldntUploadPhoto: "Couldn't upload that photo",
        couldntUploadVideo: "Couldn't upload that video",
      },
      downloads: {
        heading: "Personalized invitations",
        description:
          "Each includes a QR code that links straight to your site with the guest already identified, so their RSVP is automatically matched.",
        canvasNote:
          " These use your theme's default layout rather than your custom canvas design - per-guest personalization for canvas designs isn't available yet.",
        generic: "Download generic invitation PDF",
        custom: "Download invitation PDF (your design)",
        envelope: "Download envelope PDF",
        program: "Download program card PDF",
        dressCode: "Download dress-code card PDF",
        saveTheDate: "Download save-the-date PDF",
        thankYou: "Download thank-you card PDF",
        generating: "Generating...",
        generatingProgress: (done, total) => `Generating ${done}/${total}...`,
        downloadAllAsZip: (count) => `Download all (${count}) as ZIP (PDFs)`,
        noGuestsYet: "No guests yet",
        addGuestsHint: "Add guests on the Guests tab to download their invitations",
        downloadPdf: "Download PDF",
        failedToGeneratePdfs: "Failed to generate PDFs",
      },
    },
    shell: {
      nav: { style: "Style", site: "Site", paper: "Paper", guests: "Guests" },
      copyLink: { copied: "Copied!", copyFull: "Copy your invitation link", copyShort: "Copy link" },
      seeWhatGuestsSee: "See what guests see",
      publish: {
        saving: "Saving...",
        unpublish: "Unpublish",
        publish: "Publish site",
        visibleNote: "Your site is visible to guests via the link",
        hiddenNote: "Guests can't see your site until it's published",
        accountModalTitle: "Create a free account to publish",
        accountModalBody:
          "Publishing needs a real account, not just this browser session - otherwise clearing your cookies or switching devices could lock you out of your own live site. Create one now and we'll publish right after.",
        confirmEmailToPublish: "Check your email to confirm your account, then come back here and publish.",
      },
      newEvent: "Create another event",
      anonBanner: {
        saveProgress: "💾 Save your progress - create a free account",
        createAccount: "Create account",
        notNow: "Not now",
        creating: "Creating…",
        cancel: "Cancel",
        emailPlaceholder: "Email",
        passwordPlaceholder: "Password (min 6 characters)",
        pendingConfirmation:
          "📬 Check your email to confirm - everything you've made is already saved, keep working while you wait.",
        genericError: "Failed to create account",
        agreeTermsBefore: "I agree to the ",
        termsOfServiceLink: "Terms of Service",
        agreeTermsMiddle: " and ",
        privacyPolicyLink: "Privacy Policy",
        agreeTermsAfter: ".",
      },
      planBadge: {
        removeBadgeShort: (priceEur) => `Remove badge - €${priceEur}`,
        removeBadgeFull: (priceEur) => `Remove the badge - €${priceEur}`,
        current: "Current",
        free: "Free",
        seePlanDetails: "See plan details",
        managePlan: "Manage plan",
      },
      userMenu: {
        plan: "Plan",
        accountSettings: "Account settings",
        signOut: "Sign out",
        signingOut: "Signing out...",
        guestFallback: "Guest",
      },
      funnelNav: { backTo: (label) => `Back to ${label}`, getYourLink: "Get your link" },
      supportWidget: {
        openLabel: "Contact support",
        closeLabel: "Close support",
        needHand: "Need a hand?",
        body: "We don't run a live chat yet - email us and a real person will get back to you.",
      },
    },
    guests: {
      listHeading: "Guest list",
      rsvpSettingsHeading: "RSVP notifications",
      page: {
        title: "Guests",
        subtitle: "Keep track of everyone you're inviting.",
        attending: "attending",
        notAttending: "not attending",
        awaitingResponse: "awaiting response",
        notYetContacted: "not yet contacted",
        seatingHeading: "Seating",
        seatingBodyOn: `Optional - who sits where. This is what powers the "Find My Table" search on your site.`,
        seatingBodyOff: `Optional - plan who sits where whenever you like. Turn on "Find My Table" in your Site's Modules list to let guests look it up themselves.`,
        nav: {
          guests: "Guests",
          rsvp: "RSVP",
          photos: "Photos",
          seating: "Seating",
        },
      },
      tour: {
        step1Title: "👋 Add your guests",
        step1Body: "Add people one at a time below, or paste a whole list in at once - each gets their own RSVP link.",
        step2Title: "📤 Send invites your way",
        step2Body:
          "Copy your one shared link, or send each guest their own personal link by WhatsApp, SMS, or email - we track who's been sent what.",
        step3Title: "✅ See who's answered",
        step3Body:
          "Responses show up live below as guests RSVP - turn on email notifications so you don't have to keep checking back.",
      },
      shareLink: {
        prompt: "✨ Short on time to add every guest by hand?",
        body1:
          "Share your site's one link with everyone - anyone who RSVPs from it is added to your guest list automatically, no invite codes needed.",
        body2:
          "Add guests individually below instead if you'd rather track who's RSVP'd by name - each one gets their own personal link, separate from this shared one.",
        copyLink: "Copy site link",
        linkCopied: "Link copied!",
        shareLink: "Share link ↗",
        shareWhatsapp: "💬 WhatsApp",
        shareSms: "📱 SMS",
        shareEmail: "✉️ Email",
        shareMessage: (eventTitle, url) => `You're invited to ${eventTitle}! RSVP here: ${url}`,
        personalMessage: (guestName, eventTitle, url) => `Hi ${guestName}! You're invited to ${eventTitle}. RSVP here: ${url}`,
      },
      form: {
        paperInviteLabel: "Paper invite",
        paperInviteHint: "Include in printed/PDF invitations",
        siteInviteLabel: "Site invite",
        siteInviteHint: "Give them a personal RSVP link to your site",
        fullNameLabel: "Full name",
        fullNamePlaceholder: "First & last name, no titles (e.g. Jamie Rivera)",
        errorEnterName: "Enter a name",
        errorEnterEmail: "Enter a valid email",
        errorEnterPhone: "Enter a valid phone number",
        groupLabel: "Group",
        optional: "(optional)",
        groupPlaceholder: "Family, friends...",
        emailLabel: "Email",
        emailPlaceholder: "For emailing their invitation",
        phoneLabel: "Phone",
        phonePlaceholder: "For SMS or WhatsApp",
        plusOnesLabel: "Plus-ones allowed",
        moreDetails: "More details (group, email, phone, plus-ones)",
        addGuest: "Add guest",
        adding: "Adding...",
        duplicateConfirm: (name) => `"${name}" looks like a guest you already added. Add another one anyway?`,
        genericError: "Failed to save",
      },
      editForm: {
        fullNameLabel: "Full name",
        groupLabel: "Group",
        emailLabel: "Email",
        phoneLabel: "Phone",
        plusOnesLabel: "Plus-ones allowed",
        save: "Save",
        saving: "Saving...",
        cancel: "Cancel",
        genericError: "Failed to save",
      },
      attendeeList: {
        addMore: "Add more people to this invitation:",
        removeConfirm: (name) => `Remove ${name} from this invitation?`,
        placeholder: "Name an attendee",
        add: "+ Add",
        adding: "Adding...",
        remove: "Remove",
        genericAddError: "Failed to add",
        genericRemoveError: "Failed to remove",
      },
      statusFilters: { all: "All", created: "Created", sent: "Sent", accepted: "Accepted", declined: "Declined" },
      guestRow: {
        dear: (name) => `Dear ${name}!`,
        confirmed: "Confirmed",
        declined: "Declined",
        selectAriaLabel: (name) => `Select ${name}`,
        edit: "Edit",
        remove: "Remove",
      },
      invitationSent: {
        sent: "Sent",
        notSent: "Not sent",
        sentVia: (channels) => `Sent via ${channels} - click to mark as not sent`,
        clickToMarkNotSent: "Click to mark as not sent",
        clickToMarkSent: "Click to mark as sent",
        genericError: "Failed to update",
      },
      channelLabels: { link: "link copied", whatsapp: "WhatsApp", sms: "SMS", email: "email" },
      copyInviteLink: { copied: "Copied!", copy: "Copy link" },
      sendMenu: {
        send: "Send",
        whatsapp: "💬 WhatsApp",
        sms: "📱 SMS",
        email: "✉️ Email",
        sending: "Sending...",
        genericError: "Failed to send email",
      },
      search: {
        placeholder: "Search guests by name, group, email, phone...",
        countOf: (filtered, total) => `${filtered} of ${total} guest${total === 1 ? "" : "s"}`,
        noMatchQuery: (query) => `No guests match "${query}".`,
        noMatchFilter: "No guests match this filter.",
      },
      selection: {
        selected: (count) => `${count} selected`,
        removeSelected: "Remove selected",
        clearSelection: "Clear selection",
        selectAll: "Select all",
      },
      bulkEmail: {
        sendButton: (count) => `✉️ Email everyone who hasn't been sent one (${count})`,
        sending: "Sending...",
        sentSummary: (count) => `Sent to ${count} guest${count === 1 ? "" : "s"}`,
        skippedSummary: (count) => `${count} skipped (no email on file or already sent)`,
        failedSummary: (count) => `${count} failed`,
        genericError: "Failed to send",
      },
      bulkReminder: {
        sendButton: (count) => `⏰ Remind guests who haven't responded (${count})`,
        sending: "Sending...",
        sentSummary: (count) => `Reminded ${count} guest${count === 1 ? "" : "s"}`,
        skippedSummary: (count) => `${count} skipped (no email on file or already responded)`,
        failedSummary: (count) => `${count} failed`,
        genericError: "Failed to send",
      },
      emptyState: { createFirst: "Create your first guest", fillForm: "Fill in the form above to get started" },
      removalToast: {
        removed: (label) => `Removed ${label}.`,
        undo: "Undo",
        bulkCountLabel: (count) => `${count} guest${count === 1 ? "" : "s"}`,
      },
      addedToast: { added: (name) => `Added ${name}.` },
      bulkAdd: {
        toggleOpen: "Add many guests at once →",
        csvTemplateHeaders: { fullName: "Full Name", group: "Group", email: "Email", phone: "Phone" },
        toggleClose: "Hide bulk add",
        instructions:
          "Paste one guest per line - from a spreadsheet or typed by hand. Optionally add group, email, and phone after a comma or tab:",
        uploadCsv: "Or upload a CSV file →",
        downloadTemplate: "Download a blank template (.csv)",
        csvReadSummary: (count, filename) =>
          `Read ${count} guest${count === 1 ? "" : "s"} from "${filename}" - review below, then add.`,
        csvNoNamesError: "Couldn't find any names in that file - make sure one column has each guest's name.",
        csvReadError: "Couldn't read that file - make sure it's a .csv file exported from a spreadsheet.",
        textareaPlaceholder: "Maria Test\nIvan Petrov, Friends\nOlga Sidorova, Family, olga@example.com",
        duplicateWarning: (count, names) =>
          `${count} name${count === 1 ? "" : "s"} look like guests you already have: ${names}`,
        duplicateConfirm: (count, names) =>
          `${count} of these names (${names}) look like guests you already have. Add them anyway?`,
        submitDefault: "Add guests",
        submitWithCount: (count) => `Add ${count} guest${count === 1 ? "" : "s"}`,
        submitting: "Adding...",
        addedSummary: (count) => `Added ${count} guests`,
        genericError: "Failed to add guests",
      },
      rsvpResponses: {
        heading: "RSVP responses",
        subtitle: "Match each response to someone on your guest list above, if you'd like.",
        guestbookWall: (count) => `Guestbook wall (${count} messages):`,
        hideAll: "Hide all",
        hidingAll: "Hiding all...",
        showAll: "Show all",
        showingAll: "Showing all...",
        searchPlaceholder: "Search responses by name...",
        emptyHeading: "No responses yet",
        emptySubtitle: "They'll show up here as guests RSVP",
        noMatch: (query) => `No responses match "${query}".`,
        attending: "Attending",
        notAttending: "Not attending",
        guestCountSuffix: (count) => `${count} guest(s)`,
        hiddenShow: "Hidden from guestbook - show",
        visibleHide: "Visible in guestbook - hide",
        matchToGuestLabel: "Match to guest",
        unmatchedOption: "- unmatched -",
        delete: "Delete",
        deleting: "Deleting...",
        deleteConfirm: "Delete this RSVP response? This can't be undone.",
        genericError: "Failed to update",
      },
      notifications: {
        emailMeTitle: "📧 Email me new RSVP responses",
        emailMeBody:
          "Get an email the moment a guest responds, with a running total of who's said yes or no so far. You can always check every response above, whether this is on or off.",
        dailyTitle: "🗞️ Daily summary instead",
        dailyBody:
          "One email a day with everything new since the last one, instead of (or alongside) an email per response - easier to skim if you have a lot of guests.",
        genericError: "Couldn't save",
      },
      photos: {
        heading: "Guest photos",
        subtitle: "Guests scan this code to add their own photos - no account needed. You can delete any of them below.",
        printHint: "Print this on a table card, or share the link",
        loading: "Loading...",
        empty: "No photos from guests yet.",
        deleteAria: "Delete photo",
        deletedToast: "Photo deleted.",
      },
      download: {
        pdfButton: "Download printable guest list (PDF)",
        generating: "Generating...",
        csvButton: "Download as spreadsheet (CSV)",
        hint:
          "A flat name/group/RSVP/table sheet - handy for door staff, a caterer, or day-of reference. The CSV opens in Excel, Google Sheets, or Numbers.",
        genericError: "Failed to generate PDF",
        csvHeaders: { name: "Name", group: "Group", status: "RSVP status", partySize: "Party size", table: "Table", notes: "Notes" },
        statusAttending: "Attending",
        statusNotAttending: "Not attending",
        statusAwaiting: "Awaiting response",
        statusNotContacted: "Not contacted",
      },
      banquet: {
        addTable: "Add table",
        adding: "Adding...",
        tableNameLabel: "Table name",
        tableNamePlaceholder: "Table 1",
        errorEnterTableName: "Enter a table name",
        seatsLabel: "Seats",
        optional: "(optional)",
        seatsPlaceholder: "8",
        save: "Save",
        saving: "Saving...",
        cancel: "Cancel",
        genericError: "Failed to save",
        seatsCount: (seated, capacity) => `${seated}/${capacity} seats`,
        removeTableAria: "Remove table",
        removeTableConfirm: "Remove this table? Any assigned guests will become unassigned.",
        noGuestsYet: "No guests yet",
        addGuestsHint: "Add guests to fill this table.",
        chooseGuestOption: "Choose a guest...",
        addGuestButton: "Add guest",
        everyGuestSeated: "Every guest is already seated",
        assignHeading: "Seat guests",
        assignSubtitle: "Assign each guest to a table.",
        overCapacity: (list) => `Over capacity: ${list}`,
        searchPlaceholder: "Search guests...",
        unassignedOnly: "Unassigned only",
        attendingOnly: "Attending only",
        countOf: (filtered, total) => `${filtered} of ${total} guest${total === 1 ? "" : "s"}`,
        chooseTableOption: "Choose a table...",
        assignAll: (count) => `Assign all ${count} unassigned in view`,
        assigning: "Assigning...",
        emptyHeading: "No guests yet",
        emptySubtitle: "Add guests on the Guests tab, then seat them here",
        noMatch: "No guests match your search/filter.",
        unassignedOption: "- unassigned -",
      },
      supportCard: {
        heading: "✨ A few things worth knowing",
        bulletPdf: "Everything here downloads as an unlimited PDF - nothing is locked behind a paywall while you're still deciding.",
        bulletNoAccount: "Guests just open your link and answer - no account, no app, nothing to install on their end.",
        bulletNoWaiting: "Your site and RSVPs update the moment you hit save - no waiting on anyone to approve or process anything.",
        bulletContact: "Found a bug, or just have a question? Reach out - a real person reads every message.",
        questionsCaption: "Questions? We're here.",
      },
    },
    plan: {
      heading: "Get your link",
      subtitle: "Your site is designed - this is the last step before it's really yours.",
      designFreeBadge: "Designing your site is free, always - you only pay if you want this exact link live.",
      checkoutSuccess: "Payment received - your plan will update in a moment.",
      checkoutCancelled: "Checkout cancelled - nothing was charged.",
      alreadyOnPlan: (planName) => `You're on ${planName} - your link is ready.`,
      alreadyOnPlanBodyBefore: "No badge, no locked modules. Hit ",
      alreadyOnPlanBodyAfter: " at the top of any page, or claim a custom address from the Site tab.",
      finishedResultSuffix: "- the finished result",
      getYourLink: (priceEur) => `Get your link - €${priceEur}`,
      redirecting: "Redirecting…",
      processedByStripe: "Processed securely by Stripe",
      orPublishFreeInstead: (badgeName) => `Or publish free instead, with a "${badgeName}" badge`,
      freeWarningHeading: "This is what guests will actually see on Free",
      guestViewLabel: "Guest view",
      madeWithInvimboBadge: "Made with Invimbo",
      badgePermanentWarning: "That badge sits on every page, for every guest, permanently - it isn't removable on Free.",
      freeModulesLockedBullet: "Countdown, gift wishes & dress-code modules locked",
      publishFreeInstead: "Publish free instead",
      printingHeading: "Printing invitations or table cards?",
      premiumDescription: (priceEur) => `(€${priceEur}) removes the watermark from your paper set - doesn't change the link itself.`,
      youreOnPremium: "You're on Premium",
      upgradeButton: (priceEur) => `Upgrade - €${priceEur}`,
      checkEmailTitle: "Check your email",
      checkEmailBodyBefore: "Confirm your address, then come back and click ",
      checkEmailBodyAfter: " again - everything you've designed is already saved.",
      gotIt: "Got it",
      oneLastStepTitle: "One last step - save your work",
      oneLastStepBody:
        "You designed this without an account. Create a free one now so your purchase (and everything you've made) is tied to you, not a browser session that can disappear.",
      createAccountButton: "Create account & continue to payment",
      creatingAccount: "Creating account…",
      notNow: "Not now",
    },
  },
};
