export const ADMIN_GHOST_RUN_ASSETS_PANEL_SCRIPT = `<script>
(function(){
  var assets=[
    ['background','Moving background 1','Main uploaded Ghost Run background. It scrolls endlessly while the ghost is running.'],
    ['background2','Moving background 2','Optional extra parallax background layer that also scrolls forward.'],
    ['background3','Moving background 3','Optional front background layer for depth; upload transparent PNG/WebP for best results.'],
    ['ground','Game ground','Replaces the generated floor, rocks, grass and mushrooms.'],
    ['moon','Moon','Replaces the CSS moon.'],
    ['ghostIdle','Ghost idle character','Shown while the ghost is standing/idle.'],
    ['ghostMove','Ghost moving character','Shown while the ghost is running/moving.'],
    ['tree1','Tree type 1','First uploaded tree layer.'],
    ['tree2','Tree type 2','Second uploaded tree layer.'],
    ['tree3','Tree type 3','Third uploaded tree layer.'],
    ['house1','House type 1','First uploaded house layer.'],
    ['house2','House type 2','Second uploaded house layer.'],
    ['house3','House type 3','Third uploaded house layer.']
  ];
  function api(kind){return '/app/api/ghost-run-asset/'+kind+'.png?v='+Date.now()}
  function addMenu(){
    var menu=document.getElementById('adminMenu'),main=document.querySelector('main.page');
    if(!menu||!main||document.getElementById('sectionGhostRunAssets'))return;
    var btn=document.createElement('button');btn.className='menu-item';btn.type='button';btn.dataset.section='ghostRunAssets';btn.innerHTML='<strong>Ghost Run Assets</strong><span>Upload moving backgrounds, ground, moon, idle/moving ghost, trees and houses</span>';menu.appendChild(btn);
    var section=document.createElement('section');section.className='section admin-section ghost-run-assets-admin';section.id='sectionGhostRunAssets';section.dataset.title='Ghost Run Assets';section.dataset.subtitle='Upload images used inside the Ghost Run game.';
    section.innerHTML='<div class="row-title"><div><h2>Ghost Run Assets</h2><p class="muted small-text">Upload up to three moving backgrounds, ground, moon, idle ghost, moving ghost, three tree types and three house types. The idle and moving ghost images automatically switch during gameplay.</p></div></div><div class="ghost-assets-grid">'+assets.map(function(a){return '<div class="ghost-asset-card"><label>'+a[1]+'</label><img id="ghostAssetPreview_'+a[0]+'" src="'+api(a[0])+'" alt="'+a[1]+' preview"/><input id="ghostAssetInput_'+a[0]+'" type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml,.png,.jpg,.jpeg,.webp,.svg"/><button class="ghost" type="button" data-ghost-asset="'+a[0]+'">Upload '+a[1]+'</button><p class="muted small-text">'+a[2]+'</p></div>'}).join('')+'</div><p class="status" id="ghostRunAssetsStatus"></p>';
    main.appendChild(section);
    btn.onclick=function(){document.querySelectorAll('.menu-item').forEach(function(x){x.classList.toggle('active',x===btn)});document.querySelectorAll('.admin-section').forEach(function(s){s.classList.toggle('active',s.id==='sectionGhostRunAssets')});document.getElementById('adminTitle').textContent='Ghost Run Assets';document.getElementById('adminSubtitle').textContent='Upload images used inside the Ghost Run game.';menu.hidden=true;window.scrollTo({top:0,behavior:'smooth'});};
    section.querySelectorAll('[data-ghost-asset]').forEach(function(b){b.onclick=function(){upload(b.getAttribute('data-ghost-asset'))}});
    injectCss();
  }
  function injectCss(){if(document.getElementById('ghostRunAssetsCss'))return;var style=document.createElement('style');style.id='ghostRunAssetsCss';style.textContent='.ghost-assets-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-top:14px}.ghost-asset-card{display:grid;gap:8px;padding:11px;border:1px solid rgba(255,255,255,.10);border-radius:18px;background:rgba(255,255,255,.035)}.ghost-asset-card img{width:100%;height:92px;object-fit:contain;border-radius:14px;background:#050505;border:1px solid rgba(255,255,255,.08)}.ghost-asset-card input{font-size:11px}.ghost-asset-card button{height:34px;border-radius:999px;border:1px solid rgba(255,255,255,.14);background:#070707;color:#fff;font-weight:900;font-size:11px}@media(max-width:640px){.ghost-assets-grid{grid-template-columns:1fr}}';document.head.appendChild(style)}
  async function upload(kind){var status=document.getElementById('ghostRunAssetsStatus'),input=document.getElementById('ghostAssetInput_'+kind),file=input&&input.files&&input.files[0];if(!file){if(status)status.textContent='Choose an image first.';return}var body=new FormData();body.append('kind',kind);body.append('image',file);if(status)status.textContent='Uploading '+kind+'...';try{var r=await fetch('/admin/api/upload-ghost-run-asset',{method:'POST',credentials:'same-origin',body:body});var j=await r.json();if(!r.ok)throw new Error(j.error||'Upload failed');var img=document.getElementById('ghostAssetPreview_'+kind);if(img)img.src=j.url;if(status)status.textContent='Uploaded. Reopen/refresh the mini app to see it.'}catch(e){if(status)status.textContent=e&&e.message?e.message:'Upload failed'}}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',addMenu);else addMenu();
})();
</script>`;
