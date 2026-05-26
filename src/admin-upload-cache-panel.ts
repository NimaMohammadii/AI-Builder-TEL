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
  function ensureRpsHandsPanel(){
    const section=document.getElementById('sectionImages');
    if(!section||document.getElementById('rpsHandsUploadBlock'))return;
    const block=document.createElement('div');
    block.id='rpsHandsUploadBlock';
    block.innerHTML='<div class="image-current"><img id="rpsRockPreview" src="/app/api/uploaded-image/rps-rock.png" alt=""/><div><strong>RPS rock image</strong><p class="muted small-text">Shown instead of the rock emoji in Rock Paper Scissors.</p></div></div><label>Upload rock image</label><input id="rpsRockFile" type="file" accept="image/png,image/jpeg,image/webp,.png,.jpg,.jpeg,.webp"/><button class="primary" id="uploadRpsRock" type="button">Upload rock</button><div class="image-current"><img id="rpsPaperPreview" src="/app/api/uploaded-image/rps-paper.png" alt=""/><div><strong>RPS paper image</strong><p class="muted small-text">Shown instead of the paper emoji in Rock Paper Scissors.</p></div></div><label>Upload paper image</label><input id="rpsPaperFile" type="file" accept="image/png,image/jpeg,image/webp,.png,.jpg,.jpeg,.webp"/><button class="primary" id="uploadRpsPaper" type="button">Upload paper</button><div class="image-current"><img id="rpsScissorsPreview" src="/app/api/uploaded-image/rps-scissors.png" alt=""/><div><strong>RPS scissors image</strong><p class="muted small-text">Shown instead of the scissors emoji in Rock Paper Scissors.</p></div></div><label>Upload scissors image</label><input id="rpsScissorsFile" type="file" accept="image/png,image/jpeg,image/webp,.png,.jpg,.jpeg,.webp"/><button class="primary" id="uploadRpsScissors" type="button">Upload scissors</button><p id="rpsHandsUploadStatus" class="status"></p>';
    section.appendChild(block);
  }
  async function refreshPreview(){
    try{
      const r=await fetch('/app/api/uploaded-images',{cache:'no-store'});
      const data=await r.json();
      if(data.creditIconUrl){const preview=document.getElementById('preview');preload(data.creditIconUrl);if(preview)preview.src=data.creditIconUrl;}
      if(data.plinkoBallUrl){const previewBall=document.getElementById('plinkoBallPreview');preload(data.plinkoBallUrl);if(previewBall)previewBall.src=data.plinkoBallUrl;}
      if(data.minesSafeUrl){const p=document.getElementById('minesSafePreview');preload(data.minesSafeUrl);if(p)p.src=data.minesSafeUrl;}
      if(data.minesBombUrl){const p=document.getElementById('minesBombPreview');preload(data.minesBombUrl);if(p)p.src=data.minesBombUrl;}
      if(data.rpsRockUrl){const p=document.getElementById('rpsRockPreview');preload(data.rpsRockUrl);if(p)p.src=data.rpsRockUrl;}
      if(data.rpsPaperUrl){const p=document.getElementById('rpsPaperPreview');preload(data.rpsPaperUrl);if(p)p.src=data.rpsPaperUrl;}
      if(data.rpsScissorsUrl){const p=document.getElementById('rpsScissorsPreview');preload(data.rpsScissorsUrl);if(p)p.src=data.rpsScissorsUrl;}
      try{window.dispatchEvent(new CustomEvent('vexa-mines-images-sync',{detail:{safeUrl:data.minesSafeUrl,bombUrl:data.minesBombUrl}}))}catch(e){}
      try{window.dispatchEvent(new CustomEvent('vexa-rps-images-sync',{detail:{rockUrl:data.rpsRockUrl,paperUrl:data.rpsPaperUrl,scissorsUrl:data.rpsScissorsUrl}}))}catch(e){}
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
      try{const r=await fetch('/admin/upload-credit-icon',{method:'POST',body:form,credentials:'same-origin'});const j=await r.json().catch(()=>({error:'Upload failed'}));if(!r.ok){if(status)status.textContent=j.error||'Upload failed';return}const url=j.creditIconUrl||('/app/api/credit-icon.png?t='+Date.now());preload(url);const preview=document.getElementById('preview');if(preview)preview.src=url;if(status)status.textContent='Image uploaded to R2.';refreshPreview();}
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
      try{const r=await fetch('/admin/api/upload-plinko-ball',{method:'POST',body:form,credentials:'same-origin'});const j=await r.json().catch(()=>({error:'Upload failed'}));if(!r.ok){if(status)status.textContent=j.error||'Upload failed';return}if(j.plinkoBallUrl){preload(j.plinkoBallUrl);const preview=document.getElementById('plinkoBallPreview');if(preview)preview.src=j.plinkoBallUrl;}if(status)status.textContent='Plinko ball uploaded to R2.';refreshPreview();}catch(e){if(status)status.textContent='Upload request failed.';}
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
      try{const r=await fetch('/admin/api/upload-mines-tile-image',{method:'POST',body:form,credentials:'same-origin'});const j=await r.json().catch(()=>({error:'Upload failed'}));if(!r.ok){if(status)status.textContent=j.error||'Upload failed';return}if(j.url){preload(j.url);const preview=document.getElementById(kind==='bomb'?'minesBombPreview':'minesSafePreview');if(preview)preview.src=j.url;}if(status)status.textContent='Mines image uploaded to R2.';refreshPreview();}catch(e){if(status)status.textContent='Upload request failed.';}
    };
  }
  function wireRpsHand(buttonId,fileId,kind){
    const upload=document.getElementById(buttonId),file=document.getElementById(fileId),status=document.getElementById('rpsHandsUploadStatus');
    if(!upload||!file||upload.dataset.cachedUpload==='1')return;
    upload.dataset.cachedUpload='1';
    upload.onclick=async()=>{
      if(!file.files||!file.files[0]){if(status)status.textContent='Choose an image first.';return}
      if(!allowed.includes(file.files[0].type)){if(status)status.textContent='Only PNG, JPG, JPEG or WebP files are allowed.';return}
      if(status)status.textContent='Uploading RPS image...';
      const form=new FormData();form.append('kind',kind);form.append('image',file.files[0]);
      try{const r=await fetch('/admin/api/upload-rps-hand-image',{method:'POST',body:form,credentials:'same-origin'});const j=await r.json().catch(()=>({error:'Upload failed'}));if(!r.ok){if(status)status.textContent=j.error||'Upload failed';return}if(j.url){preload(j.url);const preview=document.getElementById(kind==='rock'?'rpsRockPreview':kind==='paper'?'rpsPaperPreview':'rpsScissorsPreview');if(preview)preview.src=j.url;}if(status)status.textContent='RPS image uploaded to R2.';refreshPreview();}catch(e){if(status)status.textContent='Upload request failed.';}
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
    wireRpsHand('uploadRpsRock','rpsRockFile','rock');
    wireRpsHand('uploadRpsPaper','rpsPaperFile','paper');
    wireRpsHand('uploadRpsScissors','rpsScissorsFile','scissors');
    refreshPreview();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else install();
  document.addEventListener('click',()=>setTimeout(install,80),true);
})();
</script>
`;