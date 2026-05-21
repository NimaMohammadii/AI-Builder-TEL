export const SECTION_LOADING_LOCK_SCRIPT = `
(function(){
  var modes={};
  var loadingMeta={};
  var painted={};
  var progressTimers={};
  var signatures={};
  var loadInFlight=0;
  function style(){
    if(document.getElementById('slmcss'))return;
    var s=document.createElement('style');
    s.id='slmcss';
    s.textContent='body.section-loading-active .top{display:none!important}.section-loading-mode{position:absolute;inset:0;z-index:120;display:grid;place-items:center;background:#000;color:#fff;opacity:0;transform:scale(1.018);animation:slmEnter .45s cubic-bezier(.2,.9,.2,1) forwards}.section-loading-mode-box{width:min(74vw,320px);display:grid;gap:16px;justify-items:center;animation:slmRise .52s cubic-bezier(.2,.9,.2,1) both}.section-loading-mode-title{margin:0;color:#fff;font-size:13px;font-weight:850;letter-spacing:.16em;text-transform:uppercase}.section-loading-mode-progress{width:100%;display:grid;grid-template-columns:1fr;align-items:center;justify-items:center;gap:12px}.section-loading-mode-line{width:100%;height:4px;background:rgba(255,255,255,.13);overflow:hidden;border-radius:999px;box-shadow:0 0 0 1px rgba(255,255,255,.035),0 18px 44px rgba(0,0,0,.45)}.section-loading-mode-line i{display:block;height:100%;width:0;background:#fff;border-radius:999px;box-shadow:0 0 22px rgba(255,255,255,.58);transition:width .35s linear}.section-loading-mode-percent{display:block;color:rgba(255,255,255,.74);font-size:12px;font-weight:850;text-align:center;font-variant-numeric:tabular-nums}@keyframes slmEnter{to{opacity:1;transform:scale(1)}}@keyframes slmRise{from{transform:translateY(18px);opacity:.62}to{transform:translateY(0);opacity:1}}';
    document.head.appendChild(s);
  }
  function sectionId(id){return id==='predict'?'predictzone':id}
  function metaFor(id,item){return loadingMeta[id]||loadingMeta[sectionId(id)]||{startedAt:null,expiresAt:item&&item.expiresAt||null,durationMs:null}}
  function sigFor(id,item){var meta=metaFor(id,item);return String(meta.startedAt||'')+'|'+String(meta.expiresAt||item&&item.expiresAt||'')+'|'+String(meta.durationMs||'')}
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
      painted[id]=0;signatures[id]='';if(progressTimers[id]){clearInterval(progressTimers[id]);progressTimers[id]=0}
    });
  }
  function setBodyState(){document.body.classList.toggle('section-loading-active',Object.keys(modes).length>0)}
  function paint(){
    style();
    setBodyState();
    clearOld();
    Object.keys(modes).forEach(function(id){
      var sec=document.getElementById(sectionId(id));if(!sec)return;
      var item=modes[id];
      var sig=sigFor(id,item);
      var current=sec.querySelector('.section-loading-mode');
      if(current&&signatures[id]!==sig){current.remove();current=null;if(progressTimers[id]){clearInterval(progressTimers[id]);progressTimers[id]=0}}
      if(current){painted[id]=1;signatures[id]=sig;sec.classList.add('is-section-locked');var box=current.querySelector('.section-loading-mode-box');if(box){updatePercent(id,box,item);if(!progressTimers[id])startPercent(id,box,item)}return;}
      var old=sec.querySelector('.section-locked-view');if(old)old.remove();
      var v=document.createElement('div');v.className='section-locked-view section-loading-mode';v.innerHTML=html(id,item);sec.appendChild(v);sec.classList.add('is-section-locked');painted[id]=1;signatures[id]=sig;startPercent(id,v.querySelector('.section-loading-mode-box'),item);
    });
  }
  function load(){
    if(loadInFlight)return;
    loadInFlight=1;
    Promise.all([
      fetch('/app/api/section-locks',{cache:'no-store'}).then(function(r){return r.json()}),
      fetch('/app/api/section-loading-meta',{cache:'no-store'}).then(function(r){return r.json()}).catch(function(){return {items:{}}})
    ]).then(function(res){var d=res[0]||{},m=res[1]||{};loadingMeta=m.items||{};modes={};(d.sections||[]).forEach(function(x){if(x.mode==='loading')modes[x.id]=x});paint()}).catch(function(){}).finally(function(){loadInFlight=0});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',load);else load();
  document.addEventListener('click',function(){setTimeout(load,80);setTimeout(paint,220)},true);
  document.addEventListener('visibilitychange',function(){if(!document.hidden)load()});
  window.addEventListener('vexa-section-locks-updated',function(){load()});
})();
`;