import type { Env } from './types';

const SHARE_INVITE_IMAGE_SETTING = 'share-invite-image-file-id';
const MAIN_MENU_IMAGE_SETTING = 'main-menu-image-file-id';

type SettingRow = { value_json: string };

async function ensureAdminSettingsTable(env: Env): Promise<void> {
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS admin_settings (
    name TEXT PRIMARY KEY,
    value_json TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`).run();
}

async function saveImageFileId(env: Env, setting: string, fileId: string, invalidMessage: string): Promise<void> {
  const normalized = String(fileId || '').trim();
  if (!normalized) throw new Error(invalidMessage);
  await ensureAdminSettingsTable(env);
  await env.DB.prepare(`INSERT INTO admin_settings (name, value_json, updated_at)
    VALUES (?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(name) DO UPDATE SET value_json = excluded.value_json, updated_at = CURRENT_TIMESTAMP`)
    .bind(setting, JSON.stringify(normalized))
    .run();
}

async function getImageFileId(env: Env, setting: string): Promise<string | null> {
  await ensureAdminSettingsTable(env);
  const row = await env.DB.prepare('SELECT value_json FROM admin_settings WHERE name = ?')
    .bind(setting)
    .first<SettingRow>();
  try {
    const value = JSON.parse(String(row?.value_json || ''));
    return typeof value === 'string' && value.trim() ? value.trim() : null;
  } catch {
    return null;
  }
}

export function saveShareInviteImageFileId(env: Env, fileId: string): Promise<void> {
  return saveImageFileId(env, SHARE_INVITE_IMAGE_SETTING, fileId, 'Invite image is invalid.');
}

export function getShareInviteImageFileId(env: Env): Promise<string | null> {
  return getImageFileId(env, SHARE_INVITE_IMAGE_SETTING);
}

export function saveMainMenuImageFileId(env: Env, fileId: string): Promise<void> {
  return saveImageFileId(env, MAIN_MENU_IMAGE_SETTING, fileId, 'Main menu image is invalid.');
}

export function getMainMenuImageFileId(env: Env): Promise<string | null> {
  return getImageFileId(env, MAIN_MENU_IMAGE_SETTING);
}
