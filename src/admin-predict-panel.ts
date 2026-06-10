export const ADMIN_PREDICT_PANEL_SCRIPT = `
<style>
.predict-admin{margin-top:24px;padding-top:16px;border-top:1px solid rgba(255,255,255,.09)}
.predict-admin-list{display:grid;gap:12px;margin-top:12px}
.predict-admin-card-image-list,.predict-admin-button-image-list{display:grid;gap:12px;margin:12px 0 18px}.predict-admin-card-image-list h3,.predict-admin-button-image-list h3{margin:0;color:#fff;font-size:15px}.predict-admin-card-image-list p,.predict-admin-button-image-list p{margin:0;color:rgba(255,255,255,.5);font-size:11px;line-height:1.35}
.predict-admin-row{display:grid;grid-template-columns:58px 1fr;gap:10px;padding:11px 0;border-top:1px solid rgba(255,255,255,.08)}
.predict-admin-row img{width:58px;height:58px;border-radius:18px;background:#030303;object-fit:cover;border:1px solid rgba(255,255,255,.10)}.predict-admin-button-image-list .predict-admin-row img{width:96px;height:44px;border-radius:999px;object-fit:contain}
.predict-admin-fields{display:grid;gap:7px}
.predict-admin-row input{height:auto!important;border-radius:14px!important;padding:8px!important;font-size:11px!important;background:#050505;color:#fff;border:1px solid rgba(255,255,255,.16)}
.predict-admin-row button{height:32px;border-radius:999px;border:1px solid rgba(255,255,255,.16);background:#070707;color:#fff;font-weight:900;font-size:11px}
.predict-admin-toggle{margin:12px 0 6px;padding:12px;border-radius:18px;background:rgba(255,255,255,.045);box-shadow:inset 0 1px 0 rgba(255,255,255,.08);display:flex;align-items:center;justify-content:space-between;gap:12px}
.predict-admin-toggle strong{display:block;color:#fff;font-size:13px}.predict-admin-toggle span{display:block;margin-top:4px;color:rgba(255,255,255,.5);font-size:10.5px;line-height:1.25}.predict-admin-visibility{display:grid;gap:8px;margin:12px 0 6px}.predict-admin-visibility h3{margin:14px 0 0;color:#fff;font-size:15px}.predict-admin-visibility p{margin:0;color:rgba(255,255,255,.5);font-size:11px;line-height:1.35}.predict-admin-toggle.is-hidden{border:1px solid rgba(255,90,118,.20);background:rgba(80,0,18,.16)}
.predict-admin-switch{position:relative;width:48px;height:28px;flex:0 0 auto;border:0!important;border-radius:999px!important;background:rgba(255,255,255,.12)!important;padding:0!important}
.predict-admin-switch:before{content:"";position:absolute;left:4px;top:4px;width:20px;height:20px;border-radius:999px;background:#fff;transition:transform .18s ease}
.predict-admin-switch.on{background:rgba(120,190,255,.34)!important}.predict-admin-switch.on:before{transform:translateX(20px)}
.predict-admin-status{min-height:15px;color:rgba(255,255,255,.55);font-size:11px;margin-top:8px}
</style>
<script>
(function(){
  var markets=[{id:'bitcoin',title:'Bitcoin'},{id:'ethereum',title:'Ethereum'},{id:'solana',title:'Solana'},{id:'gold',title:'Gold'},{id:'oil',title:'Oil'},{id:'football',title:'Football'},{id:'politics',title:'Politics'},{id:'fun',title:'Fun'}];
  var cryptoCardMarkets=[{id:'bitcoin',title:'Bitcoin card'},{id:'solana',title:'Solana card'},{id:'ethereum',title:'Ethereum card'},{id:'gold',title:'Gold card'},{id:'oil',title:'Oil card'}];
  var buttonSides=[{id:'up',title:'Upper button image'},{id:'down',title:'Lower button image'}];
  var cardVisibilityMarkets=[{id:'bitcoin',title:'Bitcoin'},{id:'solana',title:'Solana'},{id:'ethereum',title:'Ethereum'},{id:'gold',title:'Gold'},{id:'oil',title:'Oil'}];
  var settings={},cryptoCardImages={},buttonImages={},displaySettings={liveBetsEnabled:true,hiddenCards:{}};
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
      section.innerHTML='<div class="predict-admin"><div class="row-title"><div><h2>Predict</h2><p class="muted small-text">Upload question images and control prediction display options.</p></div><button class="ghost" id="refreshPredictAdmin">Refresh</button></div><div id="predictAdminSettings"></div><div id="predictButtonImages" class="predict-admin-button-image-list"><div class="empty">Loading...</div></div><div id="predictCryptoCardImages" class="predict-admin-card-image-list"><div class="empty">Loading...</div></div><div id="predictAdminList" class="predict-admin-list"><div class="empty">Loading...</div></div><p id="predictAdminStatus" class="predict-admin-status"></p></div>';
      main.appendChild(section);
      document.getElementById('refreshPredictAdmin').onclick=loadPredictAdmin;
    }
  }
  function renderSettings(){
    var box=document.getElementById('predictAdminSettings');if(!box)return;
    var on=displaySettings.liveBetsEnabled!==false;
    var hidden=displaySettings.hiddenCards||{};
    box.innerHTML='<div class="predict-admin-toggle"><div><strong>Show live bet numbers</strong><span>Enable or hide the animated user bet numbers on the left side of the Predict chart.</span></div><button type="button" class="predict-admin-switch '+(on?'on':'')+'" aria-label="Toggle live bet numbers" id="predictLiveBetsToggle"></button></div><div class="predict-admin-visibility"><h3>Predict card visibility</h3><p>Hide a card from the user UI without deleting images or prediction data. Turn it back on any time.</p>'+cardVisibilityMarkets.map(function(market){var visible=hidden[market.id]!==true;return '<div class="predict-admin-toggle '+(visible?'':'is-hidden')+'"><div><strong>'+esc(market.title)+'</strong><span>'+(visible?'Visible in Predict UI':'Hidden from Predict UI')+'</span></div><button type="button" class="predict-admin-switch '+(visible?'on':'')+'" aria-label="Toggle '+esc(market.title)+' visibility" data-predict-visibility="'+esc(market.id)+'"></button></div>'}).join('')+'</div>';
    var toggle=document.getElementById('predictLiveBetsToggle');if(toggle)toggle.onclick=function(){savePredictSettings({liveBetsEnabled:!on})};
    box.querySelectorAll('[data-predict-visibility]').forEach(function(button){button.onclick=function(){var id=button.dataset.predictVisibility,nextHidden=Object.assign({},displaySettings.hiddenCards||{});nextHidden[id]=!(nextHidden[id]===true);savePredictSettings({hiddenCards:nextHidden})}});
  }
  function render(){
    renderSettings();
    var buttonList=document.getElementById('predictButtonImages');
    if(buttonList){
      buttonList.innerHTML='<h3>Predict up/down button images</h3><p>Upload the two images that replace the current Up and Down buttons in the Predict panel.</p>'+buttonSides.map(function(side){
        var url=(buttonImages[side.id]&&buttonImages[side.id].imageUrl)||'';
        var preview=url?'<img src="'+esc(withVersion(url))+'" alt=""/>':'<img alt=""/>';
        return '<article class="predict-admin-row">'+preview+'<div class="predict-admin-fields"><b>'+esc(side.title)+'</b><input data-predict-button-file="'+esc(side.id)+'" type="file" accept="image/png,image/jpeg,image/webp,.png,.jpg,.jpeg,.webp"/><button data-predict-button-upload="'+esc(side.id)+'">Upload button image</button></div></article>';
      }).join('');
      buttonList.querySelectorAll('[data-predict-button-upload]').forEach(function(button){button.onclick=function(){uploadPredictButtonImage(button.dataset.predictButtonUpload)}});
    }
    var cardList=document.getElementById('predictCryptoCardImages');
    if(cardList){
      cardList.innerHTML='<h3>Predict card images</h3><p>These uploads are only for the empty Crypto, Gold, and Oil cards. Existing Predict images stay unchanged.</p>'+cryptoCardMarkets.map(function(market){
        var url=(cryptoCardImages[market.id]&&cryptoCardImages[market.id].imageUrl)||'';
        var preview=url?'<img src="'+esc(withVersion(url))+'" alt=""/>':'<img alt=""/>';
        return '<article class="predict-admin-row">'+preview+'<div class="predict-admin-fields"><b>'+esc(market.title)+'</b><input data-predict-card-file="'+esc(market.id)+'" type="file" accept="image/png,image/jpeg,image/webp,.png,.jpg,.jpeg,.webp"/><button data-predict-card-upload="'+esc(market.id)+'">Upload card image</button></div></article>';
      }).join('');
      cardList.querySelectorAll('[data-predict-card-upload]').forEach(function(button){button.onclick=function(){uploadCryptoCardImage(button.dataset.predictCardUpload)}});
    }
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
      var buttonResponse=await fetch('/admin/api/predict-button-images',{credentials:'same-origin',cache:'no-store'});
      var buttonJson=await buttonResponse.json();
      if(buttonResponse.ok)buttonImages=buttonJson.images||{};
      var cardResponse=await fetch('/admin/api/predict-crypto-card-images',{credentials:'same-origin',cache:'no-store'});
      var cardJson=await cardResponse.json();
      if(cardResponse.ok)cryptoCardImages=cardJson.images||{};
      var settingsResponse=await fetch('/admin/api/predict-settings',{credentials:'same-origin',cache:'no-store'});
      var settingsJson=await settingsResponse.json();
      if(settingsResponse.ok)displaySettings=settingsJson||displaySettings;
      render();
      if(status)status.textContent='Loaded';
    }catch(error){if(status)status.textContent=error.message||'Load failed'}
  }
  async function savePredictSettings(patch){
    var status=document.getElementById('predictAdminStatus');
    var next=Object.assign({},displaySettings||{},patch||{});
    next.liveBetsEnabled=next.liveBetsEnabled!==false;
    next.hiddenCards=next.hiddenCards||{};
    if(status)status.textContent='Saving settings...';
    try{
      var response=await fetch('/admin/api/predict-settings',{method:'POST',credentials:'same-origin',headers:{'content-type':'application/json'},body:JSON.stringify(next)});
      var json=await response.json();
      if(!response.ok)throw new Error(json.error||'Save failed');
      displaySettings=json||next;
      renderSettings();
      if(status)status.textContent='Settings saved';
    }catch(error){if(status)status.textContent=error.message||'Save failed'}
  }

  async function uploadPredictButtonImage(id){
    var status=document.getElementById('predictAdminStatus');
    var input=document.querySelector('[data-predict-button-file="'+id+'"]');
    if(!input||!input.files||!input.files[0]){if(status)status.textContent='Choose a button image first';return;}
    try{
      var form=new FormData();
      form.append('side',id);
      form.append('image',input.files[0]);
      if(status)status.textContent='Uploading button image...';
      var response=await fetch('/admin/api/predict-button-image',{method:'POST',credentials:'same-origin',body:form});
      var json=await response.json();
      if(!response.ok)throw new Error(json.error||'Upload failed');
      buttonImages=json.images||{};
      render();
      if(status)status.textContent='Predict button image uploaded';
    }catch(error){if(status)status.textContent=error.message||'Upload failed'}
  }
  async function uploadCryptoCardImage(id){
    var status=document.getElementById('predictAdminStatus');
    var input=document.querySelector('[data-predict-card-file="'+id+'"]');
    if(!input||!input.files||!input.files[0]){if(status)status.textContent='Choose a card image first';return;}
    try{
      var form=new FormData();
      form.append('market',id);
      form.append('image',input.files[0]);
      if(status)status.textContent='Uploading card image...';
      var response=await fetch('/admin/api/predict-crypto-card-image',{method:'POST',credentials:'same-origin',body:form});
      var json=await response.json();
      if(!response.ok)throw new Error(json.error||'Upload failed');
      cryptoCardImages=json.images||{};
      render();
      if(status)status.textContent='Card image uploaded';
    }catch(error){if(status)status.textContent=error.message||'Upload failed'}
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