import type { AppConfig } from "../config";
import { handleDeleteWebhook, handleSetWebhook, isAuthorizedDebugRequest } from "../handlers/debug";
import { handleHealth, handleRoot } from "../handlers/health";
import { handleTelegramWebhook } from "../handlers/webhook";
import { logger } from "./logger";

export async function routeRequest(request: Request, config: AppConfig): Promise<Response> {
  const url = new URL(request.url);
  const route = url.pathname;

  if (request.method === "GET" && route === "/") {
    return handleRoot();
  }

  if (request.method === "GET" && route === "/health") {
    return handleHealth();
  }

  if (request.method === "POST" && route === "/telegram/webhook") {
    return handleTelegramWebhook(request, config);
  }

  if (request.method === "POST" && route === "/debug/set-webhook") {
    if (!isAuthorizedDebugRequest(request, config.adminDebugToken)) {
      return Response.json({ ok: false, error: "unauthorized" }, { status: 401 });
    }

    return handleSetWebhook(config);
  }

  if (request.method === "POST" && route === "/debug/delete-webhook") {
    if (!isAuthorizedDebugRequest(request, config.adminDebugToken)) {
      return Response.json({ ok: false, error: "unauthorized" }, { status: 401 });
    }

    return handleDeleteWebhook(config);
  }

  logger.warn("Route not found", { route, event: "not_found" });
  return Response.json({ ok: false, error: "not_found" }, { status: 404 });
}
