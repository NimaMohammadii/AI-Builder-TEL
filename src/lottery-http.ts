import type { Env } from './types';
import { gameBotToken, validateTelegramInitData } from './utils';
import { LOTTERY_NEXT_ROUND_DELAY_MS, buyLotteryTickets, getLotteryUserState, listLotteryTickets } from './lottery';
import { LOTTERY_WINNER_COUNT, getLotteryPrizes, getLotteryWinners, userWonLotteryRound } from './lottery-prizes';
import { publishLiveActivity } from './live-activity';

type LotteryTicketWeightRow = {
  user_id: string;
  ticket_count: number;
};

export async function handleLotteryRequest(request: Request, env: Env): Promise<Response | null> {
  const url = new URL(request.url);
  if (!url.pathname.startsWith('/app/api/lottery/')) return null;

  try {
    if (request.method === 'GET' && url.pathname === '/app/api/lottery/state') {
      const serverStartedAtMs = Date.now();
      const userId = await authenticatedUser(request, env);
      const state = await getLotteryUserState(env, userId);
      const roundStatsQuery = state.round
        ? env.DB.prepare(`SELECT COUNT(*) AS count, COALESCE(SUM(price_nano),0) AS prize_pool_nano
            FROM lottery_tickets WHERE round_id=?`).bind(state.round.id).first<{ count: number; prize_pool_nano: number }>()
        : Promise.resolve(null);
      const winChanceQuery = state.round?.status === 'open'
        ? lotteryWinChancePercent(env, state.round.id, userId)
        : Promise.resolve(0);
      const [lastDrawWon, roundStatsRow, winChancePercent] = await Promise.all([
        userWonLotteryRound(env, userId, state.lastDraw?.roundId),
        roundStatsQuery,
        winChanceQuery,
      ]);
      const roundTicketCount = Math.max(0, Math.floor(Number(roundStatsRow?.count || 0)));
      const prizePoolNano = Math.max(0, Math.floor(Number(roundStatsRow?.prize_pool_nano || 0)));
      const prizes = await getLotteryPrizes(env, prizePoolNano);
      const serverNowMs = Date.now();
      return json({ ok: true, serverStartedAtMs, serverNowMs, winnerCount: LOTTERY_WINNER_COUNT, ...state, roundTicketCount, prizePoolNano, prizes, lastDrawWon, winChancePercent });
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
      const poolQuery = round
        ? env.DB.prepare(`SELECT COALESCE(SUM(price_nano),0) AS prize_pool_nano FROM lottery_tickets WHERE round_id=?`)
          .bind(round.id).first<{ prize_pool_nano: number }>()
        : Promise.resolve(null);
      const [winners, poolRow] = await Promise.all([
        roundId ? getLotteryWinners(env, roundId) : Promise.resolve([]),
        poolQuery,
      ]);
      const prizes = await getLotteryPrizes(env, poolRow?.prize_pool_nano);
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
        winnerCount: LOTTERY_WINNER_COUNT,
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
      const poolRow = await env.DB.prepare(`SELECT COALESCE(SUM(price_nano),0) AS prize_pool_nano
        FROM lottery_tickets WHERE round_id=?`).bind(result.round.id).first<{ prize_pool_nano: number }>();
      const prizePoolNano = Math.max(0, Math.floor(Number(poolRow?.prize_pool_nano || 0)));
      await publishLiveActivity(env, {
        kind: 'ticket',
        userId,
        amountNano: result.paidNano,
        quantity: result.tickets.length,
        section: 'home',
        roundId: result.round.id,
        prizePoolNano,
        key: String(body.purchaseId || result.tickets[0]?.id || ''),
        createdAt: result.tickets[0]?.createdAt,
      }).catch((error) => console.warn('ticket live activity failed', error));
      return json({ ok: true, serverNowMs: Date.now(), prizePoolNano, ...result });
    }

    return json({ error: 'Lottery endpoint not found' }, 404);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Lottery request failed';
    const authError = /telegram|init data|unauthorized|auth/i.test(message);
    return json({ error: message }, authError ? 401 : 400);
  }
}

async function lotteryWinChancePercent(env: Env, roundIdInput: unknown, userIdInput: unknown): Promise<number> {
  const roundId = String(roundIdInput || '').trim();
  const userId = String(userIdInput || '').trim();
  if (!roundId || !userId) return 0;

  const rows = await env.DB.prepare(`SELECT user_id, COUNT(*) AS ticket_count
    FROM lottery_tickets
    WHERE round_id=?
    GROUP BY user_id`).bind(roundId).all<LotteryTicketWeightRow>();
  const weights = (rows.results || [])
    .map((row) => ({ userId: String(row.user_id || ''), weight: Math.max(0, Math.floor(Number(row.ticket_count) || 0)) }))
    .filter((row) => row.userId && row.weight > 0);
  if (!weights.length) return 0;

  const target = weights.find((row) => row.userId === userId);
  if (!target) return 0;
  const total = weights.reduce((sum, row) => sum + row.weight, 0);
  if (total <= 0) return 0;

  const winnerSlots = Math.min(LOTTERY_WINNER_COUNT, weights.length);
  let probability = target.weight / total;
  if (winnerSlots >= 2) {
    for (const first of weights) {
      if (first.userId === userId) continue;
      const afterFirst = total - first.weight;
      if (afterFirst <= 0) continue;
      probability += (first.weight / total) * (target.weight / afterFirst);
    }
  }
  if (winnerSlots >= 3) {
    for (const first of weights) {
      if (first.userId === userId) continue;
      const afterFirst = total - first.weight;
      if (afterFirst <= 0) continue;
      const firstProbability = first.weight / total;
      for (const second of weights) {
        if (second.userId === userId || second.userId === first.userId) continue;
        const afterSecond = afterFirst - second.weight;
        if (afterSecond <= 0) continue;
        probability += firstProbability * (second.weight / afterFirst) * (target.weight / afterSecond);
      }
    }
  }

  return Number((Math.max(0, Math.min(1, probability)) * 100).toFixed(6));
}

async function authenticatedUser(request: Request, env: Env): Promise<string> {
  const url = new URL(request.url);
  const initData = request.headers.get('x-telegram-init-data') || url.searchParams.get('initData') || '';
  return validateTelegramInitData(initData, gameBotToken(env));
}

function json(value: unknown, status = 200): Response {
  return Response.json(value, { status, headers: { 'cache-control': 'no-store' } });
}
