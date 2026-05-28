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
  function ensureMinesTilesPanel(){
    const section=document.getElementById('sectionImages');
    if(!section||document.getElementById('minesTilesUploadBlock'))return;
    const block=document.createElement('div');
    block.id='minesTilesUploadBlock';
    block.innerHTML='<div class="image-current"><img id="minesSafePreview" src="/app/api/uploaded-image/mines-safe.png" alt=""/><div><strong>Mines safe tile image</strong><p class="muted small-text">Shown when a safe tile is revealed.</p></div></div><label>Upload safe tile image</label><input id="minesSafeFile" type="file" accept="image/png,image/jpeg,image/webp,.png,.jpg,.jpeg,.webp"/><button class="primary" id="uploadMinesSafe" type="button">Upload safe tile</button><div class="image-current"><img id="minesBombPreview" src="/app/api/uploaded-image/mines-bomb.png" alt=""/><div><strong>Mines mine tile image</strong><p class="muted small-text">Shown when a mine tile is revealed.</p></div></div><label>Upload mine tile image</label><input id="minesBombFile" type="file" accept="image/png,image/jpeg,image/webp,.png,.jpg,.jpeg,.webp"/><button class="primary" id="uploadMinesBomb" type="button">Upload mine tile</button><p id="minesTilesUploadStatus" class="status"></p>';
    section.appendChild(block);
  }
  function rpsUploadHtml(side,label,kind,title){
    const idSide=side.charAt(0).toUpperCase()+side.slice(1),idKind=kind.charAt(0).toUpperCase()+kind.slice(1),id='rps'+idSide+idKind,uploadId='uploadRps'+idSide+idKind;
    return '<div class="image-current"><img id="'+id+'Preview" src="/app/api/uploaded-image/rps-'+side+'-'+kind+'.png?t='+Date.now()+'" alt=""/><div><strong>RPS '+label+' '+title+' image</strong><p class="muted small-text">Shown for '+label+' '+title+' in Rock Paper Scissors.</p></div></div><label>Upload '+label+' '+title+' image</label><input id="'+id+'File" type="file" accept="image/png,image/jpeg,image/webp,.png,.jpg,.jpeg,.webp"/><button class="primary" id="'+uploadId+'" type="button">Upload '+label+' '+title+'</button>';
  }
  function ensureRpsHandsPanel(){
    const section=document.getElementById('sectionImages');
    if(!section||document.getElementById('rpsHandsUploadBlock'))return;
    const block=document.createElement('div');
    block.id='rpsHandsUploadBlock';
    block.innerHTML='<h3>Rock Paper Scissors hand images</h3><p class="muted small-text">Upload separate right-hand images for You and left-hand images for Bot.</p>'+rpsUploadHtml('you','You','rock','rock')+rpsUploadHtml('you','You','paper','paper')+rpsUploadHtml('you','You','scissors','scissors')+rpsUploadHtml('bot','Bot','rock','rock')+rpsUploadHtml('bot','Bot','paper','paper')+rpsUploadHtml('bot','Bot','scissors','scissors')+'<p id="rpsHandsUploadStatus" class="status"></p>';
    section.appendChild(block);
  }
  async function refreshPreview(){
    try{
      const r=await fetch('/app/api/uploaded-images?t='+Date.now(),{cache:'no-store'});
      const data=await r.json();
      if(data.creditIconUrl){const preview=document.getElementById('preview');preload(data.creditIconUrl);if(preview)preview.src=data.creditIconUrl;}
      if(data.plinkoBallUrl){const previewBall=document.getElementById('plinkoBallPreview');preload(data.plinkoBallUrl);if(previewBall)previewBall.src=data.plinkoBallUrl;}
      if(data.minesSafeUrl){const p=document.getElementById('minesSafePreview');preload(data.minesSafeUrl);if(p)p.src=data.minesSafeUrl;}
      if(data.minesBombUrl){const p=document.getElementById('minesBombPreview');preload(data.minesBombUrl);if(p)p.src=data.minesBombUrl;}
      const map={YouRock:data.rpsYouRockUrl,YouPaper:data.rpsYouPaperUrl,YouScissors:data.rpsYouScissorsUrl,BotRock:data.rpsBotRockUrl,BotPaper:data.rpsBotPaperUrl,BotScissors:data.rpsBotScissorsUrl};
      Object.keys(map).forEach((name)=>{const url=map[name];if(url){const p=document.getElementById('rps'+name+'Preview');preload(url);if(p)p.src=url+(url.indexOf('?')>=0?'&':'?')+'preview='+Date.now();}});
      try{window.dispatchEvent(new CustomEvent('vexa-mines-images-sync',{detail:{safeUrl:data.minesSafeUrl,bombUrl:data.minesBombUrl}}))}catch(e){}
      try{window.dispatchEvent(new CustomEvent('vexa-rps-images-sync',{detail:{you:{rock:data.rpsYouRockUrl,paper:data.rpsYouPaperUrl,scissors:data.rpsYouScissorsUrl},bot:{rock:data.rpsBotRockUrl,paper:data.rpsBotPaperUrl,scissors:data.rpsBotScissorsUrl}}}))}catch(e){}
    }
    catch(e){}
  }
  function parseUploadError(response,data){
    if(data&&data.error)return data.error;
    if(response&&response.status===401)return 'Unauthorized. Login again.';
    if(response&&response.status)return 'Upload failed with status '+response.status+'.';
    return 'Upload failed.';
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
      try{const r=await fetch('/admin/upload-credit-icon',{method:'POST',body:form,credentials:'same-origin'});const j=await r.json().catch(()=>({error:'Upload failed'}));if(!r.ok){if(status)status.textContent=j.error||'Upload failed';return}const url=j.creditIconUrl||('/app/api/credit-icon.png?t='+Date.now());preload(url);const preview=document.getElementById('preview');if(preview)preview.src=url;if(status)status.textContent='Image uploaded to R2.';refreshPreview();}
      catch(e){if(status)status.textContent=e&&e.message?e.message:'Upload request failed.';}
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
      try{const r=await fetch('/admin/api/upload-plinko-ball',{method:'POST',body:form,credentials:'same-origin'});const j=await r.json().catch(()=>({error:'Upload failed'}));if(!r.ok){if(status)status.textContent=j.error||'Upload failed';return}if(j.plinkoBallUrl){preload(j.plinkoBallUrl);const preview=document.getElementById('plinkoBallPreview');if(preview)preview.src=j.plinkoBallUrl;}if(status)status.textContent='Plinko ball uploaded to R2.';refreshPreview();}catch(e){if(status)status.textContent=e&&e.message?e.message:'Upload request failed.';}
    };
  }
  function wireMinesTile(buttonId,fileId,kind){
    const upload=document.getElementById(buttonId),file=document.getElementById(fileId),status=document.getElementById('minesTilesUploadStatus');
    if(!upload||!file||upload.dataset.cachedUpload==='1')return;
    upload.dataset.cachedUpload='1';
    upload.onclick=async()=>{
      if(!file.files||!file.files[0]){if(status)status.textContent='Choose an image first.';return}
      if(!allowed.includes(file.files[0].type)){if(status)status.textContent='Only PNG, JPG, JPEG or WebP files are allowed.';return}
      if(status)status.textContent='Uploading Mines image...';
      const form=new FormData();form.append('kind',kind);form.append('image',file.files[0]);
      try{const r=await fetch('/admin/api/upload-mines-tile-image',{method:'POST',body:form,credentials:'same-origin'});const j=await r.json().catch(()=>({error:'Upload failed'}));if(!r.ok){if(status)status.textContent=j.error||'Upload failed';return}if(j.url){preload(j.url);const preview=document.getElementById(kind==='bomb'?'minesBombPreview':'minesSafePreview');if(preview)preview.src=j.url;}if(status)status.textContent='Mines image uploaded to R2.';refreshPreview();}catch(e){if(status)status.textContent=e&&e.message?e.message:'Upload request failed.';}
    };
  }
  function wireRpsHand(buttonId,fileId,side,kind){
    const upload=document.getElementById(buttonId),file=document.getElementById(fileId),status=document.getElementById('rpsHandsUploadStatus');
    if(!upload||!file||upload.dataset.cachedUpload==='1')return;
    upload.dataset.cachedUpload='1';
    upload.onclick=async()=>{
      if(!file.files||!file.files[0]){if(status)status.textContent='Choose an image first.';return}
      if(!allowed.includes(file.files[0].type)){if(status)status.textContent='Only PNG, JPG, JPEG or WebP files are allowed.';return}
      if(status)status.textContent='Uploading RPS '+side+' '+kind+' image...';
      const form=new FormData();form.append('side',side);form.append('kind',kind);form.append('image',file.files[0]);
      try{
        const r=await fetch('/admin/api/upload-rps-hand-image',{method:'POST',body:form,credentials:'same-origin'});
        const j=await r.json().catch(()=>({error:'Invalid upload response'}));
        if(!r.ok){if(status)status.textContent=parseUploadError(r,j);return}
        const url=j.url||('/app/api/uploaded-image/rps-'+side+'-'+kind+'.png?v='+Date.now());
        preload(url);
        const id='rps'+side.charAt(0).toUpperCase()+side.slice(1)+kind.charAt(0).toUpperCase()+kind.slice(1)+'Preview';
        const preview=document.getElementById(id);
        if(preview)preview.src=url+(url.indexOf('?')>=0?'&':'?')+'preview='+Date.now();
        if(status)status.textContent='RPS '+side+' '+kind+' image uploaded.';
        await refreshPreview();
      }catch(e){
        if(status)status.textContent=e&&e.message?e.message:'Upload request failed.';
      }
    };
  }
  function install(){
    ensurePlinkoBallPanel();
    ensureMinesTilesPanel();
    ensureRpsHandsPanel();
    wireCreditIcon();
    wirePlinkoBall();
    wireMinesTile('uploadMinesSafe','minesSafeFile','safe');
    wireMinesTile('uploadMinesBomb','minesBombFile','bomb');
    ['you','bot'].forEach((side)=>['rock','paper','scissors'].forEach((kind)=>{const id='Rps'+side.charAt(0).toUpperCase()+side.slice(1)+kind.charAt(0).toUpperCase()+kind.slice(1);wireRpsHand('upload'+id,id.charAt(0).toLowerCase()+id.slice(1)+'File',side,kind);}));
    refreshPreview();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else install();
  document.addEventListener('click',()=>setTimeout(install,80),true);
})();
</script>
`;