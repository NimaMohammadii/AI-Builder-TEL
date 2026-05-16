export const ADMIN_TOP_PLAYERS_HERO_PANEL_SCRIPT = `<script>
(function(){
  var observer=null;
  function q(s){return document.querySelector(s)}
  function status(v){var el=q('[data-top-players-hero-status]');if(el)el.textContent=v}
  function mount(){
    var section=document.getElementById('sectionLeague');
    if(!section||q('[data-top-players-hero-panel]'))return;
    var block=document.createElement('div');
    block.className='section-block';
    block.setAttribute('data-top-players-hero-panel','1');
    block.style.height='auto';
    block.style.display='grid';
    block.style.gap='10px';
    block.style.margin='10px 0 14px';
    block.style.padding='14px';
    block.style.border='1px solid rgba(255,255,255,.10)';
    block.style.borderRadius='22px';
    block.style.background='rgba(255,255,255,.035)';
    block.innerHTML='<h3>Top Players Hero Image</h3><p class="small-text">Upload the floating image for the Top 50 Players glass card.</p><div class="image-current"><img data-top-players-hero-preview alt="" /></div><input data-top-players-hero-file type="file" accept="image/png,image/jpeg,image/webp,image/gif,.png,.jpg,.jpeg,.webp,.gif"/><button class="save-credit" type="button" data-top-players-hero-upload>Upload Top Players Image</button><p class="mini-status" data-top-players-hero-status>Ready</p>';
    var img=block.querySelector('[data-top-players-hero-preview]');
    if(img){
      img.src='/app/api/top-players-hero-image?v='+Date.now();
      img.style.width='86px';img.style.height='86px';img.style.objectFit='contain';img.style.borderRadius='22px';img.style.background='rgba(255,255,255,.06)';img.style.border='1px solid rgba(255,255,255,.10)';img.style.padding='8px';
      img.addEventListener('error',function(){img.style.display='none'});
    }
    var file=block.querySelector('[data-top-players-hero-file]');
    if(file){file.style.height='auto';file.style.padding='10px';file.style.borderRadius='16px'}
    var title=section.querySelector('.row-title');
    if(title&&title.nextSibling)section.insertBefore(block,title.nextSibling);else section.insertBefore(block,section.firstChild);
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
      var img=q('[data-top-players-hero-preview]');
      if(img){img.style.display='block';img.src='/app/api/top-players-hero-image?v='+Date.now()}
      status('Uploaded. Force update users if needed.');
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