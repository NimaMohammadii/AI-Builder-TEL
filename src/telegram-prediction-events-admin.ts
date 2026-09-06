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
import {
  getPredictOpsDashboard,
  getPredictOpsIncidents,
  getPredictOpsRound,
  listPredictOpsDueRounds,
  listPredictOpsRounds,
  retryPredictSettlement,
  setPredictOpsEmergencyPaused,
  setPredictOpsMaintenanceMessage,
  setPredictOpsMarketPaused,
  type PredictOpsDashboard,
  type PredictOpsMarket,
  type PredictOpsMarketStatus,
  type PredictOpsRoundView,
} from './predict-routes';
import { getTelegramMenuMessageId, setTelegramMenuMessageId } from './telegram-menu-state';

type Message = { chat: { id: number }; from?: { id: number }; text?: string };
type Callback = { id: string; data?: string; from: { id: number }; message?: { message_id: number; chat: { id: number } } };
type Update = { message?: Message; callback_query?: Callback };
type Button = { text: string; callback_data: string };
type InputState = { eventId: string; mode: 'question' | 'close' | 'source' };
type PredictOpsInputState = { mode: 'maintenance' };
type AdminEvent = { id: string; source_market_id: string; source_url: string; category: string; question: string; description: string | null; closes_at: string; resolution_source: string | null; status: string; result: string | null; featured: number; created_at: string; updated_at: string; published_at: string | null; settled_at: string | null };

const STATE_PREFIX = 'admin:prediction-event-input:';
const PREDICT_OPS_STATE_PREFIX = 'admin:predict-ops-input:';

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
  const isEventsCallback = data === 'botadmin:events:list' || data.startsWith('botadmin:events:');
  const isPredictOpsCallback = data === 'botadmin:predictops:menu' || data.startsWith('botadmin:predictops:');
  if (!isEventsCallback && !isPredictOpsCallback) return null;
  if (!isAdmin(env, callback.from.id)) return ok();

  await telegram(env.BOT_TOKEN, 'answerCallbackQuery', { callback_query_id: callback.id }).catch(() => undefined);
  const chatId = callback.message?.chat.id ?? callback.from.id;
  const messageId = callback.message?.message_id;

  if (isPredictOpsCallback) {
    await clearState(env, callback.from.id);
    await clearPredictOpsState(env, callback.from.id);
    try {
      await handlePredictOpsCallback(env, callback.from.id, chatId, messageId, data);
    } catch (error) {
      await sendPredictOpsError(env, chatId, messageId, error);
    }
    return ok();
  }

  await clearPredictOpsState(env, callback.from.id);
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
  const opsState = await readPredictOpsState(env, userId);
  if (opsState) {
    const text = String(message.text || '').trim();
    if (text === '/cancel' || text === 'لغو') {
      await clearPredictOpsState(env, userId);
      await sendPredictOpsMenu(env, message.chat.id);
      return ok();
    }
    if (opsState.mode === 'maintenance') {
      if (!text) {
        await telegram(env.BOT_TOKEN, 'sendMessage', { chat_id: message.chat.id, text: 'پیام نمی‌تواند خالی باشد. برای حذف پیام از دکمه «حذف پیام» استفاده کنید.' }).catch(() => undefined);
        return ok();
      }
      if (text.length > 180) {
        await telegram(env.BOT_TOKEN, 'sendMessage', { chat_id: message.chat.id, text: 'پیام نگهداری باید حداکثر ۱۸۰ کاراکتر باشد.' }).catch(() => undefined);
        return ok();
      }
      try {
        await setPredictOpsMaintenanceMessage(env, text);
        await clearPredictOpsState(env, userId);
        await sendPredictOpsMenu(env, message.chat.id, undefined, '✅ پیام نگهداری ذخیره شد.');
      } catch (error) {
        await telegram(env.BOT_TOKEN, 'sendMessage', { chat_id: message.chat.id, text: '❌ ' + messageOf(error) }).catch(() => undefined);
      }
      return ok();
    }
  }

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

async function handlePredictOpsCallback(env: Env, adminId: number, chatId: number, messageId: number | undefined, data: string): Promise<void> {
  if (data === 'botadmin:predictops:menu' || data === 'botadmin:predictops:refresh') {
    await sendPredictOpsMenu(env, chatId, messageId);
    return;
  }
  if (data.startsWith('botadmin:predictops:emergency:')) {
    const paused = data.slice('botadmin:predictops:emergency:'.length) === 'on';
    await setPredictOpsEmergencyPaused(env, paused);
    await sendPredictOpsMenu(env, chatId, messageId, paused ? '🚨 ثبت bet جدید برای Bitcoin، Gold و Oil متوقف شد.' : '✅ توقف اضطراری برداشته شد.');
    return;
  }
  if (data.startsWith('botadmin:predictops:marketpause:')) {
    const parts = data.split(':');
    const market = cleanOpsMarket(parts[3]);
    const paused = parts[4] === 'on';
    await setPredictOpsMarketPaused(env, market, paused);
    await sendPredictOpsMarket(env, chatId, messageId, market, paused ? '⏸ ثبت bet جدید این بازار متوقف شد.' : '✅ این بازار دوباره برای bet جدید باز شد.');
    return;
  }
  if (data.startsWith('botadmin:predictops:market:')) {
    await sendPredictOpsMarket(env, chatId, messageId, cleanOpsMarket(data.slice('botadmin:predictops:market:'.length)));
    return;
  }
  if (data.startsWith('botadmin:predictops:rounds:')) {
    await sendPredictOpsRounds(env, chatId, messageId, cleanOpsMarket(data.slice('botadmin:predictops:rounds:'.length)));
    return;
  }
  if (data.startsWith('botadmin:predictops:round:')) {
    await sendPredictOpsRound(env, chatId, messageId, data.slice('botadmin:predictops:round:'.length));
    return;
  }
  if (data === 'botadmin:predictops:queue') {
    await sendPredictOpsQueue(env, chatId, messageId);
    return;
  }
  if (data.startsWith('botadmin:predictops:retryask:')) {
    await sendPredictOpsRetryConfirm(env, chatId, messageId, data.slice('botadmin:predictops:retryask:'.length));
    return;
  }
  if (data.startsWith('botadmin:predictops:retry:')) {
    const roundId = data.slice('botadmin:predictops:retry:'.length);
    const round = await retryPredictSettlement(env, roundId);
    await sendPredictOpsRound(env, chatId, messageId, round.id, '✅ Retry Settlement با همان مسیر اصلی settlement اجرا شد.');
    return;
  }
  if (data === 'botadmin:predictops:incidents') {
    await sendPredictOpsIncidents(env, chatId, messageId);
    return;
  }
  if (data === 'botadmin:predictops:askmaintenance') {
    await env.BOT_CACHE.put(predictOpsStateKey(adminId), JSON.stringify({ mode: 'maintenance' }), { expirationTtl: 900 });
    await upsert(env, chatId, messageId, '📝 پیام نگهداری Predict\n\nیک پیام کوتاه حداکثر ۱۸۰ کاراکتر بفرستید. این پیام هنگام توقف دستی یا Circuit Breaker به کاربری که می‌خواهد bet ثبت کند نمایش داده می‌شود.\n\nهیچ قیمت یا round با این پیام تغییر نمی‌کند.', [[{ text: 'لغو', callback_data: 'botadmin:predictops:menu' }]]);
    return;
  }
  if (data === 'botadmin:predictops:clearmaintenance') {
    await setPredictOpsMaintenanceMessage(env, '');
    await sendPredictOpsMenu(env, chatId, messageId, '✅ پیام نگهداری حذف شد.');
    return;
  }
}

async function sendPredictOpsMenu(env: Env, chatId: number, messageId?: number, notice = ''): Promise<void> {
  const dashboard = await getPredictOpsDashboard(env);
  const lines = dashboard.markets.flatMap((status) => predictOpsMarketSummaryLines(status, dashboard));
  const text = [
    notice,
    '🩺 Predict Operations',
    '',
    `Emergency: ${dashboard.emergencyPaused ? '🚨 PAUSED' : '✅ Normal'}`,
    `Maintenance: ${dashboard.maintenanceMessage || '—'}`,
    '',
    ...lines,
    '',
    'این پنل فقط وضعیت، توقف ثبت bet و بازیابی settlement را کنترل می‌کند. قیمت‌ها از مسیر اصلی خودشان خوانده می‌شوند.',
  ].filter(Boolean).join('\n');
  const rows: Button[][] = [
    [
      { text: '₿ Bitcoin', callback_data: 'botadmin:predictops:market:bitcoin' },
      { text: '🥇 Gold', callback_data: 'botadmin:predictops:market:gold' },
      { text: '🛢 Oil', callback_data: 'botadmin:predictops:market:oil' },
    ],
    [{ text: dashboard.emergencyPaused ? '✅ Resume All Markets' : '🚨 Emergency Pause All', callback_data: `botadmin:predictops:emergency:${dashboard.emergencyPaused ? 'off' : 'on'}` }],
    [
      { text: '🧾 Settlement Queue', callback_data: 'botadmin:predictops:queue' },
      { text: '📜 Incident Log', callback_data: 'botadmin:predictops:incidents' },
    ],
    [
      { text: '📝 Maintenance Message', callback_data: 'botadmin:predictops:askmaintenance' },
      ...(dashboard.maintenanceMessage ? [{ text: '🗑 حذف پیام', callback_data: 'botadmin:predictops:clearmaintenance' }] : []),
    ],
    [
      { text: '🔄 Refresh', callback_data: 'botadmin:predictops:refresh' },
      { text: '⬅️ منوی اصلی', callback_data: 'botadmin:home' },
    ],
  ];
  await upsert(env, chatId, messageId, text, rows);
}

async function sendPredictOpsMarket(env: Env, chatId: number, messageId: number | undefined, market: PredictOpsMarket, notice = ''): Promise<void> {
  const dashboard = await getPredictOpsDashboard(env);
  const status = requireMarketStatus(dashboard, market);
  const round = status.latestRound;
  const effectivePaused = dashboard.emergencyPaused || status.manualPaused || status.circuitOpen;
  const text = [
    notice,
    `${marketIcon(market)} ${marketLabel(market)} — Predict Ops`,
    '',
    `Betting: ${effectivePaused ? '⏸ Paused' : '✅ Active'}`,
    `Manual pause: ${status.manualPaused ? 'ON' : 'OFF'}`,
    `Circuit breaker: ${status.circuitOpen ? '🛑 OPEN' : '✅ Closed'}`,
    `Last REST price: ${formatOpsPrice(market, status.lastPrice)}`,
    `Last feed success: ${formatOpsTime(status.lastSuccessAt)}`,
    `Last feed error: ${status.lastError ? shorten(status.lastError, 110) : '—'}`,
    '',
    `Latest round: ${round ? round.id : '—'}`,
    `Round status: ${round ? round.status : '—'}`,
    `Round end: ${round ? formatOpsTime(round.endsAt) : '—'}`,
    `Active bets: ${round ? Number(round.counts.active || 0) : 0}`,
    `Pending / settling: ${round ? Number(round.counts.pending || 0) : 0} / ${round ? Number(round.counts.settling_payment || 0) : 0}`,
    `Due settlements: ${status.dueSettlementCount}`,
    `Last settlement: ${formatOpsTime(status.lastSettledAt)}`,
  ].filter(Boolean).join('\n');
  const rows: Button[][] = [
    [{ text: status.manualPaused ? '✅ Resume Market' : '⏸ Pause Market', callback_data: `botadmin:predictops:marketpause:${market}:${status.manualPaused ? 'off' : 'on'}` }],
    [
      { text: '🔎 Round Inspector', callback_data: `botadmin:predictops:rounds:${market}` },
      { text: '🧾 Settlement Queue', callback_data: 'botadmin:predictops:queue' },
    ],
    [{ text: '⬅️ Predict Ops', callback_data: 'botadmin:predictops:menu' }],
  ];
  await upsert(env, chatId, messageId, text, rows);
}

async function sendPredictOpsRounds(env: Env, chatId: number, messageId: number | undefined, market: PredictOpsMarket): Promise<void> {
  const rounds = await listPredictOpsRounds(env, market, 8);
  const rows: Button[][] = rounds.map((round) => [{ text: `${roundStatusIcon(round)} ${shortRoundId(round.id)} • ${round.status}`, callback_data: `botadmin:predictops:round:${round.id}` }]);
  rows.push([{ text: `⬅️ ${marketLabel(market)}`, callback_data: `botadmin:predictops:market:${market}` }]);
  await upsert(env, chatId, messageId, `🔎 ${marketLabel(market)} Round Inspector\n\n${rounds.length ? 'آخرین roundها را انتخاب کنید.' : 'هنوز roundی در دیتابیس پیدا نشد.'}`, rows);
}

async function sendPredictOpsRound(env: Env, chatId: number, messageId: number | undefined, roundId: string, notice = ''): Promise<void> {
  const round = await getPredictOpsRound(env, roundId);
  if (!round) throw new Error('Round پیدا نشد.');
  const text = [
    notice,
    `🔎 ${marketIcon(round.market)} Round Inspector`,
    '',
    `ID: ${round.id}`,
    `Market: ${marketLabel(round.market)}`,
    `Status: ${round.status}`,
    `Start: ${formatOpsTime(round.startsAt)}`,
    `End: ${formatOpsTime(round.endsAt)}`,
    `Start price: ${formatOpsPrice(round.market, round.startPrice)}`,
    `End price: ${formatOpsPrice(round.market, round.endPrice)}`,
    `Result: ${round.result || '—'}`,
    `Settled: ${formatOpsTime(round.settledAt)}`,
    '',
    `Bets: ${round.totalBets} • Stake: ${formatGram(round.totalStakeNano)} GRAM`,
    `Active: ${Number(round.counts.active || 0)}`,
    `Pending: ${Number(round.counts.pending || 0)}`,
    `Settling payment: ${Number(round.counts.settling_payment || 0)}`,
    `Won / Lost: ${Number(round.counts.won || 0)} / ${Number(round.counts.lost || 0)}`,
    `Refunded / Failed: ${Number(round.counts.refunded || 0)} / ${Number(round.counts.failed || 0)}`,
  ].filter(Boolean).join('\n');
  const rows: Button[][] = [];
  if (round.due) rows.push([{ text: '🔁 Retry Settlement', callback_data: `botadmin:predictops:retryask:${round.id}` }]);
  rows.push([{ text: `⬅️ ${marketLabel(round.market)} Rounds`, callback_data: `botadmin:predictops:rounds:${round.market}` }]);
  await upsert(env, chatId, messageId, text, rows);
}

async function sendPredictOpsQueue(env: Env, chatId: number, messageId?: number): Promise<void> {
  const rounds = await listPredictOpsDueRounds(env);
  const rows: Button[][] = rounds.map((round) => [{ text: `${marketIcon(round.market)} ${marketLabel(round.market)} • ${shortRoundId(round.id)} • ${round.status}`, callback_data: `botadmin:predictops:round:${round.id}` }]);
  rows.push([{ text: '🔄 Refresh', callback_data: 'botadmin:predictops:queue' }, { text: '⬅️ Predict Ops', callback_data: 'botadmin:predictops:menu' }]);
  const body = rounds.length
    ? `🧾 Settlement Queue\n\n${rounds.length} round نیاز به بررسی/ادامه settlement دارد. روی round بزنید؛ Retry فقط از همان settlement فعلی استفاده می‌کند.`
    : '🧾 Settlement Queue\n\n✅ هیچ settlement عقب‌افتاده‌ای پیدا نشد.';
  await upsert(env, chatId, messageId, body, rows);
}

async function sendPredictOpsRetryConfirm(env: Env, chatId: number, messageId: number | undefined, roundId: string): Promise<void> {
  const round = await getPredictOpsRound(env, roundId);
  if (!round) throw new Error('Round پیدا نشد.');
  if (!round.due) throw new Error('این round در صف settlement نیست.');
  await upsert(env, chatId, messageId,
    `⚠️ Retry Settlement\n\n${round.id}\n${marketLabel(round.market)} • ${round.status}\n\nاین دکمه round جدید یا قیمت دستی نمی‌سازد؛ فقط همان settlement فعلی را دوباره اجرا می‌کند.`,
    [
      [{ text: '✅ اجرای Retry', callback_data: `botadmin:predictops:retry:${round.id}` }],
      [{ text: '⬅️ بازگشت به Round', callback_data: `botadmin:predictops:round:${round.id}` }],
    ],
  );
}

async function sendPredictOpsIncidents(env: Env, chatId: number, messageId?: number): Promise<void> {
  const incidents = await getPredictOpsIncidents(env);
  const lines = incidents.slice(0, 12).map((incident) => {
    const market = incident.market ? ` • ${marketLabel(incident.market)}` : '';
    return `${incidentIcon(incident.type)} ${formatOpsTime(incident.at)}${market}\n${shorten(incident.message, 150)}`;
  });
  await upsert(env, chatId, messageId, `📜 Predict Incident Log\n\n${lines.length ? lines.join('\n\n') : 'هنوز incidentی ثبت نشده است.'}`, [[{ text: '🔄 Refresh', callback_data: 'botadmin:predictops:incidents' }, { text: '⬅️ Predict Ops', callback_data: 'botadmin:predictops:menu' }]]);
}

function predictOpsMarketSummaryLines(status: PredictOpsMarketStatus, dashboard: PredictOpsDashboard): string[] {
  const paused = dashboard.emergencyPaused || status.manualPaused || status.circuitOpen;
  const round = status.latestRound;
  return [
    `${marketIcon(status.market)} ${marketLabel(status.market)} — ${paused ? '⏸ Paused' : '✅ Active'} • Feed ${status.circuitOpen ? '🛑' : status.lastSuccessAt ? '✅' : '⚪'}`,
    `   Price ${formatOpsPrice(status.market, status.lastPrice)} • Round ${round ? round.status : '—'} • Active bets ${round ? Number(round.counts.active || 0) : 0} • Due ${status.dueSettlementCount}`,
  ];
}

function requireMarketStatus(dashboard: PredictOpsDashboard, market: PredictOpsMarket): PredictOpsMarketStatus {
  const status = dashboard.markets.find((item) => item.market === market);
  if (!status) throw new Error('Market status unavailable.');
  return status;
}

function cleanOpsMarket(value: unknown): PredictOpsMarket {
  const market = String(value || '').trim().toLowerCase();
  if (market === 'bitcoin' || market === 'gold' || market === 'oil') return market;
  throw new Error('Market نامعتبر است.');
}

function marketIcon(market: PredictOpsMarket): string { return market === 'bitcoin' ? '₿' : market === 'gold' ? '🥇' : '🛢'; }
function marketLabel(market: PredictOpsMarket): string { return market === 'bitcoin' ? 'Bitcoin' : market === 'gold' ? 'Gold' : 'Oil'; }
function formatOpsPrice(market: PredictOpsMarket, value: number | null): string { const number = Number(value); if (!Number.isFinite(number) || number <= 0) return '—'; return '$' + number.toLocaleString('en-US', { minimumFractionDigits: market === 'bitcoin' ? 0 : 2, maximumFractionDigits: market === 'bitcoin' ? 0 : 2 }); }
function formatGram(nano: number): string { return (Math.max(0, Number(nano) || 0) / 1_000_000_000).toLocaleString('en-US', { maximumFractionDigits: 4 }); }
function formatOpsTime(value: string | null): string { if (!value) return '—'; const date = new Date(value); return Number.isFinite(date.getTime()) ? date.toISOString().replace('.000Z', 'Z') : String(value); }
function shortRoundId(value: string): string { const parts = String(value || '').split('_'); return parts.length >= 3 ? parts.slice(-1)[0].slice(-8) : shorten(value, 18); }
function roundStatusIcon(round: PredictOpsRoundView): string { return round.due ? '⚠️' : round.status === 'settled' ? '✅' : round.status === 'open' ? '🟢' : '🟡'; }
function incidentIcon(type: string): string { return type === 'feed_recovered' || type === 'settlement_retry_ok' || type === 'market_resume' || type === 'emergency_resume' ? '✅' : type.includes('failed') || type.includes('circuit') ? '🛑' : type.includes('pause') ? '⏸' : '•'; }

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
async function readPredictOpsState(env: Env, userId: number): Promise<PredictOpsInputState | null> {
  const raw = await env.BOT_CACHE.get(predictOpsStateKey(userId)).catch(() => null);
  if (!raw) return null;
  try {
    const state = JSON.parse(raw) as PredictOpsInputState;
    return state && state.mode === 'maintenance' ? state : null;
  } catch { return null; }
}
function clearPredictOpsState(env: Env, userId: number): Promise<void> { return env.BOT_CACHE.delete(predictOpsStateKey(userId)).catch(() => undefined); }
function predictOpsStateKey(userId: number): string { return PREDICT_OPS_STATE_PREFIX + String(userId); }
function isAdmin(env: Env, userId: unknown): boolean { return String(env.BOT_ADMIN || '').split(/[\s,;]+/).map((item) => item.trim()).filter(Boolean).includes(String(userId || '')); }
function statusIcon(status: string): string { return status === 'open' ? '🟢' : status === 'draft' ? '🟡' : status === 'settled' ? '✅' : status === 'refunded' ? '↩️' : '⚪'; }
function shorten(value: string, length: number): string { const text = String(value || '').replace(/\s+/g, ' ').trim(); return text.length > length ? text.slice(0, Math.max(1, length - 1)) + '…' : text; }
function formatDate(value: string): string { const date = new Date(value); return Number.isFinite(date.getTime()) ? date.toISOString().replace('.000Z', 'Z') : value; }
function messageOf(error: unknown): string { return error instanceof Error ? error.message : 'عملیات ناموفق بود.'; }
function ok(): Response { return Response.json({ ok: true }, { headers: { 'cache-control': 'no-store' } }); }

async function sendError(env: Env, chatId: number, messageId: number | undefined, error: unknown): Promise<void> {
  await upsert(env, chatId, messageId, '❌ ' + messageOf(error), [[{ text: '⬅️ رویدادها', callback_data: 'botadmin:events:list' }]]);
}

async function sendPredictOpsError(env: Env, chatId: number, messageId: number | undefined, error: unknown): Promise<void> {
  await upsert(env, chatId, messageId, '❌ Predict Ops\n\n' + messageOf(error), [[{ text: '⬅️ Predict Ops', callback_data: 'botadmin:predictops:menu' }]]);
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
