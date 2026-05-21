export const SECTION_LOADING_LOCK_SCRIPT = `
(function(){
  var modes={};
  var painted={};
  function style(){
    if(document.getElementById('slmcss'))return;
    var s=document.createElement('style');
    s.id='slmcss';
    s.textContent='.section-loading-mode{position:absolute;inset:0;z-index:120;display:grid;place-items:center;background:#000;color:#fff}.section-loading-mode-box{width:220px;display:grid;gap:14px;justify-items:center}.section-loading-mode-spin{width:64px;height:64px;border-radius:50%;border:5px solid rgba(255,255,255,.13);border-top-color:#fff;border-right-color:rgba(255,255,255,.55);animation:slmspin 2.8s linear infinite;box-sizing:border-box}.section-loading-mode-title{margin:0;color:#fff;font-size:13px;font-weight:850;letter-spacing:.02em}.section-loading-mode-sub{margin:-7px 0 0;color:rgba(255,255,255,.42);font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase}.section-loading-mode-line{width:100%;height:4px;background:rgba(255,255,255,.12);overflow:hidden;border-radius:99px}.section-loading-mode-line i{display:block;height:100%;width:0;background:#fff;animation-name:slmbar;animation-timing-function:linear;animation-fill-mode:forwards;animation-duration:var(--slm-duration,1800s)}@keyframes slmspin{to{transform:rotate(360deg)}}@keyframes slmbar{0%{width:0}100%{width:90%}}';
    document.head.appendChild(s);
  }
  function durationSeconds(item){
    var ms=Number(item&&item.remainingMs||0);
    if(!ms&&item&&item.expiresAt)ms=Date.parse(item.expiresAt)-Date.now();
    return Math.max(1,Math.floor(ms/1000)||1800);
  }
  function html(item){return '<div class="section-loading-mode-box" style="--slm-duration:'+durationSeconds(item)+'s"><div class="section-loading-mode-spin"></div><p class="section-loading-mode-title">در حال آپدیت است</p><p class="section-loading-mode-sub">Please wait</p><div class="section-loading-mode-line"><i></i></div></div>'}
  function clearOld(){
    Object.keys(painted).forEach(function(id){
      if(modes[id])return;
      var sec=document.getElementById(id);if(!sec)return;
      var v=sec.querySelector('.section-loading-mode');if(v)v.remove();
      painted[id]=0;
    });
  }
  function paint(){
    style();
    clearOld();
    Object.keys(modes).forEach(function(id){
      var sec=document.getElementById(id);if(!sec)return;
      var item=modes[id];
      var current=sec.querySelector('.section-loading-mode');
      if(current){painted[id]=1;sec.classList.add('is-section-locked');return;}
      var old=sec.querySelector('.section-locked-view');if(old)old.remove();
      var v=document.createElement('div');v.className='section-locked-view section-loading-mode';v.innerHTML=html(item);sec.appendChild(v);sec.classList.add('is-section-locked');painted[id]=1;
    });
  }
  function load(){fetch('/app/api/section-locks',{cache:'no-store'}).then(function(r){return r.json()}).then(function(d){modes={};(d.sections||[]).forEach(function(x){if(x.mode==='loading')modes[x.id]=x});paint()}).catch(function(){})}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',load);else load();
  document.addEventListener('click',function(){setTimeout(load,80);setTimeout(paint,220)},true);
  document.addEventListener('visibilitychange',function(){if(!document.hidden)load()});
})();
`;
