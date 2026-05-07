export const SECTION_LOCK_SCRIPT = `
(function(){
  var locks={};
  var unlocked={};
  var lockSvg='<svg viewBox="0 0 64 64" fill="none" aria-hidden="true"><rect x="18" y="28" width="28" height="24" rx="8" stroke="currentColor" stroke-width="3"/><path d="M23 28v-7a9 9 0 0 1 18 0v7" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><circle cx="32" cy="40" r="2.5" fill="currentColor"/></svg>';

  function storageKey(id){return 'sectionUnlocked:'+id}
  function isUnlocked(id){return unlocked[id]||sessionStorage.getItem(storageKey(id))==='1'}
  function setUnlocked(id){unlocked[id]=true;sessionStorage.setItem(storageKey(id),'1')}

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
      view.innerHTML='<div class="section-locked-card">'+lockSvg+'<h2>This section is currently unavailable.</h2><p>Please try again later.</p></div>';
    }
    section.appendChild(view);
  }

  function applyLocks(){
    document.querySelectorAll('.view').forEach(function(section){
      var id=section.id;
      var item=locks[id];
      var isLocked=!!item&&item.mode!=='open'&&!isUnlocked(id);
      section.classList.toggle('is-section-locked',isLocked);
      if(isLocked)ensureOverlay(section,item);
      else{var old=section.querySelector('.section-locked-view');if(old)old.remove()}
    });
  }

  function loadLocks(){
    fetch('/app/api/section-locks',{cache:'no-store'}).then(function(r){return r.json()}).then(function(data){
      locks={};
      (data.sections||[]).forEach(function(section){locks[section.id]={mode:section.mode||((section.locked)?'locked':'open'),locked:!!section.locked,hasCode:!!section.hasCode}});
      applyLocks();
    }).catch(function(){});
  }

  document.addEventListener('click',function(){setTimeout(applyLocks,40)},true);
  loadLocks();
  setInterval(loadLocks,15000);
})();
`;
