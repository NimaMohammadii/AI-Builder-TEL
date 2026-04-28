import { buildBlueprint } from './ai';
import type { BotBlueprint, BotButton, BotRecord, Env, TelegramCallbackQuery, TelegramMessage, TelegramUpdate } from './types';
import { APP_NAME, PUBLIC_BASE_URL, decryptUserToken, encryptUserToken, id, rateLimit, safeParseJson } from './utils';

type BuilderState =
  | { step: 'idle' }
  | { step: 'waiting_prompt' }
  | { step: 'waiting_token'; prompt: string; title: string; blueprint: BotBlueprint };

export async function setTelegramWebhook(env: Env): Promise<{ ok: boolean; description?: string }> {
  return telegramApi(env.TELEGRAM_BOT_TOKEN, 'setWebhook', {
    url: `${PUBLIC_BASE_URL}/telegram/webhook`,
    allowed_updates: ['message', 'callback_query'],
    drop_pending_updates: true,
  });
}

export async function processTelegramUpdate(env: Env, bot: BotRecord, update: TelegramUpdate): Promise<void> {
  const settings = safeParseJson<{ isBuilderBot?: boolean }>(bot.settings_json, {});
  const blueprint = safeParseJson<BotBlueprint>(bot.blueprint_json, mainBuilderBlueprint());
  const token = await decryptUserToken(env, bot.encrypted_token);

  if (update.callback_query) {
    if (settings.isBuilderBot) await handleBuilderCallback(env, token, bot, blueprint, update.callback_query);
    else await handleRuntimeCallback(env, token, bot, blueprint, update.callback_query);
    return;
  }

  if (update.message) {
    await saveBotUser(env, bot.id, update.message);
    if (settings.isBuilderBot) await handleBuilderMessage(env, token, bot, blueprint, update.message);
    else await handleRuntimeMessage(env, token, bot, blueprint, update.message);
  }
}

async function handleBuilderMessage(env: Env, token: string, bot: BotRecord, blueprint: BotBlueprint, message: TelegramMessage): Promise<void> {
  const chatId = message.chat.id;
  const userId = String(message.from?.id ?? chatId);
  const text = message.text?.trim() ?? '';

  if (!text || text === '/start') {
    await clearBuilderState(env, userId);
    await sendMainMenu(token, chatId);
    return;
  }

  if (text === '/newbot' || text === 'Build Bot') {
    await sendOpenMiniApp(token, chatId);
    return;
  }

  if (text === '/cancel') {
    await clearBuilderState(env, userId);
    await sendText(token, chatId, 'Cancelled. Open the Mini App to build or edit your bots.');
    return;
  }

  if (text === '/help') {
    await sendText(token, chatId, 'Open the Mini App to connect your BotFather token, chat with AI, and apply changes to your Telegram bot.');
    return;
  }

  await sendMainMenu(token, chatId);
}

async function handleBuilderCallback(env: Env, token: string, bot: BotRecord, blueprint: BotBlueprint, callback: TelegramCallbackQuery): Promise<void> {
  const chatId = callback.message?.chat.id ?? callback.from.id;
  const userId = String(callback.from.id);
  const data = callback.data ?? '';
  await telegramApi(token, 'answerCallbackQuery', { callback_query_id: callback.id });

  if (data === 'builder:mybots') {
    await sendMyBots(env, token, chatId, userId);
    return;
  }

  if (data === 'builder:help') {
    await sendText(token, chatId, 'Use the Mini App. It lets you connect a BotFather token, describe your bot, chat with AI, and apply changes instantly.');
    return;
  }

  await sendMainMenu(token, chatId);
}

async function handleRuntimeMessage(env: Env, token: string, bot: BotRecord, blueprint: BotBlueprint, message: TelegramMessage): Promise<void> {
  const chatId = message.chat.id;
  const text = message.text?.trim() ?? '';

  if (!text || text === '/start') {
    await sendScreen(token, chatId, blueprint, blueprint.startScreen);
    return;
  }

  if (text === '/help') {
    await sendText(token, chatId, 'Use the buttons or send a message to AI support.');
    return;
  }

  const allowed = await safeRateLimit(env, `ai:${bot.id}:${message.from?.id ?? chatId}`, 12, 60);
  if (!allowed) {
    await sendText(token, chatId, 'Too many messages. Try again in a minute.');
    return;
  }

  if (!blueprint.aiSupport.enabled) {
    await sendScreen(token, chatId, blueprint, blueprint.startScreen);
    return;
  }

  await sendText(token, chatId, await runtimeAiReply(env, blueprint, text));
}

async function handleRuntimeCallback(env: Env, token: string, bot: BotRecord, blueprint: BotBlueprint, callback: TelegramCallbackQuery): Promise<void> {
  const chatId = callback.message?.chat.id ?? callback.from.id;
  const data = callback.data ?? '';
  await telegramApi(token, 'answerCallbackQuery', { callback_query_id: callback.id });

  if (data.startsWith('screen:')) {
    await sendScreen(token, chatId, blueprint, data.slice('screen:'.length));
    return;
  }

  if (data === 'products') {
    await sendText(token, chatId, 'Products are not configured yet.');
    return;
  }

  if (data === 'support') {
    await sendText(token, chatId, blueprint.aiSupport.enabled ? 'Send your question. AI support will answer.' : blueprint.aiSupport.handoffMessage);
    return;
  }

  await sendScreen(token, chatId, blueprint, blueprint.startScreen);
}

async function sendMainMenu(token: string, chatId: number): Promise<void> {
  await telegramApi(token, 'sendMessage', {
    chat_id: chatId,
    text: 'Welcome to AI Builder TEL.\n\nBuild Telegram bots without code. Connect a BotFather token, chat with AI, and apply changes from one Mini App workspace.',
    reply_markup: {
      inline_keyboard: [
        [{ text: 'Build Bot Without Code', web_app: { url: `${PUBLIC_BASE_URL}/app` } }],
        [{ text: 'Open AI Workspace', web_app: { url: `${PUBLIC_BASE_URL}/app#workspace` } }],
        [{ text: 'My Bots', callback_data: 'builder:mybots' }, { text: 'Help', callback_data: 'builder:help' }],
      ],
    },
  });
}

async function sendOpenMiniApp(token: string, chatId: number): Promise<void> {
  await telegramApi(token, 'sendMessage', {
    chat_id: chatId,
    text: 'Open the Mini App to build, connect, and edit your bot.',
    reply_markup: { inline_keyboard: [[{ text: 'Open Mini App', web_app: { url: `${PUBLIC_BASE_URL}/app` } }]] },
  });
}

async function sendMyBots(env: Env, token: string, chatId: number, userId: string): Promise<void> {
  try {
    const rows = await env.DB.prepare('SELECT id, title, username, status, created_at FROM bots WHERE owner_telegram_id = ? ORDER BY created_at DESC LIMIT 10')
      .bind(userId)
      .all<{ id: string; title: string; username: string | null; status: string; created_at: string }>();

    if (!rows.results.length) {
      await sendText(token, chatId, 'No bots yet. Open the Mini App to create your first bot.');
      return;
    }

    const text = rows.results.map((bot, index) => `${index + 1}. ${bot.title}\n${bot.username ? '@' + bot.username : 'No username'}\nID: ${bot.id}\nStatus: ${bot.status}`).join('\n\n');
    await sendText(token, chatId, text);
  } catch (error) {
    console.error('my bots failed', error);
    await sendText(token, chatId, 'Could not load bots. Check D1 migrations.');
  }
}

async function sendScreen(token: string, chatId: number, blueprint: BotBlueprint, screenId: string): Promise<void> {
  const screen = blueprint.screens.find((item) => item.id === screenId) ?? blueprint.screens[0];
  if (!screen) {
    await sendText(token, chatId, 'Bot is active.');
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
  try { await env.BOT_CACHE.put(`builder-state:${userId}`, JSON.stringify(state), { expirationTtl: 1800 }); } catch (error) { console.warn('setBuilderState failed', error); }
}

async function clearBuilderState(env: Env, userId: string): Promise<void> {
  try { await env.BOT_CACHE.delete(`builder-state:${userId}`); } catch (error) { console.warn('clearBuilderState failed', error); }
}

async function safeRateLimit(env: Env, key: string, limit: number, windowSeconds: number): Promise<boolean> {
  try { return await rateLimit(env.RATE_LIMITS, key, limit, windowSeconds); } catch { return true; }
}

async function saveBotUser(env: Env, botId: string, message: TelegramMessage): Promise<void> {
  const user = message.from;
  if (!user) return;
  try {
    await env.DB.prepare(
      `INSERT INTO bot_users (bot_id, telegram_user_id, first_name, username, updated_at)
       VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
       ON CONFLICT(bot_id, telegram_user_id) DO UPDATE SET first_name = excluded.first_name, username = excluded.username, updated_at = CURRENT_TIMESTAMP`,
    ).bind(botId, String(user.id), user.first_name ?? null, user.username ?? null).run();
  } catch (error) { console.warn('saveBotUser failed', error); }
}

async function runtimeAiReply(env: Env, blueprint: BotBlueprint, text: string): Promise<string> {
  const { aiReply } = await import('./ai');
  return aiReply(env, blueprint.aiSupport.systemPrompt, text);
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
    language: 'en',
    tone: 'premium',
    startScreen: 'home',
    screens: [{ id: 'home', title: 'AI Builder TEL', message: 'Open the Mini App to build Telegram bots without code.', buttons: [] }],
    aiSupport: { enabled: false, systemPrompt: '', handoffMessage: 'Message saved.' },
    safety: { blockedTopics: [], requireHumanFor: [] },
  };
}
