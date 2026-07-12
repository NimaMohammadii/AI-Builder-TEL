import './miniapp-voice-ai-routes';
import './vexa-voice-message-routes';
import './deposit-method-icon-routes';
import './withdrawal-admin-routes';
import app from './index-with-fragment-detail-polish';
import { REWARDS_LIVE_WINNERS_EFFECTS } from './miniapp/rewards-live-winners-effects';

export { SectionLockEvents } from './section-lock-events';
export { PlinkoLiveRoom } from './plinko-live';

export class GhostRunLiveRoom {
  async fetch(): Promise<Response> {
    return new Response(JSON.stringify({ error: 'Ghost Run live room not configured.' }), {
      status: 404,
      headers: { 'content-type': 'application/json' }
    });
  }
}

export default {
  async fetch(request: Request, env: unknown, ctx: ExecutionContext): Promise<Response> {
    const response = await app.fetch(request, env as never, ctx);
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('text/html')) return response;
    const html = await response.text();
    const headers = new Headers(response.headers);
    headers.delete('content-length');
    headers.set('cache-control', 'no-store');
    return new Response(html.replace('</body>', `${REWARDS_LIVE_WINNERS_EFFECTS}</body>`), {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  },
};
