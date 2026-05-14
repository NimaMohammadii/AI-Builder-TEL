export const ADMIN_FORCE_REFRESH_PANEL_SCRIPT = `
<script>
(function(){
  function ensureForceRefreshPanel(){
    if(document.getElementById('vexaForceRefreshBlock'))return;
    var section=document.getElementById('sectionImages')||document.querySelector('.page')||document.body;
    if(!section)return;
    var block=document.createElement('div');
    block.id='vexaForceRefreshBlock';
    block.className='admin-section';
    block.style.marginTop='12px';
    block.innerHTML='<div class="row-title"><div><h2>Force update all users</h2><p class="muted small-text">After changing images/assets, press this to bump app cache version for all Mini App users.</p></div></div><button class="primary" id="vexaForceRefreshBtn" type="button">Force update all users</button><p id="vexaForceRefreshStatus" class="status"></p>';
    section.insertBefore(block,section.firstChild);
    var btn=document.getElementById('vexaForceRefreshBtn');
    var status=document.getElementById('vexaForceRefreshStatus');
    if(!btn)return;
    btn.onclick=function(){
      btn.disabled=true;
      if(status)status.textContent='Updating app cache version...';
      fetch('/admin/api/force-app-refresh',{method:'POST',credentials:'same-origin',headers:{'content-type':'application/json'},body:JSON.stringify({source:'admin-panel'})})
        .then(function(r){return r.json().then(function(j){if(!r.ok)throw new Error(j.error||'Update failed');return j;});})
        .then(function(j){
          if(status)status.textContent='Done. New version: '+j.version+'. Users will refresh images automatically.';
          try{window.VexaAppRefresh&&window.VexaAppRefresh.apply&&window.VexaAppRefresh.apply(j.version,true)}catch(e){}
        })
        .catch(function(e){if(status)status.textContent=e&&e.message?e.message:'Update failed';})
        .finally(function(){btn.disabled=false;});
    };
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ensureForceRefreshPanel);else ensureForceRefreshPanel();
  document.addEventListener('click',function(){setTimeout(ensureForceRefreshPanel,80)},true);
})();
</script>
`;
