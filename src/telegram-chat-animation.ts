type TelegramReplyMarkup = Record<string, unknown>;
type TelegramSentMessage = { ok: boolean; result?: { message_id: number } };

type TelegramCall = <T = { ok: boolean; description?: string }>(key: string, method: string, payload: unknown) => Promise<T>;

const THINKING_FRAMES = ['Thinking', 'Thinking.', 'Thinking..', 'Thinking...'];
const MIN_EDIT_DELAY_MS = 90;
const MAX_ANIMATION_STEPS = 12;
const THINKING_FRAME_DELAY_MS = 520;

export async function animatedTelegramSend(tg: TelegramCall, key: string, chatId: number, text: string, replyMarkup?: TelegramReplyMarkup): Promise<TelegramSentMessage> {
  await tg(key, 'sendChatAction', { chat_id: chatId, action: 'typing' }).catch(() => undefined);
  await sleep(160);

  const sent = await tg<TelegramSentMessage>(key, 'sendMessage', { chat_id: chatId, text: THINKING_FRAMES[3] }).catch(() => null);
  const messageId = sent?.result?.message_id;
  if (!messageId) return tg<TelegramSentMessage>(key, 'sendMessage', { chat_id: chatId, text, ...(replyMarkup ? { reply_markup: replyMarkup } : {}) });

  const animated = await animateMessageText(tg, key, chatId, messageId, text, replyMarkup);
  if (animated) return { ok: true, result: { message_id: messageId } };

  const edited = await tg<TelegramSentMessage>(key, 'editMessageText', { chat_id: chatId, message_id: messageId, text, ...(replyMarkup ? { reply_markup: replyMarkup } : {}) }).catch(() => null);
  if (edited) return { ok: true, result: { message_id: messageId } };

  return tg<TelegramSentMessage>(key, 'sendMessage', { chat_id: chatId, text, ...(replyMarkup ? { reply_markup: replyMarkup } : {}) });
}

export async function animatedTelegramAiReply(tg: TelegramCall, key: string, chatId: number, replyFactory: () => Promise<string>, fallback: string, replyMarkup?: TelegramReplyMarkup): Promise<{ text: string; sent: TelegramSentMessage }> {
  await tg(key, 'sendChatAction', { chat_id: chatId, action: 'typing' }).catch(() => undefined);
  const sent = await tg<TelegramSentMessage>(key, 'sendMessage', { chat_id: chatId, text: THINKING_FRAMES[0] }).catch(() => null);
  const messageId = sent?.result?.message_id;

  let thinking = true;
  const loop = messageId ? animateThinking(tg, key, chatId, messageId, () => thinking) : Promise.resolve();

  const text = await safeTelegramAiReply(replyFactory, fallback);
  thinking = false;
  await loop.catch(() => undefined);

  if (!messageId) return { text, sent: await animatedTelegramSend(tg, key, chatId, text, replyMarkup) };

  const animated = await animateMessageText(tg, key, chatId, messageId, text, replyMarkup);
  if (animated) return { text, sent: { ok: true, result: { message_id: messageId } } };

  const edited = await tg<TelegramSentMessage>(key, 'editMessageText', { chat_id: chatId, message_id: messageId, text, ...(replyMarkup ? { reply_markup: replyMarkup } : {}) }).catch(() => null);
  if (edited) return { text, sent: { ok: true, result: { message_id: messageId } } };

  return { text, sent: await tg<TelegramSentMessage>(key, 'sendMessage', { chat_id: chatId, text, ...(replyMarkup ? { reply_markup: replyMarkup } : {}) }) };
}

async function animateThinking(tg: TelegramCall, key: string, chatId: number, messageId: number, isActive: () => boolean): Promise<void> {
  let index = 1;
  while (isActive()) {
    await sleep(THINKING_FRAME_DELAY_MS);
    if (!isActive()) break;
    await tg(key, 'sendChatAction', { chat_id: chatId, action: 'typing' }).catch(() => undefined);
    await tg(key, 'editMessageText', { chat_id: chatId, message_id: messageId, text: THINKING_FRAMES[index % THINKING_FRAMES.length] }).catch(() => undefined);
    index += 1;
  }
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
  const stepSize = Math.max(2, Math.ceil(chars.length / MAX_ANIMATION_STEPS));
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
