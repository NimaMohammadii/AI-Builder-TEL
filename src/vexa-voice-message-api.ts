import { VEXA_VOICE_LANGUAGES, VEXA_VOICE_MESSAGES, normalizeVexaVoiceEventId, normalizeVexaVoiceLanguage, vexaVoiceLanguageForRegion, vexaVoiceR2Key, type VexaVoiceLanguage } from './vexa-voice-messages';
import type { Env } from './types';

type EnvWithVexaVoice = Env & { ELEVENLABS_API_KEY?: string };
type AppLike = { get: (path: string, handler: (c: any) => Promise<Response> | Response) => unknown; post: (path: string, handler: (c: any) => Promise<Response> | Response) => unknown };
type VoiceAssetRow = { event_id: string; label: string; language_code: string; display_text: string; prompt_text: string; r2_key: string | null; version: string | null; content_type: string | null; autoplay: number; requires_tap: number };
type RegionRow = { region_code: string | null; language_code: string | null };
type AdminMessage = { id: string; title: string; eventId: 'admin_message'; audioId?: string; language?: VexaVoiceLanguage; r2Key?: string; version?: string };
type AdminDraft = { id: string; title: string; text: string; language: VexaVoiceLanguage; regions: string[]; r2Key: string; version: string; createdAt: string };

const VEXA_VOICE_ID = 'TX3LPaxmHKxFdv7VOQHJ';
const VEXA_VOICE_MODEL = 'eleven_v3';
const ADMIN_CURRENT_MESSAGE_KEY = 'vexa-voice:admin-message-current';
const ADMIN_REGION_MESSAGE_PREFIX = 'vexa-voice:admin-message:';
const ADMIN_DRAFT_PREFIX = 'vexa-voice:admin-draft:';
const ADMIN_AUDIO_PREFIX = 'vexa-voice:admin-audio:';
const VOICE_INDEX_CACHE = 'no-store';
const VOICE_AUDIO_CACHE = 'public, max-age=31536000, immutable';
const REGION_KEYS = new Set(['ALL', 'EN', 'IR', 'TR', 'RU']);

export function registerVexaVoiceMessageRoutes(app: AppLike): void {
  app.get('/admin/api/vexa-voice/health', (c) => c.json({ ok: true, feature: 'vexa_voice_messages' }, 200, { 'cache-control': VOICE_INDEX_CACHE }));

  app.get('/admin/api/vexa-voice/messages', async (c) => {
    if (!isAdminRequest(c)) return c.json({ error: 'Unauthorized. Login again.' }, 401);
    await seedVoiceMessages(c.env);
    return c.json(await listVoiceMessages(c.env), 200, { 'cache-control': VOICE_INDEX_CACHE });
  });

  app.post('/admin/api/vexa-voice/seed', async (c) => {
    if (!isAdminRequest(c)) return c.json({ error: 'Unauthorized. Login again.' }, 401);
    await seedVoiceMessages(c.env);
    return c.json(await listVoiceMessages(c.env), 200, { 'cache-control': VOICE_INDEX_CACHE });
  });

  app.post('/admin/api/vexa-voice/generate', async (c) => {
    if (!isAdminRequest(c)) return c.json({ error: 'Unauthorized. Login again.' }, 401);
    const env = c.env as EnvWithVexaVoice;
    if (!env.ELEVENLABS_API_KEY) return c.json({ error: 'ElevenLabs API key is not configured.' }, 500);
    const body = await readJson<{ eventId?: unknown; language?: unknown }>(c);
    const requestedEvent = normalizeVexaVoiceEventId(body.eventId);
    const requestedLanguage = body.language ? normalizeVexaVoiceLanguage(body.language) : '';
    await seedVoiceMessages(env);
    const generated: Array<{ eventId: string; language: string; key: string }> = [];
    for (const message of VEXA_VOICE_MESSAGES) {
      if (requestedEvent && requestedEvent !== message.eventId) continue;
      for (const language of VEXA_VOICE_LANGUAGES) {
        if (requestedLanguage && requestedLanguage !== language) continue;
        const key = vexaVoiceR2Key(message.eventId, language);
        const version = String(Date.now());
        const audio = await createSpeech(env, message.texts[language]);
        await env.ASSETS.put(key, audio, { httpMetadata: { contentType: 'audio/mpeg' }, customMetadata: { version, eventId: message.eventId, language } });
        await env.DB.prepare(`UPDATE vexa_voice_assets SET r2_key = ?, version = ?, content_type = 'audio/mpeg', updated_at = CURRENT_TIMESTAMP WHERE event_id = ? AND language_code = ?`).bind(key, version, message.eventId, language).run();
        generated.push({ eventId: message.eventId, language, key });
      }
    }
    return c.json({ ok: true, generated, count: generated.length }, 200, { 'cache-control': VOICE_INDEX_CACHE });
  });

  app.post('/admin/api/vexa-voice/preview', async (c) => {
    try {
      if (!isAdminRequest(c)) return c.json({ error: 'Unauthorized. Login again.' }, 401);
      const env = c.env as EnvWithVexaVoice;
      if (!env.ELEVENLABS_API_KEY) return c.json({ error: 'ElevenLabs API key is not configured.' }, 500);
      const body = await readJson<{ title?: unknown; text?: unknown; language?: unknown; regions?: unknown }>(c);
      const text = cleanText(body.text, 700);
      if (!text) return c.json({ error: 'Write message text first.' }, 400);
      const title = cleanText(body.title, 90) || 'Vexa wants to say something';
      const language = normalizeVexaVoiceLanguage(body.language);
      const regions = normalizeRegions(body.regions);
      const id = 'adm_' + Date.now();
      const version = String(Date.now());
      const r2Key = `vexa-voice/admin/${id}.mp3`;
      const audio = await createSpeech(env, text);
      await env.ASSETS.put(r2Key, audio, { httpMetadata: { contentType: 'audio/mpeg' }, customMetadata: { version, language, title } });
      const draft: AdminDraft = { id, title, text, language, regions, r2Key, version, createdAt: new Date().toISOString() };
      await env.BOT_CACHE.put(ADMIN_DRAFT_PREFIX + id, JSON.stringify(draft), { expirationTtl: 86400 });
      await env.BOT_CACHE.put(ADMIN_AUDIO_PREFIX + id, JSON.stringify({ id, r2Key, version, contentType: 'audio/mpeg' }), { expirationTtl: 86400 * 30 });
      return c.json({ ok: true, draftId: id, title, language, regions, previewUrl: `/app/api/vexa-voice/custom-audio/${id}.mp3?v=${version}` }, 200, { 'cache-control': VOICE_INDEX_CACHE });
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : 'Could not generate preview.' }, 500, { 'cache-control': VOICE_INDEX_CACHE });
    }
  });

  app.post('/admin/api/vexa-voice/publish', async (c) => {
    if (!isAdminRequest(c)) return c.json({ error: 'Unauthorized. Login again.' }, 401);
    const env = c.env as EnvWithVexaVoice;
    const body = await readJson<{ draftId?: unknown; regions?: unknown }>(c);
    const draftId = cleanEventKey(body.draftId);
    const raw = draftId ? await env.BOT_CACHE.get(ADMIN_DRAFT_PREFIX + draftId).catch(() => null) : null;
    if (!raw) return c.json({ error: 'Preview not found. Generate again.' }, 404);
    const draft = JSON.parse(raw) as AdminDraft;
    const regions = normalizeRegions(body.regions || draft.regions);
    const message: AdminMessage = { id: draft.id, title: draft.title, eventId: 'admin_message', audioId: draft.id, language: draft.language, r2Key: draft.r2Key, version: draft.version };
    for (const region of regions) await env.BOT_CACHE.put(ADMIN_REGION_MESSAGE_PREFIX + region, JSON.stringify(message));
    if (regions.includes('ALL')) await env.BOT_CACHE.put(ADMIN_CURRENT_MESSAGE_KEY, JSON.stringify(message));
    return c.json({ ok: true, sentTo: regions, id: draft.id, title: draft.title }, 200, { 'cache-control': VOICE_INDEX_CACHE });
  });

  app.post('/admin/api/vexa-voice/admin-message', async (c) => {
    if (!isAdminRequest(c)) return c.json({ error: 'Unauthorized. Login again.' }, 401);
    const body = await readJson<{ enabled?: unknown; title?: unknown; regions?: unknown }>(c);
    const regions = normalizeRegions(body.regions);
    if (body.enabled === false) {
      await c.env.BOT_CACHE.delete(ADMIN_CURRENT_MESSAGE_KEY);
      for (const region of regions) await c.env.BOT_CACHE.delete(ADMIN_REGION_MESSAGE_PREFIX + region);
      return c.json({ ok: true, enabled: false, regions });
    }
    const id = 'msg_' + Date.now();
    const title = cleanText(body.title, 90) || 'Vexa wants to say something';
    const message: AdminMessage = { id, title, eventId: 'admin_message' };
    for (const region of regions) await c.env.BOT_CACHE.put(ADMIN_REGION_MESSAGE_PREFIX + region, JSON.stringify(message));
    if (regions.includes('ALL')) await c.env.BOT_CACHE.put(ADMIN_CURRENT_MESSAGE_KEY, JSON.stringify(message));
    return c.json({ ok: true, enabled: true, id, title, regions }, 200, { 'cache-control': VOICE_INDEX_CACHE });
  });

  app.post('/app/api/vexa-voice/message', async (c) => {
    const body = await readJson<{ event?: unknown; initData?: unknown }>(c);
    const eventId = normalizeVexaVoiceEventId(body.event);
    if (!eventId) return c.json({ ok: false, error: 'Invalid voice message event.' }, 400);
    await seedVoiceMessages(c.env);
    const userId = readTelegramUserId(String(body.initData || ''));
    const language = await voiceLanguageForUser(c.env, userId);
    const regionKey = await messageRegionKey(c.env, userId, language);
    const adminMessage = eventId === 'admin_message' ? await currentAdminMessage(c.env, regionKey) : null;
    if (eventId === 'admin_message' && !adminMessage) return c.json({ ok: false, reason: 'no_admin_message' }, 200, { 'cache-control': VOICE_INDEX_CACHE });
    const playedKey = adminMessage?.id || eventId;
    if (userId && await hasUserPlayedEvent(c.env, userId, playedKey)) return c.json({ ok: false, reason: 'already_played' }, 200, { 'cache-control': VOICE_INDEX_CACHE });
    if (adminMessage?.audioId) return c.json({ ok: true, eventId, messageKey: playedKey, language: adminMessage.language || language, title: adminMessage.title, displayText: adminMessage.title, autoplay: false, requiresTap: true, url: `/app/api/vexa-voice/custom-audio/${encodeURIComponent(adminMessage.audioId)}.mp3?v=${encodeURIComponent(adminMessage.version || '1')}` }, 200, { 'cache-control': VOICE_INDEX_CACHE });
    const row = await getVoiceAsset(c.env, eventId, language) || await getVoiceAsset(c.env, eventId, 'en');
    if (!row?.r2_key) return c.json({ ok: false, reason: 'audio_not_generated' }, 200, { 'cache-control': VOICE_INDEX_CACHE });
    return c.json({ ok: true, eventId, messageKey: playedKey, language: row.language_code, title: adminMessage?.title || row.display_text, displayText: row.display_text, autoplay: eventId === 'admin_message' ? false : Boolean(row.autoplay), requiresTap: eventId === 'admin_message' ? true : Boolean(row.requires_tap), url: `/app/api/vexa-voice/audio/${encodeURIComponent(row.event_id)}/${encodeURIComponent(row.language_code)}.mp3?v=${encodeURIComponent(row.version || '1')}` }, 200, { 'cache-control': VOICE_INDEX_CACHE });
  });

  app.post('/app/api/vexa-voice/played', async (c) => {
    const body = await readJson<{ event?: unknown; messageKey?: unknown; initData?: unknown }>(c);
    const userId = readTelegramUserId(String(body.initData || ''));
    const eventKey = cleanEventKey(body.messageKey || body.event);
    if (!userId || !eventKey) return c.json({ ok: false });
    await ensureVoiceTables(c.env);
    await c.env.DB.prepare('INSERT OR IGNORE INTO vexa_voice_user_events (user_id, event_id, played_at) VALUES (?, ?, CURRENT_TIMESTAMP)').bind(userId, eventKey).run();
    return c.json({ ok: true });
  });

  app.get('/app/api/vexa-voice/audio/:event/:language', async (c) => {
    const eventId = normalizeVexaVoiceEventId(c.req.param('event'));
    const language = normalizeVexaVoiceLanguage(String(c.req.param('language') || '').replace(/\.mp3$/i, ''));
    if (!eventId) return c.text('Not found', 404, { 'cache-control': 'no-store' });
    const row = await getVoiceAsset(c.env, eventId, language);
    if (!row?.r2_key) return c.text('Not found', 404, { 'cache-control': 'no-store' });
    return audioFromR2(c.env, row.r2_key, row.content_type || 'audio/mpeg');
  });

  app.get('/app/api/vexa-voice/custom-audio/:id', async (c) => {
    const id = cleanEventKey(String(c.req.param('id') || '').replace(/\.mp3$/i, ''));
    const raw = await c.env.BOT_CACHE.get(ADMIN_AUDIO_PREFIX + id).catch(() => null);
    if (!raw) return c.text('Not found', 404, { 'cache-control': 'no-store' });
    const meta = JSON.parse(raw) as { r2Key?: string; contentType?: string };
    if (!meta.r2Key) return c.text('Not found', 404, { 'cache-control': 'no-store' });
    return audioFromR2(c.env, meta.r2Key, meta.contentType || 'audio/mpeg');
  });
}

async function audioFromR2(env: EnvWithVexaVoice, key: string, contentType: string): Promise<Response> { const object = await env.ASSETS.get(key).catch(() => null); if (!object) return new Response('Not found', { status: 404, headers: { 'cache-control': 'no-store' } }); return new Response(object.body, { headers: { 'content-type': object.httpMetadata?.contentType || contentType, 'cache-control': VOICE_AUDIO_CACHE, 'accept-ranges': 'bytes' } }); }
async function ensureVoiceTables(env: EnvWithVexaVoice): Promise<void> { await env.DB.prepare(`CREATE TABLE IF NOT EXISTS vexa_voice_assets (event_id TEXT NOT NULL, language_code TEXT NOT NULL, label TEXT NOT NULL, display_text TEXT NOT NULL, prompt_text TEXT NOT NULL, r2_key TEXT, version TEXT, content_type TEXT, autoplay INTEGER NOT NULL DEFAULT 1, requires_tap INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY (event_id, language_code))`).run(); await env.DB.prepare(`CREATE TABLE IF NOT EXISTS vexa_voice_user_events (user_id TEXT NOT NULL, event_id TEXT NOT NULL, played_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY (user_id, event_id))`).run(); }
async function seedVoiceMessages(env: EnvWithVexaVoice): Promise<void> { await ensureVoiceTables(env); for (const message of VEXA_VOICE_MESSAGES) for (const language of VEXA_VOICE_LANGUAGES) await env.DB.prepare(`INSERT INTO vexa_voice_assets (event_id, language_code, label, display_text, prompt_text, autoplay, requires_tap, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP) ON CONFLICT(event_id, language_code) DO UPDATE SET label = excluded.label, display_text = excluded.display_text, prompt_text = excluded.prompt_text, autoplay = excluded.autoplay, requires_tap = excluded.requires_tap, updated_at = CURRENT_TIMESTAMP`).bind(message.eventId, language, message.label, message.displayText, message.texts[language], message.autoplay ? 1 : 0, message.requiresTap ? 1 : 0).run(); }
async function listVoiceMessages(env: EnvWithVexaVoice): Promise<{ ok: true; messages: VoiceAssetRow[] }> { await ensureVoiceTables(env); const rows = await env.DB.prepare('SELECT * FROM vexa_voice_assets ORDER BY event_id, language_code').all<VoiceAssetRow>(); return { ok: true, messages: rows.results ?? [] }; }
async function getVoiceAsset(env: EnvWithVexaVoice, eventId: string, language: VexaVoiceLanguage): Promise<VoiceAssetRow | null> { await ensureVoiceTables(env); return env.DB.prepare('SELECT * FROM vexa_voice_assets WHERE event_id = ? AND language_code = ?').bind(eventId, language).first<VoiceAssetRow>().catch(() => null); }
async function hasUserPlayedEvent(env: EnvWithVexaVoice, userId: string, eventKey: string): Promise<boolean> { await ensureVoiceTables(env); const row = await env.DB.prepare('SELECT event_id FROM vexa_voice_user_events WHERE user_id = ? AND event_id = ?').bind(userId, eventKey).first<{ event_id: string }>().catch(() => null); return Boolean(row?.event_id); }
async function voiceLanguageForUser(env: EnvWithVexaVoice, userId: string): Promise<VexaVoiceLanguage> { if (!userId) return 'en'; const row = await env.DB.prepare('SELECT region_code, language_code FROM app_users WHERE telegram_user_id = ?').bind(userId).first<RegionRow>().catch(() => null); return vexaVoiceLanguageForRegion(row?.region_code, row?.language_code); }
async function messageRegionKey(env: EnvWithVexaVoice, userId: string, language: VexaVoiceLanguage): Promise<string> { if (!userId) return language === 'fa' ? 'IR' : language === 'tr' ? 'TR' : language === 'ru' ? 'RU' : 'EN'; const row = await env.DB.prepare('SELECT region_code FROM app_users WHERE telegram_user_id = ?').bind(userId).first<{ region_code: string | null }>().catch(() => null); const region = String(row?.region_code || '').toUpperCase(); if (region === 'IR' || region === 'TR' || region === 'RU') return region; return 'EN'; }
async function currentAdminMessage(env: EnvWithVexaVoice, regionKey: string): Promise<AdminMessage | null> { const keys = [ADMIN_REGION_MESSAGE_PREFIX + regionKey, ADMIN_REGION_MESSAGE_PREFIX + 'ALL', ADMIN_CURRENT_MESSAGE_KEY]; for (const key of keys) { const raw = await env.BOT_CACHE.get(key).catch(() => null); if (!raw) continue; try { const parsed = JSON.parse(raw) as AdminMessage; const id = cleanEventKey(parsed.id); if (id) return { ...parsed, id, title: cleanText(parsed.title, 120) || 'Vexa wants to say something', eventId: 'admin_message' }; } catch {} } return null; }
async function createSpeech(env: EnvWithVexaVoice, text: string): Promise<ArrayBuffer> { const controller = new AbortController(); const timer = setTimeout(() => controller.abort(), 30000); try { const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VEXA_VOICE_ID}`, { method: 'POST', headers: { 'xi-api-key': env.ELEVENLABS_API_KEY || '', 'content-type': 'application/json', accept: 'audio/mpeg' }, body: JSON.stringify({ text, model_id: VEXA_VOICE_MODEL, voice_settings: { stability: 0.5, similarity_boost: 0.75 } }), signal: controller.signal }); if (!response.ok) { const detail = await response.text().catch(() => ''); throw new Error(`ElevenLabs failed with ${response.status}${detail ? ': ' + detail.slice(0, 160) : ''}`); } return response.arrayBuffer(); } catch (error) { if (error instanceof DOMException && error.name === 'AbortError') throw new Error('ElevenLabs generation timed out. Try shorter text.'); throw error; } finally { clearTimeout(timer); } }
async function readJson<T extends Record<string, unknown>>(c: any): Promise<T> { return c.req.json().catch(() => ({})) as Promise<T>; }
function readTelegramUserId(initData: string): string { if (!initData) return ''; try { const rawUser = new URLSearchParams(initData).get('user') || ''; const user = rawUser ? JSON.parse(rawUser) as { id?: number | string } : {}; const id = String(user.id || '').trim(); return /^\d+$/.test(id) ? id : ''; } catch { return ''; } }
function normalizeRegions(value: unknown): string[] { const raw = Array.isArray(value) ? value : [value || 'ALL']; const out = raw.map((item) => String(item || '').trim().toUpperCase()).filter((item) => REGION_KEYS.has(item)); return out.length ? Array.from(new Set(out)) : ['ALL']; }
function cleanText(value: unknown, max: number): string { return String(value || '').replace(/[\u0000-\u001f<>]/g, '').trim().slice(0, max); }
function cleanEventKey(value: unknown): string { return String(value || '').replace(/[^0-9A-Za-z_-]/g, '').trim().slice(0, 90); }
function adminCookieValue(cookie: string | undefined): string { const match = (cookie ?? '').match(/(?:^|;\s*)vexa_admin=([^;]+)/); return match ? decodeURIComponent(match[1]) : ''; }
function isAdminRequest(c: any): boolean { const key = adminCookieValue(c.req.header('cookie')); return Boolean(c.env.ADMIN_KEY && key && key === c.env.ADMIN_KEY); }
