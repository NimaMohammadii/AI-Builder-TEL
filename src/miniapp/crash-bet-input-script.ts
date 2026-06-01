export const CRASH_BET_INPUT_SCRIPT = `
(function(){
  var MIN_BET=0.01;
  function q(id){return document.getElementById(id)}
  function parse(v){return Number(String(v||'').replace(/,/g,'.'))||0}
  function fmt(v){return String(Math.round(v*10000)/10000).replace(/\.0+$/,'').replace(/(\.\d*?)0+$/,'$1')}
  function clean(input){if(!input)return;var raw=String(input.value||'').replace(/,/g,'.'),out='',dot=false;for(var i=0;i<raw.length;i++){var ch=raw.charAt(i);if(ch>='0'&&ch<='9'){out+=ch;continue}if(ch==='.'&&!dot){out+=ch;dot=true}}if(out!==raw)input.value=out}
  function normalize(){var input=q('crashAmount');if(!input)return MIN_BET;clean(input);var v=parse(input.value);if(v<MIN_BET)v=MIN_BET;input.value=fmt(v);return v}
  function bind(){
    var input=q('crashAmount');
    if(input){
      if(parse(input.value)<=0)input.value='1';
      input.addEventListener('input',function(){clean(input)},true);
      input.addEventListener('blur',normalize,true);
      input.addEventListener('change',normalize,true);
    }
    document.addEventListener('click',function(ev){
      var btn=ev.target&&ev.target.closest&&ev.target.closest('button');
      if(!btn)return;
      if(btn.id==='crashStart')normalize();
      var action=btn.getAttribute('data-action');
      if(action==='crash-half')setTimeout(function(){var input=q('crashAmount');if(!input)return;var v=parse(input.value);if(v<MIN_BET)input.value=fmt(MIN_BET)},0);
      if(action==='crash-double')setTimeout(normalize,0);
    },true);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind);else bind();
})();
`;
