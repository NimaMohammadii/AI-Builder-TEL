import app from './index';
import { ensureCrashVirtualColumns, getCrashLiveRoundId, getCrashRoundState, getCrashTargetDelayMs, revealCrashVirtualCashouts, seedCrashVirtualUsers } from './crash-virtual-users';

const CACHE_NONE = 'no-store';
const NANO = 1000000000;
const MIN_BET_NANO = 10000000;
const WAIT_WINDOW_MS = 9600;

type Row = { round_id:number; user_id:string; username:string; amount_nano:number; status:string; cashout_multiplier:number|null; payout_nano:number; is_virtual?:number; target_cashout_multiplier?:number|null; virtual_reveal_at_ms?:number; virtual_order?:number; created_at:string; updated_at:string };

app.get('/app/api/crash-live', async (c) => {
  await ensure(c.env);
  const state = getCrashRoundState(Date.now());
  const now = Date.now();
  const requestedRoundId = Number(c.req.query('roundId'));
  const roundId = Number.isFinite(requestedRoundId) && requestedRoundId > 0 ? Math.floor(requestedRoundId) : getCrashLiveRoundId(state);
  const revealStartMs = roundId > state.id ? state.start + state.runMs + 400 : now;
  const revealEndMs = roundId > state.id ? state.start + state.runMs + WAIT_WINDOW_MS : now;
  await seedCrashVirtualUsers(c.env.DB, roundId, revealStartMs, revealEndMs);
  await revealCrashVirtualCashouts(c.env.DB, roundId, state);
  if(roundId===state.id && state.waiting){
    await c.env.DB.prepare("UPDATE crash_live_bets SET status='crashed', updated_at=CURRENT_TIMESTAMP WHERE round_id=? AND status='bet'").bind(roundId).run().catch(() => undefined);
  }
  await c.env.DB.prepare("UPDATE crash_live_bets SET status='crashed', updated_at=CURRENT_TIMESTAMP WHERE round_id < ? AND status='bet'").bind(roundId).run().catch(() => undefined);
  const rows = await c.env.DB.prepare("SELECT * FROM crash_live_bets WHERE round_id=? AND (is_virtual=0 OR COALESCE(virtual_reveal_at_ms,0)<=?) ORDER BY CASE WHEN status='bet' THEN 0 WHEN status='cashout' THEN 1 ELSE 2 END ASC, COALESCE(virtual_order,0) ASC, datetime(created_at) ASC, datetime(updated_at) DESC LIMIT 120").bind(roundId,now).all<Row>();
  const bets = (rows.results || []).map(json);
  const totalNano = bets.reduce((s,b)=>s+Number(b.amountNano||0),0);
  const nextReveal = await nextVirtualRevealMs(c.env.DB, roundId, now);
  const nextSyncMs = nextLiveSyncMs(state, bets, nextReveal, now);
  return c.json({ok:true,roundId,totalNano,totalTon:ton(totalNano),state,nextSyncMs,bets},200,{'cache-control':CACHE_NONE});
});

app.post('/app/api/crash-live/bet', async (c) => {
  await ensure(c.env);
  const b = await c.req.json().catch(()=>({})) as Record<string,unknown>;
  const state = getCrashRoundState(Date.now());
  const roundId = rid(b.roundId ?? betRoundId(state)), userId = uid(b.userId), username = name(b.username,userId), amountNano = amt(b.amountNano);
  await c.env.DB.prepare("INSERT INTO crash_live_bets(round_id,user_id,username,amount_nano,status,cashout_multiplier,payout_nano,is_virtual,created_at,updated_at) VALUES(?,?,?,?, 'bet', NULL, 0, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) ON CONFLICT(round_id,user_id) DO UPDATE SET username=excluded.username, amount_nano=excluded.amount_nano, status='bet', cashout_multiplier=NULL, payout_nano=0, is_virtual=0, updated_at=CURRENT_TIMESTAMP").bind(roundId,userId,username,amountNano).run();
  return c.json({ok:true,roundId},200,{'cache-control':CACHE_NONE});
});

app.post('/app/api/crash-live/cashout', async (c) => {
  await ensure(c.env);
  const b = await c.req.json().catch(()=>({})) as Record<string,unknown>;
  const roundId = rid(b.roundId), userId = uid(b.userId), m = mult(b.multiplier);
  const row = await c.env.DB.prepare('SELECT * FROM crash_live_bets WHERE round_id=? AND user_id=? AND is_virtual=0').bind(roundId,userId).first<Row>();
  if(!row)return c.json({ok:false,error:'Bet not found'},404,{'cache-control':CACHE_NONE});
  const payout = Math.max(0, Math.floor(Number(row.amount_nano||0)*m));
  await c.env.DB.prepare("UPDATE crash_live_bets SET status='cashout', cashout_multiplier=?, payout_nano=?, updated_at=CURRENT_TIMESTAMP WHERE round_id=? AND user_id=? AND is_virtual=0").bind(m,payout,roundId,userId).run();
  return c.json({ok:true,roundId,payoutNano:payout,payoutTon:ton(payout)},200,{'cache-control':CACHE_NONE});
});

app.post('/app/api/crash-live/crash', async (c) => {
  await ensure(c.env);
  const b = await c.req.json().catch(()=>({})) as Record<string,unknown>;
  await c.env.DB.prepare("UPDATE crash_live_bets SET status='crashed', updated_at=CURRENT_TIMESTAMP WHERE round_id=? AND user_id=? AND status='bet' AND is_virtual=0").bind(rid(b.roundId),uid(b.userId)).run();
  return c.json({ok:true},200,{'cache-control':CACHE_NONE});
});

async function ensure(env:{DB:D1Database}){
  await env.DB.prepare('CREATE TABLE IF NOT EXISTS crash_live_bets(round_id INTEGER NOT NULL,user_id TEXT NOT NULL,username TEXT NOT NULL,amount_nano INTEGER NOT NULL,status TEXT NOT NULL DEFAULT \'bet\',cashout_multiplier REAL,payout_nano INTEGER NOT NULL DEFAULT 0,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,PRIMARY KEY(round_id,user_id))').run();
  await ensureCrashVirtualColumns(env.DB);
  await env.DB.prepare('CREATE INDEX IF NOT EXISTS idx_crash_live_bets_round ON crash_live_bets(round_id,created_at)').run();
}
function json(r:Row){return{roundId:Number(r.round_id),userId:r.user_id,user:r.username,amountNano:Number(r.amount_nano||0),amountTon:ton(r.amount_nano),status:r.status,cashoutMultiplier:r.cashout_multiplier==null?null:Number(r.cashout_multiplier),targetCashoutMultiplier:r.target_cashout_multiplier==null?null:Number(r.target_cashout_multiplier),payoutNano:Number(r.payout_nano||0),payoutTon:ton(r.payout_nano),isVirtual:Number(r.is_virtual||0)===1,virtualRevealAtMs:Number(r.virtual_reveal_at_ms||0),virtualOrder:Number(r.virtual_order||0),createdAt:r.created_at,updatedAt:r.updated_at}}
async function nextVirtualRevealMs(db:D1Database, roundId:number, now:number){
  const row = await db.prepare('SELECT MIN(virtual_reveal_at_ms) AS nextReveal FROM crash_live_bets WHERE round_id=? AND is_virtual=1 AND status=\'bet\' AND COALESCE(virtual_reveal_at_ms,0)>?').bind(roundId,now).first<{nextReveal:number}>();
  return Number(row?.nextReveal||0);
}
function nextLiveSyncMs(state:ReturnType<typeof getCrashRoundState>, bets:ReturnType<typeof json>[], nextReveal = 0, now = Date.now()){
  if(!state.running){
    if(nextReveal > now)return Math.max(140, Math.min(900, nextReveal - now + 40));
    return Math.max(300, state.nextInMs + 80);
  }
  let target = 0;
  let overdue = false;
  for(const bet of bets){
    if(!bet.isVirtual || bet.status !== 'bet')continue;
    const next = Number(bet.targetCashoutMultiplier)||0;
    if(next <= state.current && next < state.stop)overdue = true;
    if(next > state.current && next < state.stop && (!target || next < target))target = next;
  }
  if(overdue)return 180;
  if(target)return getCrashTargetDelayMs(state,target);
  return Math.max(180, state.runMs - state.local + 80);
}
function betRoundId(state:ReturnType<typeof getCrashRoundState>){return state.waiting ? state.id + 1 : state.id}
function rid(v:unknown){const n=Math.floor(Number(v));if(!Number.isFinite(n)||n<1)throw new Error('Round is not ready');return n}
function uid(v:unknown){const s=String(v||'').trim().slice(0,80);if(!s)throw new Error('User is not ready');return s}
function name(v:unknown,f:string){let s=String(v||f||'User').replace(/[<>]/g,'').trim();if(s.startsWith('@'))s=s.slice(1);if(s.includes(' '))s=s.split(' ')[0];return s.slice(0,80)||'User'}
function amt(v:unknown){const n=Math.floor(Number(v));if(!Number.isFinite(n)||n<MIN_BET_NANO)throw new Error('Minimum bet is 0.01 TON');return n}
function mult(v:unknown){const n=Number(v);if(!Number.isFinite(n)||n<1)throw new Error('Invalid multiplier');return Math.floor(n*100)/100}
function ton(v:unknown){return (Math.max(0,Math.floor(Number(v)||0))/NANO).toFixed(4).replace(/\.0+$/,'').replace(/(\.\d*?)0+$/,'$1')}