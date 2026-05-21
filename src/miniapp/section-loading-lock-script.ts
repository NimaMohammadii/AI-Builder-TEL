export const SECTION_LOADING_LOCK_SCRIPT = `
(function(){
  var modes={};
  var loadingMeta={};
  var painted={};
  var progressTimers={};
  var lastLoadAt=0;
  var loadInFlight=null;
  var LOAD_COOLDOWN_MS=15000;
  function style(){
    if(document.getElementById('slmcss'))return;
    var s=document.createElement('style');
    s.id='slmcss';
    s.textContent='.section-loading-mode{position:absolute;inset:0;z-index:120;display:grid;place-items:center;background:#000;color:#fff;opacity:0;transform:scale(1.015);animation:slmEnter .42s ease forwards}.section-loading-mode-box{width:240px;display:grid;gap:15px;justify-items:center}.section-loading-mode-spin{width:64px;height:64px;border-radius:50%;border:4px solid rgba(255,255,255,.14);border-top-color:#fff;border-right-color:rgba(255,255,255,.55);animation:slmspin 2.8s linear infinite;box-sizing:border-box}.section-loading-mode-title{margin:0;color:#fff;font-size:14px;font-weight:850;letter-spacing:.01em}.section-loading-mode-sub{margin:-7px 0 0;color:rgba(255,255,255,.42);font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase}.section-loading-mode-progress{width:100%;display:grid;grid-template-columns:minmax(0,1fr) 42px;align-items:center;gap:10px}.section-loading-mode-line{width:100%;height:7px;background:rgba(255,255,255,.12);overflow:hidden;border-radius:99px}.section-loading-mode-line i{display:block;height:100%;width:0;background:#fff;transition:width .6s linear}.section-loading-mode-percent{color:rgba(255,255,255,.62);font-size:11px;font-weight:850;text-align:right;font-variant-numeric:tabular-nums}@keyframes slmEnter{to{opacity:1;transform:scale(1)}}@keyframes slmspin{to{transform:rotate(360deg)}}';
    document.head.appendChild(s);
  }
  function sectionId(id){return id==='predict'?'predictzone':id}
  function metaFor(id,item){return loadingMeta[id]||loadingMeta[sectionId(id)]||{startedAt:null,expiresAt:item&&item.expiresAt||null,durationMs:null}}
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
  function html(id,item){return '<div class="section-loading-mode-box"><div class="section-loading-mode-spin"></div><p class="section-loading-mode-title">This section is updating</p><p class="section-loading-mode-sub">Please wait</p><div class="section-loading-mode-progress"><div class="section-loading-mode-line"><i></i></div><span class="section-loading-mode-percent">0%</span></div></div>'}
  function updatePercent(id,box,item){
    var pct=pctFor(id,item);
    var el=box&&box.querySelector('.section-loading-mode-percent');if(el)el.textContent=pct+'%';
    var bar=box&&box.querySelector('.section-loading-mode-line i');if(bar)bar.style.width=pct+'%';
  }
  function startPercent(id,box,item){
    if(progressTimers[id])clearInterval(progressTimers[id]);
    function tick(){
      if(!box||!box.isConnected){clearInterval(progressTimers[id]);progressTimers[id]=0;return}
      updatePercent(id,box,item);
    }
    tick();progressTimers[id]=setInterval(tick,1000);
  }
  function clearOld(){
    Object.keys(painted).forEach(function(id){
      if(modes[id])return;
      var sec=document.getElementById(sectionId(id));if(!sec)return;
      var v=sec.querySelector('.section-loading-mode');if(v)v.remove();
      painted[id]=0;if(progressTimers[id]){clearInterval(progressTimers[id]);progressTimers[id]=0}
    });
  }
  function paint(){
    style();
    clearOld();
    Object.keys(modes).forEach(function(id){
      var sec=document.getElementById(sectionId(id));if(!sec)return;
      var item=modes[id];
      var current=sec.querySelector('.section-loading-mode');
      if(current){painted[id]=1;sec.classList.add('is-section-locked');var box=current.querySelector('.section-loading-mode-box');if(box){updatePercent(id,box,item);if(!progressTimers[id])startPercent(id,box,item)}return;}
      var old=sec.querySelector('.section-locked-view');if(old)old.remove();
      var v=document.createElement('div');v.className='section-locked-view section-loading-mode';v.innerHTML=html(id,item);sec.appendChild(v);sec.classList.add('is-section-locked');painted[id]=1;startPercent(id,v.querySelector('.section-loading-mode-box'),item);
    });
  }
  function load(force){
    var now=Date.now();
    if(loadInFlight)return loadInFlight;
    if(!force&&lastLoadAt&&now-lastLoadAt<LOAD_COOLDOWN_MS){paint();return Promise.resolve();}
    lastLoadAt=now;
    loadInFlight=Promise.all([
      fetch('/app/api/section-locks',{cache:'no-store'}).then(function(r){return r.json()}),
      fetch('/app/api/section-loading-meta',{cache:'no-store'}).then(function(r){return r.json()}).catch(function(){return {items:{}}})
    ]).then(function(res){var d=res[0]||{},m=res[1]||{};loadingMeta=m.items||{};modes={};(d.sections||[]).forEach(function(x){if(x.mode==='loading')modes[x.id]=x});paint()}).catch(function(){}).finally(function(){loadInFlight=null});
    return loadInFlight;
  }
  function isNavigationEvent(ev){
    var target=ev&&ev.target;
    if(!target||!target.closest)return false;
    if(target.closest('.section-loading-mode'))return false;
    if(target.closest('[data-view],[data-game-view]'))return true;
    var action=target.closest('[data-action]');
    if(!action)return false;
    return ['open-deposit','open-withdraw','open-transactions','open-rewards','open-leaderboard'].indexOf(action.getAttribute('data-action'))>=0;
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){load(true)});else load(true);
  document.addEventListener('click',function(ev){if(!isNavigationEvent(ev))return;setTimeout(function(){load(false)},80);setTimeout(paint,220)},true);
  document.addEventListener('visibilitychange',function(){if(!document.hidden)load(true)});
})();
`;