export const TON_BALANCE_SCRIPT = `
(function(){
  var KEY='vexaTonBalanceNano';
  var PENDING_PREFIX='vexa:pending-ton-delta:';
  var NANO_PER_TON=1000000000;
  var PLINKO_UNIT_NANO=NANO_PER_TON;
  var PENDING_MAX_AGE_MS=5*60*1000;
  var syncing=false;
  var flushQueued=false;
  var pendingDelta=0;
  var pendingEvents=[];
  var pendingUserId='';
  var lastLocalMutationAt=0;
  var lastBalanceLoadAt=0;
  var winChancePercent=50;
  var LOAD_STALE_MS=60000;
  function clean(value){var n=Math.floor(Number(value));return Number.isFinite(n)&&n>=0?n:0}
  function formatTonNumber(value){var raw=clean(value);var ton=raw/NANO_PER_TON;return ton.toFixed(2)}
  function formatTon(value){return formatTonNumber(value)}
  function plinkoUnits(value){return Math.max(0,Math.floor(clean(value)/PLINKO_UNIT_NANO))}
  function parseTonText(text){var value=String(text||'').replace(/TON/i,'').trim();if(!value)return NaN;return Math.floor(Number(value)*NANO_PER_TON)}
  function user(){var tg=window.Telegram&&window.Telegram.WebApp;var u=tg&&tg.initDataUnsafe&&tg.initDataUnsafe.user;var tgId=String((u&&u.id)||'').trim();var stored=String(localStorage.getItem('ownerId')||'').trim();var id=tgId||stored;if(tgId&&stored&&tgId!==stored){try{Object.keys(localStorage).forEach(function(k){if(k.indexOf(PENDING_PREFIX)===0)localStorage.removeItem(k)});localStorage.removeItem(KEY)}catch(e){}}if(tgId)try{localStorage.setItem('ownerId',tgId)}catch(e){}return {id:String(id||'').trim(),username:u&&u.username?String(u.username):null,firstName:u&&u.first_name?String(u.first_name):null}}
  function pendingKey(){var u=user();return u.id?PENDING_PREFIX+u.id:''}
  function normalizeSection(value){return String(value||'').trim().toLowerCase().replace(/[^a-z0-9_-]/g,'').slice(0,40)}
  function activeSection(){var active=document.querySelector('.view.active[id],section.active[id]');return normalizeSection(active&&active.id)||'unknown'}
  function normalizePendingEvents(items){var out=[];(Array.isArray(items)?items:[]).forEach(function(item){var delta=Math.floor(Number(item&&item.deltaNano));if(Number.isFinite(delta)&&delta)out.push({deltaNano:delta,section:normalizeSection(item&&item.section)||'unknown'})});return out}
  function pendingSum(){return pendingEvents.reduce(function(sum,item){return sum+Math.floor(Number(item.deltaNano)||0)},0)}
  function loadPending(){var u=user();if(!u.id)return 0;if(pendingUserId===u.id)return pendingSum();pendingUserId=u.id;try{var raw=localStorage.getItem(pendingKey())||'';var parsed=null;if(raw&&raw.charAt(0)==='{')parsed=JSON.parse(raw);if(raw&&!parsed){localStorage.removeItem(pendingKey());pendingEvents=[];return 0}var updatedAt=parsed?Number(parsed.updatedAt||0):0;if(!updatedAt||Date.now()-updatedAt>PENDING_MAX_AGE_MS){localStorage.removeItem(pendingKey());pendingEvents=[]}else pendingEvents=normalizePendingEvents(parsed.events||[{deltaNano:parsed.delta,section:parsed.section}]);pendingDelta=pendingSum()}catch(e){pendingEvents=[];pendingDelta=0}return pendingSum()}
  function savePending(){var key=pendingKey();if(!key)return;try{pendingDelta=pendingSum();if(pendingEvents.length)localStorage.setItem(key,JSON.stringify({events:pendingEvents,delta:pendingDelta,updatedAt:Date.now()}));else localStorage.removeItem(key)}catch(e){}}
  function hasPending(){return Math.floor(Number(loadPending())||0)!==0}
  function readDomBalance(){var nodes=document.querySelectorAll('[data-ton-balance-display],#topTonBalance,#plinkoTonBalance,#minesTonBalance');for(var i=0;i<nodes.length;i++){var raw=nodes[i].getAttribute('data-ton-balance-raw');if(raw!==null){var r=clean(raw);if(Number.isFinite(r))return r}var n=parseTonText(nodes[i].textContent);if(Number.isFinite(n)&&n>=0)return n}return 0}
  function read(){var stored=localStorage.getItem(KEY);if(stored!==null)return clean(stored);return clean(readDomBalance())}
  function render(value){var balance=clean(value);var units=plinkoUnits(balance);var display=formatTonNumber(balance);localStorage.setItem(KEY,String(balance));document.querySelectorAll('[data-ton-balance-display],#topTonBalance,#plinkoTonBalance,#minesTonBalance').forEach(function(el){el.setAttribute('data-ton-balance-raw',String(balance));el.textContent=display});document.querySelectorAll('#plinkoCredit,#creditCount,#plinkoCreditHeader').forEach(function(el){el.setAttribute('data-ton-balance-raw',String(balance));el.textContent=String(units)});return balance}
  function emit(balance,delta){try{var units=plinkoUnits(balance);var unitDelta=Math.trunc((Number(delta)||0)/PLINKO_UNIT_NANO);window.dispatchEvent(new CustomEvent('vexa-ton-balance-sync',{detail:{tonBalanceNano:balance,deltaNano:Math.floor(Number(delta)||0),display:formatTonNumber(balance),rate:NANO_PER_TON}}));window.dispatchEvent(new CustomEvent('vexa-credit-sync',{detail:{credit:units,delta:unitDelta,tonBalanceNano:balance,display:formatTonNumber(balance),rate:PLINKO_UNIT_NANO}}))}catch(e){}}
  function write(value,delta,silent){var balance=render(value);if(!silent)emit(balance,delta);return balance}
  async function fetchServerBalance(){var u=user();if(!u.id)return NaN;var r=await fetch('/app/api/user-controls?userId='+encodeURIComponent(u.id),{headers:{'accept':'application/json'},cache:'no-store'});var j=await r.json().catch(function(){return null});if(!r.ok)throw new Error(j&&j.error?j.error:'Could not load TON balance');var chance=Number(j&&j.winChancePercent);if(Number.isFinite(chance))setWinChance(chance);var server=Number(j&&j.tonBalanceNano);return Number.isFinite(server)?server:NaN}
  async function load(){loadPending();if(hasPending())return flushPending(false);var now=Date.now();if(lastBalanceLoadAt&&now-lastBalanceLoadAt<LOAD_STALE_MS)return write(read(),0,false);lastBalanceLoadAt=now;try{var server=await fetchServerBalance();if(Number.isFinite(server))return write(server,0,false)}catch(e){}return write(read(),0,false)}
  function scheduleFlush(force){if(force)return flushPending(true);if(flushQueued||syncing||!hasPending())return read();flushQueued=true;queueMicrotask(function(){flushQueued=false;flushPending(false)});return read()}
  async function flushPending(force){var u=user();if(!u.id)return read();loadPending();var events=pendingEvents.slice();var next=events.reduce(function(sum,item){return sum+Math.floor(Number(item.deltaNano)||0)},0);if(!next)return read();if(syncing&&!force)return read();pendingEvents=[];pendingDelta=0;savePending();syncing=true;try{var r=await fetch('/app/api/ton-balance/game-delta',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({userId:u.id,deltaNano:next,deltas:events}),keepalive:!!force});var j=await r.json().catch(function(){return null});var server=Number(j&&j.tonBalanceNano);if(Number.isFinite(server)&&!hasPending())write(server,0,false)}catch(e){loadPending();pendingEvents=events.concat(pendingEvents);pendingDelta=pendingSum();savePending()}syncing=false;return read()}
  async function pushDelta(delta,section){var u=user();var value=Math.floor(Number(delta)||0);if(!value)return read();var before=read();var optimistic=write(before+value,value,false);lastLocalMutationAt=Date.now();if(!u.id)return optimistic;loadPending();pendingEvents.push({deltaNano:value,section:normalizeSection(section)||activeSection()});pendingDelta=pendingSum();savePending();scheduleFlush(false);return optimistic}
  function add(deltaNano,section){return pushDelta(deltaNano,section)}
  function setWinChance(value){var n=Math.round(Number(value));winChancePercent=Number.isFinite(n)?Math.max(0,Math.min(100,n)):50;try{localStorage.setItem('vexaWinChancePercent',String(winChancePercent))}catch(e){}return winChancePercent}
  function readWinChance(){try{var stored=localStorage.getItem('vexaWinChancePercent');if(stored!==null)setWinChance(stored)}catch(e){}return winChancePercent}
  function hasCustomChance(){return true}
  function decideWin(){return Math.random()*100<readWinChance()}
  function decideNative(nativeChance){return !!decideWin()}
  readWinChance();
  window.VexaGameChance={read:readWinChance,set:setWinChance,isCustom:hasCustomChance,decideWin:decideWin,decideNative:decideNative};
  window.VexaTonBalance={read:read,write:write,add:add,flush:function(){return flushPending(true)},render:function(){return render(read())},load:load,format:formatTon,rate:NANO_PER_TON,parse:parseTonText,plinkoUnitNano:PLINKO_UNIT_NANO};
  window.addEventListener('vexa-ton-balance-game-change',function(ev){if(!ev||!ev.detail)return;var delta=Number(ev.detail.deltaNano!==undefined?ev.detail.deltaNano:ev.detail.delta);if(Number.isFinite(delta)&&delta!==0){pushDelta(delta,ev.detail.section);return}var balance=Number(ev.detail.tonBalanceNano);if(Number.isFinite(balance))write(balance,0,true)});
  window.addEventListener('vexa-credit-game-change',function(ev){if(!ev||!ev.detail)return;var delta=Number(ev.detail.delta);if(Number.isFinite(delta)&&delta!==0)pushDelta(Math.trunc(delta*PLINKO_UNIT_NANO),ev.detail.section)});
  window.addEventListener('vexa-ton-balance-sync',function(ev){if(!ev||!ev.detail)return;var balance=Number(ev.detail.tonBalanceNano);if(Number.isFinite(balance)&&!hasPending())render(balance)});
  document.addEventListener('visibilitychange',function(){if(document.hidden)flushPending(true);else if(hasPending())scheduleFlush(true);else render(read())});
  window.addEventListener('online',function(){if(hasPending())scheduleFlush(true)});
  window.addEventListener('beforeunload',function(){flushPending(true)});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){render(read())});else render(read());
})();
`;
