export type VexaVoiceLanguage = 'en' | 'fa' | 'tr' | 'ru';

export type VexaVoiceEventId =
  | 'admin_message'
  | 'first_deposit'
  | 'first_withdraw'
  | 'daily_rewards_intro'
  | 'playzone_intro'
  | 'predict_intro';

export type VexaVoiceMessageSeed = {
  eventId: VexaVoiceEventId;
  label: string;
  displayText: string;
  autoplay: boolean;
  requiresTap: boolean;
  texts: Record<VexaVoiceLanguage, string>;
};

export const VEXA_VOICE_LANGUAGES: VexaVoiceLanguage[] = ['en', 'fa', 'tr', 'ru'];
export const VEXA_VOICE_LANGUAGE_SET = new Set<string>(VEXA_VOICE_LANGUAGES);

export const VEXA_VOICE_MESSAGES: VexaVoiceMessageSeed[] = [
  {
    eventId: "admin_message",
    label: "Admin Message",
    displayText: "Vexa wants to say something \ud83d\udc40",
    autoplay: false,
    requiresTap: true,
    texts: {
      en: "[curious, playful, warm] Hey! Vexa has something important for you. Tap in and don\u2019t miss it!",
      fa: "[curious, playful, warm] \u0647\u06cc! \u0648\u06a9\u0633\u0627 \u06cc\u0647 \u067e\u06cc\u0627\u0645 \u0645\u0647\u0645 \u0628\u0631\u0627\u062a \u062f\u0627\u0631\u0647. \u0628\u0632\u0646 \u0631\u0648\u0634\u060c \u0627\u0632 \u062f\u0633\u062a\u0634 \u0646\u062f\u0647!",
      tr: "[curious, playful, warm] Hey! Vexa\u2019n\u0131n sana \u00f6nemli bir mesaj\u0131 var. Dokun ve ka\u00e7\u0131rma!",
      ru: "[curious, playful, warm] \u042d\u0439! \u0423 Vexa \u0435\u0441\u0442\u044c \u0432\u0430\u0436\u043d\u043e\u0435 \u0441\u043e\u043e\u0431\u0449\u0435\u043d\u0438\u0435 \u0434\u043b\u044f \u0442\u0435\u0431\u044f. \u041d\u0430\u0436\u043c\u0438 \u0438 \u043d\u0435 \u043f\u0440\u043e\u043f\u0443\u0441\u0442\u0438!",
    },
  },
  {
    eventId: "first_deposit",
    label: "First Deposit",
    displayText: "Balance loaded by Vexa",
    autoplay: true,
    requiresTap: false,
    texts: {
      en: "[excited, playful, smiling] Boom! Your balance is loaded! Start smart, and make every move count!",
      fa: "[excited, playful, smiling] \u0628\u0648\u0645! \u0628\u0627\u0644\u0627\u0646\u0633\u062a \u0634\u0627\u0631\u0698 \u0634\u062f! \u0647\u0648\u0634\u0645\u0646\u062f \u0634\u0631\u0648\u0639 \u06a9\u0646 \u0648 \u0647\u0631 \u062d\u0631\u06a9\u062a\u062a \u0631\u0648 \u062d\u0633\u0627\u0628\u200c\u0634\u062f\u0647 \u0628\u0632\u0646!",
      tr: "[excited, playful, smiling] Boom! Bakiyen y\u00fcklendi! Ak\u0131ll\u0131 ba\u015fla, her hamleni sayd\u0131r!",
      ru: "[excited, playful, smiling] \u0411\u0443\u043c! \u0411\u0430\u043b\u0430\u043d\u0441 \u0437\u0430\u0433\u0440\u0443\u0436\u0435\u043d! \u041d\u0430\u0447\u0438\u043d\u0430\u0439 \u0443\u043c\u043d\u043e \u0438 \u0434\u0435\u043b\u0430\u0439 \u043a\u0430\u0436\u0434\u044b\u0439 \u0445\u043e\u0434 \u0432\u0430\u0436\u043d\u044b\u043c!",
    },
  },
  {
    eventId: "first_withdraw",
    label: "First Withdraw",
    displayText: "Clean cash out",
    autoplay: true,
    requiresTap: false,
    texts: {
      en: "[happy, proud, playful] Nice! You cashed out! Clean move!",
      fa: "[happy, proud, playful] \u0639\u0627\u0644\u06cc\u0647! \u0628\u0631\u062f\u0627\u0634\u062a \u0632\u062f\u06cc! \u062d\u0631\u06a9\u062a \u062a\u0645\u06cc\u0632\u06cc \u0628\u0648\u062f!",
      tr: "[happy, proud, playful] G\u00fczel! Paran\u0131 \u00e7ektin! Temiz hamle!",
      ru: "[happy, proud, playful] \u041e\u0442\u043b\u0438\u0447\u043d\u043e! \u0422\u044b \u0432\u044b\u0432\u0435\u043b \u0434\u0435\u043d\u044c\u0433\u0438! \u0427\u0438\u0441\u0442\u044b\u0439 \u0445\u043e\u0434!",
    },
  },
  {
    eventId: "playzone_intro",
    label: "Play Zone Intro",
    displayText: "Play Zone tip from Vexa",
    autoplay: true,
    requiresTap: false,
    texts: {
      en: "[excited, playful, energetic] Welcome to Play Zone! Pick your game, start small, and play smart!",
      fa: "[excited, playful, energetic] \u0628\u0647 \u067e\u0644\u06cc \u0632\u0648\u0646 \u062e\u0648\u0634 \u0627\u0648\u0645\u062f\u06cc! \u0628\u0627\u0632\u06cc\u062a \u0631\u0648 \u0627\u0646\u062a\u062e\u0627\u0628 \u06a9\u0646\u060c \u06a9\u0645 \u0634\u0631\u0648\u0639 \u06a9\u0646 \u0648 \u0647\u0648\u0634\u0645\u0646\u062f \u0628\u0627\u0632\u06cc \u06a9\u0646!",
      tr: "[excited, playful, energetic] Play Zone\u2019a ho\u015f geldin! Oyununu se\u00e7, k\u00fc\u00e7\u00fck ba\u015fla ve ak\u0131ll\u0131 oyna!",
      ru: "[excited, playful, energetic] \u0414\u043e\u0431\u0440\u043e \u043f\u043e\u0436\u0430\u043b\u043e\u0432\u0430\u0442\u044c \u0432 Play Zone! \u0412\u044b\u0431\u0435\u0440\u0438 \u0438\u0433\u0440\u0443, \u043d\u0430\u0447\u043d\u0438 \u0441 \u043c\u0430\u043b\u043e\u0433\u043e \u0438 \u0438\u0433\u0440\u0430\u0439 \u0443\u043c\u043d\u043e!",
    },
  },
  {
    eventId: "predict_intro",
    label: "Predict Intro",
    displayText: "Predict tip from Vexa",
    autoplay: true,
    requiresTap: false,
    texts: {
      en: "[excited, playful, mysterious] Welcome to Predict! Pick a side, trust your instinct, and let\u2019s see if you can read the future!",
      fa: "[excited, playful, mysterious] \u0628\u0647 Predict \u062e\u0648\u0634 \u0627\u0648\u0645\u062f\u06cc! \u06cc\u0647 \u0633\u0645\u062a \u0631\u0648 \u0627\u0646\u062a\u062e\u0627\u0628 \u06a9\u0646\u060c \u0628\u0647 \u062d\u0633\u062a \u0627\u0639\u062a\u0645\u0627\u062f \u06a9\u0646 \u0648 \u0628\u0628\u06cc\u0646 \u0622\u06cc\u0646\u062f\u0647 \u0631\u0648 \u0645\u06cc\u200c\u062e\u0648\u0646\u06cc \u06cc\u0627 \u0646\u0647!",
      tr: "[excited, playful, mysterious] Predict\u2019e ho\u015f geldin! Bir taraf se\u00e7, i\u00e7g\u00fcd\u00fcne g\u00fcven ve gelece\u011fi okuyabiliyor musun g\u00f6relim!",
      ru: "[excited, playful, mysterious] \u0414\u043e\u0431\u0440\u043e \u043f\u043e\u0436\u0430\u043b\u043e\u0432\u0430\u0442\u044c \u0432 Predict! \u0412\u044b\u0431\u0435\u0440\u0438 \u0441\u0442\u043e\u0440\u043e\u043d\u0443, \u0434\u043e\u0432\u0435\u0440\u044c\u0441\u044f \u0447\u0443\u0442\u044c\u044e \u0438 \u043f\u043e\u0441\u043c\u043e\u0442\u0440\u0438\u043c, \u0447\u0438\u0442\u0430\u0435\u0448\u044c \u043b\u0438 \u0442\u044b \u0431\u0443\u0434\u0443\u0449\u0435\u0435!",
    },
  }
];

export function normalizeVexaVoiceEventId(value: unknown): VexaVoiceEventId | '' {
  const eventId = String(value || '').replace(/[^0-9A-Za-z_-]/g, '').trim().slice(0, 80) as VexaVoiceEventId;
  return VEXA_VOICE_MESSAGES.some((message) => message.eventId === eventId) ? eventId : '';
}

export function normalizeVexaVoiceLanguage(value: unknown): VexaVoiceLanguage {
  const language = String(value || '').trim().toLowerCase();
  return VEXA_VOICE_LANGUAGE_SET.has(language) ? language as VexaVoiceLanguage : 'en';
}

export function vexaVoiceLanguageForRegion(regionCode: unknown, languageCode: unknown): VexaVoiceLanguage {
  const region = String(regionCode || '').trim().toUpperCase();
  const language = String(languageCode || '').trim().toLowerCase();
  if (region === 'IR') return 'fa';
  if (region === 'TR') return 'tr';
  if (region === 'RU') return 'ru';
  if (language === 'fa' || language === 'tr' || language === 'ru') return language;
  return 'en';
}

export function vexaVoiceR2Key(eventId: string, language: string): string {
  return `vexa-voice/${eventId}/${language}.mp3`;
}
