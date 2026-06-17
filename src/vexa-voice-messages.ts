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

export const VEXA_VOICE_MESSAGES: VexaVoiceMessageSeed[] = [];

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
