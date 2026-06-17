import app from './index';
import type { Env } from './types';

type EnvWithVoiceMessages = Env & {
  ELEVENLABS_API_KEY?: string;
};

type VoiceMessageSeed = {
  eventId: string;
  label: string;
  displayText: string;
  autoplay: boolean;
  requiresTap: boolean;
  texts: Record<VoiceLanguage, string>;
};

type VoiceLanguage = 'en' | 'fa' | 'tr' | 'ru';

type VoiceAssetRow = {
  event_id: string;
  label: string;
  language_code: string;
  display_text: string;
  prompt_text: string;
  r2_key: string | null;
  version: string | null;
  content_type: string | null;
  autoplay: number;
  requires_tap: number;
};

type RegionRow = {
  region_code: string | null;
  language_code: string | null;
};

const VEXA_VOICE_ID = 'TX3LPaxmHKxFdv7VOQHJ';
const VEXA_VOICE_MODEL = 'eleven_v3';
const VOICE_ASSET_CACHE = 'public, max-age=31536000, immutable';
const VOICE_INDEX_CACHE = 'no-store';
const VOICE_LANGUAGES: VoiceLanguage[] = ['en', 'fa', 'tr', 'ru'];
const SUPPORTED_LANGUAGE_CODES = new Set<string>(VOICE_LANGUAGES);
const ADMIN_CURRENT_MESSAGE_KEY = 'vexa-voice:admin-message-current';

const VEXA_VOICE_MESSAGES: VoiceMessageSeed[] = [
  {
    eventId: 'admin_message',
    label: 'Admin Message',
    displayText: 'Vexa wants to say something 👀',
    autoplay: false,
    requiresTap: true,
    texts: {
      en: '[curious, playful, warm] Hey! Vexa has something important for you. Tap in and don’t miss it!',
      fa: '[curious, playful, warm] هی! وکسا یه پیام مهم برات داره. بزن روش، از دستش نده!',
      tr: '[curious, playful, warm] Hey! Vexa’nın sana önemli bir mesajı var. Dokun ve kaçırma!',
      ru: '[curious, playful, warm] Эй! У Vexa есть важное сообщение для тебя. Нажми и не пропусти!',
    },
  },
  {
    eventId: 'first_deposit',
    label: 'First Deposit',
    displayText: 'Balance loaded by Vexa',
    autoplay: true,
    requiresTap: false,
    texts: {
      en: '[excited, playful, smiling] Boom! Your balance is loaded! Start smart, and make every move count!',
      fa: '[excited, playful, smiling] بوم! بالانست شارژ شد! هوشمند شروع کن و هر حرکتت رو حساب‌شده بزن!',
      tr: '[excited, playful, smiling] Boom! Bakiyen yüklendi! Akıllı başla, her hamleni saydır!',
      ru: '[excited, playful, smiling] Бум! Баланс загружен! Начинай умно и делай каждый ход важным!',
    },
  },
  {
    eventId: 'first_withdraw',
    label: 'First Withdraw',
    displayText: 'Clean cash out',
    autoplay: true,
    requiresTap: false,
    texts: {
      en: '[happy, proud, playful] Nice! You cashed out! Clean move!',
      fa: '[happy, proud, playful] عالیه! برداشت زدی! حرکت تمیزی بود!',
      tr: '[happy, proud, playful] Güzel! Paranı çektin! Temiz hamle!',
      ru: '[happy, proud, playful] Отлично! Ты вывел деньги! Чистый ход!',
    },
  },
  {
    eventId: 'daily_rewards_intro',
    label: 'Daily Rewards Intro',
    displayText: 'Daily Rewards tip from Vexa',
    autoplay: true,
    requiresTap: false,
    texts: {
      en: '[happy, playful, smiling] Welcome to Daily Rewards! Come back every day, keep your streak alive, and unlock better prizes!',
      fa: '[happy, playful, smiling] به جایزه‌های روزانه خوش اومدی! هر روز برگرد، استریکت رو زنده نگه دار و جایزه‌های بهتر باز کن!',
      tr: '[happy, playful, smiling] Daily Rewards’a hoş geldin! Her gün geri gel, serini koru ve daha iyi ödüller aç!',
      ru: '[happy, playful, smiling] Добро пожаловать в Daily Rewards! Возвращайся каждый день, держи серию и открывай награды лучше!',
    },
  },
  {
    eventId: 'playzone_intro',
    label: 'Play Zone Intro',
    displayText: 'Play Zone tip from Vexa',
    autoplay: true,
    requiresTap: false,
    texts: {
      en: '[excited, playful, energetic] Welcome to Play Zone! Pick your game, start small, and play smart!',
      fa: '[excited, playful, energetic] به پلی زون خوش اومدی! بازیت رو انتخاب کن، کم شروع کن و هوشمند بازی کن!',
      tr: '[excited, playful, energetic] Play Zone’a hoş geldin! Oyununu seç, küçük başla ve akıllı oyna!',
      ru: '[excited, playful, energetic] Добро пожаловать в Play Zone! Выбери игру, начни с малого и играй умно!',
    },
  },
  {
    eventId: 'predict_intro',
    label: 'Predict Intro',
    displayText: 'Predict tip from Vexa',
    autoplay: true,
    requiresTap: false,
    texts: {
      en: '[excited, playful, mysterious] Welcome to Predict! Pick a side, trust your instinct, and let’s see if you can read the future!',
      fa: '[excited, playful, mysterious] به Predict خوش اومدی! یه سمت رو انتخاب کن، به حست اعتماد کن و ببین آینده رو می‌خونی یا نه!',
      tr: '[excited, playful, mysterious] Predict’e hoş geldin! Bir taraf seç, içgüdüne güven ve geleceği okuyabiliyor musun görelim!',
      ru: '[excited, playful, mysterious] Добро пожаловать в Predict! Выбери сторону, доверься чутью и посмотрим, читаешь ли ты будущее!',
    },
  },
];

app.get('/admin/api/vexa-voice/messages', async (c) => {
  if (!isAdminRequest(c)) return c.json({ error: 'Unauthorized. Login again.' }, 401);
  await seedVoiceMessages(c.env as EnvWithVoiceMessages);
  return c.json(await listVoiceMessages(c.env as EnvWithVoiceMessages), 200, { 'cache-control': VOICE_INDEX_CACHE });
});

app.post('/admin/api/vexa-voice/seed', async (c) => {
  if (!isAdminRequest(c)) return c.json({ error: 'Unauthorized. Login again.' }, 401);
  await seedVoiceMessages(c.env as EnvWithVoiceMessages);
  return c.json(await listVoiceMessages(c.env as EnvWithVoiceMessages), 200, { 'cache-control': VOICE_INDEX_CACHE });
});

app.post('/admin/api/vexa-voice/generate', async (c) => {
  if (!isAdminRequest(c)) return c.json({ error: 'Unauthorized. Login again.' }, 401);
  const env = c.env as EnvWithVoiceMessages;
  if (!env.ELEVENLABS_API_KEY) return c.json({ error: 'ElevenLabs API key is not configured.' }, 500);

  const body = await c.req.json().catch(() => ({})) as { eventId?: unknown; language?: unknown };
  const requestedEvent = String(body.eventId || '').trim();
  const requestedLanguage = String(body.language || '').trim().toLowerCase();

  await seedVoiceMessages(env);
  const generated: Array<{ eventId: string; language: string; key: string }> = [];

  for (const message of VEXA_VOICE_MESSAGES) {
    if (requestedEvent && requestedEvent !== message.eventId) continue;
    for (const language of VOICE_LANGUAGES) {
      if (requestedLanguage && requestedLanguage !== language) continue;
      const text = message.texts[language];
      const audio = await createSpeech(env, text);
      const version = String(Date.now());
      const key = voiceR2Key(message.eventId, language);
      await env.ASSETS.put(key, audio, {
        httpMetadata: { contentType: 'audio/mpeg' },
        customMetadata: { version, eventId: message.eventId, language },
      });
      await env.DB.prepare(`UPDATE vexa_voice_assets
        SET r2_key = ?, version = ?, content_type = 'audio/mpeg', updated_at = CURRENT_TIMESTAMP
        WHERE event_id = ? AND language_code = ?`)
        .bind(key, version, message.eventId, language)
        .run();
      generated.push({ eventId: message.eventId, language, key });
    }
  }

  return c.json({ ok: true, generated, count: generated.length });
});

app.post('/admin/api/vexa-voice/admin-message', async (c) => {
  if (!isAdminRequest(c)) return c.json({ error: 'Unauthorized. Login again.' }, 401);
  const body = await c.req.json().catch(() => ({})) as { enabled?: unknown; title?: unknown };
  const enabled = body.enabled !== false;
  if (!enabled) {
    await c.env.BOT_CACHE.delete(ADMIN_CURRENT_MESSAGE_KEY);
    return c.json({ ok: true, enabled: false });
  }
  const id = 'msg_' + Date.now();
  const title = cleanText(body.title, 80) || 'Vexa wants to say something 👀';
  await c.env.BOT_CACHE.put(ADMIN_CURRENT_MESSAGE_KEY, JSON.stringify({ id, title, eventId: 'admin_message', createdAt: new Date().toISOString() }));
  return c.json({ ok: true, enabled: true, id, title });
});

app.post('/app/api/vexa-voice/message', async (c) => {
  const env = c.env as EnvWithVoiceMessages;
  const body = await c.req.json().catch(() => ({})) as { event?: unknown; initData?: unknown };
  const eventId = normalizeEventId(body.event);
  if (!eventId) return c.json({ ok: false, error: 'Invalid voice message event.' }, 400);

  await seedVoiceMessages(env);

  const userId = readTelegramUserId(String(body.initData || ''));
  const adminMessage = eventId === 'admin_message' ? await currentAdminMessage(env) : null;
  if (eventId === 'admin_message' && !adminMessage) return c.json({ ok: false, reason: 'no_admin_message' });

  if (userId && eventId !== 'admin_message' && await hasUserPlayedEvent(env, userId, eventId)) {
    return c.json({ ok: false, reason: 'already_played' });
  }

  if (userId && eventId === 'admin_message' && adminMessage && await hasUserPlayedEvent(env, userId, adminMessage.id)) {
    return c.json({ ok: false, reason: 'admin_message_seen' });
  }

  const language = await voiceLanguageForUser(env, userId);
  const row = await getVoiceAsset(env, eventId, language) || await getVoiceAsset(env, eventId, 'en');
  if (!row?.r2_key) return c.json({ ok: false, reason: 'audio_not_generated' });

  const messageKey = eventId === 'admin_message' && adminMessage ? adminMessage.id : eventId;
  return c.json({
    ok: true,
    eventId,
    messageKey,
    language: row.language_code,
    title: adminMessage?.title || row.display_text,
    displayText: row.display_text,
    autoplay: Boolean(row.autoplay),
    requiresTap: Boolean(row.requires_tap),
    url: `/app/api/vexa-voice/audio/${encodeURIComponent(row.event_id)}/${encodeURIComponent(row.language_code)}.mp3?v=${encodeURIComponent(row.version || '1')}`,
  }, 200, { 'cache-control': VOICE_INDEX_CACHE });
});

app.post('/app/api/vexa-voice/played', async (c) => {
  const env = c.env as EnvWithVoiceMessages;
  const body = await c.req.json().catch(() => ({})) as { event?: unknown; messageKey?: unknown; initData?: unknown };
  const userId = readTelegramUserId(String(body.initData || ''));
  const eventId = normalizeEventId(body.messageKey || body.event);
  if (!userId || !eventId) return c.json({ ok: false });
  await ensureVoiceTables(env);
  await env.DB.prepare(`INSERT OR IGNORE INTO vexa_voice_user_events (user_id, event_id, played_at)
    VALUES (?, ?, CURRENT_TIMESTAMP)`)
    .bind(userId, eventId)
    .run();
  return c.json({ ok: true });
});

app.get('/app/api/vexa-voice/audio/:event/:language', async (c) => {
  const eventId = normalizeEventId(c.req.param('event'));
  const language = normalizeVoiceLanguage(String(c.req.param('language') || '').replace(/\.mp3$/i, ''));
  if (!eventId || !language) return c.text('Not found', 404, { 'cache-control': 'no-store' });
  const row = await getVoiceAsset(c.env as EnvWithVoiceMessages, eventId, language);
  if (!row?.r2_key) return c.text('Not found', 404, { 'cache-control': 'no-store' });
  const object = await c.env.ASSETS.get(row.r2_key).catch(() => null);
  if (!object) return c.text('Not found', 404, { 'cache-control': 'no-store' });
  return new Response(object.body, {
    headers: {
      'content-type': object.httpMetadata?.contentType || row.content_type || 'audio/mpeg',
      'cache-control': VOICE_ASSET_CACHE,
      'accept-ranges': 'bytes',
    },
  });
});

async function ensureVoiceTables(env: EnvWithVoiceMessages): Promise<void> {
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS vexa_voice_assets (
    event_id TEXT NOT NULL,
    language_code TEXT NOT NULL,
    label TEXT NOT NULL,
    display_text TEXT NOT NULL,
    prompt_text TEXT NOT NULL,
    r2_key TEXT,
    version TEXT,
    content_type TEXT,
    autoplay INTEGER NOT NULL DEFAULT 1,
    requires_tap INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (event_id, language_code)
  )`).run();

  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS vexa_voice_user_events (
    user_id TEXT NOT NULL,
    event_id TEXT NOT NULL,
    played_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, event_id)
  )`).run();
}

async function seedVoiceMessages(env: EnvWithVoiceMessages): Promise<void> {
  await ensureVoiceTables(env);
  for (const message of VEXA_VOICE_MESSAGES) {
    for (const language of VOICE_LANGUAGES) {
      await env.DB.prepare(`INSERT INTO vexa_voice_assets (event_id, language_code, label, display_text, prompt_text, autoplay, requires_tap, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(event_id, language_code) DO UPDATE SET
          label = excluded.label,
          display_text = excluded.display_text,
          prompt_text = excluded.prompt_text,
          autoplay = excluded.autoplay,
          requires_tap = excluded.requires_tap,
          updated_at = CURRENT_TIMESTAMP`)
        .bind(message.eventId, language, message.label, message.displayText, message.texts[language], message.autoplay ? 1 : 0, message.requiresTap ? 1 : 0)
        .run();
    }
  }
}

async function listVoiceMessages(env: EnvWithVoiceMessages): Promise<{ ok: true; messages: VoiceAssetRow[] }> {
  await ensureVoiceTables(env);
  const rows = await env.DB.prepare('SELECT * FROM vexa_voice_assets ORDER BY event_id, language_code').all<VoiceAssetRow>();
  return { ok: true, messages: rows.results ?? [] };
}

async function getVoiceAsset(env: EnvWithVoiceMessages, eventId: string, language: string): Promise<VoiceAssetRow | null> {
  await ensureVoiceTables(env);
  return env.DB.prepare('SELECT * FROM vexa_voice_assets WHERE event_id = ? AND language_code = ?')
    .bind(eventId, language)
    .first<VoiceAssetRow>()
    .catch(() => null);
}

async function hasUserPlayedEvent(env: EnvWithVoiceMessages, userId: string, eventId: string): Promise<boolean> {
  await ensureVoiceTables(env);
  const row = await env.DB.prepare('SELECT event_id FROM vexa_voice_user_events WHERE user_id = ? AND event_id = ?')
    .bind(userId, eventId)
    .first<{ event_id: string }>()
    .catch(() => null);
  return Boolean(row?.event_id);
}

async function voiceLanguageForUser(env: EnvWithVoiceMessages, userId: string): Promise<VoiceLanguage> {
  if (!userId) return 'en';
  const row = await env.DB.prepare('SELECT region_code, language_code FROM app_users WHERE telegram_user_id = ?')
    .bind(userId)
    .first<RegionRow>()
    .catch(() => null);
  const region = String(row?.region_code || '').toUpperCase();
  const language = String(row?.language_code || '').toLowerCase();
  if (region === 'IR') return 'fa';
  if (region === 'TR') return 'tr';
  if (region === 'RU') return 'ru';
  if (SUPPORTED_LANGUAGE_CODES.has(language) && language !== 'de' && language !== 'ar' && language !== 'pt') return language as VoiceLanguage;
  return 'en';
}

async function currentAdminMessage(env: EnvWithVoiceMessages): Promise<{ id: string; title: string; eventId: string } | null> {
  const raw = await env.BOT_CACHE.get(ADMIN_CURRENT_MESSAGE_KEY).catch(() => null);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as { id?: unknown; title?: unknown; eventId?: unknown };
    const id = normalizeEventId(parsed.id);
    return id ? { id, title: cleanText(parsed.title, 120) || 'Vexa wants to say something 👀', eventId: 'admin_message' } : null;
  } catch {
    return null;
  }
}

async function createSpeech(env: EnvWithVoiceMessages, text: string): Promise<ArrayBuffer> {
  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VEXA_VOICE_ID}`, {
    method: 'POST',
    headers: {
      'xi-api-key': env.ELEVENLABS_API_KEY || '',
      'content-type': 'application/json',
      accept: 'audio/mpeg',
    },
    body: JSON.stringify({
      text,
      model_id: VEXA_VOICE_MODEL,
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
      },
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    throw new Error(`ElevenLabs failed with ${response.status}${detail ? ': ' + detail.slice(0, 160) : ''}`);
  }

  return response.arrayBuffer();
}

function voiceR2Key(eventId: string, language: string): string {
  return `vexa-voice/${eventId}/${language}.mp3`;
}

function normalizeEventId(value: unknown): string {
  return String(value || '').replace(/[^0-9A-Za-z_-]/g, '').trim().slice(0, 80);
}

function normalizeVoiceLanguage(value: string): VoiceLanguage | '' {
  const language = value.trim().toLowerCase();
  return SUPPORTED_LANGUAGE_CODES.has(language) ? language as VoiceLanguage : '';
}

function readTelegramUserId(initData: string): string {
  if (!initData) return '';
  try {
    const params = new URLSearchParams(initData);
    const rawUser = params.get('user') || '';
    if (!rawUser) return '';
    const user = JSON.parse(rawUser) as { id?: number | string };
    const id = String(user.id || '').trim();
    return /^\d+$/.test(id) ? id : '';
  } catch {
    return '';
  }
}

function cleanText(value: unknown, max: number): string {
  return String(value || '').replace(/[\u0000-\u001f<>]/g, '').trim().slice(0, max);
}

function adminCookieValue(cookie: string | undefined): string {
  const match = (cookie ?? '').match(/(?:^|;\s*)vexa_admin=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : '';
}

function isAdminRequest(c: { env: Env; req: { header: (name: string) => string | undefined } }): boolean {
  const key = adminCookieValue(c.req.header('cookie'));
  return Boolean(c.env.ADMIN_KEY && key && key === c.env.ADMIN_KEY);
}
