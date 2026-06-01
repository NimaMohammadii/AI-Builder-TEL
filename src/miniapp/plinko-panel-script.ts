export const PLINKO_PANEL_SCRIPT = `
(function(){
  var autoTimer=0;

  function q(id){return document.getElementById(id)}

  function tonToNano(value){
    return Math.max(0,Math.floor((Number(String(value||'').replace(',','.'))||0)*1000000000));
  }

  function readBalanceNano(){
    if(window.VexaTonBalance&&typeof window.VexaTonBalance.read==='function')return Math.max(0,Math.floor(Number(window.VexaTonBalance.read())||0));
    var source=q('plinkoTonBalance')||q('topTonBalance')||q('plinkoCredit');
    return tonToNano(source&&source.textContent);
  }

  function isPlinkoActive(){
    var active=document.querySelector('.view.active');
    return !!(active&&active.id==='plinko');
  }

  function syncHeaderCredit(){
    var source=q('plinkoTonBalance')||q('topTonBalance')||q('plinkoCredit');
    var header=q('plinkoCreditHeader');
    if(source&&header)header.textContent=source.textContent||'0';
  }

  function currentCredit(){
    return readBalanceNano();
  }

  function formatBet(value){
    var next=Math.round((Math.max(0,Number(value)||0)+Number.EPSILON)*100)/100;
    return next.toFixed(2).replace(/\.00$/,'').replace(/(\.\d)0$/,'$1');
  }

  function normalizeBet(value){
    var input=q('plinkoBet');
    var raw=String(value||'').replace(',','.').trim();
    var next=Number(raw);
    if(!Number.isFinite(next)||next<1)next=1;
    next=Math.round((next+Number.EPSILON)*100)/100;
    var creditTon=currentCredit()/1000000000;
    if(creditTon>=1&&next>creditTon)next=Math.round((creditTon+Number.EPSILON)*100)/100;
    if(input)input.value=formatBet(next);
  }

  function currentBet(){
    var input=q('plinkoBet');
    var value=Number(String(input&&input.value||'').replace(',','.'));
    return Number.isFinite(value)&&value>=1?Math.round((value+Number.EPSILON)*100)/100:1;
  }

  function multiplyBet(multiplier){
    var value=currentBet();
    normalizeBet(multiplier===.5?Math.max(1,value/2):value*2);
  }

  function setBetKeyboard(active){
    document.body.classList.toggle('plinko-bet-keyboard',!!active);
  }

  function stopAuto(){
    if(autoTimer){clearInterval(autoTimer);autoTimer=0}
    var toggle=document.querySelector('[data-action="toggle-autoplay"]');
    if(toggle){toggle.classList.remove('active');toggle.setAttribute('aria-pressed','false')}
  }

  function canDrop(){
    var dropButton=document.querySelector('[data-action="drop-plinko-ball"]');
    if(!dropButton||dropButton.disabled)return false;
    return readBalanceNano()>=tonToNano(currentBet());
  }

  function toggleAuto(button){
    var active=!button.classList.contains('active');
    button.classList.toggle('active',active);
    button.setAttribute('aria-pressed',active?'true':'false');
    if(autoTimer){clearInterval(autoTimer);autoTimer=0}
    if(active){
      var drop=function(){
        var dropButton=document.querySelector('[data-action="drop-plinko-ball"]');
        if(!isPlinkoActive()||!dropButton||!canDrop()){stopAuto();return}
        dropButton.click();
      };
      drop();
      autoTimer=setInterval(drop,1350);
    }
  }

  document.addEventListener('click',function(ev){
    var button=ev.target&&ev.target.closest&&ev.target.closest('button');
    if(!button)return;
    var action=button.getAttribute('data-action');
    if(action==='plinko-bet-half'){ev.preventDefault();multiplyBet(.5);return}
    if(action==='plinko-bet-double'){ev.preventDefault();multiplyBet(2);return}
    if(action==='toggle-autoplay'){ev.preventDefault();toggleAuto(button);return}
  });

  document.addEventListener('focusin',function(ev){
    if(ev.target&&ev.target.id==='plinkoBet')setBetKeyboard(true);
  });

  document.addEventListener('focusout',function(ev){
    if(ev.target&&ev.target.id==='plinkoBet')setTimeout(function(){setBetKeyboard(false)},120);
  });

  document.addEventListener('input',function(ev){
    if(ev.target&&ev.target.id==='plinkoBet')normalizeBet(ev.target.value);
  });

  document.addEventListener('visibilitychange',function(){
    if(document.visibilityState==='visible')syncHeaderCredit();
    if(!isPlinkoActive())stopAuto();
  });

  var observer=new MutationObserver(syncHeaderCredit);
  var start=function(){
    syncHeaderCredit();
    ['plinkoTonBalance','topTonBalance','plinkoCredit'].forEach(function(id){
      var source=q(id);
      if(source)observer.observe(source,{childList:true,characterData:true,subtree:true});
    });
  };
  if(window.MutationObserver){var root=q('plinko');if(root)new MutationObserver(function(){if(isPlinkoActive())syncHeaderCredit();else stopAuto()}).observe(root,{attributes:true,attributeFilter:['class']})}
  window.addEventListener('focus',syncHeaderCredit);
  window.addEventListener('vexa-ton-balance-sync',syncHeaderCredit);
  window.addEventListener('vexa-credit-sync',syncHeaderCredit);
  window.addEventListener('vexa-credit-game-change',syncHeaderCredit);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
`;