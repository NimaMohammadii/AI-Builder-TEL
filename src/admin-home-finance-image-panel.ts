export const ADMIN_HOME_FINANCE_IMAGE_PANEL_SCRIPT = `<script>
(function(){
  const allowed=['image/png','image/jpeg','image/webp'];
  function byId(id){return document.getElementById(id)}
  function ensurePanel(){
    const section=document.getElementById('sectionImages');
    if(!section||document.getElementById('homeFinanceImageUpload'))return;
    const wrap=document.createElement('div');
    wrap.className='image-current';
    wrap.innerHTML='<img id="homeFinanceImagePreview" src="/app/api/home-finance-image.png?t='+Date.now()+'" alt=""/><div><strong>Home finance image</strong><p class="muted small-text">Shown on the right side of Deposit / Withdraw cards.</p></div>';
    const label=document.createElement('label');
    label.textContent='Upload Home finance image';
    const input=document.createElement('input');
    input.id='homeFinanceImageFile';
    input.type='file';
    input.accept='image/png,image/jpeg,image/webp,.png,.jpg,.jpeg,.webp';
    const button=document.createElement('button');
    button.className='primary';
    button.id='homeFinanceImageUpload';
    button.type='button';
    button.textContent='Upload Home image';
    const status=document.createElement('p');
    status.id='homeFinanceImageStatus';
    status.className='status';
    section.appendChild(wrap);
    section.appendChild(label);
    section.appendChild(input);
    section.appendChild(button);
    section.appendChild(status);
    button.onclick=upload;
  }
  async function upload(){
    const file=byId('homeFinanceImageFile');
    const status=byId('homeFinanceImageStatus');
    const preview=byId('homeFinanceImagePreview');
    if(!file||!file.files||!file.files[0]){status.textContent='Choose an image first.';return}
    if(!allowed.includes(file.files[0].type)){status.textContent='Only PNG, JPG, JPEG or WebP.';return}
    status.textContent='Uploading Home image...';
    const form=new FormData();
    form.append('image',file.files[0]);
    try{
      const response=await fetch('/admin/api/upload-home-finance-image',{method:'POST',body:form,credentials:'same-origin'});
      const json=await response.json().catch(()=>({error:'Upload failed'}));
      if(!response.ok){status.textContent=json.error||'Upload failed';return}
      if(preview)preview.src=(json.url||'/app/api/home-finance-image.png')+'&t='+Date.now();
      status.textContent='Home image uploaded.';
    }catch(error){status.textContent='Upload failed.'}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ensurePanel);else ensurePanel();
})();
</script>`;
