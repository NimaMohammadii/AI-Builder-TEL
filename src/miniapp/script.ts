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

  function openTelegramLink(url){try{if(tg&&tg.openTelegramLink){tg.openTelegramLink(url);return}}catch(e){}window.location.href=url}
  function timeZoneCountry(){
    var zone='';try{zone=Intl.DateTimeFormat().resolvedOptions().timeZone||''}catch(e){}
    var labels={'Asia/Tehran':'Iran','Europe/Istanbul':'Turkey','Europe/Berlin':'Germany','Asia/Dubai':'UAE','Asia/Riyadh':'Saudi Arabia','Europe/Moscow':'Russia','Asia/Kolkata':'India','America/Sao_Paulo':'Brazil','America/New_York':'United States','America/Chicago':'United States','America/Denver':'United States','America/Los_Angeles':'United States'};
    return labels[zone]||'Other';
  }
  function openMiniAppSettings(){
    if(!tg||!tg.showPopup)return;
    tg.showPopup({
      title:'Vexa',
      message:'Choose an action',
      buttons:[
        {id:'country',type:'default',text:'Country · '+timeZoneCountry()},
        {id:'open-chat',type:'default',text:'Open Chat'},
        {id:'invite-friends',type:'default',text:'Invite Friends'}
      ]
    },function(id){
      if(id==='open-chat'){openTelegramLink('https://t.me/VexaAppBOT');return}
      if(id==='invite-friends')openTelegramLink('https://t.me/share/url?url='+encodeURIComponent('https://t.me/VexaAppBOT')+'&text='+encodeURIComponent('Play Vexa with me'))
    });
  }
  function initTelegramSettings(){
    if(!tg||!tg.SettingsButton)return;
    try{tg.SettingsButton.offClick(openMiniAppSettings)}catch(e){}
    try{tg.SettingsButton.onClick(openMiniAppSettings)}catch(e){}
    try{tg.SettingsButton.show()}catch(e){}
  }
  initTelegramSettings();

  var telegramUserId=String((tg&&tg.initDataUnsafe&&tg.initDataUnsafe.user&&tg.initDataUnsafe.user.id)||'');
  function storageGet(key){try{return window.localStorage?localStorage.getItem(key):''}catch(e){return ''}}
  function storageSet(key,value){try{if(window.localStorage)localStorage.setItem(key,value)}catch(e){}}
  var ownerId=telegramUserId||storageGet('ownerId')||'';
  var sectionTitles={home:'Lucky Zone',predictzone:'Predict',rewards:'Rewards',results:'Bot Control',playzone:'Play Hub',mines:'Mines',plinko:'Plinko',crash:'Crash',wheel:'Wheel',dice:'Dice',tower:'Dragon Tower',slot:'Slot',coinflip:'Pump',ghostrun:'Ghost Run'};

  function q(id){return document.getElementById(id)}
  function setText(id,v){var n=q(id);if(n)n.textContent=v}
  function toast(v){var n=q('toast');if(!n)return;n.textContent=v;n.style.display='block';setTimeout(function(){n.style.display='none'},3000)}
  function setKeyboardOpen(open){document.body.classList.toggle('keyboard-open',!!open)}
  function dismissKeyboard(){var active=document.activeElement;if(active&&typeof active.blur==='function')active.blur();setKeyboardOpen(false)}
  function handleBackButton(){show('home')}
  function syncTelegramBackButton(id){
    if(!tg||!tg.BackButton)return;
    try{tg.BackButton.offClick(handleBackButton)}catch(e){}
    try{tg.BackButton.hide()}catch(e){}
  }
  function ensureSection(id){return !id||q(id)||(window.VexaLazySections&&window.VexaLazySections.ensure&&window.VexaLazySections.ensure(id))}

  function show(id){
    if(!ensureSection(id))return false;
    document.querySelectorAll('.view').forEach(function(n){n.classList.remove('active')});
    var v=q(id);if(v)v.classList.add('active');
    document.querySelectorAll('.tab').forEach(function(n){n.classList.toggle('active',n.getAttribute('data-view')===id)});
    setText('brandTitle',sectionTitles[id]||'Vexa');
    syncTelegramBackButton(id);
    try{window.dispatchEvent(new CustomEvent('vexa:view-changed',{detail:{id:id}}))}catch(e){}
    if(window.VexaSectionLocks&&window.VexaSectionLocks.reload)setTimeout(function(){window.VexaSectionLocks.reload()},30);
    if(window.VexaApplySectionBackgrounds)setTimeout(function(){window.VexaApplySectionBackgrounds()},30);
    return true;
  }

  function openInitialTarget(){
    try{
      var params=new URLSearchParams(location.search);
      var section=(params.get('section')||location.hash.replace(/^#/, '')||'').replace(/[^0-9A-Za-z_-]/g,'').slice(0,40);
      if(!section)return;
      var open=function(){if(ensureSection(section))show(section)};
      var lazy=window.VexaLazySections;
      if(lazy&&typeof lazy.isGame==='function'&&lazy.isGame(section)&&window.__vexaPlayZoneVisibilityReady){Promise.resolve(window.__vexaPlayZoneVisibilityReady).then(open);return}
      open();
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


  function saveUser(){ownerId=telegramUserId||(q('ownerId')&&q('ownerId').value.trim())||ownerId;storageSet('ownerId',ownerId);userLine()}

  document.body.addEventListener('click',function(ev){
    var target=ev.target;
    var b=target&&target.closest?target.closest('button'):null;
    if(!b){var w=q('voiceWrap');if(w)w.classList.remove('open');return}
    if(b.hasAttribute('data-game-view'))return;
    var v=b.getAttribute('data-view');if(v){ev.preventDefault();if(show(v))return;toast('Coming soon');return}
    var a=b.getAttribute('data-action');
    if(a==='dismiss-keyboard'){dismissKeyboard();return}
    if(a==='save-user')saveUser();
  });

  if(ownerId)storageSet('ownerId',ownerId);
  if(q('ownerId'))q('ownerId').value=ownerId;
  initPlayZoneGameNavigation();
  setText('brandTitle',sectionTitles.home);
  syncTelegramBackButton('home');
  setTimeout(openInitialTarget,250);
  setTimeout(openInitialTarget,900);
})();
`;
