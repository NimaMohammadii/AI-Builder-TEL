export const SECTION_LOADING_LOCK_SCRIPT = `
(function(){
  var KNOWN_LOADING_SECTIONS={};['global-loading','home','connect','playzone','predict','market','flow','mines','plinko','crash','wheel','dice','rps','slot','tower','coinflip','hilo','ghostrun'].forEach(function(id){KNOWN_LOADING_SECTIONS[id]=1});
  var modes={};
  var loadingMeta={};
  var painted={};
  var progressTimers={};
  var expireTimers={};
  var signatures={};
  var loadInFlightByKey={};
  var loadingLocksLoaded=false;
  function style(){
    var css='body.section-loading-active .top{display:none!important}body.section-loading-active .app{padding-top:0!important;padding-left:0!important;padding-right:0!important;background:#000!important}body.section-loading-active .content{height:calc(100dvh - 94px - env(safe-area-inset-bottom))!important;background:#000!important;border-radius:0!important;box-shadow:none!important;overflow:hidden!important;margin:0!important;padding:0!important}body.section-loading-active .tabs{left:16px!important;right:16px!important}.view.is-section-loading-active,.view.is-section-loading-pending{height:100%!important;min-height:100%!important;width:100%!important;background:#000!important;display:block!important;overflow:hidden!important;margin:0!important;padding:0!important}.view.is-section-loading-active>*:not(.section-loading-mode),.view.is-section-loading-pending>*:not(.section-loading-mode){display:none!important}.view.is-section-loading-active>.section-loading-mode,.view.is-section-loading-pending>.section-loading-mode{position:relative!important;width:100%!important;height:100%!important;min-height:100%!important;display:flex!important;align-items:center!important;justify-content:center!important;background:#000!important;color:#fff!important;opacity:0;transform:translateY(10px);animation:slmEnter .42s cubic-bezier(.2,.9,.2,1) forwards}.section-loading-mode-box{width:min(74vw,320px);display:grid;gap:16px;justify-items:center;transform:translateY(8vh);animation:slmRise .52s cubic-bezier(.2,.9,.2,1) both}.section-loading-mode-title{margin:0;color:#fff;font-size:13px;font-weight:850;letter-spacing:.16em;text-transform:uppercase}.section-loading-mode-progress{width:100%;display:grid;grid-template-columns:1fr;align-items:center;justify-items:center;gap:12px}.section-loading-mode-line{width:100%;height:4px;background:rgba(255,255,255,.13);overflow:hidden;border-radius:999px;box-shadow:0 0 0 1px rgba(255,255,255,.035),0 18px 44px rgba(0,0,0,.45)}.section-loading-mode-line i{display:block;height:100%;width:0;background:#fff;border-radius:999px;box-shadow:0 0 22px rgba(255,255,255,.58);transition:width .35s linear}.section-loading-mode-percent{display:block;color:rgba(255,255,255,.74);font-size:12px;font-weight:850;text-align:center;font-variant-numeric:tabular-nums}@keyframes slmEnter{to{opacity:1;transform:translateY(0)}}@keyframes slmRise{from{opacity:.62;transform:translateY(calc(8vh + 18px))}to{opacity:1;transform:translateY(8vh)}}';
    var s=document.getElementById('slmcss');
    if(!s){s=document.createElement('style');s.id='slmcss';document.head.appendChild(s)}
    if(s.textContent!==css)s.textContent=css;
  }
  function sectionId(id){return id==='predict'?'predictzone':id}
  function modeKeyFromView(id){return id==='predictzone'?'predict':id}
  function isGlobalLoading(){return !!modes['global-loading']}
  function currentUserId(){
    var tg=window.Telegram&&window.Telegram.WebApp;
    var user=(tg&&tg.initDataUnsafe&&tg.initDataUnsafe.user)||{};
    return String(user.id||localStorage.getItem('ownerId')||'').trim();
  }
  function loadingSectionList(){
    var active=document.querySelector('.view.active[id],section.active[id]');
    var id=active&&active.id?modeKeyFromView(active.id):'home';
    if(id==='home'||id==='connect')return ['global-loading','home','connect-bot-card'];
    if(id&&KNOWN_LOADING_SECTIONS[id])return [id];
    return ['global-loading','home','connect-bot-card'];
  }
  function sectionListKey(sections){return (sections||[]).join(',')}
  function sectionLocksUrl(sections){
    var uid=currentUserId();
    sections=sections&&sections.length?sections:loadingSectionList();
    var params=[];
    if(uid)params.push('userId='+encodeURIComponent(uid));
    params.push('sections='+encodeURIComponent(sections.join(',')));
    return '/app/api/section-locks?'+params.join('&');
  }
  function isTrustedAccess(){return window.VexaTrustedAccess===true}
  function clearTrustedLoading(){
    modes={};
    loadingMeta={};
    document.body.classList.remove('section-loading-active');
    document.querySelectorAll('.view').forEach(restoreView);
  }
  function metaFor(id,item){return loadingMeta[id]||loadingMeta[sectionId(id)]||{startedAt:null,expiresAt:item&&item.expiresAt||null,durationMs:null}}
  function sigFor(id,item,targetId){var meta=metaFor(id,item);return String(id)+'|'+String(targetId||'')+'|'+String(meta.startedAt||'')+'|'+String(meta.expiresAt||item&&item.expiresAt||'')+'|'+String(meta.durationMs||'')}
  function activeLoadingVisible(){return !!document.querySelector('.view.active .section-loading-mode')}
  function updateBodyState(){if(isTrustedAccess()){clearTrustedLoading();return}document.body.classList.toggle('section-loading-active',activeLoadingVisible());document.querySelectorAll('.view').forEach(function(sec){var has=!!sec.querySelector(':scope > .section-loading-mode');var active=!!(sec.classList.contains('active')&&has);sec.classList.toggle('is-section-loading-active',has&&(isGlobalLoading()||active));if(active)sec.classList.remove('is-section-loading-pending')});}
  function pctFor(id,item){
    var meta=metaFor(id,item);
    var end=meta.expiresAt||item&&item.expiresAt||'';
    var start=meta.startedAt||'';
    var endMs=Date.parse(end);
    var startMs=Date.parse(start);
    var duration=Number(meta.durationMs||0);
    if(!duration&&Number.isFinite(endMs)&&Number.isFinite(startMs))duration=endMs-startMs;
    if(!Number.isFinite(startMs)||!duration||duration<=0){
      var remain=Number(item&&item.remainingMs||0);
      if(Number.isFinite(endMs)&&remain>0){duration=remain;startMs=Date.now();}
      else return 0;
    }
    return Math.max(0,Math.min(100,Math.floor(((Date.now()-startMs)/duration)*100)));
  }
  function html(id,item){return '<div class="section-loading-mode-box"><p class="section-loading-mode-title">Updating</p><div class="section-loading-mode-progress"><div class="section-loading-mode-line"><i></i></div><span class="section-loading-mode-percent">0%</span></div></div>'}
  function updatePercent(id,box,item){
    var pct=pctFor(id,item);
    var el=box&&box.querySelector('.section-loading-mode-percent');if(el)el.textContent=pct+'%';
    var bar=box&&box.querySelector('.section-loading-mode-line i');if(bar)bar.style.width=pct+'%';
  }
  function timerKey(id,targetId){return id==='global-loading'?'global-loading:'+targetId:id}
  function startPercent(id,box,item,targetId){
    var key=timerKey(id,targetId||'');
    if(progressTimers[key])clearTimeout(progressTimers[key]);
    function tick(){
      if(!box||!box.isConnected){clearTimeout(progressTimers[key]);progressTimers[key]=0;updateBodyState();return}
      updatePercent(id,box,item);
    }
    tick();
    function schedule(){progressTimers[key]=setTimeout(function(){progressTimers[key]=0;if(!box||!box.isConnected){updateBodyState();return}tick();schedule()},1000)}
    schedule();
  }
  function scheduleExpireCheck(id,item,targetId){
    var key=timerKey(id,targetId||'');
    if(expireTimers[key])clearTimeout(expireTimers[key]);
    var meta=metaFor(id,item);
    var expiresAt=meta.expiresAt||item&&item.expiresAt||'';
    var endMs=Date.parse(expiresAt);
    if(!Number.isFinite(endMs))return;
    var delay=Math.max(0,endMs-Date.now()+450);
    expireTimers[key]=setTimeout(function(){expireTimers[key]=0;load()},delay);
  }
  function ensureLoadingView(id,item,pending,targetViewId){
    if(isTrustedAccess()){clearTrustedLoading();return}
    var viewId=targetViewId||sectionId(id);
    var sec=document.getElementById(viewId);if(!sec)return;
    style();
    var sig=sigFor(id,item,viewId);
    var current=sec.querySelector(':scope > .section-loading-mode');
    if(current&&signatures[sec.id]!==sig){current.remove();current=null;Object.keys(progressTimers).forEach(function(k){if(k.indexOf(sec.id)>=0||k===id){clearTimeout(progressTimers[k]);progressTimers[k]=0}})}
    if(!current){var old=sec.querySelector(':scope > .section-locked-view');if(old)old.remove();var v=document.createElement('div');v.className='section-locked-view section-loading-mode';v.innerHTML=html(id,item);sec.appendChild(v);current=v;startPercent(id,v.querySelector('.section-loading-mode-box'),item,sec.id)}
    painted[sec.id]=1;signatures[sec.id]=sig;sec.classList.add('is-section-locked');
    if(pending)sec.classList.add('is-section-loading-pending');
    var box=current.querySelector('.section-loading-mode-box');if(box){updatePercent(id,box,item);if(!progressTimers[timerKey(id,sec.id)])startPercent(id,box,item,sec.id)}
    scheduleExpireCheck(id,item,sec.id);
  }
  function prepareTargetLoading(viewId){
    if(isTrustedAccess()){clearTrustedLoading();return}
    var item=isGlobalLoading()?modes['global-loading']:modes[modeKeyFromView(viewId)];
    if(!item)return;
    ensureLoadingView(isGlobalLoading()?'global-loading':modeKeyFromView(viewId),item,true,viewId);
  }
  function restoreView(sec){
    var v=sec.querySelector(':scope > .section-loading-mode');if(v)v.remove();
    sec.classList.remove('is-section-loading-active');
    sec.classList.remove('is-section-loading-pending');
    sec.classList.remove('is-section-locked');
    painted[sec.id]=0;signatures[sec.id]='';
    Object.keys(progressTimers).forEach(function(k){if(k.indexOf(sec.id)>=0){clearTimeout(progressTimers[k]);progressTimers[k]=0}});
    Object.keys(expireTimers).forEach(function(k){if(k.indexOf(sec.id)>=0){clearTimeout(expireTimers[k]);expireTimers[k]=0}});
  }
  function clearOld(){
    document.querySelectorAll('.view').forEach(function(sec){
      var viewLock=modes[modeKeyFromView(sec.id)];
      var shouldKeep=!!(isGlobalLoading()||viewLock);
      if(!shouldKeep)restoreView(sec);
    });
  }
  function paint(){
    if(isTrustedAccess()){clearTrustedLoading();return}
    style();
    clearOld();
    if(isGlobalLoading()){
      document.querySelectorAll('.view').forEach(function(sec){ensureLoadingView('global-loading',modes['global-loading'],false,sec.id)});
    }else{
      Object.keys(modes).forEach(function(id){if(id!=='global-loading')ensureLoadingView(id,modes[id],false)});
    }
    updateBodyState();
    if(!activeLoadingVisible()){
      document.body.classList.remove('section-loading-active');
      document.querySelectorAll('.view').forEach(function(sec){if(!modes[modeKeyFromView(sec.id)]&&!isGlobalLoading())restoreView(sec)});
    }
  }
  function load(){
    if(isTrustedAccess()){clearTrustedLoading();return}
    var sections=loadingSectionList();
    var localKey=(currentUserId()||'anonymous')+':'+sectionListKey(sections);
    if(loadInFlightByKey[localKey])return;
    loadingLocksLoaded=true;
    loadInFlightByKey[localKey]=1;
    Promise.all([
      (function(){var key=localKey;window.__vexaSectionLocksInflight=window.__vexaSectionLocksInflight||{};if(window.__vexaSectionLocksInflight[key])return window.__vexaSectionLocksInflight[key];var p=fetch(sectionLocksUrl(sections),{cache:'no-store'}).then(function(r){return r.json()}).finally(function(){delete window.__vexaSectionLocksInflight[key]});window.__vexaSectionLocksInflight[key]=p;return p})(),
      fetch('/app/api/section-loading-meta',{cache:'no-store'}).then(function(r){return r.json()}).catch(function(){return {items:{}}})
    ]).then(function(res){if(isTrustedAccess()){clearTrustedLoading();return}var d=res[0]||{},m=res[1]||{};loadingMeta=m.items||{};modes={};(d.sections||[]).forEach(function(x){if(x.mode==='loading')modes[x.id]=x});paint()}).catch(function(){}).finally(function(){delete loadInFlightByKey[localKey]});
  }
  function notifyLive(){try{window.dispatchEvent(new CustomEvent('vexa-live-event',{detail:{type:'locks',at:Date.now()}}))}catch(e){}}
  function handleLockEvent(){
    notifyLive();
    if(isTrustedAccess()){clearTrustedLoading();return}
    if(!loadingLocksLoaded)return;
    if(window.VexaSectionLocks&&typeof window.VexaSectionLocks.reload==='function')window.VexaSectionLocks.reload(['global-loading','home','connect-bot-card']);
    load();
  }
  document.addEventListener('click',function(ev){var target=ev.target&&ev.target.closest?ev.target.closest('[data-view]'):null;if(target){prepareTargetLoading(target.getAttribute('data-view')||'');setTimeout(load,40)}setTimeout(paint,120);setTimeout(paint,260);setTimeout(updateBodyState,300)},true);
  document.addEventListener('visibilitychange',function(){if(!document.hidden){if(loadingLocksLoaded)load();setTimeout(updateBodyState,120)}});
  window.addEventListener('vexa-section-locks-updated',function(){if(isTrustedAccess())clearTrustedLoading();else handleLockEvent()});
})();
`;