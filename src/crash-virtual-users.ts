const NANO = 1000000000;
const HOUSE_EDGE = .04;
const WAIT_BETWEEN_MS = 9000;
const MAX_RUN_MS = 18000;
const DAY_MS = 86400000;
const NAMES = ['Arman','Nika','Kian','Rayan','Luna','Sina','Daria','Mahan','Nova','Ava','Leo','Mira','Aria','Tara','Nolan','Maya','Kourosh','Lia','Ryan','Sara','Arian','Nora','Milan','Elia','Dena','Kara','Sam','Raha','Shayan','Yara','Vian','Radin','Mina','Roya','Aylin','Zara','Parsa','Nila','Evan','Rima','Tina','Alan','Navi','Negin','Dion','Taha','Avin','Sepehr','Lara','Ilya','Anita','Rad','Nelly'];

export async function ensureCrashVirtualColumns(db:D1Database){
  await db.prepare('ALTER TABLE crash_live_bets ADD COLUMN is_virtual INTEGER NOT NULL DEFAULT 0').run().catch(()=>undefined);
  await db.prepare('ALTER TABLE crash_live_bets ADD COLUMN target_cashout_multiplier REAL').run().catch(()=>undefined);
}

export async function seedCrashVirtualUsers(db:D1Database, roundId:number){
  const found = await db.prepare('SELECT COUNT(*) AS n FROM crash_live_bets WHERE round_id=? AND is_virtual=1').bind(roundId).first<{n:number}>();
  if(Number(found?.n||0)>0)return;
  const count = 40 + Math.floor(rand(roundId,1)*51);
  const stop = roundStop(roundId);
  const stmt = db.prepare("INSERT OR IGNORE INTO crash_live_bets(round_id,user_id,username,amount_nano,status,cashout_multiplier,payout_nano,is_virtual,target_cashout_multiplier,created_at,updated_at) VALUES(?,?,?,?, 'bet', NULL, 0, 1, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)");
  const batch=[];
  for(let i=0;i<count;i++){
    const risk = rand(roundId,100+i);
    const amount = amountNano(roundId,i,risk);
    const target = targetCashout(roundId,i,risk,stop);
    const username = NAMES[Math.floor(rand(roundId,300+i)*NAMES.length)] + (rand(roundId,400+i)>.86 ? String(10+Math.floor(rand(roundId,500+i)*89)) : '');
    batch.push(stmt.bind(roundId,'virtual_'+roundId+'_'+i,username,amount,target));
  }
  if(batch.length)await db.batch(batch);
}

export async function settleCrashVirtualUsers(db:D1Database, roundId:number){
  const stop = roundStop(roundId);
  await db.prepare("UPDATE crash_live_bets SET status='cashout', cashout_multiplier=target_cashout_multiplier, payout_nano=CAST(amount_nano*target_cashout_multiplier AS INTEGER), updated_at=CURRENT_TIMESTAMP WHERE round_id=? AND is_virtual=1 AND status='bet' AND target_cashout_multiplier < ?").bind(roundId,stop).run();
  await db.prepare("UPDATE crash_live_bets SET status='crashed', updated_at=CURRENT_TIMESTAMP WHERE round_id=? AND is_virtual=1 AND status='bet'").bind(roundId).run();
}

export async function revealCrashVirtualCashouts(db:D1Database, roundId:number){
  const state = locateRound(Date.now());
  if(roundId<state.id || (roundId===state.id && !state.running))return settleCrashVirtualUsers(db,roundId);
  if(roundId!==state.id || !state.running)return;
  const stop = roundStop(roundId);
  await db.prepare("UPDATE crash_live_bets SET status='cashout', cashout_multiplier=target_cashout_multiplier, payout_nano=CAST(amount_nano*target_cashout_multiplier AS INTEGER), updated_at=CURRENT_TIMESTAMP WHERE round_id=? AND is_virtual=1 AND status='bet' AND target_cashout_multiplier <= ? AND target_cashout_multiplier < ?").bind(roundId,state.current,stop).run();
}

function rand(a:number,b:number){const x=Math.sin(a*9301.777+b*49297.31)*233280;return x-Math.floor(x)}
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
  return Math.floor((min+(max-min)*shaped)*NANO);
}
function targetCashout(roundId:number,i:number,risk:number,stop:number){const r=rand(roundId,900+i);let min=1.15,max=1.8;if(risk>.45&&risk<=.80){min=1.8;max=3}else if(risk>.80&&risk<=.95){min=3;max=7}else if(risk>.95){min=7;max=15}let t=Math.floor((min+(max-min)*r)*100)/100;if(rand(roundId,1200+i)<.08)t=Math.max(1.01,Math.min(15,stop+(rand(roundId,1300+i)*3+.2)));return t}
function seeded(seed:number){const x=Math.sin(seed*9301.777+49297.31)*233280;return x-Math.floor(x)}
function roundStop(roundId:number){const u=Math.max(.000001,seeded(roundId));let raw=(1-HOUSE_EDGE)/u;if(seeded(roundId+17)<HOUSE_EDGE)raw=1;return Math.max(1,Math.min(60,Math.floor(raw*100)/100))}
function multAt(seconds:number){return 1+seconds*.078+seconds*seconds*.0175}
function stopTime(stop:number){let lo=0,hi=MAX_RUN_MS;for(let i=0;i<24;i++){const mid=(lo+hi)/2;if(multAt(mid/1000)>=stop)hi=mid;else lo=mid}return hi}
function cycleFor(id:number){const stop=roundStop(id),runMs=Math.max(1100,Math.min(MAX_RUN_MS,stopTime(stop)));return{id,runMs,cycleMs:runMs+WAIT_BETWEEN_MS}}
function locateRound(now:number){const dayStart=Math.floor(now/DAY_MS)*DAY_MS,baseId=Math.floor(dayStart/1000);let start=dayStart,localId=0,cycle=cycleFor(baseId);while(now>=start+cycle.cycleMs){start+=cycle.cycleMs;localId++;cycle=cycleFor(baseId+localId)}const local=now-start,running=local<cycle.runMs;return{id:cycle.id,running,current:running?multAt(local/1000):roundStop(cycle.id)}}
