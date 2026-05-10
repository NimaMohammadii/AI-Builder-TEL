export const ADMIN_IMAGE_PANEL_SCRIPT = `
<style>
#sectionLocks .lock-preview,#sectionLocks .lock-image-upload{display:none!important}.admin-lock-image-list{display:grid;gap:14px;margin-top:18px}.admin-lock-image-row{display:grid;gap:9px;padding:14px 0;border-top:1px solid rgba(255,255,255,.09)}.admin-lock-image-row:first-child{border-top:0}.admin-lock-image-head{display:flex;justify-content:space-between;align-items:center;gap:10px}.admin-lock-image-head strong{font-size:14px}.admin-lock-image-head span{font-size:10px;color:rgba(255,255,255,.48);text-transform:uppercase;letter-spacing:.08em}.admin-lock-image-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}.admin-lock-image-box{display:grid;gap:7px}.admin-lock-image-box img{width:100%;height:72px;object-fit:contain;border:1px solid rgba(255,255,255,.09);border-radius:16px;background:#050505}.admin-lock-image-box small{color:rgba(255,255,255,.52);font-size:11px}.admin-lock-image-box input{height:auto;border-radius:15px;padding:9px;font-size:11px}.admin-lock-image-box button{height:32px;border-radius:999px;border:1px solid rgba(255,255,255,.16);background:#070707;color:#fff;font-weight:900;font-size:11px}.admin-lock-image-status{min-height:15px;color:rgba(255,255,255,.55);font-size:11px;margin-top:7px}@media(max-width:380px){.admin-lock-image-grid{grid-template-columns:1fr}}
</style>
<script>
(function(){
  const labels={home:'Home',connect:'Connect',playzone:'Play Zone',flow:'TTS',mines:'Mines',plinko:'Plinko',crash:'Crash',wheel:'Wheel',dice:'Dice',limbo:'Limbo',tower:'Tower',coinflip:'Coin Flip',hilo:'Hi-Lo'};
  const allowed=['image/png','image/jpeg','image/webp'];
  let sections=[];
  function esc(v){return String(v??'').replace(/[&<>]/g,s=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[s]||s))}
  function mount(){
    const target=document.getElementById('sectionImages');
    if(!target||document.getElementById('sectionLockImagesPanel'))return;
    const wrap=document.createElement('div');
    wrap.id='sectionLockImagesPanel';
    wrap.innerHTML='<h2 style="margin-top:24px">Section lock images</h2><p class="muted small-text">Upload separate images for normal locked sections and access-code sections.</p><div id="adminLockImageList" class="admin-lock-image-list"><div class="empty">Loading...</div></div><p id="adminLockImageStatus" class="admin-lock-image-status"></p>';
    target.appendChild(wrap);
    load();
  }
  function imgTag(url){return url?'<img src="'+esc(url)+(url.indexOf('?')>=0?'&':'?')+'t='+Date.now()+'" alt=""/>':'<img alt=""/>'}
  function render(){
    const list=document.getElementById('adminLockImageList');
    if(!list)return;
    if(!sections.length){list.innerHTML='<div class="empty">No sections found.</div>';return;}
    list.innerHTML=sections.map(s=>'<article class="admin-lock-image-row"><div class="admin-lock-image-head"><strong>'+esc(s.label||labels[s.id]||s.id)+'</strong><span>'+esc(s.id)+'</span></div><div class="admin-lock-image-grid"><div class="admin-lock-image-box"><small>Normal lock image</small>'+imgTag(s.lockedImageUrl)+'<input data-lock-img-file="'+esc(s.id)+'" data-kind="locked" type="file" accept="image/png,image/jpeg,image/webp,.png,.jpg,.jpeg,.webp"/><button data-lock-img-upload="'+esc(s.id)+'" data-kind="locked">Upload normal</button></div><div class="admin-lock-image-box"><small>Code entry image</small>'+imgTag(s.codeImageUrl)+'<input data-lock-img-file="'+esc(s.id)+'" data-kind="code" type="file" accept="image/png,image/jpeg,image/webp,.png,.jpg,.jpeg,.webp"/><button data-lock-img-upload="'+esc(s.id)+'" data-kind="code">Upload code</button></div></div></article>').join('');
    document.querySelectorAll('[data-lock-img-upload]').forEach(btn=>btn.onclick=()=>upload(btn.getAttribute('data-lock-img-upload'),btn.getAttribute('data-kind')));
  }
  async function load(){
    const status=document.getElementById('adminLockImageStatus');
    if(status)status.textContent='Loading images...';
    try{const r=await fetch('/admin/api/section-locks',{credentials:'same-origin',cache:'no-store'});const j=await r.json();if(!r.ok)throw new Error(j.error||'Could not load images');sections=j.sections||[];render();if(status)status.textContent='';}catch(e){if(status)status.textContent=e.message||'Could not load images';}
  }
  async function upload(sectionId,kind){
    const status=document.getElementById('adminLockImageStatus');
    const input=document.querySelector('[data-lock-img-file="'+sectionId+'"][data-kind="'+kind+'"]');
    if(!input||!input.files||!input.files[0]){if(status)status.textContent='Choose an image first.';return;}
    if(!allowed.includes(input.files[0].type)){if(status)status.textContent='Only PNG, JPG, JPEG or WebP.';return;}
    const form=new FormData();form.append('sectionId',sectionId);form.append('kind',kind);form.append('image',input.files[0]);
    if(status)status.textContent='Uploading...';
    try{const r=await fetch('/admin/api/section-lock-image-v2',{method:'POST',credentials:'same-origin',body:form});const j=await r.json();if(!r.ok)throw new Error(j.error||'Could not upload image');sections=j.sections||[];render();if(status)status.textContent='Image saved.';}catch(e){if(status)status.textContent=e.message||'Could not upload image';}
  }
  document.addEventListener('click',()=>setTimeout(mount,80),true);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
})();
</script>
`;
