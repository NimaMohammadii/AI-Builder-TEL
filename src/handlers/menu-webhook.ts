import type { AppConfig, Env } from "../types/env";
import { handleTelegramWebhook } from "./telegram-webhook";
import { parseUpdate, verifyTelegramWebhookSecret } from "../lib/telegram";
import { answerCallback, editUiMessage, sendUiMessage } from "../lib/telegram-ui";
import { buildBuilderKeyboard, buildConnectInlineKeyboard, buildMainMenuKeyboard, BUILDER_DONE_TEXT, BUILDER_START_TEXT, isBuilderDoneRequest, isBuilderStartRequest, isConnectRequest, isMainMenuRequest, MAIN_MENU_TEXT } from "../lib/bot-main-menu";
import { endBuilderSession, isBuilderSessionActive, startBuilderSession } from "../lib/builder-session";
import { deactivateWorkspaceBot, formatConnectPanel, getConnectPanelStatus, setAiEnabled } from "../repositories/connect-panel";
import { findWorkspaceBotByUsername, findWorkspaceBotByWorkspaceId } from "../repositories/telegram-bots";
import { upsertTelegramUser } from "../repositories/users";
import { ensureWorkspaceForUser } from "../repositories/workspaces";
import { applyNoCodeBuild, formatNoCodeBuildResult } from "../lib/no-code-builder";
import { handleBuiltBotRuntime } from "./built-bot-runtime";

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

  const managedBot = await resolveManagedBotFromRequest(request, env);
  if (managedBot) {
    const runtimeConfig = { ...config, telegramBotToken: managedBot.encrypted_token, botUsername: managedBot.bot_username };
    const handledRuntime = await handleBuiltBotRuntime(message, runtimeConfig, env, managedBot.id, text);
    if (handledRuntime) return true;
  }

  if (isMainMenuRequest(text)) {
    await sendUiMessage(config, { chatId: message.chat.id, text: MAIN_MENU_TEXT, replyToMessageId: message.message_id, replyMarkup: buildMainMenuKeyboard() });
    return true;
  }

  if (isConnectRequest(text)) {
    const workspaceId = await resolveWorkspaceId(env, message);
    const status = workspaceId ? await getConnectPanelStatus(env, workspaceId) : { hasBot: false, aiEnabled: false };
    await sendUiMessage(config, { chatId: message.chat.id, text: formatConnectPanel(status), replyToMessageId: message.message_id, replyMarkup: buildConnectInlineKeyboard() });
    return true;
  }

  if (isBuilderStartRequest(text)) {
    await startBuilderSession(config, message.chat.id, env);
    await sendUiMessage(config, { chatId: message.chat.id, text: BUILDER_START_TEXT, replyToMessageId: message.message_id, replyMarkup: buildBuilderKeyboard() });
    return true;
  }

  if (isBuilderDoneRequest(text)) {
    await endBuilderSession(config, message.chat.id, env);
    await sendUiMessage(config, { chatId: message.chat.id, text: `${BUILDER_DONE_TEXT}\n\n${MAIN_MENU_TEXT}`, replyToMessageId: message.message_id, replyMarkup: buildMainMenuKeyboard() });
    return true;
  }

  if (await isBuilderSessionActive(config, message.chat.id, env)) {
    const workspaceId = await resolveWorkspaceId(env, message);
    const bot = workspaceId ? await findWorkspaceBotByWorkspaceId(env, workspaceId) : null;
    if (workspaceId && bot) {
      const result = await applyNoCodeBuild({
        env,
        config,
        workspaceId,
        botId: bot.id,
        botToken: bot.encrypted_token,
        text
      });
      await sendUiMessage(config, { chatId: message.chat.id, text: formatNoCodeBuildResult(result), replyToMessageId: message.message_id, replyMarkup: buildBuilderKeyboard() });
    } else {
      await sendUiMessage(config, { chatId: message.chat.id, text: "برای ساخت و اعمال تغییرات، اول از بخش کانکت یک ربات وصل کن.\n\nاگر توکن داری اینطوری بفرست:\n/connect <telegram_bot_token>", replyToMessageId: message.message_id, replyMarkup: buildBuilderKeyboard() });
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

async function resolveWorkspaceId(env: Env, message: any): Promise<string | null> {
  const existing = await resolveWorkspaceIdFromChat(env, message.chat.id);
  if (existing) return existing;
  if (!message.from?.id) return null;

  const user = await upsertTelegramUser(env, {
    telegramUserId: message.from.id,
    username: message.from.username,
    firstName: message.from.first_name,
    lastName: message.from.last_name
  });
  const workspace = await ensureWorkspaceForUser(env, {
    userId: user.id,
    username: message.from.username,
    firstName: message.from.first_name
  });
  return workspace.id;
}

async function resolveWorkspaceIdFromChat(env: Env, telegramChatId: number): Promise<string | null> {
  const db = env.DB;
  if (!db) return null;
  const row = await db.prepare(`SELECT workspace_id FROM telegram_chats WHERE telegram_chat_id = ? ORDER BY updated_at DESC LIMIT 1`).bind(telegramChatId).first<{ workspace_id: string }>();
  return row?.workspace_id ?? null;
}

async function resolveManagedBotFromRequest(request: Request, env: Env) {
  const pathname = new URL(request.url).pathname.replace(/\/+$/, "");
  const prefix = "/telegram/webhook/";
  if (!pathname.startsWith(prefix)) return null;
  const username = pathname.slice(prefix.length).trim().toLowerCase();
  if (!username) return null;
  return findWorkspaceBotByUsername(env, username);
}
