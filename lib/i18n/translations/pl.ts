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
  countdown: {
    weeks: "Tygodnie",
    days: "Dni",
    hours: "Godziny",
    minutes: "Minuty",
    seconds: "Sekundy",
    daysAbbr: "dni",
    hoursAbbr: "godz",
    minutesAbbr: "min",
    secondsAbbr: "sek",
    reachedToday: "Dziś jest ten dzień!",
    reachedPast: "Dziękujemy, że świętowaliście z nami!",
  },
  gift: {
    viewLink: "Zobacz",
  },
  guestbook: {
    empty: "Tutaj pojawią się wiadomości od gości.",
  },
  video: {
    iframeTitleFallback: "Wideo",
  },
  letter: {
    confirmBy: (date) => `Prosimy o potwierdzenie do ${date}`,
  },
  map: {
    mapTitle: (venueName) => `Mapa: ${venueName}`,
  },
  banquetNavigator: {
    yourName: "Twoje imię i nazwisko",
    findMyTable: "Znajdź mój stolik",
    looking: "Szukanie...",
    missingNameError: "Wpisz imię i nazwisko, na które wysłano zaproszenie.",
    lookupFailedError: "Coś poszło nie tak. Spróbuj ponownie za chwilę.",
    seatedAt: (tableName) => `Twoje miejsce jest przy stoliku ${tableName}`,
    resultSeatedAt: (guestName, tableName) => `${guestName} siedzi przy stoliku ${tableName}`,
    resultNotFound: (guestName) => `Nie znaleźliśmy stolika dla „${guestName}" — zapytaj organizatorów.`,
  },
  landing: {
    topBar: "Akceptujemy Visa / Mastercard / PayPal · Natychmiastowa dostawa — wyślij link z zaproszeniem w dowolne miejsce na świecie",
    nav: { constructor: "Kreator", themes: "Motywy", whatsIncluded: "Co zawiera", pricing: "Cennik", login: "Zaloguj się" },
    mobileNav: { openMenu: "Otwórz menu", closeMenu: "Zamknij menu" },
    cta: {
      primary: "Stwórz swoje zaproszenia",
      primaryLoggedIn: "Przejdź do panelu",
      constructor: "Zacznij tworzyć",
      constructorLoggedIn: "Przejdź do panelu",
      final: "Stwórz swoją stronę",
    },
    hero: {
      eyebrow: "Platforma eventowa, nie tylko zaproszenie",
      headline: "Twoje wydarzenie, dokładnie takie, jak sobie wymarzyłeś",
      accent: "z efektem wow",
      subtext:
        "Piękna strona wydarzenia, pasujące zaproszenia papierowe i rozmieszczenie gości — jeden styl, wszędzie tam, gdzie widzą go twoi goście. Zacznij od motywu zaprojektowanego przez naszych grafików albo stwórz własny od pustej kartki.",
      checklistThemes: (themeCount) => `${themeCount} motywów od projektantów — lub stwórz własny od pustej kartki`,
      checklistFonts: (fontCount) => `Przesuwaj wszystko, ${fontCount}+ czcionek, dowolny kolor, jaki lubisz`,
      checklistRsvp: "Śledzenie potwierdzeń z własnymi pytaniami",
      checklistPaper: "Spersonalizowane zaproszenia papierowe z kodami QR",
      seeConstructor: "Zobacz kreator →",
    },
    heroPhoneShowcase: {
      topCaption: "Panny młode 2027, to was zachwyci \u{1F97A}\u{1F48D}",
      bottomCaption: "Zaproszenia, które wasi znajomi zrobią zrzut ekranu",
    },
    statBar: { themes: "motywów od projektantów", fonts: "czcionek w kreatorze", modules: "modułów strony", oneLink: "link do wszystkiego" },
    platformFan: {
      heading: "Platforma ślubna, nie tylko zaproszenie",
      subtext: "Od strony z zaproszeniem i komunikacji z gośćmi po w pełni zaprojektowane wesele — z kartami na stół włącznie.",
    },
    eventTypes: {
      eyebrow: "Nie tylko wesela",
      heading: "Każda uroczystość ma swoją własną stronę",
      subtext:
        "Najpierw wybierz typ wydarzenia, a wszystko inne — treści, pola, nawet nazwa narzędzia do rozmieszczenia gości — dopasowuje się do niego.",
      cta: "Wybierz typ wydarzenia",
      items: [
        { label: "Wesele", blurb: "Wydarzenie, wokół którego powstała cała ta platforma." },
        { label: "Urodziny", blurb: "Odliczanie, zdjęcia i lista prezentów bez niezręczności." },
        { label: "Wydarzenie firmowe", blurb: "Udostępnij agendę, uzyskaj realną liczbę osób dla cateringu." },
        { label: "Zakończenie studiów", blurb: "Szczegóły ceremonii i przyjęcia, jeden link." },
        { label: "Rocznica", blurb: "Bez względu na to, ile lat minęło, wciąż warto mieć porządną stronę." },
        { label: "Baby shower", blurb: "Linki do listy prezentów i księga gości pełna życzeń." },
        { label: "Quinceañera", blurb: "Dwór honorowy, dress code i program tańców." },
        { label: "Emerytura", blurb: "Toast za karierę, nie tylko podanie tortu." },
        { label: "Impreza dla dzieci", blurb: "Zabawne motywy, potwierdzenia, które rodzice faktycznie wypełniają." },
        { label: "Impreza świąteczna", blurb: "Szczegóły imprezy biurowej, dress code w komplecie." },
        { label: "Zaręczyny", blurb: "Podziel się nowiną, stronę weselną zostaw na później." },
        { label: "Coś innego", blurb: "Cokolwiek to jest, zaczyna się tak samo: wybierz motyw." },
      ],
    },
    constructorSection: {
      eyebrow: "Prawdziwy kreator",
      heading: "Nie tylko wybór motywu — cała kartka",
      subtext: (fontCount) =>
        `Wybierz motyw od projektanta, by szybko zacząć, a potem przesuwaj wszystko: przeciągaj tekst i zdjęcia w dowolne miejsce na stronie, wybierz spośród ${fontCount}+ czcionek, dowolny kolor, układaj elementy warstwami i cofaj zmiany, jeśli zmienisz zdanie. Dokładnie ten sam projekt przenosi się też na drukowane zaproszenia.`,
      features: [
        { title: "Wyselekcjonowane czcionki", description: "Skrypt, szeryfowa, gruba lub cienka — zmień cały wygląd jednym kliknięciem." },
        { title: "Dowolny kolor, jaki lubisz", description: "Stwórz własną paletę dopasowaną dokładnie do kolorów twojego wesela." },
        { title: "Warianty wybrane przez projektantów", description: "Albo zacznij od kombinacji kolorów i wzorów, wybranych ręcznie przez naszych projektantów." },
        { title: "Elastyczny tekst, wszędzie", description: "Edytuj, zmieniaj rozmiar, dodawaj i przesuwaj dowolny tekst w wybranym projekcie." },
        { title: "Dodatki papierowe i karty bankietowe", description: "Zaprojektuj przód i tył zaproszenia, plus pasujące karty bankietowe." },
        { title: "Włączaj i wyłączaj moduły strony", description: "Włącz lub wyłącz odliczanie, harmonogram, RSVP, mapę i więcej, dla każdej strony osobno." },
      ],
    },
    howItWorksSection: {
      heading: "Jak działa kreator",
      subtext: "Wszystko poniżej dzieje się na żywo, prosto w twojej przeglądarce — bez pobierania, bez uczenia się czegokolwiek.",
      steps: [
        {
          title: "Dostosuj swój projekt",
          bullets: [
            "Wybierz spośród 100 motywów od projektantów lub zacznij od pustej kartki",
            "Każdy motyw jest już w pełni dopasowany kolorystycznie, gotowy do użycia",
            "Zmieniaj styl w dowolnym momencie — twoja treść zostaje zachowana",
          ],
        },
        {
          title: "Edytuj dowolny tekst, jak chcesz",
          bullets: [
            "Wybierz spośród 149+ czcionek, każda pokazana w podglądzie we własnym kroju",
            "Zmień kolor, rozmiar, odstępy i wyrównanie",
            "Kliknij dowolny tekst na kartce, by edytować go od razu",
          ],
        },
        {
          title: "Dodaj zdjęcia, wideo i więcej",
          bullets: [
            "Prześlij własne zdjęcia w dowolne miejsce projektu",
            "Dodaj klip wideo, by ożywić waszą historię",
            "Wstaw kod QR prowadzący do twojej strony lub zaproszenia konkretnego gościa",
          ],
        },
        {
          title: "Włączaj i wyłączaj moduły",
          bullets: [
            "Odliczanie, RSVP, życzenia prezentowe, dress code i więcej",
            "Każdy ma własny przełącznik",
            "Pokazuj gościom tylko to, co dotyczy twojego wydarzenia",
          ],
        },
      ],
    },
    guestTracking: {
      eyebrow: "Więcej niż zaproszenie",
      heading: "Wyślij gdziekolwiek, śledź każdą odpowiedź",
      subtext:
        "Udostępnij swój jeden link przez WhatsApp, SMS, e-mail lub tam, gdzie twoi goście naprawdę sprawdzają wiadomości. Każde potwierdzenie trafia prosto do twojej listy gości — kto przyjdzie, kto jeszcze nie odpowiedział i kogo wciąż musisz zaprosić.",
    },
    siteOrPaper: {
      heading: "Zaproszenie na stronie i/lub papierowe",
      subtext: "To nie jest wybór jednego albo drugiego — większość par korzysta z obu.",
      orBadge: "I/LUB",
      website: {
        title: "Zaproszenie na stronie",
        subtext: "Proste i szybkie — zaproś każdego gościa, gdziekolwiek mieszka.",
        bullets: [
          "Jeden link działa na dowolnym telefonie, tablecie czy laptopie",
          "Aktualizuj cokolwiek — wszyscy od razu widzą najnowszą wersję",
        ],
      },
      paper: {
        title: "Zaproszenia papierowe",
        subtext: "Pamiątka dla najbliższej rodziny i przyjaciół.",
        bullets: [
          "Gotowe do druku zaproszenia PDF, koperty i karty programu",
          "Każdy gość dostaje osobisty kod QR — jego potwierdzenie dopasowuje się automatycznie",
        ],
      },
    },
    themesSection: {
      heading: "Wybierz swój styl",
      subtext:
        "Ten sam motyw przenosi się na twoją stronę, zaproszenia papierowe i karty bankietowe — albo pomiń to całkowicie i projektuj od zera w kreatorze.",
    },
    whatsIncluded: {
      heading: "Co jest w zestawie",
      subtext: "Każda strona zawiera te elementy — łącz je, by opowiedzieć swoją historię.",
      modules: [
        { title: "Kreator przeciągnij i upuść", description: "Przesuwaj dowolny tekst lub zdjęcie, wybierz czcionkę lub kolor, i cofaj/przywracaj zmiany na bieżąco." },
        { title: "Sekcja główna", description: "Wasze imiona, data wydarzenia i zdjęcie — kilka układów do wyboru." },
        { title: "List do gości", description: "Osobista wiadomość, życzenia prezentowe i termin potwierdzenia w jednej karcie." },
        { title: "Harmonogram wydarzenia", description: "Rozpisz dzień minuta po minucie — od pierwszego toastu po ostatni taniec." },
        { title: "Miejsce i mapa", description: "Pokaż gościom dokładnie, dokąd iść, dzięki interaktywnej mapie." },
        { title: "RSVP z własnymi pytaniami", description: "Zapytaj o posiłki, napoje lub transport — goście potwierdzają online, prosto na twoją listę." },
        { title: "Odliczanie czasu", description: "Buduj emocje dzięki odliczaniu na żywo do wielkiego dnia." },
        { title: "Ściana księgi gości", description: "Życzenia zostawione przez gości przy potwierdzeniu, pokazane jako publiczna ściana na twojej stronie." },
        { title: "Wideo", description: "Osadź film z YouTube lub Vimeo — wasze oświadczyny, waszą historię, wasz wybór." },
        { title: "Zaproszenia papierowe", description: "Gotowe do druku zaproszenia PDF, koperty i karty programu, spersonalizowane dla każdego gościa z kodem QR." },
        { title: "Rozmieszczenie na bankiecie", description: "Przydzielaj stoliki — po imieniu i nazwisku, nie tylko liczbowo — i generuj karty stolika i miejsca do druku." },
        { title: "Własna domena", description: "Skieruj swoją domenę na stronę albo zachowaj czytelny link, który dajemy za darmo." },
      ],
    },
    pricing: {
      heading: "Kreator jest zawsze darmowy",
      subtext: "Projektuj stronę, zapraszaj gości i śledź potwierdzenia bez opłat. Płacisz tylko wtedy, gdy chcesz własną domenę, zaproszenia papierowe lub rozmieszczenie na bankiecie.",
      free: "Za darmo",
      whatYouGet: "Co otrzymujesz",
      whatThisAdds: "Co to dodaje",
      badgeFree: "Zawsze za darmo",
      badgePremium: "Usuwa znak wodny",
    },
    finalCta: {
      heading: "Zacznij za darmo",
      subtext: "Karta kredytowa nie jest wymagana. Stwórz stronę i opublikuj ją, gdy będziesz gotowy/a.",
    },
    footer: {
      tagline: "Strony wydarzeń, gotowe w kilka minut.",
      product: "Produkt",
      legalAccount: "Prawne i konto",
      login: "Zaloguj się",
      signUp: "Zarejestruj się",
      terms: "Regulamin",
      privacy: "Polityka prywatności",
      rightsReserved: "© 2026 Invitely. Wszelkie prawa zastrzeżone.",
      paymentAccepted: "Akceptujemy Visa / Mastercard / PayPal",
    },
  },
  onboarding: {
    stepOf: (current, total) => `Krok ${current} z ${total}`,
    back: "Wstecz",
    next: "Dalej",
    createSite: "Stwórz moją stronę",
    saving: "Zapisywanie...",
    saveFailed: "Nie udało się zapisać",
    previewBadge: "Podgląd",
    eventTypeStep: { heading: "\u{1F389} Co świętujecie?", subtext: "To kształtuje kolejne pytania." },
    styleStep: { heading: "\u{1F3A8} Wybierz swój styl", subtext: "Zawsze możesz to zmienić lub zaprojektować własny styl później." },
    photo: { label: "\u{1F4F7} Dodaj zdjęcie (opcjonalnie)", help: "Pojawia się w układach zdjęć na twojej stronie — zawsze możesz je dodać lub zmienić później." },
    validation: {
      pickEventType: "Wybierz typ wydarzenia",
      pickStyle: "Wybierz styl",
      enterName: "Wpisz imię",
      enterDate: "Wpisz datę",
    },
    howItWorks: {
      toggleLabel: "\u{2728} Nowy tutaj? Tak to działa",
      show: "Pokaż",
      hide: "Ukryj",
      steps: [
        { title: "Wybierz styl", text: "Przeglądaj style, aż jeden ci się spodoba — zmieniaj w dowolnym momencie." },
        { title: "Dodaj szczegóły", text: "Imiona, data, zdjęcie, jeśli chcesz. To wszystko." },
        { title: "Udostępnij swoją stronę", text: "Otrzymaj link na żywo, który goście otworzą na telefonie." },
      ],
    },
  },
};
