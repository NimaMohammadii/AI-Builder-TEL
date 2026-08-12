export const MINIAPP_SCRIPT = `
(function(){
  var tg=window.Telegram&&window.Telegram.WebApp;
  function expandMiniApp(){
    if(!tg)return;
    try{tg.ready&&tg.ready()}catch(e){}
    try{tg.expand&&tg.expand()}catch(e){}
    try{tg.requestFullscreen&&tg.requestFullscreen()}catch(e){}
    try{tg.disableVerticalSwipes&&tg.disableVerticalSwipes()}catch(e){}
  }
  expandMiniApp();
  setTimeout(expandMiniApp,120);
  setTimeout(expandMiniApp,500);
  setTimeout(expandMiniApp,1200);

  var telegramUserId=String((tg&&tg.initDataUnsafe&&tg.initDataUnsafe.user&&tg.initDataUnsafe.user.id)||'');
  function storageGet(key){try{return window.localStorage?localStorage.getItem(key):''}catch(e){return ''}}
  function storageSet(key,value){try{if(window.localStorage)localStorage.setItem(key,value)}catch(e){}}
  var ownerId=telegramUserId||storageGet('ownerId')||'';
  var sectionTitles={home:'Lucky Zone',predictzone:'Predict',rewards:'Rewards',results:'Bot Control',playzone:'Play Hub',wallet:'Wallet',mines:'Mines',plinko:'Plinko',crash:'Crash',wheel:'Wheel',dice:'Dice',tower:'Dragon Tower',slot:'Slot',coinflip:'Pump',hilo:'Chicken Cross',ghostrun:'Ghost Run'};

  function q(id){return document.getElementById(id)}
  function setText(id,v){var n=q(id);if(n)n.textContent=v}
  function toast(v){var n=q('toast');if(!n)return;n.textContent=v;n.style.display='block';setTimeout(function(){n.style.display='none'},3000)}
  function setKeyboardOpen(open){document.body.classList.toggle('keyboard-open',!!open)}
  function dismissKeyboard(){var active=document.activeElement;if(active&&typeof active.blur==='function')active.blur();setKeyboardOpen(false)}
  function setWalletSheet(open){ensureSection('wallet');var s=q('wallet');if(!s)return;if(open&&s.parentElement!==document.body)document.body.appendChild(s);document.body.classList.toggle('wallet-open',!!open);s.classList.toggle('open',!!open);s.setAttribute('aria-hidden',open?'false':'true')}
  function handleBackButton(){show('home')}
  function syncTelegramBackButton(id){
    if(!tg||!tg.BackButton)return;
    try{tg.BackButton.offClick(handleBackButton)}catch(e){}
    if(id==='wallet'){
      try{tg.BackButton.onClick(handleBackButton);tg.BackButton.show()}catch(e){}
    }else{
      try{tg.BackButton.hide()}catch(e){}
    }
  }

  function removeLegacyLeagueAndRewards(){
    ['leaderboardEntry','leaderboardPage','rewardsPage'].forEach(function(id){var n=q(id);if(n&&n.parentNode)n.parentNode.removeChild(n)});
    document.querySelectorAll('.home-leaderboard-entry,.home-rewards-entry,[data-action="open-leaderboard"],[data-action="open-rewards"]').forEach(function(n){try{n.remove()}catch(e){}});
    document.body.classList.remove('leaderboard-open','rewards-open');
  }

  function setHeaderGlassMode(id){document.body.classList.toggle('header-glass-mode',id==='playzone')}

  function initHomeGlassButton(){
    var btn=q('homeGlassButton');if(!btn)return;
    var storageKey='homeGlassButtonPosition';
    var size=68;var startX=0;var startY=0;var baseX=0;var baseY=0;var didDrag=false;var pointerId=null;
    function bounds(){var w=Math.max(document.documentElement.clientWidth||0,window.innerWidth||0);var h=Math.max(document.documentElement.clientHeight||0,window.innerHeight||0);var r=btn.getBoundingClientRect();size=Math.max(r.width||68,r.height||68);return{minX:10,maxX:Math.max(10,w-size-10),minY:Math.max(10,(tg&&tg.safeAreaInset&&tg.safeAreaInset.top||0)+10),maxY:Math.max(10,h-size-104)}}
    function clamp(v,min,max){return Math.max(min,Math.min(max,v))}
    function apply(x,y,save){var b=bounds();var nx=clamp(x,b.minX,b.maxX);var ny=clamp(y,b.minY,b.maxY);btn.style.left=nx+'px';btn.style.top=ny+'px';btn.style.right='auto';btn.style.bottom='auto';if(save)try{localStorage.setItem(storageKey,JSON.stringify({x:nx,y:ny}))}catch(e){}}
    function load(){var b=bounds();var pos=null;try{pos=JSON.parse(localStorage.getItem(storageKey)||'null')}catch(e){};if(pos&&isFinite(pos.x)&&isFinite(pos.y)){apply(Number(pos.x),Number(pos.y),false)}else{apply(b.maxX-4,b.minY+110,false)}}
    btn.addEventListener('pointerdown',function(ev){if(ev.button!==undefined&&ev.button!==0)return;var r=btn.getBoundingClientRect();pointerId=ev.pointerId;startX=ev.clientX;startY=ev.clientY;baseX=r.left;baseY=r.top;didDrag=false;btn.classList.add('is-dragging');try{btn.setPointerCapture(pointerId)}catch(e){}}, {passive:true});
    btn.addEventListener('pointermove',function(ev){if(pointerId!==ev.pointerId)return;var dx=ev.clientX-startX;var dy=ev.clientY-startY;if(Math.abs(dx)+Math.abs(dy)>7)didDrag=true;apply(baseX+dx,baseY+dy,false)});
    function finish(ev){if(pointerId!==ev.pointerId)return;pointerId=null;btn.classList.remove('is-dragging');var r=btn.getBoundingClientRect();apply(r.left,r.top,true);setTimeout(function(){didDrag=false},80)}
    btn.addEventListener('pointerup',finish);btn.addEventListener('pointercancel',finish);
    btn.addEventListener('click',function(ev){if(didDrag){ev.preventDefault();ev.stopPropagation();}},true);
    window.addEventListener('resize',function(){var r=btn.getBoundingClientRect();apply(r.left,r.top,true)});
    load();
  }

  function ensureSection(id){return !id||q(id)||(window.VexaLazySections&&window.VexaLazySections.ensure&&window.VexaLazySections.ensure(id))}

  function show(id){
    if(id==='wallet'){setWalletSheet(true);return}
    ensureSection(id);
    document.querySelectorAll('.view').forEach(function(n){n.classList.remove('active')});
    var v=q(id);if(v)v.classList.add('active');
    document.querySelectorAll('.tab').forEach(function(n){n.classList.toggle('active',n.getAttribute('data-view')===id)});
    setText('brandTitle',sectionTitles[id]||'Vexa');
    setHeaderGlassMode(id);
    syncTelegramBackButton(id);
    try{window.dispatchEvent(new CustomEvent('vexa:view-changed',{detail:{id:id}}))}catch(e){}
    if(window.VexaSectionLocks&&window.VexaSectionLocks.reload)setTimeout(function(){window.VexaSectionLocks.reload()},30);
    if(window.VexaApplySectionBackgrounds)setTimeout(function(){window.VexaApplySectionBackgrounds()},30);
    removeLegacyLeagueAndRewards();
  }

  function openInitialTarget(){
    try{
      var params=new URLSearchParams(location.search);
      var section=(params.get('section')||location.hash.replace(/^#/, '')||'').replace(/[^0-9A-Za-z_-]/g,'').slice(0,40);
      if(section&&ensureSection(section))show(section);
    }catch(e){}
  }

  function initPlayZoneGameNavigation(){
    document.addEventListener('click',function(ev){
      var target=ev.target;
      var nav=target&&target.closest?target.closest('#playzone [data-game-view]'):null;
      if(!nav)return;
      var button=nav.matches&&nav.matches('button[data-game-view]')?nav:(nav.querySelector&&nav.querySelector('button[data-game-view]'));
      var id=(nav.getAttribute('data-game-view')||(button&&button.getAttribute('data-game-view'))||'').replace(/[^0-9A-Za-z_-]/g,'').slice(0,40);
      if(!id)return;
      ev.preventDefault();ev.stopPropagation();ev.stopImmediatePropagation();
      if(ensureSection(id)){
        var animated=button||nav;
        animated.classList.add('is-soft-entering');
        document.body.classList.add('soft-game-entering');
        setTimeout(function(){show(id);animated.classList.remove('is-soft-entering');document.body.classList.remove('soft-game-entering')},180);
        return;
      }
      toast('Coming soon');
    },true);
  }

  async function api(path,opt){
    opt=opt||{};
    var r=await fetch(path,Object.assign({},opt,{headers:Object.assign({'content-type':'application/json'},opt.headers||{})}));
    var j=await r.json().catch(function(){return{error:'Invalid response'}});
    if(!r.ok)throw new Error(j.error||'Request failed');
    return j;
  }

  function rankFallback(level){level=Math.max(1,Math.floor(Number(level)||1));if(level>=60)return 'Titan';if(level>=40)return 'Legend';if(level>=25)return 'Master';if(level>=15)return 'Elite';if(level>=8)return 'Pro';if(level>=4)return 'Explorer';return 'Rookie'}
  function renderLevel(profile){var n=q('userLine');var level=Math.max(1,Math.floor(Number(profile&&profile.level)||1));var progress=Math.max(0,Math.min(100,Math.floor(Number(profile&&profile.progressPercent)||0)));var left=Math.max(0,Math.floor(Number(profile&&profile.xpLeft)||0));var next=Math.floor(Number(profile&&profile.nextLevelXp)||0);var xp=Math.max(0,Math.floor(Number(profile&&profile.xp)||0));if(next>0){progress=Math.max(0,Math.min(100,Math.floor((Math.min(xp,next)/next)*100)));if(!left)left=Math.max(0,next-Math.min(xp,next))}var rank=String((profile&&profile.rankName)||rankFallback(level));var pill=q('rankPill');if(pill)pill.textContent=rank;if(!n)return;n.innerHTML='<span style="display:block;color:#fff;font-weight:800;font-size:12px;line-height:1">Level '+level+' <span style="color:rgba(255,255,255,.55);font-weight:700">• '+progress+'%</span></span><span style="display:block;width:158px;height:6px;margin-top:6px;border-radius:999px;background:rgba(255,255,255,.12);overflow:hidden"><span style="display:block;width:'+progress+'%;height:100%;border-radius:999px;background:linear-gradient(90deg,#5b0f24,#8f1d3d,#c03a5b);box-shadow:0 0 14px rgba(192,58,91,.48)"></span></span><span style="display:block;margin-top:5px;color:rgba(255,255,255,.5);font-size:9.5px;line-height:1">'+left+' XP left</span>'}
  async function loadLevel(){if(window.VexaLevel&&typeof window.VexaLevel.load==='function'){window.VexaLevel.load();return}if(!ownerId)return;try{var profile=await api('/app/api/level?userId='+encodeURIComponent(ownerId),{cache:'no-store',headers:{'accept':'application/json','cache-control':'no-store'}});if(window.VexaLevel)return;renderLevel(profile)}catch(e){}}
  function userLine(){loadLevel()}

  async function depositStars(stars){
    var amount=Math.floor(Number(stars)||0);
    if(!ownerId)return toast('Telegram user not found');
    if(!amount||amount<1)return toast('Enter a valid Stars amount');
    var status=q('depositStatus');
    if(status)status.textContent='Creating secure Telegram invoice';
    try{var d=await api('/app/api/stars/deposits',{method:'POST',body:JSON.stringify({userId:ownerId,stars:amount})});if(status)status.textContent='Opening Telegram Stars payment';if(d.invoiceLink){if(tg&&typeof tg.openInvoice==='function'){tg.openInvoice(d.invoiceLink,function(state){if(status)status.textContent=state==='paid'?'Payment received Balance will update shortly':'Payment status: '+state;if(state==='paid'&&window.VexaTonBalance&&window.VexaTonBalance.load)setTimeout(function(){window.VexaTonBalance.load()},900);if(state==='paid')setTimeout(loadLevel,1100)})}else{window.location.href=d.invoiceLink}}}catch(x){if(status)status.textContent=x.message;toast(x.message)}
  }

  function saveUser(){ownerId=telegramUserId||(q('ownerId')&&q('ownerId').value.trim())||ownerId;storageSet('ownerId',ownerId);userLine()}

  document.body.addEventListener('click',function(ev){
    var target=ev.target;
    var b=target&&target.closest?target.closest('button'):null;
    if(!b){var w=q('voiceWrap');if(w)w.classList.remove('open');return}
    if(b.hasAttribute('data-game-view'))return;
    var v=b.getAttribute('data-view');if(v){ev.preventDefault();if(ensureSection(v))show(v);else toast('Coming soon');return}
    var stars=b.getAttribute('data-stars-deposit');if(stars){depositStars(stars);return}
    var a=b.getAttribute('data-action');
    if(a==='open-rewards'||a==='close-rewards'||a==='open-leaderboard'||a==='close-leaderboard'){removeLegacyLeagueAndRewards();return}
    if(a==='close-wallet'){setWalletSheet(false);return}
    if(a==='deposit-custom-stars'){depositStars(q('starsAmount')&&q('starsAmount').value);return}
    if(a==='dismiss-keyboard'){dismissKeyboard();return}
    if(a==='save-user')saveUser();
  });

  if(ownerId)storageSet('ownerId',ownerId);
  if(q('ownerId'))q('ownerId').value=ownerId;
  removeLegacyLeagueAndRewards();
  setTimeout(removeLegacyLeagueAndRewards,50);
  setTimeout(removeLegacyLeagueAndRewards,400);
  initHomeGlassButton();
  initPlayZoneGameNavigation();
  setText('brandTitle',sectionTitles.home);
  setHeaderGlassMode('home');
  syncTelegramBackButton('home');
  setTimeout(openInitialTarget,250);
  setTimeout(openInitialTarget,900);
})();
`;
