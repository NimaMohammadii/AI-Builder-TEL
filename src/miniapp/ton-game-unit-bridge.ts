export const TON_GAME_UNIT_BRIDGE = `
(function(){
  var NANO_PER_TON=1000000000;
  function toNano(value){return Math.floor(Math.max(0,Number(String(value||'').replace(',','.'))||0)*NANO_PER_TON)}
  function fromNano(value){var ton=Math.max(0,Math.floor(Number(value)||0))/NANO_PER_TON;return ton.toFixed(4).replace(/\\.0+$/,'').replace(/(\\.\\d*?)0+$/,'$1')}
  function patchInput(id){
    var input=document.getElementById(id);
    if(!input||input.dataset.tonBridge==='1')return;
    input.dataset.tonBridge='1';
    input.dataset.tonDisplay='1';
    input.setAttribute('step','0.0001');
    input.setAttribute('inputmode','decimal');
    input.value=fromNano(toNano(input.value||'0.01'));
  }
  function patchInputs(){patchInput('plinkoBet');patchInput('minesBet')}
  function convertBefore(input){
    if(!input)return null;
    var old=input.value;
    input.value=String(toNano(old));
    return old;
  }
  function restoreAfter(input,old){
    if(!input||old===null||old===undefined)return;
    setTimeout(function(){input.value=old},0);
    setTimeout(function(){input.value=old},80);
  }
  document.addEventListener('click',function(ev){
    var plinko=ev.target&&ev.target.closest&&ev.target.closest('[data-action="drop-plinko-ball"]');
    if(plinko){var p=document.getElementById('plinkoBet');var pv=convertBefore(p);setTimeout(function(){restoreAfter(p,pv)},0);return}
    var minesStart=ev.target&&ev.target.closest&&ev.target.closest('#minesStart');
    if(minesStart){var m=document.getElementById('minesBet');var mv=convertBefore(m);setTimeout(function(){restoreAfter(m,mv)},0);return}
    var minesCash=ev.target&&ev.target.closest&&ev.target.closest('#minesCashout');
    if(minesCash){var mi=document.getElementById('minesBet');var display=mi&&mi.value;setTimeout(function(){if(mi&&display!==undefined)mi.value=display},0);}
  },true);
  window.addEventListener('vexa-credit-sync',patchInputs);
  window.addEventListener('vexa-ton-balance-sync',patchInputs);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',patchInputs);else patchInputs();
  setInterval(patchInputs,1200);
})();
`;
