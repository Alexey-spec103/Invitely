import type { Dictionary } from "./en";

export const de: Dictionary = {
  siteHeader: {
    menu: "Menü",
    share: "Teilen",
    addToCalendar: "Zum Kalender hinzufügen",
    copyLink: "Link kopieren",
    linkCopied: "Link kopiert!",
    playMusic: "Musik abspielen",
    pauseMusic: "Musik pausieren",
    shareText: (eventTitle) => (eventTitle ? `Du bist eingeladen: ${eventTitle}` : "Du bist eingeladen!"),
  },
  envelopeReveal: {
    tapToOpen: "Zum Öffnen tippen",
    invitationFor: (guestName) => `Eine Einladung für ${guestName}`,
    openInvitation: (coupleLabel) => `Öffne deine Einladung${coupleLabel ? ` von ${coupleLabel}` : ""}`,
  },
  rsvp: {
    yourName: "Dein Name",
    willYouJoin: "Wirst du dabei sein?",
    accepts: "Nimmt freudig an",
    declines: "Sagt bedauernd ab",
    numberOfGuests: "Anzahl der Gäste (dich eingeschlossen)",
    upToGuestsTotal: (count) => `Bis zu ${count} ${count === 1 ? "Gast" : "Gäste"} insgesamt, dich eingeschlossen.`,
    whoElseIsComing: "Wer kommt noch mit?",
    optional: "(optional)",
    guestNamePlaceholder: (index) => `Name von Gast ${index}`,
    allergiesOrDietary: "Allergien oder besondere Ernährungswünsche",
    message: "Nachricht",
    selectPlaceholder: "Auswählen...",
    sendRsvp: "Zusage senden",
    sending: "Wird gesendet...",
    missingFieldsError: "Bitte gib deinen Namen ein und lass uns wissen, ob du kommen kannst.",
    genericError: "Etwas ist schiefgelaufen",
    successAttending: "Du stehst auf der Liste! Wir können es kaum erwarten, mit dir zu feiern. \u{1F389}",
    successDeclining: "Danke für die Rückmeldung — du wirst uns fehlen!",
    notPublishedError: "Diese Seite ist noch nicht veröffentlicht, daher können keine Zusagen gesendet werden. Bitte den Gastgeber, sie zu veröffentlichen.",
    submitFailedError: "Deine Zusage konnte nicht gesendet werden. Bitte versuche es in einem Moment erneut.",
  },
  languageSwitcher: {
    label: "Sprache",
  },
};
