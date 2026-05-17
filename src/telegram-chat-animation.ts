type TelegramReplyMarkup = Record<string, unknown>;
type TelegramSentMessage = { ok: boolean; result?: { message_id: number } };
type TelegramSendOptions = Record<string, unknown>;
type TelegramAnimationMode = 'full' | 'light';

type TelegramCall = <T = { ok: boolean; description?: string }>(key: string, method: string, payload: unknown) => Promise<T>;

const THINKING_FRAMES = [
  'T',
  'Th',
  'Thi',
  'Thin',
  'Think',
  'Thinki',
  'Thinkin',
  'Thinking',
  'Thinking.',
  'Thinking..',
  'Thinking...',
  'Thinking..',
  'Thinking.',
  'Thinking',
];
const THINKING_FRAME_DELAY_MS = 180;
const LIGHT_THINKING_FRAME_DELAY_MS = 260;
const MIN_THINKING_MS = 1800;
const LIGHT_MIN_THINKING_MS = 650;
const ANSWER_MOTION_DELAY_MS = 45;
const MAX_ANSWER_MOTION_STEPS = 18;

export async function animatedTelegramSend(tg: TelegramCall, key: string, chatId: number, text: string, replyMarkup?: TelegramReplyMarkup, sendOptions?: TelegramSendOptions, mode: TelegramAnimationMode = 'full'): Promise<TelegramSentMessage> {
  await tg(key, 'sendChatAction', { chat_id: chatId, action: 'typing' }).catch(() => undefined);
  await sleep(60);

  const sent = await tg<TelegramSentMessage>(key, 'sendMessage', { chat_id: chatId, text: THINKING_FRAMES[7], ...(sendOptions ?? {}) }).catch(() => null);
  const messageId = sent?.result?.message_id;
  if (!messageId) return tg<TelegramSentMessage>(key, 'sendMessage', { chat_id: chatId, text, ...(sendOptions ?? {}), ...(replyMarkup ? { reply_markup: replyMarkup } : {}) });

  const animated = mode === 'full' ? await animateAnswerMotion(tg, key, chatId, messageId, text, replyMarkup) : null;
  if (animated) return { ok: true, result: { message_id: messageId } };

  const edited = await editFinalMessage(tg, key, chatId, messageId, text, replyMarkup);
  if (edited) return { ok: true, result: { message_id: messageId } };

  return tg<TelegramSentMessage>(key, 'sendMessage', { chat_id: chatId, text, ...(sendOptions ?? {}), ...(replyMarkup ? { reply_markup: replyMarkup } : {}) });
}

export async function animatedTelegramAiReply(tg: TelegramCall, key: string, chatId: number, replyFactory: () => Promise<string>, fallback: string, replyMarkup?: TelegramReplyMarkup, sendOptions?: TelegramSendOptions, mode: TelegramAnimationMode = 'full'): Promise<{ text: string; sent: TelegramSentMessage }> {
  const startedAt = Date.now();
  const thinkingDelay = mode === 'light' ? LIGHT_THINKING_FRAME_DELAY_MS : THINKING_FRAME_DELAY_MS;
  const minThinking = mode === 'light' ? LIGHT_MIN_THINKING_MS : MIN_THINKING_MS;

  await tg(key, 'sendChatAction', { chat_id: chatId, action: 'typing' }).catch(() => undefined);
  const sent = await tg<TelegramSentMessage>(key, 'sendMessage', { chat_id: chatId, text: THINKING_FRAMES[0], ...(sendOptions ?? {}) }).catch(() => null);
  const messageId = sent?.result?.message_id;

  let thinking = true;
  const loop = messageId ? animateThinking(tg, key, chatId, messageId, () => thinking, thinkingDelay, mode) : Promise.resolve();

  const text = await safeTelegramAiReply(replyFactory, fallback);
  const remainingThinkingMs = Math.max(0, minThinking - (Date.now() - startedAt));
  if (remainingThinkingMs > 0) await sleep(remainingThinkingMs);
  thinking = false;
  await loop.catch(() => undefined);

  if (!messageId) return { text, sent: await animatedTelegramSend(tg, key, chatId, text, replyMarkup, sendOptions, mode) };

  const animated = mode === 'full' ? await animateAnswerMotion(tg, key, chatId, messageId, text, replyMarkup) : null;
  if (animated) return { text, sent: { ok: true, result: { message_id: messageId } } };

  const edited = await editFinalMessage(tg, key, chatId, messageId, text, replyMarkup);
  if (edited) return { text, sent: { ok: true, result: { message_id: messageId } } };

  return { text, sent: await tg<TelegramSentMessage>(key, 'sendMessage', { chat_id: chatId, text, ...(sendOptions ?? {}), ...(replyMarkup ? { reply_markup: replyMarkup } : {}) }) };
}

async function animateThinking(tg: TelegramCall, key: string, chatId: number, messageId: number, isActive: () => boolean, delayMs: number, mode: TelegramAnimationMode): Promise<void> {
  const frames = mode === 'light' ? ['Thinking', 'Thinking.', 'Thinking..', 'Thinking...'] : THINKING_FRAMES;
  let index = 1;
  while (isActive()) {
    await sleep(delayMs);
    if (!isActive()) break;
    await tg(key, 'sendChatAction', { chat_id: chatId, action: 'typing' }).catch(() => undefined);
    await tg(key, 'editMessageText', { chat_id: chatId, message_id: messageId, text: frames[index % frames.length] }).catch(() => undefined);
    index += 1;
  }
}

async function animateAnswerMotion(tg: TelegramCall, key: string, chatId: number, messageId: number, finalText: string, replyMarkup?: TelegramReplyMarkup): Promise<boolean> {
  const steps = buildAnswerMotionSteps(finalText);
  if (!steps.length) return false;

  for (let index = 0; index < steps.length; index += 1) {
    const isLast = index === steps.length - 1;
    const edited = await tg<TelegramSentMessage>(key, 'editMessageText', {
      chat_id: chatId,
      message_id: messageId,
      text: steps[index],
      ...(isLast && replyMarkup ? { reply_markup: replyMarkup } : {}),
    }).catch(() => null);
    if (!edited) return false;
    if (!isLast) await sleep(ANSWER_MOTION_DELAY_MS);
  }

  return true;
}

function buildAnswerMotionSteps(text: string): string[] {
  const finalText = String(text || '').trim();
  if (!finalText) return [];

  const chars = Array.from(finalText);
  const stepSize = Math.max(3, Math.ceil(chars.length / MAX_ANSWER_MOTION_STEPS));
  const steps: string[] = [];

  for (let index = stepSize; index < chars.length; index += stepSize) {
    const chunk = chars.slice(0, index).join('').trimEnd();
    if (chunk) steps.push(chunk);
  }

  if (steps[steps.length - 1] !== finalText) steps.push(finalText);
  return steps;
}

async function editFinalMessage(tg: TelegramCall, key: string, chatId: number, messageId: number, text: string, replyMarkup?: TelegramReplyMarkup): Promise<TelegramSentMessage | null> {
  return tg<TelegramSentMessage>(key, 'editMessageText', { chat_id: chatId, message_id: messageId, text, ...(replyMarkup ? { reply_markup: replyMarkup } : {}) }).catch(() => null);
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
