export const ADMIN_SLOT_FRAME_PANEL_SCRIPT = `
<style>
#slotFramePanel{margin-top:24px;padding-top:18px;border-top:1px solid rgba(255,255,255,.10)}
.slot-frame-admin-card{display:grid;grid-template-columns:96px 1fr;gap:12px;align-items:center;margin-top:12px;padding:12px;border:1px solid rgba(255,255,255,.10);border-radius:20px;background:rgba(255,255,255,.035)}
.slot-frame-admin-preview{width:96px;height:96px;border:1px solid rgba(255,255,255,.12);border-radius:18px;background:rgba(0,0,0,.42);object-fit:contain;box-shadow:inset 0 1px 0 rgba(255,255,255,.08)}
.slot-frame-admin-card input,.slot-symbol-admin-card input{height:auto;margin-top:9px;border-radius:15px;padding:9px;font-size:11px}
.slot-frame-admin-card button,.slot-symbol-admin-card button{margin-top:9px!important;height:34px!important;border-radius:999px!important;font-size:12px!important}
.slot-frame-admin-status,.slot-symbol-admin-status{min-height:16px;margin:9px 0 0;color:rgba(255,255,255,.58);font-size:11px}
.slot-symbol-admin-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-top:12px}
.slot-symbol-admin-card{padding:10px;border:1px solid rgba(255,255,255,.10);border-radius:18px;background:rgba(255,255,255,.03)}
.slot-symbol-admin-preview{width:70px;height:70px;border:1px solid rgba(255,255,255,.12);border-radius:16px;background:rgba(0,0,0,.38);object-fit:contain;opacity:.35}
.slot-symbol-admin-title{display:flex;gap:9px;align-items:center}.slot-symbol-admin-title strong{font-size:12px;line-height:1.25}
@media(max-width:520px){.slot-symbol-admin-grid{grid-template-columns:1fr}}
@media(max-width:380px){.slot-frame-admin-card{grid-template-columns:1fr}.slot-frame-admin-preview{width:100%;height:124px}}
</style>
<script>
(function(){
  var allowed=['image/png','image/jpeg','image/webp'];
  function esc(v){return String(v||'').replace(/[&<>\"]/g,function(s){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[s]||s})}
  function previewSrc(url){return url ? url+(url.indexOf('?')>=0?'&':'?')+'t='+Date.now() : ''}
  function mount(){
    var target=document.getElementById('sectionImages');
    if(!target||document.getElementById('slotFramePanel'))return;
    var wrap=document.createElement('div');
    wrap.id='slotFramePanel';
    wrap.innerHTML='<h2>Slot game frame</h2><p class="muted small-text">Upload a transparent PNG/WebP or JPG frame overlay. It will load on the Slot game screen.</p><div class="slot-frame-admin-card"><img id="slotFramePreview" class="slot-frame-admin-preview" alt="Slot frame preview"/><div><strong>Frame image</strong><p class="muted small-text">Recommended: transparent PNG/WebP, roughly 780×900 or matching the Slot layout.</p><input id="slotFrameInput" type="file" accept="image/png,image/jpeg,image/webp,.png,.jpg,.jpeg,.webp"/><button class="primary" id="slotFrameUpload" type="button">Upload slot frame</button><p id="slotFrameStatus" class="slot-frame-admin-status"></p></div></div><h2 style="margin-top:18px">Slot symbols</h2><p class="muted small-text">Upload these 8 images to replace the default Slot stickers: Cherry, Lemon, Orange, Grape, Watermelon, Diamond, Gold Star/Bell, Lucky 7.</p><div id="slotSymbolsGrid" class="slot-symbol-admin-grid"></div>';
    target.appendChild(wrap);
    var btn=document.getElementById('slotFrameUpload');
    if(btn)btn.onclick=upload;
    var grid=document.getElementById('slotSymbolsGrid');
    if(grid)grid.addEventListener('click',function(ev){var b=ev.target&&ev.target.closest?ev.target.closest('[data-slot-symbol-upload]'):null;if(b)uploadSymbol(b.getAttribute('data-slot-symbol-upload'))});
    load();
  }
  async function load(){
    var img=document.getElementById('slotFramePreview');
    var status=document.getElementById('slotFrameStatus');
    try{
      var r=await fetch('/app/api/slot-frame',{credentials:'same-origin',cache:'no-store'});
      var j=await r.json();
      if(!r.ok)throw new Error(j.error||'Could not load slot frame');
      if(img){
        if(j.slotFrameUrl){img.src=previewSrc(esc(j.slotFrameUrl));img.style.opacity='1'}
        else{img.removeAttribute('src');img.style.opacity='.35'}
      }
      if(status)status.textContent=j.hasFrame?'Current frame loaded.':'No frame uploaded yet.';
      loadSymbols();
    }catch(e){if(status)status.textContent=e&&e.message?e.message:'Could not load slot frame';loadSymbols()}
  }
  function renderSymbols(symbols){
    var grid=document.getElementById('slotSymbolsGrid');
    if(!grid)return;
    grid.innerHTML=(symbols||[]).map(function(sym){return '<div class="slot-symbol-admin-card" data-slot-symbol-card="'+esc(sym.id)+'"><div class="slot-symbol-admin-title"><img id="slotSymbolPreview_'+esc(sym.id)+'" class="slot-symbol-admin-preview" alt="'+esc(sym.label)+' preview" src="'+(sym.imageUrl?previewSrc(esc(sym.imageUrl)):'')+'" style="opacity:'+(sym.imageUrl?'1':'.35')+'"/><strong>'+esc(sym.label)+'</strong></div><input id="slotSymbolInput_'+esc(sym.id)+'" type="file" accept="image/png,image/jpeg,image/webp,.png,.jpg,.jpeg,.webp"/><button class="primary" data-slot-symbol-upload="'+esc(sym.id)+'" type="button">Upload symbol</button><p id="slotSymbolStatus_'+esc(sym.id)+'" class="slot-symbol-admin-status">'+(sym.hasImage?'Loaded in Slot reels.':'No image uploaded yet.')+'</p></div>'}).join('');
  }
  async function loadSymbols(){
    var grid=document.getElementById('slotSymbolsGrid');
    if(!grid)return;
    try{
      var r=await fetch('/app/api/slot-symbols',{credentials:'same-origin',cache:'no-store'});
      var j=await r.json();
      if(!r.ok)throw new Error(j.error||'Could not load slot symbols');
      renderSymbols(j.symbols||[]);
    }catch(e){grid.innerHTML='<p class="muted small-text">'+esc(e&&e.message?e.message:'Could not load slot symbols')+'</p>'}
  }
  async function uploadSymbol(id){
    var input=document.getElementById('slotSymbolInput_'+id);
    var btn=document.querySelector('[data-slot-symbol-upload="'+id+'"]');
    var status=document.getElementById('slotSymbolStatus_'+id);
    var file=input&&input.files&&input.files[0];
    if(!file){if(status)status.textContent='Choose an image first.';return}
    if(allowed.indexOf(file.type)===-1){if(status)status.textContent='Only PNG, JPG, JPEG or WebP.';return}
    var form=new FormData();
    form.append('id',id);
    form.append('image',file);
    if(btn)btn.disabled=true;
    if(status)status.textContent='Uploading symbol...';
    try{
      var r=await fetch('/admin/api/upload-slot-symbol',{method:'POST',credentials:'same-origin',body:form});
      var j=await r.json();
      if(!r.ok)throw new Error(j.error||'Could not upload Slot symbol');
      var img=document.getElementById('slotSymbolPreview_'+id);
      if(img&&j.imageUrl){img.src=previewSrc(esc(j.imageUrl));img.style.opacity='1'}
      if(status)status.textContent='Symbol saved and ready in Slot reels.';
    }catch(e){if(status)status.textContent=e&&e.message?e.message:'Could not upload Slot symbol'}
    finally{if(btn)btn.disabled=false}
  }
  async function upload(){
    var input=document.getElementById('slotFrameInput');
    var btn=document.getElementById('slotFrameUpload');
    var status=document.getElementById('slotFrameStatus');
    var file=input&&input.files&&input.files[0];
    if(!file){if(status)status.textContent='Choose an image first.';return}
    if(allowed.indexOf(file.type)===-1){if(status)status.textContent='Only PNG, JPG, JPEG or WebP.';return}
    var form=new FormData();
    form.append('image',file);
    if(btn)btn.disabled=true;
    if(status)status.textContent='Uploading slot frame...';
    try{
      var r=await fetch('/admin/api/upload-slot-frame',{method:'POST',credentials:'same-origin',body:form});
      var j=await r.json();
      if(!r.ok)throw new Error(j.error||'Could not upload slot frame');
      var img=document.getElementById('slotFramePreview');
      if(img&&j.slotFrameUrl){img.src=previewSrc(esc(j.slotFrameUrl));img.style.opacity='1'}
      if(status)status.textContent='Slot frame saved and ready in the game.';
    }catch(e){if(status)status.textContent=e&&e.message?e.message:'Could not upload slot frame'}
    finally{if(btn)btn.disabled=false}
  }
  document.addEventListener('click',function(){setTimeout(mount,80)},true);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
})();
</script>
`;
