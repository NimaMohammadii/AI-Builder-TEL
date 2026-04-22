import { getConfig, type Env } from "./config";
import { logger } from "./lib/logger";
import { routeRequest } from "./lib/router";

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    try {
      const config = getConfig(env);
      return await routeRequest(request, config);
    } catch (error) {
      logger.error("Unhandled worker error", {
        route: new URL(request.url).pathname,
        event: "unhandled_exception",
        error: error instanceof Error ? error.message : "unknown"
      });

      return Response.json(
        {
          ok: false,
          error: "internal_error"
        },
        { status: 500 }
      );
    }
  }
};
