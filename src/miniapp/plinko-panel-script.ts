export const PLINKO_PANEL_SCRIPT = `
(function(){
  var autoTimer=0;

  function q(id){return document.getElementById(id)}

  function syncHeaderCredit(){
    var source=q('plinkoCredit');
    var header=q('plinkoCreditHeader');
    if(source&&header)header.textContent=source.textContent||'1000';
  }

  function currentCredit(){
    var source=q('plinkoCredit');
    return Math.max(0,Math.floor(Number(source&&source.textContent)||0));
  }

  function normalizeBet(value){
    var input=q('plinkoBet');
    var next=Math.floor(Number(value)||1);
    var credit=currentCredit();
    if(next<1)next=1;
    if(credit>0&&next>credit)next=credit;
    if(input)input.value=String(next);
  }

  function changeBet(delta){
    var input=q('plinkoBet');
    normalizeBet((Math.floor(Number(input&&input.value)||1))+delta);
  }

  function stopAuto(){
    if(autoTimer){clearInterval(autoTimer);autoTimer=0}
    var toggle=document.querySelector('[data-action="toggle-autoplay"]');
    if(toggle){toggle.classList.remove('active');toggle.setAttribute('aria-pressed','false')}
  }

  function toggleAuto(button){
    var active=!button.classList.contains('active');
    button.classList.toggle('active',active);
    button.setAttribute('aria-pressed',active?'true':'false');
    if(autoTimer){clearInterval(autoTimer);autoTimer=0}
    if(active){
      var drop=function(){
        var dropButton=document.querySelector('[data-action="drop-plinko-ball"]');
        if(!dropButton||currentCredit()<1){stopAuto();return}
        dropButton.click();
      };
      drop();
      autoTimer=setInterval(drop,1300);
    }
  }

  document.addEventListener('click',function(ev){
    var button=ev.target&&ev.target.closest&&ev.target.closest('button');
    if(!button)return;
    var action=button.getAttribute('data-action');
    if(action==='plinko-bet-minus'){ev.preventDefault();changeBet(-1);return}
    if(action==='plinko-bet-plus'){ev.preventDefault();changeBet(1);return}
    if(action==='toggle-autoplay'){ev.preventDefault();toggleAuto(button);return}
  });

  document.addEventListener('input',function(ev){
    if(ev.target&&ev.target.id==='plinkoBet')normalizeBet(ev.target.value);
  });

  var observer=new MutationObserver(syncHeaderCredit);
  var start=function(){
    syncHeaderCredit();
    var source=q('plinkoCredit');
    if(source)observer.observe(source,{childList:true,characterData:true,subtree:true});
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
  setInterval(syncHeaderCredit,1000);
})();
`;
