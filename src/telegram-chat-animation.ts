type TelegramReplyMarkup = Record<string, unknown>;
type TelegramSentMessage = { ok: boolean; result?: { message_id: number } };

type TelegramCall = <T = { ok: boolean; description?: string }>(key: string, method: string, payload: unknown) => Promise<T>;

const PLACEHOLDER_TEXT = 'Thinking...';
const MIN_EDIT_DELAY_MS = 190;
const MAX_ANIMATION_STEPS = 24;

export async function animatedTelegramSend(tg: TelegramCall, key: string, chatId: number, text: string, replyMarkup?: TelegramReplyMarkup): Promise<TelegramSentMessage> {
  await tg(key, 'sendChatAction', { chat_id: chatId, action: 'typing' }).catch(() => undefined);
  await sleep(450);

  const sent = await tg<TelegramSentMessage>(key, 'sendMessage', { chat_id: chatId, text: PLACEHOLDER_TEXT }).catch(() => null);
  const messageId = sent?.result?.message_id;
  if (!messageId) return tg<TelegramSentMessage>(key, 'sendMessage', { chat_id: chatId, text, ...(replyMarkup ? { reply_markup: replyMarkup } : {}) });

  await sleep(450);
  const animated = await animateMessageText(tg, key, chatId, messageId, text, replyMarkup);
  if (animated) return { ok: true, result: { message_id: messageId } };

  const edited = await tg<TelegramSentMessage>(key, 'editMessageText', { chat_id: chatId, message_id: messageId, text, ...(replyMarkup ? { reply_markup: replyMarkup } : {}) }).catch(() => null);
  if (edited) return { ok: true, result: { message_id: messageId } };

  return tg<TelegramSentMessage>(key, 'sendMessage', { chat_id: chatId, text, ...(replyMarkup ? { reply_markup: replyMarkup } : {}) });
}

async function animateMessageText(tg: TelegramCall, key: string, chatId: number, messageId: number, finalText: string, replyMarkup?: TelegramReplyMarkup): Promise<boolean> {
  const steps = buildTextSteps(finalText);
  if (!steps.length) return false;

  for (let index = 0; index < steps.length; index += 1) {
    const isLast = index === steps.length - 1;
    const payload = {
      chat_id: chatId,
      message_id: messageId,
      text: steps[index],
      ...(isLast && replyMarkup ? { reply_markup: replyMarkup } : {}),
    };
    const edited = await tg<TelegramSentMessage>(key, 'editMessageText', payload).catch(() => null);
    if (!edited) return false;
    if (!isLast) await sleep(MIN_EDIT_DELAY_MS);
  }
  return true;
}

function buildTextSteps(text: string): string[] {
  const finalText = String(text || '').trim();
  if (!finalText) return [];

  const chars = Array.from(finalText);
  const stepSize = Math.max(1, Math.ceil(chars.length / MAX_ANIMATION_STEPS));
  const steps: string[] = [];

  for (let index = stepSize; index < chars.length; index += stepSize) {
    const chunk = chars.slice(0, index).join('').trimEnd();
    if (chunk) steps.push(chunk);
  }

  if (steps[steps.length - 1] !== finalText) steps.push(finalText);
  return steps;
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
