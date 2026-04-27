import type { BotBlueprint, BotButton, BotRecord, Env, TelegramCallbackQuery, TelegramMessage, TelegramUpdate } from './types';
import { aiReply } from './ai';
import { PUBLIC_BASE_URL, rateLimit, safeParseJson } from './utils';

export async function setTelegramWebhook(env: Env): Promise<{ ok: boolean; description?: string }> {
  return telegramApi(env.TELEGRAM_BOT_TOKEN, 'setWebhook', {
    url: `${PUBLIC_BASE_URL}/telegram/webhook`,
    allowed_updates: ['message', 'callback_query'],
    drop_pending_updates: true,
  });
}

export async function processTelegramUpdate(env: Env, bot: BotRecord, update: TelegramUpdate): Promise<void> {
  const blueprint = safeParseJson<BotBlueprint>(bot.blueprint_json, fallbackBlueprint());

  if (update.callback_query) {
    await handleCallback(env, env.TELEGRAM_BOT_TOKEN, bot, blueprint, update.callback_query);
    return;
  }

  if (update.message) {
    await saveBotUser(env, bot.id, update.message);
    await handleMessage(env, env.TELEGRAM_BOT_TOKEN, bot, blueprint, update.message);
  }
}

async function handleMessage(env: Env, token: string, bot: BotRecord, blueprint: BotBlueprint, message: TelegramMessage): Promise<void> {
  const chatId = message.chat.id;
  const text = message.text?.trim() ?? '';

  if (!text || text === '/start') {
    await sendScreen(token, chatId, blueprint, blueprint.startScreen);
    return;
  }

  if (text === '/help') {
    await sendText(token, chatId, 'از دکمه‌ها استفاده کن یا پیام خودت را برای پشتیبانی هوشمند بفرست.');
    return;
  }

  const allowed = await safeRateLimit(env, `ai:${bot.id}:${message.from?.id ?? chatId}`, 12, 60);
  if (!allowed) {
    await sendText(token, chatId, 'تعداد پیام‌ها زیاد شد. یک دقیقه بعد دوباره امتحان کن.');
    return;
  }

  if (!blueprint.aiSupport.enabled) {
    await sendScreen(token, chatId, blueprint, blueprint.startScreen);
    return;
  }

  const answer = await aiReply(env, blueprint.aiSupport.systemPrompt, text);
  await saveAiUsage(env, bot.id, text.length, answer.length);
  await sendText(token, chatId, answer);
}

async function handleCallback(env: Env, token: string, bot: BotRecord, blueprint: BotBlueprint, callback: TelegramCallbackQuery): Promise<void> {
  const chatId = callback.message?.chat.id ?? callback.from.id;
  const data = callback.data ?? '';
  await telegramApi(token, 'answerCallbackQuery', { callback_query_id: callback.id });

  if (data.startsWith('screen:')) {
    await sendScreen(token, chatId, blueprint, data.slice('screen:'.length));
    return;
  }

  if (data === 'products') {
    await sendText(token, chatId, 'بخش محصولات هنوز تنظیم نشده.');
    return;
  }

  if (data === 'support') {
    await sendText(token, chatId, blueprint.aiSupport.enabled ? 'سوالت را بفرست؛ پشتیبان هوشمند جواب می‌دهد.' : blueprint.aiSupport.handoffMessage);
    return;
  }

  await sendScreen(token, chatId, blueprint, blueprint.startScreen);
}

async function sendScreen(token: string, chatId: number, blueprint: BotBlueprint, screenId: string): Promise<void> {
  const screen = blueprint.screens.find((item) => item.id === screenId) ?? blueprint.screens[0];
  if (!screen) {
    await sendText(token, chatId, 'ربات فعال است.');
    return;
  }

  await telegramApi(token, 'sendMessage', {
    chat_id: chatId,
    text: screen.message,
    reply_markup: { inline_keyboard: buildKeyboard(screen.buttons) },
  });
}

function buildKeyboard(buttons: BotButton[]): Array<Array<Record<string, string>>> {
  return buttons.map((button) => {
    if (button.action.type === 'menu') return [{ text: button.text, callback_data: `screen:${button.action.target}` }];
    if (button.action.type === 'products') return [{ text: button.text, callback_data: 'products' }];
    if (button.action.type === 'support') return [{ text: button.text, callback_data: 'support' }];
    if (button.action.type === 'url') return [{ text: button.text, url: button.action.url }];
    return [{ text: button.text, callback_data: 'support' }];
  });
}

async function safeRateLimit(env: Env, key: string, limit: number, windowSeconds: number): Promise<boolean> {
  try {
    return await rateLimit(env.RATE_LIMITS, key, limit, windowSeconds);
  } catch {
    return true;
  }
}

async function saveBotUser(env: Env, botId: string, message: TelegramMessage): Promise<void> {
  const user = message.from;
  if (!user) return;
  try {
    await env.DB.prepare(
      `INSERT INTO bot_users (bot_id, telegram_user_id, first_name, username, updated_at)
       VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
       ON CONFLICT(bot_id, telegram_user_id) DO UPDATE SET first_name = excluded.first_name, username = excluded.username, updated_at = CURRENT_TIMESTAMP`,
    )
      .bind(botId, String(user.id), user.first_name ?? null, user.username ?? null)
      .run();
  } catch (error) {
    console.warn('saveBotUser failed', error);
  }
}

async function saveAiUsage(env: Env, botId: string, inputChars: number, outputChars: number): Promise<void> {
  try {
    await env.DB.prepare('INSERT INTO ai_usage (id, bot_id, purpose, model, input_chars, output_chars) VALUES (?, ?, ?, ?, ?, ?)')
      .bind(crypto.randomUUID(), botId, 'bot_user_reply', 'gpt-5-mini', inputChars, outputChars)
      .run();
  } catch (error) {
    console.warn('saveAiUsage failed', error);
  }
}

async function sendText(token: string, chatId: number, text: string): Promise<void> {
  await telegramApi(token, 'sendMessage', { chat_id: chatId, text });
}

async function telegramApi<T = { ok: boolean; description?: string }>(token: string, method: string, payload: unknown): Promise<T> {
  const response = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return response.json() as Promise<T>;
}

function fallbackBlueprint(): BotBlueprint {
  return {
    version: 1,
    botType: 'custom',
    language: 'fa',
    tone: 'friendly',
    startScreen: 'home',
    screens: [{ id: 'home', title: 'خانه', message: 'ربات فعال است.', buttons: [] }],
    aiSupport: { enabled: false, systemPrompt: '', handoffMessage: 'پیام شما ثبت شد.' },
    safety: { blockedTopics: [], requireHumanFor: [] },
  };
}
