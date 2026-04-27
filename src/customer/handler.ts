import { answerWithAI, defaultProgram, normalizeProgram } from '../ai';
import { getBotByUsername } from '../db';
import { runProgram } from './runtime';
import { runtimeKeyboard, sendMessage } from '../telegram';
import type { AppConfig, BotProgram, Env, TelegramMessage } from '../types';

export async function handleCustomerMessage(env: Env, config: AppConfig, botUsername: string, message: TelegramMessage): Promise<void> {
  const bot = await getBotByUsername(env, botUsername);
  if (!bot) return;

  const text = (message.text ?? '').trim();
  const fallback = defaultProgram(bot.ai_prompt);
  const program = bot.program_json ? normalizeProgram(JSON.parse(bot.program_json) as unknown, fallback) : fallback;

  const result = await runProgram(env, {
    botId: bot.id,
    chatId: message.chat.id,
    text,
    program
  });

  if (result.handled) {
    await sendMessage(bot.token, {
      chatId: message.chat.id,
      text: result.text,
      replyToMessageId: message.message_id,
      replyMarkup: runtimeKeyboard(program.buttons)
    });
    return;
  }

  if (bot.ai_enabled !== 1) {
    await sendMessage(bot.token, {
      chatId: message.chat.id,
      text: program.fallbackText,
      replyToMessageId: message.message_id,
      replyMarkup: runtimeKeyboard(program.buttons)
    });
    return;
  }

  const answer = await answerWithAI(config, { program: withOwnerPrompt(program, bot.ai_prompt), userText: text });
  await sendMessage(bot.token, {
    chatId: message.chat.id,
    text: answer,
    replyToMessageId: message.message_id,
    replyMarkup: runtimeKeyboard(program.buttons)
  });
}

function withOwnerPrompt(program: BotProgram, prompt: string): BotProgram {
  return {
    ...program,
    aiInstructions: [program.aiInstructions, prompt].filter(Boolean).join('\n\n')
  };
}
