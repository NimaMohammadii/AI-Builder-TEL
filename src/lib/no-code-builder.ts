import type { AppConfig, Env } from '../types/env';
import { ensureDefaultAiProfile } from '../repositories/ai-profiles';
import { createBotCommandMenu, saveBotMemory } from '../repositories/bot-intelligence';
import { planRuntimeConfigFromInstruction, saveRuntimeBotConfig } from './bot-runtime-config';
import { setBotCommands, setWebhookForToken } from './telegram';

export interface NoCodeBuildInput {
  env: Env;
  config: AppConfig;
  workspaceId: string;
  botId: string;
  botUsername?: string;
  botToken?: string;
  text: string;
}

export interface NoCodeBuildResult {
  ok: boolean;
  title: string;
  details: string[];
}

export async function applyNoCodeBuild(input: NoCodeBuildInput): Promise<NoCodeBuildResult> {
  const text = input.text.trim();
  const details: string[] = [];

  if (!text) {
    return { ok: false, title: 'دستور خالی بود', details: ['یک دستور واضح برای ساخت یا ویرایش ربات بنویس.'] };
  }

  const runtimeConfig = planRuntimeConfigFromInstruction(text);
  await saveRuntimeBotConfig(input.env, {
    workspaceId: input.workspaceId,
    botId: input.botId,
    instruction: text,
    config: runtimeConfig
  });
  details.push(`تنظیمات اجرایی ربات ذخیره شد: ${runtimeConfig.buttons.map((item) => item.label).join('، ')}`);

  const menuRequest = buildMenuRequestFromRuntime(text, runtimeConfig.buttons.map((item) => item.label));
  const menu = await createBotCommandMenu(input.env, {
    workspaceId: input.workspaceId,
    botId: input.botId,
    requestText: menuRequest
  });
  const commandConfig = input.botToken ? { ...input.config, telegramBotToken: input.botToken } : input.config;
  const telegram = await setBotCommands(commandConfig, menu.commands);
  details.push(`کامندهای ربات ساخته شد: ${menu.commands.map((item) => '/' + item.command).join(', ')}`);
  details.push(telegram.ok ? 'کامندها روی ربات متصل هم ثبت شدند.' : `کامندها در دیتابیس ذخیره شدند، ولی ثبت تلگرام خطا داد: ${telegram.description ?? 'unknown'}`);

  if (input.botToken && input.botUsername) {
    const webhook = await setWebhookForToken(input.botToken, input.config.publicWebhookUrl, input.botUsername, input.config.telegramWebhookSecret);
    details.push(webhook.ok ? 'Webhook ربات متصل دوباره sync شد.' : `Webhook ربات sync نشد: ${webhook.description ?? 'unknown'}`);
  }

  const prompt = buildBehaviorPrompt(text, runtimeConfig.buttons.map((item) => item.label));
  await ensureDefaultAiProfile(input.env, {
    workspaceId: input.workspaceId,
    botId: input.botId,
    prompt,
    model: input.config.openAiModel
  });
  details.push('رفتار و پرامپت ربات بروزرسانی شد.');

  const memoryId = await saveBotMemory(input.env, {
    workspaceId: input.workspaceId,
    botId: input.botId,
    title: 'No-code builder instruction',
    content: text,
    sourceType: 'no_code_builder',
    metadata: { appliedAt: new Date().toISOString(), runtimeConfig }
  });

  if (memoryId) details.push('دستور در حافظه پروژه هم ذخیره شد.');

  return {
    ok: true,
    title: '✅ روی ربات متصل اعمال شد',
    details
  };
}

export function formatNoCodeBuildResult(result: NoCodeBuildResult): string {
  return [
    result.title,
    '',
    ...result.details.map((item) => `• ${item}`),
    '',
    'برای دیدن نتیجه، داخل همان ربات متصل /start بزن.\nدستور بعدی رو بنویس یا برای خروج «اتمام ساخت» رو بزن.'
  ].join('\n');
}

function buildMenuRequestFromRuntime(text: string, labels: string[]): string {
  return `منو بساز با این گزینه‌ها: ${labels.map((item) => `"${item}"`).join('، ')}\nدستور مالک: ${text}`;
}

function buildBehaviorPrompt(userInstruction: string, labels: string[]): string {
  return [
    'تو AI اصلی این ربات تلگرام هستی.',
    'این ربات باید بر اساس دستور مالک، واقعاً مثل محصول نهایی رفتار کند؛ کد نمونه ننویس مگر مالک صریحاً کد بخواهد.',
    'ساختار اجرایی ربات در دیتابیس ذخیره شده و باید مطابق همان جواب بدهی.',
    `دکمه‌ها/بخش‌های فعال: ${labels.join('، ')}`,
    'اگر کاربر نهایی یکی از دکمه‌ها یا commandها را زد، پاسخ همان بخش را بده و مکالمه را جلو ببر.',
    'پاسخ‌ها کوتاه، دقیق، کاربردی و مطابق شخصیت تعریف‌شده باشند.',
    '',
    'دستور مالک ربات:',
    userInstruction
  ].join('\n');
}
