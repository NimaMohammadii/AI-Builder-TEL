export const ADMIN_PLINKO_CONTROL_SCRIPT = `<script>
(function(){
  const selectedRow='13', selectedRisk='low';
  let config=null;
  function esc(v){return String(v??'').replace(/[&<>]/g,s=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[s]||s))}
  function addMenu(){
    const menu=document.getElementById('adminMenu');
    const main=document.querySelector('main.page');
    if(!menu||!main||document.getElementById('sectionPlinkoControl'))return;
    const btn=document.createElement('button');
    btn.className='menu-item';btn.type='button';btn.dataset.section='plinkoControl';
    btn.innerHTML='<strong>Plinko Control</strong><span>Upload Plinko images and tune chances</span>';
    menu.appendChild(btn);
    const section=document.createElement('section');
    section.className='section admin-section plinko-control-admin';
    section.id='sectionPlinkoControl';
    section.dataset.title='Plinko Control';
    section.dataset.subtitle='13 rows, Low mode only.';
    section.innerHTML='<div class="row-title"><div><h2>Plinko Control</h2><p class="muted small-text">Upload the images shown in and under the Plinko board.</p></div><button class="ghost" id="refreshPlinkoControl">Refresh</button></div><div class="plinko-image-upload-grid"><div class="plinko-upload-card"><label>Bet input image</label><img id="plinkoInputPreview" src="/app/api/plinko-control-image/input.png" alt="Bet input image preview"/><input id="plinkoInputImage" type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml"/><button class="ghost" type="button" data-plinko-upload="input">Upload input image</button><p class="muted small-text">One image for 1/2, amount input and 2x buttons.</p></div><div class="plinko-upload-card"><label>Drop Ball button image</label><img id="plinkoDropPreview" src="/app/api/plinko-control-image/drop.png" alt="Drop Ball image preview"/><input id="plinkoDropImage" type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml"/><button class="ghost" type="button" data-plinko-upload="drop">Upload drop image</button><p class="muted small-text">This image replaces the visible Drop Ball button.</p></div><div class="plinko-upload-card"><label>Result houses image</label><img id="plinkoHousePreview" src="/app/api/plinko-control-image/house.png" alt="Plinko result houses image preview"/><input id="plinkoHouseImage" type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml"/><button class="ghost" type="button" data-plinko-upload="house">Upload houses image</button><p class="muted small-text">One strip image for the 14 cells under the pegs.</p></div></div><div class="plinko-simple-card"><label>Board</label><div class="plinko-static-value">Rows 13 · Low mode</div><p class="muted small-text">Edit the 14 result houses below.</p></div><div class="preset-row"><button type="button" data-preset="balanced">Balanced</button><button type="button" data-preset="center">More center</button><button type="button" data-preset="edges">More edges</button><button type="button" data-preset="wide">Wider edges</button></div><div class="plinko-summary"><b id="plinkoTotalChance">0%</b><span id="plinkoExpectedReturn">Expected 0x</span></div><div id="plinkoHouseRows" class="plinko-house-rows"></div><div class="plinko-control-actions"><button class="primary" id="savePlinkoControl" type="button">Save chances</button><button class="ghost" id="normalizePlinkoControl" type="button">Normalize</button><button class="ghost" id="resetPlinkoControl" type="button">Reset</button></div><p class="status" id="plinkoControlStatus"></p>';
    main.appendChild(section);
    btn.onclick=()=>{document.querySelectorAll('.menu-item').forEach(x=>x.classList.toggle('active',x===btn));document.querySelectorAll('.admin-section').forEach(s=>s.classList.toggle('active',s.id==='sectionPlinkoControl'));document.getElementById('adminTitle').textContent='Plinko Control';document.getElementById('adminSubtitle').textContent='13 rows, Low mode only.';menu.hidden=true;window.scrollTo({top:0,behavior:'smooth'});loadPlinkoControl();};
    document.getElementById('refreshPlinkoControl').onclick=loadPlinkoControl;
    document.getElementById('savePlinkoControl').onclick=savePlinkoControl;
    document.getElementById('resetPlinkoControl').onclick=resetPlinkoControl;
    document.getElementById('normalizePlinkoControl').onclick=()=>{normalizeCurrent();renderHouses();};
    document.querySelectorAll('[data-preset]').forEach(b=>b.onclick=()=>{applyPreset(b.dataset.preset);renderHouses();});
    document.querySelectorAll('[data-plinko-upload]').forEach(b=>b.onclick=()=>uploadPlinkoImage(b.dataset.plinkoUpload));
    injectCss();
  }
  function injectCss(){
    if(document.getElementById('plinkoControlCss'))return;
    const style=document.createElement('style');style.id='plinkoControlCss';
    style.textContent='.plinko-image-upload-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:14px 0}.plinko-upload-card{display:grid;gap:9px;padding:11px;border:1px solid rgba(255,255,255,.10);border-radius:18px;background:rgba(255,255,255,.035)}.plinko-upload-card label{font-size:11px;font-weight:900}.plinko-upload-card img{width:100%;min-height:46px;max-height:88px;object-fit:contain;border-radius:14px;background:#050505;border:1px solid rgba(255,255,255,.08)}.plinko-upload-card input{font-size:11px}.plinko-upload-card button{height:34px;border-radius:999px;border:1px solid rgba(255,255,255,.14);background:#070707;color:#fff;font-weight:900;font-size:11px}.plinko-simple-card{display:grid;gap:8px;margin:14px 0;padding:12px 0;border-top:1px solid rgba(255,255,255,.08);border-bottom:1px solid rgba(255,255,255,.08)}.plinko-static-value{height:42px;border-radius:999px;border:1px solid rgba(255,255,255,.16);background:#050505;color:#fff;padding:0 13px;display:flex;align-items:center;font-weight:900}.preset-row{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin:12px 0}.preset-row button,.plinko-control-actions .ghost{height:34px;border-radius:999px;border:1px solid rgba(255,255,255,.14);background:#070707;color:#fff;font-weight:900;font-size:11px}.plinko-summary{display:flex;align-items:center;justify-content:space-between;border-top:1px solid rgba(255,255,255,.08);border-bottom:1px solid rgba(255,255,255,.08);padding:10px 0;margin:10px 0;color:rgba(255,255,255,.65);font-size:12px}.plinko-summary b{color:#fff}.plinko-house-rows{display:grid;gap:7px}.plinko-house-row{display:grid;grid-template-columns:44px 1fr 1fr;gap:7px;align-items:end;padding:8px 0;border-bottom:1px solid rgba(255,255,255,.065)}.plinko-house-row strong{font-size:12px}.plinko-house-row label{margin:0 0 5px;font-size:9px}.plinko-house-row input{height:34px;border-radius:12px;text-align:center;font-size:12px;padding:0 6px}.plinko-control-actions{display:grid;grid-template-columns:1fr 86px 72px;gap:8px;margin-top:14px}@media(max-width:640px){.plinko-image-upload-grid{grid-template-columns:1fr}}';
    document.head.appendChild(style);
  }
  function ensureShape(value){
    const fallback={enabled:true,mode:'weighted',houseEdge:8,volatility:50,rows:{'13':{low:{multipliers:[5,2.4,1.8,1.35,1.15,1,.85,.85,1,1.15,1.35,1.8,2.4,5],weights:[1,2,3.5,6,9,13,15.5,15.5,13,9,6,3.5,2,1]}}}};
    const source=value&&value.rows?value:fallback;
    const old=(source.rows&&((source.rows['13']&&source.rows['13'].low)||(source.rows['11']&&source.rows['11'].low)||(source.rows['9']&&source.rows['9'].low)||(source.rows['7']&&source.rows['7'].low)))||fallback.rows['13'].low;
    const item={multipliers:Array.isArray(old.multipliers)&&old.multipliers.length===14?old.multipliers.slice(0,14):fallback.rows['13'].low.multipliers.slice(),weights:Array.isArray(old.weights)&&old.weights.length===14?old.weights.slice(0,14):fallback.rows['13'].low.weights.slice()};
    item.multipliers=item.multipliers.map((m,i)=>Number(m)>0?Number(m):fallback.rows['13'].low.multipliers[i]);
    return {enabled:source.enabled!==false,mode:'weighted',houseEdge:Number(source.houseEdge)||8,volatility:Number(source.volatility)||50,rows:{'13':{low:item}},updatedAt:source.updatedAt};
  }
  async function loadPlinkoControl(){
    const status=document.getElementById('plinkoControlStatus'); if(status)status.textContent='Loading Plinko control...';
    try{const r=await fetch('/admin/api/plinko-control',{credentials:'same-origin'});const j=await r.json();if(!r.ok)throw new Error(j.error||'Could not load Plinko control');config=ensureShape(j);render();if(status)status.textContent='Updated '+new Date().toLocaleTimeString();}
    catch(e){if(status)status.textContent=e.message||'Could not load Plinko control'}
  }
  function current(){return config.rows[selectedRow][selectedRisk]}
  function render(){if(!config)return;renderHouses()}
  function renderHouses(){
    if(!config)return;
    const item=current();
    const total=item.weights.reduce((a,b)=>a+Number(b||0),0);
    const ev=expected(item);
    document.getElementById('plinkoTotalChance').textContent='Total '+round(total)+'%';
    document.getElementById('plinkoExpectedReturn').textContent='Expected '+ev.toFixed(2)+'x';
    document.getElementById('plinkoHouseRows').innerHTML=item.multipliers.map((m,i)=>'<div class="plinko-house-row"><strong>#'+(i+1)+'</strong><div><label>Multiplier</label><input data-mult="'+i+'" type="number" step="0.01" min="0.01" value="'+esc(m)+'"/></div><div><label>Chance %</label><input data-weight="'+i+'" type="number" step="0.1" min="0" max="100" value="'+esc(round(item.weights[i]))+'"/></div></div>').join('');
    document.querySelectorAll('[data-mult]').forEach(input=>input.oninput=()=>{item.multipliers[Number(input.dataset.mult)]=Number(input.value)>0?Number(input.value):0.01;updateSummary();});
    document.querySelectorAll('[data-weight]').forEach(input=>input.oninput=()=>{item.weights[Number(input.dataset.weight)]=Math.max(0,Math.min(100,Number(input.value||0)));input.value=String(item.weights[Number(input.dataset.weight)]);updateSummary();});
  }
  function updateSummary(){const item=current();const total=item.weights.reduce((a,b)=>a+Number(b||0),0);document.getElementById('plinkoTotalChance').textContent='Total '+round(total)+'%';document.getElementById('plinkoExpectedReturn').textContent='Expected '+expected(item).toFixed(2)+'x';}
  function round(n){return Math.round(Number(n||0)*10)/10}
  function expected(item){const sum=item.weights.reduce((a,b)=>a+Number(b||0),0)||1;return item.multipliers.reduce((a,m,i)=>a+Number(m||0)*Number(item.weights[i]||0),0)/sum}
  function normalizeCurrent(){const item=current();const sum=item.weights.reduce((a,b)=>a+Number(b||0),0)||1;item.weights=item.weights.map(w=>round(Number(w||0)*100/sum));}
  function applyPreset(kind){
    const item=current(); const n=item.weights.length; const center=(n-1)/2;
    item.weights=item.weights.map((_,i)=>{const d=Math.abs(i-center)/(center||1); if(kind==='center')return round((1-d)*24+2); if(kind==='edges')return round(d*22+2); if(kind==='wide')return d>.75?18:d>.45?7:2; return 100/n;});
    normalizeCurrent();
    if(kind==='wide')item.multipliers=item.multipliers.map((m,i)=>{const d=Math.abs(i-center)/(center||1);return d>.75?Math.max(Number(m||0),5):m});
  }

  async function uploadPlinkoImage(kind){
    const status=document.getElementById('plinkoControlStatus');
    const input=document.getElementById(kind==='input'?'plinkoInputImage':(kind==='house'?'plinkoHouseImage':'plinkoDropImage'));
    const file=input&&input.files&&input.files[0];
    if(!file){if(status)status.textContent='Choose an image first.';return;}
    const body=new FormData();body.append('kind',kind);body.append('image',file);
    if(status)status.textContent='Uploading '+kind+' image...';
    try{const r=await fetch('/admin/api/upload-plinko-control-image',{method:'POST',credentials:'same-origin',body});const j=await r.json();if(!r.ok)throw new Error(j.error||'Upload failed');const img=document.getElementById(kind==='input'?'plinkoInputPreview':(kind==='house'?'plinkoHousePreview':'plinkoDropPreview'));if(img)img.src=j.url;if(status)status.textContent='Image uploaded. Mini app shows it on next refresh.';}
    catch(e){if(status)status.textContent=e.message||'Could not upload image'}
  }
  function cleanConfig(){return ensureShape(config)}
  async function savePlinkoControl(){
    const status=document.getElementById('plinkoControlStatus'); const total=current().weights.reduce((a,b)=>a+Number(b||0),0); if(Math.abs(total-100)>.05){status.textContent='Total chance must be exactly 100% before saving.';return;} status.textContent='Saving...';
    try{const r=await fetch('/admin/api/plinko-control',{method:'POST',credentials:'same-origin',headers:{'content-type':'application/json'},body:JSON.stringify(cleanConfig())});const j=await r.json();if(!r.ok)throw new Error(j.error||'Could not save');config=ensureShape(j);render();status.textContent='Saved. Mini app syncs when opened.';}
    catch(e){status.textContent=e.message||'Could not save'}
  }
  async function resetPlinkoControl(){
    const status=document.getElementById('plinkoControlStatus'); status.textContent='Resetting...';
    try{const r=await fetch('/admin/api/plinko-control/reset',{method:'POST',credentials:'same-origin'});const j=await r.json();if(!r.ok)throw new Error(j.error||'Could not reset');config=ensureShape(j);render();status.textContent='Defaults restored.';}
    catch(e){status.textContent=e.message||'Could not reset'}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',addMenu);else addMenu();
})();
</script>`;