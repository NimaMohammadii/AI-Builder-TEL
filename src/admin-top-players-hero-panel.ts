export const ADMIN_TOP_PLAYERS_HERO_PANEL_SCRIPT = `<script>
(function(){
  var observer=null;
  function q(s){return document.querySelector(s)}
  function status(v){var el=q('[data-top-players-hero-status]');if(el)el.textContent=v}
  function ensureStyle(){
    if(document.getElementById('topPlayersHeroAdminStyle'))return;
    var style=document.createElement('style');
    style.id='topPlayersHeroAdminStyle';
    style.textContent='.top-players-upload-card{position:relative!important;overflow:hidden!important}.top-players-upload-card .tp-upload-body{display:grid!important;grid-template-columns:112px minmax(0,1fr)!important;gap:14px!important;align-items:center!important}.top-players-upload-card .tp-preview{width:96px!important;height:96px!important;border-radius:24px!important;display:grid!important;place-items:center!important;background:rgba(255,255,255,.06)!important;border:1px solid rgba(255,255,255,.10)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.12)!important;overflow:hidden!important}.top-players-upload-card .tp-preview img{width:100%!important;height:100%!important;object-fit:contain!important;padding:8px!important}.top-players-upload-card .tp-controls{display:grid!important;gap:10px!important;min-width:0!important}.top-players-upload-card input[type=file]{width:100%!important;min-height:44px!important;border-radius:16px!important;padding:10px!important;background:rgba(0,0,0,.18)!important;border:1px solid rgba(255,255,255,.10)!important;color:rgba(255,255,255,.76)!important}.top-players-upload-card .tp-note{margin:8px 0 0!important;color:rgba(255,255,255,.52)!important;font-size:12px!important;line-height:1.4!important}@media(max-width:680px){.top-players-upload-card .tp-upload-body{grid-template-columns:1fr!important}.top-players-upload-card .tp-preview{width:100%!important;height:128px!important}}';
    document.head.appendChild(style);
  }
  function targetContainer(section){
    var grid=section&&section.querySelector&&section.querySelector('.vl-grid');
    if(grid)return grid;
    var root=section&&section.querySelector&&section.querySelector('[data-vl-root]');
    if(root)return root;
    return section;
  }
  function mount(){
    ensureStyle();
    var section=document.getElementById('sectionLeague');
    if(!section)return;
    var target=targetContainer(section);
    if(!target)return;
    var existing=q('[data-top-players-hero-panel]');
    if(existing&&existing.parentNode===target)return;
    if(existing&&existing.parentNode)existing.parentNode.removeChild(existing);
    var block=document.createElement('div');
    block.className='vl-card full top-players-upload-card';
    block.setAttribute('data-top-players-hero-panel','1');
    block.innerHTML='<div class="vl-card-head"><div><h3>Top Players Hero Image</h3><p>Upload the floating image that appears on the right side of the Top 50 Players glass card.</p></div><span class="vl-pill">Image</span></div><div class="tp-upload-body"><div class="tp-preview"><img data-top-players-hero-preview alt="Top Players image preview" /></div><div class="tp-controls"><input data-top-players-hero-file type="file" accept="image/png,image/jpeg,image/webp,image/gif,.png,.jpg,.jpeg,.webp,.gif"/><button class="vl-btn primary" type="button" data-top-players-hero-upload>Upload Top Players Image</button><div class="vl-status" data-top-players-hero-status>Ready</div><p class="tp-note">After upload, refresh the Mini App or use Force update if users are still seeing an old cached image.</p></div></div>';
    if(target.firstChild)target.insertBefore(block,target.firstChild);else target.appendChild(block);
    var img=block.querySelector('[data-top-players-hero-preview]');
    if(img){
      img.src='/app/api/top-players-hero-image?v='+Date.now();
      img.addEventListener('error',function(){img.style.display='none';var box=block.querySelector('.tp-preview');if(box)box.innerHTML='<span style="color:rgba(255,255,255,.55);font-weight:900">No Image</span>'});
    }
    var btn=block.querySelector('[data-top-players-hero-upload]');
    if(btn)btn.onclick=upload;
  }
  async function upload(){
    var input=q('[data-top-players-hero-file]');
    var file=input&&input.files&&input.files[0];
    if(!file){status('Choose an image first');return}
    status('Uploading...');
    var form=new FormData();
    form.append('image',file);
    try{
      var r=await fetch('/admin/upload-top-players-hero-image',{method:'POST',body:form,credentials:'same-origin'});
      var j=await r.json().catch(function(){return null});
      if(!r.ok||!j||!j.ok)throw new Error((j&&j.error)||'Upload failed');
      var box=q('[data-top-players-hero-panel] .tp-preview');
      if(box)box.innerHTML='<img data-top-players-hero-preview alt="Top Players image preview" src="/app/api/top-players-hero-image?v='+Date.now()+'" />';
      status('Uploaded successfully');
    }catch(e){status(e.message||'Upload failed')}
  }
  function watch(){
    if(observer)observer.disconnect();
    observer=new MutationObserver(function(){setTimeout(mount,40)});
    observer.observe(document.body,{childList:true,subtree:true});
    mount();
  }
  function kick(){setTimeout(mount,80);setTimeout(mount,450);setTimeout(mount,1200);setTimeout(watch,1500)}
  document.addEventListener('click',function(ev){var b=ev.target&&ev.target.closest&&ev.target.closest('[data-section="league"],[data-vl-refresh]');if(b)kick()},true);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',kick);else kick();
})();
</script>`;