export const CREDIT_GUARD_SCRIPT = `
(function(){
  var lastOpenAt=0;
  var lastSignal='';
  var watched=typeof WeakSet==='function'?new WeakSet():null;
  var watcherList=[];
  var CANDIDATES='#toast,.toast,#minesMultiplier,[role="alert"],[aria-live],[id*="Status"],[id*="status"],[class*="status"],[id*="Message"],[id*="message"],[class*="message"],[id*="Notice"],[id*="notice"],[class*="notice"],[id*="Result"],[id*="result"],[class*="result"]';

  function normalizedText(value){return String(value||'').replace(/\\s+/g,' ').trim().toLowerCase()}
  function isInsufficientText(value){
    var text=normalizedText(value);
    if(!text||text.length>220)return false;
    if(/\\b(friend|opponent|other player) needs?\\b/.test(text))return false;
    return /\\bnot enough\\b/.test(text)||
      /\\binsufficient (?:balance|funds|credit|credits|points|ton|gram)\\b/.test(text)||
      /\\bbalance (?:is )?too low\\b/.test(text)||
      /\\byou need more (?:points|credit|credits|ton|gram)\\b/.test(text)||
      /\\bneed more (?:credit|credits)\\b/.test(text)||
      /\\bno (?:credit|credits|funds)\\b/.test(text);
  }
  function installStyle(){
    if(document.getElementById('vexa-credit-guard-style'))return;
    var style=document.createElement('style');
    style.id='vexa-credit-guard-style';
    style.textContent='@keyframes vexaCreditNeededCard{0%{transform:translateY(18px) scale(.91)}48%{transform:translateY(-5px) scale(1.025)}72%{transform:translateY(2px) scale(.992)}100%{transform:translateY(0) scale(1)}}#depositSheet.open .deposit-panel.vexa-credit-needed-card,#wallet.open .wallet-sheet-panel.vexa-credit-needed-card{animation:vexaCreditNeededCard .76s cubic-bezier(.16,1,.3,1) both!important;will-change:transform!important}';
    document.head.appendChild(style);
  }
  function animateWalletCard(){
    installStyle();
    var card=document.querySelector('#depositSheet.open .deposit-panel')||document.querySelector('#wallet.open .wallet-sheet-panel');
    if(!card)return false;
    card.classList.remove('vexa-credit-needed-card');
    void card.offsetWidth;
    card.classList.add('vexa-credit-needed-card');
    setTimeout(function(){card.classList.remove('vexa-credit-needed-card')},900);
    return true;
  }
  function haptic(){
    try{var tg=window.Telegram&&window.Telegram.WebApp;if(tg&&tg.HapticFeedback&&tg.HapticFeedback.notificationOccurred)tg.HapticFeedback.notificationOccurred('warning')}catch(e){}
  }
  function openWalletForCredit(detail){
    var now=Date.now();
    if(now-lastOpenAt<650)return false;
    lastOpenAt=now;
    haptic();
    if(document.body&&document.body.classList.contains('wallet-open')){
      animateWalletCard();
      return true;
    }
    var trigger=document.querySelector('.top-balance-plus[data-view="wallet"],[data-view="wallet"]');
    if(trigger&&typeof trigger.click==='function')trigger.click();
    setTimeout(animateWalletCard,40);
    setTimeout(animateWalletCard,180);
    try{window.dispatchEvent(new CustomEvent('vexa:credit-wallet-opened',{detail:detail||{}}))}catch(e){}
    return !!trigger;
  }
  function signal(value,detail){
    var text=normalizedText(value);
    if(!isInsufficientText(text))return false;
    var now=Date.now();
    if(text===lastSignal&&now-lastOpenAt<650)return false;
    lastSignal=text;
    return openWalletForCredit(Object.assign({message:String(value||'')},detail||{}));
  }
  function inspect(node){
    if(!node||node.nodeType!==1)return;
    var text=node.textContent||'';
    if(text)signal(text,{source:'ui'});
  }
  function watch(node){
    if(!node||node.nodeType!==1)return;
    if(watched&&watched.has(node))return;
    if(watched)watched.add(node);else if(watcherList.indexOf(node)!==-1)return;else watcherList.push(node);
    inspect(node);
    if(!window.MutationObserver)return;
    var observer=new MutationObserver(function(){inspect(node)});
    observer.observe(node,{childList:true,subtree:true,characterData:true});
  }
  function scan(root){
    if(!root||!root.querySelectorAll)return;
    if(root.matches&&root.matches(CANDIDATES))watch(root);
    Array.prototype.forEach.call(root.querySelectorAll(CANDIDATES),watch);
  }
  function bind(){
    installStyle();
    scan(document);
    window.addEventListener('vexa:section-mounted',function(ev){var id=ev&&ev.detail&&ev.detail.id;setTimeout(function(){scan((id&&document.getElementById(id))||document)},0)});
    window.addEventListener('vexa:insufficient-credit',function(ev){var detail=ev&&ev.detail||{};openWalletForCredit(detail)});
    document.addEventListener('vexa:insufficient-credit',function(ev){var detail=ev&&ev.detail||{};openWalletForCredit(detail)});
    if(window.MutationObserver&&document.body){
      new MutationObserver(function(mutations){mutations.forEach(function(mutation){Array.prototype.forEach.call(mutation.addedNodes||[],function(node){if(node&&node.nodeType===1)scan(node)})})}).observe(document.body,{childList:true,subtree:true});
    }
  }
  window.VexaCreditGuard={
    open:openWalletForCredit,
    insufficient:function(detail){return openWalletForCredit(detail||{})},
    signal:signal,
    isInsufficientText:isInsufficientText
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind);else bind();
})();
`;
