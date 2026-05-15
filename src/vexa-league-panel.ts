export const ADMIN_VEXA_LEAGUE_PANEL_SCRIPT = `<script>
(function(){
  function esc(v){return String(v??'').replace(/[&<>]/g,s=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[s]||s))}
  function q(s){return document.querySelector(s)}
  function showLeague(){
    document.querySelectorAll('.menu-item').forEach(function(x){x.classList.toggle('active',x.getAttribute('data-section')==='league')});
    document.querySelectorAll('.admin-section').forEach(function(section){section.classList.toggle('active',section.id==='sectionLeague')});
    var title=document.getElementById('adminTitle');if(title)title.textContent='Vexa League';
    var sub=document.getElementById('adminSubtitle');if(sub)sub.textContent='Weekly Vex race, missions, prizes and seed users.';
    var menu=document.getElementById('adminMenu');if(menu)menu.hidden=true;
    window.scrollTo({top:0,behavior:'smooth'});
    load();
  }
  function addMenuItem(){
    var menu=document.getElementById('adminMenu');if(!menu||menu.querySelector('[data-section="league"]'))return;
    var btn=document.createElement('button');
    btn.className='menu-item';btn.type='button';btn.setAttribute('data-section','league');
    btn.innerHTML='<strong>Vexa League</strong><span>Vex missions, prizes and seed users</span>';
    btn.onclick=showLeague;
    menu.appendChild(btn);
  }
  function mount(){
    if(document.querySelector('[data-vexa-league-admin]')){addMenuItem();return;}
    addMenuItem();
    var page=document.querySelector('.page')||document.body;
    var section=document.createElement('section');
    section.className='section admin-section';
    section.id='sectionLeague';
    section.setAttribute('data-title','Vexa League');
    section.setAttribute('data-subtitle','Weekly Vex race, missions, prizes and seed users.');
    section.setAttribute('data-vexa-league-admin','1');
    section.innerHTML='<div class="row-title"><div><h2>Vexa League</h2><p class="small-text">Weekly Vex race, missions, prizes and seed users.</p></div><button class="manage-btn" type="button" data-vl-refresh>Refresh</button></div><div class="mini-status" data-vl-status>Loading League...</div><div data-vl-root></div>';
    page.appendChild(section);
    section.querySelector('[data-vl-refresh]').onclick=load;
    load();
  }
  async function api(path,opt){
    var r=await fetch(path,Object.assign({credentials:'same-origin'},opt||{}, {headers:Object.assign({'content-type':'application/json'},(opt&&opt.headers)||{})}));
    var j=await r.json().catch(function(){return{error:'Invalid response'}});
    if(!r.ok)throw new Error(j.error||'Request failed');
    return j;
  }
  async function load(){
    var status=q('[data-vl-status]'),root=q('[data-vl-root]');
    if(status)status.textContent='Loading League...';
    try{var d=await api('/admin/api/vexa-league');render(d);if(status)status.textContent='League loaded'}
    catch(e){if(status)status.textContent=e.message||'Could not load League';if(root)root.innerHTML=''}
  }
  function render(d){
    var root=q('[data-vl-root]');if(!root)return;
    var w=d.currentWeek||{};
    root.innerHTML='<div class="section-block" style="height:auto!important"><h3>Current Week</h3><label class="small-text">Title</label><input data-vl-title value="'+esc(w.title||'Vexa Weekly Race')+'"/><label class="small-text">Start</label><input data-vl-start type="datetime-local" value="'+esc(toLocal(w.startsAt))+'"/><label class="small-text">End</label><input data-vl-end type="datetime-local" value="'+esc(toLocal(w.endsAt))+'"/><div class="credit-tools"><button type="button" data-vl-toggle-league>'+(w.status==='active'?'League ON':'League OFF')+'</button><button type="button" data-vl-toggle-rewards>'+(w.rewardsEnabled?'Rewards ON':'Rewards OFF')+'</button><button type="button" data-vl-toggle-seeds>'+(w.seedUsersEnabled?'Seeds ON':'Seeds OFF')+'</button></div><label class="small-text">Winner Count</label><input data-vl-winners type="number" min="0" max="500" value="'+esc(w.winnerCount||50)+'"/><label class="small-text">Announcement</label><input data-vl-announcement value="'+esc(w.announcement||'Top players win weekly rewards.')+'"/><button class="save-credit" type="button" data-vl-save-week>Save Week</button></div><div class="section-block" style="height:auto!important"><h3>Mission Library</h3><p class="small-text">Select missions for active day and set Vex amount.</p><label class="small-text">Active Date</label><input data-vl-date type="date" value="'+today()+'"/><div data-vl-missions></div><button class="save-credit" type="button" data-vl-save-missions>Save Selected Missions</button></div><div class="section-block" style="height:auto!important"><h3>Weekly Prizes</h3><p class="small-text">Choose prizes or keep rewards disabled.</p><div data-vl-prizes></div><button class="save-credit" type="button" data-vl-save-prizes>Save Prizes</button></div><div class="section-block" style="height:auto!important"><h3>Seed Users</h3><p class="small-text">Create 50 demo users so leaderboard is not empty.</p><button class="save-credit" type="button" data-vl-generate-seeds>Generate / Reset 50 Seed Users</button><div data-vl-seeds></div></div>';
    root.querySelector('[data-vl-toggle-league]').onclick=function(){w.status=w.status==='active'?'hidden':'active';render(Object.assign({},d,{currentWeek:w}))};
    root.querySelector('[data-vl-toggle-rewards]').onclick=function(){w.rewardsEnabled=!w.rewardsEnabled;render(Object.assign({},d,{currentWeek:w}))};
    root.querySelector('[data-vl-toggle-seeds]').onclick=function(){w.seedUsersEnabled=!w.seedUsersEnabled;render(Object.assign({},d,{currentWeek:w}))};
    root.querySelector('[data-vl-save-week]').onclick=saveWeek;
    root.querySelector('[data-vl-save-missions]').onclick=saveMissions;
    root.querySelector('[data-vl-save-prizes]').onclick=savePrizes;
    root.querySelector('[data-vl-generate-seeds]').onclick=generateSeeds;
    renderMissions(d);renderPrizes(d);renderSeeds(d);
  }
  function renderMissions(d){
    var wrap=q('[data-vl-missions]');if(!wrap)return;
    var selected={};(d.dailyMissions||[]).forEach(function(m){selected[m.templateId]=m});
    wrap.innerHTML=(d.missionLibrary||[]).map(function(m){var s=selected[m.id];return '<label class="lock-row" style="display:grid!important;grid-template-columns:24px 1fr 82px!important;gap:8px!important;align-items:center!important"><input type="checkbox" data-vl-mission="'+esc(m.id)+'" '+(s?'checked':'')+'/><span class="lock-main"><strong>'+esc(m.title)+'</strong><p>'+esc(m.description)+' · '+esc(m.type)+' · '+esc(m.difficulty)+'</p></span><input type="number" min="0" max="99999" data-vl-mission-vex="'+esc(m.id)+'" value="'+esc((s&&s.vexAmount)||m.defaultVex)+'"/></label>'}).join('')
  }
  function renderPrizes(d){
    var wrap=q('[data-vl-prizes]');if(!wrap)return;
    var saved={};(d.weeklyPrizes||[]).forEach(function(p){saved[p.prizeTemplateId]=p});
    wrap.innerHTML=(d.prizeLibrary||[]).map(function(p,i){var s=saved[p.id]||{};return '<div class="lock-row" style="display:grid!important;grid-template-columns:24px 1fr 58px 58px!important;gap:8px!important;align-items:center!important"><input type="checkbox" data-vl-prize="'+esc(p.id)+'" '+(s.enabled?'checked':'')+'/><span class="lock-main"><strong>'+esc(p.title)+'</strong><p>'+esc(p.description)+' · '+esc(p.type)+'</p></span><input type="number" min="1" data-vl-prize-from="'+esc(p.id)+'" value="'+esc(s.rankFrom||rankFrom(i))+'"/><input type="number" min="1" data-vl-prize-to="'+esc(p.id)+'" value="'+esc(s.rankTo||rankTo(i))+'"/></div>'}).join('')
  }
  function renderSeeds(d){
    var wrap=q('[data-vl-seeds]');if(!wrap)return;
    wrap.innerHTML=(d.seedUsers||[]).slice(0,12).map(function(u){return '<div class="mini-status">#'+esc(u.position)+' '+esc(u.name)+' @'+esc(u.username)+' · '+esc(u.vex)+' Vex · Lv '+esc(u.level)+' · '+esc(u.rankName)+' · '+esc(u.balanceTon)+' TON</div>'}).join('')+'<p class="small-text">Showing first 12 of '+esc((d.seedUsers||[]).length)+' seed users.</p>'
  }
  async function saveWeek(){
    var body={title:q('[data-vl-title]').value,startsAt:fromLocal(q('[data-vl-start]').value),endsAt:fromLocal(q('[data-vl-end]').value),status:q('[data-vl-toggle-league]').textContent.indexOf('ON')>-1?'active':'hidden',rewardsEnabled:q('[data-vl-toggle-rewards]').textContent.indexOf('ON')>-1,seedUsersEnabled:q('[data-vl-toggle-seeds]').textContent.indexOf('ON')>-1,winnerCount:Number(q('[data-vl-winners]').value||50),announcement:q('[data-vl-announcement]').value};
    await api('/admin/api/vexa-league/week',{method:'POST',body:JSON.stringify(body)});load();
  }
  async function saveMissions(){
    var date=q('[data-vl-date]').value;var missions=[].slice.call(document.querySelectorAll('[data-vl-mission]')).filter(function(x){return x.checked}).map(function(x){var id=x.getAttribute('data-vl-mission');return {templateId:id,vexAmount:Number((q('[data-vl-mission-vex="'+id+'"]')||{}).value||0),enabled:true}});
    await api('/admin/api/vexa-league/daily-missions',{method:'POST',body:JSON.stringify({activeDate:date,missions:missions})});load();
  }
  async function savePrizes(){
    var prizes=[].slice.call(document.querySelectorAll('[data-vl-prize]')).map(function(x){var id=x.getAttribute('data-vl-prize');return {prizeTemplateId:id,enabled:x.checked,rankFrom:Number((q('[data-vl-prize-from="'+id+'"]')||{}).value||1),rankTo:Number((q('[data-vl-prize-to="'+id+'"]')||{}).value||1)}});
    await api('/admin/api/vexa-league/prizes',{method:'POST',body:JSON.stringify({prizes:prizes})});load();
  }
  async function generateSeeds(){await api('/admin/api/vexa-league/seed-users/generate',{method:'POST',body:'{}'});load()}
  function today(){return new Date().toISOString().slice(0,10)}
  function toLocal(v){if(!v)return '';var d=new Date(v);if(!Number.isFinite(d.getTime()))return '';d.setMinutes(d.getMinutes()-d.getTimezoneOffset());return d.toISOString().slice(0,16)}
  function fromLocal(v){if(!v)return '';return new Date(v).toISOString()}
  function rankFrom(i){return i===0?1:i===1?2:i===2?4:i===3?11:1}
  function rankTo(i){return i===0?1:i===1?3:i===2?10:i===3?50:1}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
})();
</script>`;
