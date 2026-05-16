export const ADMIN_VEXA_LEAGUE_PANEL_SCRIPT = `<script>
(function(){
  function esc(v){return String(v==null?'':v).replace(/[&<>]/g,function(s){return {'&':'&amp;','<':'&lt;','>':'&gt;'}[s]||s})}
  function q(s){return document.querySelector(s)}
  function qa(s){return Array.prototype.slice.call(document.querySelectorAll(s))}
  function winnerCount(){return Math.max(1,Math.min(500,Number(q('[data-vl-winners-count]')&&q('[data-vl-winners-count]').value||50)))}
  function ensureStyle(){
    if(document.getElementById('vexaLeagueAdminStyle'))return;
    var style=document.createElement('style');
    style.id='vexaLeagueAdminStyle';
    style.textContent='[data-vexa-league-admin]{padding-bottom:80px}.vl-shell{display:grid;gap:16px}.vl-hero{position:relative;overflow:hidden;border-radius:28px;padding:20px;background:linear-gradient(135deg,rgba(126,20,48,.26),rgba(255,255,255,.045));border:1px solid rgba(255,255,255,.12);box-shadow:0 24px 70px rgba(0,0,0,.18),inset 0 1px 0 rgba(255,255,255,.14)}.vl-hero:after{content:"";position:absolute;right:-32px;top:-42px;width:180px;height:180px;border-radius:999px;background:radial-gradient(circle,rgba(255,255,255,.12),rgba(255,255,255,0) 68%);pointer-events:none}.vl-kicker{margin:0 0 8px;color:rgba(255,255,255,.58);font-size:10px;font-weight:900;letter-spacing:.18em;text-transform:uppercase}.vl-hero h2{margin:0;color:#fff;font-size:28px;line-height:1;font-weight:900;letter-spacing:-.05em}.vl-hero p{max-width:560px;margin:10px 0 0;color:rgba(255,255,255,.64);font-size:13px;line-height:1.45}.vl-status-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin-top:18px}.vl-stat{border-radius:18px;padding:12px;background:rgba(255,255,255,.065);border:1px solid rgba(255,255,255,.08)}.vl-stat span{display:block;color:rgba(255,255,255,.48);font-size:9px;font-weight:900;text-transform:uppercase;letter-spacing:.12em}.vl-stat strong{display:block;margin-top:6px;color:#fff;font-size:18px;font-weight:900}.vl-toolbar{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}.vl-status{min-height:38px;display:inline-flex;align-items:center;border-radius:999px;padding:0 14px;background:rgba(255,255,255,.075);border:1px solid rgba(255,255,255,.08);color:rgba(255,255,255,.78);font-size:12px;font-weight:800}.vl-btn{border:0;border-radius:16px;padding:11px 14px;background:rgba(255,255,255,.09);color:#fff;font-weight:850;box-shadow:inset 0 1px 0 rgba(255,255,255,.12);cursor:pointer}.vl-btn.primary{background:linear-gradient(135deg,#7e1430,#a72449)}.vl-btn.danger{background:rgba(255,70,90,.16);color:#ffd4dc}.vl-btn.ghost{background:rgba(255,255,255,.055)}.vl-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}.vl-card{border-radius:24px;padding:16px;background:rgba(255,255,255,.055);border:1px solid rgba(255,255,255,.09);box-shadow:inset 0 1px 0 rgba(255,255,255,.10),0 16px 40px rgba(0,0,0,.10)}.vl-card.full{grid-column:1/-1}.vl-card-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:14px}.vl-card h3{margin:0;color:#fff;font-size:17px;font-weight:900;letter-spacing:-.03em}.vl-card p{margin:6px 0 0;color:rgba(255,255,255,.55);font-size:12px;line-height:1.4}.vl-pill{display:inline-flex;align-items:center;justify-content:center;min-height:28px;border-radius:999px;padding:0 10px;background:rgba(255,255,255,.075);color:rgba(255,255,255,.78);font-size:10px;font-weight:900;text-transform:uppercase;letter-spacing:.08em;white-space:nowrap}.vl-pill.on{background:rgba(80,220,150,.14);color:#b8ffd8}.vl-pill.off{background:rgba(255,80,100,.13);color:#ffd2da}.vl-fields{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:11px}.vl-field{display:grid;gap:6px}.vl-field.full{grid-column:1/-1}.vl-field label{color:rgba(255,255,255,.48);font-size:10px;font-weight:900;text-transform:uppercase;letter-spacing:.11em}.vl-field input{width:100%;height:44px;border:1px solid rgba(255,255,255,.10);border-radius:15px;background:rgba(0,0,0,.18);color:#fff;padding:0 12px;font-weight:800;outline:none}.vl-actions{display:flex;gap:9px;flex-wrap:wrap;margin-top:14px}.vl-toggle-row{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin:12px 0}.vl-toggle{height:44px;border-radius:16px;border:1px solid rgba(255,255,255,.09);background:rgba(255,255,255,.06);color:rgba(255,255,255,.78);font-weight:900}.vl-toggle.on{background:rgba(80,220,150,.14);color:#baffdc}.vl-toggle.off{background:rgba(255,80,100,.12);color:#ffd6dd}.vl-list{display:grid;gap:9px}.vl-row{display:grid;grid-template-columns:30px minmax(0,1fr) auto;gap:10px;align-items:center;border-radius:18px;padding:11px;background:rgba(255,255,255,.045);border:1px solid rgba(255,255,255,.07)}.vl-row.compact{grid-template-columns:minmax(0,1fr)}.vl-row input[type="checkbox"]{width:18px;height:18px}.vl-row input[type="number"]{width:88px;height:38px;border:1px solid rgba(255,255,255,.10);border-radius:13px;background:rgba(0,0,0,.18);color:#fff;padding:0 9px;font-weight:850}.vl-main{min-width:0}.vl-main strong{display:block;color:#fff;font-size:13px;font-weight:900;line-height:1.15}.vl-main small{display:block;margin-top:5px;color:rgba(255,255,255,.50);font-size:11px;line-height:1.35}.vl-badge{height:30px;display:inline-flex;align-items:center;justify-content:center;border-radius:999px;padding:0 10px;background:rgba(126,20,48,.18);color:#fff;font-size:11px;font-weight:900;white-space:nowrap}.vl-empty{border-radius:18px;padding:14px;background:rgba(255,255,255,.045);color:rgba(255,255,255,.62);font-size:12px}.vl-user-actions{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:8px;margin-top:10px}.vl-user-actions button{height:36px;border-radius:13px;border:0;background:rgba(255,255,255,.075);color:#fff;font-weight:850}.vl-user-actions button.danger{background:rgba(255,80,100,.14);color:#ffd8df}.vl-two-numbers{display:grid;grid-template-columns:72px 72px;gap:8px}.vl-note{margin-top:10px;border-radius:16px;padding:11px;background:rgba(126,20,48,.12);color:rgba(255,255,255,.68);font-size:12px;line-height:1.4}@media(max-width:760px){.vl-grid,.vl-fields,.vl-status-grid,.vl-toggle-row{grid-template-columns:1fr}.vl-user-actions{grid-template-columns:repeat(2,minmax(0,1fr))}.vl-row{grid-template-columns:28px minmax(0,1fr)}.vl-row>input[type="number"],.vl-row>.vl-two-numbers{grid-column:1/-1;width:100%}.vl-row input[type="number"]{width:100%}}';
    document.head.appendChild(style);
  }
  function showLeague(){
    document.querySelectorAll('.menu-item').forEach(function(x){x.classList.toggle('active',x.getAttribute('data-section')==='league')});
    document.querySelectorAll('.admin-section').forEach(function(section){section.classList.toggle('active',section.id==='sectionLeague')});
    var title=document.getElementById('adminTitle');if(title)title.textContent='Vexa League';
    var sub=document.getElementById('adminSubtitle');if(sub)sub.textContent='Manage Top 50 players, Vex missions, weekly prizes and demo users.';
    var menu=document.getElementById('adminMenu');if(menu)menu.hidden=true;
    window.scrollTo({top:0,behavior:'smooth'});
    load();
  }
  function addMenuItem(){
    var menu=document.getElementById('adminMenu');if(!menu||menu.querySelector('[data-section="league"]'))return;
    var btn=document.createElement('button');
    btn.className='menu-item';btn.type='button';btn.setAttribute('data-section','league');
    btn.innerHTML='<strong>Vexa League</strong><span>Top 50, missions, prizes and seed users</span>';
    btn.onclick=showLeague;
    menu.appendChild(btn);
  }
  function mount(){
    ensureStyle();
    if(document.querySelector('[data-vexa-league-admin]')){addMenuItem();return;}
    addMenuItem();
    var page=document.querySelector('.page')||document.body;
    var section=document.createElement('section');
    section.className='section admin-section';
    section.id='sectionLeague';
    section.setAttribute('data-title','Vexa League');
    section.setAttribute('data-subtitle','Manage Top 50 players, Vex missions, weekly prizes and demo users.');
    section.setAttribute('data-vexa-league-admin','1');
    section.innerHTML='<div class="vl-shell"><div class="vl-hero"><p class="vl-kicker">Vexa League Control</p><h2>Top 50 Players</h2><p>Everything for the leaderboard in one place: weekly status, Vex missions, prize ranks, winners, seed users and real user moderation.</p><div class="vl-status-grid"><div class="vl-stat"><span>Status</span><strong data-vl-hero-status>Loading</strong></div><div class="vl-stat"><span>Winners</span><strong data-vl-hero-winners>50</strong></div><div class="vl-stat"><span>Seeds</span><strong data-vl-hero-seeds>--</strong></div></div></div><div class="vl-toolbar"><div class="vl-status" data-vl-status>Loading League...</div><button class="vl-btn primary" type="button" data-vl-refresh>Refresh League</button></div><div data-vl-root></div></div>';
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
    try{var d=await api('/admin/api/vexa-league');render(d);if(status)status.textContent='League loaded successfully'}
    catch(e){if(status)status.textContent=e.message||'Could not load League';if(root)root.innerHTML='<div class="vl-empty">Could not load Vexa League data. Try refreshing.</div>'}
  }
  function render(d){
    var root=q('[data-vl-root]');if(!root)return;
    var w=d.currentWeek||{};
    var statusText=w.status==='active'?'Active':'Hidden';
    var heroStatus=q('[data-vl-hero-status]');if(heroStatus)heroStatus.textContent=statusText;
    var heroWinners=q('[data-vl-hero-winners]');if(heroWinners)heroWinners.textContent=String(w.winnerCount||50);
    var heroSeeds=q('[data-vl-hero-seeds]');if(heroSeeds)heroSeeds.textContent=String((d.seedUsers||[]).length||0);
    root.innerHTML='<div class="vl-grid"><div class="vl-card full"><div class="vl-card-head"><div><h3>Current Week</h3><p>Control whether the Top 50 page is visible, when the week starts/ends, and what users see at the top.</p></div><span class="vl-pill '+(w.status==='active'?'on':'off')+'">'+esc(statusText)+'</span></div><div class="vl-fields"><div class="vl-field full"><label>Title</label><input data-vl-title value="'+esc(w.title||'Vexa Weekly Race')+'"/></div><div class="vl-field"><label>Start</label><input data-vl-start type="datetime-local" value="'+esc(toLocal(w.startsAt))+'"/></div><div class="vl-field"><label>End</label><input data-vl-end type="datetime-local" value="'+esc(toLocal(w.endsAt))+'"/></div><div class="vl-field"><label>Winner Count</label><input data-vl-winners-count type="number" min="1" max="500" value="'+esc(w.winnerCount||50)+'"/></div><div class="vl-field"><label>Announcement</label><input data-vl-announcement value="'+esc(w.announcement||'Top players win weekly rewards.')+'"/></div></div><div class="vl-toggle-row"><button class="vl-toggle '+(w.status==='active'?'on':'off')+'" type="button" data-vl-toggle-league>'+(w.status==='active'?'League ON':'League OFF')+'</button><button class="vl-toggle '+(w.rewardsEnabled?'on':'off')+'" type="button" data-vl-toggle-rewards>'+(w.rewardsEnabled?'Rewards ON':'Rewards OFF')+'</button><button class="vl-toggle '+(w.seedUsersEnabled?'on':'off')+'" type="button" data-vl-toggle-seeds>'+(w.seedUsersEnabled?'Seeds ON':'Seeds OFF')+'</button></div><div class="vl-actions"><button class="vl-btn primary" type="button" data-vl-save-week>Save Week</button><button class="vl-btn ghost" type="button" data-vl-new-week>Start New Week</button></div></div><div class="vl-card"><div class="vl-card-head"><div><h3>Daily Missions</h3><p>Select which missions are active for a date and how much Vex each one gives.</p></div><span class="vl-pill">Daily</span></div><div class="vl-field"><label>Active Date</label><input data-vl-date type="date" value="'+today()+'"/></div><div class="vl-list" data-vl-missions></div><div class="vl-actions"><button class="vl-btn primary" type="button" data-vl-save-missions>Save Missions</button></div></div><div class="vl-card"><div class="vl-card-head"><div><h3>Weekly Prizes</h3><p>Enable prizes and choose the rank range for each prize.</p></div><span class="vl-pill">Ranks</span></div><div class="vl-list" data-vl-prizes></div><div class="vl-actions"><button class="vl-btn primary" type="button" data-vl-save-prizes>Save Prizes</button></div></div><div class="vl-card"><div class="vl-card-head"><div><h3>Winners</h3><p>Finalize only real users. Seed/demo users will not become real winners.</p></div><span class="vl-pill">Final</span></div><div class="vl-actions"><button class="vl-btn danger" type="button" data-vl-finalize>Finalize Current Week</button></div><div class="vl-list" data-vl-winners-list><div class="vl-empty">Loading winners...</div></div></div><div class="vl-card"><div class="vl-card-head"><div><h3>Seed Users</h3><p>Demo users keep the leaderboard full while real users are still joining.</p></div><span class="vl-pill">Demo</span></div><div class="vl-actions"><button class="vl-btn ghost" type="button" data-vl-generate-seeds>Generate / Reset 50 Seed Users</button></div><div class="vl-list" data-vl-seeds></div></div><div class="vl-card full"><div class="vl-card-head"><div><h3>Real League Users</h3><p>Manually adjust Vex, hide users, or ban/unban users from the leaderboard.</p></div><button class="vl-btn ghost" type="button" data-vl-refresh-users>Refresh Users</button></div><div class="vl-list" data-vl-users><div class="vl-empty">Loading users...</div></div></div></div>';
    root.querySelector('[data-vl-toggle-league]').onclick=function(){w.status=w.status==='active'?'hidden':'active';render(Object.assign({},d,{currentWeek:w}))};
    root.querySelector('[data-vl-toggle-rewards]').onclick=function(){w.rewardsEnabled=!w.rewardsEnabled;render(Object.assign({},d,{currentWeek:w}))};
    root.querySelector('[data-vl-toggle-seeds]').onclick=function(){w.seedUsersEnabled=!w.seedUsersEnabled;render(Object.assign({},d,{currentWeek:w}))};
    root.querySelector('[data-vl-save-week]').onclick=saveWeek;
    root.querySelector('[data-vl-new-week]').onclick=startNewWeek;
    root.querySelector('[data-vl-save-missions]').onclick=saveMissions;
    root.querySelector('[data-vl-save-prizes]').onclick=savePrizes;
    root.querySelector('[data-vl-generate-seeds]').onclick=generateSeeds;
    root.querySelector('[data-vl-refresh-users]').onclick=loadLeagueUsers;
    root.querySelector('[data-vl-finalize]').onclick=finalizeWeek;
    renderMissions(d);renderPrizes(d);renderSeeds(d);loadLeagueUsers();loadWinners();
  }
  function renderMissions(d){
    var wrap=q('[data-vl-missions]');if(!wrap)return;
    var selected={};(d.dailyMissions||[]).forEach(function(m){selected[m.templateId]=m});
    var list=d.missionLibrary||[];
    if(!list.length){wrap.innerHTML='<div class="vl-empty">No mission templates found.</div>';return}
    wrap.innerHTML=list.map(function(m){var s=selected[m.id];return '<label class="vl-row"><input type="checkbox" data-vl-mission="'+esc(m.id)+'" '+(s?'checked':'')+'/><span class="vl-main"><strong>'+esc(m.title)+'</strong><small>'+esc(m.description)+' · '+esc(m.type)+' · '+esc(m.difficulty)+'</small></span><input type="number" min="0" max="99999" data-vl-mission-vex="'+esc(m.id)+'" value="'+esc((s&&s.vexAmount)||m.defaultVex)+'"/></label>'}).join('')
  }
  function renderPrizes(d){
    var wrap=q('[data-vl-prizes]');if(!wrap)return;
    var saved={};(d.weeklyPrizes||[]).forEach(function(p){saved[p.prizeTemplateId]=p});
    var list=d.prizeLibrary||[];
    if(!list.length){wrap.innerHTML='<div class="vl-empty">No prize templates found.</div>';return}
    wrap.innerHTML=list.map(function(p,i){var s=saved[p.id]||{};return '<div class="vl-row"><input type="checkbox" data-vl-prize="'+esc(p.id)+'" '+(s.enabled?'checked':'')+'/><span class="vl-main"><strong>'+esc(p.title)+'</strong><small>'+esc(p.description)+' · '+esc(p.type)+'</small></span><span class="vl-two-numbers"><input type="number" min="1" data-vl-prize-from="'+esc(p.id)+'" value="'+esc(s.rankFrom||rankFrom(i))+'"/><input type="number" min="1" data-vl-prize-to="'+esc(p.id)+'" value="'+esc(s.rankTo||rankTo(i))+'"/></span></div>'}).join('')
  }
  function renderSeeds(d){
    var wrap=q('[data-vl-seeds]');if(!wrap)return;
    var seeds=d.seedUsers||[];
    if(!seeds.length){wrap.innerHTML='<div class="vl-empty">No seed users yet. Generate 50 demo users.</div>';return}
    wrap.innerHTML=seeds.slice(0,12).map(function(u){return '<div class="vl-row compact"><span class="vl-main"><strong>#'+esc(u.position)+' '+esc(u.name)+' <span style="color:rgba(255,255,255,.48)">@'+esc(u.username)+'</span></strong><small>'+esc(u.vex)+' Vex · Lv '+esc(u.level)+' · '+esc(u.rankName)+' · '+esc(u.balanceTon)+' TON</small></span></div>'}).join('')+'<div class="vl-note">Showing first 12 of '+esc(seeds.length)+' seed users.</div>'
  }
  async function loadWinners(){
    var wrap=q('[data-vl-winners-list]');if(!wrap)return;
    wrap.innerHTML='<div class="vl-empty">Loading winners...</div>';
    try{var d=await api('/admin/api/vexa-league/winners');renderWinners(d.winners||[],d.previousWinners||[])}
    catch(e){wrap.innerHTML='<div class="vl-empty">'+esc(e.message||'Could not load winners')+'</div>'}
  }
  function renderWinners(winners,previous){
    var wrap=q('[data-vl-winners-list]');if(!wrap)return;
    var current=winners.length?winners.slice(0,20).map(function(w){return '<div class="vl-row compact"><span class="vl-main"><strong>#'+esc(w.position)+' '+esc(w.name)+' · '+esc(w.vex)+' Vex</strong><small>'+(w.prizeLabel?esc(w.prizeLabel):'No prize label')+'</small></span></div>'}).join(''):'<div class="vl-empty">No finalized winners for current week yet.</div>';
    var prev=previous.length?'<div class="vl-note">Previous Winners</div>'+previous.slice(0,12).map(function(w){return '<div class="vl-row compact"><span class="vl-main"><strong>#'+esc(w.position)+' '+esc(w.name)+' · '+esc(w.vex)+' Vex</strong><small>'+esc(w.weekTitle||'Week')+'</small></span></div>'}).join(''):'';
    wrap.innerHTML=current+prev;
  }
  async function finalizeWeek(){
    var ok=confirm('Finalize current week winners? This will end the current League week.');
    if(!ok)return;
    await api('/admin/api/vexa-league/finalize',{method:'POST',body:JSON.stringify({winnerCount:winnerCount()})});
    load();
  }
  async function startNewWeek(){
    var ok=confirm('Start a new Vexa League week? Previous winners stay saved and weekly Vex starts from zero for the new week.');
    if(!ok)return;
    var title=q('[data-vl-title]').value||'Vexa Weekly Race';
    var announcement=q('[data-vl-announcement]').value||'Complete missions, earn Vex and climb the weekly race.';
    await api('/admin/api/vexa-league/new-week',{method:'POST',body:JSON.stringify({title:title,announcement:announcement,winnerCount:winnerCount(),rewardsEnabled:q('[data-vl-toggle-rewards]').textContent.indexOf('ON')>-1,seedUsersEnabled:q('[data-vl-toggle-seeds]').textContent.indexOf('ON')>-1,showPrizes:true})});
    load();
  }
  async function loadLeagueUsers(){
    var wrap=q('[data-vl-users]');if(!wrap)return;
    wrap.innerHTML='<div class="vl-empty">Loading League users...</div>';
    try{var d=await api('/admin/api/vexa-league/users');renderLeagueUsers(d.users||[])}
    catch(e){wrap.innerHTML='<div class="vl-empty">'+esc(e.message||'Could not load users')+'</div>'}
  }
  function renderLeagueUsers(users){
    var wrap=q('[data-vl-users]');if(!wrap)return;
    if(!users.length){wrap.innerHTML='<div class="vl-empty">No real League users yet. Users appear here after they claim Vex.</div>';return}
    wrap.innerHTML=users.slice(0,80).map(function(u){return '<div class="vl-row compact"><span class="vl-main"><strong>#'+esc(u.position)+' '+esc(u.name)+' · '+esc(u.vex)+' Vex</strong><small>ID '+esc(u.userId)+' · @'+esc(u.username)+' · '+(u.hidden?'Hidden':'Visible')+' · '+(u.banned?'Banned':'Active')+'</small></span><div class="vl-user-actions"><button type="button" data-vl-user-adjust="'+esc(u.userId)+'" data-vl-delta="100">+100</button><button type="button" data-vl-user-adjust="'+esc(u.userId)+'" data-vl-delta="-100">-100</button><button type="button" data-vl-user-adjust="'+esc(u.userId)+'" data-vl-delta="500">+500</button><button type="button" data-vl-user-hide="'+esc(u.userId)+'" data-vl-hidden="'+(u.hidden?'0':'1')+'">'+(u.hidden?'Show':'Hide')+'</button><button class="danger" type="button" data-vl-user-ban="'+esc(u.userId)+'" data-vl-banned="'+(u.banned?'0':'1')+'">'+(u.banned?'Unban':'Ban')+'</button></div></div>'}).join('');
    wrap.querySelectorAll('[data-vl-user-adjust]').forEach(function(btn){btn.onclick=function(){adjustUserVex(btn.getAttribute('data-vl-user-adjust'),Number(btn.getAttribute('data-vl-delta')||0))}});
    wrap.querySelectorAll('[data-vl-user-hide]').forEach(function(btn){btn.onclick=function(){moderateUser(btn.getAttribute('data-vl-user-hide'),btn.getAttribute('data-vl-hidden')==='1',null)}});
    wrap.querySelectorAll('[data-vl-user-ban]').forEach(function(btn){btn.onclick=function(){moderateUser(btn.getAttribute('data-vl-user-ban'),null,btn.getAttribute('data-vl-banned')==='1')}});
  }
  async function adjustUserVex(userId,delta){await api('/admin/api/vexa-league/users/adjust-vex',{method:'POST',body:JSON.stringify({userId:userId,delta:delta,reason:'manual-panel'})});loadLeagueUsers()}
  async function moderateUser(userId,hidden,banned){
    var users=[];try{var current=await api('/admin/api/vexa-league/users');users=current.users||[]}catch(e){}
    var found=users.find(function(u){return String(u.userId)===String(userId)})||{};
    await api('/admin/api/vexa-league/users/moderate',{method:'POST',body:JSON.stringify({userId:userId,hidden:hidden==null?!!found.hidden:hidden,banned:banned==null?!!found.banned:banned})});
    loadLeagueUsers();
  }
  async function saveWeek(){
    var body={title:q('[data-vl-title]').value,startsAt:fromLocal(q('[data-vl-start]').value),endsAt:fromLocal(q('[data-vl-end]').value),status:q('[data-vl-toggle-league]').textContent.indexOf('ON')>-1?'active':'hidden',rewardsEnabled:q('[data-vl-toggle-rewards]').textContent.indexOf('ON')>-1,seedUsersEnabled:q('[data-vl-toggle-seeds]').textContent.indexOf('ON')>-1,winnerCount:winnerCount(),announcement:q('[data-vl-announcement]').value};
    await api('/admin/api/vexa-league/week',{method:'POST',body:JSON.stringify(body)});load();
  }
  async function saveMissions(){
    var date=q('[data-vl-date]').value;var missions=qa('[data-vl-mission]').filter(function(x){return x.checked}).map(function(x){var id=x.getAttribute('data-vl-mission');return {templateId:id,vexAmount:Number((q('[data-vl-mission-vex="'+id+'"]')||{}).value||0),enabled:true}});
    await api('/admin/api/vexa-league/daily-missions',{method:'POST',body:JSON.stringify({activeDate:date,missions:missions})});load();
  }
  async function savePrizes(){
    var prizes=qa('[data-vl-prize]').map(function(x){var id=x.getAttribute('data-vl-prize');return {prizeTemplateId:id,enabled:x.checked,rankFrom:Number((q('[data-vl-prize-from="'+id+'"]')||{}).value||1),rankTo:Number((q('[data-vl-prize-to="'+id+'"]')||{}).value||1)}});
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
