export const XP_BAR_EFFECTS_SCRIPT = `
(function(){
  var styleId = 'vexa-xp-bar-effects-style';
  var closeStyleId = 'vexa-finance-close-final-style';
  var oldCloseStyleId = 'vexa-finance-close-minimal-style';
  function finalCloseCss(){
    return '#depositSheet .deposit-close,#withdrawSheet .deposit-close{width:38px!important;height:38px!important;min-width:38px!important;max-width:38px!important;max-height:38px!important;padding:0!important;border:0!important;border-radius:999px!important;background:rgba(255,255,255,.035)!important;background-image:none!important;color:#fff!important;display:grid!important;place-items:center!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.08)!important;backdrop-filter:blur(6px)!important;-webkit-backdrop-filter:blur(6px)!important;outline:0!important;overflow:hidden!important}#depositSheet .deposit-close:before,#depositSheet .deposit-close:after,#withdrawSheet .deposit-close:before,#withdrawSheet .deposit-close:after{display:none!important;content:none!important}#depositSheet .deposit-close svg,#withdrawSheet .deposit-close svg{width:20px!important;height:20px!important;display:block!important;opacity:1!important;color:currentColor!important;filter:none!important}#depositSheet .deposit-close svg path,#withdrawSheet .deposit-close svg path{stroke:currentColor!important;stroke-width:2.6!important;stroke-linecap:round!important;stroke-linejoin:round!important}#depositSheet .deposit-close:active,#withdrawSheet .deposit-close:active{transform:scale(.94)!important;background:rgba(255,255,255,.055)!important}';
  }
  function injectStyle(){
    if(!document.getElementById(styleId)){
      var s=document.createElement('style');
      s.id=styleId;
      s.textContent = '#userLine>span:nth-of-type(2){width:128px!important;overflow:hidden!important;position:relative!important}#userLine>span:nth-of-type(2)>span{box-shadow:none!important;filter:none!important;overflow:hidden!important;will-change:auto!important}';
      document.head.appendChild(s);
    }
    var css=finalCloseCss();
    [oldCloseStyleId,closeStyleId].forEach(function(id){
      var node=document.getElementById(id);
      if(!node){node=document.createElement('style');node.id=id;document.head.appendChild(node)}
      node.textContent=css;
    });
    ['depositSheet','withdrawSheet'].forEach(function(id){var b=document.querySelector('#'+id+' .deposit-close');if(!b)return;b.innerHTML='<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/></svg>'});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',injectStyle);else injectStyle();
  document.addEventListener('click',function(ev){
    var a=ev.target&&ev.target.closest&&ev.target.closest('[data-action="open-deposit"],[data-action="open-withdraw"]');
    if(a){setTimeout(injectStyle,20);setTimeout(injectStyle,80)}
  },true);
})();
`;