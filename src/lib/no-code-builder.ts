import type { AppConfig, Env } from '../types/env';
import { ensureDefaultAiProfile } from '../repositories/ai-profiles';
import { createBotCommandMenu, saveBotMemory } from '../repositories/bot-intelligence';
import { setBotCommands } from './telegram';

export interface NoCodeBuildInput {
  env: Env;
  config: AppConfig;
  workspaceId: string;
  botId: string;
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

  const shouldCreateBotStructure = wantsBotBuild(text) || wantsMenu(text);

  if (shouldCreateBotStructure) {
    const menuRequest = wantsMenu(text) ? text : buildDefaultMenuRequest(text);
    const menu = await createBotCommandMenu(input.env, {
      workspaceId: input.workspaceId,
      botId: input.botId,
      requestText: menuRequest
    });
    const commandConfig = input.botToken ? { ...input.config, telegramBotToken: input.botToken } : input.config;
    const telegram = await setBotCommands(commandConfig, menu.commands);
    details.push(`ساختار ربات ساخته شد: ${menu.commands.map((item) => '/' + item.command).join(', ')}`);
    details.push(telegram.ok ? 'کامندها روی ربات متصل هم ثبت شدند.' : `کامندها در دیتابیس ذخیره شدند، ولی ثبت تلگرام خطا داد: ${telegram.description ?? 'unknown'}`);
  }

  if (wantsPromptOrBehavior(text) || shouldCreateBotStructure || details.length === 0) {
    const prompt = buildBehaviorPrompt(text);
    await ensureDefaultAiProfile(input.env, {
      workspaceId: input.workspaceId,
      botId: input.botId,
      prompt,
      model: input.config.openAiModel
    });
    details.push('رفتار و پرامپت ربات بروزرسانی شد.');
  }

  const memoryId = await saveBotMemory(input.env, {
    workspaceId: input.workspaceId,
    botId: input.botId,
    title: 'No-code builder instruction',
    content: text,
    sourceType: 'no_code_builder',
    metadata: { appliedAt: new Date().toISOString(), appliedAsStructure: shouldCreateBotStructure }
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
    'دستور بعدی رو بنویس یا برای خروج «اتمام ساخت» رو بزن.'
  ].join('\n');
}

function wantsBotBuild(text: string): boolean {
  return /(ربات|bot).*(بساز|ساخت|درست|create|make|build)|(?:بساز|ساخت|درست|create|make|build).*(ربات|bot)/i.test(text);
}

function wantsMenu(text: string): boolean {
  return /(menu|command|button|keyboard|منو|دکمه|کامند|کیبورد|گزینه|فروشگاه|سبد|راهنما|محصول|لیست|shop|cart|help|product)/i.test(text);
}

function wantsPromptOrBehavior(text: string): boolean {
  return /(prompt|پرامپت|لحن|رفتار|جواب|پاسخ|شخصیت|سبک|رسمی|خودمونی|کوتاه|طولانی|حرفه‌ای|حرفه ای)/i.test(text);
}

function buildDefaultMenuRequest(text: string): string {
  if (/فروشگاه|shop|محصول|product|سبد|cart/i.test(text)) {
    return 'منو بساز: فروشگاه، سبد خرید، راهنما، پشتیبانی';
  }
  return 'منو بساز: شروع، راهنما، قابلیت‌ها، پشتیبانی';
}

function buildBehaviorPrompt(userInstruction: string): string {
  return [
    'تو AI اصلی این ربات تلگرام هستی.',
    'این ربات باید بر اساس دستور مالک، واقعاً مثل محصول نهایی رفتار کند؛ فقط کد نمونه توضیح نده.',
    'اگر مالک گفت ربات بساز، فرض کن ساختار ربات در دیتابیس اعمال شده و تو باید مطابق همان ساختار جواب بدهی.',
    'اگر کاربر نهایی روی کامند یا منو رفت، پاسخ مناسب همان بخش را بده.',
    'پاسخ‌ها کوتاه، دقیق، کاربردی و مطابق شخصیت تعریف‌شده باشند.',
    '',
    'دستور مالک ربات:',
    userInstruction
  ].join('\n');
}
