import type { Env } from './types';

type AppLike = {
  get: (path: string, handler: (c: HandlerContext) => Promise<Response> | Response) => unknown;
};

type HandlerContext = {
  env: Env;
  req: { param: (name: string) => string; query: (name: string) => string | undefined };
};

type TelegramGetChatResult = { ok: boolean; result?: { id?: number; title?: string; photo?: { small_file_id?: string; big_file_id?: string } }; description?: string };
type TelegramGetFileResult = { ok: boolean; result?: { file_path?: string }; description?: string };

type OwnerCheck = { ok: boolean; reason?: string; owner?: string | null };
type ResolvePhoto = { ok: boolean; reason?: string; fileId?: string | null; filePath?: string | null; chatOk?: boolean; chatDescription?: string; fileOk?: boolean; fileDescription?: string };

export function registerGroupPhotoEndpoint(app: AppLike): void {
  app.get('/app/api/groups/:chatId/photo-debug', async (c) => {
    const chatId = c.req.param('chatId');
    const userId = cleanTelegramUserId(c.req.query('userId'));
    if (!chatId || !userId) return json({ ok: false, reason: 'missing_chat_or_user' }, 400);
    const owner = await checkGroupOwner(c.env, chatId, userId);
    if (!owner.ok) return json({ ok: false, reason: owner.reason, owner: owner.owner }, 403);
    const resolved = await resolveGroupPhoto(c.env, chatId, false);
    return json({ ok: resolved.ok, chatId, userId, ...resolved }, 200);
  });

  app.get('/app/api/groups/:chatId/photo', async (c) => {
    const chatId = c.req.param('chatId');
    const userId = cleanTelegramUserId(c.req.query('userId'));
    if (!chatId || !userId) return emptyImage(404, 'no-store', 'missing_chat_or_user');
    try {
      const owner = await checkGroupOwner(c.env, chatId, userId);
      if (!owner.ok) return emptyImage(404, 'no-store', owner.reason || 'owner_check_failed');

      let resolved = await resolveGroupPhoto(c.env, chatId, true);
      if (!resolved.ok || !resolved.filePath) return emptyImage(204, 'private, max-age=300', resolved.reason || 'photo_not_found');

      let response = await fetchTelegramFile(c.env, resolved.filePath);
      if (!response.ok || !response.body) {
        await c.env.BOT_CACHE.delete(photoCacheKey(chatId)).catch(() => undefined);
        resolved = await resolveGroupPhoto(c.env, chatId, false);
        if (!resolved.ok || !resolved.filePath) return emptyImage(204, 'private, max-age=300', resolved.reason || 'photo_retry_not_found');
        response = await fetchTelegramFile(c.env, resolved.filePath);
      }

      if (!response.ok || !response.body) return emptyImage(204, 'private, max-age=300', 'telegram_file_fetch_failed_' + response.status);
      return new Response(response.body, {
        headers: {
          'content-type': response.headers.get('content-type') || 'image/jpeg',
          'cache-control': 'private, max-age=3600',
          'x-vexa-photo-status': 'ok',
        },
      });
    } catch (error) {
      console.warn('load group photo failed', error);
      return emptyImage(204, 'private, max-age=300', 'exception');
    }
  });
}

async function checkGroupOwner(env: Env, chatId: string, userId: string): Promise<OwnerCheck> {
  await env.DB.prepare('ALTER TABLE bot_groups ADD COLUMN added_by_user_id TEXT').run().catch(() => undefined);
  const owner = await env.DB.prepare("SELECT added_by_user_id FROM bot_groups WHERE bot_id = 'main' AND chat_id = ?")
    .bind(chatId)
    .first<{ added_by_user_id: string | null }>();
  const ownerId = String(owner?.added_by_user_id || '');
  if (!owner) return { ok: false, reason: 'group_not_found', owner: null };
  if (ownerId !== userId) return { ok: false, reason: 'owner_mismatch', owner: ownerId || null };
  return { ok: true, owner: ownerId };
}

async function resolveGroupPhoto(env: Env, chatId: string, useCache: boolean): Promise<ResolvePhoto> {
  const cacheKey = photoCacheKey(chatId);
  if (useCache) {
    const cachedPath = await env.BOT_CACHE.get(cacheKey).catch(() => null);
    if (cachedPath) return { ok: true, reason: 'cache_hit', filePath: cachedPath };
  }

  const chat = await telegram<TelegramGetChatResult>(env.TELEGRAM_BOT_TOKEN, 'getChat', { chat_id: chatId });
  const fileId = chat.result?.photo?.small_file_id || chat.result?.photo?.big_file_id || null;
  if (!chat.ok) return { ok: false, reason: 'get_chat_failed', chatOk: false, chatDescription: chat.description, fileId };
  if (!fileId) return { ok: false, reason: 'chat_has_no_photo', chatOk: true, fileId };

  const file = await telegram<TelegramGetFileResult>(env.TELEGRAM_BOT_TOKEN, 'getFile', { file_id: fileId });
  const filePath = file.result?.file_path || null;
  if (!file.ok) return { ok: false, reason: 'get_file_failed', chatOk: true, fileId, fileOk: false, fileDescription: file.description };
  if (!filePath) return { ok: false, reason: 'file_path_missing', chatOk: true, fileId, fileOk: true };

  await env.BOT_CACHE.put(cacheKey, filePath, { expirationTtl: 21600 }).catch(() => undefined);
  return { ok: true, reason: 'resolved', chatOk: true, fileId, fileOk: true, filePath };
}

function photoCacheKey(chatId: string): string {
  return 'telegram:group-photo-path:' + chatId;
}

function fetchTelegramFile(env: Env, filePath: string): Promise<Response> {
  return fetch('https://api.telegram.org/file/' + 'bot' + env.TELEGRAM_BOT_TOKEN + '/' + filePath);
}

function emptyImage(status: number, cacheControl: string, reason: string): Response {
  return new Response('', { status, headers: { 'cache-control': cacheControl, 'x-vexa-photo-reason': reason } });
}

function json(value: unknown, status: number): Response {
  return new Response(JSON.stringify(value), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });
}

async function telegram<T = unknown>(token: string, method: string, payload: unknown): Promise<T> {
  const response = await fetch('https://api.telegram.org/' + 'bot' + token + '/' + method, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return response.json() as Promise<T>;
}

function cleanTelegramUserId(value: unknown): string {
  return String(value || '').replace(/[^0-9]/g, '').slice(0, 32);
}
