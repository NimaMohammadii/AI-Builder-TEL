import type { Env } from './types';

type MenuMessageRow = { message_id: number };
type TelegramApi = (token: string, method: string, payload: unknown) => Promise<unknown>;
type TelegramSentMessage = { message_id?: number };

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

export function isTelegramMessageNotModified(error: unknown): boolean {
  return error instanceof Error && /message is not modified/i.test(error.message);
}

export async function upsertTelegramTextMenu(
  env: Env,
  token: string,
  telegram: TelegramApi,
  chatId: number,
  messageId: number | undefined,
  content: Record<string, unknown>,
): Promise<number | undefined> {
  const currentMessageId = messageId ?? await getTelegramMenuMessageId(env, chatId);
  const payload = { chat_id: chatId, ...content };

  if (currentMessageId) {
    try {
      await telegram(token, 'editMessageText', { ...payload, message_id: currentMessageId });
      await setTelegramMenuMessageId(env, chatId, currentMessageId);
      return currentMessageId;
    } catch (error) {
      if (isTelegramMessageNotModified(error)) {
        await setTelegramMenuMessageId(env, chatId, currentMessageId);
        return currentMessageId;
      }
      await telegram(token, 'deleteMessage', { chat_id: chatId, message_id: currentMessageId }).catch(() => undefined);
    }
  }

  const sent = await telegram(token, 'sendMessage', payload) as TelegramSentMessage | undefined;
  const sentMessageId = Number(sent?.message_id);
  if (Number.isSafeInteger(sentMessageId) && sentMessageId > 0) {
    await setTelegramMenuMessageId(env, chatId, sentMessageId);
    return sentMessageId;
  }
  return undefined;
}
