export const CREDIT_SCRIPT = `
(function(){
  var KEY='vexaUnifiedCredit';
  var DEFAULT_CREDIT=1000;
  function clean(value){var n=Math.floor(Number(value));return Number.isFinite(n)&&n>=0?n:DEFAULT_CREDIT}
  function readDomCredit(){var nodes=document.querySelectorAll('[data-credit-display],#plinkoCredit,#minesCredit,#creditCount,#plinkoCreditHeader');for(var i=0;i<nodes.length;i++){var n=Math.floor(Number(nodes[i].textContent));if(Number.isFinite(n)&&n>=0)return n}return DEFAULT_CREDIT}
  function read(){var stored=localStorage.getItem(KEY);if(stored!==null)return clean(stored);return clean(readDomCredit())}
  function write(value,delta,silent){var credit=clean(value);localStorage.setItem(KEY,String(credit));document.querySelectorAll('[data-credit-display],#plinkoCredit,#minesCredit,#creditCount,#plinkoCreditHeader').forEach(function(el){el.textContent=String(credit)});if(!silent){try{window.dispatchEvent(new CustomEvent('vexa-credit-sync',{detail:{credit:credit,delta:Math.floor(Number(delta)||0)}}))}catch(e){}}return credit}
  function add(delta){return write(read()+Math.floor(Number(delta)||0),Math.floor(Number(delta)||0),false)}
  window.VexaCredit={read:read,write:write,add:add,render:function(){return write(read(),0,true)}};
  window.addEventListener('vexa-credit-game-change',function(ev){if(!ev||!ev.detail)return;var credit=Number(ev.detail.credit);if(Number.isFinite(credit))write(credit,ev.detail.delta,true)});
  window.addEventListener('vexa-credit-sync',function(ev){if(!ev||!ev.detail)return;var credit=Number(ev.detail.credit);if(Number.isFinite(credit))write(credit,ev.detail.delta,true)});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){write(read(),0,true)});else write(read(),0,true);
})();
`;
