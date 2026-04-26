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

  if (wantsMenu(text)) {
    const menu = await createBotCommandMenu(input.env, {
      workspaceId: input.workspaceId,
      botId: input.botId,
      requestText: text
    });
    const commandConfig = input.botToken ? { ...input.config, telegramBotToken: input.botToken } : input.config;
    const telegram = await setBotCommands(commandConfig, menu.commands);
    details.push(`منو ساخته شد: ${menu.commands.map((item) => '/' + item.command).join(', ')}`);
    details.push(telegram.ok ? 'کامندها روی ربات متصل هم ثبت شدند.' : `کامندها در دیتابیس ذخیره شدند، ولی ثبت تلگرام خطا داد: ${telegram.description ?? 'unknown'}`);
  }

  if (wantsPromptOrBehavior(text) || details.length === 0) {
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
    metadata: { appliedAt: new Date().toISOString() }
  });

  if (memoryId) details.push('دستور در حافظه پروژه هم ذخیره شد.');

  return {
    ok: true,
    title: '✅ دستور ساخت اجرا شد',
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

function wantsMenu(text: string): boolean {
  return /(menu|command|button|keyboard|منو|دکمه|کامند|کیبورد|گزینه)/i.test(text);
}

function wantsPromptOrBehavior(text: string): boolean {
  return /(prompt|پرامپت|لحن|رفتار|جواب|پاسخ|شخصیت|سبک|رسمی|خودمونی|کوتاه|طولانی|حرفه‌ای|حرفه ای)/i.test(text);
}

function buildBehaviorPrompt(userInstruction: string): string {
  return [
    'تو AI اصلی این ربات تلگرام هستی.',
    'رفتار تو باید دقیقاً بر اساس دستورهای مالک ربات تنظیم شود.',
    'اگر کاربر نهایی سؤال پرسید، پاسخ کوتاه، مفید، دقیق و مطابق شخصیت تعریف‌شده بده.',
    'اگر مالک ربات منو، دکمه، قانون، لحن یا تنظیمات خواست، باید خروجی آماده اجرا و قابل ذخیره بسازی.',
    '',
    'آخرین دستور مالک ربات:',
    userInstruction
  ].join('\n');
}
