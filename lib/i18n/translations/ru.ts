import type { Dictionary } from "./en";

/** Russian noun plurals depend on the count itself (1 гость, 2-4 гостя,
 * 0/5+/11-14 гостей) -- a single fixed word reads as a grammar error to a
 * native speaker for most counts, same reasoning as pl.ts's guestWordPl. */
function guestWordRu(count: number): string {
  const lastDigit = count % 10;
  const lastTwo = count % 100;
  if (lastDigit === 1 && lastTwo !== 11) return "гость";
  if (lastDigit >= 2 && lastDigit <= 4 && !(lastTwo >= 12 && lastTwo <= 14)) return "гостя";
  return "гостей";
}

export const ru: Dictionary = {
  siteHeader: {
    menu: "Меню",
    share: "Поделиться",
    addToCalendar: "Добавить в календарь",
    copyLink: "Скопировать ссылку",
    linkCopied: "Ссылка скопирована!",
    playMusic: "Включить музыку",
    pauseMusic: "Остановить музыку",
    shareText: (eventTitle) => (eventTitle ? `Вас приглашают: ${eventTitle}` : "Вас приглашают!"),
  },
  envelopeReveal: {
    tapToOpen: "Нажмите, чтобы открыть",
    invitationFor: (guestName) => `Приглашение для ${guestName}`,
    openInvitation: (coupleLabel) => `Откройте приглашение${coupleLabel ? ` от ${coupleLabel}` : ""}`,
  },
  rsvp: {
    yourName: "Ваше имя",
    willYouJoin: "Вы будете с нами?",
    accepts: "С радостью придёт",
    declines: "С сожалением не сможет",
    numberOfGuests: "Количество гостей (включая вас)",
    upToGuestsTotal: (count) => `Не более ${count} ${guestWordRu(count)} всего, включая вас.`,
    whoElseIsComing: "Кто ещё придёт?",
    optional: "(необязательно)",
    guestNamePlaceholder: (index) => `Имя гостя ${index}`,
    allergiesOrDietary: "Аллергии или особые пожелания по питанию",
    message: "Сообщение",
    selectPlaceholder: "Выбрать...",
    sendRsvp: "Отправить ответ",
    sending: "Отправка...",
    missingFieldsError: "Пожалуйста, укажите своё имя и сообщите, сможете ли вы прийти.",
    genericError: "Что-то пошло не так",
    successAttending: "Вы в списке! Не можем дождаться, чтобы отпраздновать вместе с вами. \u{1F389}",
    successDeclining: "Спасибо, что сообщили — нам будет вас не хватать!",
    notPublishedError: "Этот сайт ещё не опубликован, поэтому подтверждения пока не принимаются. Попросите хозяина опубликовать сайт.",
    submitFailedError: "Не удалось отправить ваш ответ. Пожалуйста, попробуйте ещё раз через момент.",
  },
  languageSwitcher: {
    label: "Язык",
  },
};
