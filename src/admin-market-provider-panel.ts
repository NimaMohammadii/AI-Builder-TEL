export const ADMIN_MARKET_PROVIDER_PANEL_SCRIPT = `<script>
(function(){
  function esc(v){return String(v==null?'':v).replace(/[&<>]/g,function(s){return {'&':'&amp;','<':'&lt;','>':'&gt;'}[s]||s})}
  function mount(){
    var menu=document.getElementById('adminMenu');
    var page=document.querySelector('main.page');
    if(!menu||!page||document.getElementById('sectionMarketProvider'))return;
    var btn=document.createElement('button');
    btn.className='menu-item';
    btn.type='button';
    btn.setAttribute('data-section','marketProvider');
    btn.innerHTML='<strong>Market provider</strong><span>Getgems or Fragment</span>';
    menu.appendChild(btn);
    var section=document.createElement('section');
    section.className='section admin-section';
    section.id='sectionMarketProvider';
    section.dataset.title='Market provider';
    section.dataset.subtitle='Choose NFT market data source.';
    section.innerHTML='<div class="row-title"><div><h2>Market provider</h2><p class="muted small-text">Choose which provider loads NFTs in the app market.</p></div><button class="ghost" id="refreshMarketProvider" type="button">Refresh</button></div><div class="provider-card"><label>Active provider</label><div class="provider-actions"><button class="market-provider-option" data-market-provider="getgems" type="button">Getgems</button><button class="market-provider-option" data-market-provider="fragment" type="button">Fragment</button></div><p id="marketProviderStatus" class="status">Loading...</p></div>';
    page.appendChild(section);
    btn.onclick=function(){
      document.querySelectorAll('.menu-item').forEach(function(x){x.classList.toggle('active',x===btn)});
      document.querySelectorAll('.admin-section').forEach(function(s){s.classList.toggle('active',s.id==='sectionMarketProvider')});
      var title=document.getElementById('adminTitle'),sub=document.getElementById('adminSubtitle');
      if(title)title.textContent='Market provider';
      if(sub)sub.textContent='Choose NFT market data source.';
      menu.hidden=true;
      window.scrollTo({top:0,behavior:'smooth'});
      loadProvider();
    };
    document.getElementById('refreshMarketProvider').onclick=loadProvider;
    section.querySelectorAll('[data-market-provider]').forEach(function(b){b.onclick=function(){saveProvider(b.getAttribute('data-market-provider'))}});
    var style=document.createElement('style');
    style.textContent='.provider-card{margin-top:14px;padding:14px 0;border-top:1px solid rgba(255,255,255,.09);border-bottom:1px solid rgba(255,255,255,.09)}.provider-actions{display:grid;grid-template-columns:1fr 1fr;gap:8px}.market-provider-option{height:38px;border-radius:999px;border:1px solid rgba(255,255,255,.16);background:#070707;color:#fff;font-weight:950}.market-provider-option.active{background:#fff;color:#050505;border-color:#fff}';
    document.head.appendChild(style);
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
})();
</script>`;
