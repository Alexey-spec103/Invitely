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
  unpublishedPreview: {
    message: "👀 Przeglądasz podgląd tej strony - nie jest jeszcze opublikowana, więc potwierdzenia wysłane tutaj są tylko testem i nie zostaną zapisane.",
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
    successDeclining: "Dziękujemy za odpowiedź - będzie nam Cię brakować!",
    notPublishedError: "Ta strona nie została jeszcze opublikowana, więc potwierdzenia nie mogą być wysyłane. Poproś gospodarza o jej publikację.",
    submitFailedError: "Nie udało się wysłać Twojego potwierdzenia. Spróbuj ponownie za chwilę.",
    oneTapGreeting: (name) => `Będziesz z nami, ${name}?`,
    oneTapAccept: "Będę tam",
    oneTapDecline: "Nie dam rady",
    oneTapMoreDetails: "Dodaj szczegóły (posiłek, goście, wiadomość)",
    alreadyRespondedAttending: (partySize) =>
      `Już potwierdziłeś/aś udział - ${partySize} ${guestWordPl(partySize)}.`,
    alreadyRespondedDeclining: "Już dałeś/aś nam znać, że nie możesz przyjść.",
    editResponseButton: "Edytuj swoją odpowiedź",
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
  travel: {
    bookingLink: "Zarezerwuj",
    promoCodeLabel: "Kod promocyjny",
  },
  guestbook: {
    empty: "Tutaj pojawią się wiadomości od gości.",
  },
  dressCode: {
    eyebrow: "Dress code",
  },
  video: {
    iframeTitleFallback: "Wideo",
  },
  letter: {
    confirmBy: (date) => `Prosimy o potwierdzenie do ${date}`,
  },
  map: {
    mapTitle: (venueName) => `Mapa: ${venueName}`,
    mapPlaceholder: "Dodaj adres, aby zobaczyć podgląd mapy",
  },
  guestPhotos: {
    heading: "Dodaj swoje zdjęcia",
    subtitle: (eventTitle) => `Podziel się zdjęciami z ${eventTitle} - konto nie jest potrzebne.`,
    addPhotosButton: "Dodaj zdjęcia",
    uploading: "Przesyłanie...",
    uploaded: "Dodano! Dziękujemy.",
    genericError: "Nie udało się przesłać tego zdjęcia. Spróbuj ponownie.",
    notPublished: "Ta strona nie została jeszcze opublikowana, więc zdjęć nie można dodać. Poproś organizatora o publikację.",
  },
  banquetNavigator: {
    yourName: "Twoje imię i nazwisko",
    findMyTable: "Znajdź mój stolik",
    looking: "Szukanie...",
    missingNameError: "Wpisz imię i nazwisko, na które wysłano zaproszenie.",
    lookupFailedError: "Coś poszło nie tak. Spróbuj ponownie za chwilę.",
    seatedAt: (tableName) => `Twoje miejsce jest przy stoliku ${tableName}`,
    resultSeatedAt: (guestName, tableName) => `${guestName} siedzi przy stoliku ${tableName}`,
    resultNotFound: (guestName) => `Nie znaleźliśmy „${guestName}" na liście gości - sprawdź pisownię lub zapytaj organizatora.`,
    resultNotSeatedYet: (guestName) =>
      `Cześć ${guestName} - jesteś na liście! Rozsadzenie gości jest jeszcze ustalane, sprawdź ponownie wkrótce.`,
    resultNotAttending: (guestName) =>
      `Wygląda na to, że ${guestName} zaznaczył(a) brak obecności - jeśli to pomyłka, skontaktuj się z organizatorem.`,
  },
  landing: {
    skipToContent: "Przejdź do treści",
    topBar: "Akceptujemy Visa / Mastercard · Natychmiastowa dostawa - wyślij link z zaproszeniem w dowolne miejsce na świecie",
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
      accent: "aż po ostatnią winietkę",
      subtext:
        "Piękna strona wydarzenia, pasujące zaproszenia papierowe i rozmieszczenie gości - jeden styl, wszędzie tam, gdzie widzą go twoi goście. Zacznij od motywu zaprojektowanego przez naszych grafików albo stwórz własny od pustej kartki.",
      checklistFree: "Projektowanie jest darmowe - płacisz tylko, jeśli chcesz tę publikację na żywo",
      checklistThemes: (themeCount) => `${themeCount} motywów od projektantów - lub stwórz własny od pustej kartki`,
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
      subtext: "Od strony z zaproszeniem i komunikacji z gośćmi po w pełni zaprojektowane wesele - z kartami na stół włącznie.",
    },
    eventTypes: {
      eyebrow: "Nie tylko wesela",
      heading: "Każda uroczystość ma swoją własną stronę",
      subtext:
        "Najpierw wybierz typ wydarzenia, a wszystko inne - treści, pola, nawet nazwa narzędzia do rozmieszczenia gości - dopasowuje się do niego.",
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
      heading: "Nie tylko wybór motywu - cała kartka",
      subtext: (fontCount) =>
        `Wybierz motyw od projektanta, by szybko zacząć, a potem przesuwaj wszystko: przeciągaj tekst i zdjęcia w dowolne miejsce na stronie, wybierz spośród ${fontCount}+ czcionek, dowolny kolor, układaj elementy warstwami i cofaj zmiany, jeśli zmienisz zdanie. Dokładnie ten sam projekt przenosi się też na drukowane zaproszenia.`,
      features: [
        { title: "Wyselekcjonowane czcionki", description: "Skrypt, szeryfowa, gruba lub cienka - zmień cały wygląd jednym kliknięciem." },
        { title: "Dowolny kolor, jaki lubisz", description: "Stwórz własną paletę dopasowaną dokładnie do kolorów twojego wesela." },
        { title: "Warianty wybrane przez projektantów", description: "Albo zacznij od kombinacji kolorów i wzorów, wybranych ręcznie przez naszych projektantów." },
        { title: "Elastyczny tekst, wszędzie", description: "Edytuj, zmieniaj rozmiar, dodawaj i przesuwaj dowolny tekst w wybranym projekcie." },
        { title: "Dodatki papierowe i karty bankietowe", description: "Zaprojektuj przód i tył zaproszenia, plus pasujące karty bankietowe." },
        { title: "Włączaj i wyłączaj moduły strony", description: "Włącz lub wyłącz odliczanie, harmonogram, RSVP, mapę i więcej, dla każdej strony osobno." },
      ],
    },
    howItWorksSection: {
      heading: "Jak działa kreator",
      subtext: "Wszystko poniżej dzieje się na żywo, prosto w twojej przeglądarce - bez pobierania, bez uczenia się czegokolwiek.",
      steps: [
        {
          title: "Wybierz swój styl",
          bullets: [
            "Wybierz spośród 100 motywów od projektantów lub zacznij od pustej kartki",
            "Każdy motyw jest już w pełni dopasowany kolorystycznie, gotowy do użycia",
            "Zmieniaj styl w dowolnym momencie - twoja treść zostaje zachowana",
          ],
        },
        {
          title: "Podaj dane swojego wydarzenia",
          bullets: [
            "Imiona, data, miejsce - wpisz raz",
            "Przenosi się na twoją stronę, zaproszenia i karty bankietowe",
            "Edytuj to w dowolnym momencie, przed publikacją lub po niej",
          ],
        },
        {
          title: "Włącz moduły, których potrzebujesz",
          bullets: [
            "Odliczanie, RSVP, życzenia prezentowe, dress code i więcej",
            "Każdy ma własny przełącznik",
            "Pokazuj gościom tylko to, co dotyczy twojego wydarzenia",
          ],
        },
        {
          title: "Odbierz swój link i papiery PDF",
          bullets: [
            "Jeden link, aktywny od razu - udostępnij go tam, gdzie twoi goście naprawdę sprawdzają wiadomości",
            "Gotowe do druku zaproszenia PDF, koperty i karty bankietowe",
            "Aktualizuj cokolwiek później - wszyscy widzą najnowszą wersję",
          ],
        },
      ],
    },
    guestTracking: {
      eyebrow: "Więcej niż zaproszenie",
      heading: "Wyślij gdziekolwiek, śledź każdą odpowiedź",
      subtext:
        "Udostępnij swój jeden link przez WhatsApp, SMS, e-mail lub tam, gdzie twoi goście naprawdę sprawdzają wiadomości. Każde potwierdzenie trafia prosto do twojej listy gości - kto przyjdzie, kto jeszcze nie odpowiedział i kogo wciąż musisz zaprosić. Żeby odpowiedzieć, goście nie potrzebują konta ani aplikacji - wystarczy link.",
    },
    siteOrPaper: {
      heading: "Zaproszenie na stronie i/lub papierowe",
      subtext: "To nie jest wybór jednego albo drugiego - większość par korzysta z obu.",
      orBadge: "I/LUB",
      website: {
        title: "Zaproszenie na stronie",
        subtext: "Proste i szybkie - zaproś każdego gościa, gdziekolwiek mieszka.",
        bullets: [
          "Jeden link działa na dowolnym telefonie, tablecie czy laptopie",
          "Aktualizuj cokolwiek - wszyscy od razu widzą najnowszą wersję",
        ],
      },
      paper: {
        title: "Zaproszenia papierowe",
        subtext: "Pamiątka dla najbliższej rodziny i przyjaciół.",
        bullets: [
          "Gotowe do druku zaproszenia PDF, koperty i karty programu",
          "Każdy gość dostaje osobisty kod QR - jego potwierdzenie dopasowuje się automatycznie",
        ],
      },
    },
    themesSection: {
      heading: "Wybierz swój styl",
      subtext:
        "Ten sam motyw przenosi się na twoją stronę, zaproszenia papierowe i karty bankietowe - albo pomiń to całkowicie i projektuj od zera w kreatorze.",
    },
    whatsIncluded: {
      heading: "Co jest w zestawie",
      subtext: "Każda strona zawiera te elementy - łącz je, by opowiedzieć swoją historię.",
      modules: [
        { title: "Kreator przeciągnij i upuść", description: "Przesuwaj dowolny tekst lub zdjęcie, wybierz czcionkę lub kolor, i cofaj/przywracaj zmiany na bieżąco." },
        { title: "Sekcja główna", description: "Wasze imiona, data wydarzenia i zdjęcie - kilka układów do wyboru." },
        { title: "List do gości", description: "Osobista wiadomość, życzenia prezentowe i termin potwierdzenia w jednej karcie." },
        { title: "Harmonogram wydarzenia", description: "Rozpisz dzień minuta po minucie - od pierwszego toastu po ostatni taniec." },
        { title: "Miejsce i mapa", description: "Pokaż gościom dokładnie, dokąd iść, dzięki interaktywnej mapie." },
        { title: "RSVP z własnymi pytaniami", description: "Zapytaj o posiłki, napoje lub transport - goście potwierdzają online, prosto na twoją listę." },
        { title: "Odliczanie czasu", description: "Buduj emocje dzięki odliczaniu na żywo do wielkiego dnia." },
        { title: "Ściana księgi gości", description: "Życzenia zostawione przez gości przy potwierdzeniu, pokazane jako publiczna ściana na twojej stronie." },
        { title: "Wideo", description: "Osadź film z YouTube lub Vimeo - wasze oświadczyny, waszą historię, wasz wybór." },
        { title: "Zaproszenia papierowe", description: "Gotowe do druku zaproszenia PDF, koperty i karty programu, spersonalizowane dla każdego gościa z kodem QR." },
        { title: "Rozmieszczenie na bankiecie", description: "Przydzielaj stoliki - po imieniu i nazwisku, nie tylko liczbowo - i generuj karty stolika i miejsca do druku." },
        { title: "Własna domena", description: "Skieruj swoją domenę na stronę albo zachowaj czytelny link, który dajemy za darmo." },
        { title: "FAQ dla gości", description: "Odpowiedz na pytania, które pojawiają się wciąż od nowa - parking, osoby towarzyszące, godziny - prosto na swojej stronie." },
        { title: "Podróż i nocleg", description: "Poleć hotele z kodami rabatowymi i linkami do rezerwacji, żeby goście z daleka wiedzieli, gdzie się zatrzymać." },
      ],
    },
    pricing: {
      heading: "Kreator jest zawsze darmowy",
      subtext: "Projektuj stronę, zapraszaj gości i śledź potwierdzenia bez opłat - opublikuj ją na żywo, kiedy będziesz gotowy. Płacisz, gdy chcesz własny adres bez odznaki Invimbo, albo zaproszenia papierowe bez znaku wodnego.",
      free: "Za darmo",
      whatYouGet: "Co otrzymujesz",
      whatThisAdds: "Co to dodaje",
      badgeFree: "Zawsze za darmo",
      badgePremium: "Usuwa znak wodny",
      freeCaveat: "Na Twojej stronie na żywo pojawia się mała odznaka „Made with Invimbo”, a na wydrukach - znak wodny.",
      oneTime: "Płatność jednorazowa, nie subskrypcja",
      exampleCaption: "Prawdziwy projekt Invimbo - Twój może wyglądać podobnie.",
      valueAnchor: "Drukowane, wysyłane pocztą zaproszenia zwykle kosztują więcej za gościa. Tu jedna stała opłata obejmuje całą Twoją listę gości, niezależnie od liczby osób.",
    },
    faq: {
      heading: "Pytania przed startem",
      items: [
        {
          question: "Czy muszę umieć projektować albo programować?",
          answer:
            "Nie. Wybierz motyw od projektanta - czcionki, kolory, układ są już gotowe. Kliknij dowolny tekst na żywej stronie, by go edytować; nic do nauki, nic do instalacji.",
        },
        {
          question: "Czy to naprawdę darmowe, czy jest haczyk?",
          answer:
            "Sam konstruktor jest darmowy bez limitu czasu - projektuj całą stronę, zapraszaj gości i śledź RSVP bez opłat. Jedyny kompromis w planie darmowym to mały znaczek \"Made with Invimbo\" na żywej stronie i znak wodny na drukowanym papierze - pokazane od razu, nie po tym, jak coś już zbudujesz.",
        },
        {
          question: "Czy to subskrypcja?",
          answer: "Nie. Każdy płatny plan to jedna stała opłata, nie cykliczna płatność.",
        },
        {
          question: "Czy moi goście potrzebują konta albo aplikacji?",
          answer: "Nie. Otwierają Twój link, widzą stronę i potwierdzają obecność - nic do pobrania, nic do rejestracji.",
        },
        {
          question: "Czy to naprawdę będzie wyglądać jak MOJE wydarzenie, a nie generyczny szablon?",
          answer:
            "Każdy motyw to prawdziwy punkt startowy, nie zablokowany układ - zmień kolory, czcionki, zdjęcia, przeciągaj elementy gdziekolwiek, albo zacznij od pustego płótna. Przejrzyj całą galerię powyżej, zanim zdecydujesz.",
        },
        {
          question: "Czym to się różni od innych kreatorów stron ślubnych?",
          answer:
            "Większość pobiera abonament tylko za stronę. Tu płacisz jedną stałą opłatę, raz - i ten sam motyw przechodzi też na drukowane zaproszenia i winietki, nie tylko na stronę. Żadnej aplikacji dla gości, żadnej subskrypcji dla Ciebie.",
        },
      ],
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
      rightsReserved: "© 2026 Invimbo. Wszelkie prawa zastrzeżone.",
      paymentAccepted: "Akceptujemy Visa / Mastercard",
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
    photo: {
      label: "\u{1F4F7} Dodaj zdjęcie (opcjonalnie)",
      help: "Pojawia się w układach zdjęć na twojej stronie - zawsze możesz je dodać lub zmienić później.",
      dropHint: "Przeciągnij zdjęcie tutaj lub kliknij, aby je wybrać",
      busyHint: "Dodawanie zdjęcia...",
      changeLabel: "Zmień zdjęcie",
      removeLabel: "Usuń",
      errorFallback: "Nie udało się dodać zdjęcia",
    },
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
        { title: "Wybierz styl", text: "Przeglądaj style, aż jeden ci się spodoba - zmieniaj w dowolnym momencie." },
        { title: "Dodaj szczegóły", text: "Imiona, data, zdjęcie, jeśli chcesz. To wszystko." },
        { title: "Udostępnij swoją stronę", text: "Otrzymaj link na żywo, który goście otworzą na telefonie." },
      ],
    },
  },
  eventTypes: {
    wedding: {
      label: "Ślub",
      namePrompts: ["Imię pierwszego partnera", "Imię drugiego partnera"],
      dateLabel: "Kiedy jest ten wielki dzień?",
      heroEyebrow: "Bierzemy ślub",
    },
    anniversary: {
      label: "Rocznica",
      namePrompts: ["Imię pierwszego partnera", "Imię drugiego partnera"],
      dateLabel: "Kiedy jest uroczystość?",
      heroEyebrow: "Świętujemy naszą rocznicę",
    },
    engagement: {
      label: "Zaręczyny",
      namePrompts: ["Imię pierwszego partnera", "Imię drugiego partnera"],
      dateLabel: "Kiedy jest impreza?",
      heroEyebrow: "Zaręczyliśmy się",
    },
    birthday: {
      label: "Urodziny",
      namePrompts: ["Kto świętuje?"],
      dateLabel: "Kiedy jest impreza?",
      heroEyebrow: "Urodziny",
    },
    baby_shower: {
      label: "Baby shower",
      namePrompts: ["Dla kogo jest baby shower?"],
      dateLabel: "Kiedy jest baby shower?",
      heroEyebrow: "Baby shower",
    },
    kids_party: {
      label: "Przyjęcie dla dzieci",
      namePrompts: ["Kto świętuje?"],
      dateLabel: "Kiedy jest impreza?",
      heroEyebrow: "Czas na przyjęcie",
    },
    quinceanera: {
      label: "Quinceañera",
      namePrompts: ["Kto świętuje?"],
      dateLabel: "Kiedy jest uroczystość?",
      heroEyebrow: "Jej Quinceañera",
    },
    graduation: {
      label: "Zakończenie szkoły",
      namePrompts: ["Kto kończy szkołę?"],
      dateLabel: "Kiedy jest uroczystość?",
      heroEyebrow: "Uroczystość zakończenia szkoły",
    },
    corporate: {
      label: "Wydarzenie firmowe",
      namePrompts: ["Jak nazywa się wydarzenie?"],
      dateLabel: "Kiedy jest wydarzenie?",
      heroEyebrow: "Jesteś zaproszony/a",
    },
    holiday: {
      label: "Impreza świąteczna",
      namePrompts: ["Jak nazywa się wydarzenie?"],
      dateLabel: "Kiedy jest wydarzenie?",
      heroEyebrow: "Czas na przyjęcie",
    },
    retirement: {
      label: "Przejście na emeryturę",
      namePrompts: ["Kto przechodzi na emeryturę?"],
      dateLabel: "Kiedy jest uroczystość?",
      heroEyebrow: "Pożegnanie przed emeryturą",
    },
    other: {
      label: "Inne",
      namePrompts: ["Jak nazywa się wydarzenie?"],
      dateLabel: "Kiedy jest wydarzenie?",
      heroEyebrow: "Jesteś zaproszony/a",
    },
  },
  email: {
    common: {
      greeting: (guestName) => `Cześć ${guestName},`,
      rsvpLinkLabel: "Potwierdź tutaj",
    },
    guestInvitation: {
      subject: (eventTitle) => `Zostałeś/aś zaproszony/a na ${eventTitle}`,
      invitedTo: (eventTitle) => `Zostałeś/aś zaproszony/a na <strong>${eventTitle}</strong>.`,
    },
    guestReminder: {
      subject: (eventTitle) => `Nie zapomnij potwierdzić udziału w ${eventTitle}`,
      reminderText: (eventTitle) =>
        `Tylko przyjazne przypomnienie - nadal nie mamy od Ciebie odpowiedzi w sprawie <strong>${eventTitle}</strong>.`,
    },
    guestConfirmation: {
      acceptedSubject: (eventTitle) => `Twój udział w ${eventTitle} jest potwierdzony`,
      declinedSubject: (eventTitle) => `Otrzymaliśmy odpowiedź dla ${eventTitle}`,
      acceptedBody: (guestName, eventTitle) =>
        `<p>Cześć ${guestName},</p><p>Dziękujemy, do zobaczenia! Twój udział w <strong>${eventTitle}</strong> jest potwierdzony.</p>`,
      declinedBody: (guestName, eventTitle) =>
        `<p>Cześć ${guestName},</p><p>Dziękujemy za informację, że nie będziesz mógł/mogła być na <strong>${eventTitle}</strong>. Będzie nam Ciebie brakować!</p>`,
    },
    hostNewRsvp: {
      acceptedSubject: (guestName) => `Nowa odpowiedź: ${guestName} przyjdzie`,
      declinedSubject: (guestName) => `Nowa odpowiedź: ${guestName} nie może przyjść`,
      headline: (guestName, eventTitle, attending) =>
        `<p><strong>${guestName}</strong> ${attending ? "przyjdzie" : "nie może przyjść"} na ${eventTitle}.</p>`,
      responseSummary: (total, yes, no) =>
        `<p style="color:#6b7280;font-size:13px;">${total} odpowiedzi do tej pory: ${yes} tak, ${no} nie.</p>`,
      partySize: (size) => `<p>Liczba osób: ${size}</p>`,
      namesLabel: (names) => `<p>Imiona: ${names}</p>`,
      allergiesLabel: (text) => `<p>Alergie / wymagania żywieniowe: ${text}</p>`,
      messageLabel: (text) => `<p>Wiadomość: ${text}</p>`,
    },
    hostDigest: {
      subject: (count, eventTitle) => `Podsumowanie RSVP: ${count} nowych odpowiedzi dla ${eventTitle}`,
      intro: (count, eventTitle) =>
        `<p style="margin:0 0 4px;">${count} nowych odpowiedzi dla <strong>${eventTitle}</strong> od ostatniej aktualizacji:</p>`,
      guestYes: (guestName) =>
        `<tr><td style="padding:8px 0;border-bottom:1px solid #eee5d8;font-weight:600;color:#2b2621;">${guestName}</td><td style="padding:8px 0;border-bottom:1px solid #eee5d8;text-align:right;font-weight:700;color:#1f8a4c;white-space:nowrap;">Tak</td></tr>`,
      guestNo: (guestName) =>
        `<tr><td style="padding:8px 0;border-bottom:1px solid #eee5d8;font-weight:600;color:#2b2621;">${guestName}</td><td style="padding:8px 0;border-bottom:1px solid #eee5d8;text-align:right;font-weight:700;color:#9a3b32;white-space:nowrap;">Nie</td></tr>`,
      previousHeading: (count) =>
        `<p style="margin:20px 0 4px;font-size:12px;font-weight:700;color:#9a9282;text-transform:uppercase;letter-spacing:0.04em;">Odpowiedzieli wcześniej (${count})</p>`,
      runningTotal: (total, yes, no) =>
        `<p style="color:#6b7280;font-size:13px;margin:18px 0 0;">Razem: ${total} odpowiedziało, ${yes} tak, ${no} nie.</p>`,
      manageNote: (guestsUrl) =>
        `<p style="color:#9ca3af;font-size:12px;margin:10px 0 0;">Dostajesz to codziennie? <a href="${guestsUrl}" style="color:#9ca3af;">Wyłącz w dowolnym momencie</a> w zakładce Goście swojego wydarzenia.</p>`,
    },
    domainLive: {
      subject: (hostname) => `Twój adres invimbo.com jest już aktywny: ${hostname}`,
      liveAt: (hostname) => `<p>Strona Twojego wydarzenia jest teraz dostępna pod adresem <strong>https://${hostname}</strong>, oprócz oryginalnego linku.</p>`,
      includedNote:
        "<p>Ten adres jest wliczony w Twój plan, dopóki jest on aktywny - nic do przedłużania, bez dodatkowego zakupu domeny, bez daty wygaśnięcia do pilnowania.</p>",
      questionsNote: "<p>Masz pytania? Po prostu odpowiedz na tego e-maila lub napisz do nas na support@invimbo.com.</p>",
    },
  },
};
