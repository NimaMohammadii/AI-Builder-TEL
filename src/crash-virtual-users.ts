import type { Env } from './types';
import { getCrashVirtualUsers, type CrashVirtualUser } from './crash-virtual-users-config';

const NANO = 1000000000;

export type CrashRoundSnapshot = {
  roundId: number;
  phase: 'betting' | 'running' | 'ended';
  serverNow: number;
  bettingStartedAt: number;
  runningStartedAt: number;
  bettingMs: number;
  crashHoldMs: number;
  multiplier: number;
  crashMultiplier: number | null;
  history: number[];
};

export async function ensureCrashVirtualColumns(db:D1Database){
  await db.prepare('ALTER TABLE crash_live_bets ADD COLUMN is_virtual INTEGER NOT NULL DEFAULT 0').run().catch(()=>undefined);
  await db.prepare('ALTER TABLE crash_live_bets ADD COLUMN target_cashout_multiplier REAL').run().catch(()=>undefined);
  await db.prepare('ALTER TABLE crash_live_bets ADD COLUMN virtual_reveal_at_ms INTEGER NOT NULL DEFAULT 0').run().catch(()=>undefined);
  await db.prepare('ALTER TABLE crash_live_bets ADD COLUMN virtual_order INTEGER NOT NULL DEFAULT 0').run().catch(()=>undefined);
}

export async function buildCrashVirtualLiveBets(
  env:Env,
  roundId:number,
  state:CrashRoundSnapshot,
  revealStartMs = Date.now(),
  revealEndMs = revealStartMs,
  now = Date.now(),
){
  const configuredUsers = await getCrashVirtualUsers(env)
    .then((config) => config.users)
    .catch((error) => { console.warn('load crash virtual users failed', error); return [] as CrashVirtualUser[]; });
  const count = configuredUsers.length;
  if(!count)return [];
  const revealWindow = Math.max(0, revealEndMs - revealStartMs);
  return configuredUsers.map((configured, i) => {
    const option = pickConfiguredBet(configured, roundId, i) || { amount: 1, cashoutMultiplier: 1.5 };
    const amount = Math.max(1, Math.floor(Number(option.amount || 1) * NANO));
    const target = Math.max(1.01, Math.floor(Number(option.cashoutMultiplier || 1.5) * 100) / 100);
    const automaticReveal = Math.floor(revealStartMs + (count < 2 ? 0 : revealWindow * (i / (count - 1))));
    const revealAt = configuredRevealAt(configured,revealStartMs,revealEndMs,automaticReveal);
    const settled = virtualStatus(target,state);
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

function virtualStatus(target:number,state:CrashRoundSnapshot):{status:'bet'|'cashout'|'crashed';cashoutMultiplier:number|null}{
  if(state.phase==='ended'){
    const stop=Math.max(1,Number(state.crashMultiplier)||1);
    return target<stop ? {status:'cashout',cashoutMultiplier:target} : {status:'crashed',cashoutMultiplier:null};
  }
  if(state.phase==='running'&&target<=Math.max(1,Number(state.multiplier)||1)){
    return {status:'cashout',cashoutMultiplier:target};
  }
  return {status:'bet',cashoutMultiplier:null};
}

function pickConfiguredBet(user:CrashVirtualUser, roundId:number, index:number){
  const bets = Array.isArray(user.bets) ? user.bets : [];
  if(!bets.length)return null;
  return bets[Math.floor(rand(roundId,5000+index)*bets.length)%bets.length];
}

function rand(a:number,b:number){
  const x=Math.sin(a*9301.777+b*49297.31)*233280;
  return x-Math.floor(x);
}
