export const SECTION_LOCK_SCRIPT = `
(function(){
  var locks={};
  var userBlocked={};
  var userCredit=null;
  var lastSyncedCredit=null;
  var unlocked={};
  var preloaded={};
  var originalConnectBotCardHtml='';
  var lastFullLoadAt=0;
  var lastUserLoadAt=0;
  var FULL_RELOAD_COOLDOWN_MS=300000;
  var USER_RELOAD_COOLDOWN_MS=60000;
  var GLOBAL_CACHE_KEY='vexaSectionLocks:v1';
  var USER_CACHE_PREFIX='vexaUserControls:';
  var tg=window.Telegram&&window.Telegram.WebApp;
  var user=(tg&&tg.initDataUnsafe&&tg.initDataUnsafe.user)||{};
  var lockSvg='<svg viewBox="0 0 64 64" fill="none" aria-hidden="true"><rect x="18" y="28" width="28" height="24" rx="8" stroke="currentColor" stroke-width="3"/><path d="M23 28v-7a9 9 0 0 1 18 0v7" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><circle cx="32" cy="40" r="2.5" fill="currentColor"/></svg>';
  var dismissSvg='<svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  function userId(){return String(user.id||localStorage.getItem('ownerId')||'').trim()}
  function lockId(id){return id==='predictzone'?'predict':id}
  function storageKey(id){return 'sectionUnlocked:'+lockId(id)}
  function cacheUserKey(){var id=userId();return id?USER_CACHE_PREFIX+id:''}
  function readJson(key){try{return key?JSON.parse(localStorage.getItem(key)||'null'):null}catch(e){return null}}
  function writeJson(key,value){try{if(key)localStorage.setItem(key,JSON.stringify(value||{}))}catch(e){}}
  function isUnlocked(id){id=lockId(id);return unlocked[id]||sessionStorage.getItem(storageKey(id))==='1'}
  function setUnlocked(id){id=lockId(id);unlocked[id]=true;sessionStorage.setItem(storageKey(id),'1')}
  function visualUrl(item){if(!item)return '';return item.mode==='code'?(item.codeImageUrl||''):(item.lockedImageUrl||item.imageUrl||'')}
  function preload(url){if(!url||preloaded[url])return;preloaded[url]=true;var img=new Image();img.decoding='async';img.src=url}
  function preloadLockImages(){Object.keys(locks).forEach(function(id){if(id==='connect-bot-card')return;var item=locks[id];preload(item.lockedImageUrl||item.imageUrl||'');preload(item.codeImageUrl||'')})}
  function formatLeft(ms){ms=Math.max(0,Math.floor(Number(ms)||0));var d=Math.floor(ms/86400000),h=Math.floor(ms/3600000)%24,m=Math.floor(ms/60000)%60,sec=Math.floor(ms/1000)%60;return d+'d '+String(h).padStart(2,'0')+':'+String(m).padStart(2,'0')+':'+String(sec).padStart(2,'0')}
  function countdownHtml(item){return item&&item.expiresAt?'<p>Opens in <span data-section-lock-expires-at="'+item.expiresAt+'">'+formatLeft(item.remainingMs)+'</span></p>':''}
  function tickCountdowns(){document.querySelectorAll('[data-section-lock-expires-at]').forEach(function(el){el.textContent=formatLeft(Date.parse(el.getAttribute('data-section-lock-expires-at')||'')-Date.now())})}
  function lockVisual(item){var url=visualUrl(item);if(url){preload(url);return '<img class="section-lock-image" src="'+url+'" alt="" decoding="async"/>'}return lockSvg}
  function botCardVisual(item){return '<span class="connect-card-lock-icon">'+lockSvg+'</span>'}
  function setKeyboardMode(on){document.body.classList.toggle('section-code-keyboard-open',!!on);updateKeyboardInset()}
  function updateKeyboardInset(){var vv=window.visualViewport;var inset=0;if(vv){inset=Math.max(0,window.innerHeight-vv.height-vv.offsetTop)}document.documentElement.style.setProperty('--section-keyboard-inset',inset+'px')}
  if(window.visualViewport){window.visualViewport.addEventListener('resize',updateKeyboardInset);window.visualViewport.addEventListener('scroll',updateKeyboardInset)}

  function syncCredit(){
    if(userCredit===null||userCredit===undefined)return;
    var credit=Math.max(0,Math.floor(Number(userCredit)||0));
    [document.getElementById('plinkoCredit'),document.getElementById('plinkoCreditHeader'),document.getElementById('creditCount')].forEach(function(el){if(el)el.textContent=String(credit)});
    if(lastSyncedCredit!==credit){lastSyncedCredit=credit;try{window.dispatchEvent(new CustomEvent('vexa-credit-sync',{detail:{credit:credit}}))}catch(e){}}
  }

  function focusCodeInput(input, view){
    if(!input)return;
    view&&view.classList.add('code-focused');setKeyboardMode(true);updateKeyboardInset();
    try{input.focus({preventScroll:true})}catch(e){input.focus()}
    setTimeout(updateKeyboardInset,80);setTimeout(updateKeyboardInset,260);setTimeout(updateKeyboardInset,520);
  }

  function connectBotCard(){var connect=document.getElementById('connect');return connect&&connect.querySelector(':scope > .card:first-of-type')}
  function lockedCardHtml(item){
    if(item&&item.mode==='code'){
      return '<div class="connect-card-locked-view connect-card-code-view">'+botCardVisual(item)+'<h2>Access code</h2><p>Enter code to connect a bot.</p>'+countdownHtml(item)+'<input class="connect-card-code-input" type="text" placeholder="Access code" autocomplete="one-time-code" autocapitalize="off" spellcheck="false"/><button class="connect-card-code-submit" type="button">Unlock</button><small class="connect-card-code-status"></small></div>';
    }
    return '<div class="connect-card-locked-view">'+botCardVisual(item)+'<h2>Locked</h2>'+(countdownHtml(item)||'<p>Bot token connection is currently unavailable.</p>')+'</div>';
  }
  function bindBotCardCode(card){
    var input=card.querySelector('.connect-card-code-input');
    var button=card.querySelector('.connect-card-code-submit');
    var status=card.querySelector('.connect-card-code-status');
    if(!input||!button)return;
    var submit=function(){
      var code=(input.value||'').trim();
      if(!code){status.textContent='Enter the access code.';input.focus();return}
      status.textContent='Checking...';
      fetch('/app/api/section-locks/verify',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({sectionId:'connect-bot-card',code:code})}).then(function(r){return r.json().then(function(j){return {ok:r.ok,json:j}})}).then(function(res){
        if(res.ok&&res.json&&res.json.ok){setUnlocked('connect-bot-card');applyLocks();return}
        status.textContent=(res.json&&res.json.error)||'Wrong access code.';input.focus();
      }).catch(function(){status.textContent='Could not verify code.'});
    };
    button.addEventListener('click',submit);
    input.addEventListener('keydown',function(e){if(e.key==='Enter')submit()});
  }
  function ensureBotCardOverlay(item){
    var card=connectBotCard();if(!card)return;
    if(!originalConnectBotCardHtml)originalConnectBotCardHtml=card.innerHTML;
    card.classList.add('connect-bot-card-locked');
    card.innerHTML=lockedCardHtml(item);
    bindBotCardCode(card);
  }
  function clearBotCardOverlay(){
    var card=connectBotCard();if(!card)return;
    if(card.classList.contains('connect-bot-card-locked')&&originalConnectBotCardHtml)card.innerHTML=originalConnectBotCardHtml;
    card.classList.remove('connect-bot-card-locked');
  }

  function ensureOverlay(section, item){
    if(!section)return;
    var old=section.querySelector('.section-locked-view');if(old)old.remove();
    var view=document.createElement('div');view.className='section-locked-view';
    if(item&&item.mode==='code'){
      view.classList.add('section-code-view');
      view.innerHTML='<button class="section-keyboard-dismiss" type="button" aria-label="Hide keyboard">'+dismissSvg+'</button><div class="section-locked-card code-card">'+lockVisual(item)+'<h2>Enter access code</h2><p>This section requires an access code.</p>'+countdownHtml(item)+'<input class="section-code-input" type="text" inputmode="text" placeholder="Access code" autocomplete="one-time-code" autocapitalize="off" spellcheck="false" enterkeyhint="done"/><button class="section-code-submit" type="button">Unlock</button><small class="section-code-status"></small></div>';
      var input=view.querySelector('.section-code-input');var button=view.querySelector('.section-code-submit');var status=view.querySelector('.section-code-status');var dismiss=view.querySelector('.section-keyboard-dismiss');
      var submit=function(){
        var code=(input&&input.value||'').trim();
        if(!code){status.textContent='Enter the access code.';focusCodeInput(input,view);return}
        status.textContent='Checking...';
        fetch('/app/api/section-locks/verify',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({sectionId:lockId(section.id),code:code})}).then(function(r){return r.json().then(function(j){return {ok:r.ok,json:j}})}).then(function(res){
          if(res.ok&&res.json&&res.json.ok){setKeyboardMode(false);setUnlocked(section.id);applyLocks();return}
          status.textContent=(res.json&&res.json.error)||'Wrong access code.';focusCodeInput(input,view);
        }).catch(function(){status.textContent='Could not verify code.';focusCodeInput(input,view)});
      };
      button.addEventListener('click',submit);input.addEventListener('touchstart',function(){focusCodeInput(input,view)},{passive:true});input.addEventListener('mousedown',function(){focusCodeInput(input,view)});input.addEventListener('click',function(){focusCodeInput(input,view)});input.addEventListener('focus',function(){focusCodeInput(input,view)});input.addEventListener('blur',function(){view.classList.remove('code-focused');setTimeout(function(){if(document.activeElement!==input)setKeyboardMode(false)},160)});input.addEventListener('keydown',function(e){if(e.key==='Enter')submit()});dismiss.addEventListener('touchstart',function(e){e.preventDefault();input.blur();setKeyboardMode(false)},{passive:false});dismiss.addEventListener('click',function(){input.blur();setKeyboardMode(false)});
    }else{
      var text=(item&&item.userBlocked)?'Your access to this section is currently restricted.':'This section is currently unavailable.';
      view.innerHTML='<div class="section-locked-card">'+lockVisual(item)+'<h2>'+text+'</h2>'+(countdownHtml(item)||'<p>Please try again later.</p>')+'</div>';
    }
    section.appendChild(view);tickCountdowns();
  }

  function applyLocks(){
    syncCredit();
    var cardItem=locks['connect-bot-card'];
    var cardLocked=!!cardItem&&cardItem.mode!=='open'&&!isUnlocked('connect-bot-card');
    if(cardLocked)ensureBotCardOverlay(cardItem);else clearBotCardOverlay();
    document.querySelectorAll('.view').forEach(function(section){
      var id=section.id, lid=lockId(id);var globalItem=locks[lid];var item=(userBlocked[lid])?Object.assign({},globalItem||{}, userBlocked[lid], {mode:'locked',locked:true,userBlocked:true}):globalItem;
      var isLocked=!!item&&item.mode!=='open'&&!isUnlocked(lid);
      section.classList.toggle('is-section-locked',isLocked);
      if(isLocked&&item.mode!=='loading')ensureOverlay(section,item);else{var old=section.querySelector('.section-locked-view:not(.section-loading-mode)');if(old)old.remove()}
    });
  }

  function applyGlobalData(data){locks={};(data&&data.sections||[]).forEach(function(section){locks[section.id]={mode:section.mode||((section.locked)?'locked':'open'),locked:!!section.locked,expiresAt:section.expiresAt||null,remainingMs:section.remainingMs==null?null:Number(section.remainingMs),hasCode:!!section.hasCode,imageUrl:section.imageUrl||null,hasImage:!!section.hasImage,lockedImageUrl:section.lockedImageUrl||section.imageUrl||null,codeImageUrl:section.codeImageUrl||null}});preloadLockImages()}
  function applyUserData(data){userBlocked={};if(!data)return;if(Array.isArray(data.sectionBlocks)){data.sectionBlocks.forEach(function(item){if(item&&item.blocked)userBlocked[item.sectionId]={expiresAt:item.expiresAt||null,remainingMs:item.remainingMs==null?null:Number(item.remainingMs)}})}else{(data.blockedSections||[]).forEach(function(section){userBlocked[section]={expiresAt:null,remainingMs:null}})}userCredit=data.credit===null||data.credit===undefined?null:Number(data.credit)}
  function applyCachedLocks(){var global=readJson(GLOBAL_CACHE_KEY);if(global)applyGlobalData(global);var userCache=readJson(cacheUserKey());if(userCache)applyUserData(userCache);applyLocks()}
  function loadGlobalLocks(){return fetch('/app/api/section-locks',{cache:'no-store'}).then(function(r){return r.json()}).then(function(data){writeJson(GLOBAL_CACHE_KEY,data);applyGlobalData(data)}).catch(function(){})}
  function loadUserControls(){var id=userId();if(!id)return Promise.resolve();return fetch('/app/api/user-controls?userId='+encodeURIComponent(id),{cache:'no-store'}).then(function(r){return r.json()}).then(function(data){writeJson(cacheUserKey(),data);applyUserData(data)}).catch(function(){})}
  function loadLocks(force){
    var now=Date.now();
    if(!force&&lastFullLoadAt&&now-lastFullLoadAt<FULL_RELOAD_COOLDOWN_MS){applyLocks();return Promise.resolve()}
    lastFullLoadAt=now;
    lastUserLoadAt=now;
    return Promise.all([loadGlobalLocks(),loadUserControls()]).then(applyLocks)
  }
  function syncUserControls(force){
    if(document.hidden&&!force)return Promise.resolve();
    var now=Date.now();
    if(!force&&lastUserLoadAt&&now-lastUserLoadAt<USER_RELOAD_COOLDOWN_MS){applyLocks();return Promise.resolve()}
    lastUserLoadAt=now;
    return loadUserControls().then(applyLocks)
  }
  function isNavigationEvent(ev){
    var t=ev.target&&ev.target.closest?ev.target.closest('[data-view],[data-game-view]'):null;
    if(t)return true;
    var a=ev.target&&ev.target.closest?ev.target.closest('[data-action]'):null;
    if(!a)return false;
    return ['open-deposit','open-withdraw','open-transactions','open-rewards','open-leaderboard'].indexOf(a.getAttribute('data-action'))>=0;
  }

  window.VexaSectionLocks={reload:function(){return loadLocks(true)},syncUser:function(){return syncUserControls(true)},apply:applyLocks};
  document.addEventListener('click',function(ev){if(ev.target&&ev.target.closest&&ev.target.closest('.section-locked-view,.connect-card-locked-view'))return;if(isNavigationEvent(ev))setTimeout(function(){loadLocks(false)},40)},true);
  document.addEventListener('visibilitychange',function(){if(!document.hidden){if(lastFullLoadAt)loadLocks(false);if(lastUserLoadAt)syncUserControls(false);updateKeyboardInset()}});
  applyCachedLocks();setInterval(tickCountdowns,1000);
})();
`;