export const XP_BAR_EFFECTS_SCRIPT = `
(function(){
  var styleId = 'vexa-xp-bar-effects-style';
  var closeStyleId = 'vexa-finance-close-final-style';
  var oldCloseStyleId = 'vexa-finance-close-minimal-style';
  var diceStyleId = 'vexa-dice-control-polish-style';
  function finalCloseCss(){
    return '#depositSheet .deposit-close,#withdrawSheet .deposit-close{width:32px!important;height:32px!important;min-width:32px!important;max-width:32px!important;max-height:32px!important;border-radius:999px!important;background:rgba(255,255,255,.052)!important;background-image:linear-gradient(180deg,rgba(255,255,255,.075),rgba(255,255,255,.018))!important;border:0!important;outline:0!important;box-shadow:0 10px 24px rgba(0,0,0,.20)!important;backdrop-filter:blur(12px) saturate(1.22)!important;-webkit-backdrop-filter:blur(12px) saturate(1.22)!important;color:rgba(255,255,255,.86)!important;display:grid!important;place-items:center!important;padding:0!important;overflow:hidden!important}#depositSheet .deposit-close:before,#depositSheet .deposit-close:after,#withdrawSheet .deposit-close:before,#withdrawSheet .deposit-close:after{display:none!important;content:none!important}#depositSheet .deposit-close svg,#withdrawSheet .deposit-close svg{width:19px!important;height:19px!important;display:block!important;opacity:.94!important;color:currentColor!important;filter:none!important}#depositSheet .deposit-close svg path,#withdrawSheet .deposit-close svg path{stroke:currentColor!important;stroke-width:2.05!important;stroke-linecap:round!important;stroke-linejoin:round!important}#depositSheet .deposit-close:active,#withdrawSheet .deposit-close:active{transform:scale(.94)!important;background:rgba(255,255,255,.075)!important;background-image:linear-gradient(180deg,rgba(255,255,255,.10),rgba(255,255,255,.026))!important}';
  }
  function diceCss(){
    return '#dice .dice-control-grid .dice-field:nth-child(3){padding-left:8px!important;padding-right:8px!important}#dice .dice-control-grid .dice-field:nth-child(3) b{justify-content:center!important;gap:4px!important;font-size:20px!important;letter-spacing:-.06em!important;overflow:visible!important;white-space:nowrap!important}#dice [data-dice-chance]{display:inline-block!important;min-width:0!important;max-width:none!important;overflow:visible!important;text-overflow:clip!important;white-space:nowrap!important}#dice .dice-roll-button{background:linear-gradient(180deg,rgba(255,255,255,.075),rgba(255,255,255,.018)),linear-gradient(135deg,#240009,#0d0004 58%,#3a0412)!important;border-color:rgba(105,9,36,.34)!important;box-shadow:0 20px 40px rgba(0,0,0,.62),inset 0 1px 0 rgba(255,255,255,.10),inset 0 -1px 0 rgba(0,0,0,.60),0 0 22px rgba(58,4,18,.22)!important;color:#fff!important}#dice .dice-roll-button.is-rolling{background:linear-gradient(180deg,rgba(255,255,255,.055),rgba(255,255,255,.014)),linear-gradient(135deg,#1a0007,#070002 62%,#2b020d)!important}@media(max-width:420px){#dice .dice-control-grid .dice-field:nth-child(3){padding-left:7px!important;padding-right:7px!important}#dice .dice-control-grid .dice-field:nth-child(3) b{font-size:19px!important;gap:3px!important}}';
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
    var dice=document.getElementById(diceStyleId);
    if(!dice){dice=document.createElement('style');dice.id=diceStyleId;document.head.appendChild(dice)}
    dice.textContent=diceCss();
    ['depositSheet','withdrawSheet'].forEach(function(id){var b=document.querySelector('#'+id+' .deposit-close');if(!b)return;b.innerHTML='<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M7.6 7.6l8.8 8.8M16.4 7.6l-8.8 8.8" stroke="currentColor" stroke-width="2.05" stroke-linecap="round" stroke-linejoin="round"/></svg>'});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',injectStyle);else injectStyle();
  document.addEventListener('click',function(ev){
    var a=ev.target&&ev.target.closest&&ev.target.closest('[data-action="open-deposit"],[data-action="open-withdraw"]');
    if(a){setTimeout(injectStyle,20);setTimeout(injectStyle,80)}
  },true);
})();
`;