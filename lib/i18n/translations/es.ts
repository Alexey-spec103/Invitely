import type { Dictionary } from "./en";

export const es: Dictionary = {
  siteHeader: {
    menu: "Menú",
    share: "Compartir",
    addToCalendar: "Añadir al calendario",
    copyLink: "Copiar enlace",
    linkCopied: "¡Enlace copiado!",
    playMusic: "Reproducir música",
    pauseMusic: "Pausar música",
    shareText: (eventTitle) => (eventTitle ? `Estás invitado/a: ${eventTitle}` : "¡Estás invitado/a!"),
  },
  envelopeReveal: {
    tapToOpen: "Toca para abrir",
    invitationFor: (guestName) => `Una invitación para ${guestName}`,
    openInvitation: (coupleLabel) => `Abre tu invitación${coupleLabel ? ` de ${coupleLabel}` : ""}`,
  },
  rsvp: {
    yourName: "Tu nombre",
    willYouJoin: "¿Nos acompañarás?",
    accepts: "Acepta con alegría",
    declines: "Declina con pesar",
    numberOfGuests: "Número de invitados (incluyéndote)",
    upToGuestsTotal: (count) => `Hasta ${count} ${count === 1 ? "invitado" : "invitados"} en total, incluyéndote.`,
    whoElseIsComing: "¿Quién más viene?",
    optional: "(opcional)",
    guestNamePlaceholder: (index) => `Nombre del invitado ${index}`,
    allergiesOrDietary: "Alergias o necesidades dietéticas",
    message: "Mensaje",
    selectPlaceholder: "Seleccionar...",
    sendRsvp: "Enviar confirmación",
    sending: "Enviando...",
    missingFieldsError: "Por favor, indica tu nombre y confírmanos si podrás venir.",
    genericError: "Algo salió mal",
    successAttending: "¡Ya estás en la lista! No podemos esperar a celebrar contigo. \u{1F389}",
    successDeclining: "Gracias por avisarnos — ¡te vamos a extrañar!",
    notPublishedError: "Este sitio aún no está publicado, así que no se pueden enviar confirmaciones. Pídele a tu anfitrión que lo publique.",
    submitFailedError: "No pudimos enviar tu confirmación. Por favor, inténtalo de nuevo en un momento.",
  },
  languageSwitcher: {
    label: "Idioma",
  },
};
