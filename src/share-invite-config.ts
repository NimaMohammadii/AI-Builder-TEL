import type { Env } from './types';

const SHARE_INVITE_IMAGE_SETTING = 'share-invite-image-file-id';
const MAIN_MENU_IMAGE_SETTING = 'main-menu-image-file-id';

type SettingRow = { value_json: string };
export type MainMenuMedia = { fileId: string; type: 'photo' | 'video' };

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

export async function saveMainMenuMedia(env: Env, fileId: string, type: MainMenuMedia['type']): Promise<void> {
  const normalized = String(fileId || '').trim();
  if (!normalized) throw new Error('Main menu media is invalid.');
  if (type !== 'photo' && type !== 'video') throw new Error('Main menu media type is invalid.');
  await ensureAdminSettingsTable(env);
  const value: MainMenuMedia = { fileId: normalized, type };
  await env.DB.prepare(`INSERT INTO admin_settings (name, value_json, updated_at)
    VALUES (?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(name) DO UPDATE SET value_json = excluded.value_json, updated_at = CURRENT_TIMESTAMP`)
    .bind(MAIN_MENU_IMAGE_SETTING, JSON.stringify(value))
    .run();
}

export async function getMainMenuMedia(env: Env): Promise<MainMenuMedia | null> {
  await ensureAdminSettingsTable(env);
  const row = await env.DB.prepare('SELECT value_json FROM admin_settings WHERE name = ?')
    .bind(MAIN_MENU_IMAGE_SETTING)
    .first<SettingRow>();
  try {
    const value = JSON.parse(String(row?.value_json || ''));
    if (typeof value === 'string' && value.trim()) return { fileId: value.trim(), type: 'photo' };
    if (!value || typeof value !== 'object') return null;
    const fileId = String((value as { fileId?: unknown }).fileId || '').trim();
    const type = (value as { type?: unknown }).type;
    return fileId && (type === 'photo' || type === 'video') ? { fileId, type } : null;
  } catch {
    return null;
  }
}
