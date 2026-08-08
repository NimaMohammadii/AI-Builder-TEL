export const SECTION_ACCESS_SCRIPT = `
(function(){
  var tg=window.Telegram&&window.Telegram.WebApp;
  var user=(tg&&tg.initDataUnsafe&&tg.initDataUnsafe.user)||{};
  var timer=0;
  var last='';
  function userId(){return String(user.id||localStorage.getItem('ownerId')||'').trim()}
  function esc(v){return String(v||'').replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
  function remove(){clearInterval(timer);timer=0;var el=document.getElementById('vexaAccessLock');if(el)el.remove();document.documentElement.classList.remove('vexa-access-locked')}
  function render(lock){
    var existing=document.getElementById('vexaAccessLock');if(existing)existing.remove();
    clearInterval(timer);
    document.documentElement.classList.add('vexa-access-locked');
    var el=document.createElement('main');el.id='vexaAccessLock';el.className='vexa-access-lock-screen';
    el.innerHTML='<section class="vexa-access-lock-card" aria-label="Mini app update"><p class="vexa-access-lock-title"><span>Updating</span><span class="vexa-access-lock-dots" aria-hidden="true"><i></i><i></i><i></i></span></p><div class="vexa-access-lock-bar" aria-hidden="true"><span></span></div></section>';
    document.body.appendChild(el);
    var fill=el.querySelector('.vexa-access-lock-bar span');
    var offset=Number(lock.serverNow||0)-Date.now()/1000,from=Number(lock.lockedFrom)||0,until=Number(lock.lockedUntil)||0,total=Math.max(1,until-from);
    function tick(){var now=Date.now()/1000+offset;var progress=Math.min(100,Math.max(0,(now-from)/total*100));if(fill)fill.style.width=progress+'%';if(now>=until){clearInterval(timer);location.reload()}}
    tick();timer=setInterval(tick,500);
  }
  async function load(){
    var id=userId();if(!id)return remove();
    try{var r=await fetch('/app/api/section-access?userId='+encodeURIComponent(id),{cache:'no-store'});var j=await r.json();var active=document.querySelector('.view.active');var section=active&&active.id||'home';var lock=j&&j.locks&&((j.locks.app)||j.locks[section]);var signature=lock?lock.sectionId+':'+lock.lockedUntil:'';if(signature===last)return;last=signature;if(lock)render(lock);else remove()}catch(e){}
  }
  window.VexaSectionLocks={reload:load};
  window.addEventListener('vexa:section-mounted',function(){setTimeout(load,0)});
  document.addEventListener('visibilitychange',function(){if(!document.hidden)load()});
  setInterval(load,15000);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',load);else load();
})();
`;
