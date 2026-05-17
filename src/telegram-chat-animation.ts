type TelegramReplyMarkup = Record<string, unknown>;
type TelegramSentMessage = { ok: boolean; result?: { message_id: number } };
type TelegramSendOptions = Record<string, unknown>;
type TelegramAnimationMode = 'full' | 'group' | 'light';

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
const GROUP_THINKING_FRAMES = [
  '<b>Thinking</b>',
  '<b>Thinking.</b>',
  '<b>Thinking..</b>',
  '<b>Thinking...</b>',
  '<b>Thinking..</b>',
  '<b>Thinking.</b>',
  '<b>Thinking</b>',
  '<b>Thinking.</b>',
  '<b>Thinking..</b>',
  '<b>Thinking...</b>',
];
const GROUP_THINKING_TEXT = GROUP_THINKING_FRAMES[0];
const THINKING_FRAME_DELAY_MS = 180;
const GROUP_THINKING_FRAME_DELAY_MS = 230;
const MIN_THINKING_MS = 1800;
const GROUP_MIN_THINKING_MS = 2300;
const ANSWER_MOTION_DELAY_MS = 80;
const GROUP_ANSWER_MOTION_DELAY_MS = 110;
const MAX_ANSWER_MOTION_STEPS = 16;
const GROUP_MAX_ANSWER_MOTION_STEPS = 14;

export async function animatedTelegramSend(tg: TelegramCall, key: string, chatId: number, text: string, replyMarkup?: TelegramReplyMarkup, sendOptions?: TelegramSendOptions, mode: TelegramAnimationMode = 'full'): Promise<TelegramSentMessage> {
  if (isGroupMode(mode)) return sendSmoothGroupReply(tg, key, chatId, () => Promise.resolve(text), text, replyMarkup, sendOptions);

  await tg(key, 'sendChatAction', { chat_id: chatId, action: 'typing' }).catch(() => undefined);
  await sleep(60);

  const sent = await tg<TelegramSentMessage>(key, 'sendMessage', { chat_id: chatId, text: firstThinkingFrame(mode), ...(sendOptions ?? {}) }).catch(() => null);
  const messageId = sent?.result?.message_id;
  if (!messageId) return tg<TelegramSentMessage>(key, 'sendMessage', { chat_id: chatId, text, ...(sendOptions ?? {}), ...(replyMarkup ? { reply_markup: replyMarkup } : {}) });

  const animated = await animateAnswerMotion(tg, key, chatId, messageId, text, replyMarkup);
  if (animated) return { ok: true, result: { message_id: messageId } };

  const edited = await editFinalMessage(tg, key, chatId, messageId, text, replyMarkup);
  if (edited) return { ok: true, result: { message_id: messageId } };

  return tg<TelegramSentMessage>(key, 'sendMessage', { chat_id: chatId, text, ...(sendOptions ?? {}), ...(replyMarkup ? { reply_markup: replyMarkup } : {}) });
}

export async function animatedTelegramAiReply(tg: TelegramCall, key: string, chatId: number, replyFactory: () => Promise<string>, fallback: string, replyMarkup?: TelegramReplyMarkup, sendOptions?: TelegramSendOptions, mode: TelegramAnimationMode = 'full'): Promise<{ text: string; sent: TelegramSentMessage }> {
  if (isGroupMode(mode)) {
    return sendSmoothGroupReply(tg, key, chatId, replyFactory, fallback, replyMarkup, sendOptions);
  }

  const startedAt = Date.now();
  await tg(key, 'sendChatAction', { chat_id: chatId, action: 'typing' }).catch(() => undefined);
  const sent = await tg<TelegramSentMessage>(key, 'sendMessage', { chat_id: chatId, text: firstThinkingFrame(mode), ...(sendOptions ?? {}) }).catch(() => null);
  const messageId = sent?.result?.message_id;

  let thinking = true;
  const loop = messageId ? animateThinking(tg, key, chatId, messageId, () => thinking, THINKING_FRAME_DELAY_MS) : Promise.resolve();

  const text = await safeTelegramAiReply(replyFactory, fallback);
  const remainingThinkingMs = Math.max(0, MIN_THINKING_MS - (Date.now() - startedAt));
  if (remainingThinkingMs > 0) await sleep(remainingThinkingMs);
  thinking = false;
  await loop.catch(() => undefined);

  if (!messageId) return { text, sent: await animatedTelegramSend(tg, key, chatId, text, replyMarkup, sendOptions, mode) };

  const animated = await animateAnswerMotion(tg, key, chatId, messageId, text, replyMarkup);
  if (animated) return { text, sent: { ok: true, result: { message_id: messageId } } };

  const edited = await editFinalMessage(tg, key, chatId, messageId, text, replyMarkup);
  if (edited) return { text, sent: { ok: true, result: { message_id: messageId } } };

  return { text, sent: await tg<TelegramSentMessage>(key, 'sendMessage', { chat_id: chatId, text, ...(sendOptions ?? {}), ...(replyMarkup ? { reply_markup: replyMarkup } : {}) }) };
}

async function sendSmoothGroupReply(tg: TelegramCall, key: string, chatId: number, replyFactory: () => Promise<string>, fallback: string, replyMarkup?: TelegramReplyMarkup, sendOptions?: TelegramSendOptions): Promise<{ text: string; sent: TelegramSentMessage }> {
  const startedAt = Date.now();
  await tg(key, 'sendChatAction', { chat_id: chatId, action: 'typing' }).catch(() => undefined);
  const thinking = await tg<TelegramSentMessage>(key, 'sendMessage', { chat_id: chatId, text: GROUP_THINKING_TEXT, parse_mode: 'HTML', ...(sendOptions ?? {}) }).catch(() => null);
  const thinkingMessageId = thinking?.result?.message_id;

  let thinkingActive = true;
  const thinkingLoop = thinkingMessageId ? animateGroupThinking(tg, key, chatId, thinkingMessageId, () => thinkingActive) : Promise.resolve();

  const text = await safeTelegramAiReply(replyFactory, fallback);
  const remainingThinkingMs = Math.max(0, GROUP_MIN_THINKING_MS - (Date.now() - startedAt));
  if (remainingThinkingMs > 0) await sleep(remainingThinkingMs);
  thinkingActive = false;
  await thinkingLoop.catch(() => undefined);

  if (!thinkingMessageId) {
    const sent = await tg<TelegramSentMessage>(key, 'sendMessage', { chat_id: chatId, text, ...(sendOptions ?? {}), ...(replyMarkup ? { reply_markup: replyMarkup } : {}) });
    return { text, sent };
  }

  const animated = await animateGroupAnswerMotion(tg, key, chatId, thinkingMessageId, text, replyMarkup);
  if (animated) return { text, sent: { ok: true, result: { message_id: thinkingMessageId } } };

  const edited = await editFinalMessage(tg, key, chatId, thinkingMessageId, text, replyMarkup);
  if (edited) return { text, sent: { ok: true, result: { message_id: thinkingMessageId } } };

  const sent = await tg<TelegramSentMessage>(key, 'sendMessage', { chat_id: chatId, text, ...(sendOptions ?? {}), ...(replyMarkup ? { reply_markup: replyMarkup } : {}) });
  return { text, sent };
}

async function animateGroupThinking(tg: TelegramCall, key: string, chatId: number, messageId: number, isActive: () => boolean): Promise<void> {
  let index = 1;
  while (isActive()) {
    await sleep(GROUP_THINKING_FRAME_DELAY_MS);
    if (!isActive()) break;
    await tg(key, 'sendChatAction', { chat_id: chatId, action: 'typing' }).catch(() => undefined);
    await tg(key, 'editMessageText', { chat_id: chatId, message_id: messageId, text: GROUP_THINKING_FRAMES[index % GROUP_THINKING_FRAMES.length], parse_mode: 'HTML' }).catch(() => undefined);
    index += 1;
  }
}

async function animateThinking(tg: TelegramCall, key: string, chatId: number, messageId: number, isActive: () => boolean, delayMs: number): Promise<void> {
  let index = 1;
  while (isActive()) {
    await sleep(delayMs);
    if (!isActive()) break;
    await tg(key, 'sendChatAction', { chat_id: chatId, action: 'typing' }).catch(() => undefined);
    await tg(key, 'editMessageText', { chat_id: chatId, message_id: messageId, text: THINKING_FRAMES[index % THINKING_FRAMES.length] }).catch(() => undefined);
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

async function animateGroupAnswerMotion(tg: TelegramCall, key: string, chatId: number, messageId: number, finalText: string, replyMarkup?: TelegramReplyMarkup): Promise<boolean> {
  const steps = buildGroupAnswerMotionSteps(finalText);
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
    if (!isLast) await sleep(GROUP_ANSWER_MOTION_DELAY_MS);
  }

  return true;
}

function buildAnswerMotionSteps(text: string): string[] {
  const finalText = String(text || '').trim();
  if (!finalText) return [];

  const chars = Array.from(finalText);
  const stepSize = Math.max(4, Math.ceil(chars.length / MAX_ANSWER_MOTION_STEPS));
  const steps: string[] = [];

  for (let index = stepSize; index < chars.length; index += stepSize) {
    const chunk = chars.slice(0, index).join('').trimEnd();
    if (chunk) steps.push(chunk);
  }

  if (steps[steps.length - 1] !== finalText) steps.push(finalText);
  return steps;
}

function buildGroupAnswerMotionSteps(text: string): string[] {
  const finalText = String(text || '').trim();
  if (!finalText) return [];

  const words = finalText.replace(/\n/g, ' \n ').split(/\s+/).filter(Boolean);
  const wordsPerStep = Math.max(1, Math.ceil(words.length / GROUP_MAX_ANSWER_MOTION_STEPS));
  const steps: string[] = [];

  for (let index = wordsPerStep; index < words.length; index += wordsPerStep) {
    const chunk = restoreLineBreaks(words.slice(0, index).join(' '));
    if (chunk) steps.push(chunk);
  }

  if (steps[steps.length - 1] !== finalText) steps.push(finalText);
  return steps;
}

function restoreLineBreaks(value: string): string {
  return value.replace(/\s*\\n\s*/g, '\n').trim();
}

function firstThinkingFrame(mode: TelegramAnimationMode): string {
  return isGroupMode(mode) ? GROUP_THINKING_TEXT : THINKING_FRAMES[0];
}

function isGroupMode(mode: TelegramAnimationMode): boolean {
  return mode === 'group' || mode === 'light';
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
