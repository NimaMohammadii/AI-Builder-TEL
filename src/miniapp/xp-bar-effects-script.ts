export const XP_BAR_EFFECTS_SCRIPT = `
(function(){
  var styleId = 'vexa-xp-bar-effects-style';
  var closeStyleId = 'vexa-finance-close-final-style';
  var oldCloseStyleId = 'vexa-finance-close-minimal-style';
  var legacyDiceStyleId = 'vexa-dice-control-polish-style';
  var diceRollStyleId = 'vexa-dice-roll-style';
  function finalCloseCss(){
    return '#depositSheet .deposit-close,#withdrawSheet .deposit-close{width:38px!important;height:38px!important;min-width:38px!important;max-width:38px!important;max-height:38px!important;padding:0!important;border:0!important;border-radius:999px!important;background:rgba(255,255,255,.035)!important;background-image:none!important;color:#fff!important;display:grid!important;place-items:center!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.08)!important;backdrop-filter:blur(6px)!important;-webkit-backdrop-filter:blur(6px)!important;outline:0!important;overflow:hidden!important}#depositSheet .deposit-close:before,#depositSheet .deposit-close:after,#withdrawSheet .deposit-close:before,#withdrawSheet .deposit-close:after{display:none!important;content:none!important}#depositSheet .deposit-close svg,#withdrawSheet .deposit-close svg{width:20px!important;height:20px!important;display:block!important;opacity:1!important;color:currentColor!important;filter:none!important}#depositSheet .deposit-close svg path,#withdrawSheet .deposit-close svg path{stroke:currentColor!important;stroke-width:2.6!important;stroke-linecap:round!important;stroke-linejoin:round!important}#depositSheet .deposit-close:active,#withdrawSheet .deposit-close:active{transform:scale(.94)!important;background:rgba(255,255,255,.055)!important}';
  }
  function diceRollCss(){
    return '#dice .dice-roll-button{background:#2a020d!important;background-image:none!important;border-color:rgba(120,10,40,.42)!important;box-shadow:0 18px 34px rgba(0,0,0,.60),inset 0 1px 0 rgba(255,255,255,.08),inset 0 -1px 0 rgba(0,0,0,.62),0 0 20px rgba(76,4,24,.22)!important;color:#fff!important;transition:transform .16s cubic-bezier(.2,.9,.2,1),box-shadow .18s ease,filter .18s ease!important}#dice .dice-roll-button:active{transform:translateY(2px) scale(.965)!important;filter:brightness(1.12)!important;box-shadow:0 9px 20px rgba(0,0,0,.62),inset 0 2px 5px rgba(0,0,0,.44),0 0 18px rgba(98,6,32,.26)!important}#dice .dice-roll-button.is-rolling{background:#210108!important;background-image:none!important}';
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
    var legacyDice=document.getElementById(legacyDiceStyleId);
    if(legacyDice)legacyDice.remove();
    var diceRoll=document.getElementById(diceRollStyleId);
    if(!diceRoll){diceRoll=document.createElement('style');diceRoll.id=diceRollStyleId;document.head.appendChild(diceRoll)}
    diceRoll.textContent=diceRollCss();
    ['depositSheet','withdrawSheet'].forEach(function(id){var b=document.querySelector('#'+id+' .deposit-close');if(!b)return;b.innerHTML='<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/></svg>'});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',injectStyle);else injectStyle();
  document.addEventListener('click',function(ev){
    var a=ev.target&&ev.target.closest&&ev.target.closest('[data-action="open-deposit"],[data-action="open-withdraw"]');
    if(a){setTimeout(injectStyle,20);setTimeout(injectStyle,80)}
  },true);
})();
`;