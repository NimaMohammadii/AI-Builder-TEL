export const TON_BALANCE_SCRIPT = `
(function(){
  var KEY='vexaTonBalanceNano';
  var NANO_PER_TON=1000000000;
  var syncing=false;
  var pendingDelta=0;
  var lastLocalMutationAt=0;
  function clean(value){var n=Math.floor(Number(value));return Number.isFinite(n)&&n>=0?n:0}
  function formatTon(value){var raw=clean(value);var ton=raw/NANO_PER_TON;var text=ton.toFixed(4).replace(/\.0+$/,'').replace(/(\.\d*?)0+$/,'$1');return text+' TON'}
  function parseTonText(text){var value=String(text||'').replace(/TON/i,'').trim();if(!value)return NaN;if(value.indexOf('.')>=0)return Math.floor(Number(value)*NANO_PER_TON);return Math.floor(Number(value))}
  function user(){var tg=window.Telegram&&window.Telegram.WebApp;var u=tg&&tg.initDataUnsafe&&tg.initDataUnsafe.user;var id=localStorage.getItem('ownerId')||String((u&&u.id)||'');return {id:String(id||'').trim(),username:u&&u.username?String(u.username):null,firstName:u&&u.first_name?String(u.first_name):null}}
  function readDomBalance(){var nodes=document.querySelectorAll('[data-ton-balance-display],.balance-source,#topTonBalance,#plinkoTonBalance,#minesTonBalance');for(var i=0;i<nodes.length;i++){var raw=nodes[i].getAttribute('data-ton-balance-raw');if(raw!==null){var r=clean(raw);if(Number.isFinite(r))return r}var n=parseTonText(nodes[i].textContent);if(Number.isFinite(n)&&n>=0)return n}return 0}
  function read(){var stored=localStorage.getItem(KEY);if(stored!==null)return clean(stored);return clean(readDomBalance())}
  function render(value){var balance=clean(value);localStorage.setItem(KEY,String(balance));document.querySelectorAll('[data-ton-balance-display],#topTonBalance').forEach(function(el){el.setAttribute('data-ton-balance-raw',String(balance));el.textContent=formatTon(balance)});document.querySelectorAll('.balance-source,#plinkoTonBalance,#minesTonBalance').forEach(function(el){el.setAttribute('data-ton-balance-raw',String(balance));el.textContent=String(balance)});return balance}
  function emit(balance,delta){try{window.dispatchEvent(new CustomEvent('vexa-ton-balance-sync',{detail:{tonBalanceNano:balance,deltaNano:Math.floor(Number(delta)||0),display:formatTon(balance),rate:NANO_PER_TON}}))}catch(e){}}
  function write(value,delta,silent){var balance=render(value);if(!silent)emit(balance,delta);return balance}
  async function load(){var u=user();if(!u.id){write(read(),0,true);return read()}try{var r=await fetch('/app/api/activity',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({userId:u.id,username:u.username,firstName:u.firstName,section:'games'})});var j=await r.json().catch(function(){return null});var next=Number(j&&j.tonBalanceNano);if(j&&j.ok&&Number.isFinite(next)){if(Date.now()-lastLocalMutationAt<1800){return read()}return write(next,0,false)}}catch(e){}return write(read(),0,true)}
  async function pushDelta(delta){
    var u=user();
    var value=Math.floor(Number(delta)||0);
    if(!value)return read();
    var before=read();
    var optimistic=write(before+value,value,false);
    lastLocalMutationAt=Date.now();
    if(!u.id)return optimistic;
    pendingDelta+=value;
    if(syncing)return optimistic;
    syncing=true;
    while(pendingDelta!==0){
      var next=pendingDelta;
      pendingDelta=0;
      try{
        var r=await fetch('/app/api/ton-balance/game-delta',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({userId:u.id,deltaNano:next})});
        var j=await r.json().catch(function(){return null});
        var server=Number(j&&j.tonBalanceNano);
        if(Number.isFinite(server))write(server,0,false);
      }catch(e){
        pendingDelta+=next;
        setTimeout(function(){if(!syncing)pushDelta(0)},900);
        break;
      }
    }
    syncing=false;
    return read();
  }
  function add(deltaNano){return pushDelta(deltaNano)}
  window.VexaTonBalance={read:read,write:write,add:add,render:function(){return render(read())},load:load,format:formatTon,rate:NANO_PER_TON,parse:parseTonText};
  window.addEventListener('vexa-ton-balance-game-change',function(ev){if(!ev||!ev.detail)return;var delta=Number(ev.detail.deltaNano!==undefined?ev.detail.deltaNano:ev.detail.delta);if(Number.isFinite(delta)&&delta!==0){pushDelta(delta);return}var balance=Number(ev.detail.tonBalanceNano);if(Number.isFinite(balance))write(balance,0,true)});
  window.addEventListener('vexa-ton-balance-sync',function(ev){if(!ev||!ev.detail)return;var balance=Number(ev.detail.tonBalanceNano);if(Number.isFinite(balance))render(balance)});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',load);else load();
})();
`;
