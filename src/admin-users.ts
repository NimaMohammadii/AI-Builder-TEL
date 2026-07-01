import type { Env, TelegramUpdate } from './types';
import { getUserLevel } from './levels';
import { recordDailyRewardEvent } from './daily-rewards-claims';
import { ensureTonBalanceColumn, getUserControls } from './user-controls';

export type AppUserActivityPayload = {
  userId?: string;
  username?: string | null;
  firstName?: string | null;
  section?: string | null;
  regionCode?: string | null;
  languageCode?: string | null;
};

type AdminUserRow = {
  telegram_user_id: string;
  first_name: string | null;
  username: string | null;
  current_section: string | null;
  ton_balance_nano: number | null;
  last_seen_at: string | null;
  created_at: string | null;
  source: string | null;
  region_code: string | null;
  language_code: string | null;
};

type ClientResetState = { resetVersion: string; resetAllVersion: string };
type BulkDeleteResult = { ok: true; deleted: Record<string, number>; kvDeleted: number; resetAllVersion: string };

const CLIENT_RESET_PREFIX = 'miniapp-client-reset:';
const CLIENT_RESET_ALL_KEY = 'miniapp-client-reset:all';
const CLIENT_RESET_TTL_SECONDS = 180 * 24 * 60 * 60;

export async function trackTelegramBotUser(env: Env, botId: string, update: TelegramUpdate): Promise<void> {
  const from = update.message?.from ?? update.callback_query?.from ?? update.pre_checkout_query?.from;
  if (!from?.id) return;
  const section = update.callback_query ? 'callback' : update.pre_checkout_query ? 'payment' : cleanSection(update.message?.text?.startsWith('/') ? update.message.text.slice(1) : 'message');
  try {
    await env.DB.prepare(`INSERT INTO bot_users (bot_id, telegram_user_id, first_name, username, current_section, last_seen_at, updated_at)
      VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      ON CONFLICT(bot_id, telegram_user_id) DO UPDATE SET
        first_name = excluded.first_name,
        username = excluded.username,
        current_section = excluded.current_section,
        last_seen_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP`)
      .bind(botId, String(from.id), cleanText(from.first_name, 120), cleanText(from.username, 80), section)
      .run();
  } catch (error) {
    console.warn('track telegram bot user failed', error);
  }
}

export async function trackAppUser(env: Env, payload: AppUserActivityPayload): Promise<{ ok: true; tonBalanceNano: number; winChancePercent: number; resetVersion: string; resetAllVersion: string } | { ok: false; error: string }> {
  const userId = String(payload.userId ?? '').trim();
  if (!userId) return { ok: false, error: 'Missing user id' };
  const username = cleanText(payload.username, 80);
  const firstName = cleanText(payload.firstName, 120);
  const section = cleanSection(payload.section);
  const regionCode = normalizeRegion(payload.regionCode);
  const languageCode = normalizeLanguage(payload.languageCode);

  try {
    await ensureAppUserRegionColumns(env);
    await ensureTonBalanceColumn(env);
    const controls = await getUserControls(env, userId);
    const resetState = await getClientResetState(env, userId);
    const tonBalanceNano = Math.max(0, Math.floor(Number(controls.tonBalanceNano ?? 0) || 0));
    await env.DB.prepare(`INSERT INTO app_users (telegram_user_id, first_name, username, current_section, ton_balance_nano, region_code, language_code, last_seen_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      ON CONFLICT(telegram_user_id) DO UPDATE SET
        first_name = excluded.first_name,
        username = excluded.username,
        current_section = excluded.current_section,
        ton_balance_nano = excluded.ton_balance_nano,
        region_code = COALESCE(excluded.region_code, app_users.region_code),
        language_code = COALESCE(excluded.language_code, app_users.language_code),
        last_seen_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP`)
      .bind(userId, firstName, username, section, tonBalanceNano, regionCode, languageCode)
      .run();
    await recordDailyRewardEvent(env, { userId, eventType: 'open_app' }).catch((error) => console.warn('daily rewards open_app progress failed', error));
    await recordDailyRewardEvent(env, { userId, eventType: 'open_section', section }).catch((error) => console.warn('daily rewards open_section progress failed', error));
    return { ok: true, tonBalanceNano, winChancePercent: controls.winChancePercent, ...resetState };
  } catch (error) {
    console.error('track app user failed', error);
    return { ok: false, error: 'Database is not ready. Run migrations.' };
  }
}

export async function adminUsersJson(env: Env): Promise<{ users: Array<Record<string, unknown>>; stats: Record<string, number> }> {
  await ensureAppUserRegionColumns(env);
  await ensureTonBalanceColumn(env);
  const rows = await env.DB.prepare(`WITH all_users AS (
      SELECT telegram_user_id, first_name, username, current_section, ton_balance_nano, region_code, language_code, last_seen_at, created_at, 'game_bot' AS source FROM app_users
      UNION ALL
      SELECT telegram_user_id, first_name, username, current_section, NULL AS ton_balance_nano, NULL AS region_code, NULL AS language_code, COALESCE(last_seen_at, updated_at) AS last_seen_at, created_at,
        CASE WHEN bot_id = 'main' THEN 'ai_bot' WHEN bot_id = 'game' THEN 'game_bot' ELSE 'user_bot' END AS source
      FROM bot_users
    ), ranked AS (
      SELECT *, ROW_NUMBER() OVER (PARTITION BY telegram_user_id ORDER BY datetime(COALESCE(last_seen_at, created_at)) DESC) AS rn FROM all_users
    )
    SELECT telegram_user_id, first_name, username, current_section, ton_balance_nano, region_code, language_code, last_seen_at, created_at, source
    FROM ranked
    WHERE rn = 1
    ORDER BY datetime(COALESCE(last_seen_at, created_at)) DESC
    LIMIT 700`).all<AdminUserRow>();
  const now = Date.now();
  const users = await Promise.all((rows.results ?? []).map(async (row) => {
    const [controls, levelInfo] = await Promise.all([
      getUserControls(env, row.telegram_user_id).catch(() => null),
      getUserLevel(env, row.telegram_user_id).catch(() => null),
    ]);
    const lastSeenMs = row.last_seen_at ? Date.parse(row.last_seen_at) : 0;
    const online = lastSeenMs > 0 && now - lastSeenMs <= 90_000;
    const tonBalanceNano = Number(controls?.tonBalanceNano ?? row.ton_balance_nano ?? 0);
    return {
      id: row.telegram_user_id,
      username: row.username ? '@' + row.username.replace(/^@+/, '') : '—',
      firstName: row.first_name || '—',
      isActive: online,
      status: online ? 'Online' : 'Inactive',
      currentSection: row.current_section || 'unknown',
      regionCode: regionKeyFromRow(row.region_code, row.language_code),
      regionLabel: regionLabel(regionKeyFromRow(row.region_code, row.language_code)),
      languageCode: row.language_code || '',
      tonBalanceNano,
      tonBalance: formatTon(tonBalanceNano),
      level: levelInfo?.level ?? 1,
      xp: levelInfo?.xp ?? 0,
      totalXp: levelInfo?.totalXp ?? 0,
      rankName: levelInfo?.rankName ?? 'Starter',
      lastSeenAt: row.last_seen_at,
      createdAt: row.created_at,
      source: row.source || 'unknown',
      sourceLabel: sourceLabel(row.source || 'unknown'),
    };
  }));
  const online = users.filter((user) => user.isActive).length;
  const aiBot = users.filter((user) => user.source === 'ai_bot').length;
  const gameBot = users.filter((user) => user.source === 'game_bot').length;
  const userBot = users.filter((user) => user.source === 'user_bot').length;
  const totalTonBalanceNano = users.reduce((sum, user) => sum + Number(user.tonBalanceNano || 0), 0);
  return { users, stats: { total: users.length, online, inactive: users.length - online, aiBot, gameBot, userBot, totalTonBalanceNano } };
}

export async function adminUserDetailJson(env: Env, userIdInput: unknown): Promise<Record<string, unknown>> {
  const userId = cleanUserId(userIdInput);
  await ensureAppUserRegionColumns(env);
  await ensureTonBalanceColumn(env);
  const users = await adminUsersJson(env);
  const user = users.users.find((item) => String(item.id) === userId) || { id: userId, regionCode: 'EN', regionLabel: 'English / Global' };
  const [transactions, deposits, withdrawals, xpEvents, purchases, gameRows] = await Promise.all([
    safeRows(env, 'SELECT id, kind, title, description, amount_nano, balance_after_nano, status, reference_type, reference_id, created_at FROM ton_transactions WHERE user_id = ? ORDER BY datetime(created_at) DESC LIMIT 200', userId),
    safeRows(env, 'SELECT id, stars_amount, amount_nano, status, created_at, updated_at FROM stars_deposits WHERE user_id = ? ORDER BY datetime(created_at) DESC LIMIT 100', userId),
    safeRows(env, 'SELECT id, amount_nano, status, wallet_address, tx_hash, created_at, updated_at FROM ton_withdrawals WHERE user_id = ? ORDER BY datetime(created_at) DESC LIMIT 100', userId),
    safeRows(env, 'SELECT id, source, amount, metadata_json, created_at FROM xp_events WHERE user_id = ? ORDER BY datetime(created_at) DESC LIMIT 150', userId),
    safeRows(env, 'SELECT id, market_item_id, price_nano, status, purchased_at FROM market_purchases WHERE user_id = ? ORDER BY datetime(purchased_at) DESC LIMIT 100', userId),
    gameActivityRows(env, userId),
  ]);
  const spendNano = transactions.filter((row) => Number(row.amount_nano) < 0).reduce((sum, row) => sum + Math.abs(Number(row.amount_nano) || 0), 0);
  const rechargeCount = deposits.filter((row) => String(row.status || '').toLowerCase() === 'paid' || String(row.status || '').toLowerCase() === 'completed').length;
  const gameSummary = summarizeGames(gameRows);
  const activities: Array<Record<string, unknown>> = [...gameRows, ...xpEvents.map((row) => ({ type: 'xp', game: row.source, amountNano: row.amount, status: 'earned', createdAt: row.created_at }))];
  activities.sort((a, b) => Date.parse(String(b.createdAt || b.created_at || '')) - Date.parse(String(a.createdAt || a.created_at || '')));
  const recentActivities = activities.slice(0, 250);
  return { user, generatedAt: new Date().toISOString(), summary: { spentCreditNano: spendNano, spentCredit: formatTon(spendNano), rechargeCount, gamesPlayed: gameSummary.length }, gameSummary, transactions, deposits, withdrawals, purchases, activities: recentActivities };
}

export async function adminUserDetailPdf(env: Env, userIdInput: unknown): Promise<Uint8Array> {
  const detail = await adminUserDetailJson(env, userIdInput);
  const user = detail.user as Record<string, unknown>;
  const lines = ['Vexa user report', 'Generated: ' + detail.generatedAt, 'User ID: ' + user.id, 'Username: ' + user.username, 'Region: ' + (user.regionLabel || user.regionCode), 'Current section: ' + user.currentSection, 'Balance: ' + user.tonBalance, '', 'Summary'];
  const summary = detail.summary as Record<string, unknown>;
  lines.push('Spent credit: ' + summary.spentCredit, 'Recharge count: ' + summary.rechargeCount, 'Games played: ' + summary.gamesPlayed, '', 'Game summary');
  for (const row of detail.gameSummary as Array<Record<string, unknown>>) lines.push(`${row.game}: played ${row.played}, won ${row.wins}, lost ${row.losses}, staked ${formatTon(Number(row.stakedNano || 0))}, payout ${formatTon(Number(row.payoutNano || 0))}`);
  lines.push('', 'Transactions');
  for (const row of (detail.transactions as Array<Record<string, unknown>>).slice(0, 80)) lines.push(`${row.created_at} | ${row.kind} | ${formatTon(Number(row.amount_nano || 0))} | ${row.title || ''} | ${row.status || ''}`);
  lines.push('', 'Recent activities');
  for (const row of (detail.activities as Array<Record<string, unknown>>).slice(0, 100)) lines.push(`${row.createdAt || row.created_at} | ${row.type || row.game} | ${row.status || ''} | ${formatTon(Number(row.amountNano || row.amount_nano || 0))}`);
  return simplePdf(lines);
}

export async function resetUserEverywhere(env: Env, userIdInput: unknown): Promise<{ ok: true; userId: string; deleted: Record<string, number>; kvDeleted: number; resetVersion: string }> {
  const userId = cleanUserId(userIdInput);
  const deleted: Record<string, number> = {};
  for (const [table, column] of userTableDeletes()) {
    deleted[table] = await safeDelete(env, table, column, userId);
  }
  const kvDeleted = await deleteUserKv(env, userId);
  const resetVersion = await markClientReset(env, userId);
  return { ok: true, userId, deleted, kvDeleted, resetVersion };
}

export async function resetAllUsersEverywhere(env: Env): Promise<BulkDeleteResult> {
  const deleted: Record<string, number> = {};
  for (const [table] of userTableDeletes()) {
    deleted[table] = await safeDeleteAll(env, table);
  }
  const kvDeleted = await deleteAllUserKv(env);
  const resetAllVersion = await markAllClientReset(env);
  return { ok: true, deleted, kvDeleted, resetAllVersion };
}

function userTableDeletes(): Array<[string, string]> {
  return [
    ['app_users', 'telegram_user_id'],
    ['bot_users', 'telegram_user_id'],
    ['user_controls', 'user_id'],
    ['ton_transactions', 'user_id'],
    ['ton_withdrawals', 'user_id'],
    ['stars_deposits', 'user_id'],
    ['user_levels', 'user_id'],
    ['xp_events', 'user_id'],
    ['daily_reward_claims', 'user_id'],
    ['daily_reward_events', 'user_id'],
    ['daily_rewards_claims', 'user_id'],
    ['daily_rewards_events', 'user_id'],
    ['market_purchases', 'user_id'],
    ['nft_purchases', 'user_id'],
    ['predict_bets', 'user_id'],
    ['predict_entries', 'user_id'],
    ['wheel_entries', 'user_id'],
    ['crash_bets', 'user_id'],
    ['plinko_rounds', 'user_id'],
    ['mines_rounds', 'user_id'],
    ['dice_rounds', 'user_id'],
    ['rps_rounds', 'user_id'],
  ];
}

async function safeDelete(env: Env, table: string, column: string, userId: string): Promise<number> {
  try {
    const result = await env.DB.prepare(`DELETE FROM ${table} WHERE ${column} = ?`).bind(userId).run();
    return Number(result.meta?.changes || 0);
  } catch {
    return 0;
  }
}

async function safeDeleteAll(env: Env, table: string): Promise<number> {
  try {
    const result = await env.DB.prepare(`DELETE FROM ${table}`).run();
    return Number(result.meta?.changes || 0);
  } catch {
    return 0;
  }
}

async function deleteUserKv(env: Env, userId: string): Promise<number> {
  const keys = new Set<string>([
    `admin:user-controls:${userId}`,
    `builder-ai-chat:${userId}`,
    `builder-ai-history:${userId}`,
    `builder-pending-action:${userId}`,
    `builder-tts:${userId}`,
    `builder-tts-output:${userId}`,
    `builder-tts-menu-message:${userId}`,
    `vexaUserControls:${userId}`,
  ]);
  await collectKvByPrefix(env, `agent-dsl-state:`, keys, userId);
  await collectKvByPrefix(env, `image-mode:`, keys, userId);
  let count = 0;
  for (const key of keys) {
    try { await env.BOT_CACHE.delete(key); count++; } catch {}
  }
  return count;
}

async function deleteAllUserKv(env: Env): Promise<number> {
  const prefixes = [
    'admin:user-controls:',
    'builder-ai-chat:',
    'builder-ai-history:',
    'builder-pending-action:',
    'builder-tts:',
    'builder-tts-output:',
    'builder-tts-menu-message:',
    'vexaUserControls:',
    'agent-dsl-state:',
    'image-mode:',
  ];
  let count = 0;
  for (const prefix of prefixes) count += await deleteKvByPrefix(env, prefix);
  return count;
}

async function getClientResetState(env: Env, userId: string): Promise<ClientResetState> {
  const cleanId = cleanUserId(userId);
  const [resetVersion, resetAllVersion] = await Promise.all([
    env.BOT_CACHE.get(`${CLIENT_RESET_PREFIX}${cleanId}`).catch(() => ''),
    env.BOT_CACHE.get(CLIENT_RESET_ALL_KEY).catch(() => ''),
  ]);
  return { resetVersion: resetVersion || '', resetAllVersion: resetAllVersion || '' };
}

async function markClientReset(env: Env, userId: string): Promise<string> {
  const version = resetVersion();
  await env.BOT_CACHE.put(`${CLIENT_RESET_PREFIX}${userId}`, version, { expirationTtl: CLIENT_RESET_TTL_SECONDS }).catch(() => undefined);
  return version;
}

async function markAllClientReset(env: Env): Promise<string> {
  const version = resetVersion();
  await env.BOT_CACHE.put(CLIENT_RESET_ALL_KEY, version, { expirationTtl: CLIENT_RESET_TTL_SECONDS }).catch(() => undefined);
  return version;
}

function resetVersion(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

async function deleteKvByPrefix(env: Env, prefix: string): Promise<number> {
  let count = 0;
  try {
    let cursor: string | undefined;
    for (let i = 0; i < 20; i++) {
      const page = await env.BOT_CACHE.list({ prefix, cursor, limit: 1000 });
      for (const item of page.keys) {
        try { await env.BOT_CACHE.delete(item.name); count++; } catch {}
      }
      if (page.list_complete) break;
      cursor = page.cursor;
    }
  } catch {}
  return count;
}

async function collectKvByPrefix(env: Env, prefix: string, keys: Set<string>, userId: string): Promise<void> {
  try {
    let cursor: string | undefined;
    for (let i = 0; i < 6; i++) {
      const page = await env.BOT_CACHE.list({ prefix, cursor, limit: 1000 });
      for (const item of page.keys) if (item.name.includes(userId)) keys.add(item.name);
      if (page.list_complete) break;
      cursor = page.cursor;
    }
  } catch {}
}

function sourceLabel(source: string): string {
  if (source === 'ai_bot') return 'AI Bot';
  if (source === 'game_bot') return 'Game Bot';
  if (source === 'user_bot') return 'User Bot';
  return source || 'Unknown';
}

function formatTon(nano: number): string {
  const value = Math.max(0, Math.floor(Number(nano) || 0)) / 1_000_000_000;
  return value.toFixed(3).replace(/\.0+$/, '').replace(/(\.\d*?)0+$/, '$1') + ' TON';
}

function cleanText(value: unknown, max: number): string | null {
  const text = String(value ?? '').replace(/[<>]/g, '').trim();
  return text ? text.slice(0, max) : null;
}

function cleanSection(value: unknown): string {
  const text = String(value ?? 'home').replace(/[^a-zA-Z0-9_-]/g, '').trim().slice(0, 40);
  return text || 'home';
}

function cleanUserId(value: unknown): string {
  const id = String(value ?? '').replace(/[^0-9A-Za-z_-]/g, '').trim().slice(0, 80);
  if (!id) throw new Error('Missing user id');
  return id;
}


async function ensureAppUserRegionColumns(env: Env): Promise<void> {
  await env.DB.prepare('ALTER TABLE app_users ADD COLUMN region_code TEXT').run().catch(() => undefined);
  await env.DB.prepare('ALTER TABLE app_users ADD COLUMN language_code TEXT').run().catch(() => undefined);
}

async function safeRows(env: Env, sql: string, userId: string): Promise<Array<Record<string, unknown>>> {
  const rows = await env.DB.prepare(sql).bind(userId).all<Record<string, unknown>>().catch(() => ({ results: [] }));
  return rows.results || [];
}

async function gameActivityRows(env: Env, userId: string): Promise<Array<Record<string, unknown>>> {
  const queries: Array<[string, string]> = [
    ['predict', 'SELECT id, market AS game, stake_nano AS amountNano, payout_nano AS payoutNano, status, created_at AS createdAt FROM predict_bets WHERE user_id = ? ORDER BY datetime(created_at) DESC LIMIT 100'],
    ['crash', "SELECT id, 'crash' AS game, bet_nano AS amountNano, payout_nano AS payoutNano, status, created_at AS createdAt FROM crash_bets WHERE user_id = ? ORDER BY datetime(created_at) DESC LIMIT 100"],
    ['plinko', "SELECT id, 'plinko' AS game, bet_nano AS amountNano, payout_nano AS payoutNano, status, created_at AS createdAt FROM plinko_rounds WHERE user_id = ? ORDER BY datetime(created_at) DESC LIMIT 100"],
    ['mines', "SELECT id, 'mines' AS game, bet_nano AS amountNano, payout_nano AS payoutNano, status, created_at AS createdAt FROM mines_rounds WHERE user_id = ? ORDER BY datetime(created_at) DESC LIMIT 100"],
    ['dice', "SELECT id, 'dice' AS game, bet_nano AS amountNano, payout_nano AS payoutNano, status, created_at AS createdAt FROM dice_rounds WHERE user_id = ? ORDER BY datetime(created_at) DESC LIMIT 100"],
    ['rps', "SELECT id, 'rps' AS game, bet_nano AS amountNano, payout_nano AS payoutNano, status, created_at AS createdAt FROM rps_rounds WHERE user_id = ? ORDER BY datetime(created_at) DESC LIMIT 100"],
  ];
  const batches = await Promise.all(queries.map(([type, sql]) => safeRows(env, sql, userId).then((rows) => rows.map((row) => ({ type, ...row })))));
  return batches.flat();
}

function summarizeGames(rows: Array<Record<string, unknown>>): Array<Record<string, unknown>> {
  const map = new Map<string, Record<string, number | string>>();
  for (const row of rows) {
    const game = String(row.game || row.type || 'game');
    const item = map.get(game) || { game, played: 0, wins: 0, losses: 0, stakedNano: 0, payoutNano: 0 };
    item.played = Number(item.played) + 1;
    const status = String(row.status || '').toLowerCase();
    const payout = Number(row.payoutNano || 0);
    if (status.includes('win') || payout > Number(row.amountNano || 0)) item.wins = Number(item.wins) + 1;
    else if (status.includes('loss') || status.includes('lose') || status.includes('settled') || status.includes('completed')) item.losses = Number(item.losses) + 1;
    item.stakedNano = Number(item.stakedNano) + Math.abs(Number(row.amountNano || 0));
    item.payoutNano = Number(item.payoutNano) + Math.max(0, Number(row.payoutNano || 0));
    map.set(game, item);
  }
  return Array.from(map.values());
}

function normalizeRegion(value: unknown): string | null {
  const region = String(value || '').trim().toUpperCase();
  return ['EN', 'IR', 'TR', 'RU'].includes(region) ? region : null;
}
function normalizeLanguage(value: unknown): string | null {
  const lang = String(value || '').trim().toLowerCase().replace(/[^a-z-]/g, '').slice(0, 12);
  return lang || null;
}
function regionKeyFromRow(regionCode: unknown, languageCode: unknown): string {
  const region = String(regionCode || '').toUpperCase();
  if (region === 'IR' || region === 'TR' || region === 'RU' || region === 'EN') return region;
  const language = String(languageCode || '').toLowerCase();
  if (language.startsWith('fa')) return 'IR';
  if (language.startsWith('tr')) return 'TR';
  if (language.startsWith('ru')) return 'RU';
  return 'EN';
}
function regionLabel(region: string): string {
  return region === 'IR' ? 'Iran / Persian' : region === 'TR' ? 'Turkey / Turkish' : region === 'RU' ? 'Russia / Russian' : 'English / Global';
}

function simplePdf(lines: string[]): Uint8Array {
  const enc = new TextEncoder();
  const escPdf = (s: string) => s.replace(/[\\()]/g, '\\$&').replace(/[\r\n]/g, ' ');
  const chunks: string[] = [];
  for (let i = 0; i < lines.length; i += 42) {
    const page = lines.slice(i, i + 42);
    chunks.push('BT /F1 10 Tf 40 790 Td 14 TL ' + page.map((line) => '(' + escPdf(String(line).slice(0, 120)) + ') Tj T*').join(' ') + ' ET');
  }
  const objects: string[] = ['<< /Type /Catalog /Pages 2 0 R >>', '<< /Type /Pages /Kids [' + chunks.map((_, i) => (4 + i * 2) + ' 0 R').join(' ') + '] /Count ' + chunks.length + ' >>', '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>'];
  chunks.forEach((content, i) => {
    objects.push('<< /Length ' + enc.encode(content).length + ' >>\nstream\n' + content + '\nendstream');
    objects.push('<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 3 0 R >> >> /Contents ' + (3 + i * 2 + 1) + ' 0 R >>');
  });
  let pdf = '%PDF-1.4\n';
  const offsets = [0];
  objects.forEach((obj, i) => { offsets.push(enc.encode(pdf).length); pdf += (i + 1) + ' 0 obj\n' + obj + '\nendobj\n'; });
  const xref = enc.encode(pdf).length;
  pdf += 'xref\n0 ' + (objects.length + 1) + '\n0000000000 65535 f \n' + offsets.slice(1).map((o) => String(o).padStart(10, '0') + ' 00000 n ').join('\n') + '\ntrailer << /Size ' + (objects.length + 1) + ' /Root 1 0 R >>\nstartxref\n' + xref + '\n%%EOF';
  return enc.encode(pdf);
}
