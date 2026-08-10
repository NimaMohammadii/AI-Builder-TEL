import { getCrashVirtualUsers, type CrashVirtualUser } from './crash-virtual-users-config';

const NANO = 1000000000;
const HOUSE_EDGE = .04;
const WAIT_BETWEEN_MS = 10000;
const CRASH_HOLD_MS = 2200;
const MAX_RUN_MS = 68000;
const DAY_MS = 86400000;
const HOUR_MS = 3600000;
const NAMES = ['Amir','Ali','Reza','Arman','Arya','Arvin','Arian','Kian','Sina','Saman','Sam','Radin','Rayan','Shayan','Mahan','Parsa','Navid','Nima','Nikan','Kaveh','Sepehr','Taha','Erfan','Amin','Alan','Ilya','Elia','Evan','Nolan','Milan','Matin','Bardia','Hirad','Dani','Omid','Pouya','Kasra','Arad','Mehrad','Nika','Ava','Mira','Luna','Daria','Aria','Tara','Maya','Lia','Nora','Elina','Lina','Dena','Raha','Yara','Vian','Mina','Roya','Aylin','Zara','Nila','Rima','Tina','Negin','Avin','Lara','Anita','Rosha','Kimia','Dorsa','Hana','Shadi','Nahal','Helia','Niki','Emma','Mia','Lena','Sofia','Ella','Nina','Ayla','Clara','Diana','Kira','Mona','Yana','Alex','Max','Nick','Ben','Ethan','Adam','Liam','Noah','Owen','Mason','Lucas','Logan','Dylan','Carter','Jason','Finn','Theo','Milo','Levi','Ezra','Simon','Victor','Oscar'];

export type CrashRoundState = {
  id: number;
  start: number;
  local: number;
  runMs: number;
  running: boolean;
  waiting: boolean;
  inCrashHold: boolean;
  current: number;
  stop: number;
  nextInMs: number;
};

export async function ensureCrashVirtualColumns(db:D1Database){
  await db.prepare('ALTER TABLE crash_live_bets ADD COLUMN is_virtual INTEGER NOT NULL DEFAULT 0').run().catch(()=>undefined);
  await db.prepare('ALTER TABLE crash_live_bets ADD COLUMN target_cashout_multiplier REAL').run().catch(()=>undefined);
  await db.prepare('ALTER TABLE crash_live_bets ADD COLUMN virtual_reveal_at_ms INTEGER NOT NULL DEFAULT 0').run().catch(()=>undefined);
  await db.prepare('ALTER TABLE crash_live_bets ADD COLUMN virtual_order INTEGER NOT NULL DEFAULT 0').run().catch(()=>undefined);
}

export async function seedCrashVirtualUsers(db:D1Database, roundId:number, revealStartMs = Date.now(), revealEndMs = revealStartMs){
  const found = await db.prepare('SELECT COUNT(*) AS n FROM crash_live_bets WHERE round_id=? AND is_virtual=1').bind(roundId).first<{n:number}>();
  if(Number(found?.n||0)>0)return;
  const stop = roundStop(roundId);
  const hourSlot = Math.floor(Date.now()/HOUR_MS);
  const configuredUsers = await loadConfiguredUsers(db);
  const count = configuredUsers.length || (60 + Math.floor(rand(roundId,1)*41));
  const revealWindow = Math.max(0, revealEndMs - revealStartMs);
  const stmt = db.prepare("INSERT OR IGNORE INTO crash_live_bets(round_id,user_id,username,amount_nano,status,cashout_multiplier,payout_nano,is_virtual,target_cashout_multiplier,virtual_reveal_at_ms,virtual_order,created_at,updated_at) VALUES(?,?,?,?, 'bet', NULL, 0, 1, ?, ?, ?, datetime(?/1000, 'unixepoch'), datetime(?/1000, 'unixepoch'))");
  const batch=[];
  for(let i=0;i<count;i++){
    const risk = rand(roundId,100+i);
    const configured = configuredUsers[i];
    const option = configured ? pickConfiguredBet(configured, roundId, i) : null;
    const amount = option ? Math.max(1, Math.floor(option.amount * NANO)) : amountNano(roundId,i,risk);
    const target = option ? option.cashoutMultiplier : targetCashout(roundId,i,risk,stop);
    const username = configured ? configured.name : scheduledName(roundId,hourSlot,i);
    const automaticReveal = Math.floor(revealStartMs + (count < 2 ? 0 : revealWindow * (i / (count - 1))));
    const revealAt = configured ? configuredRevealAt(configured,revealStartMs,revealEndMs,automaticReveal) : automaticReveal;
    batch.push(stmt.bind(roundId,'virtual_'+hourSlot+'_'+roundId+'_'+i,username,amount,target,revealAt,i + 1,revealAt,revealAt));
  }
  if(batch.length)await db.batch(batch);
}

export async function buildCrashVirtualLiveBets(env:{DB:D1Database; BOT_CACHE:any}, roundId:number, revealStartMs = Date.now(), revealEndMs = revealStartMs, now = Date.now(), state = getCrashRoundState(now)){
  const configuredUsers = await getCrashVirtualUsers(env).then((config) => config.users).catch((error) => { console.warn('load crash virtual users failed', error); return [] as CrashVirtualUser[]; });
  const count = configuredUsers.length;
  if(!count)return [];
  const stop = roundStop(roundId);
  const revealWindow = Math.max(0, revealEndMs - revealStartMs);
  return configuredUsers.map((configured, i) => {
    const option = pickConfiguredBet(configured, roundId, i) || { amount: 1, cashoutMultiplier: 1.5 };
    const amount = Math.max(1, Math.floor(Number(option.amount || 1) * NANO));
    const target = Math.max(1.01, Math.floor(Number(option.cashoutMultiplier || 1.5) * 100) / 100);
    const automaticReveal = Math.floor(revealStartMs + (count < 2 ? 0 : revealWindow * (i / (count - 1))));
    const revealAt = configuredRevealAt(configured,revealStartMs,revealEndMs,automaticReveal);
    const settled = virtualStatus(roundId, target, stop, state);
    return {
      round_id: roundId,
      user_id: 'virtual_'+roundId+'_'+i,
      username: configured.name,
      amount_nano: amount,
      status: settled.status,
      cashout_multiplier: settled.cashoutMultiplier,
      payout_nano: settled.cashoutMultiplier ? Math.max(0, Math.floor(amount * settled.cashoutMultiplier)) : 0,
      is_virtual: 1,
      target_cashout_multiplier: target,
      virtual_reveal_at_ms: revealAt,
      virtual_order: i + 1,
      created_at: new Date(revealAt).toISOString(),
      updated_at: new Date(now).toISOString(),
    };
  });
}

function configuredRevealAt(user:CrashVirtualUser,revealStartMs:number,revealEndMs:number,fallback:number){
  const raw = Number(user.betSecond);
  if(!Number.isFinite(raw))return fallback;
  const windowSeconds = Math.max(0,(revealEndMs-revealStartMs)/1000);
  const second = Math.max(0,Math.min(8,windowSeconds,raw));
  return Math.min(revealEndMs,Math.max(revealStartMs,Math.floor(revealStartMs+second*1000)));
}

function virtualStatus(roundId:number,target:number,stop:number,state:CrashRoundState){
  if(roundId < state.id || (roundId === state.id && state.waiting))return target < stop ? { status: 'cashout', cashoutMultiplier: target } : { status: 'crashed', cashoutMultiplier: null };
  if(roundId === state.id && state.running && target <= state.current && target < state.stop)return { status: 'cashout', cashoutMultiplier: target };
  return { status: 'bet', cashoutMultiplier: null };
}

export async function settleCrashVirtualUsers(db:D1Database, roundId:number){
  const stop = roundStop(roundId);
  await db.prepare("UPDATE crash_live_bets SET status='cashout', cashout_multiplier=target_cashout_multiplier, payout_nano=CAST(amount_nano*target_cashout_multiplier AS INTEGER), updated_at=CURRENT_TIMESTAMP WHERE round_id=? AND is_virtual=1 AND status='bet' AND target_cashout_multiplier < ?").bind(roundId,stop).run();
  await db.prepare("UPDATE crash_live_bets SET status='crashed', updated_at=CURRENT_TIMESTAMP WHERE round_id=? AND is_virtual=1 AND status='bet'").bind(roundId).run();
}

export async function revealCrashVirtualCashouts(db:D1Database, roundId:number, state = getCrashRoundState(Date.now())){
  if(roundId<state.id || (roundId===state.id && !state.running))return settleCrashVirtualUsers(db,roundId);
  if(roundId!==state.id || !state.running)return;
  const target = await nextVirtualCashoutTarget(db, roundId, state);
  if(!target)return;
  await db.prepare("UPDATE crash_live_bets SET status='cashout', cashout_multiplier=target_cashout_multiplier, payout_nano=CAST(amount_nano*target_cashout_multiplier AS INTEGER), updated_at=CURRENT_TIMESTAMP WHERE round_id=? AND is_virtual=1 AND status='bet' AND target_cashout_multiplier <= ? AND target_cashout_multiplier < ?").bind(roundId,target,state.stop).run();
}

export async function nextVirtualCashoutTarget(db:D1Database, roundId:number, state:CrashRoundState){
  if(roundId!==state.id || !state.running)return 0;
  const row = await db.prepare("SELECT target_cashout_multiplier AS target FROM crash_live_bets WHERE round_id=? AND is_virtual=1 AND status='bet' AND target_cashout_multiplier < ? ORDER BY target_cashout_multiplier ASC LIMIT 1").bind(roundId,state.stop).first<{target:number}>();
  const target = Number(row?.target||0);
  if(!target || target>state.current)return 0;
  return target;
}

export function getCrashRoundState(now:number): CrashRoundState{
  const dayStart=Math.floor(now/DAY_MS)*DAY_MS;
  const baseId=Math.floor(dayStart/1000);
  let start=dayStart;
  let localId=0;
  let cycle=cycleFor(baseId);
  while(now>=start+cycle.cycleMs){
    start+=cycle.cycleMs;
    localId++;
    cycle=cycleFor(baseId+localId);
  }
  const local=now-start;
  const running=local<cycle.runMs;
  const waitElapsed=running?0:local-cycle.runMs;
  return {
    id: cycle.id,
    start,
    local,
    runMs: cycle.runMs,
    running,
    waiting: !running,
    inCrashHold: !running && waitElapsed<CRASH_HOLD_MS,
    current: running?multAt(local/1000):roundStop(cycle.id),
    stop: roundStop(cycle.id),
    nextInMs: running?0:Math.max(0,WAIT_BETWEEN_MS-waitElapsed),
  };
}

export function getCrashLiveRoundId(state:CrashRoundState){
  return state.running || state.inCrashHold ? state.id : state.id+1;
}

export function getCrashTargetDelayMs(state:CrashRoundState,target:number){
  if(!state.running)return 0;
  return Math.max(90, stopTime(target)-(Date.now()-state.start)+70);
}

async function loadConfiguredUsers(db:D1Database): Promise<CrashVirtualUser[]>{
  const env = { DB: db, BOT_CACHE: { get: async () => null, put: async () => undefined } } as any;
  try { return (await getCrashVirtualUsers(env)).users; } catch (error) { console.warn('load crash virtual users failed', error); return []; }
}
function pickConfiguredBet(user:CrashVirtualUser, roundId:number, index:number){
  const bets = Array.isArray(user.bets) ? user.bets : [];
  if(!bets.length)return null;
  return bets[Math.floor(rand(roundId,5000+index)*bets.length)%bets.length];
}
function rand(a:number,b:number){const x=Math.sin(a*9301.777+b*49297.31)*233280;return x-Math.floor(x)}
function scheduledName(roundId:number,hourSlot:number,i:number){
  const base=Math.floor(rand(hourSlot,17)*NAMES.length);
  const jump=7+Math.floor(rand(hourSlot,23)*19);
  const idx=(base+i*jump+Math.floor(rand(roundId,300+i)*NAMES.length))%NAMES.length;
  const roll=rand(roundId,400+i);
  if(roll>.95)return NAMES[idx]+String(10+Math.floor(rand(roundId,500+i)*89));
  if(roll>.91)return NAMES[idx]+String(Math.floor(rand(roundId,501+i)*9));
  return NAMES[idx];
}
function amountNano(roundId:number,i:number,risk:number){
  const r=rand(roundId,700+i);
  const whale=rand(roundId,1700+i);
  let min=.08,max=1.2;
  if(risk>.48&&risk<=.70){min=.75;max=4.5}
  else if(risk>.70&&risk<=.86){min=3;max=14}
  else if(risk>.86&&risk<=.96){min=10;max=38}
  else if(risk>.96&&risk<=.992){min=28;max=95}
  else if(risk>.992){min=80;max=180}
  if(whale>.987){min=120;max=320}
  if(whale>.997){min=280;max=650}
  const shaped=Math.pow(r,.66);
  const tonAmount=min+(max-min)*shaped;
  return roundBotAmount(tonAmount,rand(roundId,2600+i));
}
function roundBotAmount(value:number,roll:number){
  let rounded:number;
  if(roll>.90) rounded=Math.round(value*100)/100;
  else if(roll>.72) rounded=Math.round(value*10)/10;
  else rounded=Math.round(value);
  if(rounded<.1) rounded=Math.round(value*10)/10;
  return Math.max(1,Math.floor(rounded*NANO));
}
function targetCashout(roundId:number,i:number,risk:number,stop:number){
  const r=rand(roundId,900+i);
  const earlyLimit=Math.min(stop-.01,1.12);
  if(stop>1.04 && earlyLimit>1.01 && rand(roundId,1500+i)<.22)return Math.floor((1.01+(earlyLimit-1.01)*r)*100)/100;
  let min=1.15,max=1.8;
  if(risk>.45&&risk<=.80){min=1.8;max=3}
  else if(risk>.80&&risk<=.95){min=3;max=7}
  else if(risk>.95){min=7;max=15}
  let t=Math.floor((min+(max-min)*r)*100)/100;
  if(rand(roundId,1200+i)<.08)t=Math.max(1.01,Math.min(15,stop+(rand(roundId,1300+i)*3+.2)));
  return t;
}
function seeded(seed:number){const x=Math.sin(seed*9301.777+49297.31)*233280;return x-Math.floor(x)}
function rawRoundStop(roundId:number){const u=Math.max(.000001,seeded(roundId));let raw=(1-HOUSE_EDGE)/u;if(seeded(roundId+17)<HOUSE_EDGE)raw=1;return Math.max(1,Math.min(60,Math.floor(raw*100)/100))}
function multAt(seconds:number){return 1+seconds*.06+seconds*seconds*.00105}
function maxReachableStop(){return Math.floor(multAt(MAX_RUN_MS/1000)*100)/100}
function roundStop(roundId:number){return Math.min(rawRoundStop(roundId),maxReachableStop())}
function stopTime(stop:number){let lo=0,hi=MAX_RUN_MS;for(let i=0;i<24;i++){const mid=(lo+hi)/2;if(multAt(mid/1000)>=stop)hi=mid;else lo=mid}return hi}
function cycleFor(id:number){const stop=roundStop(id),runMs=Math.max(1100,stopTime(stop));return{id,runMs,cycleMs:runMs+WAIT_BETWEEN_MS}}
