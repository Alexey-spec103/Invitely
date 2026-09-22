import type { Dictionary } from "./en";

export const it: Dictionary = {
  siteHeader: {
    menu: "Menu",
    share: "Condividi",
    addToCalendar: "Aggiungi al calendario",
    copyLink: "Copia link",
    linkCopied: "Link copiato!",
    playMusic: "Riproduci musica",
    pauseMusic: "Metti in pausa la musica",
    shareText: (eventTitle) => (eventTitle ? `Sei invitato/a: ${eventTitle}` : "Sei invitato/a!"),
  },
  envelopeReveal: {
    tapToOpen: "Tocca per aprire",
    invitationFor: (guestName) => `Un invito per ${guestName}`,
    openInvitation: (coupleLabel) => `Apri il tuo invito${coupleLabel ? ` da ${coupleLabel}` : ""}`,
  },
  rsvp: {
    yourName: "Il tuo nome",
    willYouJoin: "Ci sarai?",
    accepts: "Accetta con gioia",
    declines: "Declina con rammarico",
    numberOfGuests: "Numero di ospiti (te incluso/a)",
    upToGuestsTotal: (count) => `Fino a ${count} ${count === 1 ? "ospite" : "ospiti"} in totale, te incluso/a.`,
    whoElseIsComing: "Chi altro viene?",
    optional: "(facoltativo)",
    guestNamePlaceholder: (index) => `Nome ospite ${index}`,
    allergiesOrDietary: "Allergie o esigenze alimentari",
    message: "Messaggio",
    selectPlaceholder: "Seleziona...",
    sendRsvp: "Invia conferma",
    sending: "Invio in corso...",
    missingFieldsError: "Inserisci il tuo nome e facci sapere se potrai venire.",
    genericError: "Qualcosa è andato storto",
    successAttending: "Sei sulla lista! Non vediamo l'ora di festeggiare con te. \u{1F389}",
    successDeclining: "Grazie per averci avvisato — ci mancherai!",
    notPublishedError: "Questo sito non è ancora pubblicato, quindi non è possibile inviare conferme. Chiedi al tuo host di pubblicarlo.",
    submitFailedError: "Non siamo riusciti a inviare la tua conferma. Riprova tra un momento.",
  },
  languageSwitcher: {
    label: "Lingua",
  },
};
