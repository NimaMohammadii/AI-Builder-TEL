import app from './index';
import type { Env } from './types';

app.get('/app/api/vexa-league', async (c) => {
  await ensurePublicLeagueTables(c.env);
  const week = await getCurrentWeek(c.env);
  const today = new Date().toISOString().slice(0, 10);
  const [todayMissions, weeklyPrizes, seedUsers] = await Promise.all([
    getTodayMissions(c.env, week.id, today),
    getWeeklyPrizes(c.env, week.id),
    getSeedUsers(c.env, week.id),
  ]);
  return c.json({ ok: true, currentWeek: week, todayMissions, weeklyPrizes, seedUsers }, 200, { 'cache-control': 'no-store' });
});

async function ensurePublicLeagueTables(env: Env): Promise<void> {
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS vexa_league_weeks (id TEXT PRIMARY KEY, title TEXT NOT NULL, starts_at TEXT NOT NULL, ends_at TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'hidden', rewards_enabled INTEGER NOT NULL DEFAULT 0, seed_users_enabled INTEGER NOT NULL DEFAULT 1, show_prizes INTEGER NOT NULL DEFAULT 1, winner_count INTEGER NOT NULL DEFAULT 50, announcement TEXT NOT NULL DEFAULT '', created_at TEXT DEFAULT CURRENT_TIMESTAMP, updated_at TEXT DEFAULT CURRENT_TIMESTAMP)`).run();
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS vexa_league_daily_missions (id TEXT PRIMARY KEY, week_id TEXT NOT NULL, active_date TEXT NOT NULL, template_id TEXT NOT NULL, vex_amount INTEGER NOT NULL DEFAULT 0, enabled INTEGER NOT NULL DEFAULT 1, created_at TEXT DEFAULT CURRENT_TIMESTAMP)`).run();
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS vexa_league_weekly_prizes (id TEXT PRIMARY KEY, week_id TEXT NOT NULL, prize_template_id TEXT NOT NULL, rank_from INTEGER NOT NULL DEFAULT 1, rank_to INTEGER NOT NULL DEFAULT 1, enabled INTEGER NOT NULL DEFAULT 1, created_at TEXT DEFAULT CURRENT_TIMESTAMP)`).run();
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS vexa_league_seed_users (id TEXT PRIMARY KEY, week_id TEXT NOT NULL, position INTEGER NOT NULL DEFAULT 999, name TEXT NOT NULL, username TEXT NOT NULL, avatar_initials TEXT NOT NULL, level INTEGER NOT NULL DEFAULT 1, rank_name TEXT NOT NULL DEFAULT 'Rookie', vex INTEGER NOT NULL DEFAULT 0, balance_ton REAL NOT NULL DEFAULT 0, is_active INTEGER NOT NULL DEFAULT 1, created_at TEXT DEFAULT CURRENT_TIMESTAMP)`).run();
}

async function getCurrentWeek(env: Env): Promise<Record<string, unknown> & { id: string }> {
  const row = await env.DB.prepare('SELECT id, title, starts_at AS startsAt, ends_at AS endsAt, status, rewards_enabled AS rewardsEnabled, seed_users_enabled AS seedUsersEnabled, show_prizes AS showPrizes, winner_count AS winnerCount, announcement FROM vexa_league_weeks ORDER BY created_at DESC LIMIT 1').first<Record<string, unknown> & { id: string }>();
  if (!row) return defaultWeek();
  return { ...row, rewardsEnabled: Boolean(row.rewardsEnabled), seedUsersEnabled: Boolean(row.seedUsersEnabled), showPrizes: Boolean(row.showPrizes) };
}

async function getTodayMissions(env: Env, weekId: string, activeDate: string): Promise<Record<string, unknown>[]> {
  const rows = await env.DB.prepare('SELECT id, template_id AS templateId, vex_amount AS vexAmount, enabled FROM vexa_league_daily_missions WHERE week_id = ? AND active_date = ? AND enabled = 1 ORDER BY created_at ASC LIMIT 20').bind(weekId, activeDate).all<Record<string, unknown>>();
  return rows.results.map((row) => ({ ...row, title: missionTitle(String(row.templateId)), description: missionDescription(String(row.templateId)) }));
}

async function getWeeklyPrizes(env: Env, weekId: string): Promise<Record<string, unknown>[]> {
  const rows = await env.DB.prepare('SELECT id, prize_template_id AS prizeTemplateId, rank_from AS rankFrom, rank_to AS rankTo, enabled FROM vexa_league_weekly_prizes WHERE week_id = ? AND enabled = 1 ORDER BY rank_from ASC LIMIT 20').bind(weekId).all<Record<string, unknown>>();
  return rows.results.map((row) => ({ ...row, title: prizeTitle(String(row.prizeTemplateId)), description: prizeDescription(String(row.prizeTemplateId)) }));
}

async function getSeedUsers(env: Env, weekId: string): Promise<Record<string, unknown>[]> {
  const rows = await env.DB.prepare('SELECT id, position, name, username, avatar_initials AS avatarInitials, level, rank_name AS rankName, vex, balance_ton AS balanceTon, is_active AS isActive FROM vexa_league_seed_users WHERE week_id = ? AND is_active = 1 ORDER BY position ASC LIMIT 50').bind(weekId).all<Record<string, unknown>>();
  return rows.results.map((row) => ({ ...row, isActive: Boolean(row.isActive) }));
}

function defaultWeek(): Record<string, unknown> & { id: string } {
  const now = new Date();
  const end = new Date(now.getTime() + 7 * 86400000);
  return { id: 'preview', title: 'Vexa Weekly Race', startsAt: now.toISOString(), endsAt: end.toISOString(), status: 'preview', rewardsEnabled: false, seedUsersEnabled: true, showPrizes: true, winnerCount: 50, announcement: 'Weekly Vex Race is warming up.' };
}

function missionTitle(id: string): string { return titleFromId(id, 'Mission'); }
function missionDescription(id: string): string { return 'Complete this mission to earn Vex.'; }
function prizeTitle(id: string): string { return titleFromId(id, 'Prize'); }
function prizeDescription(id: string): string { return 'Weekly league reward.'; }
function titleFromId(id: string, fallback: string): string { return String(id || fallback).split('-').filter(Boolean).map((part) => part.slice(0,1).toUpperCase() + part.slice(1)).join(' ') || fallback; }
