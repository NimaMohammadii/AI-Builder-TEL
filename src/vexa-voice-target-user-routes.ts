import app from './index';
import type { Env } from './types';
import { PUBLIC_BASE_URL } from './utils';
import type { VexaVoiceLanguage } from './vexa-voice-messages';

type TargetVoiceMessage = {
  id: string;
  title: string;
  eventId: 'admin_message';
  audioId: string;
  language?: VexaVoiceLanguage;
  version?: string;
  targetUserId: string;
  expiresAt?: string | null;
};

type AdminDraft = {
  id: string;
  title: string;
  language: VexaVoiceLanguage;
  r2Key: string;
  version: string;
};

const ADMIN_DRAFT_PREFIX = 'vexa-voice:admin-draft:';
const ADMIN_TARGET_USER_PREFIX = 'vexa-voice:admin-target-user:';
const VOICE_INDEX_CACHE = 'no-store';


app.post('/admin/api/vexa-voice/user-bot-message', async (c) => {
  if (!isAdminRequest(c)) return c.json({ error: 'Unauthorized. Login again.' }, 401, { 'cache-control': VOICE_INDEX_CACHE });
  const form = await c.req.formData();
  const targetUserId = cleanUserId(form.get('targetUserId'));
  if (!targetUserId) return c.json({ error: 'Target Telegram user id is required.' }, 400, { 'cache-control': VOICE_INDEX_CACHE });
  const result = await sendAdminBotMessage(c.env, [targetUserId], form);
  return c.json({ ok: true, botDelivery: result }, 200, { 'cache-control': VOICE_INDEX_CACHE });
});

app.post('/admin/api/vexa-voice/bot-message', async (c) => {
  if (!isAdminRequest(c)) return c.json({ error: 'Unauthorized. Login again.' }, 401, { 'cache-control': VOICE_INDEX_CACHE });
  const form = await c.req.formData();
  const regions = normalizeRegions(form.get('regions'));
  const users = await botDeliveryUsers(c.env, regions);
  const result = await sendAdminBotMessage(c.env, users, form);
  return c.json({ ok: true, regions, botDelivery: result }, 200, { 'cache-control': VOICE_INDEX_CACHE });
});

app.post('/admin/api/vexa-voice/user-publish', async (c) => {
  if (!isAdminRequest(c)) return c.json({ error: 'Unauthorized. Login again.' }, 401, { 'cache-control': VOICE_INDEX_CACHE });
  const body = await readJson<{ draftId?: unknown; targetUserId?: unknown; ttlMinutes?: unknown; deliverMiniApp?: unknown; deliverBotChat?: unknown }>(c);
  const draftId = cleanKey(body.draftId);
  const targetUserId = cleanUserId(body.targetUserId);
  if (!targetUserId) return c.json({ error: 'Target Telegram user id is required.' }, 400, { 'cache-control': VOICE_INDEX_CACHE });
  const raw = draftId ? await c.env.BOT_CACHE.get(ADMIN_DRAFT_PREFIX + draftId).catch(() => null) : null;
  if (!raw) return c.json({ error: 'Preview not found. Generate again.' }, 404, { 'cache-control': VOICE_INDEX_CACHE });
  const draft = JSON.parse(raw) as AdminDraft;
  const ttlSeconds = ttlSecondsFromMinutes(body.ttlMinutes);
  const expiresAt = ttlSeconds ? new Date(Date.now() + ttlSeconds * 1000).toISOString() : null;
  const message: TargetVoiceMessage = {
    id: draft.id,
    title: cleanText(draft.title, 120) || 'Vexa wants to say something',
    eventId: 'admin_message',
    audioId: draft.id,
    language: draft.language,
    version: draft.version,
    targetUserId,
    expiresAt,
  };
  const deliverMiniApp = body.deliverMiniApp !== false;
  const deliverBotChat = body.deliverBotChat === true;
  if (deliverMiniApp) await putMaybeExpiring(c.env, ADMIN_TARGET_USER_PREFIX + targetUserId, message, ttlSeconds);
  const botDelivery = deliverBotChat ? await sendDraftVoice(c.env, targetUserId, draft).then(() => ({ attempted: 1, sent: 1, failed: 0 })).catch(() => ({ attempted: 1, sent: 0, failed: 1 })) : { attempted: 0, sent: 0, failed: 0 };
  return c.json({ ok: true, sentToUser: deliverMiniApp ? targetUserId : null, botDelivery, expiresAt, id: message.id, title: message.title }, 200, { 'cache-control': VOICE_INDEX_CACHE });
});

app.post('/admin/api/vexa-voice/user-disable', async (c) => {
  if (!isAdminRequest(c)) return c.json({ error: 'Unauthorized. Login again.' }, 401, { 'cache-control': VOICE_INDEX_CACHE });
  const body = await readJson<{ targetUserId?: unknown }>(c);
  const targetUserId = cleanUserId(body.targetUserId);
  if (!targetUserId) return c.json({ error: 'Target Telegram user id is required.' }, 400, { 'cache-control': VOICE_INDEX_CACHE });
  await c.env.BOT_CACHE.delete(ADMIN_TARGET_USER_PREFIX + targetUserId);
  return c.json({ ok: true, enabled: false, targetUserId }, 200, { 'cache-control': VOICE_INDEX_CACHE });
});

app.post('/app/api/vexa-voice/user-message', async (c) => {
  const body = await readJson<{ initData?: unknown }>(c);
  const userId = readTelegramUserId(String(body.initData || ''));
  if (!userId) return c.json({ ok: false, reason: 'no_user' }, 200, { 'cache-control': VOICE_INDEX_CACHE });
  const raw = await c.env.BOT_CACHE.get(ADMIN_TARGET_USER_PREFIX + userId).catch(() => null);
  if (!raw) return c.json({ ok: false, reason: 'no_target_message' }, 200, { 'cache-control': VOICE_INDEX_CACHE });
  const message = JSON.parse(raw) as TargetVoiceMessage;
  if (message.expiresAt && Date.parse(message.expiresAt) <= Date.now()) { await c.env.BOT_CACHE.delete(ADMIN_TARGET_USER_PREFIX + userId).catch(() => undefined); return c.json({ ok: false, reason: 'expired' }, 200, { 'cache-control': VOICE_INDEX_CACHE }); }
  if (message.targetUserId !== userId) return c.json({ ok: false, reason: 'not_target_user' }, 200, { 'cache-control': VOICE_INDEX_CACHE });
  if (await hasPlayed(c.env, userId, message.id)) return c.json({ ok: false, reason: 'already_played' }, 200, { 'cache-control': VOICE_INDEX_CACHE });
  return c.json({
    ok: true,
    eventId: 'admin_message',
    messageKey: message.id,
    language: message.language || 'en',
    title: cleanText(message.title, 120) || 'Vexa wants to say something',
    displayText: cleanText(message.title, 120) || 'Vexa wants to say something',
    autoplay: false,
    requiresTap: true,
    url: `/app/api/vexa-voice/custom-audio/${encodeURIComponent(message.audioId)}.mp3?v=${encodeURIComponent(message.version || '1')}`,
  }, 200, { 'cache-control': VOICE_INDEX_CACHE });
});



async function sendAdminBotMessage(env: Env, chatIds: string[], form: FormData): Promise<{ attempted: number; sent: number; failed: number }> {
  const token = env.GAME_BOT_TOKEN || env.TELEGRAM_BOT_TOKEN;
  if (!token) return { attempted: chatIds.length, sent: 0, failed: chatIds.length };
  const text = cleanText(form.get('text'), 1024);
  const buttonText = cleanText(form.get('buttonText'), 64);
  const buttonSection = cleanSection(form.get('buttonSection'));
  const image = form.get('image');
  if (!text && !(image instanceof File && image.size > 0)) throw new Error('Write text or choose an image first.');
  if (image instanceof File && image.size > 10 * 1024 * 1024) throw new Error('Image is too large. Maximum size is 10 MB.');
  let sent = 0, failed = 0;
  for (const chatId of chatIds) {
    try {
      if (image instanceof File && image.size > 0) await sendTelegramPhoto(token, chatId, image, text, buttonText, buttonSection);
      else await sendTelegramText(token, chatId, text, buttonText, buttonSection);
      sent++;
    } catch { failed++; }
  }
  return { attempted: chatIds.length, sent, failed };
}

async function sendTelegramText(token: string, chatId: string, text: string, buttonText: string, buttonSection: string): Promise<void> {
  const payload: Record<string, unknown> = { chat_id: chatId, text };
  const markup = replyMarkup(buttonText, buttonSection);
  if (markup) payload.reply_markup = markup;
  await callTelegram(token, 'sendMessage', payload);
}

async function sendTelegramPhoto(token: string, chatId: string, image: File, caption: string, buttonText: string, buttonSection: string): Promise<void> {
  const body = new FormData();
  body.append('chat_id', chatId);
  if (caption) body.append('caption', caption.slice(0, 1024));
  const markup = replyMarkup(buttonText, buttonSection);
  if (markup) body.append('reply_markup', JSON.stringify(markup));
  body.append('photo', image, image.name || 'admin-message.jpg');
  const response = await fetch('https://api.telegram.org/bot' + token + '/sendPhoto', { method: 'POST', body });
  if (!response.ok) throw new Error('Telegram failed');
  const json = await response.json().catch(() => ({})) as { ok?: boolean };
  if (!json.ok) throw new Error('Telegram rejected');
}

async function callTelegram(token: string, method: string, payload: Record<string, unknown>): Promise<void> {
  const response = await fetch('https://api.telegram.org/bot' + token + '/' + method, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) });
  if (!response.ok) throw new Error('Telegram failed');
  const json = await response.json().catch(() => ({})) as { ok?: boolean };
  if (!json.ok) throw new Error('Telegram rejected');
}

function replyMarkup(buttonText: string, section: string): { inline_keyboard: Array<Array<{ text: string; web_app: { url: string } }>> } | null {
  if (!buttonText) return null;
  const open = section === 'deposit' ? '?open=deposit' : '?section=' + encodeURIComponent(section);
  return { inline_keyboard: [[{ text: buttonText, web_app: { url: PUBLIC_BASE_URL + '/app' + open } }]] };
}

async function botDeliveryUsers(env: Env, regions: string[]): Promise<string[]> {
  const all = regions.includes('ALL');
  const rows = await env.DB.prepare('SELECT telegram_user_id, region_code, language_code FROM app_users ORDER BY last_seen_at DESC LIMIT 500').all<{ telegram_user_id: string; region_code: string | null; language_code: string | null }>().catch(() => ({ results: [] }));
  return (rows.results || []).filter((row) => all || regions.includes(regionKeyFromRow(row.region_code, row.language_code))).map((row) => String(row.telegram_user_id || '')).filter((id) => /^\d+$/.test(id));
}

function normalizeRegions(value: unknown): string[] {
  let raw: unknown = value;
  if (typeof value === 'string') { try { raw = JSON.parse(value); } catch {} }
  const list = Array.isArray(raw) ? raw : [raw || 'ALL'];
  const allowed = new Set(['ALL', 'EN', 'IR', 'TR', 'RU']);
  const out = list.map((item) => String(item || '').trim().toUpperCase()).filter((item) => allowed.has(item));
  return out.length ? Array.from(new Set(out)) : ['ALL'];
}

function regionKeyFromRow(regionCode: unknown, languageCode: unknown): string {
  const region = String(regionCode || '').toUpperCase();
  if (region === 'IR' || region === 'TR' || region === 'RU') return region;
  const language = String(languageCode || '').trim().toLowerCase();
  if (language === 'fa') return 'IR';
  if (language === 'tr') return 'TR';
  if (language === 'ru') return 'RU';
  return 'EN';
}

function cleanSection(value: unknown): string {
  const section = String(value || '').replace(/[^0-9A-Za-z_-]/g, '').trim().slice(0, 40);
  return section || 'home';
}

function ttlSecondsFromMinutes(value: unknown): number { const minutes = Math.floor(Number(value) || 0); if (minutes <= 0) return 0; return Math.min(minutes, 60 * 24 * 30) * 60; }
async function putMaybeExpiring(env: Env, key: string, value: unknown, ttlSeconds: number): Promise<void> { const payload = JSON.stringify(value); if (ttlSeconds > 0) await env.BOT_CACHE.put(key, payload, { expirationTtl: ttlSeconds }); else await env.BOT_CACHE.put(key, payload); }
async function sendDraftVoice(env: Env, chatId: string, draft: AdminDraft): Promise<void> { const token = env.GAME_BOT_TOKEN || env.TELEGRAM_BOT_TOKEN; if (!token) throw new Error('Bot token missing'); const object = await env.ASSETS.get(draft.r2Key); if (!object) throw new Error('Audio not found'); const form = new FormData(); form.append('chat_id', chatId); form.append('caption', cleanText(draft.title, 120) || 'Vexa wants to say something'); form.append('voice', new Blob([await object.arrayBuffer()], { type: 'audio/mpeg' }), draft.id + '.mp3'); const response = await fetch('https://api.telegram.org/bot' + token + '/sendVoice', { method: 'POST', body: form }); if (!response.ok) throw new Error('Telegram failed'); const json = await response.json().catch(() => ({})) as { ok?: boolean }; if (!json.ok) throw new Error('Telegram rejected'); }

async function hasPlayed(env: Env, userId: string, messageKey: string): Promise<boolean> {
  await env.DB.prepare('CREATE TABLE IF NOT EXISTS vexa_voice_user_events (user_id TEXT NOT NULL, event_id TEXT NOT NULL, played_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY (user_id, event_id))').run();
  const row = await env.DB.prepare('SELECT event_id FROM vexa_voice_user_events WHERE user_id = ? AND event_id = ?').bind(userId, messageKey).first<{ event_id: string }>().catch(() => null);
  return Boolean(row?.event_id);
}

async function readJson<T extends Record<string, unknown>>(c: any): Promise<T> { return c.req.json().catch(() => ({})) as Promise<T>; }
function readTelegramUserId(initData: string): string { if (!initData) return ''; try { const rawUser = new URLSearchParams(initData).get('user') || ''; const user = rawUser ? JSON.parse(rawUser) as { id?: number | string } : {}; const id = String(user.id || '').trim(); return /^\d+$/.test(id) ? id : ''; } catch { return ''; } }
function cleanUserId(value: unknown): string { return String(value || '').replace(/[^0-9]/g, '').trim().slice(0, 32); }
function cleanKey(value: unknown): string { return String(value || '').replace(/[^0-9A-Za-z_-]/g, '').trim().slice(0, 90); }
function cleanText(value: unknown, max: number): string { return String(value || '').replace(/[\u0000-\u001f<>]/g, '').trim().slice(0, max); }
function adminCookieValue(cookie: string | undefined): string { const match = (cookie ?? '').match(/(?:^|;\s*)vexa_admin=([^;]+)/); return match ? decodeURIComponent(match[1]) : ''; }
function isAdminRequest(c: any): boolean { const key = adminCookieValue(c.req.header('cookie')); return Boolean(c.env.ADMIN_KEY && key && key === c.env.ADMIN_KEY); }
