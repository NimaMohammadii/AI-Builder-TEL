export const CREDIT_SCRIPT = `
(function(){
  var KEY='vexaUnifiedCredit';
  var DEFAULT_CREDIT=1000;
  var syncing=false;
  var pendingDelta=0;
  function clean(value){var n=Math.floor(Number(value));return Number.isFinite(n)&&n>=0?n:DEFAULT_CREDIT}
  function user(){var tg=window.Telegram&&window.Telegram.WebApp;var u=tg&&tg.initDataUnsafe&&tg.initDataUnsafe.user;var id=localStorage.getItem('ownerId')||String((u&&u.id)||'');return {id:String(id||'').trim(),username:u&&u.username?String(u.username):null,firstName:u&&u.first_name?String(u.first_name):null}}
  function readDomCredit(){var nodes=document.querySelectorAll('[data-credit-display],#plinkoCredit,#minesCredit,#creditCount,#plinkoCreditHeader');for(var i=0;i<nodes.length;i++){var n=Math.floor(Number(nodes[i].textContent));if(Number.isFinite(n)&&n>=0)return n}return DEFAULT_CREDIT}
  function read(){var stored=localStorage.getItem(KEY);if(stored!==null)return clean(stored);return clean(readDomCredit())}
  function render(value){var credit=clean(value);localStorage.setItem(KEY,String(credit));document.querySelectorAll('[data-credit-display],#plinkoCredit,#minesCredit,#creditCount,#plinkoCreditHeader').forEach(function(el){el.textContent=String(credit)});return credit}
  function emit(credit,delta){try{window.dispatchEvent(new CustomEvent('vexa-credit-sync',{detail:{credit:credit,delta:Math.floor(Number(delta)||0)}}))}catch(e){}}
  function write(value,delta,silent){var credit=render(value);if(!silent)emit(credit,delta);return credit}
  async function load(){var u=user();if(!u.id){write(read(),0,true);return read()}try{var r=await fetch('/app/api/activity',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({userId:u.id,username:u.username,firstName:u.firstName,section:'games'})});var j=await r.json().catch(function(){return null});if(j&&j.ok&&Number.isFinite(Number(j.credit))){var credit=write(j.credit,0,false);return credit}}catch(e){}write(read(),0,true);return read()}
  async function pushDelta(delta){var u=user();var value=Math.floor(Number(delta)||0);if(!value)return read();if(!u.id){return write(read()+value,value,false)}pendingDelta+=value;if(syncing)return read()+pendingDelta;syncing=true;while(pendingDelta!==0){var next=pendingDelta;pendingDelta=0;try{var r=await fetch('/app/api/credit/game-delta',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({userId:u.id,delta:next})});var j=await r.json().catch(function(){return null});if(j&&Number.isFinite(Number(j.credit))){write(j.credit,next,false)}else{write(read()+next,next,false)}}catch(e){write(read()+next,next,false)}}syncing=false;return read()}
  function add(delta){return pushDelta(delta)}
  window.VexaCredit={read:read,write:write,add:add,render:function(){return render(read())},load:load};
  window.addEventListener('vexa-credit-game-change',function(ev){if(!ev||!ev.detail)return;var delta=Number(ev.detail.delta);if(Number.isFinite(delta)&&delta!==0){pushDelta(delta);return}var credit=Number(ev.detail.credit);if(Number.isFinite(credit))write(credit,0,true)});
  window.addEventListener('vexa-credit-sync',function(ev){if(!ev||!ev.detail)return;var credit=Number(ev.detail.credit);if(Number.isFinite(credit))render(credit)});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',load);else load();
})();
`;
