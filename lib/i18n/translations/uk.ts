import type { Dictionary } from "./en";

/** Ukrainian noun plurals depend on the count itself (1 гість, 2-4 гості,
 * 0/5+/11-14 гостей) -- same reasoning as pl.ts/ru.ts's equivalents. */
function guestWordUk(count: number): string {
  const lastDigit = count % 10;
  const lastTwo = count % 100;
  if (lastDigit === 1 && lastTwo !== 11) return "гість";
  if (lastDigit >= 2 && lastDigit <= 4 && !(lastTwo >= 12 && lastTwo <= 14)) return "гості";
  return "гостей";
}

export const uk: Dictionary = {
  siteHeader: {
    menu: "Меню",
    share: "Поділитися",
    addToCalendar: "Додати в календар",
    copyLink: "Скопіювати посилання",
    linkCopied: "Посилання скопійовано!",
    playMusic: "Увімкнути музику",
    pauseMusic: "Зупинити музику",
    shareText: (eventTitle) => (eventTitle ? `Вас запрошують: ${eventTitle}` : "Вас запрошують!"),
  },
  envelopeReveal: {
    tapToOpen: "Торкніться, щоб відкрити",
    invitationFor: (guestName) => `Запрошення для ${guestName}`,
    openInvitation: (coupleLabel) => `Відкрийте запрошення${coupleLabel ? ` від ${coupleLabel}` : ""}`,
  },
  rsvp: {
    yourName: "Ваше ім'я",
    willYouJoin: "Ви будете з нами?",
    accepts: "З радістю прийде",
    declines: "На жаль, не зможе",
    numberOfGuests: "Кількість гостей (включно з вами)",
    upToGuestsTotal: (count) => `Не більше ${count} ${guestWordUk(count)} загалом, включно з вами.`,
    whoElseIsComing: "Хто ще прийде?",
    optional: "(необов'язково)",
    guestNamePlaceholder: (index) => `Ім'я гостя ${index}`,
    allergiesOrDietary: "Алергії або особливі побажання щодо харчування",
    message: "Повідомлення",
    selectPlaceholder: "Обрати...",
    sendRsvp: "Надіслати відповідь",
    sending: "Надсилання...",
    missingFieldsError: "Будь ласка, вкажіть своє ім'я та повідомте, чи зможете прийти.",
    genericError: "Щось пішло не так",
    successAttending: "Вас додано до списку! Не можемо дочекатися свята разом з вами. \u{1F389}",
    successDeclining: "Дякуємо, що повідомили — нам буде вас бракувати!",
    notPublishedError: "Цей сайт ще не опубліковано, тому підтвердження поки не приймаються. Попросіть хазяїна опублікувати сайт.",
    submitFailedError: "Не вдалося надіслати вашу відповідь. Будь ласка, спробуйте ще раз за мить.",
  },
  languageSwitcher: {
    label: "Мова",
  },
};
