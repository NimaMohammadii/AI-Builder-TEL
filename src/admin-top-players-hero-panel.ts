export const ADMIN_TOP_PLAYERS_HERO_PANEL_SCRIPT = `<script>
(function(){
  function q(s){return document.querySelector(s)}
  function status(v){var el=q('[data-top-players-hero-status]');if(el)el.textContent=v}
  function mount(){
    var root=q('[data-vl-root]');
    if(!root||q('[data-top-players-hero-panel]'))return;
    var block=document.createElement('div');
    block.className='section-block';
    block.setAttribute('data-top-players-hero-panel','1');
    block.style.cssText='height:auto!important';
    block.innerHTML='<h3>Top Players Hero Image</h3><p class="small-text">Upload the floating image for the Top 50 Players glass card.</p><div class="image-current"><img data-top-players-hero-preview src="/app/api/top-players-hero-image?v='+Date.now()+'" alt="" style="width:86px;height:86px;object-fit:contain;border-radius:22px;background:rgba(255,255,255,.06);padding:8px" onerror="this.style.display=\'none\'"/></div><input data-top-players-hero-file type="file" accept="image/png,image/jpeg,image/webp,image/gif"/><button class="save-credit" type="button" data-top-players-hero-upload>Upload Top Players Image</button><p class="mini-status" data-top-players-hero-status>Ready</p>';
    root.insertBefore(block,root.firstChild);
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
  var tries=0;
  function wait(){tries++;mount();if(tries<40&&!q('[data-top-players-hero-panel]'))setTimeout(wait,250)}
  document.addEventListener('click',function(ev){var b=ev.target&&ev.target.closest&&ev.target.closest('[data-section="league"],[data-vl-refresh]');if(b)setTimeout(wait,400)},true);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',wait);else wait();
})();
</script>`;