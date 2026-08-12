export const XP_BAR_EFFECTS_SCRIPT = `
(function(){
  function injectStyle(){
    if(document.getElementById('vexa-xp-bar-effects-style'))return;
    var style=document.createElement('style');
    style.id='vexa-xp-bar-effects-style';
    style.textContent='#userLine>span:nth-of-type(2){width:128px!important;overflow:hidden!important;position:relative!important}#userLine>span:nth-of-type(2)>span{box-shadow:none!important;filter:none!important;overflow:hidden!important;will-change:auto!important}';
    document.head.appendChild(style);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',injectStyle);else injectStyle();
})();
`;
