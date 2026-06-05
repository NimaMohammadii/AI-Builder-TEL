export const ADMIN_DICE_ASSETS_PANEL_SCRIPT = `
<style>
#diceAssetsPanel{margin-top:24px;padding-top:18px;border-top:1px solid rgba(255,255,255,.10)}
.dice-asset-admin-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin-top:12px}
.dice-asset-admin-card{padding:10px;border:1px solid rgba(255,255,255,.10);border-radius:18px;background:rgba(255,255,255,.03)}
.dice-asset-admin-title{display:flex;gap:9px;align-items:center}.dice-asset-admin-title strong{font-size:12px;line-height:1.25}
.dice-asset-admin-preview{width:70px;height:70px;border:1px solid rgba(255,255,255,.12);border-radius:16px;background:rgba(0,0,0,.38);object-fit:contain;opacity:.35}
.dice-asset-admin-card input{height:auto;margin-top:9px;border-radius:15px;padding:9px;font-size:11px}
.dice-asset-admin-card button{margin-top:9px!important;height:34px!important;border-radius:999px!important;font-size:12px!important}
.dice-asset-admin-status{min-height:16px;margin:9px 0 0;color:rgba(255,255,255,.58);font-size:11px}
@media(max-width:620px){.dice-asset-admin-grid{grid-template-columns:1fr}}
</style>
<script>
(function(){
  var allowed=['image/png','image/jpeg','image/webp'];
  function esc(v){return String(v||'').replace(/[&<>\"]/g,function(s){return {'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[s]||s})}
  function previewSrc(url){return url ? url+(url.indexOf('?')>=0?'&':'?')+'t='+Date.now() : ''}
  function mount(){
    var target=document.getElementById('sectionImages');
    if(!target||document.getElementById('diceAssetsPanel'))return;
    var wrap=document.createElement('div');
    wrap.id='diceAssetsPanel';
    wrap.innerHTML='<h2>Dice game images</h2><p class="muted small-text">Upload three Dice images: Roll Dice button, the full bet input row with both side buttons, and the slider button on the number bar.</p><div id="diceAssetsGrid" class="dice-asset-admin-grid"><div class="empty">Loading...</div></div>';
    target.appendChild(wrap);
    var grid=document.getElementById('diceAssetsGrid');
    if(grid)grid.addEventListener('click',function(ev){var b=ev.target&&ev.target.closest?ev.target.closest('[data-dice-asset-upload]'):null;if(b)upload(b.getAttribute('data-dice-asset-upload'))});
    load();
  }
  function render(assets){
    var grid=document.getElementById('diceAssetsGrid');
    if(!grid)return;
    grid.innerHTML=(assets||[]).map(function(asset){return '<div class="dice-asset-admin-card" data-dice-asset-card="'+esc(asset.id)+'"><div class="dice-asset-admin-title"><img id="diceAssetPreview_'+esc(asset.id)+'" class="dice-asset-admin-preview" alt="'+esc(asset.label)+' preview" src="'+(asset.imageUrl?previewSrc(esc(asset.imageUrl)):'')+'" style="opacity:'+(asset.imageUrl?'1':'.35')+'"/><strong>'+esc(asset.label)+'</strong></div><p class="muted small-text">'+esc(asset.hint)+'</p><input id="diceAssetInput_'+esc(asset.id)+'" type="file" accept="image/png,image/jpeg,image/webp,.png,.jpg,.jpeg,.webp"/><button class="primary" data-dice-asset-upload="'+esc(asset.id)+'" type="button">Upload image</button><p id="diceAssetStatus_'+esc(asset.id)+'" class="dice-asset-admin-status">'+(asset.hasImage?'Loaded in Dice game.':'No image uploaded yet.')+'</p></div>'}).join('');
  }
  async function load(){
    var grid=document.getElementById('diceAssetsGrid');
    if(!grid)return;
    try{
      var r=await fetch('/app/api/dice-assets',{credentials:'same-origin',cache:'no-store'});
      var j=await r.json();
      if(!r.ok)throw new Error(j.error||'Could not load Dice images');
      render(j.assets||[]);
    }catch(e){grid.innerHTML='<p class="muted small-text">'+esc(e&&e.message?e.message:'Could not load Dice images')+'</p>'}
  }
  async function upload(id){
    var input=document.getElementById('diceAssetInput_'+id);
    var btn=document.querySelector('[data-dice-asset-upload="'+id+'"]');
    var status=document.getElementById('diceAssetStatus_'+id);
    var file=input&&input.files&&input.files[0];
    if(!file){if(status)status.textContent='Choose an image first.';return}
    if(allowed.indexOf(file.type)===-1){if(status)status.textContent='Only PNG, JPG, JPEG or WebP.';return}
    var form=new FormData();
    form.append('id',id);
    form.append('image',file);
    if(btn)btn.disabled=true;
    if(status)status.textContent='Uploading Dice image...';
    try{
      var r=await fetch('/admin/api/upload-dice-asset',{method:'POST',credentials:'same-origin',body:form});
      var j=await r.json();
      if(!r.ok)throw new Error(j.error||'Could not upload Dice image');
      var img=document.getElementById('diceAssetPreview_'+id);
      if(img&&j.imageUrl){img.src=previewSrc(esc(j.imageUrl));img.style.opacity='1'}
      if(status)status.textContent='Dice image saved and ready in the game.';
    }catch(e){if(status)status.textContent=e&&e.message?e.message:'Could not upload Dice image'}
    finally{if(btn)btn.disabled=false}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
  document.addEventListener('click',function(){setTimeout(mount,80)},true);
  setTimeout(mount,500);setTimeout(mount,1500);
})();
</script>
`;
