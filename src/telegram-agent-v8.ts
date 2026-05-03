import { aiReply, type ChatHistoryMessage } from './ai';
import { createCodeAgentJob, getCodeAgentJob, markCodeAgentJobQueued, markCodeAgentJobRejected, parsePlan } from './code-agent';
import { decideBuilderAgentAction, type AgentDashboardBot } from './agent-decision';
import { processTelegramUpdate as baseProcessTelegramUpdate, setTelegramWebhook } from './telegram-agent-v7';
import type { BotRecord, Env, TelegramUpdate } from './types';
import { safeParseJson } from './utils';

export { setTelegramWebhook };

export async function processTelegramUpdate(env: Env, bot: BotRecord, update: TelegramUpdate): Promise<void> {
  const settings = safeParseJson<{ isBuilderBot?: boolean }>(bot.settings_json, {});
  if (!settings.isBuilderBot) return baseProcessTelegramUpdate(env, bot, update);

  const callbackData = update.callback_query?.data ?? '';
  if (callbackData.startsWith('codejob:')) {
    await handleCodeJobCallback(env, update);
    return;
  }

  if (update.message) {
    const chatId = update.message.chat.id;
    const userId = String(update.message.from?.id ?? chatId);
    const text = update.message.text?.trim() ?? '';
    const chatActive = await env.BOT_CACHE.get(`builder-ai-chat:${userId}`).catch(() => null);
    if (text && chatActive && text !== '/start' && text !== '/cancel' && text !== 'End Chat') {
      const handled = await maybeCreateCodeJob(env, update, userId, text);
      if (handled) return;
    }
  }

  return baseProcessTelegramUpdate(env, bot, update);
}

async function maybeCreateCodeJob(env: Env, update: TelegramUpdate, userId: string, text: string): Promise<boolean> {
  const chatId = update.message?.chat.id;
  if (!chatId) return false;

  const historyKey = `builder-ai-history:${userId}`;
  const history = await loadHistory(env, historyKey);
  const bots = await loadDashboardBots(env, userId);
  const decision = await decideBuilderAgentAction(env, text, history, bots);
  if (decision.action !== 'code_agent') return false;

  const { jobId, plan, message } = await createCodeAgentJob(env, userId, text, history, bots.map((bot) => ({ ...bot, settings_json: undefined })));
  const proposal = await aiReply(env, [
    'You are AI Builder TEL.',
    'The user request needs real repository code changes, not only a flow edit.',
    'Explain the code-agent plan clearly and ask for confirmation.',
    'Do not claim code has been written yet. It is only planned.',
    'Reply in the user language. Be concise.',
    `job_id=${jobId}`,
    `plan=${JSON.stringify(plan)}`,
    `fallback_plan_message=${message}`,
  ].join('\n'), text, history);

  await saveHistory(env, historyKey, history, text, proposal);
  await telegram(env.TELEGRAM_BOT_TOKEN, 'sendMessage', {
    chat_id: chatId,
    text: proposal,
    reply_markup: { inline_keyboard: [[{ text: 'Confirm Code Job', callback_data: `codejob:confirm:${jobId}` }, { text: 'Reject', callback_data: `codejob:reject:${jobId}` }]] },
  });
  return true;
}

async function handleCodeJobCallback(env: Env, update: TelegramUpdate): Promise<void> {
  const q = update.callback_query;
  if (!q?.message || !q.data) return;
  const [, action, jobId] = q.data.split(':');
  const chatId = q.message.chat.id;
  const messageId = q.message.message_id;
  const userId = String(q.from.id);
  await telegram(env.TELEGRAM_BOT_TOKEN, 'answerCallbackQuery', { callback_query_id: q.id }).catch(() => undefined);

  const job = jobId ? await getCodeAgentJob(env, jobId) : null;
  const historyKey = `builder-ai-history:${userId}`;
  const history = await loadHistory(env, historyKey);
  const bots = await loadDashboardBots(env, userId);

  if (!job || job.owner_telegram_id !== userId) {
    const reply = await aiReply(env, 'The user pressed a code-job button, but the job was not found or does not belong to them. Reply naturally in the user language.', 'Code job not found.', history);
    await editMessage(env.TELEGRAM_BOT_TOKEN, chatId, messageId, reply);
    return;
  }

  if (action === 'reject') {
    await markCodeAgentJobRejected(env, job.id);
    const reply = await aiReply(env, [
      'The user rejected the code-agent plan. No code changes were made.',
      'Edit the previous message into a natural cancellation response in the user language.',
      `job=${JSON.stringify(job)}`,
      `dashboard_bots=${JSON.stringify(bots)}`,
    ].join('\n'), job.user_request, history);
    await saveAssistantOnly(env, historyKey, history, reply);
    await editMessage(env.TELEGRAM_BOT_TOKEN, chatId, messageId, reply);
    return;
  }

  await markCodeAgentJobQueued(env, job.id);
  const plan = parsePlan(job.plan_json);
  const reply = await aiReply(env, [
    'The user confirmed the code-agent plan.',
    'The job is now queued for a code runner/sandbox. Do not claim it is deployed yet.',
    'Explain what will happen next: branch creation, code changes, tests/build, then deploy approval.',
    'Reply in the user language. Be concise.',
    `job_id=${job.id}`,
    `plan=${JSON.stringify(plan)}`,
    `dashboard_bots=${JSON.stringify(bots)}`,
  ].join('\n'), job.user_request, history);
  await saveAssistantOnly(env, historyKey, history, reply);
  await editMessage(env.TELEGRAM_BOT_TOKEN, chatId, messageId, reply);
}

async function loadDashboardBots(env: Env, userId: string): Promise<AgentDashboardBot[]> {
  try {
    const rows = await env.DB.prepare('SELECT id, title, username, status, created_at, updated_at, settings_json FROM bots WHERE owner_telegram_id = ? ORDER BY updated_at DESC LIMIT 10').bind(userId).all<BotRecord>();
    return (rows.results ?? []).map((bot) => {
      const settings = safeParseJson<Record<string, unknown>>(bot.settings_json, {});
      const flow = settings.flow as { name?: string; description?: string } | undefined;
      return { id: bot.id, title: bot.title, username: bot.username, status: bot.status, created_at: bot.created_at, updated_at: bot.updated_at, flowName: flow?.name ?? null, flowDescription: flow?.description ?? null };
    });
  } catch {
    return [];
  }
}

async function loadHistory(env: Env, key: string): Promise<ChatHistoryMessage[]> {
  const raw = await env.BOT_CACHE.get(key).catch(() => null);
  const parsed = raw ? safeParseJson<ChatHistoryMessage[]>(raw, []) : [];
  return Array.isArray(parsed) ? parsed.filter((x) => x && (x.role === 'user' || x.role === 'assistant') && typeof x.content === 'string').slice(-16) : [];
}

async function saveHistory(env: Env, key: string, history: ChatHistoryMessage[], userText: string, assistantText: string): Promise<void> {
  const next = [...history, { role: 'user' as const, content: userText.slice(0, 1800) }, { role: 'assistant' as const, content: assistantText.slice(0, 1800) }].slice(-16);
  await env.BOT_CACHE.put(key, JSON.stringify(next), { expirationTtl: 7200 }).catch(() => undefined);
}

async function saveAssistantOnly(env: Env, key: string, history: ChatHistoryMessage[], assistantText: string): Promise<void> {
  const next = [...history, { role: 'assistant' as const, content: assistantText.slice(0, 1800) }].slice(-16);
  await env.BOT_CACHE.put(key, JSON.stringify(next), { expirationTtl: 7200 }).catch(() => undefined);
}

async function editMessage(token: string, chatId: number, messageId: number, text: string): Promise<void> {
  await telegram(token, 'editMessageText', { chat_id: chatId, message_id: messageId, text, reply_markup: { inline_keyboard: [] } });
}

async function telegram<T = unknown>(token: string, method: string, payload: unknown): Promise<T> {
  const response = await fetch(['https://api.telegram.org', 'bot' + token, method].join('/'), { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) });
  return response.json() as Promise<T>;
}
