import type { Env } from './types';
import {
  discoverPolymarketPredictions,
  getPredictionEvent,
  importPolymarketPrediction,
  listPredictionEvents,
  publishPredictionEvent,
  refundPredictionEvent,
  settlePredictionEvent,
  unpublishPredictionEvent,
  updatePredictionEvent,
} from './prediction-events';
import { getTelegramMenuMessageId, setTelegramMenuMessageId } from './telegram-menu-state';

type Message = { chat: { id: number }; from?: { id: number }; text?: string };
type Callback = { id: string; data?: string; from: { id: number }; message?: { message_id: number; chat: { id: number } } };
type Update = { message?: Message; callback_query?: Callback };
type Button = { text: string; callback_data: string };
type InputState = { eventId: string; mode: 'question' | 'close' | 'source' };
type AdminEvent = { id: string; source_market_id: string; source_url: string; category: string; question: string; description: string | null; closes_at: string; resolution_source: string | null; status: string; result: string | null; featured: number; created_at: string; updated_at: string; published_at: string | null; settled_at: string | null };

const STATE_PREFIX = 'admin:prediction-event-input:';

export async function handlePredictionEventsAdminRequest(request: Request, env: Env): Promise<Response | null> {
  if (request.method !== 'POST' || new URL(request.url).pathname !== '/telegram/webhook') return null;
  const update = await request.clone().json().catch(() => null) as Update | null;
  if (!update || !env.BOT_TOKEN) return null;
  if (update.callback_query) return handleCallback(env, update.callback_query);
  if (update.message) return handleMessage(env, update.message);
  return null;
}

async function handleCallback(env: Env, callback: Callback): Promise<Response | null> {
  const data = String(callback.data || '');
  if (data !== 'botadmin:events:list' && !data.startsWith('botadmin:events:')) return null;
  if (!isAdmin(env, callback.from.id)) return ok();

  await telegram(env.BOT_TOKEN, 'answerCallbackQuery', { callback_query_id: callback.id }).catch(() => undefined);
  const chatId = callback.message?.chat.id ?? callback.from.id;
  const messageId = callback.message?.message_id;
  await clearState(env, callback.from.id);

  try {
    if (data === 'botadmin:events:list') await sendEventsMenu(env, chatId, messageId);
    else if (data.startsWith('botadmin:events:discover:')) await sendDiscovery(env, chatId, messageId, data.slice('botadmin:events:discover:'.length));
    else if (data.startsWith('botadmin:events:import:')) {
      const marketId = data.slice('botadmin:events:import:'.length);
      const event = await importPolymarketPrediction(env, marketId) as AdminEvent;
      await sendEventPanel(env, chatId, messageId, event);
    } else if (data.startsWith('botadmin:events:show:')) {
      const event = await requireEvent(env, data.slice('botadmin:events:show:'.length));
      await sendEventPanel(env, chatId, messageId, event);
    } else if (data.startsWith('botadmin:events:ask:')) {
      const parts = data.split(':');
      const mode = parts[3];
      const event = await requireEvent(env, parts[4] || '');
      if (event.status !== 'draft') throw new Error('فقط Draft قابل ویرایش است.');
      if (mode !== 'question' && mode !== 'close' && mode !== 'source') throw new Error('ویرایش نامعتبر است.');
      await env.BOT_CACHE.put(stateKey(callback.from.id), JSON.stringify({ eventId: event.id, mode }), { expirationTtl: 900 });
      await promptForInput(env, chatId, messageId, mode as InputState['mode'], event);
    } else if (data.startsWith('botadmin:events:publish:')) {
      const event = await publishPredictionEvent(env, data.slice('botadmin:events:publish:'.length)) as AdminEvent;
      await sendEventPanel(env, chatId, messageId, event, '✅ منتشر شد. از این لحظه فقط استخر داخلی Vexa برای این پیش‌بینی فعال است.');
    } else if (data.startsWith('botadmin:events:unpublish:')) {
      const event = await unpublishPredictionEvent(env, data.slice('botadmin:events:unpublish:'.length)) as AdminEvent;
      await sendEventPanel(env, chatId, messageId, event, '✅ دوباره Draft شد؛ هنوز هیچ بتی ثبت نشده بود.');
    } else if (data.startsWith('botadmin:events:settle:')) {
      const parts = data.split(':');
      const eventId = parts[3] || '';
      const result = parts[4] === 'yes' ? 'yes' : parts[4] === 'no' ? 'no' : '';
      if (!result) throw new Error('نتیجه نامعتبر است.');
      await settlePredictionEvent(env, eventId, result);
      await sendEventPanel(env, chatId, messageId, await requireEvent(env, eventId), '✅ تسویه داخلی Vexa انجام شد.');
    } else if (data.startsWith('botadmin:events:refund:')) {
      const eventId = data.slice('botadmin:events:refund:'.length);
      await refundPredictionEvent(env, eventId);
      await sendEventPanel(env, chatId, messageId, await requireEvent(env, eventId), '✅ همهٔ مبالغ از استخر داخلی Vexa بازگشت داده شد.');
    } else {
      return ok();
    }
  } catch (error) {
    await sendError(env, chatId, messageId, error);
  }
  return ok();
}

async function handleMessage(env: Env, message: Message): Promise<Response | null> {
  const userId = message.from?.id;
  if (!userId || !isAdmin(env, userId)) return null;
  const state = await readState(env, userId);
  if (!state) return null;
  const text = String(message.text || '').trim();
  if (text === '/cancel' || text === 'لغو') {
    await clearState(env, userId);
    await sendEventsMenu(env, message.chat.id);
    return ok();
  }
  try {
    const patch = state.mode === 'question'
      ? { question: text }
      : state.mode === 'close'
        ? { closesAt: text }
        : { resolutionSource: text };
    const event = await updatePredictionEvent(env, state.eventId, patch) as AdminEvent;
    await clearState(env, userId);
    await sendEventPanel(env, message.chat.id, undefined, event, '✅ ذخیره شد.');
  } catch (error) {
    const hint = state.mode === 'close' ? '\nنمونه: 2026-12-31 18:00 UTC' : state.mode === 'source' ? '\nلینک HTTPS معتبر بفرستید.' : '';
    await telegram(env.BOT_TOKEN, 'sendMessage', { chat_id: message.chat.id, text: '❌ ' + messageOf(error) + hint }).catch(() => undefined);
  }
  return ok();
}

async function sendEventsMenu(env: Env, chatId: number, messageId?: number): Promise<void> {
  const events = await listPredictionEvents(env, true) as AdminEvent[];
  const rows: Button[][] = [
    [
      { text: '🌍 World', callback_data: 'botadmin:events:discover:world' },
      { text: '🤖 Tech / AI', callback_data: 'botadmin:events:discover:tech' },
    ],
    [{ text: '🎬 Culture', callback_data: 'botadmin:events:discover:culture' }],
  ];
  for (const event of events.slice(0, 12)) rows.push([{ text: statusIcon(event.status) + ' ' + shorten(event.question, 42), callback_data: 'botadmin:events:show:' + event.id }]);
  rows.push([{ text: '⬅️ منوی اصلی', callback_data: 'botadmin:home' }]);
  const counts = events.reduce<Record<string, number>>((out, event) => { out[event.status] = (out[event.status] || 0) + 1; return out; }, {});
  await upsert(env, chatId, messageId, '🔮 پیش‌بینی رویدادهای Vexa\n\nمنبع پولی‌مارکت فقط برای کشف دستی است؛ هیچ انتقال پول یا تسویه‌ای خارج از Vexa انجام نمی‌شود.\n\nDraft: ' + (counts.draft || 0) + ' • Open: ' + (counts.open || 0) + ' • Final: ' + ((counts.settled || 0) + (counts.refunded || 0)) + '\n\nیک دسته را بزن تا موارد غیرورزشی پیدا شوند، سپس هر مورد را Draft وارد و بررسی کن.', rows);
}

async function sendDiscovery(env: Env, chatId: number, messageId: number | undefined, category: string): Promise<void> {
  if (category !== 'world' && category !== 'tech' && category !== 'culture') throw new Error('دسته نامعتبر است.');
  const markets = await discoverPolymarketPredictions(category);
  const rows: Button[][] = markets.map((market) => [{ text: '＋ ' + shorten(market.question, 52), callback_data: 'botadmin:events:import:' + market.sourceMarketId }]);
  rows.push([{ text: '🔄 دوباره جست‌وجو', callback_data: 'botadmin:events:discover:' + category }, { text: '⬅️ رویدادها', callback_data: 'botadmin:events:list' }]);
  const label = category === 'world' ? 'World' : category === 'tech' ? 'Tech / AI' : 'Culture';
  const body = markets.length
    ? '🔎 ' + label + '\n\nاین فهرست فقط با لمس همین دکمه از API عمومی پولی‌مارکت خوانده شد و ورزش از آن حذف شده است. انتخاب هر مورد فقط آن را به Draft داخلی Vexa وارد می‌کند.'
    : '🔎 ' + label + '\n\nدر حال حاضر مورد دوتاییِ غیرورزشیِ مناسب پیدا نشد. «دوباره جست‌وجو» را بعداً خودت بزن؛ هیچ رفرش خودکاری فعال نیست.';
  await upsert(env, chatId, messageId, body, rows);
}

async function sendEventPanel(env: Env, chatId: number, messageId: number | undefined, event: AdminEvent, notice = ''): Promise<void> {
  const rows: Button[][] = [];
  if (event.status === 'draft') {
    rows.push([{ text: '✏️ ویرایش سؤال', callback_data: 'botadmin:events:ask:question:' + event.id }]);
    rows.push([{ text: '🕒 زمان بسته‌شدن', callback_data: 'botadmin:events:ask:close:' + event.id }, { text: '🔗 منبع تسویه', callback_data: 'botadmin:events:ask:source:' + event.id }]);
    rows.push([{ text: '✅ انتشار در Vexa', callback_data: 'botadmin:events:publish:' + event.id }]);
  } else if (event.status === 'open') {
    rows.push([{ text: '↩️ لغو انتشار (بدون بت)', callback_data: 'botadmin:events:unpublish:' + event.id }]);
    rows.push([{ text: '🟢 تسویه Yes', callback_data: 'botadmin:events:settle:' + event.id + ':yes' }, { text: '🔴 تسویه No', callback_data: 'botadmin:events:settle:' + event.id + ':no' }]);
    rows.push([{ text: '💸 بازگرداندن همهٔ مبالغ', callback_data: 'botadmin:events:refund:' + event.id }]);
  }
  rows.push([{ text: '⬅️ رویدادها', callback_data: 'botadmin:events:list' }]);
  const source = event.resolution_source || 'تنظیم نشده';
  const text = [
    notice,
    '🔮 ' + statusIcon(event.status) + ' ' + event.status.toUpperCase(),
    '',
    event.question,
    '',
    'Category: ' + event.category,
    'Close: ' + formatDate(event.closes_at),
    'Resolution source: ' + source,
    'Polymarket reference: ' + event.source_url,
    event.result ? 'Result: ' + event.result.toUpperCase() : '',
  ].filter(Boolean).join('\n');
  await upsert(env, chatId, messageId, text, rows);
}

async function promptForInput(env: Env, chatId: number, messageId: number | undefined, mode: InputState['mode'], event: AdminEvent): Promise<void> {
  const text = mode === 'question'
    ? '✏️ سؤال جدید را بفرستید.\n\nفعلی: ' + event.question
    : mode === 'close'
      ? '🕒 زمان بسته‌شدن را به فرمت UTC بفرستید.\nنمونه: 2026-12-31 18:00 UTC\n\nفعلی: ' + formatDate(event.closes_at)
      : '🔗 لینک HTTPS منبع رسمی نتیجه را بفرستید.\n\nفعلی: ' + (event.resolution_source || 'تنظیم نشده');
  await upsert(env, chatId, messageId, text, [[{ text: 'لغو', callback_data: 'botadmin:events:show:' + event.id }]]);
}

async function requireEvent(env: Env, id: string): Promise<AdminEvent> {
  const event = await getPredictionEvent(env, id) as AdminEvent | null;
  if (!event) throw new Error('رویداد پیدا نشد.');
  return event;
}

async function readState(env: Env, userId: number): Promise<InputState | null> {
  const raw = await env.BOT_CACHE.get(stateKey(userId)).catch(() => null);
  if (!raw) return null;
  try {
    const state = JSON.parse(raw) as InputState;
    return state && typeof state.eventId === 'string' && (state.mode === 'question' || state.mode === 'close' || state.mode === 'source') ? state : null;
  } catch { return null; }
}
function clearState(env: Env, userId: number): Promise<void> { return env.BOT_CACHE.delete(stateKey(userId)).catch(() => undefined); }
function stateKey(userId: number): string { return STATE_PREFIX + String(userId); }
function isAdmin(env: Env, userId: unknown): boolean { return String(env.BOT_ADMIN || '').split(/[\s,;]+/).map((item) => item.trim()).filter(Boolean).includes(String(userId || '')); }
function statusIcon(status: string): string { return status === 'open' ? '🟢' : status === 'draft' ? '🟡' : status === 'settled' ? '✅' : status === 'refunded' ? '↩️' : '⚪'; }
function shorten(value: string, length: number): string { const text = String(value || '').replace(/\s+/g, ' ').trim(); return text.length > length ? text.slice(0, Math.max(1, length - 1)) + '…' : text; }
function formatDate(value: string): string { const date = new Date(value); return Number.isFinite(date.getTime()) ? date.toISOString().replace('.000Z', 'Z') : value; }
function messageOf(error: unknown): string { return error instanceof Error ? error.message : 'عملیات ناموفق بود.'; }
function ok(): Response { return Response.json({ ok: true }, { headers: { 'cache-control': 'no-store' } }); }

async function sendError(env: Env, chatId: number, messageId: number | undefined, error: unknown): Promise<void> {
  await upsert(env, chatId, messageId, '❌ ' + messageOf(error), [[{ text: '⬅️ رویدادها', callback_data: 'botadmin:events:list' }]]);
}

async function upsert(env: Env, chatId: number, messageId: number | undefined, text: string, keyboard: Button[][]): Promise<void> {
  const activeId = messageId || await getTelegramMenuMessageId(env, chatId);
  const payload = { chat_id: chatId, text, reply_markup: { inline_keyboard: keyboard }, disable_web_page_preview: true };
  if (activeId && await telegram(env.BOT_TOKEN, 'editMessageText', { ...payload, message_id: activeId }).then(() => true).catch(() => false)) {
    await setTelegramMenuMessageId(env, chatId, activeId);
    return;
  }
  const sent = await telegram<{ message_id?: number }>(env.BOT_TOKEN, 'sendMessage', payload);
  if (sent?.message_id) await setTelegramMenuMessageId(env, chatId, sent.message_id);
}

async function telegram<T = unknown>(token: string, method: string, payload: unknown): Promise<T> {
  const response = await fetch('https://api.telegram.org/bot' + token + '/' + method, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) });
  const result = await response.json().catch(() => ({})) as { ok?: boolean; result?: T; description?: string };
  if (!response.ok || !result.ok) throw new Error(result.description || 'Telegram ' + method + ' failed');
  return result.result as T;
}
