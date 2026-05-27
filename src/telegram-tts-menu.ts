import type { Env, TelegramUpdate } from './types';

type TtsOutput = 'mp3' | 'voice';
type TtsSelection = { voiceName: string; voiceId: string; output: TtsOutput; createdAt: number };
type Voice = { name: string; id: string };

const TTS_TTL = 900;
const PAGE_SIZE = 9;

const TTS_VOICES: Voice[] = [
  { name: 'Liam', id: 'TX3LPaxmHKxFdv7VOQHJ' },
  { name: 'Noah', id: '1SM7GgM6IMuvQlz2BwM3' },
  { name: 'Ava', id: 'tnSpp4vdxKPjI9w0GnoV' },
  { name: 'Nora', id: 'BIvP0GN1cAtSRTxNHnWS' },
  { name: 'Alex', id: 'GFGuOkimbpNkTEOVDkqX' },
  { name: 'Ella', id: 'NZiuR1C6kVMSWHG27sIM' },
  { name: 'Chloe', id: 'BZgkqPqms7Kj9ulSkVzn' },
  { name: 'Alexandra', id: 'kdmDKE6EkgrWrrykO9Qt' },
  { name: 'Laura', id: '7piC4m7q8WrpEAnMj5xC' },
  { name: 'Maxon', id: '0dPqNXnhg2bmxQv1WKDp' },
  { name: 'Jessica', id: 'cgSgspJ2msm6clMCkdW9' },
  { name: 'Austin', id: 'Bj9UqZbhQsanLzgalpEG' },
  { name: 'priyanka', id: 'BpjGufoPiobT79j2vtj4' },
  { name: 'horatius', id: 'qXpMhyvQqiRxWQs4qSSB' },
  { name: 'anika', id: 'Sm1seazb4gs7RSlUVw7c' },
  { name: 'brock', id: 'DGzg6RaUqxGRTHSBjfgF' },
  { name: 'Xavier', id: 'YOq2y2Up4RgXP2HyXjE5' },
  { name: 'Lucas', id: 'NNl6r8mD7vthiJatiJt1' },
];

export async function handleAiTtsRequest(request: Request, env: Env): Promise<Response | null> {
  const url = new URL(request.url);
  if (request.method !== 'POST' || url.pathname !== '/telegram/ai-webhook') return null;

  const update = await request.clone().json().catch(() => null) as TelegramUpdate | null;
  if (!update) return null;

  const token = env.AI_BOT_TOKEN || env.TELEGRAM_BOT_TOKEN;
  const callback = update.callback_query;
  if (callback) {
    const data = callback.data || '';
    if (!data.startsWith('builder:tts') && data !== 'builder:back') return null;
    const chatId = callback.message?.chat.id ?? callback.from.id;
    const userId = String(callback.from.id);
    const messageId = callback.message?.message_id;
    await telegram(token, 'answerCallbackQuery', { callback_query_id: callback.id }).catch(() => undefined);

    if (data === 'builder:back') {
      await env.BOT_CACHE.delete(ttsKey(userId)).catch(() => undefined);
      await mainMenu(token, chatId);
      return Response.json({ ok: true });
    }

    if (data === 'builder:tts') await showMenu(env, token, chatId, userId, 0, messageId);
    else if (data.startsWith('builder:tts:page:')) await showMenu(env, token, chatId, userId, Number(data.slice('builder:tts:page:'.length)) || 0, messageId);
    else if (data.startsWith('builder:tts:voice:')) {
      const parts = data.split(':');
      const voiceName = parts[3] || '';
      const page = Number(parts[4] || '0') || 0;
      const voice = TTS_VOICES.find((item) => item.name === voiceName);
      const current = await getSelection(env, userId);
      if (voice) await saveSelection(env, userId, { voiceName: voice.name, voiceId: voice.id, output: current?.output || 'mp3', createdAt: Date.now() });
      await showMenu(env, token, chatId, userId, page, messageId);
    } else if (data.startsWith('builder:tts:output:')) {
      const parts = data.split(':');
      const output: TtsOutput = parts[3] === 'voice' ? 'voice' : 'mp3';
      const page = Number(parts[4] || '0') || 0;
      const current = await getSelection(env, userId);
      if (current) await saveSelection(env, userId, { ...current, output, createdAt: Date.now() });
      else await env.BOT_CACHE.put(ttsOutputKey(userId), output, { expirationTtl: TTS_TTL }).catch(() => undefined);
      await showMenu(env, token, chatId, userId, page, messageId, output);
    } else if (data.startsWith('builder:tts:demo:')) {
      const selection = await getSelection(env, userId);
      if (!selection) await telegram(token, 'sendMessage', { chat_id: chatId, text: 'Choose a voice first.' });
      else await sendSpeech(env, token, chatId, userId, 'This is a short demo from Vexa Text to Speech.', selection, true);
    }
    return Response.json({ ok: true });
  }

  const message = update.message;
  const text = message?.text?.trim() || '';
  const userId = String(message?.from?.id ?? '');
  const chatId = message?.chat.id;
  if (!message || !chatId || !userId) return null;
  if (text === '/cancel' || text === '/start') {
    await env.BOT_CACHE.delete(ttsKey(userId)).catch(() => undefined);
    return null;
  }
  const selection = await getSelection(env, userId);
  if (!selection) return null;
  await sendSpeech(env, token, chatId, userId, text, selection, false);
  return Response.json({ ok: true });
}

async function showMenu(env: Env, token: string, chatId: number, userId: string, page: number, messageId?: number, fallbackOutput?: TtsOutput): Promise<void> {
  const maxPage = Math.max(0, Math.ceil(TTS_VOICES.length / PAGE_SIZE) - 1);
  const safePage = Math.max(0, Math.min(page, maxPage));
  const selected = await getSelection(env, userId);
  const savedOutput = (await env.BOT_CACHE.get(ttsOutputKey(userId)).catch(() => null)) as TtsOutput | null;
  const output = selected?.output || fallbackOutput || savedOutput || 'mp3';
  const voices = TTS_VOICES.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);
  const rows: Array<Array<{ text: string; callback_data: string }>> = [];

  for (let i = 0; i < voices.length; i += 2) {
    rows.push(voices.slice(i, i + 2).map((voice) => ({
      text: `${selected?.voiceName === voice.name ? '✅ ' : ''}${voice.name}`,
      callback_data: `builder:tts:voice:${voice.name}:${safePage}`,
    })));
  }

  const nav = safePage === 0
    ? { text: 'Next →', callback_data: 'builder:tts:page:1' }
    : { text: '← Previous', callback_data: 'builder:tts:page:0' };
  if (rows[4]?.length === 1) rows[4].push(nav);
  else rows.push([nav]);

  rows.push([{ text: '▶ Demo', callback_data: `builder:tts:demo:${safePage}` }]);
  rows.push([
    { text: `${output === 'mp3' ? '✅ ' : ''}MP3 📁`, callback_data: `builder:tts:output:mp3:${safePage}` },
    { text: `${output === 'voice' ? '✅ ' : ''}Voice 🎙️`, callback_data: `builder:tts:output:voice:${safePage}` },
  ]);
  rows.push([{ text: 'Back', callback_data: 'builder:back' }]);

  const payload = {
    chat_id: chatId,
    text: `🎧 Text to Speech\n\nChoose a voice, choose output, then send your text.\nSelected voice: ${selected?.voiceName || 'none'}\nOutput: ${output.toUpperCase()}`,
    reply_markup: { inline_keyboard: rows },
  };
  if (messageId) await telegram(token, 'editMessageText', { ...payload, message_id: messageId }).catch(() => telegram(token, 'sendMessage', payload));
  else await telegram(token, 'sendMessage', payload);
}

async function sendSpeech(env: Env, token: string, chatId: number, userId: string, text: string, selection: TtsSelection, keepSelection: boolean): Promise<void> {
  const apiKey = (env as Env & { ELEVENLABS_API_KEY?: string }).ELEVENLABS_API_KEY;
  if (!apiKey) {
    await telegram(token, 'sendMessage', { chat_id: chatId, text: 'Text to Speech is not configured. Add ELEVENLABS_API_KEY to Cloudflare secrets.' });
    return;
  }
  if (text.length > 4800) {
    await telegram(token, 'sendMessage', { chat_id: chatId, text: 'Text is too long. Please send text under 4800 characters.' });
    return;
  }
  await telegram(token, 'sendChatAction', { chat_id: chatId, action: selection.output === 'voice' ? 'record_voice' : 'upload_voice' }).catch(() => undefined);
  try {
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${selection.voiceId}`, {
      method: 'POST',
      headers: { 'xi-api-key': apiKey, 'content-type': 'application/json', accept: 'audio/mpeg' },
      body: JSON.stringify({ text, model_id: 'eleven_v3', voice_settings: { stability: 0.5, similarity_boost: 0.75 } }),
    });
    if (!response.ok) throw new Error(`ElevenLabs error ${response.status}`);
    const audio = await response.arrayBuffer();
    const form = new FormData();
    form.append('chat_id', String(chatId));
    form.append(selection.output === 'voice' ? 'voice' : 'audio', new Blob([audio], { type: 'audio/mpeg' }), `${selection.voiceName}.mp3`);
    if (selection.output === 'mp3') form.append('caption', `Voice: ${selection.voiceName}`);
    await telegramForm(token, selection.output === 'voice' ? 'sendVoice' : 'sendAudio', form);
    if (!keepSelection) {
      await env.BOT_CACHE.delete(ttsKey(userId)).catch(() => undefined);
      await mainMenu(token, chatId);
    }
  } catch (error) {
    await telegram(token, 'sendMessage', { chat_id: chatId, text: `Could not create speech. ${(error instanceof Error ? error.message : String(error)).slice(0, 120)}` });
  }
}

async function getSelection(env: Env, userId: string): Promise<TtsSelection | null> {
  const raw = await env.BOT_CACHE.get(ttsKey(userId)).catch(() => null);
  return raw ? JSON.parse(raw) as TtsSelection : null;
}

async function saveSelection(env: Env, userId: string, selection: TtsSelection): Promise<void> {
  await env.BOT_CACHE.put(ttsKey(userId), JSON.stringify(selection), { expirationTtl: TTS_TTL }).catch(() => undefined);
}

function ttsKey(userId: string): string { return `builder-tts:${userId}`; }
function ttsOutputKey(userId: string): string { return `builder-tts-output:${userId}`; }

async function mainMenu(token: string, chatId: number): Promise<void> {
  await telegram(token, 'sendMessage', { chat_id: chatId, text: 'AI Builder TEL', reply_markup: { inline_keyboard: [[{ text: 'Open Mini App', web_app: { url: 'https://builder-tel.vexaagent.workers.dev/builder' } }], [{ text: 'Chat with AI', callback_data: 'builder:chat' }], [{ text: 'Text to Speech', callback_data: 'builder:tts' }]] } });
}

async function telegram<T = unknown>(token: string, method: string, payload: unknown): Promise<T> {
  const response = await fetch('https://api.telegram.org/' + 'bot' + token + '/' + method, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return response.json() as Promise<T>;
}

async function telegramForm<T = unknown>(token: string, method: string, form: FormData): Promise<T> {
  const response = await fetch('https://api.telegram.org/' + 'bot' + token + '/' + method, { method: 'POST', body: form });
  return response.json() as Promise<T>;
}
