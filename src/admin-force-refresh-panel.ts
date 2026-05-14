export const ADMIN_FORCE_REFRESH_PANEL_SCRIPT = `
<script>
(function(){
  function ensureForceRefreshPanel(){
    if(document.getElementById('vexaForceRefreshBlock'))return;
    var page=document.querySelector('.page')||document.body;
    if(!page)return;
    var block=document.createElement('div');
    block.id='vexaForceRefreshBlock';
    block.style.cssText='display:block!important;margin:0 0 14px!important;padding:12px!important;border:1px solid rgba(255,255,255,.14)!important;border-radius:18px!important;background:rgba(255,255,255,.055)!important';
    block.innerHTML='<div class="row-title"><div><h2 style="margin:0 0 4px">Force update all users</h2><p class="muted small-text">After changing images/assets, press this to refresh cached images for Mini App users.</p></div></div><button class="primary" id="vexaForceRefreshBtn" type="button">Force update all users</button><p id="vexaForceRefreshStatus" class="status"></p>';
    var menu=document.getElementById('adminMenu');
    var head=document.querySelector('.head');
    if(menu&&menu.parentNode===page)page.insertBefore(block,menu);
    else if(head&&head.parentNode===page)page.insertBefore(block,head.nextSibling);
    else page.insertBefore(block,page.firstChild);
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
