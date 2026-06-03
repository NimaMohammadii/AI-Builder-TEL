export const ADMIN_SLOT_FRAME_PANEL_SCRIPT = `
<style>
#slotFramePanel{margin-top:24px;padding-top:18px;border-top:1px solid rgba(255,255,255,.10)}
.slot-frame-admin-card{display:grid;grid-template-columns:96px 1fr;gap:12px;align-items:center;margin-top:12px;padding:12px;border:1px solid rgba(255,255,255,.10);border-radius:20px;background:rgba(255,255,255,.035)}
.slot-frame-admin-preview{width:96px;height:96px;border:1px solid rgba(255,255,255,.12);border-radius:18px;background:rgba(0,0,0,.42);object-fit:contain;box-shadow:inset 0 1px 0 rgba(255,255,255,.08)}
.slot-frame-admin-card input{height:auto;margin-top:9px;border-radius:15px;padding:9px;font-size:11px}
.slot-frame-admin-card button{margin-top:9px!important;height:34px!important;border-radius:999px!important;font-size:12px!important}
.slot-frame-admin-status{min-height:16px;margin:9px 0 0;color:rgba(255,255,255,.58);font-size:11px}
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
    wrap.innerHTML='<h2>Slot game frame</h2><p class="muted small-text">Upload a transparent PNG/WebP or JPG frame overlay. It will load on the Slot game screen.</p><div class="slot-frame-admin-card"><img id="slotFramePreview" class="slot-frame-admin-preview" alt="Slot frame preview"/><div><strong>Frame image</strong><p class="muted small-text">Recommended: transparent PNG/WebP, roughly 780×900 or matching the Slot layout.</p><input id="slotFrameInput" type="file" accept="image/png,image/jpeg,image/webp,.png,.jpg,.jpeg,.webp"/><button class="primary" id="slotFrameUpload" type="button">Upload slot frame</button><p id="slotFrameStatus" class="slot-frame-admin-status"></p></div></div>';
    target.appendChild(wrap);
    var btn=document.getElementById('slotFrameUpload');
    if(btn)btn.onclick=upload;
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
    }catch(e){if(status)status.textContent=e&&e.message?e.message:'Could not load slot frame'}
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
