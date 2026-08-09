import type { Env } from './types';
import { gameBotToken, validateTelegramInitData } from './utils';
import { LOTTERY_NEXT_ROUND_DELAY_MS, buyLotteryTickets, getLotteryUserState, listLotteryTickets } from './lottery';
import { getLotteryPrizes, getLotteryWinners, userWonLotteryRound } from './lottery-prizes';

export async function handleLotteryRequest(request: Request, env: Env): Promise<Response | null> {
  const url = new URL(request.url);
  if (!url.pathname.startsWith('/app/api/lottery/')) return null;

  try {
    if (request.method === 'GET' && url.pathname === '/app/api/lottery/state') {
      const userId = await authenticatedUser(request, env);
      const serverNowMs = Date.now();
      const state = await getLotteryUserState(env, userId);
      const [lastDrawWon, prizes] = await Promise.all([
        userWonLotteryRound(env, userId, state.lastDraw?.roundId),
        getLotteryPrizes(env),
      ]);
      return json({ ok: true, serverNowMs, ...state, prizes, lastDrawWon });
    }

    if (request.method === 'GET' && url.pathname === '/app/api/lottery/winners') {
      const userId = await authenticatedUser(request, env);
      const state = await getLotteryUserState(env, userId);
      const serverNowMs = Date.now();
      const round = state.round;
      const drawAtMs = Date.parse(String(round?.drawAt || ''));
      const nextRoundStartsAtMs = Date.parse(String(round?.nextRoundStartsAt || ''));
      const previousWinnersAtMs = Number.isFinite(nextRoundStartsAtMs)
        ? nextRoundStartsAtMs - LOTTERY_NEXT_ROUND_DELAY_MS
        : 0;
      const waitingForWinner = Boolean(
        round?.status === 'closed'
        && previousWinnersAtMs > serverNowMs,
      );
      const roundId = waitingForWinner ? '' : (state.lastDraw?.roundId || '');
      const [winners, prizes] = await Promise.all([
        roundId ? getLotteryWinners(env, roundId) : Promise.resolve([]),
        getLotteryPrizes(env),
      ]);
      const nextDisplayChangeAtMs = waitingForWinner
        ? previousWinnersAtMs
        : round?.status === 'open' && Number.isFinite(drawAtMs) && drawAtMs > serverNowMs
          ? drawAtMs
          : Number.isFinite(nextRoundStartsAtMs) && nextRoundStartsAtMs > serverNowMs
            ? nextRoundStartsAtMs
            : 0;
      return json({
        ok: true,
        serverNowMs,
        roundId,
        waitingForWinner,
        winnerView: waitingForWinner ? 'waiting' : 'previous',
        nextDisplayChangeAtMs,
        winners,
        prizes,
      });
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

async function authenticatedUser(request: Request, env: Env): Promise<string> {
  const url = new URL(request.url);
  const initData = request.headers.get('x-telegram-init-data') || url.searchParams.get('initData') || '';
  return validateTelegramInitData(initData, gameBotToken(env));
}

function json(value: unknown, status = 200): Response {
  return Response.json(value, { status, headers: { 'cache-control': 'no-store' } });
}
