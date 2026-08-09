import type { Env } from './types';
import { gameBotToken, validateTelegramInitData } from './utils';
import { buyLotteryTickets, getLotteryUserState, listLotteryTickets } from './lottery';

export async function handleLotteryRequest(request: Request, env: Env): Promise<Response | null> {
  const url = new URL(request.url);
  if (!url.pathname.startsWith('/app/api/lottery/')) return null;

  try {
    if (request.method === 'GET' && url.pathname === '/app/api/lottery/state') {
      const userId = await authenticatedUser(request, env);
      const serverNowMs = Date.now();
      const state = await getLotteryUserState(env, userId);
      const lastDrawWon = await userWonDraw(env, userId, state.lastDraw?.roundId, state.lastDraw?.winningCode);
      return json({ ok: true, serverNowMs, ...state, lastDrawWon });
    }

    if (request.method === 'GET' && url.pathname === '/app/api/lottery/tickets') {
      const userId = await authenticatedUser(request, env);
      const state = await getLotteryUserState(env, userId);
      const tickets = await listLotteryTickets(env, userId, state.round?.id, 250);
      return json({ ok: true, serverNowMs: Date.now(), round: state.round, ticketCount: tickets.length, tickets });
    }

    if (request.method === 'POST' && url.pathname === '/app/api/lottery/tickets') {
      const body = await request.json().catch(() => ({})) as { initData?: unknown; quantity?: unknown; purchaseId?: unknown };
      const userId = await validateTelegramInitData(body.initData, gameBotToken(env));
      const result = await buyLotteryTickets(env, userId, body.quantity, body.purchaseId);
      return json({ ok: true, serverNowMs: Date.now(), ...result });
    }

    return json({ error: 'Lottery endpoint not found' }, 404);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Lottery request failed';
    const authError = /telegram|init data|unauthorized|auth/i.test(message);
    return json({ error: message }, authError ? 401 : 400);
  }
}

async function userWonDraw(env: Env, userId: string, roundId: unknown, winningCode: unknown): Promise<boolean> {
  const round = String(roundId || '').trim();
  const code = String(winningCode || '').replace(/[^0-9]/g, '').slice(-5).padStart(5, '0');
  if (!round || !/^\d{5}$/.test(code)) return false;
  const ticket = await env.DB.prepare(`SELECT id FROM lottery_tickets
    WHERE user_id=? AND round_id=?
      AND COALESCE(NULLIF(ticket_code,''),substr(ticket_number,-5))=?
    LIMIT 1`)
    .bind(userId, round, code)
    .first<{ id: string }>();
  return Boolean(ticket?.id);
}

async function authenticatedUser(request: Request, env: Env): Promise<string> {
  const url = new URL(request.url);
  const initData = request.headers.get('x-telegram-init-data') || url.searchParams.get('initData') || '';
  return validateTelegramInitData(initData, gameBotToken(env));
}

function json(value: unknown, status = 200): Response {
  return Response.json(value, { status, headers: { 'cache-control': 'no-store' } });
}
