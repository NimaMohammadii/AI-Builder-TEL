import type { AppConfig, Env } from "../types/env";
import { handleTelegramWebhook } from "./telegram-webhook";
import { parseUpdate, verifyTelegramWebhookSecret } from "../lib/telegram";
import { answerCallback, editUiMessage, sendUiMessage } from "../lib/telegram-ui";
import { buildBuilderKeyboard, buildConnectInlineKeyboard, buildMainMenuKeyboard, BUILDER_DONE_TEXT, BUILDER_START_TEXT, isBuilderDoneRequest, isBuilderStartRequest, isConnectRequest, isMainMenuRequest, MAIN_MENU_TEXT } from "../lib/bot-main-menu";
import { endBuilderSession, isBuilderSessionActive, startBuilderSession } from "../lib/builder-session";
import { deactivateWorkspaceBot, formatConnectPanel, getConnectPanelStatus, setAiEnabled } from "../repositories/connect-panel";
import { ensureDefaultAiProfile } from "../repositories/ai-profiles";
import { findWorkspaceBotByWorkspaceId } from "../repositories/telegram-bots";

export async function handleMenuAwareTelegramWebhook(request: Request, config: AppConfig, env: Env, ctx?: ExecutionContext): Promise<Response> {
  const handled = await tryHandleMenu(request.clone(), config, env);
  if (handled) return new Response(JSON.stringify({ ok: true }), { headers: { "content-type": "application/json" } });
  return handleTelegramWebhook(request, config, env, ctx);
}

async function tryHandleMenu(request: Request, config: AppConfig, env: Env): Promise<boolean> {
  if (!verifyTelegramWebhookSecret(request, config.telegramWebhookSecret)) return false;
  if (!request.headers.get("content-type")?.includes("application/json")) return false;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return false;
  }

  const update = parseUpdate(body) as any;
  const callback = update?.callback_query;
  if (callback) return handleConnectCallback(callback, config, env);

  const message = update?.message ?? update?.edited_message;
  const text = message?.text || (message as any)?.caption || "";
  if (!message || !text) return false;

  if (isMainMenuRequest(text)) {
    await sendUiMessage(config, { chatId: message.chat.id, text: MAIN_MENU_TEXT, replyToMessageId: message.message_id, replyMarkup: buildMainMenuKeyboard() });
    return true;
  }

  if (isConnectRequest(text)) {
    const workspaceId = await resolveWorkspaceIdFromChat(env, message.chat.id);
    const status = workspaceId ? await getConnectPanelStatus(env, workspaceId) : { hasBot: false, aiEnabled: false };
    await sendUiMessage(config, { chatId: message.chat.id, text: formatConnectPanel(status), replyToMessageId: message.message_id, replyMarkup: buildConnectInlineKeyboard() });
    return true;
  }

  if (isBuilderStartRequest(text)) {
    await startBuilderSession(config, message.chat.id);
    await sendUiMessage(config, { chatId: message.chat.id, text: BUILDER_START_TEXT, replyToMessageId: message.message_id, replyMarkup: buildBuilderKeyboard() });
    return true;
  }

  if (isBuilderDoneRequest(text)) {
    await endBuilderSession(config, message.chat.id);
    await sendUiMessage(config, { chatId: message.chat.id, text: `${BUILDER_DONE_TEXT}\n\n${MAIN_MENU_TEXT}`, replyToMessageId: message.message_id, replyMarkup: buildMainMenuKeyboard() });
    return true;
  }

  if (await isBuilderSessionActive(config, message.chat.id)) {
    const workspaceId = await resolveWorkspaceIdFromChat(env, message.chat.id);
    const bot = workspaceId ? await findWorkspaceBotByWorkspaceId(env, workspaceId) : null;
    if (workspaceId && bot) {
      const prompt = buildNoCodePrompt(text);
      await ensureDefaultAiProfile(env, { workspaceId, botId: bot.id, prompt, model: config.openAiModel });
      await sendUiMessage(config, { chatId: message.chat.id, text: "✅ تغییر روی ربات اعمال شد.\n\nهر دستور دیگه‌ای داری بنویس، یا برای خروج «اتمام ساخت» رو بزن.", replyToMessageId: message.message_id, replyMarkup: buildBuilderKeyboard() });
    } else {
      await sendUiMessage(config, { chatId: message.chat.id, text: "برای ساخت و اعمال تغییرات، اول از بخش کانکت یک ربات وصل کن.", replyToMessageId: message.message_id, replyMarkup: buildBuilderKeyboard() });
    }
    return true;
  }

  return false;
}

async function handleConnectCallback(callback: any, config: AppConfig, env: Env): Promise<boolean> {
  const data = String(callback.data ?? "");
  const chatId = callback.message?.chat?.id;
  const messageId = callback.message?.message_id;
  if (!chatId || !messageId || !data.startsWith("connect:")) return false;

  const workspaceId = await resolveWorkspaceIdFromChat(env, chatId);
  if (!workspaceId) {
    await answerCallback(config, callback.id, "Workspace not found");
    return true;
  }

  if (data === "connect:toggle_ai") {
    const current = await getConnectPanelStatus(env, workspaceId);
    await setAiEnabled(env, workspaceId, !current.aiEnabled);
    await answerCallback(config, callback.id, current.aiEnabled ? "AI disabled" : "AI enabled");
  } else if (data === "connect:delete_bot") {
    await deactivateWorkspaceBot(env, workspaceId);
    await answerCallback(config, callback.id, "Bot removed");
  } else {
    await answerCallback(config, callback.id, "Updated");
  }

  const status = await getConnectPanelStatus(env, workspaceId);
  await editUiMessage(config, { chatId, messageId, text: formatConnectPanel(status), replyMarkup: buildConnectInlineKeyboard() });
  return true;
}

async function resolveWorkspaceIdFromChat(env: Env, telegramChatId: number): Promise<string | null> {
  const db = env.DB;
  if (!db) return null;
  const row = await db.prepare(`SELECT workspace_id FROM telegram_chats WHERE telegram_chat_id = ? ORDER BY updated_at DESC LIMIT 1`).bind(telegramChatId).first<{ workspace_id: string }>();
  return row?.workspace_id ?? null;
}

function buildNoCodePrompt(userInstruction: string): string {
  return [
    "تو یک AI حرفه‌ای برای ربات تلگرام این کاربر هستی.",
    "هر چیزی که کاربر در حالت ساخت بدون کدنویسی گفته باید به رفتار واقعی ربات تبدیل شود.",
    "پاسخ‌ها کوتاه، دقیق، کاربردی و مطابق دستور کاربر باشند.",
    "دستور فعلی کاربر:",
    userInstruction
  ].join("\n");
}
