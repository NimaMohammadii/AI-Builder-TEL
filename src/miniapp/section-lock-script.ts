export const SECTION_LOCK_SCRIPT = `
(function(){
  var locks={};
  var userBlocked={};
  var userCredit=null;
  var lastSyncedCredit=null;
  var unlocked={};
  var preloaded={};
  var cachedImageSrc={};
  var originalConnectBotCardHtml='';
  var lastLoadAtBySectionKey={};
  var lastUserLoadAt=0;
  var countdownTimer=0;
  var FULL_RELOAD_COOLDOWN_MS=300000;
  var USER_RELOAD_COOLDOWN_MS=60000;
  var GLOBAL_CACHE_PREFIX='vexaSectionLocks:v1:';
  var USER_CACHE_PREFIX='vexaUserControls:';
  var LOCK_IMAGE_CACHE='vexa-section-lock-images-v1';
  var KNOWN_LOCK_SECTIONS={};['global-loading','home','playzone','predict','predict-zone-card','mines','plinko','crash','wheel','dice','rps','slot','tower','coinflip','hilo','ghostrun'].forEach(function(id){KNOWN_LOCK_SECTIONS[id]=1});
  var tg=window.Telegram&&window.Telegram.WebApp;
  var user=(tg&&tg.initDataUnsafe&&tg.initDataUnsafe.user)||{};
  var lockSvg='<svg viewBox="0 0 64 64" fill="none" aria-hidden="true"><rect x="18" y="28" width="28" height="24" rx="8" stroke="currentColor" stroke-width="3"/><path d="M23 28v-7a9 9 0 0 1 18 0v7" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><circle cx="32" cy="40" r="2.5" fill="currentColor"/></svg>';
  var dismissSvg='<svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  function userId(){return String(user.id||localStorage.getItem('ownerId')||'').trim()}
  function sectionLocksUrl(sectionList){var id=userId();var params=[];if(id)params.push('userId='+encodeURIComponent(id));if(sectionList&&sectionList.length)params.push('sections='+encodeURIComponent(sectionList.join(',')));return '/app/api/section-locks'+(params.length?'?'+params.join('&'):'')}
  function sectionListKey(sectionList){var seen={};var out=[];(sectionList||[]).forEach(function(id){id=lockId(id);if(id&&KNOWN_LOCK_SECTIONS[id]&&!seen[id]){seen[id]=1;out.push(id)}});return out.join(',')}
  function cacheGlobalKey(sectionList){var id=userId();return GLOBAL_CACHE_PREFIX+(id||'anonymous')+':'+sectionListKey(sectionList)}
  function lockId(id){return id==='predictzone'?'predict':id}
  function storageKey(id){return 'sectionUnlocked:'+lockId(id)}
  function cacheUserKey(){var id=userId();return id?USER_CACHE_PREFIX+id:''}
  function readJson(key){try{return key?JSON.parse(localStorage.getItem(key)||'null'):null}catch(e){return null}}
  function writeJson(key,value){try{if(key)localStorage.setItem(key,JSON.stringify(value||{}))}catch(e){}}
  function escapeAttr(value){return String(value||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}
  function isUnlocked(id){id=lockId(id);return unlocked[id]||sessionStorage.getItem(storageKey(id))==='1'}
  function setUnlocked(id){id=lockId(id);unlocked[id]=true;sessionStorage.setItem(storageKey(id),'1')}
  function visualUrl(item){if(!item)return '';return item.mode==='code'?(item.codeImageUrl||''):(item.lockedImageUrl||item.imageUrl||'')}
  function promoteCachedImage(url,src){
    if(!url||!src)return;
    cachedImageSrc[url]=src;
    document.querySelectorAll('img.section-lock-image').forEach(function(img){
      if(img.getAttribute('data-lock-url')===url&&img.getAttribute('src')!==src){
        img.setAttribute('src',src);
      }
    });
  }
  function preload(url){
    if(!url)return;
    if(cachedImageSrc[url])return;
    if(preloaded[url])return;
    preloaded[url]=true;
    if('caches' in window&&window.fetch&&window.URL&&window.URL.createObjectURL){
      caches.open(LOCK_IMAGE_CACHE).then(function(cache){
        return cache.match(url).then(function(match){
          if(match)return match.blob();
          return fetch(url,{cache:'force-cache'}).then(function(response){
            if(response&&response.ok){try{cache.put(url,response.clone())}catch(e){};return response.blob()}
            throw new Error('image fetch failed');
          });
        });
      }).then(function(blob){
        var objectUrl=URL.createObjectURL(blob);
        promoteCachedImage(url,objectUrl);
        var img=new Image();img.decoding='async';img.src=objectUrl;
      }).catch(function(){var img=new Image();img.decoding='async';img.src=url});
      return;
    }
    var img=new Image();img.decoding='async';img.src=url;
  }
  function activeLockIds(){var out={};sectionsForNavigation().forEach(function(id){out[id]=true});return out}
  function currentSectionList(){return sectionsForNavigation()}
  function playZoneSectionList(){return ['playzone','mines','plinko','crash','wheel','dice','rps','slot','coinflip','hilo','ghostrun','predict-zone-card']}
  function sectionsForNavigation(){var active=document.querySelector('.view.active[id],section.active[id]');var id=active&&active.id?lockId(active.id):'home';if(id==='home')return ['global-loading','home'];if(id==='playzone')return playZoneSectionList();return id&&KNOWN_LOCK_SECTIONS[id]?[id]:['global-loading','home']}
  function mergeLocksData(data){(data&&data.sections||[]).forEach(function(section){locks[section.id]={mode:section.mode||((section.locked)?'locked':'open'),locked:!!section.locked,expiresAt:section.expiresAt||null,remainingMs:section.remainingMs==null?null:Number(section.remainingMs),hasCode:!!section.hasCode,imageUrl:section.imageUrl||null,hasImage:!!section.hasImage,lockedImageUrl:section.lockedImageUrl||section.imageUrl||null,codeImageUrl:section.codeImageUrl||null}});preloadLockImages()}
  function preloadLockImages(){var active=activeLockIds();Object.keys(locks).forEach(function(id){if(!active[id])return;var item=locks[id];preload(item.lockedImageUrl||item.imageUrl||'');preload(item.codeImageUrl||'')})}
  function formatLeft(ms){ms=Math.max(0,Math.floor(Number(ms)||0));var d=Math.floor(ms/86400000),h=Math.floor(ms/3600000)%24,m=Math.floor(ms/60000)%60,sec=Math.floor(ms/1000)%60;return d+'d '+String(h).padStart(2,'0')+':'+String(m).padStart(2,'0')+':'+String(sec).padStart(2,'0')}
  function countdownHtml(item){return item&&item.expiresAt?'<p>Opens in <span data-section-lock-expires-at="'+item.expiresAt+'">'+formatLeft(item.remainingMs)+'</span></p>':''}
  function tickCountdowns(){document.querySelectorAll('[data-section-lock-expires-at]').forEach(function(el){el.textContent=formatLeft(Date.parse(el.getAttribute('data-section-lock-expires-at')||'')-Date.now())})}
  function scheduleCountdownTick(){
    if(countdownTimer)return;
    if(!document.querySelector('[data-section-lock-expires-at]'))return;
    countdownTimer=setTimeout(function(){countdownTimer=0;tickCountdowns();scheduleCountdownTick()},1000);
  }
  function lockVisual(item){var url=visualUrl(item);if(url){preload(url);var src=cachedImageSrc[url]||url;return '<img class="section-lock-image" data-lock-url="'+escapeAttr(url)+'" src="'+escapeAttr(src)+'" alt="" decoding="async"/>'}return lockSvg}
  function botCardVisual(item){return '<span class="connect-card-lock-icon">'+lockSvg+'</span>'}
  function setKeyboardMode(on){document.body.classList.toggle('section-code-keyboard-open',!!on);updateKeyboardInset()}
  function updateKeyboardInset(){var vv=window.visualViewport;var inset=0;if(vv){inset=Math.max(0,window.innerHeight-vv.height-vv.offsetTop)}document.documentElement.style.setProperty('--section-keyboard-inset',inset+'px')}
  if(window.visualViewport){window.visualViewport.addEventListener('resize',updateKeyboardInset);window.visualViewport.addEventListener('scroll',updateKeyboardInset)}

  function setGlobalLockChrome(on){
    var targets=[document.documentElement,document.body,document.querySelector('.app'),document.querySelector('.top'),document.querySelector('.content')];
    targets.forEach(function(el){
      if(!el)return;
      if(on)el.style.setProperty('background','rgb(0,0,0)','important');
      else el.style.removeProperty('background');
    });
    document.body.classList.toggle('section-full-lock-active',!!on);
    if(window.Telegram&&window.Telegram.WebApp&&window.Telegram.WebApp.setBackgroundColor){try{window.Telegram.WebApp.setBackgroundColor('#000000')}catch(e){}}
    if(window.Telegram&&window.Telegram.WebApp&&window.Telegram.WebApp.setHeaderColor){try{window.Telegram.WebApp.setHeaderColor('#000000')}catch(e){}}
  }

  function anyRegularLockVisible(){return !!document.querySelector('body > .section-locked-view:not(.section-loading-mode)')}
  function removeRegularLockViews(){document.querySelectorAll('.section-locked-view:not(.section-loading-mode)').forEach(function(el){try{el.remove()}catch(e){}})}

  function forceFullSectionLock(section,on){
    if(!section)return;
    if(on){
      setGlobalLockChrome(true);
      section.classList.remove('has-section-lock-overlay');
      section.classList.add('is-section-locked');
      section.style.setProperty('background','rgb(0,0,0)','important');
      section.style.setProperty('overflow','hidden','important');
      Array.prototype.forEach.call(section.children,function(child){if(!child.classList||!child.classList.contains('section-locked-view'))child.style.setProperty('display','none','important')});
    }else{
      section.classList.remove('has-section-lock-overlay');
      section.classList.remove('is-section-locked');
      section.style.removeProperty('background');
      section.style.removeProperty('overflow');
      Array.prototype.forEach.call(section.children,function(child){child.style.removeProperty('display')});
      setTimeout(function(){if(!anyRegularLockVisible())setGlobalLockChrome(false)},0);
    }
  }

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

  function ensureOverlay(section, item){
    if(!section)return;
    removeRegularLockViews();
    var view=document.createElement('div');view.className='section-locked-view';
    view.setAttribute('data-lock-section-id',section.id||'');
    view.style.setProperty('position','fixed','important');view.style.setProperty('inset','0','important');view.style.setProperty('width','100vw','important');view.style.setProperty('height','100dvh','important');view.style.setProperty('min-height','100dvh','important');view.style.setProperty('background','rgb(0,0,0)','important');view.style.setProperty('z-index','10090','important');view.style.setProperty('display','grid','important');view.style.setProperty('place-items','center','important');view.style.setProperty('padding','calc(18px + env(safe-area-inset-top)) 24px calc(24px + env(safe-area-inset-bottom))','important');view.style.setProperty('box-sizing','border-box','important');
    if(item&&item.mode==='code'){
      view.classList.add('section-code-view');
      view.innerHTML='<button class="section-keyboard-dismiss" type="button" aria-label="Hide keyboard">'+dismissSvg+'</button><div class="section-locked-card code-card">'+lockVisual(item)+'<h2>Enter access code</h2><p>This section requires an access code.</p>'+countdownHtml(item)+'<input class="section-code-input" type="text" inputmode="text" placeholder="Access code" autocomplete="one-time-code" autocapitalize="off" spellcheck="false" enterkeyhint="done"/><button class="section-code-submit" type="button">Unlock</button><small class="section-code-status"></small></div>';
      var input=view.querySelector('.section-code-input');var button=view.querySelector('.section-code-submit');var status=view.querySelector('.section-code-status');var dismiss=view.querySelector('.section-keyboard-dismiss');
      var submit=function(){var code=(input&&input.value||'').trim();if(!code){status.textContent='Enter the access code.';focusCodeInput(input,view);return}status.textContent='Checking...';fetch('/app/api/section-locks/verify',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({sectionId:lockId(section.id),code:code})}).then(function(r){return r.json().then(function(j){return {ok:r.ok,json:j}})}).then(function(res){if(res.ok&&res.json&&res.json.ok){setKeyboardMode(false);setUnlocked(section.id);applyLocks();return}status.textContent=(res.json&&res.json.error)||'Wrong access code.';focusCodeInput(input,view)}).catch(function(){status.textContent='Could not verify code.';focusCodeInput(input,view)})};
      button.addEventListener('click',submit);input.addEventListener('touchstart',function(){focusCodeInput(input,view)},{passive:true});input.addEventListener('mousedown',function(){focusCodeInput(input,view)});input.addEventListener('click',function(){focusCodeInput(input,view)});input.addEventListener('focus',function(){focusCodeInput(input,view)});input.addEventListener('blur',function(){view.classList.remove('code-focused');setTimeout(function(){if(document.activeElement!==input)setKeyboardMode(false)},160)});input.addEventListener('keydown',function(e){if(e.key==='Enter')submit()});dismiss.addEventListener('touchstart',function(e){e.preventDefault();input.blur();setKeyboardMode(false)},{passive:false});dismiss.addEventListener('click',function(){input.blur();setKeyboardMode(false)});
    }else{
      var text=(item&&item.userBlocked)?'Your access to this section is currently restricted.':'This section is currently unavailable.';
      view.innerHTML='<div class="section-locked-card">'+lockVisual(item)+'<h2>'+text+'</h2>'+(countdownHtml(item)||'<p>Please try again later.</p>')+'</div>';
    }
    document.body.appendChild(view);tickCountdowns();scheduleCountdownTick();
  }

  function applySectionLock(section){
    if(!section)return;
    var id=section.id,lid=lockId(id);var globalItem=locks[lid];var item=(userBlocked[lid])?Object.assign({},globalItem||{},userBlocked[lid],{mode:'locked',locked:true,userBlocked:true}):globalItem;
    var isLocked=!!item&&item.mode!=='open'&&!isUnlocked(lid);
    if(isLocked&&item.mode!=='loading'){forceFullSectionLock(section,true);ensureOverlay(section,item)}else{removeRegularLockViews();if(!(item&&item.mode==='loading'))forceFullSectionLock(section,false)}
  }

  function applyLocks(){syncCredit();applySectionLock(document.querySelector('.view.active'))}
  function applyGlobalData(data){mergeLocksData(data)}
  function applyUserData(data){userBlocked={};if(!data)return;if(Array.isArray(data.sectionBlocks)){data.sectionBlocks.forEach(function(item){if(item&&item.blocked)userBlocked[item.sectionId]={expiresAt:item.expiresAt||null,remainingMs:item.remainingMs==null?null:Number(item.remainingMs)}})}else{(data.blockedSections||[]).forEach(function(section){userBlocked[section]={expiresAt:null,remainingMs:null}})}userCredit=data.credit===null||data.credit===undefined?null:Number(data.credit)}
  function applyCachedLocks(){try{var prefix=GLOBAL_CACHE_PREFIX+(userId()||'anonymous')+':';Object.keys(localStorage).forEach(function(key){if(key.indexOf(prefix)===0){var global=readJson(key);if(global)applyGlobalData(global)}})}catch(e){}var userCache=readJson(cacheUserKey());if(userCache)applyUserData(userCache);applyLocks()}
  function loadGlobalLocks(sectionList){sectionList=sectionList&&sectionList.length?sectionList:currentSectionList();var key=(userId()||'anonymous')+':'+sectionListKey(sectionList);window.__vexaSectionLocksInflight=window.__vexaSectionLocksInflight||{};if(window.__vexaSectionLocksInflight[key])return window.__vexaSectionLocksInflight[key].then(function(data){applyGlobalData(data);return data});var p=fetch(sectionLocksUrl(sectionList),{cache:'no-store'}).then(function(r){return r.json()}).then(function(data){writeJson(cacheGlobalKey(sectionList),data);applyGlobalData(data);return data}).catch(function(){}).finally(function(){delete window.__vexaSectionLocksInflight[key]});window.__vexaSectionLocksInflight[key]=p;return p}
  function loadUserControls(){var id=userId();if(!id)return Promise.resolve();return fetch('/app/api/user-controls?userId='+encodeURIComponent(id),{cache:'no-store'}).then(function(r){return r.json()}).then(function(data){writeJson(cacheUserKey(),data);applyUserData(data)}).catch(function(){})}
  function loadLocks(force,sectionList){var now=Date.now();sectionList=sectionList&&sectionList.length?sectionList:sectionsForNavigation();var key=sectionListKey(sectionList);if(!force&&lastLoadAtBySectionKey[key]&&now-lastLoadAtBySectionKey[key]<FULL_RELOAD_COOLDOWN_MS){applyLocks();return Promise.resolve()}lastLoadAtBySectionKey[key]=now;lastUserLoadAt=now;return Promise.all([loadGlobalLocks(sectionList),loadUserControls()]).then(applyLocks)}
  function syncUserControls(force){if(document.hidden&&!force)return Promise.resolve();var now=Date.now();if(!force&&lastUserLoadAt&&now-lastUserLoadAt<USER_RELOAD_COOLDOWN_MS){applyLocks();return Promise.resolve()}lastUserLoadAt=now;return loadUserControls().then(applyLocks)}
  function isNavigationEvent(ev){var t=ev.target&&ev.target.closest?ev.target.closest('[data-view],[data-game-view]'):null;if(t)return true;var a=ev.target&&ev.target.closest?ev.target.closest('[data-action]'):null;if(!a)return false;return ['open-deposit','open-withdraw','open-transactions','open-rewards','open-leaderboard'].indexOf(a.getAttribute('data-action'))>=0}

  window.VexaSectionLocks={reload:function(sections){return loadLocks(true,sections)},syncUser:function(){return syncUserControls(true)},apply:applyLocks,playZoneSections:playZoneSectionList,currentSections:currentSectionList};
  document.addEventListener('click',function(ev){if(ev.target&&ev.target.closest&&ev.target.closest('.section-locked-view,.connect-card-locked-view'))return;if(isNavigationEvent(ev))setTimeout(function(){loadLocks(false,sectionsForNavigation())},40)},true);
  document.addEventListener('visibilitychange',function(){if(!document.hidden){if(Object.keys(lastLoadAtBySectionKey).length)loadLocks(false);if(lastUserLoadAt)syncUserControls(false);updateKeyboardInset()}});
  applyCachedLocks();
})();
`;