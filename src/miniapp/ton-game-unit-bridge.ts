export const TON_GAME_UNIT_BRIDGE = `
(function(){
  var NANO_PER_TON=1000000000;
  var BET_INPUT_IDS=['plinkoBet','minesBet','crashAmount'];
  var DISPLAY_IDS=['plinkoCredit','creditCount','plinkoCreditHeader','plinkoTonBalance','minesTonBalance','topTonBalance'];
  function toNumber(value){return Math.max(0,Number(String(value||'').replace(',','.'))||0)}
  function toNano(value){return Math.floor(toNumber(value)*NANO_PER_TON)}
  function fromNano(value){var ton=Math.max(0,Math.floor(Number(value)||0))/NANO_PER_TON;return ton.toFixed(2)}
  function formatDecimalText(value){return toNumber(value).toFixed(2)}
  function patchInput(id){
    var input=document.getElementById(id);
    if(!input)return;
    input.dataset.tonBridge='1';
    input.dataset.tonDisplay='1';
    input.setAttribute('step','0.01');
    input.setAttribute('inputmode','decimal');
    input.value=formatDecimalText(input.value||'0.01');
  }
  function patchDisplay(id){
    var el=document.getElementById(id);
    if(!el)return;
    var raw=el.getAttribute('data-ton-balance-raw');
    if(raw!==null){el.textContent=fromNano(raw);return}
    var text=String(el.textContent||'').replace(/TON/i,'').trim();
    if(text)el.textContent=formatDecimalText(text);
  }
  function patchInputs(){BET_INPUT_IDS.forEach(patchInput);DISPLAY_IDS.forEach(patchDisplay)}
  function normalizeTarget(target){
    if(!target||!target.id)return;
    if(BET_INPUT_IDS.indexOf(target.id)>=0)setTimeout(function(){patchInput(target.id)},0);
  }
  function convertBefore(input){
    if(!input)return null;
    var old=input.value;
    input.value=String(toNano(old));
    return old;
  }
  function restoreAfter(input,old){
    if(!input||old===null||old===undefined)return;
    var value=formatDecimalText(old);
    setTimeout(function(){input.value=value},0);
    setTimeout(function(){input.value=value},80);
    setTimeout(function(){input.value=value},220);
  }
  document.addEventListener('input',function(ev){normalizeTarget(ev.target)},true);
  document.addEventListener('change',function(ev){normalizeTarget(ev.target)},true);
  document.addEventListener('blur',function(ev){normalizeTarget(ev.target)},true);
  document.addEventListener('click',function(ev){
    var plinko=ev.target&&ev.target.closest&&ev.target.closest('[data-action="drop-plinko-ball"]');
    if(plinko){var p=document.getElementById('plinkoBet');var pv=convertBefore(p);setTimeout(function(){restoreAfter(p,pv)},0);return}
    var minesStart=ev.target&&ev.target.closest&&ev.target.closest('#minesStart');
    if(minesStart){var m=document.getElementById('minesBet');var mv=convertBefore(m);setTimeout(function(){restoreAfter(m,mv)},0);return}
    var minesCash=ev.target&&ev.target.closest&&ev.target.closest('#minesCashout');
    if(minesCash){var mi=document.getElementById('minesBet');var display=mi&&mi.value;setTimeout(function(){if(mi&&display!==undefined)mi.value=formatDecimalText(display)},0)}
    var crashStart=ev.target&&ev.target.closest&&ev.target.closest('#crashStart');
    if(crashStart){var c=document.getElementById('crashAmount');setTimeout(function(){if(c)c.value=formatDecimalText(c.value)},0);setTimeout(function(){if(c)c.value=formatDecimalText(c.value)},120)}
    var button=ev.target&&ev.target.closest&&ev.target.closest('button');
    if(button){var action=button.getAttribute('data-action')||'';if(action.indexOf('bet')>=0||action.indexOf('crash')>=0)setTimeout(patchInputs,80)}
  },true);
  window.addEventListener('vexa-credit-sync',patchInputs);
  window.addEventListener('vexa-ton-balance-sync',patchInputs);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',patchInputs);else patchInputs();
  setInterval(patchInputs,350);
})();
`;
