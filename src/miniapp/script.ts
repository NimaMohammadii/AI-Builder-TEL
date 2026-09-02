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

  var settingsSheet=null;
  var settingsCountries=[['IR','🇮🇷','Iran'],['TR','🇹🇷','Turkey'],['DE','🇩🇪','Germany'],['AE','🇦🇪','UAE'],['SA','🇸🇦','Saudi Arabia'],['RU','🇷🇺','Russia'],['IN','🇮🇳','India'],['BR','🇧🇷','Brazil'],['US','🇺🇸','United States'],['OTHER','🌐','Other']];
  function openTelegramLink(url){try{if(tg&&tg.openTelegramLink){tg.openTelegramLink(url);return}}catch(e){}window.location.href=url}
  function countryKey(){var user=tg&&tg.initDataUnsafe&&tg.initDataUnsafe.user;return 'vexa:country:'+String((user&&user.id)||storageGet('ownerId')||'guest')}
  function selectedCountry(){return storageGet(countryKey())}
  function setSelectedCountry(code){storageSet(countryKey(),code)}
  function ensureSettingsSheet(){
    if(settingsSheet)return settingsSheet;
    var style=document.createElement('style');
    style.textContent='#vexaSettingsSheet{position:fixed;inset:0;z-index:50000;display:flex;align-items:flex-end;padding:16px;opacity:0;pointer-events:none;background:rgba(5,2,3,.48);backdrop-filter:blur(7px);-webkit-backdrop-filter:blur(7px);transition:opacity .24s ease;font-family:ui-rounded,"SF Pro Rounded","Nunito",system-ui,sans-serif}#vexaSettingsSheet.open{opacity:1;pointer-events:auto}#vexaSettingsSheet .vexa-settings-panel{width:100%;max-width:520px;margin:auto;background:linear-gradient(155deg,rgba(39,18,25,.96),rgba(13,7,10,.985));border:1px solid rgba(255,255,255,.13);border-radius:27px;padding:17px;box-sizing:border-box;box-shadow:0 28px 80px rgba(0,0,0,.52),inset 0 1px 0 rgba(255,255,255,.12);transform:translateY(24px) scale(.975);transition:transform .3s cubic-bezier(.2,.85,.2,1)}#vexaSettingsSheet.open .vexa-settings-panel{transform:none}.vexa-settings-top{display:flex;align-items:center;justify-content:space-between;margin:2px 2px 15px}.vexa-settings-title{color:#fff;font-size:22px;font-weight:900;letter-spacing:-.055em}.vexa-settings-close{width:32px;height:32px;border:0;border-radius:50%;color:rgba(255,255,255,.68);background:rgba(255,255,255,.08);font:800 18px/1 system-ui}.vexa-settings-sub{margin:0 2px 13px;color:rgba(255,255,255,.48);font-size:11px;font-weight:800;letter-spacing:.07em;text-transform:uppercase}.vexa-settings-grid{display:grid;grid-template-columns:1fr 1fr;gap:9px}.vexa-settings-item{min-height:80px;padding:13px;border:1px solid rgba(255,255,255,.1);border-radius:18px;color:#fff;background:rgba(255,255,255,.055);text-align:left;font:inherit;transition:transform .18s ease,background .18s ease}.vexa-settings-item:active,.vexa-country-choice:active{transform:scale(.965);background:rgba(145,29,61,.34)}.vexa-settings-item b{display:block;margin-top:8px;font-size:13px;font-weight:900;letter-spacing:-.025em}.vexa-settings-item span{display:block;color:rgba(255,255,255,.48);font-size:11px;font-weight:700}.vexa-settings-item.country{grid-column:1/-1;min-height:57px;display:flex;align-items:center;justify-content:space-between}.vexa-settings-item.country b{margin:0}.vexa-settings-next{color:rgba(255,255,255,.62);font-size:17px}.vexa-settings-back{border:0;padding:0;color:rgba(255,255,255,.64);background:transparent;font:800 12px ui-rounded,"SF Pro Rounded",system-ui}.vexa-country-list{display:grid;grid-template-columns:1fr 1fr;gap:8px;max-height:53vh;overflow:auto;padding:1px}.vexa-country-choice{display:flex;align-items:center;gap:8px;min-height:46px;padding:0 10px;border:1px solid rgba(255,255,255,.09);border-radius:15px;color:rgba(255,255,255,.72);background:rgba(255,255,255,.045);font:800 12px ui-rounded,"SF Pro Rounded",system-ui;text-align:left;transition:transform .18s ease,background .18s ease,border-color .18s ease}.vexa-country-choice i{margin-left:auto;font-style:normal;opacity:0}.vexa-country-choice.selected{color:#fff;border-color:rgba(214,76,111,.7);background:linear-gradient(135deg,rgba(130,25,55,.72),rgba(216,73,108,.35))}.vexa-country-choice.selected i{opacity:1}';
    document.head.appendChild(style);
    settingsSheet=document.createElement('div');
    settingsSheet.id='vexaSettingsSheet';
    settingsSheet.innerHTML='<div class="vexa-settings-panel" role="dialog" aria-modal="true"></div>';
    settingsSheet.addEventListener('click',function(event){if(event.target===settingsSheet)closeMiniAppSettings()});
    document.body.appendChild(settingsSheet);
    return settingsSheet;
  }
  function selectedCountryLabel(){var item=settingsCountries.filter(function(country){return country[0]===selectedCountry()})[0];return item?item[1]+' '+item[2]:'Not selected'}
  function renderSettingsHome(){
    var panel=ensureSettingsSheet().querySelector('.vexa-settings-panel');
    panel.innerHTML='<div class="vexa-settings-top"><div class="vexa-settings-title">Settings</div><button class="vexa-settings-close" type="button" data-settings-close>×</button></div><p class="vexa-settings-sub">Vexa preferences</p><div class="vexa-settings-grid"><button class="vexa-settings-item" type="button" data-settings-open-chat>◌<b>Open Chat</b><span>Talk to Vexa</span></button><button class="vexa-settings-item" type="button" data-settings-invite>↗<b>Invite Friends</b><span>Share Vexa</span></button><button class="vexa-settings-item country" type="button" data-settings-country><span><b>Country</b><span>'+selectedCountryLabel()+'</span></span><b class="vexa-settings-next">›</b></button></div>';
    panel.onclick=function(event){var button=event.target.closest('button');if(!button)return;if(button.hasAttribute('data-settings-close'))return closeMiniAppSettings();if(button.hasAttribute('data-settings-open-chat'))return openTelegramLink('https://t.me/VexaAppBOT');if(button.hasAttribute('data-settings-invite'))return openTelegramLink('https://t.me/share/url?url='+encodeURIComponent('https://t.me/VexaAppBOT')+'&text='+encodeURIComponent('Play Vexa with me'));if(button.hasAttribute('data-settings-country'))renderCountrySettings()};
  }
  function renderCountrySettings(){
    var panel=ensureSettingsSheet().querySelector('.vexa-settings-panel');
    panel.innerHTML='<div class="vexa-settings-top"><button class="vexa-settings-back" type="button" data-settings-back>‹ Back</button><button class="vexa-settings-close" type="button" data-settings-close>×</button></div><div class="vexa-settings-title" style="margin:0 2px 8px">Country</div><p class="vexa-settings-sub">Choose your country</p><div class="vexa-country-list">'+settingsCountries.map(function(country){var active=country[0]===selectedCountry();return '<button class="vexa-country-choice'+(active?' selected':'')+'" type="button" data-country="'+country[0]+'"><span>'+country[1]+'</span><span>'+country[2]+'</span><i>✓</i></button>'}).join('')+'</div>';
    panel.onclick=function(event){var button=event.target.closest('button');if(!button)return;if(button.hasAttribute('data-settings-close'))return closeMiniAppSettings();if(button.hasAttribute('data-settings-back'))return renderSettingsHome();var code=button.getAttribute('data-country');if(!code)return;setSelectedCountry(code);try{window.dispatchEvent(new CustomEvent('vexa:country-changed',{detail:{country:code}}))}catch(e){}renderSettingsHome()};
  }
  function closeMiniAppSettings(){if(!settingsSheet)return;settingsSheet.classList.remove('open')}
  function openMiniAppSettings(){ensureSettingsSheet();renderSettingsHome();settingsSheet.classList.add('open')}
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
