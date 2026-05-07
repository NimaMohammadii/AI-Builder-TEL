export const ADMIN_UPLOAD_CACHE_SCRIPT = `
<script>
(function(){
  const allowed=['image/png','image/jpeg','image/webp'];
  function preload(url){if(!url)return;const img=new Image();img.decoding='async';img.src=url;}
  async function refreshPreview(){
    try{const r=await fetch('/app/api/uploaded-images',{cache:'no-store'});const data=await r.json();if(data.creditIconUrl){const preview=document.getElementById('preview');preload(data.creditIconUrl);if(preview)preview.src=data.creditIconUrl;}}
    catch(e){}
  }
  function install(){
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
      try{const r=await fetch('/admin/api/upload-credit-icon',{method:'POST',body:form,credentials:'same-origin'});const j=await r.json().catch(()=>({error:'Upload failed'}));if(!r.ok){if(status)status.textContent=j.error||'Upload failed';return}if(j.creditIconUrl){preload(j.creditIconUrl);const preview=document.getElementById('preview');if(preview)preview.src=j.creditIconUrl;}if(status)status.textContent='Image uploaded and cached.';}
      catch(e){if(status)status.textContent='Upload request failed.';}
    };
    refreshPreview();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else install();
  document.addEventListener('click',()=>setTimeout(install,80),true);
})();
</script>
`;
