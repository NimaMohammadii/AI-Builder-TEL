type TelegramReplyMarkup = Record<string, unknown>;
type TelegramSentMessage = { ok: boolean; result?: { message_id: number } };

type TelegramCall = <T = { ok: boolean; description?: string }>(key: string, method: string, payload: unknown) => Promise<T>;

const PLACEHOLDER_TEXT = '✍️ در حال نوشتن...';

export async function animatedTelegramSend(tg: TelegramCall, key: string, chatId: number, text: string, replyMarkup?: TelegramReplyMarkup): Promise<TelegramSentMessage> {
  await tg(key, 'sendChatAction', { chat_id: chatId, action: 'typing' }).catch(() => undefined);
  await sleep(450);

  const sent = await tg<TelegramSentMessage>(key, 'sendMessage', { chat_id: chatId, text: PLACEHOLDER_TEXT }).catch(() => null);
  const messageId = sent?.result?.message_id;
  if (!messageId) return tg<TelegramSentMessage>(key, 'sendMessage', { chat_id: chatId, text, ...(replyMarkup ? { reply_markup: replyMarkup } : {}) });

  await sleep(650);
  const edited = await tg<TelegramSentMessage>(key, 'editMessageText', { chat_id: chatId, message_id: messageId, text, ...(replyMarkup ? { reply_markup: replyMarkup } : {}) }).catch(() => null);
  if (edited) return { ok: true, result: { message_id: messageId } };

  return tg<TelegramSentMessage>(key, 'sendMessage', { chat_id: chatId, text, ...(replyMarkup ? { reply_markup: replyMarkup } : {}) });
}

export async function safeTelegramAiReply(replyFactory: () => Promise<string>, fallback: string): Promise<string> {
  try {
    const reply = await replyFactory();
    return String(reply || '').trim() || fallback;
  } catch (error) {
    console.warn('Chat with AI reply failed', error);
    return fallback;
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
