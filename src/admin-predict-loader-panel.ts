export const ADMIN_PREDICT_LOADER_PANEL_SCRIPT = `
<style>
.predict-loader-admin{margin-top:14px;padding:12px;border-radius:20px;background:rgba(255,255,255,.045);box-shadow:inset 0 1px 0 rgba(255,255,255,.08)}
.predict-loader-admin .image-current{padding:8px 0!important}
.predict-loader-admin img{width:58px;height:58px;border-radius:18px;background:#030303;object-fit:cover;border:1px solid rgba(255,255,255,.10)}
.predict-loader-admin input{height:auto!important;border-radius:14px!important;padding:8px!important;font-size:11px!important;background:#050505;color:#fff;border:1px solid rgba(255,255,255,.16)}
.predict-loader-admin button{height:34px;border-radius:999px;border:1px solid rgba(255,255,255,.16);background:#070707;color:#fff;font-weight:900;font-size:11px;margin-top:8px}
.predict-loader-admin-status{min-height:15px;color:rgba(255,255,255,.55);font-size:11px;margin-top:8px}
</style>
<script>
(function(){
  var allowed=['image/png','image/jpeg','image/webp'];
  function preload(url){if(!url)return;var img=new Image();img.decoding='async';img.src=url;}
  function ensurePanel(){
    var section=document.getElementById('sectionPredictAdmin');
    if(!section||document.getElementById('predictLoaderUploadBlock'))return;
    var host=section.querySelector('.predict-admin')||section;
    var block=document.createElement('div');
    block.id='predictLoaderUploadBlock';
    block.className='predict-loader-admin';
    block.innerHTML='<div class="image-current"><img id="predictLoaderPreview" alt=""/><div><strong>Predict entry loading image</strong><p class="muted small-text">Shown above the center loading line when users enter Predict.</p></div></div><label>Upload Predict loading image</label><input id="predictLoaderFile" type="file" accept="image/png,image/jpeg,image/webp,.png,.jpg,.jpeg,.webp"/><button class="primary" id="uploadPredictLoader" type="button">Upload loading image</button><p id="predictLoaderUploadStatus" class="predict-loader-admin-status"></p>';
    var list=document.getElementById('predictAdminList');
    if(list&&list.parentNode)list.parentNode.insertBefore(block,list);else host.appendChild(block);
    wire();
    refresh();
  }
  async function refresh(){
    var preview=document.getElementById('predictLoaderPreview');
    try{
      var r=await fetch('/admin/api/predict-loading-image',{credentials:'same-origin',cache:'no-store'});
      var j=await r.json();
      if(j.imageUrl&&preview){preload(j.imageUrl);preview.src=j.imageUrl;}
    }catch(e){}
  }
  function wire(){
    var upload=document.getElementById('uploadPredictLoader');
    var file=document.getElementById('predictLoaderFile');
    var status=document.getElementById('predictLoaderUploadStatus');
    if(!upload||!file||upload.dataset.bound==='1')return;
    upload.dataset.bound='1';
    upload.onclick=async function(){
      if(!file.files||!file.files[0]){if(status)status.textContent='Choose an image first.';return}
      if(allowed.indexOf(file.files[0].type)<0){if(status)status.textContent='Only PNG, JPG, JPEG or WebP files are allowed.';return}
      if(status)status.textContent='Uploading...';
      var form=new FormData();form.append('image',file.files[0]);
      try{
        var r=await fetch('/admin/api/predict-loading-image',{method:'POST',body:form,credentials:'same-origin'});
        var j=await r.json().catch(function(){return{error:'Upload failed'}});
        if(!r.ok){if(status)status.textContent=j.error||'Upload failed';return}
        if(j.imageUrl){preload(j.imageUrl);var preview=document.getElementById('predictLoaderPreview');if(preview)preview.src=j.imageUrl;}
        if(status)status.textContent='Predict loading image uploaded.';
      }catch(e){if(status)status.textContent='Upload request failed.';}
    };
  }
  function install(){ensurePanel();wire();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else install();
  document.addEventListener('click',function(){setTimeout(install,80)},true);
})();
</script>
`;