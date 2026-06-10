export const ADMIN_FOOTBALL_PANEL_SCRIPT = `
<style>
.football-admin{margin-top:24px;padding-top:16px;border-top:1px solid rgba(255,255,255,.09)}
.football-admin-list{display:grid;gap:11px;margin-top:12px}
.football-admin-row{display:grid;grid-template-columns:58px 1fr;gap:10px;padding:11px 0;border-top:1px solid rgba(255,255,255,.08)}
.football-admin-logo{width:58px;height:58px;border-radius:18px;background:rgba(255,255,255,.045);background-position:center;background-size:contain;background-repeat:no-repeat;box-shadow:inset 0 1px 0 rgba(255,255,255,.09)}
.football-admin-fields{display:grid;gap:7px}.football-admin-fields b{font-size:13px;color:#fff}.football-admin-fields input,.football-admin-fields select{height:auto!important;border-radius:14px!important;padding:8px!important;font-size:11px!important;background:#050505;color:#fff;border:1px solid rgba(255,255,255,.16)}
.football-admin-fields button{height:32px;border-radius:999px;border:1px solid rgba(255,255,255,.16);background:#070707;color:#fff;font-weight:900;font-size:11px}
.football-admin-status{min-height:15px;color:rgba(255,255,255,.55);font-size:11px;margin-top:8px}
.football-admin-match-form{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin-top:12px}.football-admin-match-form label{display:grid;gap:5px;font-size:10px;color:rgba(255,255,255,.55);font-weight:800}.football-admin-match-form button,.football-admin-match-form .wide{grid-column:1/-1}.football-admin-match-row{display:grid;gap:8px;padding:11px 0;border-top:1px solid rgba(255,255,255,.08);font-size:12px}.football-admin-match-actions{display:flex;flex-wrap:wrap;gap:6px}.football-admin-match-actions button{padding:0 10px}
</style>
<script>
(function(){
  var teams=[],matches=[];
  function esc(value){return String(value==null?'':value).replace(/[&<>]/g,function(char){return {'&':'&amp;','<':'&lt;','>':'&gt;'}[char]||char})}
  function withVersion(url){return url ? url + (url.indexOf('?')>=0 ? '&' : '?') + 't=' + Date.now() : ''}
  function teamName(id){var t=teams.find(function(x){return x.id===id});return t?t.name:id}
  function teamOptions(selected){return teams.map(function(t){return '<option value="'+esc(t.id)+'" '+(t.id===selected?'selected':'')+'>'+esc(t.name)+'</option>'}).join('')}
  function activate(button){
    document.querySelectorAll('.menu-item').forEach(function(item){item.classList.toggle('active',item===button)});
    document.querySelectorAll('.admin-section').forEach(function(section){section.classList.toggle('active',section.id==='sectionFootballAdmin')});
    var title=document.getElementById('adminTitle'),sub=document.getElementById('adminSubtitle'),menu=document.getElementById('adminMenu');
    if(title)title.textContent='Football';
    if(sub)sub.textContent='Manage Football Predict teams and matches.';
    if(menu)menu.hidden=true;
    loadFootballAdmin();
  }
  function mount(){
    var menu=document.getElementById('adminMenu');
    var main=document.querySelector('main.page');
    if(menu&&!document.querySelector('[data-section="footballAdmin"]')){
      var button=document.createElement('button');
      button.className='menu-item';
      button.type='button';
      button.dataset.section='footballAdmin';
      button.innerHTML='<strong>Football</strong><span>Predict matches</span>';
      menu.appendChild(button);
      button.onclick=function(){activate(button)};
    }
    if(main&&!document.getElementById('sectionFootballAdmin')){
      var section=document.createElement('section');
      section.className='section admin-section';
      section.id='sectionFootballAdmin';
      section.innerHTML='<div class="football-admin"><div class="row-title"><div><h2>Football / Predict</h2><p class="muted small-text">Create matches, settle results and upload team logos.</p></div><button class="ghost" id="refreshFootballAdmin">Refresh</button></div><form id="footballMatchForm" class="football-admin-match-form"><label>Team A<select id="footballTeamA"></select></label><label>Team B<select id="footballTeamB"></select></label><label>Date<input id="footballMatchDate" type="date"/></label><label>Start Time<input id="footballMatchStart" type="time"/></label><label>End Time (optional)<input id="footballMatchEnd" type="time"/></label><label>Status<select id="footballMatchStatus"><option value="open">Open</option><option value="locked">Locked / Live</option></select></label><label class="wide"><span><input id="footballMatchFeatured" type="checkbox"/> Featured</span></label><button type="submit">Create Match</button></form><div id="footballMatchList" class="football-admin-list"><div class="empty">Loading matches...</div></div><h3 style="margin-top:18px">Team Logos</h3><div id="footballAdminList" class="football-admin-list"><div class="empty">Loading...</div></div><p id="footballAdminStatus" class="football-admin-status"></p></div>';
      main.appendChild(section);
      document.getElementById('refreshFootballAdmin').onclick=loadFootballAdmin;
      document.getElementById('footballMatchForm').onsubmit=createMatch;
    }
  }
  function renderTeams(){
    var a=document.getElementById('footballTeamA'),b=document.getElementById('footballTeamB');
    if(a)a.innerHTML=teamOptions(a.value);
    if(b)b.innerHTML=teamOptions(b.value||((teams[1]&&teams[1].id)||''));
    var list=document.getElementById('footballAdminList');if(!list)return;
    list.innerHTML=teams.map(function(team){
      var bg=team.logoUrl?' style="background-image:url('+esc(withVersion(team.logoUrl))+')"':'';
      return '<article class="football-admin-row"><div class="football-admin-logo"'+bg+'></div><div class="football-admin-fields"><b>'+esc(team.name)+'</b><input data-football-file="'+esc(team.id)+'" type="file" accept="image/png,image/jpeg,image/webp,.png,.jpg,.jpeg,.webp"/><button data-football-upload="'+esc(team.id)+'">Upload logo</button></div></article>';
    }).join('');
    list.querySelectorAll('[data-football-upload]').forEach(function(button){button.onclick=function(){uploadFootballLogo(button.dataset.footballUpload)}});
  }
  function renderMatches(){
    var list=document.getElementById('footballMatchList');if(!list)return;
    if(!matches.length){list.innerHTML='<div class="empty">No matches yet.</div>';return;}
    list.innerHTML=matches.map(function(m){return '<article class="football-admin-match-row"><b>'+esc(teamName(m.teamAId))+' vs '+esc(teamName(m.teamBId))+'</b><span>'+esc(m.startsAt)+' · '+esc(m.status||'')+(m.result?' · result '+esc(m.result):'')+'</span><div class="football-admin-match-actions"><button data-football-action="lock" data-id="'+esc(m.id)+'">Lock Now</button><button data-football-result="team_a" data-id="'+esc(m.id)+'">Team A Won</button><button data-football-result="draw" data-id="'+esc(m.id)+'">Draw</button><button data-football-result="team_b" data-id="'+esc(m.id)+'">Team B Won</button><button data-football-action="refund" data-id="'+esc(m.id)+'">Refund All</button></div></article>'}).join('');
    list.querySelectorAll('[data-football-action]').forEach(function(btn){btn.onclick=function(){matchAction(btn.dataset.id,btn.dataset.footballAction)}});
    list.querySelectorAll('[data-football-result]').forEach(function(btn){btn.onclick=function(){matchAction(btn.dataset.id,'set_result',btn.dataset.footballResult)}});
  }
  async function loadFootballAdmin(){
    var status=document.getElementById('footballAdminStatus');if(status)status.textContent='Loading...';
    try{
      var response=await fetch('/admin/api/football-teams',{credentials:'same-origin',cache:'no-store'});
      var json=await response.json();
      if(!response.ok)throw new Error(json.error||'Load failed');
      teams=json.teams||[];renderTeams();
      var mres=await fetch('/admin/api/football-matches',{credentials:'same-origin',cache:'no-store'});
      var mj=await mres.json();if(!mres.ok)throw new Error(mj.error||'Match load failed');
      matches=mj.matches||[];renderMatches();if(status)status.textContent='Loaded';
    }catch(error){if(status)status.textContent=error.message||'Load failed'}
  }
  async function createMatch(event){
    event.preventDefault();var status=document.getElementById('footballAdminStatus');
    try{
      var date=document.getElementById('footballMatchDate').value,start=document.getElementById('footballMatchStart').value,end=document.getElementById('footballMatchEnd').value;
      var payload={teamAId:document.getElementById('footballTeamA').value,teamBId:document.getElementById('footballTeamB').value,startsAt:date+'T'+start,endsAt:end?date+'T'+end:'',status:document.getElementById('footballMatchStatus').value,featured:document.getElementById('footballMatchFeatured').checked};
      if(status)status.textContent='Creating match...';
      var response=await fetch('/admin/api/football-matches',{method:'POST',credentials:'same-origin',headers:{'content-type':'application/json'},body:JSON.stringify(payload)});
      var json=await response.json();if(!response.ok)throw new Error(json.error||'Create failed');
      if(status)status.textContent='Match created';loadFootballAdmin();
    }catch(error){if(status)status.textContent=error.message||'Create failed'}
  }
  async function matchAction(id,action,result){
    var status=document.getElementById('footballAdminStatus');
    try{if(status)status.textContent='Updating match...';var response=await fetch('/admin/api/football-matches/'+encodeURIComponent(id)+'/action',{method:'POST',credentials:'same-origin',headers:{'content-type':'application/json'},body:JSON.stringify({action:action,result:result})});var json=await response.json();if(!response.ok)throw new Error(json.error||'Update failed');if(status)status.textContent='Updated';loadFootballAdmin()}catch(error){if(status)status.textContent=error.message||'Update failed'}
  }
  async function uploadFootballLogo(id){
    var status=document.getElementById('footballAdminStatus');
    var input=document.querySelector('[data-football-file="'+id+'"]');
    if(!input||!input.files||!input.files[0]){if(status)status.textContent='Choose an image first';return;}
    try{
      var form=new FormData();form.append('team',id);form.append('image',input.files[0]);
      if(status)status.textContent='Uploading...';
      var response=await fetch('/admin/api/football-team-logo',{method:'POST',credentials:'same-origin',body:form});
      var json=await response.json();
      if(!response.ok)throw new Error(json.error||'Upload failed');
      teams=json.teams||[];renderTeams();if(status)status.textContent='Uploaded';
    }catch(error){if(status)status.textContent=error.message||'Upload failed'}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
  document.addEventListener('click',function(){setTimeout(mount,80)},true);
})();
</script>
`;
