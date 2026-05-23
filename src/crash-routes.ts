import app from './index';
import { ensureCrashVirtualColumns, revealCrashVirtualCashouts, seedCrashVirtualUsers } from './crash-virtual-users';
import { adjustUserTonBalance, debitUserTonBalanceIfEnough } from './user-controls';

const CACHE_NONE = 'no-store';
const NANO = 1000000000;
const MIN_BET_NANO = 10000000;
const WHEEL_MAX_PLAYERS = 5;

type Row = { round_id:number; user_id:string; username:string; amount_nano:number; status:string; cashout_multiplier:number|null; payout_nano:number; is_virtual?:number; created_at:string; updated_at:string };
type WheelRoundRow = { id:string; status:string; total_amount_nano:number; winner_user_id:string|null; selected_ticket:number|null; created_at:string; closed_at:string|null };
type WheelEntryRow = { id:string; round_id:string; user_id:string; username:string; first_name:string|null; amount_nano:number; ticket_start:number; ticket_end:number; created_at:string };

app.get('/app/api/crash-live', async (c) => {
  await ensure(c.env);
  const roundId = rid(c.req.query('roundId'));
  await seedCrashVirtualUsers(c.env.DB, roundId);
  await revealCrashVirtualCashouts(c.env.DB, roundId);
  await c.env.DB.prepare("UPDATE crash_live_bets SET status='crashed', updated_at=CURRENT_TIMESTAMP WHERE round_id < ? AND status='bet' AND is_virtual=0").bind(roundId).run().catch(() => undefined);
  const rows = await c.env.DB.prepare("SELECT * FROM crash_live_bets WHERE round_id=? ORDER BY CASE WHEN status='cashout' THEN 0 ELSE 1 END ASC, amount_nano DESC, datetime(created_at) ASC LIMIT 120").bind(roundId).all<Row>();
  const bets = (rows.results || []).map(json);
  const totalNano = bets.reduce((s,b)=>s+Number(b.amountNano||0),0);
  return c.json({ok:true,roundId,totalNano,totalTon:ton(totalNano),bets},200,{'cache-control':CACHE_NONE});
});

app.post('/app/api/crash-live/bet', async (c) => {
  await ensure(c.env);
  const b = await c.req.json().catch(()=>({})) as Record<string,unknown>;
  const roundId = rid(b.roundId), userId = uid(b.userId), username = name(b.username,userId), amountNano = amt(b.amountNano);
  await c.env.DB.prepare("INSERT INTO crash_live_bets(round_id,user_id,username,amount_nano,status,cashout_multiplier,payout_nano,is_virtual,created_at,updated_at) VALUES(?,?,?,?, 'bet', NULL, 0, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) ON CONFLICT(round_id,user_id) DO UPDATE SET username=excluded.username, amount_nano=excluded.amount_nano, status='bet', cashout_multiplier=NULL, payout_nano=0, is_virtual=0, updated_at=CURRENT_TIMESTAMP").bind(roundId,userId,username,amountNano).run();
  return c.json({ok:true},200,{'cache-control':CACHE_NONE});
});

app.post('/app/api/crash-live/cashout', async (c) => {
  await ensure(c.env);
  const b = await c.req.json().catch(()=>({})) as Record<string,unknown>;
  const roundId = rid(b.roundId), userId = uid(b.userId), m = mult(b.multiplier);
  const row = await c.env.DB.prepare('SELECT * FROM crash_live_bets WHERE round_id=? AND user_id=? AND is_virtual=0').bind(roundId,userId).first<Row>();
  if(!row)return c.json({ok:false,error:'Bet not found'},404,{'cache-control':CACHE_NONE});
  const payout = Math.max(0, Math.floor(Number(row.amount_nano||0)*m));
  await c.env.DB.prepare("UPDATE crash_live_bets SET status='cashout', cashout_multiplier=?, payout_nano=?, updated_at=CURRENT_TIMESTAMP WHERE round_id=? AND user_id=? AND is_virtual=0").bind(m,payout,roundId,userId).run();
  return c.json({ok:true,payoutNano:payout,payoutTon:ton(payout)},200,{'cache-control':CACHE_NONE});
});

app.post('/app/api/crash-live/crash', async (c) => {
  await ensure(c.env);
  const b = await c.req.json().catch(()=>({})) as Record<string,unknown>;
  await c.env.DB.prepare("UPDATE crash_live_bets SET status='crashed', updated_at=CURRENT_TIMESTAMP WHERE round_id=? AND user_id=? AND status='bet' AND is_virtual=0").bind(rid(b.roundId),uid(b.userId)).run();
  return c.json({ok:true},200,{'cache-control':CACHE_NONE});
});

app.get('/app/api/wheel-round', async (c) => {
  await ensureWheel(c.env);
  const round = await latestWheelRound(c.env) || await createWheelRound(c.env);
  return c.json(await wheelState(c.env, round), 200, {'cache-control': CACHE_NONE});
});

app.post('/app/api/wheel-round/join', async (c) => {
  await ensureWheel(c.env);
  const body = await c.req.json().catch(() => ({})) as Record<string, unknown>;
  const userId = wheelUid(body.userId);
  const username = wheelName(body.username, userId);
  const firstName = String(body.firstName || '').replace(/[<>]/g, '').trim().slice(0, 80) || null;
  const amountNano = wheelAmount(body.amountNano);
  let round = await latestWheelRound(c.env);
  if (!round || round.status !== 'open') round = await createWheelRound(c.env);
  let entries = await wheelEntries(c.env, round.id);
  const existing = entries.find((entry) => entry.user_id === userId);
  if (existing) return c.json(await wheelState(c.env, round), 200, {'cache-control': CACHE_NONE});
  if (entries.length >= WHEEL_MAX_PLAYERS) {
    round = await createWheelRound(c.env);
    entries = [];
  }
  await debitUserTonBalanceIfEnough(c.env, userId, amountNano, { kind: 'game', title: 'Wheel entry', roundId: round.id });
  try {
    const start = entries.reduce((sum, entry) => Math.max(sum, Number(entry.ticket_end || 0)), 0) + 1;
    const end = start + amountNano - 1;
    await c.env.DB.prepare('INSERT INTO wheel_entries(id, round_id, user_id, username, first_name, amount_nano, ticket_start, ticket_end, created_at) VALUES(?,?,?,?,?,?,?,?,CURRENT_TIMESTAMP)')
      .bind(wheelId('entry'), round.id, userId, username, firstName, amountNano, start, end)
      .run();
    await c.env.DB.prepare('UPDATE wheel_rounds SET total_amount_nano = total_amount_nano + ? WHERE id = ? AND status = \'open\'').bind(amountNano, round.id).run();
  } catch (error) {
    await adjustUserTonBalance(c.env, userId, amountNano, { kind: 'game', title: 'Wheel entry refund', roundId: round.id }).catch(() => undefined);
    throw error;
  }
  round = await getWheelRound(c.env, round.id) || round;
  entries = await wheelEntries(c.env, round.id);
  if (entries.length >= WHEEL_MAX_PLAYERS && round.status === 'open') round = await settleWheelRound(c.env, round, entries);
  return c.json(await wheelState(c.env, round), 200, {'cache-control': CACHE_NONE});
});

async function ensure(env:{DB:D1Database}){
  await env.DB.prepare('CREATE TABLE IF NOT EXISTS crash_live_bets(round_id INTEGER NOT NULL,user_id TEXT NOT NULL,username TEXT NOT NULL,amount_nano INTEGER NOT NULL,status TEXT NOT NULL DEFAULT \'bet\',cashout_multiplier REAL,payout_nano INTEGER NOT NULL DEFAULT 0,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,PRIMARY KEY(round_id,user_id))').run();
  await ensureCrashVirtualColumns(env.DB);
  await env.DB.prepare('CREATE INDEX IF NOT EXISTS idx_crash_live_bets_round ON crash_live_bets(round_id,created_at)').run();
}

async function ensureWheel(env:{DB:D1Database}){
  await env.DB.prepare('CREATE TABLE IF NOT EXISTS wheel_rounds(id TEXT PRIMARY KEY,status TEXT NOT NULL DEFAULT \'open\',total_amount_nano INTEGER NOT NULL DEFAULT 0,winner_user_id TEXT,selected_ticket INTEGER,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,closed_at TEXT)').run();
  await env.DB.prepare('CREATE TABLE IF NOT EXISTS wheel_entries(id TEXT PRIMARY KEY,round_id TEXT NOT NULL,user_id TEXT NOT NULL,username TEXT NOT NULL,first_name TEXT,amount_nano INTEGER NOT NULL,ticket_start INTEGER NOT NULL,ticket_end INTEGER NOT NULL,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,UNIQUE(round_id,user_id))').run();
  await env.DB.prepare('CREATE INDEX IF NOT EXISTS idx_wheel_rounds_created ON wheel_rounds(created_at)').run();
  await env.DB.prepare('CREATE INDEX IF NOT EXISTS idx_wheel_entries_round ON wheel_entries(round_id,ticket_start)').run();
}

async function latestWheelRound(env:{DB:D1Database}){
  return await env.DB.prepare('SELECT * FROM wheel_rounds ORDER BY datetime(created_at) DESC LIMIT 1').first<WheelRoundRow>();
}

async function getWheelRound(env:{DB:D1Database}, roundId:string){
  return await env.DB.prepare('SELECT * FROM wheel_rounds WHERE id=?').bind(roundId).first<WheelRoundRow>();
}

async function createWheelRound(env:{DB:D1Database}){
  const id = wheelId('round');
  await env.DB.prepare('INSERT INTO wheel_rounds(id,status,total_amount_nano,created_at) VALUES(?,\'open\',0,CURRENT_TIMESTAMP)').bind(id).run();
  return await getWheelRound(env, id) as WheelRoundRow;
}

async function wheelEntries(env:{DB:D1Database}, roundId:string){
  const rows = await env.DB.prepare('SELECT * FROM wheel_entries WHERE round_id=? ORDER BY ticket_start ASC').bind(roundId).all<WheelEntryRow>();
  return rows.results || [];
}

async function wheelState(env:{DB:D1Database}, round:WheelRoundRow){
  const entries = await wheelEntries(env, round.id);
  const winner = round.winner_user_id ? entries.find((entry) => entry.user_id === round.winner_user_id) || null : null;
  return { ok:true, maxPlayers:WHEEL_MAX_PLAYERS, round:{ id:round.id, status:round.status, totalAmountNano:Number(round.total_amount_nano||0), totalTon:ton(round.total_amount_nano), selectedTicket:round.selected_ticket==null?null:Number(round.selected_ticket), winnerUserId:round.winner_user_id, winner:winner?wheelEntryJson(winner):null, createdAt:round.created_at, closedAt:round.closed_at }, entries:entries.map(wheelEntryJson) };
}

async function settleWheelRound(env:Env, round:WheelRoundRow, entries:WheelEntryRow[]){
  const total = entries.reduce((sum, entry) => sum + Math.max(0, Math.floor(Number(entry.amount_nano)||0)), 0);
  if (total <= 0) return round;
  const ticket = secureWheelTicket(total);
  const winner = entries.find((entry) => ticket >= Number(entry.ticket_start) && ticket <= Number(entry.ticket_end)) || entries[entries.length - 1];
  const result = await env.DB.prepare("UPDATE wheel_rounds SET status='closed', total_amount_nano=?, winner_user_id=?, selected_ticket=?, closed_at=CURRENT_TIMESTAMP WHERE id=? AND status='open'")
    .bind(total, winner.user_id, ticket, round.id)
    .run();
  const closed = await getWheelRound(env, round.id) || round;
  if ((result.meta?.changes || 0) > 0) await adjustUserTonBalance(env, winner.user_id, total, { kind: 'game', title: 'Wheel prize', roundId: round.id });
  return closed;
}

function wheelEntryJson(entry:WheelEntryRow){
  return { id:entry.id, roundId:entry.round_id, userId:entry.user_id, username:entry.username, firstName:entry.first_name, amountNano:Number(entry.amount_nano||0), amountTon:ton(entry.amount_nano), ticketStart:Number(entry.ticket_start||0), ticketEnd:Number(entry.ticket_end||0), createdAt:entry.created_at };
}

function secureWheelTicket(max:number){
  const safeMax = BigInt(Math.max(1, Math.min(Number.MAX_SAFE_INTEGER, Math.floor(Number(max)||1))));
  const space = 1n << 64n;
  const limit = space - (space % safeMax);
  const bytes = new Uint32Array(2);
  let value = 0n;
  do {
    crypto.getRandomValues(bytes);
    value = (BigInt(bytes[0]) << 32n) + BigInt(bytes[1]);
  } while (value >= limit);
  return Number((value % safeMax) + 1n);
}

function wheelId(prefix:string){
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  return prefix + '_' + Array.from(bytes).map((byte) => byte.toString(16).padStart(2,'0')).join('');
}

function wheelUid(v:unknown){const s=String(v||'').replace(/[^0-9A-Za-z_-]/g,'').trim().slice(0,80);if(!s)throw new Error('User is not ready');return s}
function wheelName(v:unknown,f:string){let s=String(v||f||'User').replace(/[<>]/g,'').trim();if(s.startsWith('@'))s=s.slice(1);if(s.includes(' '))s=s.split(' ')[0];return s.slice(0,80)||'User'}
function wheelAmount(v:unknown){const n=Math.floor(Number(v));if(!Number.isFinite(n)||n<MIN_BET_NANO)throw new Error('Minimum entry is 0.01 TON');return n}
function json(r:Row){return{roundId:Number(r.round_id),userId:r.user_id,user:r.username,amountNano:Number(r.amount_nano||0),amountTon:ton(r.amount_nano),status:r.status,cashoutMultiplier:r.cashout_multiplier==null?null:Number(r.cashout_multiplier),payoutNano:Number(r.payout_nano||0),payoutTon:ton(r.payout_nano),isVirtual:Number(r.is_virtual||0)===1}}
function rid(v:unknown){const n=Math.floor(Number(v));if(!Number.isFinite(n)||n<1)throw new Error('Round is not ready');return n}
function uid(v:unknown){const s=String(v||'').trim().slice(0,80);if(!s)throw new Error('User is not ready');return s}
function name(v:unknown,f:string){let s=String(v||f||'User').replace(/[<>]/g,'').trim();if(s.startsWith('@'))s=s.slice(1);if(s.includes(' '))s=s.split(' ')[0];return s.slice(0,80)||'User'}
function amt(v:unknown){const n=Math.floor(Number(v));if(!Number.isFinite(n)||n<MIN_BET_NANO)throw new Error('Minimum bet is 0.01 TON');return n}
function mult(v:unknown){const n=Number(v);if(!Number.isFinite(n)||n<1)throw new Error('Invalid multiplier');return Math.floor(n*100)/100}
function ton(v:unknown){return (Math.max(0,Math.floor(Number(v)||0))/NANO).toFixed(4).replace(/\.0+$/,'').replace(/(\.\d*?)0+$/,'$1')}