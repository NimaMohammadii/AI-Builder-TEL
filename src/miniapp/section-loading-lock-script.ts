export const SECTION_LOADING_LOCK_SCRIPT = `
(function(){
  var modes={};
  var loadingMeta={};
  var painted={};
  var progressTimers={};
  var signatures={};
  var loadInFlight=0;
  var eventSource=null;
  var pendingEventLoad=0;
  function style(){
    if(document.getElementById('slmcss'))return;
    var s=document.createElement('style');
    s.id='slmcss';
    s.textContent='body.section-loading-active{background:#000!important}body.section-loading-active .app,body.section-loading-active .content{background:#000!important}body.section-loading-active .top{display:none!important}.view.is-section-loading-active,.view.is-section-loading-pending{position:relative!important;display:block!important;min-height:calc(100vh - 96px)!important;margin:0!important;overflow:hidden!important;background:#000!important;transition:background .28s ease}.view.is-section-loading-active>*:not(.section-loading-mode),.view.is-section-loading-pending>*:not(.section-loading-mode){visibility:hidden!important;pointer-events:none!important}.section-loading-mode{position:absolute;inset:0;z-index:120;display:grid;place-items:center;background:#000!important;color:#fff;opacity:0;transform:translateY(10px) scale(.992);animation:slmEnter .42s cubic-bezier(.2,.9,.2,1) forwards}.section-loading-mode-box{width:min(74vw,320px);display:grid;gap:16px;justify-items:center;margin-top:14vh;animation:slmRise .52s cubic-bezier(.2,.9,.2,1) both}.section-loading-mode-title{margin:0;color:#fff;font-size:13px;font-weight:850;letter-spacing:.16em;text-transform:uppercase}.section-loading-mode-progress{width:100%;display:grid;grid-template-columns:1fr;align-items:center;justify-items:center;gap:12px}.section-loading-mode-line{width:100%;height:4px;background:rgba(255,255,255,.13);overflow:hidden;border-radius:999px;box-shadow:0 0 0 1px rgba(255,255,255,.035),0 18px 44px rgba(0,0,0,.45)}.section-loading-mode-line i{display:block;height:100%;width:0;background:#fff;border-radius:999px;box-shadow:0 0 22px rgba(255,255,255,.58);transition:width .35s linear}.section-loading-mode-percent{display:block;color:rgba(255,255,255,.74);font-size:12px;font-weight:850;text-align:center;font-variant-numeric:tabular-nums}@keyframes slmEnter{to{opacity:1;transform:translateY(0) scale(1)}}@keyframes slmRise{from{transform:translateY(18px);opacity:.62}to{transform:translateY(0);opacity:1}}';
    document.head.appendChild(s);
  }
  function sectionId(id){return id==='predict'?'predictzone':id}
  function modeKeyFromView(id){return id==='predictzone'?'predict':id}
  function activeViewId(){var sec=document.querySelector('.view.active');return sec?sec.id:'home'}
  function isGlobalLoading(){return !!modes['global-loading']}
  function metaFor(id,item){return loadingMeta[id]||loadingMeta[sectionId(id)]||{startedAt:null,expiresAt:item&&item.expiresAt||null,durationMs:null}}
  function sigFor(id,item){var meta=metaFor(id,item);return String(id)+'|'+String(meta.startedAt||'')+'|'+String(meta.expiresAt||item&&item.expiresAt||'')+'|'+String(meta.durationMs||'')}
  function activeLoadingVisible(){return !!document.querySelector('.view.active .section-loading-mode')}
  function updateBodyState(){document.body.classList.toggle('section-loading-active',activeLoadingVisible());document.querySelectorAll('.view').forEach(function(sec){var active=!!(sec.classList.contains('active')&&sec.querySelector('.section-loading-mode'));sec.classList.toggle('is-section-loading-active',active);if(active)sec.classList.remove('is-section-loading-pending')});}
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
    if(progressTimers[key])clearInterval(progressTimers[key]);
    function tick(){
      if(!box||!box.isConnected){clearInterval(progressTimers[key]);progressTimers[key]=0;updateBodyState();return}
      updatePercent(id,box,item);
    }
    tick();progressTimers[key]=setInterval(tick,1000);
  }
  function ensureLoadingView(id,item,pending,targetViewId){
    var sec=document.getElementById(targetViewId||sectionId(id));if(!sec)return;
    style();
    var sig=sigFor(id,item);
    var current=sec.querySelector('.section-loading-mode');
    if(current&&signatures[sec.id]!==sig){current.remove();current=null;Object.keys(progressTimers).forEach(function(k){if(k.indexOf(sec.id)>=0||k===id){clearInterval(progressTimers[k]);progressTimers[k]=0}})}
    if(!current){var old=sec.querySelector('.section-locked-view');if(old)old.remove();var v=document.createElement('div');v.className='section-locked-view section-loading-mode';v.innerHTML=html(id,item);sec.appendChild(v);current=v;startPercent(id,v.querySelector('.section-loading-mode-box'),item,sec.id)}
    painted[sec.id]=1;signatures[sec.id]=sig;sec.classList.add('is-section-locked');
    if(pending)sec.classList.add('is-section-loading-pending');
    var box=current.querySelector('.section-loading-mode-box');if(box){updatePercent(id,box,item);if(!progressTimers[timerKey(id,sec.id)])startPercent(id,box,item,sec.id)}
  }
  function prepareTargetLoading(viewId){
    var item=isGlobalLoading()?modes['global-loading']:modes[modeKeyFromView(viewId)];
    if(!item)return;
    ensureLoadingView(isGlobalLoading()?'global-loading':modeKeyFromView(viewId),item,true,viewId);
  }
  function clearOld(){
    document.querySelectorAll('.view').forEach(function(sec){
      var viewLock=modes[modeKeyFromView(sec.id)];
      var shouldKeep=!!(isGlobalLoading()||viewLock);
      if(shouldKeep)return;
      var v=sec.querySelector('.section-loading-mode');if(v)v.remove();
      sec.classList.remove('is-section-loading-active');sec.classList.remove('is-section-loading-pending');
      painted[sec.id]=0;signatures[sec.id]='';
    });
  }
  function paint(){
    style();
    clearOld();
    if(isGlobalLoading()){
      ensureLoadingView('global-loading',modes['global-loading'],false,activeViewId());
    }else{
      Object.keys(modes).forEach(function(id){if(id!=='global-loading')ensureLoadingView(id,modes[id],false)});
    }
    updateBodyState();
  }
  function load(){
    if(loadInFlight)return;
    loadInFlight=1;
    Promise.all([
      fetch('/app/api/section-locks',{cache:'no-store'}).then(function(r){return r.json()}),
      fetch('/app/api/section-loading-meta',{cache:'no-store'}).then(function(r){return r.json()}).catch(function(){return {items:{}}})
    ]).then(function(res){var d=res[0]||{},m=res[1]||{};loadingMeta=m.items||{};modes={};(d.sections||[]).forEach(function(x){if(x.mode==='loading')modes[x.id]=x});paint()}).catch(function(){}).finally(function(){loadInFlight=0});
  }
  function handleLockEvent(){
    if(document.hidden){pendingEventLoad=1;return}
    if(window.VexaSectionLocks&&typeof window.VexaSectionLocks.reload==='function')window.VexaSectionLocks.reload();
    load();
  }
  function connectEvents(){
    if(eventSource||typeof EventSource==='undefined')return;
    try{
      eventSource=new EventSource('/app/api/section-lock-events');
      eventSource.addEventListener('locks',handleLockEvent);
      eventSource.onerror=function(){try{eventSource.close()}catch(e){}eventSource=null;setTimeout(connectEvents,5000)};
    }catch(e){}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){load();connectEvents()});else{load();connectEvents()}
  document.addEventListener('click',function(ev){var target=ev.target&&ev.target.closest?ev.target.closest('[data-view]'):null;if(target)prepareTargetLoading(target.getAttribute('data-view')||'');setTimeout(load,80);setTimeout(paint,120);setTimeout(updateBodyState,160)},true);
  document.addEventListener('visibilitychange',function(){if(!document.hidden){if(pendingEventLoad){pendingEventLoad=0;handleLockEvent()}else load();connectEvents();setTimeout(updateBodyState,120)}});
  window.addEventListener('vexa-section-locks-updated',function(){handleLockEvent()});
})();
`;