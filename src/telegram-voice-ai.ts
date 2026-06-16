import { aiReply, type ChatHistoryMessage } from './ai';
import type { Env, TelegramMessage } from './types';

const CHAT_TTL = 7200;
const VOICE_ID = 'TX3LPaxmHKxFdv7VOQHJ';
const ELEVENLABS_MODEL = 'eleven_v3';
const TRANSCRIPTION_MODEL = 'gpt-4o-mini-transcribe';
const MAX_REPLY_CHARS = 2500;

const VOICE_AI_SYSTEM_PROMPT = [
  'The user sent a voice message inside Chat with AI.',
  'Reply naturally in the user language.',
  'Keep the answer concise and useful.',
].join('\n');

type TelegramVoice = {
  file_id?: string;
  mime_type?: string;
  file_size?: number;
};

type TelegramVoiceMessage = TelegramMessage & {
  voice?: TelegramVoice;
};

type TelegramFileResult = {
  ok: boolean;
  result?: {
    file_path?: string;
  };
  description?: string;
};

type TelegramResult = {
  ok: boolean;
  description?: string;
};

type TranscriptionResult = {
  text?: string;
  error?: {
    message?: string;
  };
};

export async function handleBuilderVoiceAiMessage(
  env: Env,
  botToken: string,
  message: TelegramMessage,
): Promise<boolean> {
  const voice = (message as TelegramVoiceMessage).voice;
  const voiceFileId = voice?.file_id;

  if (!voiceFileId) return false;
  if (message.chat.type !== 'private') return false;

  const chatId = message.chat.id;
  const userId = String(message.from?.id ?? chatId);
  const chatKey = `builder-ai-chat:${userId}`;
  const historyKey = `builder-ai-history:${userId}`;
  const chatIsOpen = await env.BOT_CACHE.get(chatKey).catch(() => null);

  if (!chatIsOpen) return false;

  if (!env.OPENAI_API_KEY) {
    await sendText(botToken, chatId, 'OpenAI API is not configured yet.');
    return true;
  }

  const elevenLabsApiKey = (env as Env & { ELEVENLABS_API_KEY?: string }).ELEVENLABS_API_KEY;

  if (!elevenLabsApiKey) {
    await sendText(botToken, chatId, 'ElevenLabs API is not configured yet.');
    return true;
  }

  await sendChatAction(botToken, chatId, 'typing');

  try {
    const audio = await downloadTelegramVoice(botToken, voiceFileId);
    const transcript = await transcribeVoice(env, audio);

    if (!transcript) {
      await sendText(botToken, chatId, 'I could not understand the voice message.');
      return true;
    }

    const history = await loadHistory(env, historyKey);
    const reply = await aiReply(env, VOICE_AI_SYSTEM_PROMPT, transcript, history);

    await saveHistory(env, historyKey, history, transcript, reply);
    await sendChatAction(botToken, chatId, 'upload_voice');

    const speech = await createSpeech(elevenLabsApiKey, reply.slice(0, MAX_REPLY_CHARS));
    await sendAudio(botToken, chatId, speech, 'ai-reply.mp3');
  } catch (error) {
    const messageText = error instanceof Error ? error.message : String(error);
    await sendText(botToken, chatId, `Voice AI failed. ${messageText.slice(0, 120)}`);
  }

  return true;
}

async function downloadTelegramVoice(botToken: string, fileId: string): Promise<ArrayBuffer> {
  const file = await telegram<TelegramFileResult>(botToken, 'getFile', { file_id: fileId });
  const filePath = file.result?.file_path;

  if (!file.ok || !filePath) {
    throw new Error(file.description || 'Telegram file not found');
  }

  const response = await fetch(`https://api.telegram.org/file/bot${botToken}/${filePath}`);

  if (!response.ok) {
    throw new Error(`Telegram file download failed ${response.status}`);
  }

  return response.arrayBuffer();
}

async function transcribeVoice(env: Env, audio: ArrayBuffer): Promise<string> {
  const form = new FormData();

  form.append('model', TRANSCRIPTION_MODEL);
  form.append('file', new Blob([audio], { type: 'audio/ogg' }), 'voice.ogg');

  const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${env.OPENAI_API_KEY}`,
    },
    body: form,
  });

  const data = await response.json().catch(() => null) as TranscriptionResult | null;

  if (!response.ok) {
    throw new Error(data?.error?.message || `OpenAI transcription failed ${response.status}`);
  }

  return String(data?.text || '').trim();
}

async function createSpeech(apiKey: string, text: string): Promise<ArrayBuffer> {
  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
    method: 'POST',
    headers: {
      'xi-api-key': apiKey,
      'content-type': 'application/json',
      accept: 'audio/mpeg',
    },
    body: JSON.stringify({
      text,
      model_id: ELEVENLABS_MODEL,
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`ElevenLabs speech failed ${response.status}`);
  }

  return response.arrayBuffer();
}

async function sendAudio(
  botToken: string,
  chatId: number,
  audio: ArrayBuffer,
  filename: string,
): Promise<void> {
  const form = new FormData();

  form.append('chat_id', String(chatId));
  form.append('audio', new Blob([audio], { type: 'audio/mpeg' }), filename);

  const result = await telegramForm<TelegramResult>(botToken, 'sendAudio', form);

  if (!result.ok) {
    throw new Error(result.description || 'Telegram audio upload failed');
  }
}

async function sendText(botToken: string, chatId: number, text: string): Promise<void> {
  await telegram(botToken, 'sendMessage', {
    chat_id: chatId,
    text,
  });
}

async function sendChatAction(
  botToken: string,
  chatId: number,
  action: 'typing' | 'upload_voice',
): Promise<void> {
  await telegram(botToken, 'sendChatAction', {
    chat_id: chatId,
    action,
  }).catch(() => undefined);
}

async function loadHistory(env: Env, key: string): Promise<ChatHistoryMessage[]> {
  const raw = await env.BOT_CACHE.get(key).catch(() => null);
  const parsed = raw ? safeParseJson<ChatHistoryMessage[]>(raw, []) : [];

  if (!Array.isArray(parsed)) return [];

  return parsed
    .filter((item) => item && (item.role === 'user' || item.role === 'assistant') && typeof item.content === 'string')
    .slice(-16);
}

async function saveHistory(
  env: Env,
  key: string,
  history: ChatHistoryMessage[],
  userText: string,
  assistantText: string,
): Promise<void> {
  const next = [
    ...history,
    { role: 'user' as const, content: userText.slice(0, 1800) },
    { role: 'assistant' as const, content: assistantText.slice(0, 1800) },
  ].slice(-16);

  await env.BOT_CACHE.put(key, JSON.stringify(next), { expirationTtl: CHAT_TTL }).catch(() => undefined);
}

function safeParseJson<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

async function telegram<T = TelegramResult>(
  botToken: string,
  method: string,
  payload: unknown,
): Promise<T> {
  const response = await fetch(`https://api.telegram.org/bot${botToken}/${method}`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  return response.json() as Promise<T>;
}

async function telegramForm<T = TelegramResult>(
  botToken: string,
  method: string,
  form: FormData,
): Promise<T> {
  const response = await fetch(`https://api.telegram.org/bot${botToken}/${method}`, {
    method: 'POST',
    body: form,
  });

  return response.json() as Promise<T>;
}
