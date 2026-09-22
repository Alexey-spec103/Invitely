import type { Dictionary } from "./en";

export const fr: Dictionary = {
  siteHeader: {
    menu: "Menu",
    share: "Partager",
    addToCalendar: "Ajouter au calendrier",
    copyLink: "Copier le lien",
    linkCopied: "Lien copié !",
    playMusic: "Lancer la musique",
    pauseMusic: "Mettre la musique en pause",
    shareText: (eventTitle) => (eventTitle ? `Vous êtes invité(e) : ${eventTitle}` : "Vous êtes invité(e) !"),
  },
  envelopeReveal: {
    tapToOpen: "Toucher pour ouvrir",
    invitationFor: (guestName) => `Une invitation pour ${guestName}`,
    openInvitation: (coupleLabel) => `Ouvrez votre invitation${coupleLabel ? ` de ${coupleLabel}` : ""}`,
  },
  rsvp: {
    yourName: "Votre nom",
    willYouJoin: "Serez-vous des nôtres ?",
    accepts: "Accepte avec joie",
    declines: "Décline avec regret",
    numberOfGuests: "Nombre d'invités (vous inclus)",
    upToGuestsTotal: (count) => `Jusqu'à ${count} ${count === 1 ? "invité" : "invités"} au total, vous inclus.`,
    whoElseIsComing: "Qui d'autre vient ?",
    optional: "(facultatif)",
    guestNamePlaceholder: (index) => `Nom de l'invité ${index}`,
    allergiesOrDietary: "Allergies ou régime alimentaire particulier",
    message: "Message",
    selectPlaceholder: "Sélectionner...",
    sendRsvp: "Envoyer ma réponse",
    sending: "Envoi en cours...",
    missingFieldsError: "Merci de renseigner votre nom et de nous indiquer si vous pourrez venir.",
    genericError: "Une erreur est survenue",
    successAttending: "Vous êtes sur la liste ! Nous avons hâte de célébrer avec vous. \u{1F389}",
    successDeclining: "Merci de nous avoir prévenus — vous nous manquerez !",
    notPublishedError: "Ce site n'est pas encore publié, les réponses ne peuvent pas être envoyées. Demandez à votre hôte de le publier.",
    submitFailedError: "Nous n'avons pas pu envoyer votre réponse. Veuillez réessayer dans un instant.",
  },
  languageSwitcher: {
    label: "Langue",
  },
};
