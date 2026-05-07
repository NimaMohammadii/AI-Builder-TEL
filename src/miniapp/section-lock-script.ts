export const SECTION_LOCK_SCRIPT = `
(function(){
  var locks={};
  var userBlocked={};
  var userCredit=null;
  var unlocked={};
  var tg=window.Telegram&&window.Telegram.WebApp;
  var user=(tg&&tg.initDataUnsafe&&tg.initDataUnsafe.user)||{};
  var lockSvg='<svg viewBox="0 0 64 64" fill="none" aria-hidden="true"><rect x="18" y="28" width="28" height="24" rx="8" stroke="currentColor" stroke-width="3"/><path d="M23 28v-7a9 9 0 0 1 18 0v7" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><circle cx="32" cy="40" r="2.5" fill="currentColor"/></svg>';

  function userId(){return String(user.id||localStorage.getItem('ownerId')||'').trim()}
  function storageKey(id){return 'sectionUnlocked:'+id}
  function isUnlocked(id){return unlocked[id]||sessionStorage.getItem(storageKey(id))==='1'}
  function setUnlocked(id){unlocked[id]=true;sessionStorage.setItem(storageKey(id),'1')}

  function syncCredit(){
    if(userCredit===null||userCredit===undefined)return;
    var credit=Math.max(0,Math.floor(Number(userCredit)||0));
    var targets=[document.getElementById('plinkoCredit'),document.getElementById('plinkoCreditHeader')];
    targets.forEach(function(el){if(el)el.textContent=String(credit)});
    try{localStorage.setItem('plinkoCredit',String(credit))}catch(e){}
  }

  function ensureOverlay(section, item){
    if(!section)return;
    var old=section.querySelector('.section-locked-view');
    if(old)old.remove();
    var view=document.createElement('div');
    view.className='section-locked-view';
    if(item&&item.mode==='code'){
      view.innerHTML='<div class="section-locked-card code-card">'+lockSvg+'<h2>Enter access code</h2><p>This section requires an access code.</p><input class="section-code-input" type="text" inputmode="text" placeholder="Access code" autocomplete="off"/><button class="section-code-submit" type="button">Unlock</button><small class="section-code-status"></small></div>';
      var input=view.querySelector('.section-code-input');
      var button=view.querySelector('.section-code-submit');
      var status=view.querySelector('.section-code-status');
      var submit=function(){
        var code=(input&&input.value||'').trim();
        if(!code){status.textContent='Enter the access code.';return}
        status.textContent='Checking...';
        fetch('/app/api/section-locks/verify',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({sectionId:section.id,code:code})}).then(function(r){return r.json().then(function(j){return {ok:r.ok,json:j}})}).then(function(res){
          if(res.ok&&res.json&&res.json.ok){setUnlocked(section.id);applyLocks();return}
          status.textContent=(res.json&&res.json.error)||'Wrong access code.';
        }).catch(function(){status.textContent='Could not verify code.'});
      };
      button.addEventListener('click',submit);
      input.addEventListener('keydown',function(e){if(e.key==='Enter')submit()});
    }else{
      var text=(item&&item.userBlocked)?'Your access to this section is currently restricted.':'This section is currently unavailable.';
      view.innerHTML='<div class="section-locked-card">'+lockSvg+'<h2>'+text+'</h2><p>Please try again later.</p></div>';
    }
    section.appendChild(view);
  }

  function applyLocks(){
    syncCredit();
    document.querySelectorAll('.view').forEach(function(section){
      var id=section.id;
      var globalItem=locks[id];
      var item=(userBlocked[id])?{mode:'locked',locked:true,userBlocked:true}:globalItem;
      var isLocked=!!item&&item.mode!=='open'&&!isUnlocked(id);
      section.classList.toggle('is-section-locked',isLocked);
      if(isLocked)ensureOverlay(section,item);
      else{var old=section.querySelector('.section-locked-view');if(old)old.remove()}
    });
  }

  function loadGlobalLocks(){
    return fetch('/app/api/section-locks',{cache:'no-store'}).then(function(r){return r.json()}).then(function(data){
      locks={};
      (data.sections||[]).forEach(function(section){locks[section.id]={mode:section.mode||((section.locked)?'locked':'open'),locked:!!section.locked,hasCode:!!section.hasCode}});
    }).catch(function(){});
  }

  function loadUserControls(){
    var id=userId();
    if(!id)return Promise.resolve();
    return fetch('/app/api/user-controls?userId='+encodeURIComponent(id),{cache:'no-store'}).then(function(r){return r.json()}).then(function(data){
      userBlocked={};
      (data.blockedSections||[]).forEach(function(section){userBlocked[section]=true});
      userCredit=data.credit===null||data.credit===undefined?null:Number(data.credit);
    }).catch(function(){});
  }

  function loadLocks(){
    Promise.all([loadGlobalLocks(),loadUserControls()]).then(applyLocks);
  }

  document.addEventListener('click',function(){setTimeout(applyLocks,40)},true);
  loadLocks();
  setInterval(loadLocks,15000);
})();
`;
