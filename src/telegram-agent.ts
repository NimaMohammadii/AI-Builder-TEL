import { aiReply, defaultBlueprint, defaultFlow, improveBlueprint, improveFlow, type BotFlow, type ChatHistoryMessage } from './ai';
import { processTelegramUpdate as baseProcessTelegramUpdate, setTelegramWebhook } from './telegram';
import type { BotBlueprint, BotRecord, Env, TelegramCallbackQuery, TelegramMessage, TelegramUpdate } from './types';
import { PUBLIC_BASE_URL, decryptUserToken, safeParseJson } from './utils';

export { setTelegramWebhook };

type AgentBotSnapshot = {
  id: string;
  title: string;
  username: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  flow?: BotFlow | null;
  blueprint?: BotBlueprint | null;
};

export async function processTelegramUpdate(env: Env, bot: BotRecord, update: TelegramUpdate): Promise<void> {
  const settings = safeParseJson<{ isBuilderBot?: boolean }>(bot.settings_json, {});
  if (!settings.isBuilderBot) {
    await baseProcessTelegramUpdate(env, bot, update);
    return;
  }

  const token = await decryptUserToken(env, bot.encrypted_token);
  if (update.callback_query) {
    await handleBuilderCallback(env, token, update.callback_query);
    return;
  }
  if (update.message) {
    await handleBuilderMessage(env, token, update.message);
  }
}

async function handleBuilderMessage(env: Env, token: string, message: TelegramMessage): Promise<void> {
  const chatId = message.chat.id;
  const userId = String(message.from?.id ?? chatId);
  const text = message.text?.trim() ?? '';
  const chatKey = `builder-ai-chat:${userId}`;
  const historyKey = `builder-ai-history:${userId}`;

  if (!text || text === '/start') {
    await env.BOT_CACHE.delete(chatKey).catch(() => undefined);
    await sendMainMenu(token, chatId);
    return;
  }

  if (text === 'End Chat' || text === '/cancel') {
    await env.BOT_CACHE.delete(chatKey).catch(() => undefined);
    await env.BOT_CACHE.delete(historyKey).catch(() => undefined);
    await telegramApi(token, 'sendMessage', { chat_id: chatId, text: lang(text, 'چت بسته شد.', 'AI chat closed.'), reply_markup: { remove_keyboard: true } });
    await sendMainMenu(token, chatId);
    return;
  }

  const active = await env.BOT_CACHE.get(chatKey).catch(() => null);
  if (!active) {
    if (text === '/newbot' || /^(build bot|connect|token)$/i.test(text)) {
      await sendOpenMiniApp(token, chatId);
      return;
    }
    await sendMainMenu(token, chatId);
    return;
  }

  await handleAgentChat(env, token, chatId, userId, text);
}

async function handleBuilderCallback(env: Env, token: string, callback: TelegramCallbackQuery): Promise<void> {
  const chatId = callback.message?.chat.id ?? callback.from.id;
  const userId = String(callback.from.id);
  const data = callback.data ?? '';
  await telegramApi(token, 'answerCallbackQuery', { callback_query_id: callback.id });

  if (data === 'builder:chat') {
    await env.BOT_CACHE.put(`builder-ai-chat:${userId}`, '1', { expirationTtl: 7200 }).catch(() => undefined);
    const bots = await loadOwnerBots(env, userId);
    const intro = bots.length
      ? `AI chat is ready. I can see ${bots.length} connected bot${bots.length > 1 ? 's' : ''}. Tell me what to change.`
      : 'AI chat is ready. Connect a BotFather token in the Mini App when you want me to build or edit a bot.';
    await telegramApi(token, 'sendMessage', {
      chat_id: chatId,
      text: intro,
      reply_markup: { keyboard: [[{ text: 'End Chat' }]], resize_keyboard: true, one_time_keyboard: false },
    });
    return;
  }

  if (data === 'builder:mybots') {
    await sendMyBots(env, token, chatId, userId);
    return;
  }

  if (data === 'builder:help') {
    await sendText(token, chatId, 'Mini App = token/results/settings. Telegram chat = AI agent for chatting and editing your bots.');
    return;
  }

  await sendMainMenu(token, chatId);
}

async function handleAgentChat(env: Env, token: string, chatId: number, userId: string, text: string): Promise<void> {
  const historyKey = `builder-ai-history:${userId}`;
  const history = await loadChatHistory(env, historyKey);
  const bots = await loadOwnerBots(env, userId);
  const target = pickBot(text, bots) ?? bots[0] ?? null;
  const intent = detectIntent(text);

  if (intent === 'publish' || intent === 'activate' || intent === 'pause') {
    const reply = await runStatusAction(env, token, userId, target, intent, text);
    await saveChatHistory(env, historyKey, history, text, reply);
    await sendText(token, chatId, reply);
    return;
  }

  if (intent === 'modify') {
    if (!target) {
      const reply = await agentReply(env, text, history, bots, null, 'The user wants to build or edit a bot, but they have no connected bot yet. Tell them to connect a BotFather token in the Mini App.');
      await saveChatHistory(env, historyKey, history, text, reply);
      await sendText(token, chatId, reply);
      return;
    }

    await sendTyping(token, chatId);
    const fullBot = await getBot(env, target.id);
    if (!fullBot) {
      const reply = lang(text, 'ربات را پیدا نکردم.', 'I could not find that bot.');
      await sendText(token, chatId, reply);
      return;
    }

    const settings = safeParseJson<Record<string, unknown>>(fullBot.settings_json, {});
    const currentBlueprint = safeParseJson<BotBlueprint>(fullBot.blueprint_json, defaultBlueprint('Telegram bot'));
    const currentFlow = (settings.flow as BotFlow | undefined) ?? defaultFlow('Telegram bot');
    const instruction = buildAgentEditInstruction(text, history, bots, target);
    const [blueprintResult, flowResult] = await Promise.all([
      improveBlueprint(env, currentBlueprint, instruction),
      improveFlow(env, currentFlow, instruction),
    ]);
    settings.flow = flowResult.flow;
    await env.DB.prepare('UPDATE bots SET blueprint_json = ?, settings_json = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .bind(JSON.stringify(blueprintResult.blueprint), JSON.stringify(settings), fullBot.id)
      .run();
    await env.BOT_CACHE.delete(`bot:${fullBot.id}`).catch(() => undefined);

    const reply = compact(`${flowResult.summary}\n${blueprintResult.summary}`);
    await saveChatHistory(env, historyKey, history, text, reply);
    await sendText(token, chatId, reply);
    return;
  }

  const reply = await agentReply(env, text, history, bots, target, 'Answer from the database context. If the user says they connected a bot token, confirm based on the connected bots list. Never claim a token is missing when bots exist.');
  await saveChatHistory(env, historyKey, history, text, reply);
  await sendText(token, chatId, reply);
}

function detectIntent(text: string): 'modify' | 'publish' | 'activate' | 'pause' | 'chat' {
  const t = text.toLowerCase();
  if (/\b(publish|deploy|set webhook)\b|انتشار|پابلیش|دیپلوی|وبهوک/.test(t)) return 'publish';
  if (/\b(activate|resume|unpause|start bot)\b|فعال کن|روشن کن/.test(t)) return 'activate';
  if (/\b(pause|stop bot|disable)\b|خاموش کن|غیرفعال|متوقف/.test(t)) return 'pause';
  if (/\b(bot|telegram|flow|menu|button|change|edit|add|remove|build|create|make)\b|ربات|بات|تلگرام|فلو|منو|دکمه|تغییر|ویرایش|اضافه|حذف|بساز|ساخت/.test(t)) return 'modify';
  return 'chat';
}

async function runStatusAction(env: Env, builderToken: string, userId: string, target: AgentBotSnapshot | null, action: 'publish' | 'activate' | 'pause', text: string): Promise<string> {
  if (!target) return await agentReply(env, text, [], [], null, 'The user wants an action but has no connected bots. Tell them to connect a BotFather token in the Mini App.');
  const bot = await getBot(env, target.id);
  if (!bot) return lang(text, 'ربات را پیدا نکردم.', 'I could not find that bot.');
  const userBotToken = await decryptUserToken(env, bot.encrypted_token);

  if (action === 'pause') {
    await deleteBotWebhook(userBotToken).catch(() => undefined);
    await env.DB.prepare("UPDATE bots SET status = 'paused', updated_at = CURRENT_TIMESTAMP WHERE id = ?").bind(bot.id).run();
    await env.BOT_CACHE.delete(`bot:${bot.id}`).catch(() => undefined);
    return lang(text, `ربات ${botLabel(bot)} متوقف شد.`, `${botLabel(bot)} paused.`);
  }

  const webhookUrl = `${PUBLIC_BASE_URL}/bot/${bot.id}/webhook`;
  const result = await setBotWebhook(userBotToken, webhookUrl);
  if (!result.ok) return result.description ?? lang(text, 'فعال‌سازی وبهوک ناموفق بود.', 'Webhook activation failed.');
  const settings = safeParseJson<Record<string, unknown>>(bot.settings_json, {});
  settings.webhookUrl = webhookUrl;
  await env.DB.prepare("UPDATE bots SET status = 'active', settings_json = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").bind(JSON.stringify(settings), bot.id).run();
  await env.BOT_CACHE.delete(`bot:${bot.id}`).catch(() => undefined);
  return lang(text, `ربات ${botLabel(bot)} فعال شد.`, `${botLabel(bot)} is active.`);
}

async function agentReply(env: Env, text: string, history: ChatHistoryMessage[], bots: AgentBotSnapshot[], target: AgentBotSnapshot | null, extra: string): Promise<string> {
  const context = [
    'You are a real Telegram bot-builder agent inside AI Builder TEL.',
    'You can read the user database context below and must answer based on it.',
    'Do not use canned onboarding text. Do not say token is missing if connected_bots_count > 0.',
    'Reply in the same language as the user. Be short, direct, and natural.',
    extra,
    `connected_bots_count: ${bots.length}`,
    `target_bot: ${target ? summarizeBot(target) : 'none'}`,
    `connected_bots: ${bots.map(summarizeBot).join(' | ') || 'none'}`,
  ].join('\n');
  return aiReply(env, context, text, history);
}

function buildAgentEditInstruction(text: string, history: ChatHistoryMessage[], bots: AgentBotSnapshot[], target: AgentBotSnapshot): string {
  return [
    'Act as an autonomous bot-builder agent. Apply the latest user request to the selected bot.',
    `Selected bot: ${summarizeBot(target)}`,
    `All connected bots: ${bots.map(summarizeBot).join(' | ')}`,
    `Recent conversation: ${history.slice(-8).map((m) => `${m.role}: ${m.content}`).join('\n')}`,
    `Latest request: ${text}`,
  ].join('\n\n');
}

async function loadOwnerBots(env: Env, userId: string): Promise<AgentBotSnapshot[]> {
  try {
    const rows = await env.DB.prepare('SELECT id, title, username, status, blueprint_json, settings_json, created_at, updated_at FROM bots WHERE owner_telegram_id = ? ORDER BY updated_at DESC LIMIT 10')
      .bind(userId)
      .all<BotRecord>();
    return (rows.results ?? []).map((bot) => {
      const settings = safeParseJson<Record<string, unknown>>(bot.settings_json, {});
      return {
        id: bot.id,
        title: bot.title,
        username: bot.username,
        status: bot.status,
        created_at: bot.created_at,
        updated_at: bot.updated_at,
        blueprint: safeParseJson<BotBlueprint | null>(bot.blueprint_json, null),
        flow: (settings.flow as BotFlow | undefined) ?? null,
      };
    });
  } catch (error) {
    console.error('agent load bots failed', error);
    return [];
  }
}

async function getBot(env: Env, botId: string): Promise<BotRecord | null> {
  try {
    return (await env.DB.prepare('SELECT * FROM bots WHERE id = ?').bind(botId).first<BotRecord>()) ?? null;
  } catch {
    return null;
  }
}

function pickBot(text: string, bots: AgentBotSnapshot[]): AgentBotSnapshot | null {
  if (!bots.length) return null;
  const t = text.toLowerCase();
  for (const bot of bots) {
    if (bot.username && t.includes(`@${bot.username.toLowerCase()}`)) return bot;
    if (t.includes(bot.id.toLowerCase())) return bot;
    if (bot.title && t.includes(bot.title.toLowerCase())) return bot;
  }
  return bots[0];
}

function summarizeBot(bot: AgentBotSnapshot): string {
  const parts = [bot.title, bot.username ? `@${bot.username}` : null, `id=${bot.id}`, `status=${bot.status}`].filter(Boolean);
  const flowName = bot.flow?.name ? `flow=${bot.flow.name}` : null;
  if (flowName) parts.push(flowName);
  return parts.join(', ');
}

function botLabel(bot: Pick<BotRecord, 'title' | 'username'>): string {
  return bot.username ? `@${bot.username}` : bot.title;
}

async function sendMyBots(env: Env, token: string, chatId: number, userId: string): Promise<void> {
  const bots = await loadOwnerBots(env, userId);
  if (!bots.length) {
    await sendText(token, chatId, 'No connected bots yet.');
    return;
  }
  await sendText(token, chatId, bots.map((bot, index) => `${index + 1}. ${bot.title}\n${bot.username ? '@' + bot.username : bot.id}\n${bot.status}`).join('\n\n'));
}

async function sendMainMenu(token: string, chatId: number): Promise<void> {
  await telegramApi(token, 'sendMessage', {
    chat_id: chatId,
    text: 'AI Builder TEL',
    reply_markup: { inline_keyboard: [[{ text: 'Open Mini App', web_app: { url: `${PUBLIC_BASE_URL}/app` } }], [{ text: 'Chat with AI', callback_data: 'builder:chat' }], [{ text: 'My Bots', callback_data: 'builder:mybots' }, { text: 'Help', callback_data: 'builder:help' }]] },
  });
}

async function sendOpenMiniApp(token: string, chatId: number): Promise<void> {
  await telegramApi(token, 'sendMessage', { chat_id: chatId, text: 'Open Mini App.', reply_markup: { inline_keyboard: [[{ text: 'Open Mini App', web_app: { url: `${PUBLIC_BASE_URL}/app` } }]] } });
}

async function loadChatHistory(env: Env, key: string): Promise<ChatHistoryMessage[]> {
  const raw = await env.BOT_CACHE.get(key).catch(() => null);
  const parsed = raw ? safeParseJson<ChatHistoryMessage[]>(raw, []) : [];
  return Array.isArray(parsed) ? parsed.filter((item) => item && (item.role === 'user' || item.role === 'assistant') && typeof item.content === 'string').slice(-16) : [];
}

async function saveChatHistory(env: Env, key: string, history: ChatHistoryMessage[], userText: string, assistantText: string): Promise<void> {
  const next = [...history, { role: 'user' as const, content: userText.slice(0, 1800) }, { role: 'assistant' as const, content: assistantText.slice(0, 1800) }].slice(-16);
  await env.BOT_CACHE.put(key, JSON.stringify(next), { expirationTtl: 7200 }).catch(() => undefined);
}

function compact(text: string): string {
  return text.split('\n').map((line) => line.trim()).filter(Boolean).slice(0, 2).join('\n') || 'Done.';
}

function lang(source: string, fa: string, en: string): string {
  return /[\u0600-\u06FF]/.test(source) ? fa : en;
}

async function setBotWebhook(token: string, url: string): Promise<{ ok: boolean; description?: string }> {
  const response = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ url, allowed_updates: ['message', 'callback_query'], drop_pending_updates: true }) });
  return response.json() as Promise<{ ok: boolean; description?: string }>;
}

async function deleteBotWebhook(token: string): Promise<{ ok: boolean; description?: string }> {
  const response = await fetch(`https://api.telegram.org/bot${token}/deleteWebhook`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ drop_pending_updates: true }) });
  return response.json() as Promise<{ ok: boolean; description?: string }>;
}

async function sendTyping(token: string, chatId: number): Promise<void> {
  await telegramApi(token, 'sendChatAction', { chat_id: chatId, action: 'typing' }).catch(() => undefined);
}

async function sendText(token: string, chatId: number, text: string): Promise<void> {
  await telegramApi(token, 'sendMessage', { chat_id: chatId, text });
}

async function telegramApi<T = { ok: boolean; description?: string }>(token: string, method: string, payload: unknown): Promise<T> {
  const response = await fetch(`https://api.telegram.org/bot${token}/${method}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) });
  return response.json() as Promise<T>;
}
