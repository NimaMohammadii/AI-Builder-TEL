export const SECTION_LOADING_LOCK_SCRIPT = `
(function(){
  var modes={};
  function style(){
    if(document.getElementById('slmcss'))return;
    var s=document.createElement('style');
    s.id='slmcss';
    s.textContent='.section-loading-mode{position:absolute;inset:0;z-index:120;display:grid;place-items:center;background:#000;color:#fff}.section-loading-mode-box{width:220px;display:grid;gap:18px;justify-items:center}.section-loading-mode-spin{width:58px;height:58px;border-radius:50%;border:2px solid rgba(255,255,255,.12);border-top-color:#fff;animation:slmspin .9s linear infinite}.section-loading-mode-line{width:100%;height:3px;background:rgba(255,255,255,.12);overflow:hidden;border-radius:99px}.section-loading-mode-line i{display:block;height:100%;width:0;background:#fff;animation:slmbar 2.7s ease-in-out infinite}@keyframes slmspin{to{transform:rotate(360deg)}}@keyframes slmbar{0%{width:0}75%{width:88%}100%{width:92%}}';
    document.head.appendChild(s);
  }
  function paint(){
    style();
    Object.keys(modes).forEach(function(id){var sec=document.getElementById(id);if(!sec)return;var v=sec.querySelector('.section-locked-view');if(!v){v=document.createElement('div');v.className='section-locked-view';sec.appendChild(v)}v.className='section-locked-view section-loading-mode';v.innerHTML='<div class="section-loading-mode-box"><div class="section-loading-mode-spin"></div><div class="section-loading-mode-line"><i></i></div></div>';sec.classList.add('is-section-locked')});
  }
  function load(){fetch('/app/api/section-locks',{cache:'no-store'}).then(function(r){return r.json()}).then(function(d){modes={};(d.sections||[]).forEach(function(x){if(x.mode==='loading')modes[x.id]=1});paint()}).catch(function(){})}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',load);else load();
  document.addEventListener('click',function(){setTimeout(load,80);setTimeout(paint,200)},true);
  document.addEventListener('visibilitychange',function(){if(!document.hidden)load()});
  if(window.MutationObserver)new MutationObserver(paint).observe(document.documentElement,{childList:true,subtree:true});
})();
`;
