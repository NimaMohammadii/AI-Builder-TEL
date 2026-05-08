export const ADMIN_PLINKO_CONTROL_SCRIPT = `<script>
(function(){
  const riskLabels=['low','medium','high'];
  const rowLabels=['7','9','11'];
  let config=null;
  function esc(v){return String(v??'').replace(/[&<>]/g,s=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[s]||s))}
  function addMenu(){
    const menu=document.getElementById('adminMenu');
    const main=document.querySelector('main.page');
    if(!menu||!main||document.getElementById('sectionPlinkoControl'))return;
    const btn=document.createElement('button');
    btn.className='menu-item';btn.type='button';btn.dataset.section='plinkoControl';
    btn.innerHTML='<strong>Plinko Control</strong><span>Logic, multipliers, chances and house profile</span>';
    menu.appendChild(btn);
    const section=document.createElement('section');
    section.className='section admin-section plinko-control-admin';
    section.id='sectionPlinkoControl';
    section.dataset.title='Plinko Control';
    section.dataset.subtitle='Logic, multipliers and chance controls.';
    section.innerHTML='<div class="row-title"><div><h2>Plinko Control</h2><p class="muted small-text">Control Plinko multipliers, weighted chances and profile behavior.</p></div><button class="ghost" id="refreshPlinkoControl">Refresh</button></div><div class="plinko-admin-grid"><label>Engine mode</label><select id="plinkoMode"><option value="fair">Fair physics</option><option value="weighted">Weighted outcome</option><option value="house">House control</option></select><label>House edge %</label><input id="plinkoHouseEdge" type="number" min="0" max="60" step="1"/><label>Volatility</label><input id="plinkoVolatility" type="range" min="0" max="100" step="1"/><p class="status" id="plinkoVolatilityText"></p></div><div id="plinkoTables" class="plinko-tables"></div><div class="plinko-control-actions"><button class="primary" id="savePlinkoControl" type="button">Save Plinko Control</button><button class="ghost" id="resetPlinkoControl" type="button">Reset defaults</button></div><p class="status" id="plinkoControlStatus"></p>';
    main.appendChild(section);
    btn.onclick=()=>{document.querySelectorAll('.menu-item').forEach(x=>x.classList.toggle('active',x===btn));document.querySelectorAll('.admin-section').forEach(s=>s.classList.toggle('active',s.id==='sectionPlinkoControl'));document.getElementById('adminTitle').textContent='Plinko Control';document.getElementById('adminSubtitle').textContent='Logic, multipliers and chance controls.';menu.hidden=true;window.scrollTo({top:0,behavior:'smooth'});loadPlinkoControl();};
    document.getElementById('refreshPlinkoControl').onclick=loadPlinkoControl;
    document.getElementById('savePlinkoControl').onclick=savePlinkoControl;
    document.getElementById('resetPlinkoControl').onclick=resetPlinkoControl;
    document.getElementById('plinkoVolatility').oninput=()=>document.getElementById('plinkoVolatilityText').textContent='Volatility: '+document.getElementById('plinkoVolatility').value+'/100';
    injectCss();
  }
  function injectCss(){
    if(document.getElementById('plinkoControlCss'))return;
    const style=document.createElement('style');style.id='plinkoControlCss';
    style.textContent='.plinko-admin-grid{display:grid;gap:8px;margin:14px 0}.plinko-admin-grid select{width:100%;height:42px;border-radius:999px;border:1px solid rgba(255,255,255,.16);background:#050505;color:#fff;padding:0 13px}.plinko-tables{display:grid;gap:14px;margin-top:16px}.plinko-table{border-top:1px solid rgba(255,255,255,.09);padding-top:12px}.plinko-table h3{margin:0 0 8px;font-size:14px}.plinko-risk-editor{display:grid;gap:7px;margin:10px 0}.plinko-risk-editor label{margin:0;color:rgba(255,255,255,.48);font-size:10px}.plinko-risk-editor textarea{width:100%;min-height:58px;border-radius:16px;border:1px solid rgba(255,255,255,.14);background:#050505;color:#fff;padding:10px;font-size:12px;resize:vertical}.plinko-ev{font-size:10px;color:rgba(255,255,255,.48)}.plinko-control-actions{display:grid;grid-template-columns:1fr 110px;gap:8px;margin-top:14px}';
    document.head.appendChild(style);
  }
  async function loadPlinkoControl(){
    const status=document.getElementById('plinkoControlStatus'); if(status)status.textContent='Loading Plinko control...';
    try{const r=await fetch('/admin/api/plinko-control',{credentials:'same-origin'});const j=await r.json();if(!r.ok)throw new Error(j.error||'Could not load Plinko control');config=j;render();if(status)status.textContent='Updated '+new Date().toLocaleTimeString();}
    catch(e){if(status)status.textContent=e.message||'Could not load Plinko control'}
  }
  function render(){
    if(!config)return;
    document.getElementById('plinkoMode').value=config.mode||'fair';
    document.getElementById('plinkoHouseEdge').value=Number(config.houseEdge||0);
    document.getElementById('plinkoVolatility').value=Number(config.volatility||0);
    document.getElementById('plinkoVolatilityText').textContent='Volatility: '+document.getElementById('plinkoVolatility').value+'/100';
    document.getElementById('plinkoTables').innerHTML=rowLabels.map(row=>'<div class="plinko-table"><h3>Rows '+row+'</h3>'+riskLabels.map(risk=>editor(row,risk)).join('')+'</div>').join('');
  }
  function editor(row,risk){
    const item=config.rows[row][risk];
    return '<div class="plinko-risk-editor" data-row="'+row+'" data-risk="'+risk+'"><label>'+risk.toUpperCase()+' multipliers</label><textarea data-field="multipliers">'+esc(item.multipliers.join(', '))+'</textarea><label>'+risk.toUpperCase()+' chances / weights</label><textarea data-field="weights">'+esc(item.weights.join(', '))+'</textarea><div class="plinko-ev">Expected return: '+expected(item).toFixed(2)+'x</div></div>';
  }
  function nums(v){return String(v||'').split(',').map(x=>Number(x.trim())).filter(n=>Number.isFinite(n))}
  function expected(item){const sum=item.weights.reduce((a,b)=>a+Number(b||0),0)||1;return item.multipliers.reduce((a,m,i)=>a+Number(m||0)*Number(item.weights[i]||0),0)/sum}
  function collect(){
    const next=JSON.parse(JSON.stringify(config));
    next.mode=document.getElementById('plinkoMode').value;
    next.houseEdge=Number(document.getElementById('plinkoHouseEdge').value||0);
    next.volatility=Number(document.getElementById('plinkoVolatility').value||0);
    document.querySelectorAll('.plinko-risk-editor').forEach(el=>{const row=el.dataset.row,risk=el.dataset.risk;next.rows[row][risk].multipliers=nums(el.querySelector('[data-field="multipliers"]').value);next.rows[row][risk].weights=nums(el.querySelector('[data-field="weights"]').value);});
    return next;
  }
  async function savePlinkoControl(){
    const status=document.getElementById('plinkoControlStatus'); status.textContent='Saving...';
    try{const r=await fetch('/admin/api/plinko-control',{method:'POST',credentials:'same-origin',headers:{'content-type':'application/json'},body:JSON.stringify(collect())});const j=await r.json();if(!r.ok)throw new Error(j.error||'Could not save');config=j;render();status.textContent='Saved.';}
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
