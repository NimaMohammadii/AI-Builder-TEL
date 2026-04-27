import type { BotBlueprint, BotButton, BotRecord, Env, TelegramCallbackQuery, TelegramMessage, TelegramUpdate } from './types';
import { aiReply } from './ai';
import { id, PUBLIC_BASE_URL, rateLimit, safeParseJson } from './utils';

export async function setTelegramWebhook(env: Env): Promise<{ ok: boolean; description?: string }> {
  return telegramApi(env.TELEGRAM_BOT_TOKEN, 'setWebhook', {
    url: `${PUBLIC_BASE_URL}/telegram`,
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
    await upsertBotUser(env, bot.id, update.message);
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
    await telegramApi(token, 'sendMessage', {
      chat_id: chatId,
      text: 'از دکمه‌ها استفاده کن یا پیام خودت را برای پشتیبانی هوشمند بفرست.',
    });
    return;
  }

  const allowed = await rateLimit(env.RATE_LIMITS, `ai:${bot.id}:${message.from?.id ?? chatId}`, 12, 60);
  if (!allowed) {
    await telegramApi(token, 'sendMessage', { chat_id: chatId, text: 'تعداد پیام‌ها زیاد شد. یک دقیقه بعد دوباره امتحان کن.' });
    return;
  }

  if (!blueprint.aiSupport.enabled) {
    await sendScreen(token, chatId, blueprint, blueprint.startScreen);
    return;
  }

  const answer = await aiReply(env, blueprint.aiSupport.systemPrompt, text);
  await env.DB.prepare('INSERT INTO ai_usage (id, bot_id, purpose, model, input_chars, output_chars) VALUES (?, ?, ?, ?, ?, ?)')
    .bind(id('use'), bot.id, 'bot_user_reply', 'gpt-5-mini', text.length, answer.length)
    .run();
  await telegramApi(token, 'sendMessage', { chat_id: chatId, text: answer });
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
    await sendProducts(env, token, bot.id, chatId);
    return;
  }

  if (data === 'support') {
    await telegramApi(token, 'sendMessage', {
      chat_id: chatId,
      text: blueprint.aiSupport.enabled
        ? 'سوالت را بفرست؛ پشتیبان هوشمند جواب می‌دهد. موارد حساس به ادمین ارجاع می‌شود.'
        : blueprint.aiSupport.handoffMessage,
    });
    return;
  }

  if (data.startsWith('product:')) {
    await sendProductDelivery(env, token, bot.id, chatId, data.slice('product:'.length));
    return;
  }

  await sendScreen(token, chatId, blueprint, blueprint.startScreen);
}

async function sendScreen(token: string, chatId: number, blueprint: BotBlueprint, screenId: string): Promise<void> {
  const screen = blueprint.screens.find((item) => item.id === screenId) ?? blueprint.screens[0];
  if (!screen) return;

  await telegramApi(token, 'sendMessage', {
    chat_id: chatId,
    text: screen.message,
    reply_markup: { inline_keyboard: buildKeyboard(screen.buttons) },
  });
}

async function sendProducts(env: Env, token: string, botId: string, chatId: number): Promise<void> {
  const rows = await env.DB.prepare('SELECT id, title, description, price_amount, currency FROM products WHERE bot_id = ? ORDER BY created_at DESC LIMIT 20')
    .bind(botId)
    .all<{ id: string; title: string; description: string; price_amount: number; currency: string }>();

  if (!rows.results.length) {
    await telegramApi(token, 'sendMessage', { chat_id: chatId, text: 'هنوز محصولی برای این ربات ثبت نشده.' });
    return;
  }

  const text = rows.results
    .map((product, index) => `${index + 1}. ${product.title}\n${product.description}\n${product.price_amount} ${product.currency}`)
    .join('\n\n');

  await telegramApi(token, 'sendMessage', {
    chat_id: chatId,
    text,
    reply_markup: {
      inline_keyboard: rows.results.map((product) => [{ text: `دریافت / خرید ${product.title}`, callback_data: `product:${product.id}` }]),
    },
  });
}

async function sendProductDelivery(env: Env, token: string, botId: string, chatId: number, productId: string): Promise<void> {
  const product = await env.DB.prepare('SELECT title, delivery_text FROM products WHERE bot_id = ? AND id = ?')
    .bind(botId, productId)
    .first<{ title: string; delivery_text: string }>();

  await telegramApi(token, 'sendMessage', {
    chat_id: chatId,
    text: product ? `✅ ${product.title}\n\n${product.delivery_text || 'تحویل این محصول هنوز تنظیم نشده.'}` : 'محصول پیدا نشد.',
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

async function upsertBotUser(env: Env, botId: string, message: TelegramMessage): Promise<void> {
  const user = message.from;
  if (!user) return;
  await env.DB.prepare(
    `INSERT INTO bot_users (bot_id, telegram_user_id, first_name, username, updated_at)
     VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
     ON CONFLICT(bot_id, telegram_user_id) DO UPDATE SET first_name = excluded.first_name, username = excluded.username, updated_at = CURRENT_TIMESTAMP`,
  )
    .bind(botId, String(user.id), user.first_name ?? null, user.username ?? null)
    .run();
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
