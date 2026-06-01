export const CRASH_BET_INPUT_SCRIPT = `
(function(){
  var MIN_BET=0.01;
  function q(id){return document.getElementById(id)}
  function clean(value){var text=String(value||'').replace(/,/g,'.').replace(/[^0-9.]/g,''),parts=text.split('.');return parts.length>1?parts.shift()+'.'+parts.join(''):text}
  function parse(v){return Number(clean(v))||0}
  function fmt(v){return String(Math.round(v*10000)/10000).replace(/\.0+$/,'').replace(/(\.\d*?)0+$/,'$1')}
  function normalizeAmount(){var input=q('crashAmount');if(!input)return MIN_BET;var value=parse(input.value);if(value<MIN_BET)value=MIN_BET;input.value=fmt(value);return value}
  function normalizeAuto(){var input=q('crashAutoCashout');if(!input)return 0;var value=parse(input.value);if(value>0&&value<1.01)value=1.01;if(value>200)value=200;if(value)value=Math.round(value*100)/100;input.value=value?fmt(value):'';return value>=1.01?value:0}
  function sanitizeOnInput(input){if(!input)return;var next=clean(input.value);if(next!==input.value)input.value=next}
  function bind(){
    var amount=q('crashAmount'),auto=q('crashAutoCashout');
    if(amount){
      amount.setAttribute('step','0.01');
      amount.setAttribute('autocomplete','off');
      if(parse(amount.value)<=0)amount.value='1';
      amount.addEventListener('input',function(){sanitizeOnInput(amount)},true);
      amount.addEventListener('blur',normalizeAmount,true);
      amount.addEventListener('change',normalizeAmount,true);
    }
    if(auto){
      auto.setAttribute('step','0.01');
      auto.setAttribute('autocomplete','off');
      auto.addEventListener('input',function(){sanitizeOnInput(auto)},true);
      auto.addEventListener('blur',normalizeAuto,true);
      auto.addEventListener('change',normalizeAuto,true);
    }
    document.addEventListener('click',function(ev){
      var btn=ev.target&&ev.target.closest&&ev.target.closest('button');
      if(!btn)return;
      if(btn.id==='crashStart')normalizeAmount();
      var action=btn.getAttribute('data-action');
      if(action==='crash-half'||action==='crash-double')setTimeout(normalizeAmount,0);
    },true);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind);else bind();
})();
`;
