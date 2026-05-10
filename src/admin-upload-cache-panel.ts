export const ADMIN_UPLOAD_CACHE_SCRIPT = `
<script>
(function(){
  const allowed=['image/png','image/jpeg','image/webp'];
  function preload(url){if(!url)return;const img=new Image();img.decoding='async';img.src=url;}
  function ensurePlinkoBallPanel(){
    const section=document.getElementById('sectionImages');
    if(!section||document.getElementById('plinkoBallUploadBlock'))return;
    const block=document.createElement('div');
    block.id='plinkoBallUploadBlock';
    block.innerHTML='<div class="image-current"><img id="plinkoBallPreview" src="/app/api/uploaded-image/plinko-ball.png" alt=""/><div><strong>Plinko ball image</strong><p class="muted small-text">Shown only as the falling ball inside Plinko. This is separate from the TON balance icon.</p></div></div><label>Upload Plinko ball image</label><input id="plinkoBallFile" type="file" accept="image/png,image/jpeg,image/webp,.png,.jpg,.jpeg,.webp"/><button class="primary" id="uploadPlinkoBall" type="button">Upload Plinko ball</button><p id="plinkoBallUploadStatus" class="status"></p>';
    section.appendChild(block);
  }
  async function refreshPreview(){
    try{
      const r=await fetch('/app/api/uploaded-images',{cache:'no-store'});
      const data=await r.json();
      if(data.creditIconUrl){const preview=document.getElementById('preview');preload(data.creditIconUrl);if(preview)preview.src=data.creditIconUrl;}
      if(data.plinkoBallUrl){const previewBall=document.getElementById('plinkoBallPreview');preload(data.plinkoBallUrl);if(previewBall)previewBall.src=data.plinkoBallUrl;}
    }
    catch(e){}
  }
  function wireCreditIcon(){
    const upload=document.getElementById('upload');
    const file=document.getElementById('file');
    const status=document.getElementById('uploadStatus');
    if(!upload||!file||upload.dataset.cachedUpload==='1')return;
    upload.dataset.cachedUpload='1';
    upload.onclick=async()=>{
      if(!file.files||!file.files[0]){if(status)status.textContent='Choose an image first.';return}
      if(!allowed.includes(file.files[0].type)){if(status)status.textContent='Only PNG, JPG, JPEG or WebP files are allowed.';return}
      if(status)status.textContent='Uploading...';
      const form=new FormData();form.append('icon',file.files[0]);
      try{const r=await fetch('/admin/upload-credit-icon',{method:'POST',body:form,credentials:'same-origin'});const j=await r.json().catch(()=>({error:'Upload failed'}));if(!r.ok){if(status)status.textContent=j.error||'Upload failed';return}const url=j.creditIconUrl||('/app/api/credit-icon.png?t='+Date.now());preload(url);const preview=document.getElementById('preview');if(preview)preview.src=url;if(status)status.textContent='Image uploaded and cached.';refreshPreview();}
      catch(e){if(status)status.textContent='Upload request failed.';}
    };
  }
  function wirePlinkoBall(){
    const upload=document.getElementById('uploadPlinkoBall');
    const file=document.getElementById('plinkoBallFile');
    const status=document.getElementById('plinkoBallUploadStatus');
    if(!upload||!file||upload.dataset.cachedUpload==='1')return;
    upload.dataset.cachedUpload='1';
    upload.onclick=async()=>{
      if(!file.files||!file.files[0]){if(status)status.textContent='Choose an image first.';return}
      if(!allowed.includes(file.files[0].type)){if(status)status.textContent='Only PNG, JPG, JPEG or WebP files are allowed.';return}
      if(status)status.textContent='Uploading Plinko ball...';
      const form=new FormData();form.append('image',file.files[0]);
      try{
        const r=await fetch('/admin/api/upload-plinko-ball',{method:'POST',body:form,credentials:'same-origin'});
        const j=await r.json().catch(()=>({error:'Upload failed'}));
        if(!r.ok){if(status)status.textContent=j.error||'Upload failed';return}
        if(j.plinkoBallUrl){preload(j.plinkoBallUrl);const preview=document.getElementById('plinkoBallPreview');if(preview)preview.src=j.plinkoBallUrl;}
        if(status)status.textContent='Plinko ball uploaded.';
        refreshPreview();
      }catch(e){if(status)status.textContent='Upload request failed.';}
    };
  }
  function install(){
    ensurePlinkoBallPanel();
    wireCreditIcon();
    wirePlinkoBall();
    refreshPreview();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else install();
  document.addEventListener('click',()=>setTimeout(install,80),true);
})();
</script>
`;
