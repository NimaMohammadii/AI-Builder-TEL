import type { AppConfig } from "../types/env";
import type { TelegramMessage } from "../types/telegram";
import { logger } from "../lib/logger";
import { readConversationHistory, writeConversationHistory } from "../lib/chat-memory";
import { extractImagePrompt, generateOpenAIImage, generateOpenAIReply, isImageGenerationRequest } from "../lib/openai";
import { getMeByToken, parseUpdate, sendMessage, sendPhoto, setWebhookForToken, shouldRespondInChat, verifyTelegramWebhookSecret } from "../lib/telegram";
import { jsonError, jsonOk } from "../utils/http";
import { isPrivateChat } from "../utils/telegram-helpers";
import { upsertTelegramUser } from "../repositories/users";
import { ensureWorkspaceForUser } from "../repositories/workspaces";
import { upsertChat } from "../repositories/chats";
import { ensureDefaultAiProfile, getDefaultAiProfileByBotId } from "../repositories/ai-profiles";
import { findWorkspaceBotByUsername, findWorkspaceBotByWorkspaceId, upsertManagedTelegramBot } from "../repositories/telegram-bots";

const NON_TEXT_PRIVATE_REPLY = "فعلاً فقط پیام متنی رو می‌تونم پردازش کنم.";
const IMAGE_CAPTION_PREFIX = "تصویر آماده شد.";
const IMAGE_FAILURE_TEXT = "فعلاً نتونستم تصویر را بسازم. دوباره با توضیح دقیق‌تر امتحان کن.";

export async function handleTelegramWebhook(request: Request, config: AppConfig, env: any): Promise<Response> {
  const route = "/telegram/webhook";

  if (!verifyTelegramWebhookSecret(request, config.telegramWebhookSecret)) {
    logger.warn("Rejected webhook due to invalid secret token", { route, event: "invalid_secret" });
    return jsonError("unauthorized", 401);
  }

  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    logger.warn("Invalid content-type for webhook", { route, event: "invalid_content_type" });
    return jsonError("invalid_content_type", 415);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    logger.warn("Invalid JSON payload received", { route, event: "invalid_json" });
    return jsonError("invalid_json", 400);
  }

  const update = parseUpdate(body);
  if (!update) {
    logger.warn("Invalid update payload", { route, event: "invalid_update_payload" });
    return jsonOk({ ok: true, ignored: true });
  }

  const message = update.message ?? update.edited_message;
  if (!message) {
    logger.info("Ignoring unsupported update type", {
      route,
      event: "unsupported_update",
      updateId: update.update_id
    });
    return jsonOk({ ok: true, ignored: true });
  }

  const managedBotUsername = getManagedBotUsernameFromRequest(request);
  const managedBot = managedBotUsername ? await findWorkspaceBotByUsername(env, managedBotUsername) : null;
  const runtimeConfig = await buildRuntimeConfig(config, env, managedBot?.id ?? null, managedBot?.encrypted_token, managedBot?.bot_username);

  return processMessage(message, runtimeConfig, env, update.update_id, managedBot?.id ?? null, managedBot?.workspace_id ?? null, !managedBotUsername);
}

async function processMessage(
  message: TelegramMessage,
  config: AppConfig,
  env: any,
  updateId: number,
  managedBotId: string | null,
  managedWorkspaceId: string | null,
  isCoreBot: boolean
): Promise<Response> {
  const route = "/telegram/webhook";
  const chatType = message.chat.type;

  let workspaceId = managedWorkspaceId;

  try {
    const user = await upsertTelegramUser(env, {
      telegramUserId: message.from.id,
      username: message.from.username,
      firstName: message.from.first_name,
      lastName: message.from.last_name
    });

    const workspace = managedWorkspaceId ? { id: managedWorkspaceId } : await ensureWorkspaceForUser(env, {
      userId: user.id,
      username: message.from.username,
      firstName: message.from.first_name
    });

    workspaceId = workspace.id;

    await upsertChat(env, {
      workspaceId: workspace.id,
      botId: managedBotId ?? undefined,
      telegramChatId: message.chat.id,
      chatType: message.chat.type,
      title: message.chat.title,
      username: message.chat.username
    });
  } catch (error) {
    logger.warn("Database sync skipped during webhook processing", {
      route,
      event: "db_sync_skipped",
      updateId,
      error: error instanceof Error ? error.message : "unknown"
    });
  }

  if (isCoreBot && isPrivateChat(message) && message.text?.startsWith("/connect ")) {
    return handleConnectCommand(message, config, env, workspaceId);
  }

  if (isCoreBot && isPrivateChat(message) && message.text?.startsWith("/prompt ")) {
    return handlePromptCommand(message, config, env, workspaceId);
  }

  if (isCoreBot && isPrivateChat(message) && message.text?.startsWith("/mybots")) {
    return handleMyBotsCommand(message, config, env, workspaceId);
  }

  if (!shouldRespondInChat(message, config.botUsername)) {
    return jsonOk({ ok: true, ignored: true });
  }

  if (!message.text && isPrivateChat(message)) {
    await sendMessage(config, {
      chat_id: message.chat.id,
      text: NON_TEXT_PRIVATE_REPLY,
      reply_to_message_id: message.message_id
    });
    return jsonOk();
  }

  if (!message.text) {
    return jsonOk({ ok: true, ignored: true });
  }

  if (isImageGenerationRequest(message.text)) {
    const imagePrompt = extractImagePrompt(message.text) || message.text;
    const image = await generateOpenAIImage(config, imagePrompt);

    if (!image || (!image.remoteUrl && !image.base64Data)) {
      await sendMessage(config, {
        chat_id: message.chat.id,
        text: IMAGE_FAILURE_TEXT,
        reply_to_message_id: message.message_id
      });
      return jsonOk();
    }

    const imageSendResult = await sendPhoto(config, {
      chat_id: message.chat.id,
      photoUrl: image.remoteUrl,
      photoBase64: image.base64Data,
      caption: `${IMAGE_CAPTION_PREFIX}\n${image.prompt}`,
      reply_to_message_id: message.message_id
    });

    if (!imageSendResult.ok) {
      logger.error("Failed to send Telegram image response", {
        route,
        event: "telegram_send_image_error",
        chatType,
        updateId,
        error: `${imageSendResult.error_code}:${imageSendResult.description}`
      });

      await sendMessage(config, {
        chat_id: message.chat.id,
        text: "تصویر ساخته شد ولی ارسالش به تلگرام خطا داد.",
        reply_to_message_id: message.message_id
      });
    }

    return jsonOk();
  }

  const history = await readConversationHistory(config, message.chat.id);
  const reply = await generateOpenAIReply(config, message.text, history);
  const sendResult = await sendMessage(config, {
    chat_id: message.chat.id,
    text: reply,
    reply_to_message_id: message.message_id
  });

  if (sendResult.ok) {
    await writeConversationHistory(config, message.chat.id, history, message.text, reply);
  }

  if (!sendResult.ok) {
    logger.error("Failed to send Telegram response", {
      route,
      event: "telegram_send_error",
      chatType,
      updateId,
      error: `${sendResult.error_code}:${sendResult.description}`
    });
  }

  return jsonOk();
}

async function handleConnectCommand(message: TelegramMessage, config: AppConfig, env: any, workspaceId: string | null) {
  const token = (message.text ?? "").replace(/^\/connect\s+/, "").trim();
  if (!token || !workspaceId) {
    await sendMessage(config, {
      chat_id: message.chat.id,
      text: "فرمت درست: /connect <telegram_bot_token>",
      reply_to_message_id: message.message_id
    });
    return jsonOk();
  }

  const me = await getMeByToken(token);
  if (!me.ok || !me.result?.username) {
    await sendMessage(config, {
      chat_id: message.chat.id,
      text: "توکن ربات معتبر نیست.",
      reply_to_message_id: message.message_id
    });
    return jsonOk();
  }

  const bot = await upsertManagedTelegramBot(env, {
    workspaceId,
    telegramBotId: String(me.result.id),
    botUsername: me.result.username.toLowerCase(),
    botName: me.result.first_name,
    encryptedToken: token
  });

  await ensureDefaultAiProfile(env, {
    workspaceId,
    botId: bot.id,
    prompt: config.systemPrompt,
    model: config.openAiModel
  });

  const webhookResult = await setWebhookForToken(token, config.publicWebhookUrl, me.result.username.toLowerCase(), config.telegramWebhookSecret);
  const replyText = webhookResult.ok
    ? `ربات @${me.result.username} وصل شد.\nبرای تغییر پرامپت:\n/prompt @${me.result.username} تو یک دستیار حرفه‌ای فروش هستی`
    : `ربات ذخیره شد ولی ست‌کردن webhook خطا داد: ${webhookResult.description ?? "unknown_error"}`;

  await sendMessage(config, {
    chat_id: message.chat.id,
    text: replyText,
    reply_to_message_id: message.message_id
  });
  return jsonOk();
}

async function handlePromptCommand(message: TelegramMessage, config: AppConfig, env: any, workspaceId: string | null) {
  const raw = (message.text ?? "").replace(/^\/prompt\s+/, "").trim();
  if (!raw || !workspaceId) {
    await sendMessage(config, {
      chat_id: message.chat.id,
      text: "فرمت درست: /prompt @botusername متن پرامپت\nیا\n/prompt متن پرامپت",
      reply_to_message_id: message.message_id
    });
    return jsonOk();
  }

  const parts = raw.split(/\s+/);
  const maybeUsername = parts[0]?.startsWith("@") ? parts[0] : undefined;
  const prompt = maybeUsername ? raw.slice(maybeUsername.length).trim() : raw;
  const bot = await findWorkspaceBotByWorkspaceId(env, workspaceId, maybeUsername);

  if (!bot || !prompt) {
    await sendMessage(config, {
      chat_id: message.chat.id,
      text: "اول یک ربات وصل کن یا پرامپت معتبر بفرست.",
      reply_to_message_id: message.message_id
    });
    return jsonOk();
  }

  await ensureDefaultAiProfile(env, {
    workspaceId,
    botId: bot.id,
    prompt,
    model: config.openAiModel
  });

  await sendMessage(config, {
    chat_id: message.chat.id,
    text: `پرامپت ربات @${bot.bot_username} ذخیره شد.`,
    reply_to_message_id: message.message_id
  });
  return jsonOk();
}

async function handleMyBotsCommand(message: TelegramMessage, config: AppConfig, env: any, workspaceId: string | null) {
  if (!workspaceId) {
    await sendMessage(config, {
      chat_id: message.chat.id,
      text: "هنوز ورک‌اسپیس آماده نیست.",
      reply_to_message_id: message.message_id
    });
    return jsonOk();
  }

  const bot = await findWorkspaceBotByWorkspaceId(env, workspaceId);
  const text = bot
    ? `ربات فعال شما: @${bot.bot_username}\nبرای تغییر پرامپت:\n/prompt @${bot.bot_username} متن جدید`
    : "هنوز هیچ رباتی وصل نکردی.\n/connect <telegram_bot_token>";

  await sendMessage(config, {
    chat_id: message.chat.id,
    text,
    reply_to_message_id: message.message_id
  });
  return jsonOk();
}

async function buildRuntimeConfig(config: AppConfig, env: any, managedBotId: string | null, managedToken?: string, managedUsername?: string) {
  if (!managedBotId || !managedToken) {
    return config;
  }

  const aiProfile = await getDefaultAiProfileByBotId(env, managedBotId);
  return {
    ...config,
    telegramBotToken: managedToken,
    botUsername: managedUsername ?? config.botUsername,
    systemPrompt: aiProfile?.system_prompt ?? config.systemPrompt,
    openAiModel: aiProfile?.model ?? config.openAiModel
  };
}

function getManagedBotUsernameFromRequest(request: Request): string | undefined {
  const pathname = new URL(request.url).pathname;
  const parts = pathname.split('/').filter(Boolean);
  return parts.length >= 3 ? parts[2].toLowerCase() : undefined;
}
