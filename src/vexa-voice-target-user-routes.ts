import app from './index';
import type { Env } from './types';
import type { VexaVoiceLanguage } from './vexa-voice-messages';

type TargetVoiceMessage = {
  id: string;
  title: string;
  eventId: 'admin_message';
  audioId: string;
  language?: VexaVoiceLanguage;
  version?: string;
  targetUserId: string;
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

app.post('/admin/api/vexa-voice/user-publish', async (c) => {
  if (!isAdminRequest(c)) return c.json({ error: 'Unauthorized. Login again.' }, 401, { 'cache-control': VOICE_INDEX_CACHE });
  const body = await readJson<{ draftId?: unknown; targetUserId?: unknown }>(c);
  const draftId = cleanKey(body.draftId);
  const targetUserId = cleanUserId(body.targetUserId);
  if (!targetUserId) return c.json({ error: 'Target Telegram user id is required.' }, 400, { 'cache-control': VOICE_INDEX_CACHE });
  const raw = draftId ? await c.env.BOT_CACHE.get(ADMIN_DRAFT_PREFIX + draftId).catch(() => null) : null;
  if (!raw) return c.json({ error: 'Preview not found. Generate again.' }, 404, { 'cache-control': VOICE_INDEX_CACHE });
  const draft = JSON.parse(raw) as AdminDraft;
  const message: TargetVoiceMessage = {
    id: draft.id,
    title: cleanText(draft.title, 120) || 'Vexa wants to say something',
    eventId: 'admin_message',
    audioId: draft.id,
    language: draft.language,
    version: draft.version,
    targetUserId,
  };
  await c.env.BOT_CACHE.put(ADMIN_TARGET_USER_PREFIX + targetUserId, JSON.stringify(message));
  return c.json({ ok: true, sentToUser: targetUserId, id: message.id, title: message.title }, 200, { 'cache-control': VOICE_INDEX_CACHE });
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
