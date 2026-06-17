import type { Env } from './types';

type RouteApp = {
  get: (path: string, handler: (c: RouteContext) => Promise<Response> | Response) => unknown;
  post: (path: string, handler: (c: RouteContext) => Promise<Response> | Response) => unknown;
};

type RouteContext = {
  env: Env & { ELEVENLABS_API_KEY?: string };
  req: {
    json: () => Promise<unknown>;
    header: (name: string) => string | undefined;
    param: (name: string) => string;
  };
  json: (data: unknown, status?: number, headers?: Record<string, string>) => Response;
  text: (text: string, status?: number, headers?: Record<string, string>) => Response;
};

export function registerVexaVoiceMessageRoutes(app: RouteApp): void {
  app.get('/admin/api/vexa-voice/health', (c) => c.json({ ok: true, feature: 'vexa_voice_messages' }, 200, { 'cache-control': 'no-store' }));
}
