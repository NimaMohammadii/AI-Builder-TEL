type TelegramReplyMarkup = Record<string, unknown>;
type TelegramSentMessage = { ok: boolean; result?: { message_id: number } };
type TelegramSendOptions = Record<string, unknown>;
type TelegramAnimationMode = 'full' | 'group' | 'light';
type TelegramRenderedText = { plain: string; html: string; useHtml: boolean };

type TelegramCall = <T = { ok: boolean; description?: string }>(key: string, method: string, payload: unknown) => Promise<T>;

const INVISIBLE_THINKING_TEXT = '\u2060';
const ANSWER_MOTION_DELAY_MS = 80;
const GROUP_ANSWER_MOTION_DELAY_MS = 110;
const MAX_ANSWER_MOTION_STEPS = 16;
const GROUP_MAX_ANSWER_MOTION_STEPS = 14;

export async function animatedTelegramSend(tg: TelegramCall, key: string, chatId: number, text: string, replyMarkup?: TelegramReplyMarkup, sendOptions?: TelegramSendOptions, mode: TelegramAnimationMode = 'full'): Promise<TelegramSentMessage> {
  if (isGroupMode(mode)) return (await sendSmoothGroupReply(tg, key, chatId, () => Promise.resolve(text), text, replyMarkup, sendOptions)).sent;

  const replyKeyboard = isReplyKeyboard(replyMarkup) ? replyMarkup : undefined;
  const editableReplyMarkup = isReplyKeyboard(replyMarkup) ? undefined : replyMarkup;

  await tg(key, 'sendChatAction', { chat_id: chatId, action: 'typing' }).catch(() => undefined);

  const sent = await tg<TelegramSentMessage>(key, 'sendMessage', {
    chat_id: chatId,
    text: INVISIBLE_THINKING_TEXT,
    ...(sendOptions ?? {}),
    ...(replyKeyboard ? { reply_markup: replyKeyboard } : {}),
  }).catch(() => null);

  const messageId = sent?.result?.message_id;
  if (!messageId) return sendFinalMessage(tg, key, chatId, text, replyMarkup, sendOptions);

  const animated = await animateAnswerMotion(tg, key, chatId, messageId, text, editableReplyMarkup, sendOptions);
  if (animated) return { ok: true, result: { message_id: messageId } };

  const edited = await editFinalMessage(tg, key, chatId, messageId, text, editableReplyMarkup, sendOptions);
  if (edited) return { ok: true, result: { message_id: messageId } };

  return sendFinalMessage(tg, key, chatId, text, replyMarkup, sendOptions);
}

export async function animatedTelegramAiReply(tg: TelegramCall, key: string, chatId: number, replyFactory: () => Promise<string>, fallback: string, replyMarkup?: TelegramReplyMarkup, sendOptions?: TelegramSendOptions, mode: TelegramAnimationMode = 'full'): Promise<{ text: string; sent: TelegramSentMessage }> {
  if (isGroupMode(mode)) return sendSmoothGroupReply(tg, key, chatId, replyFactory, fallback, replyMarkup, sendOptions);

  const replyKeyboard = isReplyKeyboard(replyMarkup) ? replyMarkup : undefined;
  const editableReplyMarkup = isReplyKeyboard(replyMarkup) ? undefined : replyMarkup;

  await tg(key, 'sendChatAction', { chat_id: chatId, action: 'typing' }).catch(() => undefined);

  const sent = await tg<TelegramSentMessage>(key, 'sendMessage', {
    chat_id: chatId,
    text: INVISIBLE_THINKING_TEXT,
    ...(sendOptions ?? {}),
    ...(replyKeyboard ? { reply_markup: replyKeyboard } : {}),
  }).catch(() => null);

  const messageId = sent?.result?.message_id;
  const text = await safeTelegramAiReply(replyFactory, fallback);

  if (!messageId) return { text, sent: await sendFinalMessage(tg, key, chatId, text, replyMarkup, sendOptions) };

  const animated = await animateAnswerMotion(tg, key, chatId, messageId, text, editableReplyMarkup, sendOptions);
  if (animated) return { text, sent: { ok: true, result: { message_id: messageId } } };

  const edited = await editFinalMessage(tg, key, chatId, messageId, text, editableReplyMarkup, sendOptions);
  if (edited) return { text, sent: { ok: true, result: { message_id: messageId } } };

  return { text, sent: await sendFinalMessage(tg, key, chatId, text, replyMarkup, sendOptions) };
}

async function sendSmoothGroupReply(tg: TelegramCall, key: string, chatId: number, replyFactory: () => Promise<string>, fallback: string, replyMarkup?: TelegramReplyMarkup, sendOptions?: TelegramSendOptions): Promise<{ text: string; sent: TelegramSentMessage }> {
  const replyKeyboard = isReplyKeyboard(replyMarkup) ? replyMarkup : undefined;
  const editableReplyMarkup = isReplyKeyboard(replyMarkup) ? undefined : replyMarkup;

  await tg(key, 'sendChatAction', { chat_id: chatId, action: 'typing' }).catch(() => undefined);

  const sent = await tg<TelegramSentMessage>(key, 'sendMessage', {
    chat_id: chatId,
    text: INVISIBLE_THINKING_TEXT,
    ...(sendOptions ?? {}),
    ...(replyKeyboard ? { reply_markup: replyKeyboard } : {}),
  }).catch(() => null);

  const messageId = sent?.result?.message_id;
  const text = await safeTelegramAiReply(replyFactory, fallback);

  if (!messageId) return { text, sent: await sendFinalMessage(tg, key, chatId, text, replyMarkup, sendOptions) };

  const animated = await animateGroupAnswerMotion(tg, key, chatId, messageId, text, editableReplyMarkup, sendOptions);
  if (animated) return { text, sent: { ok: true, result: { message_id: messageId } } };

  const edited = await editFinalMessage(tg, key, chatId, messageId, text, editableReplyMarkup, sendOptions);
  if (edited) return { text, sent: { ok: true, result: { message_id: messageId } } };

  return { text, sent: await sendFinalMessage(tg, key, chatId, text, replyMarkup, sendOptions) };
}

async function animateAnswerMotion(tg: TelegramCall, key: string, chatId: number, messageId: number, finalText: string, replyMarkup?: TelegramReplyMarkup, sendOptions?: TelegramSendOptions): Promise<boolean> {
  const rendered = renderTelegramText(finalText, sendOptions);
  const steps = buildAnswerMotionSteps(rendered.plain);
  if (!steps.length) return false;

  for (let index = 0; index < steps.length; index += 1) {
    const isLast = index === steps.length - 1;
    const payload = isLast
      ? finalEditPayload(chatId, messageId, rendered, replyMarkup, sendOptions)
      : { chat_id: chatId, message_id: messageId, text: steps[index] };
    const edited = await tg<TelegramSentMessage>(key, 'editMessageText', payload).catch(() => null);
    if (!edited) return false;
    if (!isLast) await sleep(ANSWER_MOTION_DELAY_MS);
  }

  return true;
}

async function animateGroupAnswerMotion(tg: TelegramCall, key: string, chatId: number, messageId: number, finalText: string, replyMarkup?: TelegramReplyMarkup, sendOptions?: TelegramSendOptions): Promise<boolean> {
  const rendered = renderTelegramText(finalText, sendOptions);
  const steps = buildGroupAnswerMotionSteps(rendered.plain);
  if (!steps.length) return false;

  for (let index = 0; index < steps.length; index += 1) {
    const isLast = index === steps.length - 1;
    const payload = isLast
      ? finalEditPayload(chatId, messageId, rendered, replyMarkup, sendOptions)
      : { chat_id: chatId, message_id: messageId, text: steps[index] };
    const edited = await tg<TelegramSentMessage>(key, 'editMessageText', payload).catch(() => null);
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

function isGroupMode(mode: TelegramAnimationMode): boolean {
  return mode === 'group' || mode === 'light';
}

function isReplyKeyboard(replyMarkup?: TelegramReplyMarkup): boolean {
  return Boolean(replyMarkup && Array.isArray(replyMarkup.keyboard));
}

function hasParseMode(sendOptions?: TelegramSendOptions): boolean {
  return Boolean(sendOptions && typeof sendOptions.parse_mode === 'string');
}

function normalizeSpacing(text: string): string {
  return String(text || '')
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n[ \t]+/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function renderTelegramText(text: string, sendOptions?: TelegramSendOptions): TelegramRenderedText {
  const normalized = normalizeSpacing(text);
  if (hasParseMode(sendOptions)) return { plain: normalized, html: normalized, useHtml: false };
  return {
    plain: stripMarkdownFormatting(normalized),
    html: markdownToTelegramHtml(normalized),
    useHtml: hasMarkdownFormatting(normalized),
  };
}

function hasMarkdownFormatting(text: string): boolean {
  return /\*\*[^*\n][\s\S]*?\*\*/.test(text) || /__[^_\n][\s\S]*?__/.test(text);
}

function stripMarkdownFormatting(text: string): string {
  return text
    .replace(/\*\*([\s\S]*?)\*\*/g, '$1')
    .replace(/__([\s\S]*?)__/g, '$1');
}

function markdownToTelegramHtml(text: string): string {
  const escaped = escapeHtml(text);
  return escaped
    .replace(/\*\*([\s\S]*?)\*\*/g, '<b>$1</b>')
    .replace(/__([\s\S]*?)__/g, '<b>$1</b>');
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function finalEditPayload(chatId: number, messageId: number, rendered: TelegramRenderedText, replyMarkup?: TelegramReplyMarkup, sendOptions?: TelegramSendOptions): Record<string, unknown> {
  return {
    chat_id: chatId,
    message_id: messageId,
    text: rendered.useHtml ? rendered.html : rendered.plain,
    ...(sendOptions ?? {}),
    ...(rendered.useHtml ? { parse_mode: 'HTML' } : {}),
    ...(replyMarkup ? { reply_markup: replyMarkup } : {}),
  };
}

async function editFinalMessage(tg: TelegramCall, key: string, chatId: number, messageId: number, text: string, replyMarkup?: TelegramReplyMarkup, sendOptions?: TelegramSendOptions): Promise<TelegramSentMessage | null> {
  const rendered = renderTelegramText(text, sendOptions);
  return tg<TelegramSentMessage>(key, 'editMessageText', finalEditPayload(chatId, messageId, rendered, replyMarkup, sendOptions)).catch(() => null);
}

async function sendFinalMessage(tg: TelegramCall, key: string, chatId: number, text: string, replyMarkup?: TelegramReplyMarkup, sendOptions?: TelegramSendOptions): Promise<TelegramSentMessage> {
  const rendered = renderTelegramText(text, sendOptions);
  return tg<TelegramSentMessage>(key, 'sendMessage', {
    chat_id: chatId,
    text: rendered.useHtml ? rendered.html : rendered.plain,
    ...(sendOptions ?? {}),
    ...(rendered.useHtml ? { parse_mode: 'HTML' } : {}),
    ...(replyMarkup ? { reply_markup: replyMarkup } : {}),
  });
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