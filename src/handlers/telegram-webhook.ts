import type { AppConfig } from "../types/env";
import type { TelegramMessage } from "../types/telegram";
import { ENABLE_GROK_VIDEO } from "../config/grok-features";
import { logger } from "../lib/logger";
import { readConversationHistory, writeConversationHistory } from "../lib/chat-memory";
import { extractInstagramUrl, fetchInstagramMedia } from "../lib/instagram-downloader";
import { extractImagePrompt, generateOpenAIImage, generateOpenAIReply, isImageGenerationRequest } from "../lib/openai";
import { analyzeImageWithGrok, generateVideoWithGrok, isImageAnalysisRequest, isVideoGenerationRequest } from "../lib/grok-media";
import { fetchRemoteBinaryAsBase64, getTelegramFileUrl, sendVideo } from "../lib/telegram-media";
import { getMeByToken, parseUpdate, sendMessage, sendPhoto, setWebhookForToken, shouldRespondInChat, verifyTelegramWebhookSecret } from "../lib/telegram";
import { jsonError, jsonOk } from "../utils/http";
import { isPrivateChat } from "../utils/telegram-helpers";
import { upsertTelegramUser } from "../repositories/users";
import { ensureWorkspaceForUser } from "../repositories/workspaces";
import { upsertChat } from "../repositories/chats";
import { ensureDefaultAiProfile, getDefaultAiProfileByBotId } from "../repositories/ai-profiles";
import { findWorkspaceBotByUsername, findWorkspaceBotByWorkspaceId, upsertManagedTelegramBot } from "../repositories/telegram-bots";
import { getProjectTelegramActionText } from "./project-telegram-action";

const NON_TEXT_PRIVATE_REPLY = "فعلاً فقط پیام متنی رو می‌تونم پردازش کنم.";
const IMAGE_CAPTION_PREFIX = "تصویر آماده شد.";
const IMAGE_FAILURE_TEXT = "فعلاً نتونستم تصویر را بسازم. دوباره با توضیح دقیق‌تر امتحان کن.";
const VIDEO_FAILURE_TEXT = "فعلاً نتونستم ویدیو را بسازم. دوباره با توضیح دقیق‌تر امتحان کن.";
const VIDEO_CAPTION_PREFIX = "ویدیو آماده شد.";
const VIDEO_PROCESSING_TEXT = "در حال ساخت ویدیو هستم. چند لحظه صبر کن...";
const INSTAGRAM_FAILURE_TEXT = "نتونستم این لینک اینستاگرام را دانلود کنم. فقط پست‌ها و ریلزهای عمومی پشتیبانی می‌شوند.";
const INSTAGRAM_BINARY_FAILURE_TEXT = "مدیا پیدا شد، ولی دانلود فایل از منبع انجام نشد. لطفاً چند دقیقه بعد دوباره امتحان کن.";
const INSTAGRAM_SEND_FAILURE_TEXT = "مدیا دانلود شد، ولی ارسالش به تلگرام خطا داد.";
const INSTAGRAM_PROCESSING_TEXT = "دارم لینک اینستاگرام را دانلود می‌کنم. می‌تونی همزمان پیام‌های دیگه هم بفرستی.";
const INSTAGRAM_FALLBACK_URL_REGEX = /https?:\/\/(?:www\.)?instagram\.com\/[^\s<>"']+/i;
const INSTAGRAM_RESOLVE_HEADERS = {
  "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36",
  accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "accept-language": "en-US,en;q=0.9"
};

export async function handleTelegramWebhook(request: Request, config: AppConfig, env: any, ctx?: ExecutionContext): Promise<Response> {
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
    logger.info("Ignoring unsupported update type", { route, event: "unsupported_update", updateId: update.update_id });
    return jsonOk({ ok: true, ignored: true });
  }

  const managedBotUsername = getManagedBotUsernameFromRequest(request);
  const managedBot = managedBotUsername ? await findWorkspaceBotByUsername(env, managedBotUsername) : null;

  if (managedBotUsername && !managedBot) {
    logger.error("Managed bot webhook route received but no matching bot was found", { route, event: "managed_bot_not_found", managedBotUsername, updateId: update.update_id });
    return jsonOk({ ok: true, ignored: true, reason: "managed_bot_not_found" });
  }

  const runtimeConfig = await buildRuntimeConfig(config, env, managedBot?.id ?? null, managedBot?.encrypted_token, managedBot?.bot_username);
  return processMessage(message, runtimeConfig, env, update.update_id, managedBot?.id ?? null, managedBot?.workspace_id ?? null, !managedBotUsername, ctx);
}

async function processMessage(message: TelegramMessage, config: AppConfig, env: any, updateId: number, managedBotId: string | null, managedWorkspaceId: string | null, isCoreBot: boolean, ctx?: ExecutionContext): Promise<Response> {
  const route = "/telegram/webhook";
  const chatType = message.chat.type;
  let workspaceId = managedWorkspaceId;

  try {
    const user = await upsertTelegramUser(env, {
      telegramUserId: message.from?.id ?? 0,
      username: message.from?.username,
      firstName: message.from?.first_name,
      lastName: (message.from as any)?.last_name
    });

    const workspace = managedWorkspaceId ? { id: managedWorkspaceId } : await ensureWorkspaceForUser(env, {
      userId: user.id,
      username: message.from?.username,
      firstName: message.from?.first_name
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
    logger.warn("Database sync skipped during webhook processing", { route, event: "db_sync_skipped", updateId, error: error instanceof Error ? error.message : "unknown" });
  }

  if (isCoreBot && isPrivateChat(message) && message.text?.startsWith("/connect ")) return handleConnectCommand(message, config, env, workspaceId);
  if (isCoreBot && isPrivateChat(message) && message.text?.startsWith("/prompt ")) return handlePromptCommand(message, config, env, workspaceId);
  if (isCoreBot && isPrivateChat(message) && message.text?.startsWith("/mybots")) return handleMyBotsCommand(message, config, env, workspaceId);

  if (!shouldRespondInChat(message, config.botUsername)) return jsonOk({ ok: true, ignored: true });

  const textualContent = message.text || (message as any).caption || "";
  const projectActionText = await getProjectTelegramActionText(env, workspaceId, textualContent);
  if (projectActionText) {
    await sendMessage(config, { chat_id: message.chat.id, text: projectActionText, reply_to_message_id: message.message_id });
    return jsonOk();
  }

  const instagramUrl = textualContent ? extractInstagramUrl(textualContent) ?? extractFallbackInstagramUrl(textualContent) : null;
  if (instagramUrl) {
    await sendMessage(config, {
      chat_id: message.chat.id,
      text: INSTAGRAM_PROCESSING_TEXT,
      reply_to_message_id: message.message_id
    });
    const job = processInstagramRequest(message, config, instagramUrl, updateId, chatType);
    if (ctx) ctx.waitUntil(job); else void job;
    return jsonOk();
  }

  if (config.provider === "grok" && isImageAnalysisRequest(message as any)) {
    const imageUrl = await resolveMessageImageUrl(config, message as any);
    if (!imageUrl) {
      await sendMessage(config, { chat_id: message.chat.id, text: "نتونستم تصویر را از تلگرام بخونم.", reply_to_message_id: message.message_id });
      return jsonOk();
    }
    const analysisPrompt = message.text || (message as any).caption || "این تصویر را دقیق تحلیل کن.";
    const analysis = await analyzeImageWithGrok(config, imageUrl, analysisPrompt);
    await sendMessage(config, { chat_id: message.chat.id, text: analysis, reply_to_message_id: message.message_id });
    return jsonOk();
  }

  if (config.provider === "grok" && ENABLE_GROK_VIDEO && isVideoGenerationRequest(message.text || (message as any).caption || "")) {
    await sendMessage(config, { chat_id: message.chat.id, text: VIDEO_PROCESSING_TEXT, reply_to_message_id: message.message_id });
    const job = processVideoRequest(message, config, updateId, chatType);
    if (ctx) ctx.waitUntil(job); else void job;
    return jsonOk();
  }

  if (!message.text && isPrivateChat(message)) {
    await sendMessage(config, { chat_id: message.chat.id, text: NON_TEXT_PRIVATE_REPLY, reply_to_message_id: message.message_id });
    return jsonOk();
  }

  if (!message.text) return jsonOk({ ok: true, ignored: true });

  if (isImageGenerationRequest(message.text)) {
    const imagePrompt = extractImagePrompt(message.text) || message.text;
    const image = await generateOpenAIImage(config, imagePrompt);
    if (!image || (!image.remoteUrl && !image.base64Data)) {
      await sendMessage(config, { chat_id: message.chat.id, text: IMAGE_FAILURE_TEXT, reply_to_message_id: message.message_id });
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
      logger.error("Failed to send Telegram image response", { route, event: "telegram_send_image_error", chatType, updateId, error: `${imageSendResult.error_code}:${imageSendResult.description}` });
      await sendMessage(config, { chat_id: message.chat.id, text: "تصویر ساخته شد ولی ارسالش به تلگرام خطا داد.", reply_to_message_id: message.message_id });
    }
    return jsonOk();
  }

  const history = await readConversationHistory(config, message.chat.id);
  const reply = await generateOpenAIReply(config, message.text, history);
  const sendResult = await sendMessage(config, { chat_id: message.chat.id, text: reply, reply_to_message_id: message.message_id });

  if (sendResult.ok) {
    await writeConversationHistory(config, message.chat.id, history, message.text, reply);
  }

  if (!sendResult.ok) {
    logger.error("Failed to send Telegram response", { route, event: "telegram_send_error", chatType, updateId, error: `${sendResult.error_code}:${sendResult.description}` });
  }

  return jsonOk();
}

async function processInstagramRequest(message: TelegramMessage, config: AppConfig, instagramUrl: string, updateId: number, chatType: string): Promise<void> {
  const route = "/telegram/webhook";
  try {
    const resolvedInstagramUrl = await resolveInstagramCanonicalUrl(instagramUrl);
    if (resolvedInstagramUrl !== instagramUrl) {
      logger.info("Resolved Instagram share URL", { route, event: "instagram_url_resolved", chatType, updateId, instagramUrl, resolvedInstagramUrl });
    }

    const media = await fetchInstagramMedia(resolvedInstagramUrl);
    if (!media) {
      logger.warn("Instagram media extraction failed", { route, event: "instagram_media_extract_failed", chatType, updateId, instagramUrl: resolvedInstagramUrl, originalInstagramUrl: instagramUrl });
      await sendMessage(config, { chat_id: message.chat.id, text: INSTAGRAM_FAILURE_TEXT, reply_to_message_id: message.message_id });
      return;
    }

    const binary = await fetchRemoteBinaryAsBase64(media.mediaUrl);
    if (!binary) {
      logger.warn("Instagram media binary fetch failed; trying Telegram URL fallback", { route, event: "instagram_binary_fetch_failed_trying_url_fallback", chatType, updateId, mediaType: media.mediaType, mediaUrl: media.mediaUrl });
      const sentByUrl = await sendInstagramMediaByUrl(message, config, media, updateId, chatType);
      if (sentByUrl) return;

      await sendMessage(config, { chat_id: message.chat.id, text: INSTAGRAM_BINARY_FAILURE_TEXT, reply_to_message_id: message.message_id });
      return;
    }

    if (media.mediaType === "video") {
      const sent = await sendVideo(config, {
        chatId: message.chat.id,
        videoBase64: binary.base64,
        mimeType: binary.mimeType,
        fileName: binary.fileName,
        caption: media.caption,
        replyToMessageId: message.message_id
      });
      if (!sent.ok) {
        logger.error("Failed to send Instagram video response; trying Telegram URL fallback", { route, event: "instagram_send_video_error_trying_url_fallback", chatType, updateId, mediaUrl: media.mediaUrl, error: `${sent.error_code}:${sent.description}` });
        const sentByUrl = await sendInstagramMediaByUrl(message, config, media, updateId, chatType);
        if (!sentByUrl) await sendMessage(config, { chat_id: message.chat.id, text: INSTAGRAM_SEND_FAILURE_TEXT, reply_to_message_id: message.message_id });
      }
      return;
    }

    const sent = await sendPhoto(config, {
      chat_id: message.chat.id,
      photoBase64: binary.base64,
      caption: media.caption,
      reply_to_message_id: message.message_id
    });
    if (!sent.ok) {
      logger.error("Failed to send Instagram image response; trying Telegram URL fallback", { route, event: "instagram_send_image_error_trying_url_fallback", chatType, updateId, mediaUrl: media.mediaUrl, error: `${sent.error_code}:${sent.description}` });
      const sentByUrl = await sendInstagramMediaByUrl(message, config, media, updateId, chatType);
      if (!sentByUrl) await sendMessage(config, { chat_id: message.chat.id, text: INSTAGRAM_SEND_FAILURE_TEXT, reply_to_message_id: message.message_id });
    }
  } catch (error) {
    logger.error("Unhandled instagram download error", { route, event: "instagram_download_error", chatType, updateId, error: error instanceof Error ? error.message : "unknown" });
    await sendMessage(config, { chat_id: message.chat.id, text: INSTAGRAM_FAILURE_TEXT, reply_to_message_id: message.message_id });
  }
}

async function sendInstagramMediaByUrl(message: TelegramMessage, config: AppConfig, media: { mediaType: "video" | "image"; mediaUrl: string; caption?: string }, updateId: number, chatType: string): Promise<boolean> {
  const route = "/telegram/webhook";

  if (media.mediaType === "video") {
    const sent = await sendVideo(config, {
      chatId: message.chat.id,
      videoUrl: media.mediaUrl,
      caption: media.caption,
      replyToMessageId: message.message_id
    });

    if (sent.ok) {
      logger.info("Sent Instagram video by URL fallback", { route, event: "instagram_send_video_url_fallback_ok", chatType, updateId });
      return true;
    }

    logger.error("Telegram URL fallback failed for Instagram video", { route, event: "instagram_send_video_url_fallback_error", chatType, updateId, mediaUrl: media.mediaUrl, error: `${sent.error_code}:${sent.description}` });
    return false;
  }

  const sent = await sendPhoto(config, {
    chat_id: message.chat.id,
    photoUrl: media.mediaUrl,
    caption: media.caption,
    reply_to_message_id: message.message_id
  });

  if (sent.ok) {
    logger.info("Sent Instagram image by URL fallback", { route, event: "instagram_send_image_url_fallback_ok", chatType, updateId });
    return true;
  }

  logger.error("Telegram URL fallback failed for Instagram image", { route, event: "instagram_send_image_url_fallback_error", chatType, updateId, mediaUrl: media.mediaUrl, error: `${sent.error_code}:${sent.description}` });
  return false;
}

async function processVideoRequest(message: TelegramMessage, config: AppConfig, updateId: number, chatType: string): Promise<void> {
  const route = "/telegram/webhook";
  try {
    const imageUrl = await resolveMessageImageUrl(config, message as any);
    const prompt = (message.text || (message as any).caption || "").trim() || "یک ویدیوی کوتاه بساز";
    const video = await generateVideoWithGrok(config, prompt, imageUrl || undefined);
    if (!video?.videoUrl) {
      await sendMessage(config, { chat_id: message.chat.id, text: VIDEO_FAILURE_TEXT, reply_to_message_id: message.message_id });
      return;
    }

    const videoSendResult = await sendVideo(config, {
      chatId: message.chat.id,
      videoUrl: video.videoUrl,
      caption: `${VIDEO_CAPTION_PREFIX}\n${video.aspectRatio}`,
      replyToMessageId: message.message_id
    });

    if (!videoSendResult.ok) {
      logger.error("Failed to send Telegram video response", { route, event: "telegram_send_video_error", chatType, updateId, error: `${videoSendResult.error_code}:${videoSendResult.description}` });
      await sendMessage(config, { chat_id: message.chat.id, text: "ویدیو ساخته شد ولی ارسالش به تلگرام خطا داد.", reply_to_message_id: message.message_id });
    }
  } catch (error) {
    logger.error("Unhandled grok video error", { route, event: "grok_video_error", chatType, updateId, error: error instanceof Error ? error.message : "unknown" });
    await sendMessage(config, { chat_id: message.chat.id, text: VIDEO_FAILURE_TEXT, reply_to_message_id: message.message_id });
  }
}

async function handleConnectCommand(message: TelegramMessage, config: AppConfig, env: any, workspaceId: string | null) {
  const token = (message.text ?? "").replace(/^\/connect\s+/, "").trim();
  if (!token || !workspaceId) {
    await sendMessage(config, { chat_id: message.chat.id, text: "فرمت درست: /connect <telegram_bot_token>", reply_to_message_id: message.message_id });
    return jsonOk();
  }

  const me = await getMeByToken(token);
  if (!me.ok || !me.result?.username) {
    await sendMessage(config, { chat_id: message.chat.id, text: "توکن ربات معتبر نیست.", reply_to_message_id: message.message_id });
    return jsonOk();
  }

  const normalizedUsername = me.result.username.toLowerCase();
  const bot = await upsertManagedTelegramBot(env, { workspaceId, telegramBotId: String(me.result.id), botUsername: normalizedUsername, botName: me.result.first_name, encryptedToken: token });
  await ensureDefaultAiProfile(env, { workspaceId, botId: bot.id, prompt: config.systemPrompt, model: config.openAiModel });

  const webhookResult = await setWebhookForToken(token, config.publicWebhookUrl, normalizedUsername, config.telegramWebhookSecret);
  const replyText = webhookResult.ok
    ? `ربات @${me.result.username} وصل شد.\nبرای تغییر پرامپت:\n/prompt @${me.result.username} تو یک دستیار حرفه‌ای فروش هستی`
    : `ربات ذخیره شد ولی ست‌کردن webhook خطا داد: ${webhookResult.description ?? "unknown_error"}`;

  await sendMessage(config, { chat_id: message.chat.id, text: replyText, reply_to_message_id: message.message_id });
  return jsonOk();
}

async function handlePromptCommand(message: TelegramMessage, config: AppConfig, env: any, workspaceId: string | null) {
  const raw = (message.text ?? "").replace(/^\/prompt\s+/, "").trim();
  if (!raw || !workspaceId) {
    await sendMessage(config, { chat_id: message.chat.id, text: "فرمت درست: /prompt @botusername متن پرامپت\nیا\n/prompt متن پرامپت", reply_to_message_id: message.message_id });
    return jsonOk();
  }

  const parts = raw.split(/\s+/);
  const maybeUsername = parts[0]?.startsWith("@") ? parts[0] : undefined;
  const prompt = maybeUsername ? raw.slice(maybeUsername.length).trim() : raw;
  const bot = await findWorkspaceBotByWorkspaceId(env, workspaceId, maybeUsername);

  if (!bot || !prompt) {
    await sendMessage(config, { chat_id: message.chat.id, text: "اول یک ربات وصل کن یا پرامپت معتبر بفرست.", reply_to_message_id: message.message_id });
    return jsonOk();
  }

  await ensureDefaultAiProfile(env, { workspaceId, botId: bot.id, prompt, model: config.openAiModel });
  await sendMessage(config, { chat_id: message.chat.id, text: `پرامپت ربات @${bot.bot_username} ذخیره شد.`, reply_to_message_id: message.message_id });
  return jsonOk();
}

async function handleMyBotsCommand(message: TelegramMessage, config: AppConfig, env: any, workspaceId: string | null) {
  if (!workspaceId) {
    await sendMessage(config, { chat_id: message.chat.id, text: "هنوز ورک‌اسپیس آماده نیست.", reply_to_message_id: message.message_id });
    return jsonOk();
  }

  const bot = await findWorkspaceBotByWorkspaceId(env, workspaceId);
  const text = bot ? `ربات فعال شما: @${bot.bot_username}\nبرای تغییر پرامپت:\n/prompt @${bot.bot_username} متن جدید` : "هنوز هیچ رباتی وصل نکردی.\n/connect <telegram_bot_token>";
  await sendMessage(config, { chat_id: message.chat.id, text, reply_to_message_id: message.message_id });
  return jsonOk();
}

async function buildRuntimeConfig(config: AppConfig, env: any, managedBotId: string | null, managedToken?: string, managedUsername?: string) {
  if (!managedBotId || !managedToken) return config;
  const aiProfile = await getDefaultAiProfileByBotId(env, managedBotId);
  return { ...config, telegramBotToken: managedToken, botUsername: managedUsername ?? config.botUsername, systemPrompt: aiProfile?.system_prompt ?? config.systemPrompt, openAiModel: aiProfile?.model ?? config.openAiModel };
}

function getManagedBotUsernameFromRequest(request: Request): string | undefined {
  const pathname = new URL(request.url).pathname.replace(/\/+$/, "");
  const prefix = "/telegram/webhook/";
  if (!pathname.startsWith(prefix)) return undefined;
  return pathname.slice(prefix.length).trim().toLowerCase() || undefined;
}

function extractFallbackInstagramUrl(text: string): string | null {
  const match = text.match(INSTAGRAM_FALLBACK_URL_REGEX);
  if (!match?.[0]) return null;

  try {
    const parsed = new URL(match[0]);
    if (!isSupportedInstagramPath(parsed.pathname)) return null;
    parsed.hash = "";
    return parsed.toString();
  } catch {
    return null;
  }
}

async function resolveInstagramCanonicalUrl(url: string): Promise<string> {
  try {
    const parsed = new URL(url);
    if (!/^\/share\//i.test(parsed.pathname)) return url;

    const response = await fetch(url, {
      method: "GET",
      redirect: "follow",
      headers: INSTAGRAM_RESOLVE_HEADERS
    });

    const resolvedUrl = response.url;
    if (!resolvedUrl || resolvedUrl === url) return url;

    const resolved = new URL(resolvedUrl);
    if (!/instagram\.com$/i.test(resolved.hostname.replace(/^www\./i, ""))) return url;
    if (!isSupportedInstagramPath(resolved.pathname)) return url;

    resolved.hash = "";
    return resolved.toString();
  } catch {
    return url;
  }
}

function isSupportedInstagramPath(pathname: string): boolean {
  return /^\/(p|reel|reels|tv|share)\//i.test(pathname);
}

async function resolveMessageImageUrl(config: AppConfig, message: any): Promise<string | null> {
  const directPhotos = Array.isArray(message.photo) ? message.photo : [];
  const replyPhotos = Array.isArray(message.reply_to_message?.photo) ? message.reply_to_message.photo : [];
  const allPhotos = (directPhotos.length ? directPhotos : replyPhotos) as Array<{ file_id?: string }>;
  const fileId = allPhotos[allPhotos.length - 1]?.file_id;
  if (!fileId) return null;
  return getTelegramFileUrl(config, fileId);
}
