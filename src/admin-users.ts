import type { Env, TelegramUpdate } from './types';
import { getUserControls } from './user-controls';

export type AppUserActivityPayload = {
  userId?: string;
  username?: string | null;
  firstName?: string | null;
  section?: string | null;
};

type AdminUserRow = {
  telegram_user_id: string;
  first_name: string | null;
  username: string | null;
  current_section: string | null;
  credit: number | null;
  last_seen_at: string | null;
  created_at: string | null;
  source: string | null;
};

export async function trackTelegramBotUser(env: Env, botId: string, update: TelegramUpdate): Promise<void> {
  const from = update.message?.from ?? update.callback_query?.from ?? update.pre_checkout_query?.from;
  if (!from?.id) return;
  const section = update.callback_query ? 'callback' : update.pre_checkout_query ? 'payment' : cleanSection(update.message?.text?.startsWith('/') ? update.message.text.slice(1) : 'message');
  try {
    await env.DB.prepare(`INSERT INTO bot_users (bot_id, telegram_user_id, first_name, username, current_section, credit, last_seen_at, updated_at)
      VALUES (?, ?, ?, ?, ?, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
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

export async function trackAppUser(env: Env, payload: AppUserActivityPayload): Promise<{ ok: true; credit?: number } | { ok: false; error: string }> {
  const userId = String(payload.userId ?? '').trim();
  if (!userId) return { ok: false, error: 'Missing user id' };
  const username = cleanText(payload.username, 80);
  const firstName = cleanText(payload.firstName, 120);
  const section = cleanSection(payload.section);

  try {
    const controls = await getUserControls(env, userId);
    const credit = Math.max(0, Math.floor(Number(controls.credit ?? 1000) || 0));
    await env.DB.prepare(`INSERT INTO app_users (telegram_user_id, first_name, username, current_section, credit, last_seen_at, updated_at)
      VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      ON CONFLICT(telegram_user_id) DO UPDATE SET
        first_name = excluded.first_name,
        username = excluded.username,
        current_section = excluded.current_section,
        last_seen_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP`)
      .bind(userId, firstName, username, section, credit)
      .run();
    return { ok: true, credit };
  } catch (error) {
    console.error('track app user failed', error);
    return { ok: false, error: 'Database is not ready. Run migrations.' };
  }
}

export async function adminUsersJson(env: Env): Promise<{ users: Array<Record<string, unknown>>; stats: Record<string, number> }> {
  const rows = await env.DB.prepare(`WITH all_users AS (
      SELECT telegram_user_id, first_name, username, current_section, credit, last_seen_at, created_at, 'miniapp' AS source FROM app_users
      UNION ALL
      SELECT telegram_user_id, first_name, username, current_section, credit, COALESCE(last_seen_at, updated_at) AS last_seen_at, created_at, 'bot' AS source FROM bot_users
    ), ranked AS (
      SELECT *, ROW_NUMBER() OVER (PARTITION BY telegram_user_id ORDER BY datetime(COALESCE(last_seen_at, created_at)) DESC) AS rn FROM all_users
    )
    SELECT telegram_user_id, first_name, username, current_section, credit, last_seen_at, created_at, source
    FROM ranked
    WHERE rn = 1
    ORDER BY datetime(COALESCE(last_seen_at, created_at)) DESC
    LIMIT 500`).all<AdminUserRow>();
  const now = Date.now();
  const users = await Promise.all((rows.results ?? []).map(async (row) => {
    const controls = await getUserControls(env, row.telegram_user_id).catch(() => null);
    const lastSeenMs = row.last_seen_at ? Date.parse(row.last_seen_at) : 0;
    const online = lastSeenMs > 0 && now - lastSeenMs <= 90_000;
    return {
      id: row.telegram_user_id,
      username: row.username ? '@' + row.username.replace(/^@+/, '') : '—',
      firstName: row.first_name || '—',
      isActive: online,
      status: online ? 'Online' : 'Inactive',
      currentSection: row.current_section || 'unknown',
      credit: Number(controls?.credit ?? row.credit ?? 0),
      lastSeenAt: row.last_seen_at,
      createdAt: row.created_at,
      source: row.source || 'unknown',
    };
  }));
  const online = users.filter((user) => user.isActive).length;
  const totalCredit = users.reduce((sum, user) => sum + Number(user.credit || 0), 0);
  return { users, stats: { total: users.length, online, inactive: users.length - online, totalCredit } };
}

function cleanText(value: unknown, max: number): string | null {
  const text = String(value ?? '').replace(/[<>]/g, '').trim();
  return text ? text.slice(0, max) : null;
}

function cleanSection(value: unknown): string {
  const text = String(value ?? 'home').replace(/[^a-zA-Z0-9_-]/g, '').trim().slice(0, 40);
  return text || 'home';
}
