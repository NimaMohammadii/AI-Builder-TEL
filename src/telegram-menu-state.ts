import type { Env } from './types';

type MenuMessageRow = { message_id: number };

export async function getTelegramMenuMessageId(env: Env, chatId: number): Promise<number | undefined> {
  const row = await env.DB.prepare('SELECT message_id FROM telegram_menu_messages WHERE chat_id = ?')
    .bind(chatId)
    .first<MenuMessageRow>();
  const messageId = Number(row?.message_id);
  return Number.isSafeInteger(messageId) && messageId > 0 ? messageId : undefined;
}

export async function setTelegramMenuMessageId(env: Env, chatId: number, messageId: number): Promise<void> {
  await env.DB.prepare(`INSERT INTO telegram_menu_messages (chat_id, message_id, updated_at)
    VALUES (?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(chat_id) DO UPDATE SET message_id = excluded.message_id, updated_at = CURRENT_TIMESTAMP`)
    .bind(chatId, messageId)
    .run();
}
