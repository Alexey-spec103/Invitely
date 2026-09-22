import type { Dictionary } from "./en";

/** Polish noun plurals depend on the count itself, not just singular/plural
 * (1 gość, 2-4 goście, 5+/11-14 gości) -- a single fixed word would read as
 * a grammar error to a native speaker for most counts. */
function guestWordPl(count: number): string {
  if (count === 1) return "gość";
  const lastDigit = count % 10;
  const lastTwo = count % 100;
  if (lastDigit >= 2 && lastDigit <= 4 && !(lastTwo >= 12 && lastTwo <= 14)) return "goście";
  return "gości";
}

export const pl: Dictionary = {
  siteHeader: {
    menu: "Menu",
    share: "Udostępnij",
    addToCalendar: "Dodaj do kalendarza",
    copyLink: "Kopiuj link",
    linkCopied: "Link skopiowany!",
    playMusic: "Odtwórz muzykę",
    pauseMusic: "Wstrzymaj muzykę",
    shareText: (eventTitle) => (eventTitle ? `Jesteś zaproszony/a: ${eventTitle}` : "Jesteś zaproszony/a!"),
  },
  envelopeReveal: {
    tapToOpen: "Dotknij, aby otworzyć",
    invitationFor: (guestName) => `Zaproszenie dla ${guestName}`,
    openInvitation: (coupleLabel) => `Otwórz swoje zaproszenie${coupleLabel ? ` od ${coupleLabel}` : ""}`,
  },
  rsvp: {
    yourName: "Imię i nazwisko",
    willYouJoin: "Czy będziesz z nami?",
    accepts: "Z radością potwierdza",
    declines: "Z żalem odmawia",
    numberOfGuests: "Liczba gości (łącznie z Tobą)",
    upToGuestsTotal: (count) => `Maksymalnie ${count} ${guestWordPl(count)} łącznie z Tobą.`,
    whoElseIsComing: "Kto jeszcze przyjdzie?",
    optional: "(opcjonalnie)",
    guestNamePlaceholder: (index) => `Imię gościa ${index}`,
    allergiesOrDietary: "Alergie lub wymagania dietetyczne",
    message: "Wiadomość",
    selectPlaceholder: "Wybierz...",
    sendRsvp: "Wyślij potwierdzenie",
    sending: "Wysyłanie...",
    missingFieldsError: "Podaj swoje imię i daj nam znać, czy będziesz mógł/mogła przyjść.",
    genericError: "Coś poszło nie tak",
    successAttending: "Jesteś na liście! Nie możemy się doczekać wspólnego świętowania. \u{1F389}",
    successDeclining: "Dziękujemy za odpowiedź — będzie nam Cię brakować!",
    notPublishedError: "Ta strona nie została jeszcze opublikowana, więc potwierdzenia nie mogą być wysyłane. Poproś gospodarza o jej publikację.",
    submitFailedError: "Nie udało się wysłać Twojego potwierdzenia. Spróbuj ponownie za chwilę.",
  },
  languageSwitcher: {
    label: "Język",
  },
};
