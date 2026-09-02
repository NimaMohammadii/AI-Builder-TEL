import app from './index';
import type { Env } from './types';
import { getGhostRunVirtualUsers } from './ghost-run-virtual-users-config';
import { buildCrashVirtualLiveBets, ensureCrashVirtualColumns, type CrashRoundSnapshot } from './crash-virtual-users';
import { getUserControls } from './user-controls';
import { ensureTonTransactionsTable } from './ton-transactions';
import { addUserXp, getUserLevel } from './levels';
import { gameBotToken, validateTelegramInitData } from './utils';

const CACHE_NONE = 'no-store';
const NANO = 1000000000;
const MIN_BET_NANO = 10000000;
const MAX_BET_NANO = Math.floor(Number.MAX_SAFE_INTEGER / 50);
const REVEAL_END_BEFORE_START_MS = 180;
const CRASH_ROOM_NAME = 'global';
let crashSchemaReady = false;

app.get('/app/api/ghost-run-virtual-users', async (c) => {
  const [virtualConfig, realUsers] = await Promise.all([
    getGhostRunVirtualUsers(c.env),
    getGhostRunRealUsers(c.env.DB).catch((error) => { console.warn('load ghost run real users failed', error); return []; }),
  ]);
  const seen = new Set<string>();
  const users = [...realUsers, ...virtualConfig.users].filter((user) => {
    const key = String(user.name || '').trim().toLowerCase();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  return c.json({ ...virtualConfig, users }, 200, {'cache-control': CACHE_NONE});
});

async function getGhostRunRealUsers(db:D1Database){
  const rows = await db.prepare(`SELECT first_name, username
    FROM app_users
    WHERE current_section = 'ghostrun'
      AND datetime(COALESCE(last_seen_at, updated_at, created_at)) >= datetime('now', '-10 minutes')
    ORDER BY datetime(COALESCE(last_seen_at, updated_at, created_at)) DESC
    LIMIT 12`).all<{first_name:string|null;username:string|null}>();
  return (rows.results || []).map((row, index) => {
    const username = String(row.username || '').replace(/^@+/, '').trim();
    const firstName = String(row.first_name || '').trim();
    return {
      name: firstName || (username ? '@' + username : 'Live Player'),
      bets: [{ amount: Number((0.12 + ((index * 7) % 28) / 10).toFixed(2)), cashoutMultiplier: Number((1.22 + ((index * 11) % 95) / 100).toFixed(2)) }],
      real: true,
    };
  });
}

type Row = {
  round_id:number;
  user_id:string;
  username:string;
  amount_nano:number;
  status:string;
  cashout_multiplier:number|null;
  payout_nano:number;
  is_virtual?:number;
  target_cashout_multiplier?:number|null;
  virtual_reveal_at_ms?:number;
  virtual_order?:number;
  created_at:string;
  updated_at:string;
};

type CrashAuthorization = { ok:boolean; roundId:number; multiplier?:number };

app.get('/app/api/crash-live', async (c) => {
  await ensure(c.env);
  try{
    const state = await readCrashState(c.env);
    const roundId = state.roundId;
    const now = Date.now();
    const revealStart = Math.max(0, Number(state.bettingStartedAt)||now);
    const revealEnd = Math.max(revealStart, (Number(state.runningStartedAt)||revealStart) - REVEAL_END_BEFORE_START_MS);
    const [realRows, virtualRows] = await Promise.all([
      readRealLiveRows(c.env.DB, roundId),
      buildCrashVirtualLiveBets(c.env, roundId, state, revealStart, revealEnd, now),
    ]);
    const visibleVirtualRows = virtualRows.filter((row) => Number(row.virtual_reveal_at_ms||0) <= now);
    const bets = [...realRows, ...visibleVirtualRows]
      .map(json)
      .sort((a,b)=>Number(b.amountNano||0)-Number(a.amountNano||0) || Number(a.virtualOrder||0)-Number(b.virtualOrder||0))
      .slice(0,120);
    const totalNano = bets.reduce((sum,bet)=>sum+Number(bet.amountNano||0),0);
    return c.json({ok:true,roundId,totalNano,totalTon:ton(totalNano),state,bets},200,{'cache-control':CACHE_NONE});
  }catch(error){
    return c.json({ok:false,error:error instanceof Error?error.message:'Crash state unavailable'},503,{'cache-control':CACHE_NONE});
  }
});

app.post('/app/api/crash-live/bet', async (c) => {
  const receivedAt = Date.now();
  await ensure(c.env);
  const body = await c.req.json().catch(()=>({})) as Record<string,unknown>;
  let userId = '';
  try{userId=await authenticatedUserId(c.env,body)}catch(error){return c.json({ok:false,error:error instanceof Error?error.message:'Telegram authentication failed'},401,{'cache-control':CACHE_NONE})}
  const roundId = rid(body.roundId);
  const username = name(body.username,userId);
  const requestedAmountNano = amt(body.amountNano);

  const authorization = await authorizeCrashAction(c.env,'bet',roundId,receivedAt).catch(()=>null);
  if(!authorization?.ok){
    return c.json({ok:false,error:'Betting window is closed'},409,{'cache-control':CACHE_NONE});
  }

  let existing = await c.env.DB.prepare('SELECT * FROM crash_live_bets WHERE round_id=? AND user_id=? AND is_virtual=0').bind(roundId,userId).first<Row>();
  if(existing?.status==='cancelled'){
    const referenceId=`crash:${roundId}:${userId}`;
    await c.env.DB.prepare("DELETE FROM crash_live_bets WHERE round_id=? AND user_id=? AND is_virtual=0 AND status='cancelled' AND NOT EXISTS(SELECT 1 FROM ton_transactions WHERE user_id=? AND reference_type='crash' AND reference_id=? AND amount_nano<0)")
      .bind(roundId,userId,userId,referenceId).run();
    existing=await c.env.DB.prepare('SELECT * FROM crash_live_bets WHERE round_id=? AND user_id=? AND is_virtual=0').bind(roundId,userId).first<Row>();
  }
  if(existing && existing.status!=='bet'){
    const [controls, level] = await Promise.all([getUserControls(c.env,userId), getUserLevel(c.env,userId)]);
    return c.json({ok:true,roundId,duplicate:true,tonBalanceNano:controls.tonBalanceNano,level},200,{'cache-control':CACHE_NONE});
  }

  const amountNano=existing?.status==='bet'?amt(existing.amount_nano):requestedAmountNano;
  let placed:{duplicate:boolean};
  try{
    placed=await placeCrashBetAtomic(c.env,userId,username,roundId,amountNano,Boolean(existing));
  }catch(error){
    const current = await getUserControls(c.env,userId).catch(()=>null);
    return c.json({ok:false,error:error instanceof Error?error.message:'Bet failed',tonBalanceNano:current?.tonBalanceNano},400,{'cache-control':CACHE_NONE});
  }

  const [controls, xp, row] = await Promise.all([
    getUserControls(c.env,userId),
    addUserXp(c.env,userId,2,'game-start',{section:'crash',event:'place-bet',roundId},`crash_bet_${roundId}_${userId}`)
      .catch(async (error) => { console.warn('Crash bet XP award failed', error); return { profile: await getUserLevel(c.env,userId) }; }),
    c.env.DB.prepare('SELECT * FROM crash_live_bets WHERE round_id=? AND user_id=? AND is_virtual=0').bind(roundId,userId).first<Row>(),
  ]);
  if(!placed.duplicate&&row) publishCrashLiveEvent(c.env,row).catch((error)=>console.warn('Crash bet live publish failed',error));
  return c.json({ok:true,roundId,duplicate:placed.duplicate,tonBalanceNano:controls.tonBalanceNano,level:xp.profile},200,{'cache-control':CACHE_NONE});
});

app.post('/app/api/crash-live/cashout', async (c) => {
  const receivedAt = Date.now();
  await ensure(c.env);
  const body = await c.req.json().catch(()=>({})) as Record<string,unknown>;
  let userId = '';
  try{userId=await authenticatedUserId(c.env,body)}catch(error){return c.json({ok:false,error:error instanceof Error?error.message:'Telegram authentication failed'},401,{'cache-control':CACHE_NONE})}
  const roundId = rid(body.roundId);
  const row = await c.env.DB.prepare('SELECT * FROM crash_live_bets WHERE round_id=? AND user_id=? AND is_virtual=0').bind(roundId,userId).first<Row>();
  if(!row)return c.json({ok:false,error:'Bet not found'},404,{'cache-control':CACHE_NONE});
  if(!['bet','crashed','cashout_pending','cashout'].includes(row.status))return c.json({ok:false,error:'Bet is already settled'},409,{'cache-control':CACHE_NONE});

  const betReferenceId=`crash:${roundId}:${userId}`;
  const stakeLedger=await c.env.DB.prepare("SELECT id FROM ton_transactions WHERE user_id=? AND reference_type='crash' AND reference_id=? AND amount_nano<0 LIMIT 1")
    .bind(userId,betReferenceId).first<{id:string}>();
  if(!stakeLedger){
    const cashoutReferenceId=`crash:${roundId}:${userId}:cashout`;
    const existingPayout=row.status==='cashout'
      ? await c.env.DB.prepare("SELECT id FROM ton_transactions WHERE user_id=? AND reference_type='crash' AND reference_id=? AND amount_nano>0 LIMIT 1").bind(userId,cashoutReferenceId).first<{id:string}>()
      : null;
    if(!existingPayout){
      await c.env.DB.prepare("UPDATE crash_live_bets SET status='cancelled',updated_at=CURRENT_TIMESTAMP WHERE round_id=? AND user_id=? AND is_virtual=0 AND status IN ('bet','crashed','cashout_pending','cashout')")
        .bind(roundId,userId).run().catch(()=>undefined);
      const current=await getUserControls(c.env,userId).catch(()=>null);
      return c.json({ok:false,error:'Bet funding is missing',tonBalanceNano:current?.tonBalanceNano},409,{'cache-control':CACHE_NONE});
    }
  }

  let cashoutMultiplier = Number(row.cashout_multiplier);
  let payout = Math.max(0,Math.floor(Number(row.payout_nano)||0));
  const duplicate = row.status==='cashout_pending'||row.status==='cashout';

  if(row.status==='bet'||row.status==='crashed'){
    const authorization = await authorizeCrashAction(c.env,'cashout',roundId,receivedAt).catch(()=>null);
    if(!authorization?.ok||!Number.isFinite(Number(authorization.multiplier))){
      return c.json({ok:false,error:'Cashout window is closed'},409,{'cache-control':CACHE_NONE});
    }
    cashoutMultiplier=Math.max(1,Number(authorization.multiplier));
    payout=Math.max(0,Math.floor(Number(row.amount_nano||0)*cashoutMultiplier));
  }

  if(!Number.isFinite(cashoutMultiplier)||cashoutMultiplier<1||payout<=0){
    return c.json({ok:false,error:'Invalid locked cashout'},500,{'cache-control':CACHE_NONE});
  }

  let settled:Row;
  try{
    settled=await settleCrashCashoutAtomic(c.env,userId,roundId,cashoutMultiplier,payout);
  }catch(error){
    const current = await getUserControls(c.env,userId).catch(()=>null);
    return c.json({ok:false,error:error instanceof Error?error.message:'Cashout failed',tonBalanceNano:current?.tonBalanceNano},500,{'cache-control':CACHE_NONE});
  }

  cashoutMultiplier=Math.max(1,Number(settled.cashout_multiplier)||1);
  payout=Math.max(0,Math.floor(Number(settled.payout_nano)||0));
  const xpAmount = cashoutMultiplier>=5?70:(cashoutMultiplier>=2?30:15);
  const [controls, xp] = await Promise.all([
    getUserControls(c.env,userId),
    addUserXp(c.env,userId,xpAmount,'game-win',{section:'crash',event:'cashout',roundId,multiplier:cashoutMultiplier,payoutNano:payout},`crash_cashout_${roundId}_${userId}`)
      .catch(async (error) => { console.warn('Crash cashout XP award failed', error); return { profile: await getUserLevel(c.env,userId) }; }),
  ]);
  publishCrashLiveEvent(c.env,settled).catch((error)=>console.warn('Crash cashout live publish failed',error));
  return c.json({ok:true,roundId,duplicate,cashoutMultiplier,payoutNano:payout,payoutTon:ton(payout),tonBalanceNano:controls.tonBalanceNano,level:xp.profile},200,{'cache-control':CACHE_NONE});
});

async function placeCrashBetAtomic(env:Env,userId:string,username:string,roundId:number,amountNano:number,wasExisting:boolean):Promise<{duplicate:boolean}>{
  const referenceId=`crash:${roundId}:${userId}`;
  const transactionId=`crash_bet:${roundId}:${userId}`;
  const requestNonce=crypto.randomUUID();
  const metadataJson=JSON.stringify({section:'crash',roundId,requestedDeltaNano:-amountNano,idempotencyNonce:requestNonce,source:'server'});
  const results=await env.DB.batch([
    env.DB.prepare(`INSERT INTO app_users (telegram_user_id,current_section,ton_balance_nano,last_seen_at,updated_at)
      VALUES (?,'home',0,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)
      ON CONFLICT(telegram_user_id) DO NOTHING`).bind(userId),
    env.DB.prepare(`INSERT OR IGNORE INTO crash_live_bets(round_id,user_id,username,amount_nano,status,cashout_multiplier,payout_nano,is_virtual,created_at,updated_at)
      SELECT ?,?,?,?,'bet',NULL,0,0,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP
      FROM app_users u
      WHERE u.telegram_user_id=? AND (
        u.ton_balance_nano>=? OR EXISTS(
          SELECT 1 FROM ton_transactions t
          WHERE t.user_id=? AND t.reference_type='crash' AND t.reference_id=? AND t.amount_nano<0
        )
      )`).bind(roundId,userId,username,amountNano,userId,amountNano,userId,referenceId),
    env.DB.prepare(`INSERT OR IGNORE INTO ton_transactions(
        id,user_id,kind,title,description,amount_nano,balance_after_nano,status,reference_id,reference_type,metadata_json,created_at
      )
      SELECT ?,?,'game','Crash bet',NULL,-?,u.ton_balance_nano-?,'completed',?,'crash',?,CURRENT_TIMESTAMP
      FROM app_users u
      WHERE u.telegram_user_id=? AND u.ton_balance_nano>=?
        AND EXISTS(SELECT 1 FROM crash_live_bets b WHERE b.round_id=? AND b.user_id=? AND b.is_virtual=0 AND b.status='bet')
        AND NOT EXISTS(SELECT 1 FROM ton_transactions t WHERE t.user_id=? AND t.reference_type='crash' AND t.reference_id=? AND t.amount_nano<0)`)
      .bind(transactionId,userId,amountNano,amountNano,referenceId,metadataJson,userId,amountNano,roundId,userId,userId,referenceId),
    env.DB.prepare(`UPDATE app_users
      SET ton_balance_nano=ton_balance_nano-?,updated_at=CURRENT_TIMESTAMP
      WHERE telegram_user_id=?
        AND EXISTS(SELECT 1 FROM ton_transactions WHERE id=? AND user_id=? AND metadata_json=?)`)
      .bind(amountNano,userId,transactionId,userId,metadataJson),
  ]);

  const [row,ledger]=await Promise.all([
    env.DB.prepare('SELECT * FROM crash_live_bets WHERE round_id=? AND user_id=? AND is_virtual=0').bind(roundId,userId).first<Row>(),
    env.DB.prepare("SELECT id FROM ton_transactions WHERE user_id=? AND reference_type='crash' AND reference_id=? AND amount_nano<0 LIMIT 1").bind(userId,referenceId).first<{id:string}>(),
  ]);
  if(row?.status==='bet'&&ledger)return{duplicate:wasExisting||(results[1]?.meta?.changes||0)<=0};
  if(row?.status==='bet'&&!ledger){
    await env.DB.prepare("UPDATE crash_live_bets SET status='cancelled',updated_at=CURRENT_TIMESTAMP WHERE round_id=? AND user_id=? AND is_virtual=0 AND status='bet' AND NOT EXISTS(SELECT 1 FROM ton_transactions WHERE user_id=? AND reference_type='crash' AND reference_id=? AND amount_nano<0)")
      .bind(roundId,userId,userId,referenceId).run().catch(()=>undefined);
  }
  throw new Error('Insufficient balance');
}

async function settleCrashCashoutAtomic(env:Env,userId:string,roundId:number,multiplier:number,payoutNano:number):Promise<Row>{
  const referenceId=`crash:${roundId}:${userId}:cashout`;
  const transactionId=`crash_cashout:${roundId}:${userId}`;
  const requestNonce=crypto.randomUUID();
  const metadataJson=JSON.stringify({section:'crash',roundId,multiplier,payoutNano,requestedDeltaNano:payoutNano,idempotencyNonce:requestNonce,source:'server'});
  await env.DB.batch([
    env.DB.prepare(`INSERT INTO app_users (telegram_user_id,current_section,ton_balance_nano,last_seen_at,updated_at)
      VALUES (?,'home',0,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)
      ON CONFLICT(telegram_user_id) DO NOTHING`).bind(userId),
    env.DB.prepare(`UPDATE crash_live_bets
      SET status='cashout_pending',
          cashout_multiplier=CASE WHEN status IN ('bet','crashed') THEN ? ELSE cashout_multiplier END,
          payout_nano=CASE WHEN status IN ('bet','crashed') THEN ? ELSE payout_nano END,
          updated_at=CURRENT_TIMESTAMP
      WHERE round_id=? AND user_id=? AND is_virtual=0
        AND (
          status IN ('bet','crashed','cashout_pending') OR
          (status='cashout' AND NOT EXISTS(
            SELECT 1 FROM ton_transactions t
            WHERE t.user_id=? AND t.reference_type='crash' AND t.reference_id=? AND t.amount_nano>0
          ))
        )`).bind(multiplier,payoutNano,roundId,userId,userId,referenceId),
    env.DB.prepare(`INSERT OR IGNORE INTO ton_transactions(
        id,user_id,kind,title,description,amount_nano,balance_after_nano,status,reference_id,reference_type,metadata_json,created_at
      )
      SELECT ?,?,'game','Crash cashout',NULL,b.payout_nano,u.ton_balance_nano+b.payout_nano,'completed',?,'crash',?,CURRENT_TIMESTAMP
      FROM app_users u JOIN crash_live_bets b ON b.user_id=u.telegram_user_id
      WHERE u.telegram_user_id=? AND b.round_id=? AND b.is_virtual=0 AND b.status='cashout_pending' AND b.payout_nano>0
        AND NOT EXISTS(SELECT 1 FROM ton_transactions t WHERE t.user_id=? AND t.reference_type='crash' AND t.reference_id=? AND t.amount_nano>0)`)
      .bind(transactionId,userId,referenceId,metadataJson,userId,roundId,userId,referenceId),
    env.DB.prepare(`UPDATE app_users
      SET ton_balance_nano=ton_balance_nano+COALESCE((SELECT payout_nano FROM crash_live_bets WHERE round_id=? AND user_id=? AND is_virtual=0 AND status='cashout_pending'),0),
          updated_at=CURRENT_TIMESTAMP
      WHERE telegram_user_id=?
        AND EXISTS(SELECT 1 FROM ton_transactions WHERE id=? AND user_id=? AND metadata_json=?)`)
      .bind(roundId,userId,userId,transactionId,userId,metadataJson),
    env.DB.prepare(`UPDATE crash_live_bets
      SET status='cashout',updated_at=CURRENT_TIMESTAMP
      WHERE round_id=? AND user_id=? AND is_virtual=0 AND status='cashout_pending'
        AND EXISTS(SELECT 1 FROM ton_transactions t WHERE t.user_id=? AND t.reference_type='crash' AND t.reference_id=? AND t.amount_nano>0)`)
      .bind(roundId,userId,userId,referenceId),
  ]);

  const [row,ledger]=await Promise.all([
    env.DB.prepare('SELECT * FROM crash_live_bets WHERE round_id=? AND user_id=? AND is_virtual=0').bind(roundId,userId).first<Row>(),
    env.DB.prepare("SELECT id FROM ton_transactions WHERE user_id=? AND reference_type='crash' AND reference_id=? AND amount_nano>0 LIMIT 1").bind(userId,referenceId).first<{id:string}>(),
  ]);
  if(row?.status==='cashout'&&ledger)return row;
  throw new Error('Cashout settlement did not complete');
}

async function readRealLiveRows(db:D1Database, roundId:number): Promise<Row[]>{
  const rows = await db.prepare("SELECT b.* FROM crash_live_bets b WHERE b.round_id=? AND b.is_virtual=0 AND b.status<>'cancelled' AND EXISTS(SELECT 1 FROM ton_transactions t WHERE t.user_id=b.user_id AND t.reference_type='crash' AND t.reference_id=('crash:' || b.round_id || ':' || b.user_id) AND t.amount_nano<0) ORDER BY b.amount_nano DESC, datetime(b.created_at) ASC LIMIT 120").bind(roundId).all<Row>().catch(() => ({ results: [] as Row[] }));
  return rows.results || [];
}

async function ensure(env:Env){
  if(crashSchemaReady)return;
  await env.DB.prepare('CREATE TABLE IF NOT EXISTS crash_live_bets(round_id INTEGER NOT NULL,user_id TEXT NOT NULL,username TEXT NOT NULL,amount_nano INTEGER NOT NULL,status TEXT NOT NULL DEFAULT \'bet\',cashout_multiplier REAL,payout_nano INTEGER NOT NULL DEFAULT 0,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,PRIMARY KEY(round_id,user_id))').run();
  await ensureCrashVirtualColumns(env.DB);
  await ensureTonTransactionsTable(env);
  await env.DB.prepare('CREATE INDEX IF NOT EXISTS idx_crash_live_bets_round ON crash_live_bets(round_id,created_at)').run();
  crashSchemaReady = true;
}

async function readCrashState(env:Env):Promise<CrashRoundSnapshot>{
  const id=env.CRASH_LIVE.idFromName(CRASH_ROOM_NAME);
  const response=await env.CRASH_LIVE.get(id).fetch(new Request('https://crash-live/state'));
  const payload=await response.json().catch(()=>null) as {ok?:boolean;state?:CrashRoundSnapshot}|null;
  if(!response.ok||!payload?.ok||!payload.state)throw new Error('Crash round state unavailable');
  return payload.state;
}

async function authorizeCrashAction(env:Env,action:'bet'|'cashout',roundId:number,receivedAt:number):Promise<CrashAuthorization>{
  const id=env.CRASH_LIVE.idFromName(CRASH_ROOM_NAME);
  const response=await env.CRASH_LIVE.get(id).fetch(new Request(`https://crash-live/authorize-${action}`,{
    method:'POST',
    headers:{'content-type':'application/json'},
    body:JSON.stringify({roundId,receivedAt}),
  }));
  const payload=await response.json().catch(()=>null) as CrashAuthorization|null;
  return payload&&typeof payload.ok==='boolean'?payload:{ok:false,roundId};
}

async function publishCrashLiveEvent(env:Env,row:Row):Promise<void>{
  const event=json(row);
  const id=env.CRASH_LIVE.idFromName(CRASH_ROOM_NAME);
  await env.CRASH_LIVE.get(id).fetch(new Request('https://crash-live/publish-live',{
    method:'POST',
    headers:{'content-type':'application/json'},
    body:JSON.stringify({
      roundId:event.roundId,
      userId:event.userId,
      user:event.user,
      amountNano:event.amountNano,
      status:event.status,
      cashoutMultiplier:event.cashoutMultiplier,
      payoutNano:event.payoutNano,
      isVirtual:false,
      updatedAt:event.updatedAt,
    }),
  }));
}

async function authenticatedUserId(env:Env, body:Record<string,unknown>):Promise<string>{
  const claimed=uid(body.userId);
  const verified=await validateTelegramInitData(body.initData,gameBotToken(env));
  if(verified!==claimed)throw new Error('Telegram user mismatch');
  return verified;
}

function json(r:Row){
  return{
    roundId:Number(r.round_id),
    userId:r.user_id,
    user:r.username,
    amountNano:Number(r.amount_nano||0),
    amountTon:ton(r.amount_nano),
    status:r.status,
    cashoutMultiplier:r.cashout_multiplier==null?null:Number(r.cashout_multiplier),
    targetCashoutMultiplier:r.target_cashout_multiplier==null?null:Number(r.target_cashout_multiplier),
    payoutNano:Number(r.payout_nano||0),
    payoutTon:ton(r.payout_nano),
    isVirtual:Number(r.is_virtual||0)===1,
    virtualRevealAtMs:Number(r.virtual_reveal_at_ms||0),
    virtualOrder:Number(r.virtual_order||0),
    createdAt:r.created_at,
    updatedAt:r.updated_at,
  };
}

function rid(value:unknown){
  const n=Math.floor(Number(value));
  if(!Number.isSafeInteger(n)||n<1)throw new Error('Round is not ready');
  return n;
}
function uid(value:unknown){
  const s=String(value||'').trim().slice(0,80);
  if(!s)throw new Error('User is not ready');
  return s;
}
function name(value:unknown,fallback:string){
  let s=String(value||fallback||'User').replace(/[<>]/g,'').trim();
  if(s.startsWith('@'))s=s.slice(1);
  if(s.includes(' '))s=s.split(' ')[0];
  return s.slice(0,80)||'User';
}
function amt(value:unknown){
  const n=Number(value);
  if(!Number.isSafeInteger(n)||n<MIN_BET_NANO||n>MAX_BET_NANO)throw new Error('Invalid Crash bet');
  return n;
}
function ton(value:unknown){
  return (Math.max(0,Math.floor(Number(value)||0))/NANO).toFixed(4).replace(/\.0+$/,'').replace(/(\.\d*?)0+$/,'$1');
}
