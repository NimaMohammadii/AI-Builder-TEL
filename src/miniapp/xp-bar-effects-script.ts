export const XP_BAR_EFFECTS_SCRIPT = `
(function(){
  var styleId = 'vexa-xp-bar-effects-style';
  var closeStyleId = 'vexa-finance-close-final-style';
  function injectStyle(){
    if(!document.getElementById(styleId)){
      var s=document.createElement('style');
      s.id=styleId;
      s.textContent = '#userLine>span:nth-of-type(2){width:128px!important;overflow:hidden!important;position:relative!important}#userLine>span:nth-of-type(2)>span{box-shadow:none!important;filter:none!important;overflow:hidden!important;will-change:auto!important}';
      document.head.appendChild(s);
    }
    var close=document.getElementById(closeStyleId);
    if(!close){close=document.createElement('style');close.id=closeStyleId;document.head.appendChild(close)}
    close.textContent='#depositSheet .deposit-close,#withdrawSheet .deposit-close{width:36px!important;height:36px!important;min-width:36px!important;border-radius:999px!important;background:linear-gradient(180deg,rgba(255,255,255,.085),rgba(255,255,255,.026))!important;border:0!important;outline:0!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.14),0 10px 26px rgba(0,0,0,.22)!important;backdrop-filter:blur(10px) saturate(1.18)!important;-webkit-backdrop-filter:blur(10px) saturate(1.18)!important;color:rgba(255,255,255,.82)!important;display:grid!important;place-items:center!important;padding:0!important}#depositSheet .deposit-close svg,#withdrawSheet .deposit-close svg{width:18px!important;height:18px!important;display:block!important;opacity:.9!important;color:currentColor!important}#depositSheet .deposit-close svg path,#withdrawSheet .deposit-close svg path{stroke:currentColor!important;stroke-width:1.9!important;stroke-linecap:round!important}#depositSheet .deposit-close:active,#withdrawSheet .deposit-close:active{transform:scale(.94)!important;background:linear-gradient(180deg,rgba(255,255,255,.12),rgba(255,255,255,.04))!important}';
    ['depositSheet','withdrawSheet'].forEach(function(id){var b=document.querySelector('#'+id+' .deposit-close');if(!b)return;b.innerHTML='<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M7.9 7.9l8.2 8.2M16.1 7.9l-8.2 8.2" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/></svg>'});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',injectStyle);else injectStyle();
  document.addEventListener('click',function(ev){var a=ev.target&&ev.target.closest&&ev.target.closest('[data-action="open-deposit"],[data-action="open-withdraw"]');if(a)setTimeout(injectStyle,25)},true);
})();
`;