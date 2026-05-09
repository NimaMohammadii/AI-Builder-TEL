export const ADMIN_PLAY_ZONE_CARDS_PANEL_SCRIPT = `
<style>
.play-zone-card-admin{margin-top:24px;padding-top:16px;border-top:1px solid rgba(255,255,255,.09)}
.play-zone-card-admin h2{margin:0 0 4px;font-size:18px;letter-spacing:-.04em}.play-zone-card-admin p{margin:0 0 14px}.play-zone-card-list{display:grid;gap:14px}.play-zone-card-row{display:grid;grid-template-columns:78px 1fr;gap:12px;align-items:center;padding:12px 0;border-top:1px solid rgba(255,255,255,.08)}.play-zone-card-row:first-child{border-top:0}.play-zone-card-preview{width:78px;height:78px;border:1px solid rgba(255,255,255,.1);border-radius:20px;background:radial-gradient(circle at 30% 20%,rgba(255,255,255,.14),rgba(143,29,61,.18),rgba(0,0,0,.3));object-fit:cover;overflow:hidden}.play-zone-card-tools{display:grid;gap:7px;min-width:0}.play-zone-card-tools strong{font-size:14px}.play-zone-card-tools small{color:rgba(255,255,255,.46);font-size:10.5px}.play-zone-card-tools input{height:auto!important;border-radius:15px!important;padding:9px!important;font-size:11px!important}.play-zone-card-tools button{height:32px;border-radius:999px;border:1px solid rgba(255,255,255,.16);background:#070707;color:#fff;font-weight:900;font-size:11px}.play-zone-card-status{min-height:15px;color:rgba(255,255,255,.55);font-size:11px;margin-top:8px}
</style>
<script>
(function(){
  const games=[{id:'mines',label:'Mines'},{id:'plinko',label:'Plinko'}];
  const allowed=['image/png','image/jpeg','image/webp'];
  function esc(v){return String(v??'').replace(/[&<>]/g,s=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[s]||s))}
  function src(id){return '/app/api/section-lock-image/'+encodeURIComponent(id)+'/locked.png?v='+Date.now()}
  function mount(){
    const target=document.getElementById('sectionImages');
    if(!target||document.getElementById('playZoneCardsPanel'))return;
    const wrap=document.createElement('div');
    wrap.id='playZoneCardsPanel';
    wrap.className='play-zone-card-admin';
    wrap.innerHTML='<h2>Play Zone card images</h2><p class="muted small-text">Upload the image shown on each game card in Play Zone.</p><div class="play-zone-card-list">'+games.map(g=>'<article class="play-zone-card-row"><img class="play-zone-card-preview" id="playCardPreview-'+esc(g.id)+'" src="'+src(g.id)+'" alt="" onerror="this.style.opacity=.28"/><div class="play-zone-card-tools"><strong>'+esc(g.label)+'</strong><small>Card image for Play Zone</small><input data-play-card-file="'+esc(g.id)+'" type="file" accept="image/png,image/jpeg,image/webp,.png,.jpg,.jpeg,.webp"/><button type="button" data-play-card-upload="'+esc(g.id)+'">Upload '+esc(g.label)+' image</button></div></article>').join('')+'</div><p id="playZoneCardStatus" class="play-zone-card-status"></p>';
    target.appendChild(wrap);
    wrap.querySelectorAll('[data-play-card-upload]').forEach(btn=>btn.onclick=()=>upload(btn.getAttribute('data-play-card-upload')));
  }
  async function upload(id){
    const status=document.getElementById('playZoneCardStatus');
    const input=document.querySelector('[data-play-card-file="'+id+'"]');
    if(!input||!input.files||!input.files[0]){if(status)status.textContent='Choose an image first.';return;}
    if(!allowed.includes(input.files[0].type)){if(status)status.textContent='Only PNG, JPG, JPEG or WebP.';return;}
    const form=new FormData();form.append('sectionId',id);form.append('kind','locked');form.append('image',input.files[0]);
    if(status)status.textContent='Uploading...';
    try{const r=await fetch('/admin/api/section-lock-image',{method:'POST',credentials:'same-origin',body:form});const j=await r.json().catch(()=>({error:'Upload failed'}));if(!r.ok)throw new Error(j.error||'Upload failed');const img=document.getElementById('playCardPreview-'+id);if(img){img.style.opacity='1';img.src=src(id)}if(status)status.textContent='Card image uploaded.';}catch(e){if(status)status.textContent=e.message||'Upload failed.';}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
  document.addEventListener('click',()=>setTimeout(mount,80),true);
})();
</script>
`;
