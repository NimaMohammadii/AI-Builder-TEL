import type { AppConfig, Env } from '../types/env';
import type { TelegramMessage } from '../types/telegram';
import { sendUiMessage } from '../lib/telegram-ui';
import { buildRuntimeKeyboard, loadRuntimeBotConfig, loadRuntimeCommandResponse, type RuntimeBotConfig } from '../lib/bot-runtime-config';
import { loadBotRuntimeCode } from '../lib/bot-code-workspace';
import { executeBotProgram, programFromRuntimeConfig } from '../lib/bot-program-runtime';
import { getDefaultAiProfileByBotId } from '../repositories/ai-profiles';

export async function handleBuiltBotRuntime(message: TelegramMessage, config: AppConfig, env: Env, botId: string | null, text: string): Promise<boolean> {
  if (!botId || !text.trim()) return true;

  const value = text.trim();
  const codePlan = await loadBotRuntimeCode(env, botId);
  const runtime = codePlan?.runtimeConfig ?? await loadRuntimeBotConfig(env, botId);

  if (!runtime) {
    await sendUiMessage(config, {
      chatId: message.chat.id,
      text: 'این ربات هنوز ساخته نشده است. مالک ربات باید از پنل اصلی، بخش ساخت ربات بدون کدنویسی را کامل کند.',
      replyToMessageId: message.message_id
    });
    return true;
  }

  const program = codePlan?.program ?? programFromRuntimeConfig(runtime);
  const programResult = await executeBotProgram(env, { botId, chatId: message.chat.id, text: value, program });
  if (programResult.handled && programResult.text) {
    await sendUiMessage(config, {
      chatId: message.chat.id,
      text: programResult.text,
      replyToMessageId: message.message_id,
      replyMarkup: buildRuntimeKeyboard(runtime)
    });
    return true;
  }

  if (value.startsWith('/')) {
    const response = await loadRuntimeCommandResponse(env, botId, value);
    if (response) {
      await sendUiMessage(config, {
        chatId: message.chat.id,
        text: response,
        replyToMessageId: message.message_id,
        replyMarkup: buildRuntimeKeyboard(runtime)
      });
      return true;
    }
  }

  if (await isRuntimeAiDisabled(env, botId) || program.fallback.aiEnabled === false) {
    await sendUiMessage(config, {
      chatId: message.chat.id,
      text: program.fallback.text,
      replyToMessageId: message.message_id,
      replyMarkup: buildRuntimeKeyboard(runtime)
    });
    return true;
  }

  const aiResponse = await answerWithRuntimeAI(config, runtime, value, codePlan?.sourceCode);
  await sendUiMessage(config, {
    chatId: message.chat.id,
    text: aiResponse,
    replyToMessageId: message.message_id,
    replyMarkup: buildRuntimeKeyboard(runtime)
  });
  return true;
}

async function isRuntimeAiDisabled(env: Env, botId: string): Promise<boolean> {
  const profile = await getDefaultAiProfileByBotId(env, botId);
  return profile?.reply_mode === 'disabled';
}

async function answerWithRuntimeAI(config: AppConfig, runtime: RuntimeBotConfig, userText: string, sourceCode?: string): Promise<string> {
  const instructions = runtime.aiInstructions?.trim() || 'مثل همین ربات تلگرام پاسخ بده و کاربر را راهنمایی کن.';
  const prompt = [
    'تو AI اجرایی یک ربات تلگرام هستی.',
    'این ربات یک برنامه اختصاصی برای خودش دارد و باید دقیقاً مثل همان برنامه رفتار کنی.',
    'کد، توضیح فنی یا JSON نده؛ فقط پیام نهایی مناسب کاربر همین ربات را بنویس.',
    'اگر پیام کاربر خارج از flowهای تعریف‌شده است، با توجه به هدف ربات کوتاه راهنمایی کن.',
    '',
    'برنامه اختصاصی ذخیره‌شده برای این ربات:',
    sourceCode || 'برنامه اختصاصی متنی موجود نیست؛ از runtimeConfig استفاده کن.',
    '',
    'دستورها و رفتار ربات:',
    instructions,
    '',
    'متن خوشامد ربات:',
    runtime.welcomeText,
    '',
    'دکمه‌های فعال:',
    runtime.buttons.map((button) => `- ${button.label}: ${button.response}`).join('\n'),
    '',
    'پیام کاربر:',
    userText
  ].join('\n');

  try {
    if (config.provider === 'grok') return await callGrok(config, prompt);
    return await callOpenAI(config, prompt);
  } catch {
    return 'متوجه شدم. لطفاً یکم دقیق‌تر بگو تا بهتر راهنمایی‌ات کنم.';
  }
}

async function callOpenAI(config: AppConfig, prompt: string): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${config.openAiApiKey}` },
    body: JSON.stringify({
      model: config.openAiModel,
      input: [
        { role: 'system', content: [{ type: 'input_text', text: 'Answer as the final Telegram bot. No markdown unless useful.' }] },
        { role: 'user', content: [{ type: 'input_text', text: prompt }] }
      ],
      max_output_tokens: 900
    })
  });
  const payload = await response.json() as { output_text?: string; output?: Array<{ content?: Array<{ text?: string }> }> };
  if (!response.ok) throw new Error('runtime_ai_failed');
  const text = readOpenAIText(payload).trim();
  if (!text) throw new Error('runtime_ai_empty');
  return text.slice(0, 3500);
}

async function callGrok(config: AppConfig, prompt: string): Promise<string> {
  const baseUrl = (config.xAiBaseUrl || 'https://api.x.ai/v1').replace(/\/$/, '');
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${config.xAiApiKey}` },
    body: JSON.stringify({
      model: config.xAiModel,
      messages: [
        { role: 'system', content: 'Answer as the final Telegram bot. No code unless explicitly needed.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 900
    })
  });
  const payload = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
  if (!response.ok) throw new Error('runtime_ai_failed');
  const text = payload.choices?.[0]?.message?.content?.trim() ?? '';
  if (!text) throw new Error('runtime_ai_empty');
  return text.slice(0, 3500);
}

function readOpenAIText(payload: { output_text?: string; output?: Array<{ content?: Array<{ text?: string }> }> }): string {
  if (typeof payload.output_text === 'string' && payload.output_text.trim()) return payload.output_text;
  const chunks: string[] = [];
  for (const item of payload.output ?? []) {
    for (const content of item.content ?? []) {
      if (typeof content.text === 'string') chunks.push(content.text);
    }
  }
  return chunks.join('\n');
}
