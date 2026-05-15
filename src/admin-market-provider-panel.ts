export const ADMIN_MARKET_PROVIDER_PANEL_SCRIPT = `<script>
(function(){
  function esc(v){return String(v==null?'':v).replace(/[&<>]/g,function(s){return {'&':'&amp;','<':'&lt;','>':'&gt;'}[s]||s})}
  function activateSection(sectionId, title, subtitle, btn){
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
    var btn=document.querySelector('[data-section="marketProvider"]');
    if(!btn){
      btn=document.createElement('button');
      btn.className='menu-item';
      btn.type='button';
      btn.setAttribute('data-section','marketProvider');
      btn.innerHTML='<strong>Market provider</strong><span>Getgems or Fragment</span>';
      var uploaded=menu.querySelector('[data-section="images"]');
      if(uploaded&&uploaded.nextSibling)menu.insertBefore(btn,uploaded.nextSibling);else menu.appendChild(btn);
    }
    var section=document.getElementById('sectionMarketProvider');
    if(!section){
      section=document.createElement('section');
      section.className='section admin-section';
      section.id='sectionMarketProvider';
      section.dataset.title='Market provider';
      section.dataset.subtitle='Choose NFT market data source.';
      section.innerHTML='<div class="row-title"><div><h2>Market provider</h2><p class="muted small-text">Choose which provider loads NFTs in the app market.</p></div><button class="ghost" id="refreshMarketProvider" type="button">Refresh</button></div><div class="provider-card"><label>Active provider</label><div class="provider-actions"><button class="market-provider-option" data-market-provider="getgems" type="button">Getgems</button><button class="market-provider-option" data-market-provider="fragment" type="button">Fragment</button></div><p id="marketProviderStatus" class="status">Loading...</p></div>';
      var sectionImages=document.getElementById('sectionImages');
      if(sectionImages&&sectionImages.nextSibling)page.insertBefore(section,sectionImages.nextSibling);else page.appendChild(section);
    }
    btn.onclick=function(){activateSection('sectionMarketProvider','Market provider','Choose NFT market data source.',btn);loadProvider();};
    var refresh=document.getElementById('refreshMarketProvider');
    if(refresh)refresh.onclick=loadProvider;
    section.querySelectorAll('[data-market-provider]').forEach(function(b){b.onclick=function(){saveProvider(b.getAttribute('data-market-provider'))}});
    if(!document.getElementById('marketProviderPanelStyle')){
      var style=document.createElement('style');
      style.id='marketProviderPanelStyle';
      style.textContent='.provider-card{margin-top:14px;padding:14px 0;border-top:1px solid rgba(255,255,255,.09);border-bottom:1px solid rgba(255,255,255,.09)}.provider-actions{display:grid;grid-template-columns:1fr 1fr;gap:8px}.market-provider-option{height:38px;border-radius:999px;border:1px solid rgba(255,255,255,.16);background:#070707;color:#fff;font-weight:950}.market-provider-option.active{background:#fff;color:#050505;border-color:#fff}';
      document.head.appendChild(style);
    }
    loadProvider();
  }
  async function loadProvider(){
    var status=document.getElementById('marketProviderStatus');
    if(status)status.textContent='Loading...';
    try{
      var r=await fetch('/admin/api/market-provider',{credentials:'same-origin'});
      var j=await r.json().catch(function(){return {error:'Invalid response'}});
      if(!r.ok||j.error)throw new Error(j.error||'Could not load provider');
      renderProvider(j.provider||'getgems');
      if(status)status.textContent='Active: '+esc(j.provider||'getgems');
    }catch(e){if(status)status.textContent=e.message||'Could not load provider'}
  }
  async function saveProvider(provider){
    var status=document.getElementById('marketProviderStatus');
    if(status)status.textContent='Saving...';
    try{
      var r=await fetch('/admin/api/market-provider',{method:'POST',credentials:'same-origin',headers:{'content-type':'application/json'},body:JSON.stringify({provider:provider})});
      var j=await r.json().catch(function(){return {error:'Invalid response'}});
      if(!r.ok||j.error)throw new Error(j.error||'Could not save provider');
      renderProvider(j.provider||provider);
      if(status)status.textContent='Saved: '+esc(j.provider||provider);
    }catch(e){if(status)status.textContent=e.message||'Could not save provider'}
  }
  function renderProvider(provider){
    document.querySelectorAll('[data-market-provider]').forEach(function(btn){btn.classList.toggle('active',btn.getAttribute('data-market-provider')===provider)});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
  document.addEventListener('click',function(){setTimeout(mount,60)},true);
})();
</script>`;
