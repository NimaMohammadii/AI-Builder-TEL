export const DEPOSIT_ENHANCEMENTS_SCRIPT = `
(function(){
  var STARS_TO_NANO=5890080;
  function q(id){return document.getElementById(id)}
  function tonText(nano){
    var value=Math.max(0,Math.floor(Number(nano)||0))/1000000000;
    return value.toFixed(4).replace(/\.0+$/,'').replace(/(\.\d*?)0+$/,'$1')+' TON';
  }
  function updateEquivalent(){
    var input=q('starsAmountSheet');
    var out=q('starsTonEquivalent');
    if(!out)return;
    var stars=Math.max(0,Math.floor(Number(input&&input.value)||0));
    out.textContent=stars>0?'≈ '+tonText(stars*STARS_TO_NANO):'≈ 0 TON';
  }
  function syncDepositOpen(){
    var sheet=q('depositSheet');
    document.body.classList.toggle('deposit-open',!!(sheet&&sheet.classList.contains('open')));
  }
  function setDepositKeyboard(open){
    document.body.classList.toggle('deposit-keyboard-open',!!open);
  }
  function bind(){
    updateEquivalent();
    syncDepositOpen();
    var sheet=q('depositSheet');
    if(sheet&&window.MutationObserver){
      new MutationObserver(syncDepositOpen).observe(sheet,{attributes:true,attributeFilter:['class','aria-hidden']});
    }
    document.addEventListener('input',function(ev){
      if(ev.target&&ev.target.id==='starsAmountSheet')updateEquivalent();
    });
    document.addEventListener('focusin',function(ev){
      if(ev.target&&ev.target.id==='starsAmountSheet')setDepositKeyboard(true);
    });
    document.addEventListener('focusout',function(ev){
      if(ev.target&&ev.target.id==='starsAmountSheet')setTimeout(function(){
        if(document.activeElement!==q('starsAmountSheet'))setDepositKeyboard(false);
      },80);
    });
    document.addEventListener('click',function(ev){
      var button=ev.target&&ev.target.closest&&ev.target.closest('button');
      if(button&&button.getAttribute('data-action')==='open-deposit')setTimeout(function(){updateEquivalent();syncDepositOpen()},50);
      if(button&&button.getAttribute('data-action')==='close-deposit')setTimeout(function(){setDepositKeyboard(false);syncDepositOpen()},50);
    },true);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind);else bind();
})();
`;