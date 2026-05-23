export const TON_BALANCE_SCRIPT = `
(function(){
  var KEY='vexaTonBalanceNano';
  var PENDING_PREFIX='vexa:pending-ton-delta:';
  var NANO_PER_TON=1000000000;
  var PLINKO_UNIT_NANO=NANO_PER_TON;
  var FLUSH_MS=30000;
  var syncing=false;
  var pendingDelta=0;
  var pendingUserId='';
  var flushTimer=0;
  var lastLocalMutationAt=0;
  function clean(value){var n=Math.floor(Number(value));return Number.isFinite(n)&&n>=0?n:0}
  function formatTonNumber(value){var raw=clean(value);var ton=raw/NANO_PER_TON;return ton.toFixed(4).replace(/\.0+$/,'').replace(/(\.\d*?)0+$/,'$1')}
  function formatTon(value){return formatTonNumber(value)}
  function plinkoUnits(value){return Math.max(0,Math.floor(clean(value)/PLINKO_UNIT_NANO))}
  function parseTonText(text){var value=String(text||'').replace(/TON/i,'').trim();if(!value)return NaN;if(value.indexOf('.')>=0)return Math.floor(Number(value)*NANO_PER_TON);return Math.floor(Number(value))}
  function user(){var tg=window.Telegram&&window.Telegram.WebApp;var u=tg&&tg.initDataUnsafe&&tg.initDataUnsafe.user;var id=localStorage.getItem('ownerId')||String((u&&u.id)||'');return {id:String(id||'').trim(),username:u&&u.username?String(u.username):null,firstName:u&&u.first_name?String(u.first_name):null}}
  function pendingKey(){var u=user();return u.id?PENDING_PREFIX+u.id:''}
  function loadPending(){
    var u=user();
    if(!u.id)return 0;
    if(pendingUserId===u.id)return Math.floor(Number(pendingDelta)||0);
    pendingUserId=u.id;
    try{pendingDelta=Math.floor(Number(localStorage.getItem(pendingKey())||0)||0)}catch(e){pendingDelta=0}
    return pendingDelta;
  }
  function savePending(){
    var key=pendingKey();
    if(!key)return;
    try{var value=Math.floor(Number(pendingDelta)||0);if(value)localStorage.setItem(key,String(value));else localStorage.removeItem(key)}catch(e){}
  }
  function hasPending(){return Math.floor(Number(loadPending())||0)!==0}
  function readDomBalance(){var nodes=document.querySelectorAll('[data-ton-balance-display],#topTonBalance,#plinkoTonBalance,#minesTonBalance');for(var i=0;i<nodes.length;i++){var raw=nodes[i].getAttribute('data-ton-balance-raw');if(raw!==null){var r=clean(raw);if(Number.isFinite(r))return r}var n=parseTonText(nodes[i].textContent);if(Number.isFinite(n)&&n>=0)return n}return 0}
  function read(){var stored=localStorage.getItem(KEY);if(stored!==null)return clean(stored);return clean(readDomBalance())}
  function render(value){var balance=clean(value);var units=plinkoUnits(balance);localStorage.setItem(KEY,String(balance));document.querySelectorAll('[data-ton-balance-display],#topTonBalance').forEach(function(el){el.setAttribute('data-ton-balance-raw',String(balance));el.textContent=formatTonNumber(balance)});document.querySelectorAll('#plinkoTonBalance,#minesTonBalance').forEach(function(el){el.setAttribute('data-ton-balance-raw',String(balance));el.textContent=String(balance)});document.querySelectorAll('#plinkoCredit,#creditCount,#plinkoCreditHeader').forEach(function(el){el.setAttribute('data-ton-balance-raw',String(balance));el.textContent=String(units)});return balance}
  function emit(balance,delta){try{var units=plinkoUnits(balance);var unitDelta=Math.trunc((Number(delta)||0)/PLINKO_UNIT_NANO);window.dispatchEvent(new CustomEvent('vexa-ton-balance-sync',{detail:{tonBalanceNano:balance,deltaNano:Math.floor(Number(delta)||0),display:formatTonNumber(balance),rate:NANO_PER_TON}}));window.dispatchEvent(new CustomEvent('vexa-credit-sync',{detail:{credit:units,delta:unitDelta,tonBalanceNano:balance,display:formatTonNumber(balance),rate:PLINKO_UNIT_NANO}}))}catch(e){}}
  function write(value,delta,silent){var balance=render(value);if(!silent)emit(balance,delta);return balance}
  async function fetchServerBalance(){
    var u=user();
    if(!u.id)return NaN;
    var r=await fetch('/app/api/user-controls?userId='+encodeURIComponent(u.id),{headers:{'accept':'application/json'},cache:'no-store'});
    var j=await r.json().catch(function(){return null});
    if(!r.ok)throw new Error(j&&j.error?j.error:'Could not load TON balance');
    var server=Number(j&&j.tonBalanceNano);
    return Number.isFinite(server)?server:NaN;
  }
  async function load(){
    loadPending();
    if(hasPending()){scheduleFlush(FLUSH_MS);return write(read(),0,false)}
    try{
      var server=await fetchServerBalance();
      if(Number.isFinite(server))return write(server,0,false);
    }catch(e){}
    return write(read(),0,false);
  }
  function scheduleFlush(delay){
    if(flushTimer)return;
    flushTimer=setTimeout(function(){flushTimer=0;flushPending(false)},Math.max(1000,Math.floor(Number(delay)||FLUSH_MS)));
  }
  async function flushPending(force){
    var u=user();
    if(!u.id)return read();
    loadPending();
    var next=Math.floor(Number(pendingDelta)||0);
    if(!next)return read();
    if(syncing&&!force)return read();
    pendingDelta=0;
    savePending();
    syncing=true;
    try{
      var r=await fetch('/app/api/ton-balance/game-delta',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({userId:u.id,deltaNano:next}),keepalive:!!force});
      var j=await r.json().catch(function(){return null});
      var server=Number(j&&j.tonBalanceNano);
      if(Number.isFinite(server)&&!hasPending())write(server,0,false);
    }catch(e){
      loadPending();
      pendingDelta+=next;
      savePending();
      if(!document.hidden)scheduleFlush(FLUSH_MS);
    }
    syncing=false;
    if(hasPending()&&!document.hidden)scheduleFlush(FLUSH_MS);
    return read();
  }
  async function pushDelta(delta){
    var u=user();
    var value=Math.floor(Number(delta)||0);
    if(!value)return read();
    var before=read();
    var optimistic=write(before+value,value,false);
    lastLocalMutationAt=Date.now();
    if(!u.id)return optimistic;
    loadPending();
    pendingDelta+=value;
    savePending();
    scheduleFlush(FLUSH_MS);
    return optimistic;
  }
  function add(deltaNano){return pushDelta(deltaNano)}
  window.VexaTonBalance={read:read,write:write,add:add,flush:function(){return flushPending(true)},render:function(){return render(read())},load:load,format:formatTon,rate:NANO_PER_TON,parse:parseTonText,plinkoUnitNano:PLINKO_UNIT_NANO};
  window.addEventListener('vexa-ton-balance-game-change',function(ev){if(!ev||!ev.detail)return;var delta=Number(ev.detail.deltaNano!==undefined?ev.detail.deltaNano:ev.detail.delta);if(Number.isFinite(delta)&&delta!==0){pushDelta(delta);return}var balance=Number(ev.detail.tonBalanceNano);if(Number.isFinite(balance))write(balance,0,true)});
  window.addEventListener('vexa-credit-game-change',function(ev){if(!ev||!ev.detail)return;var delta=Number(ev.detail.delta);if(Number.isFinite(delta)&&delta!==0)pushDelta(Math.trunc(delta*PLINKO_UNIT_NANO))});
  window.addEventListener('vexa-ton-balance-sync',function(ev){if(!ev||!ev.detail)return;var balance=Number(ev.detail.tonBalanceNano);if(Number.isFinite(balance)&&!hasPending())render(balance)});
  document.addEventListener('visibilitychange',function(){if(document.hidden)flushPending(true);else if(hasPending())scheduleFlush(FLUSH_MS);else load()});
  window.addEventListener('beforeunload',function(){flushPending(true)});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',load);else load();
})();
`;