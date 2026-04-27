import { answerCallback, builderKeyboard, editMessage, getMe, mainMenuKeyboard, runtimeKeyboard, sendMessage, setCustomerCommands, setWebhook } from '../telegram';
import { clearBuilderMode, getActiveBotForOwner, getBuilderMode, saveCustomerBot, setBotAiEnabled, setBotAiPrompt, setBuilderMode, updateBotProgram, upsertUser } from '../db';
import { defaultProgram, planBotProgram } from '../ai';
import type { AppConfig, Env, TelegramCallbackQuery, TelegramMessage } from '../types';

export async function handleBuilderMessage(env: Env, config: AppConfig, message: TelegramMessage): Promise<void> {
  const text = (message.text ?? '').trim();
  const userId = await upsertUser(env, message.from ?? { id: message.chat.id });
  const mode = await getBuilderMode(env, message.chat.id);

  if (mode === 'build' && !isBuilderControl(text)) {
    await buildCustomerBot(env, config, message, userId, text);
    return;
  }

  if (mode === 'ai_prompt') {
    const bot = await getActiveBotForOwner(env, userId);
    if (!bot) {
      await clearBuilderMode(env, message.chat.id);
      await sendMessage(config.telegramBotToken, { chatId: message.chat.id, text: 'اول یک ربات وصل کن.', replyMarkup: mainMenuKeyboard() });
      return;
    }
    await setBotAiPrompt(env, bot.id, text);
    await clearBuilderMode(env, message.chat.id);
    await sendMessage(config.telegramBotToken, { chatId: message.chat.id, text: '✅ پرامپت AI ربات کاربر بروزرسانی شد.', replyMarkup: mainMenuKeyboard() });
    return;
  }

  if (isStart(text)) {
    await sendMessage(config.telegramBotToken, { chatId: message.chat.id, text: mainMenuText(), replyMarkup: mainMenuKeyboard() });
    return;
  }

  if (text === '🔌 کانکت') {
    await showConnect(env, config, message.chat.id, userId);
    return;
  }

  if (text.startsWith('/connect')) {
    await connectBot(env, config, message, userId, text.replace('/connect', '').trim());
    return;
  }

  if (text === '🤖 AI') {
    await showAiPanel(env, config, message.chat.id, userId);
    return;
  }

  if (text === '✨ ساخت ربات بدون کدنویسی') {
    await setBuilderMode(env, message.chat.id, 'build');
    await sendMessage(config.telegramBotToken, { chatId: message.chat.id, text: builderStartText(), replyMarkup: builderKeyboard() });
    return;
  }

  if (text === '✅ اتمام ساخت') {
    await clearBuilderMode(env, message.chat.id);
    await sendMessage(config.telegramBotToken, { chatId: message.chat.id, text: '✅ حالت ساخت بسته شد.\n\n' + mainMenuText(), replyMarkup: mainMenuKeyboard() });
    return;
  }

  if (text === '♻️ ریست ربات') {
    const bot = await getActiveBotForOwner(env, userId);
    if (!bot) {
      await sendMessage(config.telegramBotToken, { chatId: message.chat.id, text: 'رباتی برای ریست پیدا نشد.', replyMarkup: builderKeyboard() });
      return;
    }
    const program = defaultProgram('ربات از نو آماده ساخت است.');
    await updateBotProgram(env, bot.id, JSON.stringify(program), program.aiInstructions);
    await sendMessage(config.telegramBotToken, { chatId: message.chat.id, text: '♻️ برنامه ربات پاک شد. حالا از صفر دستور ساخت بده.', replyMarkup: builderKeyboard() });
    return;
  }

  await sendMessage(config.telegramBotToken, { chatId: message.chat.id, text: mainMenuText(), replyMarkup: mainMenuKeyboard() });
}

export async function handleBuilderCallback(env: Env, config: AppConfig, callback: TelegramCallbackQuery): Promise<void> {
  const data = callback.data ?? '';
  const chatId = callback.message?.chat.id;
  const messageId = callback.message?.message_id;
  const userId = await upsertUser(env, callback.from ?? { id: chatId ?? 0 });
  if (!chatId) return;

  const bot = await getActiveBotForOwner(env, userId);
  if (!bot) {
    await answerCallback(config.telegramBotToken, callback.id, 'اول ربات وصل کن');
    return;
  }

  if (data === 'ai:toggle') {
    await setBotAiEnabled(env, bot.id, bot.ai_enabled !== 1);
    await answerCallback(config.telegramBotToken, callback.id, bot.ai_enabled === 1 ? 'AI خاموش شد' : 'AI روشن شد');
    if (messageId) await editMessage(config.telegramBotToken, { chatId, messageId, text: aiPanelText({ ...bot, ai_enabled: bot.ai_enabled === 1 ? 0 : 1 }), replyMarkup: aiInlineKeyboard(bot.ai_enabled !== 1) });
    return;
  }

  if (data === 'ai:prompt') {
    await setBuilderMode(env, chatId, 'ai_prompt');
    await answerCallback(config.telegramBotToken, callback.id, 'پرامپت جدید را بفرست');
    await sendMessage(config.telegramBotToken, { chatId, text: '✍️ پرامپت جدید AI ربات کاربر را بفرست.' });
    return;
  }

  await answerCallback(config.telegramBotToken, callback.id, 'OK');
}

async function connectBot(env: Env, config: AppConfig, message: TelegramMessage, ownerUserId: string, token: string): Promise<void> {
  if (!token) {
    await sendMessage(config.telegramBotToken, { chatId: message.chat.id, text: 'توکن ربات کاربر را اینطوری بفرست:\n/connect TOKEN' });
    return;
  }
  const me = await getMe(token);
  if (!me) {
    await sendMessage(config.telegramBotToken, { chatId: message.chat.id, text: 'توکن معتبر نیست یا ربات پیدا نشد.' });
    return;
  }
  const bot = await saveCustomerBot(env, { ownerUserId, token, telegramBotId: String(me.id), username: me.username });
  await setWebhook(token, config.publicWebhookBase, me.username);
  await setCustomerCommands(config, token);
  const program = defaultProgram(bot.ai_prompt);
  await updateBotProgram(env, bot.id, JSON.stringify(program), program.aiInstructions);
  await sendMessage(config.telegramBotToken, { chatId: message.chat.id, text: `✅ ربات @${me.username} وصل شد.\nحالا از «ساخت ربات بدون کدنویسی» استفاده کن.`, replyMarkup: mainMenuKeyboard() });
}

async function buildCustomerBot(env: Env, config: AppConfig, message: TelegramMessage, ownerUserId: string, request: string): Promise<void> {
  const bot = await getActiveBotForOwner(env, ownerUserId);
  if (!bot) {
    await sendMessage(config.telegramBotToken, { chatId: message.chat.id, text: 'اول از بخش کانکت یک ربات وصل کن.', replyMarkup: builderKeyboard() });
    return;
  }
  const current = bot.program_json ? JSON.parse(bot.program_json) : null;
  const program = await planBotProgram(config, { ownerRequest: request, currentProgram: current });
  await updateBotProgram(env, bot.id, JSON.stringify(program), program.aiInstructions);
  await setWebhook(bot.token, config.publicWebhookBase, bot.username);
  await sendMessage(config.telegramBotToken, {
    chatId: message.chat.id,
    text: buildResultText(program),
    replyMarkup: builderKeyboard()
  });
}

async function showConnect(env: Env, config: AppConfig, chatId: number, ownerUserId: string): Promise<void> {
  const bot = await getActiveBotForOwner(env, ownerUserId);
  const text = bot ? `🔌 ربات متصل:\n@${bot.username}\nAI: ${bot.ai_enabled ? 'فعال' : 'غیرفعال'}` : 'هنوز رباتی وصل نیست.\nتوکن را اینطوری بفرست:\n/connect TOKEN';
  await sendMessage(config.telegramBotToken, { chatId, text, replyMarkup: mainMenuKeyboard() });
}

async function showAiPanel(env: Env, config: AppConfig, chatId: number, ownerUserId: string): Promise<void> {
  const bot = await getActiveBotForOwner(env, ownerUserId);
  if (!bot) {
    await sendMessage(config.telegramBotToken, { chatId, text: 'اول یک ربات وصل کن.', replyMarkup: mainMenuKeyboard() });
    return;
  }
  await sendMessage(config.telegramBotToken, { chatId, text: aiPanelText(bot), replyMarkup: aiInlineKeyboard(bot.ai_enabled === 1) });
}

function aiPanelText(bot: { username: string; ai_enabled: number; ai_prompt: string }): string {
  return [
    '🤖 AI',
    '',
    `ربات: @${bot.username}`,
    `وضعیت AI: ${bot.ai_enabled ? '✅ فعال' : '⛔️ غیرفعال'}`,
    '',
    'پرامپت فعلی:',
    bot.ai_prompt || 'ثبت نشده.'
  ].join('\n');
}

function aiInlineKeyboard(enabled: boolean) {
  return { inline_keyboard: [[{ text: enabled ? '⛔️ غیرفعال کردن AI' : '✅ فعال کردن AI', callback_data: 'ai:toggle' }, { text: '✍️ تغییر پرامپت', callback_data: 'ai:prompt' }]] };
}

function buildResultText(program: { buttons: Array<{ label: string }>; flows: Array<{ title: string }> }): string {
  return [
    '✅ ربات ساخته/بروزرسانی شد.',
    '',
    `دکمه‌ها: ${program.buttons.map((b) => b.label).join('، ') || 'ندارد'}`,
    `فلوها: ${program.flows.map((f) => f.title).join('، ') || 'ندارد'}`,
    '',
    'برای تست، داخل ربات کاربر /start بزن.'
  ].join('\n');
}

function mainMenuText(): string {
  return ['⚡️ پنل ساخت ربات', '', '🔌 کانکت: اتصال ربات کاربر', '🤖 AI: تنظیم هوش مصنوعی ربات متصل', '✨ ساخت ربات بدون کدنویسی: هر چیزی می‌خوای بنویس تا ساخته شود'].join('\n');
}

function builderStartText(): string {
  return ['✨ حالت ساخت فعال شد.', '', 'هر چیزی می‌خوای ربات کاربر انجام بده بنویس.', 'مثال: یک ربات رزرو وقت بساز که اسم، شماره، تاریخ و ساعت بگیره و خلاصه بده.'].join('\n');
}

function isStart(text: string): boolean {
  return ['/start', '/menu', 'start', 'منو'].includes(text);
}

function isBuilderControl(text: string): boolean {
  return ['✅ اتمام ساخت', '♻️ ریست ربات'].includes(text);
}
