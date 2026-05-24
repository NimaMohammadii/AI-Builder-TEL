export const ADMIN_PLINKO_CONTROL_SCRIPT = `<script>
(function(){
  const riskLabels=['low','medium','high'];
  const visibleRiskLabels=['low','high'];
  const rowLabels=['7','9','11'];
  const visibleRowLabels=['9','11'];
  let config=null, selectedRow='9', selectedRisk='low';
  function esc(v){return String(v??'').replace(/[&<>]/g,s=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[s]||s))}
  function addMenu(){
    const menu=document.getElementById('adminMenu');
    const main=document.querySelector('main.page');
    if(!menu||!main||document.getElementById('sectionPlinkoControl'))return;
    const btn=document.createElement('button');
    btn.className='menu-item';btn.type='button';btn.dataset.section='plinkoControl';
    btn.innerHTML='<strong>Plinko Control</strong><span>Change drop chances and multipliers</span>';
    menu.appendChild(btn);
    const section=document.createElement('section');
    section.className='section admin-section plinko-control-admin';
    section.id='sectionPlinkoControl';
    section.dataset.title='Plinko Control';
    section.dataset.subtitle='Drop chances and multipliers.';
    section.innerHTML='<div class="row-title"><div><h2>Plinko Control</h2><p class="muted small-text">Mini app currently uses 9/11 rows and Low/High modes.</p></div><button class="ghost" id="refreshPlinkoControl">Refresh</button></div><div class="plinko-simple-card"><label>Game mode</label><select id="plinkoMode"><option value="fair">Fair physics</option><option value="weighted">Use my chances</option><option value="house">House control</option></select><p class="muted small-text">Use my chances / House control makes the ball land based on the chances below.</p></div><div class="plinko-picker"><div><label>Rows</label><select id="plinkoRowsPick"><option value="9">9 rows</option><option value="11">11 rows</option></select></div><div><label>Mode</label><select id="plinkoRiskPick"><option value="low">Low</option><option value="high">High</option></select></div></div><div class="preset-row"><button type="button" data-preset="balanced">Balanced</button><button type="button" data-preset="center">More center</button><button type="button" data-preset="edges">More edges</button><button type="button" data-preset="high">High mode</button></div><div class="plinko-summary"><b id="plinkoTotalChance">0%</b><span id="plinkoExpectedReturn">Expected 0x</span></div><div id="plinkoHouseRows" class="plinko-house-rows"></div><div class="plinko-control-actions"><button class="primary" id="savePlinkoControl" type="button">Save chances</button><button class="ghost" id="normalizePlinkoControl" type="button">Normalize</button><button class="ghost" id="resetPlinkoControl" type="button">Reset</button></div><p class="status" id="plinkoControlStatus"></p>';
    main.appendChild(section);
    btn.onclick=()=>{document.querySelectorAll('.menu-item').forEach(x=>x.classList.toggle('active',x===btn));document.querySelectorAll('.admin-section').forEach(s=>s.classList.toggle('active',s.id==='sectionPlinkoControl'));document.getElementById('adminTitle').textContent='Plinko Control';document.getElementById('adminSubtitle').textContent='Drop chances and multipliers.';menu.hidden=true;window.scrollTo({top:0,behavior:'smooth'});loadPlinkoControl();};
    document.getElementById('refreshPlinkoControl').onclick=loadPlinkoControl;
    document.getElementById('savePlinkoControl').onclick=savePlinkoControl;
    document.getElementById('resetPlinkoControl').onclick=resetPlinkoControl;
    document.getElementById('normalizePlinkoControl').onclick=()=>{normalizeCurrent();renderHouses();};
    document.getElementById('plinkoRowsPick').onchange=e=>{selectedRow=visibleRowLabels.includes(e.target.value)?e.target.value:'9';renderHouses();};
    document.getElementById('plinkoRiskPick').onchange=e=>{selectedRisk=visibleRiskLabels.includes(e.target.value)?e.target.value:'low';renderHouses();};
    document.getElementById('plinkoMode').onchange=e=>{if(config)config.mode=e.target.value;};
    document.querySelectorAll('[data-preset]').forEach(b=>b.onclick=()=>{applyPreset(b.dataset.preset);renderHouses();});
    injectCss();
  }
  function injectCss(){
    if(document.getElementById('plinkoControlCss'))return;
    const style=document.createElement('style');style.id='plinkoControlCss';
    style.textContent='.plinko-simple-card{display:grid;gap:8px;margin:14px 0;padding:12px 0;border-top:1px solid rgba(255,255,255,.08);border-bottom:1px solid rgba(255,255,255,.08)}.plinko-simple-card select,.plinko-picker select{width:100%;height:42px;border-radius:999px;border:1px solid rgba(255,255,255,.16);background:#050505;color:#fff;padding:0 13px}.plinko-picker{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:12px 0}.preset-row{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin:12px 0}.preset-row button,.plinko-control-actions .ghost{height:34px;border-radius:999px;border:1px solid rgba(255,255,255,.14);background:#070707;color:#fff;font-weight:900;font-size:11px}.plinko-summary{display:flex;align-items:center;justify-content:space-between;border-top:1px solid rgba(255,255,255,.08);border-bottom:1px solid rgba(255,255,255,.08);padding:10px 0;margin:10px 0;color:rgba(255,255,255,.65);font-size:12px}.plinko-summary b{color:#fff}.plinko-house-rows{display:grid;gap:7px}.plinko-house-row{display:grid;grid-template-columns:44px 1fr 1fr;gap:7px;align-items:end;padding:8px 0;border-bottom:1px solid rgba(255,255,255,.065)}.plinko-house-row strong{font-size:12px}.plinko-house-row label{margin:0 0 5px;font-size:9px}.plinko-house-row input{height:34px;border-radius:12px;text-align:center;font-size:12px;padding:0 6px}.plinko-control-actions{display:grid;grid-template-columns:1fr 86px 72px;gap:8px;margin-top:14px}';
    document.head.appendChild(style);
  }
  async function loadPlinkoControl(){
    const status=document.getElementById('plinkoControlStatus'); if(status)status.textContent='Loading Plinko control...';
    try{const r=await fetch('/admin/api/plinko-control',{credentials:'same-origin'});const j=await r.json();if(!r.ok)throw new Error(j.error||'Could not load Plinko control');config=j;selectedRow=visibleRowLabels.includes(selectedRow)?selectedRow:'9';selectedRisk=visibleRiskLabels.includes(selectedRisk)?selectedRisk:'low';render();if(status)status.textContent='Updated '+new Date().toLocaleTimeString();}
    catch(e){if(status)status.textContent=e.message||'Could not load Plinko control'}
  }
  function current(){return config.rows[selectedRow][selectedRisk]}
  function render(){
    if(!config)return;
    document.getElementById('plinkoMode').value=config.mode||'weighted';
    document.getElementById('plinkoRowsPick').value=selectedRow;
    document.getElementById('plinkoRiskPick').value=selectedRisk;
    renderHouses();
  }
  function renderHouses(){
    if(!config)return;
    const item=current();
    const total=item.weights.reduce((a,b)=>a+Number(b||0),0);
    const ev=expected(item);
    document.getElementById('plinkoTotalChance').textContent='Total '+round(total)+'%';
    document.getElementById('plinkoExpectedReturn').textContent='Expected '+ev.toFixed(2)+'x';
    document.getElementById('plinkoHouseRows').innerHTML=item.multipliers.map((m,i)=>'<div class="plinko-house-row"><strong>#'+(i+1)+'</strong><div><label>Multiplier</label><input data-mult="'+i+'" type="number" step="0.01" min="0" value="'+esc(m)+'"/></div><div><label>Chance %</label><input data-weight="'+i+'" type="number" step="0.1" min="0" value="'+esc(round(item.weights[i]))+'"/></div></div>').join('');
    document.querySelectorAll('[data-mult]').forEach(input=>input.oninput=()=>{item.multipliers[Number(input.dataset.mult)]=Number(input.value||0);updateSummary();});
    document.querySelectorAll('[data-weight]').forEach(input=>input.oninput=()=>{item.weights[Number(input.dataset.weight)]=Number(input.value||0);updateSummary();});
  }
  function updateSummary(){const item=current();const total=item.weights.reduce((a,b)=>a+Number(b||0),0);document.getElementById('plinkoTotalChance').textContent='Total '+round(total)+'%';document.getElementById('plinkoExpectedReturn').textContent='Expected '+expected(item).toFixed(2)+'x';}
  function round(n){return Math.round(Number(n||0)*10)/10}
  function expected(item){const sum=item.weights.reduce((a,b)=>a+Number(b||0),0)||1;return item.multipliers.reduce((a,m,i)=>a+Number(m||0)*Number(item.weights[i]||0),0)/sum}
  function normalizeCurrent(){const item=current();const sum=item.weights.reduce((a,b)=>a+Number(b||0),0)||1;item.weights=item.weights.map(w=>round(Number(w||0)*100/sum));}
  function applyPreset(kind){
    const item=current(); const n=item.weights.length; const center=(n-1)/2;
    item.weights=item.weights.map((_,i)=>{const d=Math.abs(i-center)/(center||1); if(kind==='center')return round((1-d)*24+2); if(kind==='edges')return round(d*22+2); if(kind==='high')return d>.72?18:d>.42?7:2; return 100/n;});
    normalizeCurrent();
    if(kind==='high')item.multipliers=item.multipliers.map((m,i)=>{const d=Math.abs(i-center)/(center||1);return d>.72?Math.max(Number(m||0),Number(selectedRow)>=11?50:Number(selectedRow)>=9?20:10):m});
  }
  function cleanConfig(){
    const next=JSON.parse(JSON.stringify(config));
    next.mode=document.getElementById('plinkoMode').value;
    rowLabels.forEach(row=>riskLabels.forEach(risk=>{const item=next.rows[row][risk];const expected=Number(row)+1;item.multipliers=(item.multipliers||[]).slice(0,expected).map(v=>Math.max(0,Number(v)||0));item.weights=(item.weights||[]).slice(0,expected).map(v=>Math.max(0,Number(v)||0));}));
    return next;
  }
  async function savePlinkoControl(){
    const status=document.getElementById('plinkoControlStatus'); status.textContent='Saving...';
    try{const r=await fetch('/admin/api/plinko-control',{method:'POST',credentials:'same-origin',headers:{'content-type':'application/json'},body:JSON.stringify(cleanConfig())});const j=await r.json();if(!r.ok)throw new Error(j.error||'Could not save');config=j;render();status.textContent='Saved. Mini app syncs within 5 seconds.';}
    catch(e){status.textContent=e.message||'Could not save'}
  }
  async function resetPlinkoControl(){
    const status=document.getElementById('plinkoControlStatus'); status.textContent='Resetting...';
    try{const r=await fetch('/admin/api/plinko-control/reset',{method:'POST',credentials:'same-origin'});const j=await r.json();if(!r.ok)throw new Error(j.error||'Could not reset');config=j;render();status.textContent='Defaults restored.';}
    catch(e){status.textContent=e.message||'Could not reset'}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',addMenu);else addMenu();
})();
</script>`;