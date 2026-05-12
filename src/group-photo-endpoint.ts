import type { Env } from './types';

type AppLike = {
  get: (path: string, handler: (c: HandlerContext) => Promise<Response> | Response) => unknown;
};

type HandlerContext = {
  env: Env;
  req: { param: (name: string) => string; query: (name: string) => string | undefined };
};

type TelegramGetChatResult = { ok: boolean; result?: { photo?: { small_file_id?: string; big_file_id?: string } }; description?: string };
type TelegramGetFileResult = { ok: boolean; result?: { file_path?: string }; description?: string };

export function registerGroupPhotoEndpoint(app: AppLike): void {
  app.get('/app/api/groups/:chatId/photo', async (c) => {
    const chatId = c.req.param('chatId');
    const userId = cleanTelegramUserId(c.req.query('userId'));
    if (!chatId || !userId) return emptyImage(404, 'no-store');
    try {
      await c.env.DB.prepare('ALTER TABLE bot_groups ADD COLUMN added_by_user_id TEXT').run().catch(() => undefined);
      const owner = await c.env.DB.prepare("SELECT added_by_user_id FROM bot_groups WHERE bot_id = 'main' AND chat_id = ?")
        .bind(chatId)
        .first<{ added_by_user_id: string | null }>();
      if (String(owner?.added_by_user_id || '') !== userId) return emptyImage(404, 'no-store');

      const cacheKey = 'telegram:group-photo-path:' + chatId;
      let filePath = await c.env.BOT_CACHE.get(cacheKey).catch(() => null);
      if (!filePath) {
        const chat = await telegram<TelegramGetChatResult>(c.env.TELEGRAM_BOT_TOKEN, 'getChat', { chat_id: chatId });
        const fileId = chat.result?.photo?.small_file_id || chat.result?.photo?.big_file_id;
        if (!chat.ok || !fileId) return emptyImage(204, 'private, max-age=300');
        const file = await telegram<TelegramGetFileResult>(c.env.TELEGRAM_BOT_TOKEN, 'getFile', { file_id: fileId });
        filePath = file.result?.file_path || null;
        if (!file.ok || !filePath) return emptyImage(204, 'private, max-age=300');
        await c.env.BOT_CACHE.put(cacheKey, filePath, { expirationTtl: 21600 }).catch(() => undefined);
      }

      const response = await fetch('https://api.telegram.org/file/' + 'bot' + c.env.TELEGRAM_BOT_TOKEN + '/' + filePath);
      if (!response.ok || !response.body) return emptyImage(204, 'private, max-age=300');
      return new Response(response.body, {
        headers: {
          'content-type': response.headers.get('content-type') || 'image/jpeg',
          'cache-control': 'private, max-age=3600',
        },
      });
    } catch (error) {
      console.warn('load group photo failed', error);
      return emptyImage(204, 'private, max-age=300');
    }
  });
}

function emptyImage(status: number, cacheControl: string): Response {
  return new Response('', { status, headers: { 'cache-control': cacheControl } });
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
