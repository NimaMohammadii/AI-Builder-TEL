import app from './index';
import { VEXA_LEAGUE_MISSIONS, VEXA_LEAGUE_PRIZES } from './vexa-league-library';
import type { Env } from './types';

const CACHE_NONE = 'no-store';
const HERO_IMAGE_KEY = 'top-players-hero-image';
const HERO_IMAGE_CACHE = 'public, max-age=31536000, immutable';
const IMAGE_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/gif']);
const SEED_NAMES = ['NexaWolf','AriaFlow','VexaKing','MoonPilot','BlackNova','SilverVex','CryptoRay','Axion','EliteLuna','OrionAI','ProMiner','ZaraTon','NeonBot','PlinkoStar','AIHunter','VexRunner','TowerFox','DiceWave','ExplorerX','RookieOne','NovaByte','TonWizard','LuckyKai','BotSmith','RankFox','AuraNode','MinesAce','CrashLord','WheelBee','PromptFox','VoiceRex','ImageZen','GroupHero','QuestPilot','LeagueCat','VexTiger','NftScout','FlowMaster','SparkTon','LunaQuest','BotCrafter','VexBlade','NovaMint','KaiRunner','EchoVex','PrizeBear','TonKnight','ZetaPlay','CloudVex','OmegaAI'];

type WeekRow = Record<string, unknown> & { id: string };

app.get('/app/api/top-players-hero-image', async (c) => {
  const object = await c.env.ASSETS.get(HERO_IMAGE_KEY).catch(() => null);
  if (!object) return c.text('Not found', 404, { 'cache-control': CACHE_NONE });
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('etag', object.httpEtag);
  headers.set('cache-control', HERO_IMAGE_CACHE);
  if (!headers.get('content-type')) headers.set('content-type', object.customMetadata?.contentType || 'image/png');
  return new Response(object.body, { headers });
});

app.post('/admin/upload-top-players-hero-image', async (c) => {
  if (!isAdminRequest(c)) return c.json({ error: 'Unauthorized. Login again.' }, 401, { 'cache-control': CACHE_NONE });
  const form = await c.req.formData();
  const file = form.get('image');
  if (!(file instanceof File)) return c.json({ error: 'Choose an image file.' }, 400, { 'cache-control': CACHE_NONE });
  if (!IMAGE_TYPES.has(file.type)) return c.json({ error: 'Only PNG, JPG, WebP or GIF images are allowed.' }, 400, { 'cache-control': CACHE_NONE });
  if (file.size > 8_000_000) return c.json({ error: 'Image must be under 8MB.' }, 400, { 'cache-control': CACHE_NONE });
  await c.env.ASSETS.put(HERO_IMAGE_KEY, file.stream(), { httpMetadata: { contentType: file.type }, customMetadata: { contentType: file.type, version: String(Date.now()), filename: file.name || 'top-players-hero' } });
  return c.json({ ok: true, imageUrl: `/app/api/top-players-hero-image?v=${Date.now()}` }, 200, { 'cache-control': CACHE_NONE });
});

app.get('/admin/api/vexa-league', async (c) => {
  if (!isAdminRequest(c)) return c.json({ error: 'Unauthorized. Login again.' }, 401, { 'cache-control': CACHE_NONE });
  await ensureTables(c.env);
  const week = await currentWeek(c.env);
  const today = new Date().toISOString().slice(0, 10);
  const [dailyMissions, weeklyPrizes, seedUsers] = await Promise.all([daily(c.env, week.id, today), prizes(c.env, week.id), seeds(c.env, week.id)]);
  return c.json({ ok: true, missionLibrary: VEXA_LEAGUE_MISSIONS, prizeLibrary: VEXA_LEAGUE_PRIZES, currentWeek: week, dailyMissions, weeklyPrizes, seedUsers, topPlayersHeroImageUrl: `/app/api/top-players-hero-image?v=${Date.now()}` }, 200, { 'cache-control': CACHE_NONE });
});

app.get('/app/api/vexa-league', async (c) => {
  await ensureTables(c.env);
  const userId = cleanUserId(c.req.query('userId'));
  const week = await currentWeek(c.env);
  const today = new Date().toISOString().slice(0, 10);
  const [todayMissions, weeklyPrizes, seedUsers, userState] = await Promise.all([daily(c.env, week.id, today), prizes(c.env, week.id), leaderboard(c.env, week.id), userLeague(c.env, week.id, userId)]);
  return c.json({ ok: true, currentWeek: week, todayMissions, weeklyPrizes, seedUsers, userState, topPlayersHeroImageUrl: `/app/api/top-players-hero-image?v=${Date.now()}` }, 200, { 'cache-control': CACHE_NONE });
});

app.post('/admin/api/vexa-league/week', async (c) => {
  if (!isAdminRequest(c)) return c.json({ error: 'Unauthorized. Login again.' }, 401, { 'cache-control': CACHE_NONE });
  await ensureTables(c.env);
  const body = await c.req.json().catch(() => ({})) as Record<string, unknown>;
  return c.json({ ok: true, currentWeek: await upsertWeek(c.env, body) }, 200, { 'cache-control': CACHE_NONE });
});

app.post('/admin/api/vexa-league/daily-missions', async (c) => {
  if (!isAdminRequest(c)) return c.json({ error: 'Unauthorized. Login again.' }, 401, { 'cache-control': CACHE_NONE });
  await ensureTables(c.env);
  const body = await c.req.json().catch(() => ({})) as { activeDate?: unknown; missions?: Array<{ templateId?: unknown; vexAmount?: unknown; enabled?: unknown }> };
  const week = await currentWeek(c.env);
  const activeDate = cleanDate(body.activeDate);
  await c.env.DB.prepare('DELETE FROM vexa_league_daily_missions WHERE week_id = ? AND active_date = ?').bind(week.id, activeDate).run();
  for (const mission of body.missions || []) {
    const templateId = cleanId(mission.templateId, 80);
    if (!VEXA_LEAGUE_MISSIONS.some((m) => m.id === templateId)) continue;
    await c.env.DB.prepare('INSERT INTO vexa_league_daily_missions (id, week_id, active_date, template_id, vex_amount, enabled, created_at) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)').bind(id('vlm'), week.id, activeDate, templateId, cleanInt(mission.vexAmount, 0, 99999, 0), mission.enabled === false ? 0 : 1).run();
  }
  return c.json({ ok: true, dailyMissions: await daily(c.env, week.id, activeDate) }, 200, { 'cache-control': CACHE_NONE });
});

app.post('/admin/api/vexa-league/prizes', async (c) => {
  if (!isAdminRequest(c)) return c.json({ error: 'Unauthorized. Login again.' }, 401, { 'cache-control': CACHE_NONE });
  await ensureTables(c.env);
  const body = await c.req.json().catch(() => ({})) as { prizes?: Array<{ prizeTemplateId?: unknown; rankFrom?: unknown; rankTo?: unknown; enabled?: unknown }> };
  const week = await currentWeek(c.env);
  await c.env.DB.prepare('DELETE FROM vexa_league_weekly_prizes WHERE week_id = ?').bind(week.id).run();
  for (const prize of body.prizes || []) {
    const prizeTemplateId = cleanId(prize.prizeTemplateId, 80);
    if (!VEXA_LEAGUE_PRIZES.some((p) => p.id === prizeTemplateId)) continue;
    const from = cleanInt(prize.rankFrom, 1, 9999, 1);
    const to = Math.max(from, cleanInt(prize.rankTo, 1, 9999, from));
    await c.env.DB.prepare('INSERT INTO vexa_league_weekly_prizes (id, week_id, prize_template_id, rank_from, rank_to, enabled, created_at) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)').bind(id('vlp'), week.id, prizeTemplateId, from, to, prize.enabled ? 1 : 0).run();
  }
  return c.json({ ok: true, weeklyPrizes: await prizes(c.env, week.id) }, 200, { 'cache-control': CACHE_NONE });
});

app.post('/admin/api/vexa-league/seed-users/generate', async (c) => {
  if (!isAdminRequest(c)) return c.json({ error: 'Unauthorized. Login again.' }, 401, { 'cache-control': CACHE_NONE });
  await ensureTables(c.env);
  const week = await currentWeek(c.env);
  await c.env.DB.prepare('DELETE FROM vexa_league_seed_users WHERE week_id = ?').bind(week.id).run();
  for (let i = 0; i < SEED_NAMES.length; i += 1) {
    const name = SEED_NAMES[i];
    const level = Math.max(2, Math.floor(68 - i * 1.15));
    const rankName = level >= 60 ? 'Titan' : level >= 40 ? 'Legend' : level >= 25 ? 'Master' : level >= 15 ? 'Elite' : level >= 8 ? 'Pro' : level >= 4 ? 'Explorer' : 'Rookie';
    await c.env.DB.prepare('INSERT INTO vexa_league_seed_users (id, week_id, position, name, username, avatar_initials, level, rank_name, vex, balance_ton, is_active, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, CURRENT_TIMESTAMP)').bind(id('vls'), week.id, i + 1, name, name.toLowerCase().replace(/[^a-z0-9]/g, ''), initials(name), level, rankName, Math.max(90, Math.floor(2600 - i * 47 - (i % 7) * 13)), Math.max(1, Number((420 - i * 7.8).toFixed(1)))).run();
  }
  return c.json({ ok: true, seedUsers: await seeds(c.env, week.id) }, 200, { 'cache-control': CACHE_NONE });
});

async function ensureTables(env: Env): Promise<void> {
  await env.DB.prepare('CREATE TABLE IF NOT EXISTS vexa_league_weeks (id TEXT PRIMARY KEY, title TEXT NOT NULL, starts_at TEXT NOT NULL, ends_at TEXT NOT NULL, status TEXT NOT NULL DEFAULT \'hidden\', rewards_enabled INTEGER NOT NULL DEFAULT 0, seed_users_enabled INTEGER NOT NULL DEFAULT 1, show_prizes INTEGER NOT NULL DEFAULT 1, winner_count INTEGER NOT NULL DEFAULT 50, announcement TEXT NOT NULL DEFAULT \'\', created_at TEXT DEFAULT CURRENT_TIMESTAMP, updated_at TEXT DEFAULT CURRENT_TIMESTAMP)').run();
  await env.DB.prepare('CREATE TABLE IF NOT EXISTS vexa_league_daily_missions (id TEXT PRIMARY KEY, week_id TEXT NOT NULL, active_date TEXT NOT NULL, template_id TEXT NOT NULL, vex_amount INTEGER NOT NULL DEFAULT 0, enabled INTEGER NOT NULL DEFAULT 1, created_at TEXT DEFAULT CURRENT_TIMESTAMP)').run();
  await env.DB.prepare('CREATE TABLE IF NOT EXISTS vexa_league_weekly_prizes (id TEXT PRIMARY KEY, week_id TEXT NOT NULL, prize_template_id TEXT NOT NULL, rank_from INTEGER NOT NULL DEFAULT 1, rank_to INTEGER NOT NULL DEFAULT 1, enabled INTEGER NOT NULL DEFAULT 1, created_at TEXT DEFAULT CURRENT_TIMESTAMP)').run();
  await env.DB.prepare('CREATE TABLE IF NOT EXISTS vexa_league_seed_users (id TEXT PRIMARY KEY, week_id TEXT NOT NULL, position INTEGER NOT NULL DEFAULT 999, name TEXT NOT NULL, username TEXT NOT NULL, avatar_initials TEXT NOT NULL, level INTEGER NOT NULL DEFAULT 1, rank_name TEXT NOT NULL DEFAULT \'Rookie\', vex INTEGER NOT NULL DEFAULT 0, balance_ton REAL NOT NULL DEFAULT 0, is_active INTEGER NOT NULL DEFAULT 1, created_at TEXT DEFAULT CURRENT_TIMESTAMP)').run();
  await env.DB.prepare('CREATE TABLE IF NOT EXISTS vexa_league_scores (user_id TEXT NOT NULL, week_id TEXT NOT NULL, vex INTEGER NOT NULL DEFAULT 0, hidden INTEGER NOT NULL DEFAULT 0, banned INTEGER NOT NULL DEFAULT 0, updated_at TEXT DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY(user_id, week_id))').run();
}
async function currentWeek(env: Env): Promise<WeekRow> { const row = await env.DB.prepare('SELECT id, title, starts_at AS startsAt, ends_at AS endsAt, status, rewards_enabled AS rewardsEnabled, seed_users_enabled AS seedUsersEnabled, show_prizes AS showPrizes, winner_count AS winnerCount, announcement FROM vexa_league_weeks ORDER BY created_at DESC LIMIT 1').first<WeekRow>(); if (row) return { ...row, rewardsEnabled: Boolean(row.rewardsEnabled), seedUsersEnabled: Boolean(row.seedUsersEnabled), showPrizes: Boolean(row.showPrizes) }; const now = new Date(); const end = new Date(now.getTime() + 7 * 86400000); const newWeek = { id: id('vlw'), title: 'Vexa Weekly Race', startsAt: now.toISOString(), endsAt: end.toISOString(), status: 'hidden', rewardsEnabled: false, seedUsersEnabled: true, showPrizes: true, winnerCount: 50, announcement: 'Top players win weekly rewards.' } as WeekRow; await env.DB.prepare('INSERT INTO vexa_league_weeks (id, title, starts_at, ends_at, status, rewards_enabled, seed_users_enabled, show_prizes, winner_count, announcement, created_at, updated_at) VALUES (?, ?, ?, ?, ?, 0, 1, 1, 50, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)').bind(newWeek.id, newWeek.title, newWeek.startsAt, newWeek.endsAt, newWeek.status, newWeek.announcement).run(); return newWeek; }
async function upsertWeek(env: Env, body: Record<string, unknown>): Promise<WeekRow> { const week = await currentWeek(env); await env.DB.prepare('UPDATE vexa_league_weeks SET title = ?, starts_at = ?, ends_at = ?, status = ?, rewards_enabled = ?, seed_users_enabled = ?, show_prizes = ?, winner_count = ?, announcement = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').bind(cleanText(body.title, 90, 'Vexa Weekly Race'), cleanIso(body.startsAt) || week.startsAt, cleanIso(body.endsAt) || week.endsAt, cleanText(body.status, 20, 'hidden'), truthy(body.rewardsEnabled) ? 1 : 0, truthy(body.seedUsersEnabled) ? 1 : 0, body.showPrizes === false ? 0 : 1, cleanInt(body.winnerCount, 0, 500, 50), cleanText(body.announcement, 240, 'Top players win weekly rewards.'), week.id).run(); return currentWeek(env); }
async function daily(env: Env, weekId: string, activeDate: string) { const rows = await env.DB.prepare('SELECT id, template_id AS templateId, vex_amount AS vexAmount, enabled FROM vexa_league_daily_missions WHERE week_id = ? AND active_date = ? AND enabled = 1 ORDER BY created_at ASC LIMIT 20').bind(weekId, activeDate).all<Record<string, unknown>>(); return rows.results.map((r) => ({ ...r, title: titleFor(String(r.templateId)), description: 'Complete this mission to earn Vex.' })); }
async function prizes(env: Env, weekId: string) { const rows = await env.DB.prepare('SELECT id, prize_template_id AS prizeTemplateId, rank_from AS rankFrom, rank_to AS rankTo, enabled FROM vexa_league_weekly_prizes WHERE week_id = ? ORDER BY rank_from ASC LIMIT 50').bind(weekId).all<Record<string, unknown>>(); return rows.results.map((r) => ({ ...r, title: titleFor(String(r.prizeTemplateId)), description: 'Weekly reward.' })); }
async function seeds(env: Env, weekId: string) { const rows = await env.DB.prepare('SELECT id, position, name, username, avatar_initials AS avatarInitials, level, rank_name AS rankName, vex, balance_ton AS balanceTon, is_active AS isActive FROM vexa_league_seed_users WHERE week_id = ? AND is_active = 1 ORDER BY position ASC LIMIT 50').bind(weekId).all<Record<string, unknown>>(); return rows.results.map((r) => ({ ...r, isActive: Boolean(r.isActive) })); }
async function leaderboard(env: Env, weekId: string) { const real = await env.DB.prepare('SELECT user_id AS userId, vex FROM vexa_league_scores WHERE week_id = ? AND hidden = 0 AND banned = 0 ORDER BY vex DESC LIMIT 50').bind(weekId).all<Record<string, unknown>>(); const seed = await seeds(env, weekId); const rows = real.results.map((r, i) => ({ position: i + 1, name: `Player ${String(r.userId || '').slice(-4) || i + 1}`, username: `user${String(r.userId || '').slice(-4) || i + 1}`, avatarInitials: 'VX', level: 1, rankName: 'Rookie', vex: Number(r.vex || 0), balanceTon: 0 })).concat(seed); return rows.sort((a, b) => Number(b.vex || 0) - Number(a.vex || 0)).slice(0, 50).map((r, i) => ({ ...r, position: i + 1 })); }
async function userLeague(env: Env, weekId: string, userId: string) { if (!userId) return { userId: '', vex: 0, claimedMissionIds: [] }; const score = await env.DB.prepare('SELECT vex FROM vexa_league_scores WHERE week_id = ? AND user_id = ? LIMIT 1').bind(weekId, userId).first<{ vex: number }>(); return { userId, vex: Number(score?.vex || 0), claimedMissionIds: [] }; }
function cleanDate(v: unknown): string { const s = String(v || '').slice(0, 10); return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : new Date().toISOString().slice(0, 10); }
function cleanId(v: unknown, max: number): string { return String(v ?? '').replace(/[^0-9A-Za-z:_-]/g, '').slice(0, max); }
function cleanText(v: unknown, max: number, fallback: string): string { const s = String(v ?? '').trim().replace(/[<>]/g, '').slice(0, max); return s || fallback; }
function cleanInt(v: unknown, min: number, max: number, fallback: number): number { const n = Math.floor(Number(v)); return Number.isFinite(n) ? Math.max(min, Math.min(max, n)) : fallback; }
function cleanIso(v: unknown): string { const d = new Date(String(v ?? '')); return Number.isFinite(d.getTime()) ? d.toISOString() : ''; }
function cleanUserId(v: unknown): string { return String(v ?? '').replace(/[^0-9A-Za-z_-]/g, '').slice(0, 80); }
function truthy(v: unknown): boolean { return v === true || v === 1 || v === '1' || v === 'true' || v === 'on'; }
function id(prefix: string): string { return `${prefix}_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`; }
function initials(name: string): string { return name.replace(/[^A-Za-z]/g, '').slice(0, 2).toUpperCase() || 'VX'; }
function titleFor(value: string): string { return String(value || 'Mission').split('-').filter(Boolean).map((p) => p.slice(0, 1).toUpperCase() + p.slice(1)).join(' ') || 'Mission'; }
function adminCookieValue(cookie: string | undefined): string { const match = (cookie ?? '').match(/(?:^|;\s*)vexa_admin=([^;]+)/); return match ? decodeURIComponent(match[1]) : ''; }
function isAdmin(env: Env, key: string): boolean { return Boolean(env.ADMIN_KEY && key && key === env.ADMIN_KEY); }
function isAdminRequest(c: { env: Env; req: { header: (name: string) => string | undefined } }): boolean { return isAdmin(c.env, adminCookieValue(c.req.header('cookie'))); }
