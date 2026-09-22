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
};
