import type { Env, TelegramCallbackQuery, TelegramMessage } from './types';

type TtsOutput = 'mp3' | 'voice';
type TtsSelection = { voiceName: string; voiceId: string; output: TtsOutput; createdAt: number };
type TelegramMessageResult = { ok: boolean; result?: { message_id?: number }; description?: string };

const TTS_TTL = 900;
const VOICES = [
  ['Liam', 'TX3LPaxmHKxFdv7VOQHJ'], ['Noah', '1SM7GgM6IMuvQlz2BwM3'], ['Ava', 'tnSpp4vdxKPjI9w0GnoV'],
  ['Nora', 'BIvP0GN1cAtSRTxNHnWS'], ['Alex', 'GFGuOkimbpNkTEOVDkqX'], ['Ella', 'NZiuR1C6kVMSWHG27sIM'],
  ['Chloe', 'BZgkqPqms7Kj9ulSkVzn'], ['Alexandra', 'kdmDKE6EkgrWrrykO9Qt'], ['Laura', '7piC4m7q8WrpEAnMj5xC'],
  ['Maxon', '0dPqNXnhg2bmxQv1WKDp'], ['Jessica', 'cgSgspJ2msm6clMCkdW9'], ['Austin', 'Bj9UqZbhQsanLzgalpEG'],
  ['priyanka', 'BpjGufoPiobT79j2vtj4'], ['horatius', 'qXpMhyvQqiRxWQs4qSSB'], ['anika', 'Sm1seazb4gs7RSlUVw7c'],
  ['brock', 'DGzg6RaUqxGRTHSBjfgF'], ['Xavier', 'YOq2y2Up4RgXP2HyXjE5'], ['Lucas', 'NNl6r8mD7vthiJatiJt1'],
] as const;

export async function clearTtsState(env: Env, userId: string): Promise<void> {
  await env.BOT_CACHE.delete(keyOf(userId)).catch(() => undefined);
  await env.BOT_CACHE.delete(outputKeyOf(userId)).catch(() => undefined);
  await env.BOT_CACHE.delete(menuMessageKeyOf(userId)).catch(() => undefined);
}

export async function handleTtsCallback(env: Env, botKey: string, q: TelegramCallbackQuery): Promise<boolean> {
  const data = q.data || '';
  if (!data.startsWith('builder:tts') && data !== 'builder:back') return false;
  const chatId = q.message?.chat.id ?? q.from.id;
  const userId = String(q.from.id);
  const messageId = q.message?.message_id;

  if (data === 'builder:back') {
    await clearTtsState(env, userId);
    await showMainMenu(botKey, chatId, messageId);
    return true;
  }

  if (data === 'builder:tts') return showMenu(env, botKey, chatId, userId, 0, messageId);
  if (data.startsWith('builder:tts:page:')) return showMenu(env, botKey, chatId, userId, Number(data.split(':').pop()) || 0, messageId);

  if (data.startsWith('builder:tts:voice:')) {
    const parts = data.split(':');
    const name = parts[3] || '';
    const page = Number(parts[4] || '0') || 0;
    const voice = VOICES.find((v) => v[0] === name);
    const old = await readSelection(env, userId);
    const savedOutput = await env.BOT_CACHE.get(outputKeyOf(userId)).catch(() => null);
    if (voice) await saveSelection(env, userId, { voiceName: voice[0], voiceId: voice[1], output: old?.output || (savedOutput === 'voice' ? 'voice' : 'mp3'), createdAt: Date.now() });
    return showMenu(env, botKey, chatId, userId, page, messageId);
  }

  if (data.startsWith('builder:tts:output:')) {
    const parts = data.split(':');
    const output: TtsOutput = parts[3] === 'voice' ? 'voice' : 'mp3';
    const page = Number(parts[4] || '0') || 0;
    const old = await readSelection(env, userId);
    if (old) await saveSelection(env, userId, { ...old, output, createdAt: Date.now() });
    await env.BOT_CACHE.put(outputKeyOf(userId), output, { expirationTtl: TTS_TTL }).catch(() => undefined);
    return showMenu(env, botKey, chatId, userId, page, messageId, output);
  }

  if (data.startsWith('builder:tts:demo:')) {
    const selected = await readSelection(env, userId);
    if (!selected) await callBot(botKey, 'sendMessage', { chat_id: chatId, text: 'Choose a voice first.' });
    else await speak(env, botKey, chatId, userId, 'This is a short demo from Vexa Text to Speech.', selected, true);
    return true;
  }
  return true;
}

export async function handleTtsMessage(env: Env, botKey: string, message: TelegramMessage): Promise<boolean> {
  const text = message.text?.trim() || '';
  const userId = String(message.from?.id ?? message.chat.id);

  if (isEndText(text)) return closeBuilderAiChat(env, botKey, message.chat.id, userId);
  if (!text || text === '/start' || text === '/cancel') return false;

  const selected = await readSelection(env, userId);
  if (!selected) return false;
  await speak(env, botKey, message.chat.id, userId, text, selected, false);
  return true;
}

async function showMenu(env: Env, botKey: string, chatId: number, userId: string, page: number, messageId?: number, fallbackOutput?: TtsOutput): Promise<boolean> {
  const safePage = Math.max(0, Math.min(page, 1));
  const selected = await readSelection(env, userId);
  const savedOutput = await env.BOT_CACHE.get(outputKeyOf(userId)).catch(() => null);
  const output: TtsOutput = selected?.output || fallbackOutput || (savedOutput === 'voice' ? 'voice' : 'mp3');
  const voices = VOICES.slice(safePage * 9, safePage * 9 + 9);
  const rows: Array<Array<{ text: string; callback_data: string }>> = [];
  for (let i = 0; i < voices.length; i += 2) rows.push(voices.slice(i, i + 2).map((v) => ({ text: `${selected?.voiceName === v[0] ? '✔️ ' : ''}${v[0]}`, callback_data: `builder:tts:voice:${v[0]}:${safePage}` })));
  const nav = safePage === 0 ? { text: 'Next →', callback_data: 'builder:tts:page:1' } : { text: '← Previous', callback_data: 'builder:tts:page:0' };
  if (rows[4]?.length === 1) rows[4].push(nav); else rows.push([nav]);
  rows.push([{ text: '▶ Demo', callback_data: `builder:tts:demo:${safePage}` }]);
  rows.push([{ text: `${output === 'mp3' ? '✔️ ' : ''}MP3 📁`, callback_data: `builder:tts:output:mp3:${safePage}` }, { text: `${output === 'voice' ? '✔️ ' : ''}Voice 🎙️`, callback_data: `builder:tts:output:voice:${safePage}` }]);
  rows.push([{ text: 'Back', callback_data: 'builder:back' }]);
  const payload = {
    chat_id: chatId,
    text: `<b>🎧 Text to Speech</b>\n\n<b>1.</b> Choose a voice.\n<b>2.</b> Choose output format.\n<b>3.</b> Send your text.\n\n<b>Selected voice:</b> ${selected?.voiceName || 'none'}\n<b>Output:</b> ${output.toUpperCase()}`,
    parse_mode: 'HTML',
    reply_markup: { inline_keyboard: rows },
  };

  if (messageId) {
    await callBot(botKey, 'editMessageText', { ...payload, message_id: messageId }).catch(async () => {
      const sent = await callBot<TelegramMessageResult>(botKey, 'sendMessage', payload);
      await saveMenuMessageId(env, userId, sent.result?.message_id);
    });
    await saveMenuMessageId(env, userId, messageId);
  } else {
    const sent = await callBot<TelegramMessageResult>(botKey, 'sendMessage', payload);
    await saveMenuMessageId(env, userId, sent.result?.message_id);
  }

  return true;
}

async function showMainMenu(botKey: string, chatId: number, messageId?: number): Promise<void> {
  const payload = {
    chat_id: chatId,
    text: '<b>AI Builder</b>\n\nChoose an option:',
    parse_mode: 'HTML',
    reply_markup: {
      inline_keyboard: [
        [{ text: 'Open Mini App', web_app: { url: 'https://builder-tel.vexaagent.workers.dev/builder' } }],
        [{ text: 'Chat with AI', callback_data: 'builder:chat' }],
        [{ text: 'Text to Speech', callback_data: 'builder:tts' }],
      ],
    },
  };
  if (messageId) await callBot(botKey, 'editMessageText', { ...payload, message_id: messageId }).catch(() => callBot(botKey, 'sendMessage', payload));
  else await callBot(botKey, 'sendMessage', payload);
}

async function speak(env: Env, botKey: string, chatId: number, userId: string, text: string, selected: TtsSelection, keep: boolean): Promise<void> {
  const apiKey = (env as Env & { ELEVENLABS_API_KEY?: string }).ELEVENLABS_API_KEY;
  if (!apiKey) return callBot(botKey, 'sendMessage', { chat_id: chatId, text: 'Text to Speech is not configured yet.' });
  if (text.length > 4800) return callBot(botKey, 'sendMessage', { chat_id: chatId, text: 'Text is too long. Please send text under 4800 characters.' });
  await callBot(botKey, 'sendChatAction', { chat_id: chatId, action: selected.output === 'voice' ? 'record_voice' : 'upload_voice' }).catch(() => undefined);
  try {
    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${selected.voiceId}`, { method: 'POST', headers: { 'xi-api-key': apiKey, 'content-type': 'application/json', accept: 'audio/mpeg' }, body: JSON.stringify({ text, model_id: 'eleven_v3', voice_settings: { stability: 0.5, similarity_boost: 0.75 } }) });
    if (!res.ok) throw new Error(`Voice service error ${res.status}`);
    const audio = await res.arrayBuffer();
    const form = new FormData();
    form.append('chat_id', String(chatId));
    form.append(selected.output === 'voice' ? 'voice' : 'audio', new Blob([audio], { type: 'audio/mpeg' }), `${selected.voiceName}.mp3`);
    if (selected.output === 'mp3') form.append('caption', `Voice: ${selected.voiceName}`);
    await callBotForm(botKey, selected.output === 'voice' ? 'sendVoice' : 'sendAudio', form);
    if (!keep) {
      await deleteTtsMenuMessage(env, botKey, chatId, userId);
      await showMenu(env, botKey, chatId, userId, 0, undefined, selected.output);
    }
  } catch (e) {
    await callBot(botKey, 'sendMessage', { chat_id: chatId, text: `Could not create speech. ${(e instanceof Error ? e.message : String(e)).slice(0, 120)}` });
  }
}

async function closeBuilderAiChat(env: Env, botKey: string, chatId: number, userId: string): Promise<boolean> {
  const chatKey = `builder-ai-chat:${userId}`;
  const active = await env.BOT_CACHE.get(chatKey).catch(() => null);
  if (!active) return false;

  await env.BOT_CACHE.delete(chatKey).catch(() => undefined);
  await env.BOT_CACHE.delete(`builder-ai-history:${userId}`).catch(() => undefined);
  await env.BOT_CACHE.delete(`builder-pending-action:${userId}`).catch(() => undefined);
  await clearTtsState(env, userId);
  await deleteLastMainMenu(env, botKey, chatId);
  await callBot(botKey, 'sendMessage', {
    chat_id: chatId,
    text: 'چت هوش مصنوعی بسته شد.',
    reply_markup: { remove_keyboard: true },
  });
  await showMainMenu(botKey, chatId);
  return true;
}

async function readSelection(env: Env, userId: string): Promise<TtsSelection | null> {
  const raw = await env.BOT_CACHE.get(keyOf(userId)).catch(() => null);
  return raw ? JSON.parse(raw) as TtsSelection : null;
}

async function saveSelection(env: Env, userId: string, selected: TtsSelection): Promise<void> {
  await env.BOT_CACHE.put(keyOf(userId), JSON.stringify(selected), { expirationTtl: TTS_TTL }).catch(() => undefined);
}

async function saveMenuMessageId(env: Env, userId: string, messageId: number | undefined): Promise<void> {
  if (!messageId) return;
  await env.BOT_CACHE.put(menuMessageKeyOf(userId), String(messageId), { expirationTtl: TTS_TTL }).catch(() => undefined);
}

async function deleteTtsMenuMessage(env: Env, botKey: string, chatId: number, userId: string): Promise<void> {
  const raw = await env.BOT_CACHE.get(menuMessageKeyOf(userId)).catch(() => null);
  const messageId = Number(raw);
  if (!Number.isFinite(messageId) || messageId <= 0) return;
  await callBot(botKey, 'deleteMessage', { chat_id: chatId, message_id: messageId }).catch(() => undefined);
}

async function deleteLastMainMenu(env: Env, botKey: string, chatId: number): Promise<void> {
  const raw = await env.BOT_CACHE.get(mainMenuKeyOf(chatId)).catch(() => null);
  const messageId = Number(raw);
  if (!Number.isFinite(messageId) || messageId <= 0) return;
  await callBot(botKey, 'deleteMessage', { chat_id: chatId, message_id: messageId }).catch(() => undefined);
  await env.BOT_CACHE.delete(mainMenuKeyOf(chatId)).catch(() => undefined);
}

function isEndText(text: string): boolean {
  return text === 'پایان' || text === 'End' || text === 'End Chat';
}

function keyOf(userId: string): string { return `builder-tts:${userId}`; }
function outputKeyOf(userId: string): string { return `builder-tts-output:${userId}`; }
function menuMessageKeyOf(userId: string): string { return `builder-tts-menu-message:${userId}`; }
function mainMenuKeyOf(chatId: number): string { return `builder-main-menu:${chatId}`; }

async function callBot<T = unknown>(key: string, method: string, payload: unknown): Promise<T> {
  const res = await fetch('https://api.telegram.org/' + 'bot' + key + '/' + method, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) });
  return res.json() as Promise<T>;
}

async function callBotForm<T = unknown>(key: string, method: string, form: FormData): Promise<T> {
  const res = await fetch('https://api.telegram.org/' + 'bot' + key + '/' + method, { method: 'POST', body: form });
  return res.json() as Promise<T>;
}