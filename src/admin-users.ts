import type { Env } from './types';

export type AppUserActivityPayload = {
  userId?: string;
  username?: string | null;
  firstName?: string | null;
  section?: string | null;
  credit?: number | null;
};

type AdminUserRow = {
  telegram_user_id: string;
  first_name: string | null;
  username: string | null;
  current_section: string | null;
  credit: number | null;
  last_seen_at: string | null;
  created_at: string | null;
};

export async function trackAppUser(env: Env, payload: AppUserActivityPayload): Promise<{ ok: true } | { ok: false; error: string }> {
  const userId = String(payload.userId ?? '').trim();
  if (!userId) return { ok: false, error: 'Missing user id' };
  const username = cleanText(payload.username, 80);
  const firstName = cleanText(payload.firstName, 120);
  const section = cleanSection(payload.section);
  const credit = Math.max(0, Math.floor(Number(payload.credit ?? 0) || 0));

  try {
    await env.DB.prepare(`INSERT INTO app_users (telegram_user_id, first_name, username, current_section, credit, last_seen_at, updated_at)
      VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      ON CONFLICT(telegram_user_id) DO UPDATE SET
        first_name = excluded.first_name,
        username = excluded.username,
        current_section = excluded.current_section,
        credit = excluded.credit,
        last_seen_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP`)
      .bind(userId, firstName, username, section, credit)
      .run();
    return { ok: true };
  } catch (error) {
    console.error('track app user failed', error);
    return { ok: false, error: 'Database is not ready. Run migrations.' };
  }
}

export async function adminUsersJson(env: Env): Promise<{ users: Array<Record<string, unknown>>; stats: Record<string, number> }> {
  const rows = await env.DB.prepare(`SELECT telegram_user_id, first_name, username, current_section, credit, last_seen_at, created_at
    FROM app_users
    ORDER BY datetime(last_seen_at) DESC
    LIMIT 500`).all<AdminUserRow>();
  const now = Date.now();
  const users = (rows.results ?? []).map((row) => {
    const lastSeenMs = row.last_seen_at ? Date.parse(row.last_seen_at) : 0;
    const online = lastSeenMs > 0 && now - lastSeenMs <= 90_000;
    return {
      id: row.telegram_user_id,
      username: row.username ? '@' + row.username.replace(/^@+/, '') : '—',
      firstName: row.first_name || '—',
      isActive: online,
      status: online ? 'Online' : 'Inactive',
      currentSection: row.current_section || 'unknown',
      credit: Number(row.credit ?? 0),
      lastSeenAt: row.last_seen_at,
      createdAt: row.created_at,
    };
  });
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
