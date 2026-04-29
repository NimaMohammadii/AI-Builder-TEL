import { createXaiImage } from './xai-image';
import { processTelegramUpdate as processBaseTelegramUpdate, setTelegramWebhook } from './telegram';
import type { BotRecord, Env, TelegramMessage, TelegramUpdate } from './types';
import { decryptUserToken, rateLimit } from './utils';

export { setTelegramWebhook };

export async function processTelegramUpdate(env: Env, bot: BotRecord, update: TelegramUpdate): Promise<void> {
  if (update.message) {
    const userBotToken = await decryptUserToken(env, bot.encrypted_token);
    const handled = await handleImageMode(env, userBotToken, bot.id, update.message);
    if (handled) return;
  }

  await processBaseTelegramUpdate(env, bot, update);
}

async function handleImageMode(env: Env, userBotToken: string, botId: string, message: TelegramMessage): Promise<boolean> {
  const chatId = message.chat.id;
  const userId = String(message.from?.id ?? chatId);
  const text = message.text?.trim() ?? '';
  const modeKey = `image-mode:${botId}:${userId}`;

  if (text === '/image') {
    await env.BOT_CACHE.put(modeKey, '1', { expirationTtl: 3600 }).catch(() => undefined);
    await callTelegram(userBotToken, 'sendMessage', {
      chat_id: chatId,
      text: 'Image mode is active. Send the image prompt. Use /cancel to exit.',
    });
    return true;
  }

  const active = await env.BOT_CACHE.get(modeKey).catch(() => null);
  if (!active) return false;

  if (text === '/cancel') {
    await env.BOT_CACHE.delete(modeKey).catch(() => undefined);
    await callTelegram(userBotToken, 'sendMessage', { chat_id: chatId, text: 'Image mode closed.' });
    return true;
  }

  if (text === '/start' || text === '/reset') {
    await env.BOT_CACHE.delete(modeKey).catch(() => undefined);
    return false;
  }

  if (!text || text.startsWith('/')) {
    await callTelegram(userBotToken, 'sendMessage', { chat_id: chatId, text: 'Send a text prompt, or use /cancel.' });
    return true;
  }

  const allowed = await safeImageRateLimit(env, `image:${botId}:${userId}`);
  if (!allowed) {
    await callTelegram(userBotToken, 'sendMessage', { chat_id: chatId, text: 'Image limit reached. Try again later.' });
    return true;
  }

  await callTelegram(userBotToken, 'sendMessage', { chat_id: chatId, text: 'Generating image...' });

  try {
    const image = await createXaiImage(env, text);
    if (image.url) {
      await callTelegram(userBotToken, 'sendPhoto', { chat_id: chatId, photo: image.url, caption: 'Generated image' });
    } else {
      throw new Error('No image URL returned.');
    }
  } catch (error) {
    await callTelegram(userBotToken, 'sendMessage', {
      chat_id: chatId,
      text: error instanceof Error ? error.message : 'Image generation failed.',
    });
  }

  return true;
}

async function safeImageRateLimit(env: Env, key: string): Promise<boolean> {
  try {
    return await rateLimit(env.RATE_LIMITS, key, 5, 3600);
  } catch {
    return true;
  }
}

async function callTelegram(userBotToken: string, method: string, payload: unknown): Promise<void> {
  const base = ['https://api.telegram.org', `bot${userBotToken}`, method].join('/');
  await fetch(base, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  });
}
