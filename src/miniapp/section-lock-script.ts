export const SECTION_LOCK_SCRIPT = `
(function(){
  var locked={};
  var lockSvg='<svg viewBox="0 0 64 64" fill="none" aria-hidden="true"><rect x="18" y="28" width="28" height="24" rx="8" stroke="currentColor" stroke-width="3"/><path d="M23 28v-7a9 9 0 0 1 18 0v7" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><circle cx="32" cy="40" r="2.5" fill="currentColor"/></svg>';

  function ensureOverlay(section){
    if(!section||section.querySelector('.section-locked-view'))return;
    var view=document.createElement('div');
    view.className='section-locked-view';
    view.innerHTML='<div class="section-locked-card">'+lockSvg+'<h2>This section is currently unavailable.</h2><p>Please try again later.</p></div>';
    section.appendChild(view);
  }

  function applyLocks(){
    document.querySelectorAll('.view').forEach(function(section){
      var id=section.id;
      var isLocked=!!locked[id];
      section.classList.toggle('is-section-locked',isLocked);
      if(isLocked)ensureOverlay(section);
    });
  }

  function loadLocks(){
    fetch('/app/api/section-locks',{cache:'no-store'}).then(function(r){return r.json()}).then(function(data){
      locked={};
      (data.sections||[]).forEach(function(section){locked[section.id]=!!section.locked});
      applyLocks();
    }).catch(function(){});
  }

  document.addEventListener('click',function(){setTimeout(applyLocks,40)},true);
  loadLocks();
  setInterval(loadLocks,15000);
})();
`;
