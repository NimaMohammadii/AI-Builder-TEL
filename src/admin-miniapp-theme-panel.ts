export const ADMIN_MINIAPP_THEME_PANEL_SCRIPT = `<script>
(function(){
  function esc(v){return String(v==null?'':v).replace(/[&<>]/g,function(s){return {'&':'&amp;','<':'&lt;','>':'&gt;'}[s]||s})}
  function activateSection(sectionId,title,subtitle,btn){
    document.querySelectorAll('.menu-item').forEach(function(x){x.classList.toggle('active',x===btn)});
    document.querySelectorAll('.admin-section').forEach(function(s){s.classList.toggle('active',s.id===sectionId)});
    var titleEl=document.getElementById('adminTitle'),sub=document.getElementById('adminSubtitle'),menu=document.getElementById('adminMenu');
    if(titleEl)titleEl.textContent=title;
    if(sub)sub.textContent=subtitle;
    if(menu)menu.hidden=true;
    window.scrollTo({top:0,behavior:'smooth'});
  }
  function mount(){
    var menu=document.getElementById('adminMenu');
    var page=document.querySelector('main.page');
    if(!menu||!page)return;
    var btn=document.querySelector('[data-section="miniappTheme"]');
    if(!btn){
      btn=document.createElement('button');
      btn.className='menu-item';
      btn.type='button';
      btn.setAttribute('data-section','miniappTheme');
      btn.innerHTML='<strong>Mini App Theme</strong><span>Accent color</span>';
      var provider=menu.querySelector('[data-section="marketProvider"]');
      if(provider&&provider.nextSibling)menu.insertBefore(btn,provider.nextSibling);else menu.appendChild(btn);
    }
    var section=document.getElementById('sectionMiniAppTheme');
    if(!section){
      section=document.createElement('section');
      section.className='section admin-section';
      section.id='sectionMiniAppTheme';
      section.dataset.title='Mini App Theme';
      section.dataset.subtitle='Change the mini app accent color.';
      section.innerHTML='<div class="row-title"><div><h2>Mini App Theme</h2><p class="muted small-text">Choose the dark accent color used across the mini app.</p></div><button class="ghost" id="refreshMiniAppTheme" type="button">Refresh</button></div><div class="theme-card"><div class="theme-options"><button class="theme-option theme-burgundy" data-miniapp-theme="burgundy" type="button"><i></i><span>Dark Burgundy</span></button><button class="theme-option theme-green" data-miniapp-theme="green" type="button"><i></i><span>Dark Green</span></button><button class="theme-option theme-purple" data-miniapp-theme="purple" type="button"><i></i><span>Dark Purple</span></button><button class="theme-option theme-sky" data-miniapp-theme="sky" type="button"><i></i><span>Dark Sky Blue</span></button></div><p id="miniAppThemeStatus" class="status">Loading...</p></div>';
      var marketProvider=document.getElementById('sectionMarketProvider');
      if(marketProvider&&marketProvider.nextSibling)page.insertBefore(section,marketProvider.nextSibling);else page.appendChild(section);
    }
    btn.onclick=function(){activateSection('sectionMiniAppTheme','Mini App Theme','Change the mini app accent color.',btn);loadTheme();};
    var refresh=document.getElementById('refreshMiniAppTheme');
    if(refresh)refresh.onclick=loadTheme;
    section.querySelectorAll('[data-miniapp-theme]').forEach(function(b){b.onclick=function(){saveTheme(b.getAttribute('data-miniapp-theme'))}});
    if(!document.getElementById('miniAppThemePanelStyle')){
      var style=document.createElement('style');
      style.id='miniAppThemePanelStyle';
      style.textContent='.theme-card{margin-top:14px;padding:14px 0;border-top:1px solid rgba(255,255,255,.09);border-bottom:1px solid rgba(255,255,255,.09)}.theme-options{display:grid;grid-template-columns:1fr 1fr;gap:8px}.theme-option{height:48px;border-radius:18px;border:0;background:#070707;color:#fff;font-weight:950;display:flex;align-items:center;justify-content:flex-start;gap:9px;padding:0 10px;box-shadow:inset 0 1px 0 rgba(255,255,255,.08),0 10px 22px rgba(0,0,0,.28)}.theme-option i{width:20px;height:20px;border-radius:50%;display:block;box-shadow:0 0 14px rgba(255,255,255,.08)}.theme-option span{font-size:11px}.theme-option.active{background:#fff;color:#050505}.theme-burgundy i{background:#23020b}.theme-green i{background:#021f12}.theme-purple i{background:#170225}.theme-sky i{background:#021827}';
      document.head.appendChild(style);
    }
    loadTheme();
  }
  async function loadTheme(){
    var status=document.getElementById('miniAppThemeStatus');
    if(status)status.textContent='Loading...';
    try{
      var r=await fetch('/admin/api/miniapp-theme',{credentials:'same-origin'});
      var j=await r.json().catch(function(){return {error:'Invalid response'}});
      if(!r.ok||j.error)throw new Error(j.error||'Could not load theme');
      renderTheme(j.theme&&j.theme.id||'burgundy');
      if(status)status.textContent='Active: '+esc(j.theme&&j.theme.label||'Dark Burgundy');
    }catch(e){if(status)status.textContent=e.message||'Could not load theme'}
  }
  async function saveTheme(theme){
    var status=document.getElementById('miniAppThemeStatus');
    if(status)status.textContent='Saving...';
    try{
      var r=await fetch('/admin/api/miniapp-theme',{method:'POST',credentials:'same-origin',headers:{'content-type':'application/json'},body:JSON.stringify({theme:theme})});
      var j=await r.json().catch(function(){return {error:'Invalid response'}});
      if(!r.ok||j.error)throw new Error(j.error||'Could not save theme');
      renderTheme(j.theme&&j.theme.id||theme);
      if(status)status.textContent='Saved: '+esc(j.theme&&j.theme.label||theme);
    }catch(e){if(status)status.textContent=e.message||'Could not save theme'}
  }
  function renderTheme(theme){
    document.querySelectorAll('[data-miniapp-theme]').forEach(function(btn){btn.classList.toggle('active',btn.getAttribute('data-miniapp-theme')===theme)});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
  document.addEventListener('click',function(){setTimeout(mount,60)},true);
})();
</script>`;
