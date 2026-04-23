import { loadConfig } from "./config/env";
import { handleSetWebhook, handleDeleteWebhook, isAuthorizedDebugRequest } from "./handlers/debug";
import { handleHealth, handleRoot } from "./handlers/health";
import { handleTelegramWebhook } from "./handlers/telegram-webhook";
import { logger } from "./lib/logger";
import type { Env } from "./types/env";
import { jsonError } from "./utils/http";

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const route = new URL(request.url).pathname;

    try {
      const config = loadConfig(env);

      if (request.method === "GET" && route === "/") {
        return handleRoot();
      }

      if (request.method === "GET" && route === "/health") {
        return handleHealth();
      }

      if (request.method === "POST" && route.startsWith("/telegram/webhook")) {
        return handleTelegramWebhook(request, config, env, ctx);
      }

      if (request.method === "POST" && route === "/debug/set-webhook") {
        if (!isAuthorizedDebugRequest(request, config.adminDebugToken)) {
          return jsonError("unauthorized", 401);
        }

        return handleSetWebhook(config);
      }

      if (request.method === "POST" && route === "/debug/delete-webhook") {
        if (!isAuthorizedDebugRequest(request, config.adminDebugToken)) {
          return jsonError("unauthorized", 401);
        }

        return handleDeleteWebhook(config);
      }

      logger.warn("Route not found", { route, event: "not_found" });
      return jsonError("not_found", 404);
    } catch (error) {
      logger.error("Unhandled worker error", {
        route,
        event: "unhandled_exception",
        error: error instanceof Error ? error.message : "unknown"
      });

      return jsonError("internal_error", 500);
    }
  }
};
