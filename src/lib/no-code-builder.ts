import type { AppConfig, Env } from '../types/env';
import { ensureDefaultAiProfile } from '../repositories/ai-profiles';
import { createBotCommandMenu, saveBotMemory } from '../repositories/bot-intelligence';
import { loadRuntimeBotConfig, saveRuntimeBotConfig } from './bot-runtime-config';
import { planBotRuntimeCode, saveBotRuntimeCode } from './bot-code-workspace';
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

  const previousRuntimeConfig = await loadRuntimeBotConfig(input.env, input.botId);
  const codePlan = await planBotRuntimeCode({
    config: input.config,
    instruction: text,
    currentConfig: previousRuntimeConfig
  });
  const runtimeConfig = codePlan.runtimeConfig;

  await saveBotRuntimeCode(input.env, {
    workspaceId: input.workspaceId,
    botId: input.botId,
    instruction: text,
    plan: codePlan
  });
  details.push('فضای کد اختصاصی این ربات ساخته/بروزرسانی شد.');

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

  await saveRuntimeBotConfig(input.env, {
    workspaceId: input.workspaceId,
    botId: input.botId,
    instruction: text,
    config: runtimeConfig
  });
  details.push(previousRuntimeConfig
    ? `تغییرات روی کد و رفتار قبلی ربات ادیت و ذخیره شد: ${runtimeConfig.buttons.map((item) => item.label).join('، ')}`
    : `AI کد و نقشه اجرایی ربات را ساخت و ذخیره کرد: ${runtimeConfig.buttons.map((item) => item.label).join('، ')}`
  );

  if (input.botToken && input.botUsername) {
    const webhook = await setWebhookForToken(input.botToken, input.config.publicWebhookUrl, input.botUsername, input.config.telegramWebhookSecret);
    details.push(webhook.ok ? 'Webhook ربات متصل دوباره sync شد.' : `Webhook ربات sync نشد: ${webhook.description ?? 'unknown'}`);
  }

  const prompt = buildBehaviorPrompt(text, runtimeConfig.buttons.map((item) => item.label), runtimeConfig.aiInstructions ?? '');
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
    metadata: { appliedAt: new Date().toISOString(), runtimeConfig, sourceCode: codePlan.sourceCode, previousRuntimeConfig }
  });

  if (memoryId) details.push('دستور و کد تولیدشده در حافظه پروژه هم ذخیره شد.');

  return {
    ok: true,
    title: previousRuntimeConfig ? '✅ کد اختصاصی ربات ادیت و بروزرسانی شد' : '✅ کد اختصاصی ربات ساخته و اعمال شد',
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

function buildBehaviorPrompt(userInstruction: string, labels: string[], aiInstructions: string): string {
  return [
    'تو AI اصلی این ربات تلگرام هستی.',
    'این ربات باید بر اساس کد اختصاصی تولیدشده برای همین ربات رفتار کند؛ کد نمونه ننویس مگر مالک صریحاً کد بخواهد.',
    'ساختار اجرایی ربات و کد اختصاصی آن در دیتابیس/KV ذخیره شده و باید مطابق همان جواب بدهی.',
    `دکمه‌ها/بخش‌های فعال: ${labels.join('، ')}`,
    'رفتار اختصاصی ربات:',
    aiInstructions,
    '',
    'دستور مالک ربات:',
    userInstruction
  ].join('\n');
}
