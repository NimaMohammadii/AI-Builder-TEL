export const ADMIN_PREDICT_PANEL_SCRIPT = `
<style>
.predict-admin{margin-top:24px;padding-top:16px;border-top:1px solid rgba(255,255,255,.09)}
.predict-admin-list{display:grid;gap:12px;margin-top:12px}
.predict-admin-row{display:grid;grid-template-columns:58px 1fr;gap:10px;padding:11px 0;border-top:1px solid rgba(255,255,255,.08)}
.predict-admin-row img{width:58px;height:58px;border-radius:18px;background:#030303;object-fit:cover;border:1px solid rgba(255,255,255,.10)}
.predict-admin-fields{display:grid;gap:7px}
.predict-admin-row input{height:auto!important;border-radius:14px!important;padding:8px!important;font-size:11px!important;background:#050505;color:#fff;border:1px solid rgba(255,255,255,.16)}
.predict-admin-row button{height:32px;border-radius:999px;border:1px solid rgba(255,255,255,.16);background:#070707;color:#fff;font-weight:900;font-size:11px}
.predict-admin-toggle{margin:12px 0 6px;padding:12px;border-radius:18px;background:rgba(255,255,255,.045);box-shadow:inset 0 1px 0 rgba(255,255,255,.08);display:flex;align-items:center;justify-content:space-between;gap:12px}
.predict-admin-toggle strong{display:block;color:#fff;font-size:13px}.predict-admin-toggle span{display:block;margin-top:4px;color:rgba(255,255,255,.5);font-size:10.5px;line-height:1.25}
.predict-admin-switch{position:relative;width:48px;height:28px;flex:0 0 auto;border:0!important;border-radius:999px!important;background:rgba(255,255,255,.12)!important;padding:0!important}
.predict-admin-switch:before{content:"";position:absolute;left:4px;top:4px;width:20px;height:20px;border-radius:999px;background:#fff;transition:transform .18s ease}
.predict-admin-switch.on{background:rgba(120,190,255,.34)!important}.predict-admin-switch.on:before{transform:translateX(20px)}
.predict-admin-status{min-height:15px;color:rgba(255,255,255,.55);font-size:11px;margin-top:8px}
</style>
<script>
(function(){
  var markets=[{id:'bitcoin',title:'Bitcoin'},{id:'ton',title:'TON'}];
  var settings={},displaySettings={liveBetsEnabled:true};
  function esc(value){return String(value==null?'':value).replace(/[&<>]/g,function(char){return {'&':'&amp;','<':'&lt;','>':'&gt;'}[char]||char})}
  function withVersion(url){return url ? url + (url.indexOf('?')>=0 ? '&' : '?') + 't=' + Date.now() : ''}
  function mount(){
    var menu=document.getElementById('adminMenu');
    var main=document.querySelector('main.page');
    if(menu&&!document.querySelector('[data-section="predictAdmin"]')){
      var button=document.createElement('button');
      button.className='menu-item';
      button.type='button';
      button.dataset.section='predictAdmin';
      button.innerHTML='<strong>Predict</strong><span>Images</span>';
      menu.appendChild(button);
      button.onclick=function(){
        document.querySelectorAll('.menu-item').forEach(function(item){item.classList.toggle('active',item===button)});
        document.querySelectorAll('.admin-section').forEach(function(section){section.classList.toggle('active',section.id==='sectionPredictAdmin')});
        document.getElementById('adminTitle').textContent='Predict';
        document.getElementById('adminSubtitle').textContent='Manage prediction images and display options.';
        menu.hidden=true;
        loadPredictAdmin();
      };
    }
    if(main&&!document.getElementById('sectionPredictAdmin')){
      var section=document.createElement('section');
      section.className='section admin-section';
      section.id='sectionPredictAdmin';
      section.innerHTML='<div class="predict-admin"><div class="row-title"><div><h2>Predict</h2><p class="muted small-text">Upload question images and control prediction display options.</p></div><button class="ghost" id="refreshPredictAdmin">Refresh</button></div><div id="predictAdminSettings"></div><div id="predictAdminList" class="predict-admin-list"><div class="empty">Loading...</div></div><p id="predictAdminStatus" class="predict-admin-status"></p></div>';
      main.appendChild(section);
      document.getElementById('refreshPredictAdmin').onclick=loadPredictAdmin;
    }
  }
  function renderSettings(){
    var box=document.getElementById('predictAdminSettings');if(!box)return;
    var on=displaySettings.liveBetsEnabled!==false;
    box.innerHTML='<div class="predict-admin-toggle"><div><strong>Show live bet numbers</strong><span>Enable or hide the animated user bet numbers on the left side of the Predict chart.</span></div><button type="button" class="predict-admin-switch '+(on?'on':'')+'" aria-label="Toggle live bet numbers" id="predictLiveBetsToggle"></button></div>';
    var toggle=document.getElementById('predictLiveBetsToggle');if(toggle)toggle.onclick=function(){savePredictSettings(!on)};
  }
  function render(){
    renderSettings();
    var list=document.getElementById('predictAdminList');
    if(!list)return;
    list.innerHTML=markets.map(function(market){
      var url=(settings[market.id]&&settings[market.id].imageUrl)||'';
      var preview=url?'<img src="'+esc(withVersion(url))+'" alt=""/>':'<img alt=""/>';
      return '<article class="predict-admin-row">'+preview+'<div class="predict-admin-fields"><b>'+esc(market.title)+'</b><input data-predict-file="'+esc(market.id)+'" type="file" accept="image/png,image/jpeg,image/webp,.png,.jpg,.jpeg,.webp"/><button data-predict-upload="'+esc(market.id)+'">Upload image</button></div></article>';
    }).join('');
    list.querySelectorAll('[data-predict-upload]').forEach(function(button){button.onclick=function(){uploadPredictImage(button.dataset.predictUpload)}});
  }
  async function loadPredictAdmin(){
    var status=document.getElementById('predictAdminStatus');
    if(status)status.textContent='Loading...';
    try{
      var response=await fetch('/admin/api/predict-markets',{credentials:'same-origin',cache:'no-store'});
      var json=await response.json();
      if(!response.ok)throw new Error(json.error||'Load failed');
      settings=json.markets||{};
      var settingsResponse=await fetch('/admin/api/predict-settings',{credentials:'same-origin',cache:'no-store'});
      var settingsJson=await settingsResponse.json();
      if(settingsResponse.ok)displaySettings=settingsJson||displaySettings;
      render();
      if(status)status.textContent='Loaded';
    }catch(error){if(status)status.textContent=error.message||'Load failed'}
  }
  async function savePredictSettings(enabled){
    var status=document.getElementById('predictAdminStatus');
    if(status)status.textContent='Saving settings...';
    try{
      var response=await fetch('/admin/api/predict-settings',{method:'POST',credentials:'same-origin',headers:{'content-type':'application/json'},body:JSON.stringify({liveBetsEnabled:!!enabled})});
      var json=await response.json();
      if(!response.ok)throw new Error(json.error||'Save failed');
      displaySettings=json||{liveBetsEnabled:!!enabled};
      renderSettings();
      if(status)status.textContent='Settings saved';
    }catch(error){if(status)status.textContent=error.message||'Save failed'}
  }
  async function uploadPredictImage(id){
    var status=document.getElementById('predictAdminStatus');
    var input=document.querySelector('[data-predict-file="'+id+'"]');
    if(!input||!input.files||!input.files[0]){if(status)status.textContent='Choose an image first';return;}
    try{
      var form=new FormData();
      form.append('market',id);
      form.append('image',input.files[0]);
      if(status)status.textContent='Uploading...';
      var response=await fetch('/admin/api/predict-market-image',{method:'POST',credentials:'same-origin',body:form});
      var json=await response.json();
      if(!response.ok)throw new Error(json.error||'Upload failed');
      settings=json.markets||{};
      render();
      if(status)status.textContent='Uploaded';
    }catch(error){if(status)status.textContent=error.message||'Upload failed'}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
  document.addEventListener('click',function(){setTimeout(mount,80)},true);
})();
</script>
`;