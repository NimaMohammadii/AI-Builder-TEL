import type { BotFlow, ChatHistoryMessage } from './ai';
import { createXaiImage } from './xai-image';
import { createXaiImageFromReference } from './xai-reference-image';
import { getImageModeText, getTelegramReferenceImage, messageHasPhoto } from './image-reference';
import type { BotBlueprint, BotButton, BotRecord, Env, TelegramCallbackQuery, TelegramMessage, TelegramUpdate } from './types';
import { APP_NAME, PUBLIC_BASE_URL, decryptUserToken, rateLimit, safeParseJson } from './utils';

type UserFlowState = { nodeId: string; data: Record<string, string> };

export async function setTelegramWebhook(env: Env): Promise<{ ok: boolean; description?: string }> {
  return telegramApi(env.TELEGRAM_BOT_TOKEN, 'setWebhook', {
    url: `${PUBLIC_BASE_URL}/telegram/webhook`,
    allowed_updates: ['message', 'callback_query'],
    drop_pending_updates: true,
  });
}

export async function processTelegramUpdate(env: Env, bot: BotRecord, update: TelegramUpdate): Promise<void> {
  const settings = safeParseJson<{ isBuilderBot?: boolean; flow?: BotFlow }>(bot.settings_json, {});
  const blueprint = safeParseJson<BotBlueprint>(bot.blueprint_json, mainBuilderBlueprint());
  const token = await decryptUserToken(env, bot.encrypted_token);

  if (update.callback_query) {
    if (settings.isBuilderBot) await handleBuilderCallback(env, token, update.callback_query);
    else if (settings.flow) await handleFlowCallback(env, token, bot, settings.flow, update.callback_query);
    else await handleRuntimeCallback(env, token, bot, blueprint, update.callback_query);
    return;
  }

  if (update.message) {
    await saveBotUser(env, bot.id, update.message);
    const imageHandled = await handleImageCommand(env, token, bot.id, update.message);
    if (imageHandled) return;
    if (settings.isBuilderBot) await handleBuilderMessage(env, token, update.message);
    else if (settings.flow) await handleFlowMessage(env, token, bot, settings.flow, update.message);
    else await handleRuntimeMessage(env, token, bot, blueprint, update.message);
  }
}

async function handleImageCommand(env: Env, token: string, botId: string, message: TelegramMessage): Promise<boolean> {
  const chatId = message.chat.id;
  const userId = String(message.from?.id ?? chatId);
  const text = message.text?.trim() ?? '';
  const imageModeText = getImageModeText(message);
  const hasPhoto = messageHasPhoto(message);
  const stateKey = `image-mode:${botId}:${userId}`;

  if (text === '/image') {
    await env.BOT_CACHE.put(stateKey, '1', { expirationTtl: 3600 }).catch(() => undefined);
    await sendText(token, chatId, 'Image mode activated. Send a text prompt or photo+caption. Use /cancel to exit.');
    return true;
  }

  const active = await env.BOT_CACHE.get(stateKey).catch(() => null);
  if (!active) return false;

  if (imageModeText === '/cancel') {
    await env.BOT_CACHE.delete(stateKey).catch(() => undefined);
    await sendText(token, chatId, 'Image mode closed.');
    return true;
  }

  if (imageModeText === '/start' || imageModeText === '/reset') {
    await env.BOT_CACHE.delete(stateKey).catch(() => undefined);
    return false;
  }

  if ((!imageModeText && !hasPhoto) || (imageModeText.startsWith('/') && !hasPhoto)) {
    await sendText(token, chatId, 'Send a text prompt or photo with caption/instruction, or use /cancel.');
    return true;
  }

  await sendText(token, chatId, hasPhoto ? 'Sending your image directly to Grok and generating...' : 'Generating image...');
  try {
    const image = hasPhoto
      ? await createXaiImageFromReference(env, imageModeText || 'Use this image as the visual reference and generate a high quality result.', await requireTelegramReferenceImage(token, message))
      : await createXaiImage(env, imageModeText);
    if (!image.url) throw new Error('No image URL returned.');
    await telegramApi(token, 'sendPhoto', { chat_id: chatId, photo: image.url, caption: 'Generated image' });
    await sendText(token, chatId, 'Send another prompt or photo+caption, or use /cancel to exit.');
  } catch (error) {
    console.error('image generation failed', error);
    await sendText(token, chatId, error instanceof Error ? error.message : 'Image generation failed.');
  }
  return true;
}

async function requireTelegramReferenceImage(token: string, message: TelegramMessage) {
  const reference = await getTelegramReferenceImage(token, message);
  if (!reference) throw new Error('No reference image found.');
  return reference;
}

async function handleBuilderMessage(env: Env, token: string, message: TelegramMessage): Promise<void> {
  const chatId = message.chat.id;
  const userId = String(message.from?.id ?? chatId);
  const text = message.text?.trim() ?? '';
  const chatStateKey = `builder-ai-chat:${userId}`;
  const historyKey = `builder-ai-history:${userId}`;

  if (!text || text === '/start') {
    await env.BOT_CACHE.delete(`builder-state:${userId}`).catch(() => undefined);
    await env.BOT_CACHE.delete(chatStateKey).catch(() => undefined);
    await sendMainMenu(token, chatId);
    return;
  }

  if (text === 'End Chat' || text === '/cancel') {
    await env.BOT_CACHE.delete(chatStateKey).catch(() => undefined);
    await env.BOT_CACHE.delete(historyKey).catch(() => undefined);
    await telegramApi(token, 'sendMessage', { chat_id: chatId, text: 'AI chat closed.', reply_markup: { remove_keyboard: true } });
    await sendMainMenu(token, chatId);
    return;
  }

  const aiChatActive = await env.BOT_CACHE.get(chatStateKey).catch(() => null);
  if (aiChatActive) {
    await handleBuilderAiChat(env, token, chatId, userId, text);
    return;
  }

  if (text === '/newbot' || text === 'Build Bot') {
    await sendOpenMiniApp(token, chatId);
    return;
  }
  if (text === '/help') {
    await sendText(token, chatId, 'Open the Mini App to connect tokens, view results, and manage settings. Use Chat with AI here in Telegram to edit your bot.');
    return;
  }
  await sendMainMenu(token, chatId);
}

async function handleBuilderAiChat(env: Env, token: string, chatId: number, userId: string, text: string): Promise<void> {
  const bot = await getLatestOwnerBot(env, userId);
  const historyKey = `builder-ai-history:${userId}`;
  const history = await loadChatHistory(env, historyKey);
  const isBotRequest = /bot|telegram|build|create|flow|menu|button|ربات|تلگرام|ساخت|بساز|تغییر|ویرایش|دکمه|منو/i.test(text);

  if (bot && isBotRequest) {
    await sendText(token, chatId, 'Applying changes to your latest bot...');
    const currentBlueprint = safeParseJson<BotBlueprint>(bot.blueprint_json, mainBuilderBlueprint());
    const settings = safeParseJson<Record<string, unknown>>(bot.settings_json, {});
    const currentFlow = ((settings.flow as BotFlow | undefined) ?? undefined);
    const [{ improveBlueprint }, { improveFlow, defaultFlow }] = await Promise.all([import('./ai'), import('./ai')]);
    const flow = currentFlow ?? defaultFlow('Telegram bot');
    const contextText = [...history, { role: 'user' as const, content: text }].slice(-10).map((item) => `${item.role}: ${item.content}`).join('\n');
    const instruction = `Conversation context:\n${contextText}\n\nLatest user request:\n${text}`;
    const [blueprintResult, flowResult] = await Promise.all([improveBlueprint(env, currentBlueprint, instruction), improveFlow(env, flow, instruction)]);
    settings.flow = flowResult.flow;
    try {
      await env.DB.prepare('UPDATE bots SET blueprint_json = ?, settings_json = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
        .bind(JSON.stringify(blueprintResult.blueprint), JSON.stringify(settings), bot.id)
        .run();
      await env.BOT_CACHE.delete(`bot:${bot.id}`);
      const reply = `${flowResult.summary}\n${blueprintResult.summary}`;
      await saveChatHistory(env, historyKey, history, text, reply);
      await sendText(token, chatId, reply);
    } catch (error) {
      console.error('telegram ai chat save failed', error);
      await sendText(token, chatId, 'Could not save changes. Check D1 migration.');
    }
    return;
  }

  if (!bot && isBotRequest) {
    const reply = 'First add your BotFather token in the Mini App, then I can build or edit your bot.';
    await saveChatHistory(env, historyKey, history, text, reply);
    await sendText(token, chatId, reply);
    return;
  }

  const reply = await runtimePlainAiReply(env, text, history);
  await saveChatHistory(env, historyKey, history, text, reply);
  await sendText(token, chatId, reply);
}

async function handleBuilderCallback(env: Env, token: string, callback: TelegramCallbackQuery): Promise<void> {
  const chatId = callback.message?.chat.id ?? callback.from.id;
  const userId = String(callback.from.id);
  const data = callback.data ?? '';
  await telegramApi(token, 'answerCallbackQuery', { callback_query_id: callback.id });
  if (data === 'builder:chat') {
    await env.BOT_CACHE.put(`builder-ai-chat:${userId}`, '1', { expirationTtl: 7200 }).catch(() => undefined);
    await telegramApi(token, 'sendMessage', {
      chat_id: chatId,
      text: 'AI chat is open. I will remember this chat until you press End Chat.',
      reply_markup: { keyboard: [[{ text: 'End Chat' }]], resize_keyboard: true, one_time_keyboard: false },
    });
    return;
  }
  if (data === 'builder:mybots') {
    await sendMyBots(env, token, chatId, userId);
    return;
  }
  if (data === 'builder:help') {
    await sendText(token, chatId, 'Use the Mini App for token, results, and settings. Use Chat with AI here to edit your bot.');
    return;
  }
  await sendMainMenu(token, chatId);
}

async function handleFlowMessage(env: Env, token: string, bot: BotRecord, flow: BotFlow, message: TelegramMessage): Promise<void> {
  const chatId = message.chat.id;
  const userId = String(message.from?.id ?? chatId);
  const text = message.text?.trim() ?? '';

  if (!text || text === '/start') {
    const state = { nodeId: flow.start, data: {} };
    await saveFlowState(env, bot.id, userId, state);
    await sendFlowNode(env, token, bot, flow, chatId, userId, state);
    return;
  }
  if (text === '/reset') {
    await clearFlowState(env, bot.id, userId);
    const state = { nodeId: flow.start, data: {} };
    await saveFlowState(env, bot.id, userId, state);
    await sendFlowNode(env, token, bot, flow, chatId, userId, state);
    return;
  }

  const state = await getFlowState(env, bot.id, userId, flow);
  const node = flow.nodes[state.nodeId] ?? flow.nodes[flow.start];
  if (!node) {
    await sendText(token, chatId, 'This bot flow is not configured correctly.');
    return;
  }

  if (node.ai?.enabled && !node.saveInputAs && !node.next) {
    const answer = await runtimeAiReply(env, node.ai.systemPrompt, text);
    await sendText(token, chatId, answer);
    return;
  }

  if (node.saveInputAs && text) state.data[node.saveInputAs] = text;
  state.nodeId = node.next ?? (node.end ? flow.start : state.nodeId);
  await saveFlowState(env, bot.id, userId, state);
  await sendFlowNode(env, token, bot, flow, chatId, userId, state);
}

async function handleFlowCallback(env: Env, token: string, bot: BotRecord, flow: BotFlow, callback: TelegramCallbackQuery): Promise<void> {
  const chatId = callback.message?.chat.id ?? callback.from.id;
  const userId = String(callback.from.id);
  const data = callback.data ?? '';
  await telegramApi(token, 'answerCallbackQuery', { callback_query_id: callback.id });
  const nextId = data.startsWith('flow:') ? data.slice('flow:'.length) : flow.start;
  const state = await getFlowState(env, bot.id, userId, flow);
  state.nodeId = flow.nodes[nextId] ? nextId : flow.start;
  await saveFlowState(env, bot.id, userId, state);
  await sendFlowNode(env, token, bot, flow, chatId, userId, state);
}

async function sendFlowNode(env: Env, token: string, bot: BotRecord, flow: BotFlow, chatId: number, userId: string, state: UserFlowState): Promise<void> {
  const node = flow.nodes[state.nodeId] ?? flow.nodes[flow.start];
  if (!node) {
    await sendText(token, chatId, 'This bot flow is empty.');
    return;
  }
  const buttons = (node.buttons ?? []).filter((button) => flow.nodes[button.next]);
  await telegramApi(token, 'sendMessage', {
    chat_id: chatId,
    text: renderTemplate(node.message, state.data),
    reply_markup: buttons.length ? { inline_keyboard: buttons.map((button) => [{ text: button.text, callback_data: `flow:${button.next}` }]) } : undefined,
  });
  if (node.notifyOwner && bot.owner_telegram_id) {
    const summary = Object.entries(state.data).map(([key, value]) => `${key}: ${value}`).join('\n') || 'No collected data.';
    await sendText(token, Number(bot.owner_telegram_id), `New bot submission from ${userId}\n\n${summary}`);
  }
  if (node.end) await saveFlowState(env, bot.id, userId, { nodeId: flow.start, data: {} });
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
  await sendText(token, chatId, await runtimeAiReply(env, blueprint.aiSupport.systemPrompt, text));
}

async function handleRuntimeCallback(env: Env, token: string, bot: BotRecord, blueprint: BotBlueprint, callback: TelegramCallbackQuery): Promise<void> {
  const chatId = callback.message?.chat.id ?? callback.from.id;
  const data = callback.data ?? '';
  await telegramApi(token, 'answerCallbackQuery', { callback_query_id: callback.id });
  if (data.startsWith('screen:')) await sendScreen(token, chatId, blueprint, data.slice('screen:'.length));
  else if (data === 'support') await sendText(token, chatId, blueprint.aiSupport.enabled ? 'Send your question. AI support will answer.' : blueprint.aiSupport.handoffMessage);
  else await sendScreen(token, chatId, blueprint, blueprint.startScreen);
}

async function sendMainMenu(token: string, chatId: number): Promise<void> {
  await telegramApi(token, 'sendMessage', {
    chat_id: chatId,
    text: 'Welcome to AI Builder TEL.\n\nUse the Mini App for token, results, and settings. Use Chat with AI here to edit your bot.',
    reply_markup: { inline_keyboard: [[{ text: 'Open Mini App', web_app: { url: `${PUBLIC_BASE_URL}/app` } }], [{ text: 'Chat with AI', callback_data: 'builder:chat' }], [{ text: 'My Bots', callback_data: 'builder:mybots' }, { text: 'Help', callback_data: 'builder:help' }]] },
  });
}

async function sendOpenMiniApp(token: string, chatId: number): Promise<void> {
  await telegramApi(token, 'sendMessage', { chat_id: chatId, text: 'Open the Mini App to connect token, view results, and manage settings.', reply_markup: { inline_keyboard: [[{ text: 'Open Mini App', web_app: { url: `${PUBLIC_BASE_URL}/app` } }]] } });
}

async function sendMyBots(env: Env, token: string, chatId: number, userId: string): Promise<void> {
  try {
    const rows = await env.DB.prepare('SELECT id, title, username, status, created_at FROM bots WHERE owner_telegram_id = ? ORDER BY created_at DESC LIMIT 10').bind(userId).all<{ id: string; title: string; username: string | null; status: string; created_at: string }>();
    if (!rows.results.length) {
      await sendText(token, chatId, 'No bots yet. Open the Mini App to connect your first BotFather token.');
      return;
    }
    await sendText(token, chatId, rows.results.map((item, index) => `${index + 1}. ${item.title}\n${item.username ? '@' + item.username : 'No username'}\nID: ${item.id}\nStatus: ${item.status}`).join('\n\n'));
  } catch {
    await sendText(token, chatId, 'Could not load bots. Check D1 migrations.');
  }
}

async function sendScreen(token: string, chatId: number, blueprint: BotBlueprint, screenId: string): Promise<void> {
  const screen = blueprint.screens.find((item) => item.id === screenId) ?? blueprint.screens[0];
  if (!screen) {
    await sendText(token, chatId, 'Bot is active.');
    return;
  }
  await telegramApi(token, 'sendMessage', { chat_id: chatId, text: screen.message, reply_markup: { inline_keyboard: buildKeyboard(screen.buttons) } });
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

async function getLatestOwnerBot(env: Env, userId: string): Promise<BotRecord | null> {
  try {
    return (await env.DB.prepare('SELECT * FROM bots WHERE owner_telegram_id = ? ORDER BY updated_at DESC LIMIT 1').bind(userId).first<BotRecord>()) ?? null;
  } catch {
    return null;
  }
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

async function getFlowState(env: Env, botId: string, userId: string, flow: BotFlow): Promise<UserFlowState> {
  const raw = await env.BOT_CACHE.get(`flow-state:${botId}:${userId}`).catch(() => null);
  const parsed = raw ? safeParseJson<UserFlowState>(raw, { nodeId: flow.start, data: {} }) : { nodeId: flow.start, data: {} };
  return flow.nodes[parsed.nodeId] ? { nodeId: parsed.nodeId, data: parsed.data ?? {} } : { nodeId: flow.start, data: parsed.data ?? {} };
}
async function saveFlowState(env: Env, botId: string, userId: string, state: UserFlowState): Promise<void> { await env.BOT_CACHE.put(`flow-state:${botId}:${userId}`, JSON.stringify(state), { expirationTtl: 86400 }).catch(() => undefined); }
async function clearFlowState(env: Env, botId: string, userId: string): Promise<void> { await env.BOT_CACHE.delete(`flow-state:${botId}:${userId}`).catch(() => undefined); }
async function safeRateLimit(env: Env, key: string, limit: number, windowSeconds: number): Promise<boolean> { try { return await rateLimit(env.RATE_LIMITS, key, limit, windowSeconds); } catch { return true; } }
async function saveBotUser(env: Env, botId: string, message: TelegramMessage): Promise<void> { const user = message.from; if (!user) return; try { await env.DB.prepare(`INSERT INTO bot_users (bot_id, telegram_user_id, first_name, username, updated_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP) ON CONFLICT(bot_id, telegram_user_id) DO UPDATE SET first_name = excluded.first_name, username = excluded.username, updated_at = CURRENT_TIMESTAMP`).bind(botId, String(user.id), user.first_name ?? null, user.username ?? null).run(); } catch {} }
async function runtimeAiReply(env: Env, systemPrompt: string, text: string): Promise<string> { const { aiReply } = await import('./ai'); return aiReply(env, systemPrompt, text); }
async function runtimePlainAiReply(env: Env, text: string, history: ChatHistoryMessage[] = []): Promise<string> { const { plainAiReply } = await import('./ai'); return plainAiReply(env, text, history); }
async function sendText(token: string, chatId: number, text: string): Promise<void> { await telegramApi(token, 'sendMessage', { chat_id: chatId, text }); }
async function telegramApi<T = { ok: boolean; description?: string }>(token: string, method: string, payload: unknown): Promise<T> { const response = await fetch(`https://api.telegram.org/bot${token}/${method}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) }); return response.json() as Promise<T>; }
function renderTemplate(template: string, data: Record<string, string>): string { return template.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_, key: string) => data[key] ?? ''); }
function mainBuilderBlueprint(): BotBlueprint { return { version: 1, botType: 'custom', language: 'en', tone: 'premium', startScreen: 'home', screens: [{ id: 'home', title: 'AI Builder TEL', message: 'Open the Mini App to connect token, view results, and manage settings.', buttons: [] }], aiSupport: { enabled: false, systemPrompt: '', handoffMessage: 'Message saved.' }, safety: { blockedTopics: [], requireHumanFor: [] } }; }
