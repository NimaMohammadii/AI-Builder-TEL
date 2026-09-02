import type { Env } from './types';

const SHARE_INVITE_IMAGE_SETTING = 'share-invite-image-file-id';

type SettingRow = { value_json: string };

async function ensureAdminSettingsTable(env: Env): Promise<void> {
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS admin_settings (
    name TEXT PRIMARY KEY,
    value_json TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`).run();
}

export async function saveShareInviteImageFileId(env: Env, fileId: string): Promise<void> {
  const normalized = String(fileId || '').trim();
  if (!normalized) throw new Error('Invite image is invalid.');
  await ensureAdminSettingsTable(env);
  await env.DB.prepare(`INSERT INTO admin_settings (name, value_json, updated_at)
    VALUES (?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(name) DO UPDATE SET value_json = excluded.value_json, updated_at = CURRENT_TIMESTAMP`)
    .bind(SHARE_INVITE_IMAGE_SETTING, JSON.stringify(normalized))
    .run();
}

export async function getShareInviteImageFileId(env: Env): Promise<string | null> {
  await ensureAdminSettingsTable(env);
  const row = await env.DB.prepare('SELECT value_json FROM admin_settings WHERE name = ?')
    .bind(SHARE_INVITE_IMAGE_SETTING)
    .first<SettingRow>();
  try {
    const value = JSON.parse(String(row?.value_json || ''));
    return typeof value === 'string' && value.trim() ? value.trim() : null;
  } catch {
    return null;
  }
}
