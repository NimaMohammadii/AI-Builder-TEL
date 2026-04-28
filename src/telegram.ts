import { buildBlueprint } from './ai';
import type { BotBlueprint, BotButton, BotRecord, Env, TelegramCallbackQuery, TelegramMessage, TelegramUpdate } from './types';
import { APP_NAME, PUBLIC_BASE_URL, id, rateLimit, safeParseJson } from './utils';

type BuilderState = {
  step: 'idle' | 'waiting_prompt';
};

export async function setTelegramWebhook(env: Env): Promise<{ ok: boolean; description?: string }> {
  return telegramApi(env.TELEGRAM_BOT_TOKEN, 'setWebhook', {
    url: `${PUBLIC_BASE_URL}/telegram/webhook`,
    allowed_updates: ['message', 'callback_query'],
    drop_pending_updates: true,
  });
}

export async function processTelegramUpdate(env: Env, bot: BotRecord, update: TelegramUpdate): Promise<void> {
  const blueprint = safeParseJson<BotBlueprint>(bot.blueprint_json, mainBuilderBlueprint());

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
  const userId = String(message.from?.id ?? chatId);
  const text = message.text?.trim() ?? '';

  if (!text || text === '/start') {
    await clearBuilderState(env, userId);
    await sendMainMenu(token, chatId);
    return;
  }

  if (text === '/newbot' || text === 'ساخت ربات') {
    await setBuilderState(env, userId, { step: 'waiting_prompt' });
    await sendText(token, chatId, 'توضیح بده چه رباتی می‌خوای بسازی. مثال:\n\nیه ربات فروش دوره زبان می‌خوام که محصول داشته باشه، پشتیبانی هوشمند بده، بعد از خرید لینک بده و لحنش حرفه‌ای باشه.');
    return;
  }

  if (text === '/cancel') {
    await clearBuilderState(env, userId);
    await sendText(token, chatId, 'لغو شد. برای ساخت ربات جدید /newbot را بزن.');
    return;
  }

  const state = await getBuilderState(env, userId);
  if (state.step === 'waiting_prompt') {
    await createBotFromPrompt(env, token, chatId, userId, text);
    return;
  }

  if (text === '/help') {
    await sendText(token, chatId, 'برای ساخت ربات جدید /newbot را بزن. برای لغو /cancel را بزن.');
    return;
  }

  if (!blueprint.aiSupport.enabled) {
    await sendMainMenu(token, chatId);
    return;
  }

  const allowed = await safeRateLimit(env, `ai:${bot.id}:${userId}`, 12, 60);
  if (!allowed) {
    await sendText(token, chatId, 'تعداد پیام‌ها زیاد شد. یک دقیقه بعد دوباره امتحان کن.');
    return;
  }

  const answer = 'برای ساخت ربات جدید روی «ساخت ربات» بزن یا دستور /newbot را ارسال کن.';
  await sendText(token, chatId, answer);
}

async function handleCallback(env: Env, token: string, bot: BotRecord, blueprint: BotBlueprint, callback: TelegramCallbackQuery): Promise<void> {
  const chatId = callback.message?.chat.id ?? callback.from.id;
  const userId = String(callback.from.id);
  const data = callback.data ?? '';
  await telegramApi(token, 'answerCallbackQuery', { callback_query_id: callback.id });

  if (data === 'builder:new') {
    await setBuilderState(env, userId, { step: 'waiting_prompt' });
    await sendText(token, chatId, 'چی می‌خوای بسازی؟ کامل توضیح بده تا AI ساختار رباتت رو بسازه.\n\nمثال: ربات فروش فایل با منوی محصولات، پرداخت، تحویل لینک و پشتیبانی هوشمند.');
    return;
  }

  if (data === 'builder:help') {
    await sendText(token, chatId, 'این ربات با توضیح فارسی، blueprint ربات تلگرامی می‌سازه. فعلاً ساختار، منوها و متن‌ها ساخته و ذخیره می‌شن. مرحله بعد اتصال Mini App و پنل مدیریت است.');
    return;
  }

  if (data === 'builder:mybots') {
    await sendMyBots(env, token, chatId, userId);
    return;
  }

  if (data.startsWith('screen:')) {
    await sendScreen(token, chatId, blueprint, data.slice('screen:'.length));
    return;
  }

  await sendMainMenu(token, chatId);
}

async function createBotFromPrompt(env: Env, token: string, chatId: number, userId: string, prompt: string): Promise<void> {
  if (prompt.length < 10) {
    await sendText(token, chatId, 'توضیحت خیلی کوتاهه. دقیق‌تر بگو ربات چه کاری انجام بده.');
    return;
  }

  const allowed = await safeRateLimit(env, `create-bot:${userId}`, 5, 3600);
  if (!allowed) {
    await sendText(token, chatId, 'فعلاً سقف ساخت ربات پر شده. یک ساعت بعد دوباره امتحان کن.');
    return;
  }

  await sendText(token, chatId, 'در حال ساخت ربات با AI...');

  const blueprint = await buildBlueprint(env, prompt);
  const botId = id('bot');
  const title = inferTitle(prompt);

  try {
    await env.DB.prepare(
      `INSERT INTO bots (id, owner_telegram_id, username, title, status, encrypted_token, webhook_secret, blueprint_json, settings_json)
       VALUES (?, ?, ?, ?, 'active', ?, ?, ?, ?)`,
    )
      .bind(
        botId,
        userId,
        null,
        title,
        'env:TELEGRAM_BOT_TOKEN',
        'shared-webhook',
        JSON.stringify(blueprint),
        JSON.stringify({ sourcePrompt: prompt, createdFromTelegram: true }),
      )
      .run();

    await clearBuilderState(env, userId);
    await sendText(token, chatId, `✅ رباتت ساخته شد.\n\nنام: ${title}\nشناسه: ${botId}\n\nاز این به بعد وقتی با همین ربات پیام بدی، آخرین ربات فعال خودت اجرا می‌شه.\n\nبرای ساخت یکی دیگه /newbot را بزن.`);
  } catch (error) {
    console.error('create bot from prompt failed', error);
    await sendText(token, chatId, 'ساخت ربات شکست خورد. احتمالاً migration دیتابیس کامل اجرا نشده. جدول bots باید وجود داشته باشه.');
  }
}

async function sendMainMenu(token: string, chatId: number): Promise<void> {
  await telegramApi(token, 'sendMessage', {
    chat_id: chatId,
    text: 'به AI Builder TEL خوش اومدی.\n\nاینجا می‌تونی فقط با توضیح فارسی، ساختار ربات تلگرامی خودت رو بسازی.',
    reply_markup: {
      inline_keyboard: [
        [{ text: 'ساخت ربات جدید', callback_data: 'builder:new' }],
        [{ text: 'ربات‌های من', callback_data: 'builder:mybots' }],
        [{ text: 'راهنما', callback_data: 'builder:help' }],
      ],
    },
  });
}

async function sendMyBots(env: Env, token: string, chatId: number, userId: string): Promise<void> {
  try {
    const rows = await env.DB.prepare('SELECT id, title, status, created_at FROM bots WHERE owner_telegram_id = ? ORDER BY created_at DESC LIMIT 10')
      .bind(userId)
      .all<{ id: string; title: string; status: string; created_at: string }>();

    if (!rows.results.length) {
      await sendText(token, chatId, 'هنوز رباتی نساختی. برای شروع «ساخت ربات جدید» را بزن.');
      return;
    }

    const text = rows.results.map((bot, index) => `${index + 1}. ${bot.title}\nID: ${bot.id}\nStatus: ${bot.status}`).join('\n\n');
    await sendText(token, chatId, text);
  } catch (error) {
    console.error('my bots failed', error);
    await sendText(token, chatId, 'فعلاً نتونستم ربات‌ها رو بخونم. migration دیتابیس را چک کن.');
  }
}

async function sendScreen(token: string, chatId: number, blueprint: BotBlueprint, screenId: string): Promise<void> {
  const screen = blueprint.screens.find((item) => item.id === screenId) ?? blueprint.screens[0];
  if (!screen) {
    await sendMainMenu(token, chatId);
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

async function getBuilderState(env: Env, userId: string): Promise<BuilderState> {
  try {
    const value = await env.BOT_CACHE.get(`builder-state:${userId}`);
    return value ? safeParseJson<BuilderState>(value, { step: 'idle' }) : { step: 'idle' };
  } catch {
    return { step: 'idle' };
  }
}

async function setBuilderState(env: Env, userId: string, state: BuilderState): Promise<void> {
  try {
    await env.BOT_CACHE.put(`builder-state:${userId}`, JSON.stringify(state), { expirationTtl: 1800 });
  } catch (error) {
    console.warn('setBuilderState failed', error);
  }
}

async function clearBuilderState(env: Env, userId: string): Promise<void> {
  try {
    await env.BOT_CACHE.delete(`builder-state:${userId}`);
  } catch (error) {
    console.warn('clearBuilderState failed', error);
  }
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

function mainBuilderBlueprint(): BotBlueprint {
  return {
    version: 1,
    botType: 'custom',
    language: 'fa',
    tone: 'premium',
    startScreen: 'home',
    screens: [
      {
        id: 'home',
        title: 'AI Builder TEL',
        message: 'به AI Builder TEL خوش اومدی. برای ساخت ربات جدید دکمه زیر را بزن.',
        buttons: [{ text: 'ساخت ربات جدید', action: { type: 'support' } }],
      },
    ],
    aiSupport: { enabled: false, systemPrompt: '', handoffMessage: 'پیام شما ثبت شد.' },
    safety: { blockedTopics: [], requireHumanFor: [] },
  };
}

function inferTitle(prompt: string): string {
  const cleaned = prompt.replace(/\s+/g, ' ').trim();
  if (cleaned.length <= 32) return cleaned;
  return cleaned.slice(0, 32) + '...';
}
