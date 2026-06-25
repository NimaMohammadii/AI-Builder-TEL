import './miniapp-voice-ai-routes';
import './vexa-voice-message-routes';
import './deposit-method-icon-routes';
import './withdrawal-admin-routes';

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

export { default } from './index-with-fragment-detail-polish';