import app from './index';
import { aiReply } from './ai';
import type { Env } from './types';
import { OPENAI_BASE_URL } from './utils';

type EnvWithVoiceAi = Env & {
  ELEVENLABS_API_KEY?: string;
};

type TranscriptionResult = {
  text?: string;
  error?: {
    message?: string;
  };
};

type VoiceRegion = {
  code: string;
  label: string;
  language: string;
  languageCode: string;
  locked: boolean;
};

type RegionRow = {
  region_code: string | null;
  language_code: string | null;
};

const VOICE_AI_ELEVENLABS_VOICE_ID = 'TX3LPaxmHKxFdv7VOQHJ';
const VOICE_AI_TRANSCRIBE_MODEL = 'gpt-4o-mini-transcribe';
const VOICE_AI_MAX_AUDIO_BYTES = 10 * 1024 * 1024;
const VOICE_AI_MAX_REPLY_CHARS = 1200;

const VOICE_REGIONS: Record<string, VoiceRegion> = {
  US: { code: 'US', label: 'United States', language: 'English', languageCode: 'en', locked: true },
  TR: { code: 'TR', label: 'Turkey', language: 'Turkish', languageCode: 'tr', locked: true },
  DE: { code: 'DE', label: 'Germany', language: 'German', languageCode: 'de', locked: true },
  AE: { code: 'AE', label: 'UAE', language: 'Arabic', languageCode: 'ar', locked: true },
  SA: { code: 'SA', label: 'Saudi Arabia', language: 'Arabic', languageCode: 'ar', locked: true },
  RU: { code: 'RU', label: 'Russia', language: 'Russian', languageCode: 'ru', locked: true },
  IN: { code: 'IN', label: 'India', language: 'English', languageCode: 'en', locked: true },
  BR: { code: 'BR', label: 'Brazil', language: 'Portuguese', languageCode: 'pt', locked: true },
  IR: { code: 'IR', label: 'Iran', language: 'Persian / Farsi', languageCode: 'fa', locked: true },
  OTHER: { code: 'OTHER', label: 'Other', language: 'English', languageCode: 'en', locked: true },
};

const FALLBACK_REGION: VoiceRegion = {
  code: 'AUTO',
  label: 'Auto',
  language: 'the user language',
  languageCode: '',
  locked: false,
};

app.post('/app/api/voice-ai', async (c) => {
  const env = c.env as EnvWithVoiceAi;

  if (!env.OPENAI_API_KEY) {
    return c.json({ error: 'OpenAI API key is not configured.' }, 500);
  }

  if (!env.ELEVENLABS_API_KEY) {
    return c.json({ error: 'ElevenLabs API key is not configured.' }, 500);
  }

  const form = await c.req.formData().catch(() => null);
  const file = form?.get('audio');
  const region = await resolveRegion(env, form);

  if (!(file instanceof File)) {
    return c.json({ error: 'Audio file is required.' }, 400);
  }

  if (file.size < 1) {
    return c.json({ error: 'Audio file is empty.' }, 400);
  }

  if (file.size > VOICE_AI_MAX_AUDIO_BYTES) {
    return c.json({ error: 'Audio file is too large.' }, 413);
  }

  try {
    const transcript = await transcribeAudio(env, file, region.languageCode);
    const reply = await aiReply(env, voicePrompt(region), transcript);
    const audio = await createSpeech(env, reply.slice(0, VOICE_AI_MAX_REPLY_CHARS));

    return new Response(audio, {
      headers: {
        'content-type': 'audio/mpeg',
        'cache-control': 'no-store',
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Voice AI failed.';
    return c.json({ error: message.slice(0, 300) }, 500);
  }
});

async function resolveRegion(env: EnvWithVoiceAi, form: FormData | null): Promise<VoiceRegion> {
  const userId = readTelegramUserId(String(form?.get('initData') || ''));

  if (!userId) {
    return FALLBACK_REGION;
  }

  const row = await env.DB.prepare('SELECT region_code, language_code FROM app_users WHERE telegram_user_id = ?')
    .bind(userId)
    .first<RegionRow>()
    .catch(() => null);

  const regionCode = String(row?.region_code || '').trim().toUpperCase();
  const languageCode = String(row?.language_code || '').trim().toLowerCase();

  if (regionCode && VOICE_REGIONS[regionCode]) {
    return VOICE_REGIONS[regionCode];
  }

  const byLanguage = Object.values(VOICE_REGIONS).find((item) => item.languageCode === languageCode);
  return byLanguage || FALLBACK_REGION;
}

function readTelegramUserId(initData: string): string {
  if (!initData) return '';

  try {
    const params = new URLSearchParams(initData);
    const rawUser = params.get('user') || '';
    if (!rawUser) return '';

    const user = JSON.parse(rawUser) as { id?: number | string };
    const id = String(user.id || '').trim();
    return /^\d+$/.test(id) ? id : '';
  } catch {
    return '';
  }
}

function voicePrompt(region: VoiceRegion): string {
  if (!region.locked) {
    return [
      'You are a live voice assistant inside a Telegram Mini App.',
      'The input is a speech transcript and may contain transcription mistakes.',
      'Reply in the user language.',
      'Keep the answer short, conversational, and easy to understand when spoken aloud.',
    ].join('\n');
  }

  return [
    'You are a live voice assistant inside a Telegram Mini App.',
    'The input is a speech transcript and may contain transcription mistakes.',
    `The user selected region in the bot: ${region.label}.`,
    `Always reply in this region language: ${region.language}.`,
    'Do not switch language just because the transcription looks mixed or noisy.',
    'Only switch language if the user clearly asks for translation or asks you to speak another language.',
    'Keep the answer short, conversational, and easy to understand when spoken aloud.',
  ].join('\n');
}

async function transcribeAudio(env: EnvWithVoiceAi, file: File, languageCode: string): Promise<string> {
  const form = new FormData();
  form.append('file', file, file.name || 'voice.webm');
  form.append('model', VOICE_AI_TRANSCRIBE_MODEL);
  form.append('response_format', 'json');

  if (languageCode) {
    form.append('language', languageCode);
  }

  const response = await fetch(`${OPENAI_BASE_URL}/audio/transcriptions`, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${env.OPENAI_API_KEY}`,
    },
    body: form,
  });

  const data = await response.json().catch(() => null) as TranscriptionResult | null;

  if (!response.ok) {
    throw new Error(data?.error?.message || `Transcription failed with ${response.status}`);
  }

  const text = String(data?.text || '').trim();

  if (!text) {
    throw new Error('Could not understand the voice message.');
  }

  return text;
}

async function createSpeech(env: EnvWithVoiceAi, text: string): Promise<ArrayBuffer> {
  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_AI_ELEVENLABS_VOICE_ID}`, {
    method: 'POST',
    headers: {
      'xi-api-key': env.ELEVENLABS_API_KEY || '',
      'content-type': 'application/json',
      accept: 'audio/mpeg',
    },
    body: JSON.stringify({
      text,
      model_id: 'eleven_v3',
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`ElevenLabs failed with ${response.status}`);
  }

  return response.arrayBuffer();
}
