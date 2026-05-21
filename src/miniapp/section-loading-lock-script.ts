export const SECTION_LOADING_LOCK_SCRIPT = `
(function(){
  var modes={};
  var painted={};
  var progressTimers={};
  function style(){
    if(document.getElementById('slmcss'))return;
    var s=document.createElement('style');
    s.id='slmcss';
    s.textContent='.section-loading-mode{position:absolute;inset:0;z-index:120;display:grid;place-items:center;background:#000;color:#fff;opacity:0;transform:scale(1.015);animation:slmEnter .42s ease forwards}.section-loading-mode-box{width:240px;display:grid;gap:15px;justify-items:center}.section-loading-mode-spin{width:64px;height:64px;border-radius:50%;border:4px solid rgba(255,255,255,.14);border-top-color:#fff;border-right-color:rgba(255,255,255,.55);animation:slmspin 2.8s linear infinite;box-sizing:border-box}.section-loading-mode-title{margin:0;color:#fff;font-size:14px;font-weight:850;letter-spacing:.01em}.section-loading-mode-sub{margin:-7px 0 0;color:rgba(255,255,255,.42);font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase}.section-loading-mode-progress{width:100%;display:grid;grid-template-columns:minmax(0,1fr) 42px;align-items:center;gap:10px}.section-loading-mode-line{width:100%;height:7px;background:rgba(255,255,255,.12);overflow:hidden;border-radius:99px}.section-loading-mode-line i{display:block;height:100%;width:0;background:#fff;animation-name:slmbar;animation-timing-function:linear;animation-fill-mode:forwards;animation-duration:var(--slm-duration,1800s)}.section-loading-mode-percent{color:rgba(255,255,255,.62);font-size:11px;font-weight:850;text-align:right;font-variant-numeric:tabular-nums}@keyframes slmEnter{to{opacity:1;transform:scale(1)}}@keyframes slmspin{to{transform:rotate(360deg)}}@keyframes slmbar{0%{width:0}100%{width:100%}}';
    document.head.appendChild(s);
  }
  function sectionId(id){return id==='predict'?'predictzone':id}
  function durationSeconds(item){
    var ms=Number(item&&item.remainingMs||0);
    if(!ms&&item&&item.expiresAt)ms=Date.parse(item.expiresAt)-Date.now();
    return Math.max(1,Math.floor(ms/1000)||1800);
  }
  function html(item){var duration=durationSeconds(item);return '<div class="section-loading-mode-box" data-loading-duration="'+duration+'" data-loading-start="'+Date.now()+'" style="--slm-duration:'+duration+'s"><div class="section-loading-mode-spin"></div><p class="section-loading-mode-title">This section is updating</p><p class="section-loading-mode-sub">Please wait</p><div class="section-loading-mode-progress"><div class="section-loading-mode-line"><i></i></div><span class="section-loading-mode-percent">0%</span></div></div>'}
  function startPercent(id,box){
    if(progressTimers[id])clearInterval(progressTimers[id]);
    function tick(){
      if(!box||!box.isConnected){clearInterval(progressTimers[id]);progressTimers[id]=0;return}
      var duration=Math.max(1,Number(box.getAttribute('data-loading-duration')||1));
      var start=Number(box.getAttribute('data-loading-start')||Date.now());
      var pct=Math.min(100,Math.floor(((Date.now()-start)/(duration*1000))*100));
      var el=box.querySelector('.section-loading-mode-percent');if(el)el.textContent=pct+'%';
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
      if(current){painted[id]=1;sec.classList.add('is-section-locked');var box=current.querySelector('.section-loading-mode-box');if(box&&!progressTimers[id])startPercent(id,box);return;}
      var old=sec.querySelector('.section-locked-view');if(old)old.remove();
      var v=document.createElement('div');v.className='section-locked-view section-loading-mode';v.innerHTML=html(item);sec.appendChild(v);sec.classList.add('is-section-locked');painted[id]=1;startPercent(id,v.querySelector('.section-loading-mode-box'));
    });
  }
  function load(){fetch('/app/api/section-locks',{cache:'no-store'}).then(function(r){return r.json()}).then(function(d){modes={};(d.sections||[]).forEach(function(x){if(x.mode==='loading')modes[x.id]=x});paint()}).catch(function(){})}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',load);else load();
  document.addEventListener('click',function(){setTimeout(load,80);setTimeout(paint,220)},true);
  document.addEventListener('visibilitychange',function(){if(!document.hidden)load()});
})();
`;
