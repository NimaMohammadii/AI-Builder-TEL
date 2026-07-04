export const ADMIN_HOME_LOTTERY_SLOT_PANEL_SCRIPT = `<script>
(function(){
  function q(id){return document.getElementById(id)}
  function esc(value){return String(value||'').replace(/[&<>"']/g,function(ch){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]})}
  function previewSrc(src){return src+(src.indexOf('?')>=0?'&':'?')+'t='+Date.now()}
  function boot(){
    var root=q('sectionImages')||document.body;
    if(!root||q('homeLotterySlotPanel'))return;
    var box=document.createElement('section');
    box.id='homeLotterySlotPanel';
    box.className='card';
    box.innerHTML='<div class="pad"><h2>اسلات لاتاری</h2><p class="muted small-text">Upload one image for the transparent glass lottery slot card on Home.</p><div class="image-current"><img id="homeLotterySlotPreview" src="/app/api/home-lottery-slot.png?t='+Date.now()+'" alt="Lottery slot preview"><div><strong>Home lottery slot image</strong><p class="muted small-text">This image loads inside the transparent Home glass card.</p></div></div><input id="homeLotterySlotFile" type="file" accept="image/png,image/jpeg,image/webp,.png,.jpg,.jpeg,.webp"><button id="homeLotterySlotSave" class="primary" type="button">Upload lottery slot</button><p id="homeLotterySlotStatus" class="status"></p></div>';
    root.appendChild(box);
    var btn=q('homeLotterySlotSave');
    if(btn)btn.onclick=upload;
    load();
  }
  async function load(){
    var img=q('homeLotterySlotPreview'),status=q('homeLotterySlotStatus');
    try{
      var r=await fetch('/app/api/home-lottery-slot-meta',{credentials:'same-origin',cache:'no-store'});
      var j=await r.json();
      if(!r.ok)throw new Error(j.error||'Could not load lottery slot image');
      if(img&&j.url)img.src=previewSrc(esc(j.url));
      if(status)status.textContent=j.hasImage?'Current image loaded.':'No image uploaded yet.';
    }catch(e){if(status)status.textContent=e&&e.message?e.message:'Could not load lottery slot image'}
  }
  async function upload(){
    var input=q('homeLotterySlotFile'),status=q('homeLotterySlotStatus'),btn=q('homeLotterySlotSave');
    if(!input||!input.files||!input.files[0]){if(status)status.textContent='Choose an image first.';return}
    var form=new FormData();form.append('image',input.files[0]);
    if(status)status.textContent='Uploading lottery slot image...';if(btn)btn.disabled=true;
    try{
      var r=await fetch('/admin/api/upload-home-lottery-slot',{method:'POST',credentials:'same-origin',body:form});
      var j=await r.json().catch(function(){return {}});
      if(!r.ok)throw new Error(j.error||'Upload failed');
      var img=q('homeLotterySlotPreview');if(img&&j.url)img.src=previewSrc(esc(j.url));
      if(status)status.textContent='Uploaded. The Home lottery slot card will use this image.';
    }catch(e){if(status)status.textContent=e&&e.message?e.message:'Upload failed'}finally{if(btn)btn.disabled=false}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
</script>`;
