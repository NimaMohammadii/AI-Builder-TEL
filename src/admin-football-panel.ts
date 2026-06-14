export const ADMIN_FOOTBALL_PANEL_SCRIPT = `
<style>
.football-admin{margin-top:24px;padding-top:16px;border-top:1px solid rgba(255,255,255,.09)}
.football-admin-list{display:grid;gap:11px;margin-top:12px}
.football-admin-row{display:grid;grid-template-columns:58px 1fr;gap:10px;padding:11px 0;border-top:1px solid rgba(255,255,255,.08)}
.football-admin-logo{width:58px;height:58px;border-radius:18px;background:rgba(255,255,255,.045);background-position:center;background-size:contain;background-repeat:no-repeat;box-shadow:inset 0 1px 0 rgba(255,255,255,.09)}
.football-admin-fields{display:grid;gap:7px}.football-admin-fields b{font-size:13px;color:#fff}.football-admin-fields input,.football-admin-fields select{height:auto!important;border-radius:14px!important;padding:8px!important;font-size:11px!important;background:#050505;color:#fff;border:1px solid rgba(255,255,255,.16)}
.football-admin-fields button{height:32px;border-radius:999px;border:1px solid rgba(255,255,255,.16);background:#070707;color:#fff;font-weight:900;font-size:11px}
.football-admin-status{min-height:15px;color:rgba(255,255,255,.55);font-size:11px;margin-top:8px}
.football-admin-match-form{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin-top:12px}.football-admin-match-form label{display:grid;gap:5px;font-size:10px;color:rgba(255,255,255,.55);font-weight:800}.football-admin-match-form button,.football-admin-match-form .wide{grid-column:1/-1}.football-admin-match-row{display:grid;gap:8px;padding:11px 0;border-top:1px solid rgba(255,255,255,.08);font-size:12px}.football-admin-match-actions{display:flex;flex-wrap:wrap;gap:6px}.football-admin-match-actions button{padding:0 10px}.football-admin-match-actions .danger{border-color:rgba(255,77,109,.5);background:rgba(255,77,109,.12);color:#ffd6df}.football-admin-live-form,.football-admin-score-form{display:grid;grid-template-columns:1fr 80px auto;gap:6px}.football-admin-score-form{grid-template-columns:1fr 1fr auto}.football-admin-live-list{display:grid;gap:5px}.football-admin-live-row{display:grid;gap:5px;padding:7px;border-radius:12px;background:rgba(255,255,255,.04)}
</style>
<script>
(function(){
  var teams=[],matches=[];
  function esc(value){return String(value==null?'':value).replace(/[&<>]/g,function(char){return {'&':'&amp;','<':'&lt;','>':'&gt;'}[char]||char})}
  function withVersion(url){return url ? url + (url.indexOf('?')>=0 ? '&' : '?') + 't=' + Date.now() : ''}
  function teamName(id){var t=teams.find(function(x){return x.id===id});return t?t.name:id}
  function teamOptions(selected){return teams.map(function(t){return '<option value="'+esc(t.id)+'" '+(t.id===selected?'selected':'')+'>'+esc(t.name)+'</option>'}).join('')}
  function localDateTimeToIso(date,time,label){if(!date||!time)throw new Error(label||'Choose date and time');var parsed=new Date(date+'T'+time);if(Number.isNaN(parsed.getTime()))throw new Error(label||'Invalid date and time');return parsed.toISOString()}
  function localMatchTime(value){var date=new Date(value);if(Number.isNaN(date.getTime()))return String(value||'');return date.toLocaleString(undefined,{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'})}
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
      section.innerHTML='<div class="football-admin"><div class="row-title"><div><h2>Football / Predict</h2><p class="muted small-text">Create matches, settle results and upload team logos.</p></div><button class="ghost" id="refreshFootballAdmin">Refresh</button></div><form id="footballMatchForm" class="football-admin-match-form"><label>Team A<select id="footballTeamA"></select></label><label>Team B<select id="footballTeamB"></select></label><label>Date<input id="footballMatchDate" type="date"/></label><label>Start Time<input id="footballMatchStart" type="time"/></label><label>End Time (optional)<input id="footballMatchEnd" type="time"/></label><label>Status<select id="footballMatchStatus"><option value="open">Open</option><option value="locked">Locked / Live</option></select></label><label>Team A goals<input id="footballMatchTeamAGoals" type="number" min="0" value="0"/></label><label>Team B goals<input id="footballMatchTeamBGoals" type="number" min="0" value="0"/></label><label class="wide"><span><input id="footballMatchFeatured" type="checkbox"/> Featured</span></label><button type="submit">Create Match</button></form><div id="footballMatchList" class="football-admin-list"><div class="empty">Loading matches...</div></div><h3 style="margin-top:18px">Team Logos</h3><form id="footballTeamForm" class="football-admin-match-form"><label class="wide">New team name<input id="footballTeamName" type="text" placeholder="Team name"/></label><button type="submit">Create Team</button></form><div id="footballAdminList" class="football-admin-list"><div class="empty">Loading...</div></div><p id="footballAdminStatus" class="football-admin-status"></p></div>'; 
      main.appendChild(section);
      document.getElementById('refreshFootballAdmin').onclick=loadFootballAdmin;
      document.getElementById('footballMatchForm').onsubmit=createMatch;
      document.getElementById('footballTeamForm').onsubmit=createTeam;
    }
  }
  function renderTeams(){
    var a=document.getElementById('footballTeamA'),b=document.getElementById('footballTeamB');
    if(a)a.innerHTML=teamOptions(a.value);
    if(b)b.innerHTML=teamOptions(b.value||((teams[1]&&teams[1].id)||''));
    var list=document.getElementById('footballAdminList');if(!list)return;
    list.innerHTML=teams.map(function(team){
      var bg=team.logoUrl?' style="background-image:url('+esc(withVersion(team.logoUrl))+')"':'';
      return '<article class="football-admin-row"><div class="football-admin-logo"'+bg+'></div><div class="football-admin-fields"><b>'+esc(team.name)+'</b><input data-football-file="'+esc(team.id)+'" type="file" accept="image/png,image/jpeg,image/webp,.png,.jpg,.jpeg,.webp"/><button data-football-upload="'+esc(team.id)+'">Upload logo</button><button data-football-delete-team="'+esc(team.id)+'">Delete team</button></div></article>';
    }).join('');
    list.querySelectorAll('[data-football-upload]').forEach(function(button){button.onclick=function(){uploadFootballLogo(button.dataset.footballUpload)}});
    list.querySelectorAll('[data-football-delete-team]').forEach(function(button){button.onclick=function(){deleteTeam(button.dataset.footballDeleteTeam)}});
  }
  function renderMatches(){
    var list=document.getElementById('footballMatchList');if(!list)return;
    if(!matches.length){list.innerHTML='<div class="empty">No matches yet.</div>';return;}
    list.innerHTML=matches.map(function(m){var qs=m.liveQuestions||[];return '<article class="football-admin-match-row"><b>'+esc(teamName(m.teamAId))+' vs '+esc(teamName(m.teamBId))+'</b><span>'+esc(localMatchTime(m.startsAt))+' · '+esc(m.status||'')+(m.result?' · result '+esc(m.result):'')+'</span><form class="football-admin-score-form" data-score-form="'+esc(m.id)+'"><input name="teamAGoals" type="number" min="0" value="'+esc(m.teamAGoals||0)+'" placeholder="'+esc(teamName(m.teamAId))+' goals"/><input name="teamBGoals" type="number" min="0" value="'+esc(m.teamBGoals||0)+'" placeholder="'+esc(teamName(m.teamBId))+' goals"/><button type="submit">Save goals</button></form><div class="football-admin-match-actions"><button data-football-action="lock" data-id="'+esc(m.id)+'">Lock Now</button><button data-football-result="team_a" data-id="'+esc(m.id)+'">Team A Won</button><button data-football-result="draw" data-id="'+esc(m.id)+'">Draw</button><button data-football-result="team_b" data-id="'+esc(m.id)+'">Team B Won</button><button data-football-action="refund" data-id="'+esc(m.id)+'">Refund All</button><button class="danger" data-football-delete-match="'+esc(m.id)+'">Delete Match</button></div><form class="football-admin-live-form" data-live-form="'+esc(m.id)+'"><input name="question" placeholder="Live question"/><input name="minutes" type="number" min="1" value="10"/><button type="submit">Add</button></form><div class="football-admin-live-list">'+(qs.length?qs.map(function(q){return '<div class="football-admin-live-row"><span>'+esc(q.question)+' · '+esc(q.status||'open')+' · '+Math.ceil((q.remainingMs||0)/60000)+' min</span><div class="football-admin-match-actions"><button data-live-result="yes" data-qid="'+esc(q.id)+'">Yes wins</button><button data-live-result="no" data-qid="'+esc(q.id)+'">No wins</button><button data-live-action="refund" data-qid="'+esc(q.id)+'">Refund</button><button data-live-action="delete" data-qid="'+esc(q.id)+'">Delete</button></div></div>'}).join(''):'<span class="muted small-text">No live questions.</span>')+'</div></article>'}).join('');
    list.querySelectorAll('[data-football-action]').forEach(function(btn){btn.onclick=function(){matchAction(btn.dataset.id,btn.dataset.footballAction)}});
    list.querySelectorAll('[data-football-result]').forEach(function(btn){btn.onclick=function(){matchAction(btn.dataset.id,'set_result',btn.dataset.footballResult)}});
    list.querySelectorAll('[data-football-delete-match]').forEach(function(btn){btn.onclick=function(){deleteMatch(btn.dataset.footballDeleteMatch)}});
    list.querySelectorAll('[data-live-form]').forEach(function(form){form.onsubmit=function(event){createLiveQuestion(event,form)}});
    list.querySelectorAll('[data-score-form]').forEach(function(form){form.onsubmit=function(event){saveMatchScore(event,form)}});
    list.querySelectorAll('[data-live-result]').forEach(function(btn){btn.onclick=function(){liveQuestionAction(btn.dataset.qid,'resolve',btn.dataset.liveResult)}});
    list.querySelectorAll('[data-live-action]').forEach(function(btn){btn.onclick=function(){liveQuestionAction(btn.dataset.qid,btn.dataset.liveAction)}});
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

  async function createTeam(event){
    event.preventDefault();var status=document.getElementById('footballAdminStatus');
    try{var name=document.getElementById('footballTeamName').value;if(status)status.textContent='Creating team...';var response=await fetch('/admin/api/football-teams',{method:'POST',credentials:'same-origin',headers:{'content-type':'application/json'},body:JSON.stringify({name:name})});var json=await response.json();if(!response.ok)throw new Error(json.error||'Create team failed');teams=json.teams||[];renderTeams();document.getElementById('footballTeamName').value='';if(status)status.textContent='Team created'}catch(error){if(status)status.textContent=error.message||'Create team failed'}
  }
  async function deleteTeam(id){
    var status=document.getElementById('footballAdminStatus');if(!confirm('Delete this team and cancel its matches? Active predictions will be refunded.'))return;
    try{if(status)status.textContent='Deleting team...';var response=await fetch('/admin/api/football-teams/'+encodeURIComponent(id),{method:'DELETE',credentials:'same-origin'});var json=await response.json();if(!response.ok)throw new Error(json.error||'Delete failed');teams=json.teams||[];renderTeams();if(status)status.textContent='Team deleted'}catch(error){if(status)status.textContent=error.message||'Delete failed'}
  }
  async function saveMatchScore(event,form){
    event.preventDefault();var status=document.getElementById('footballAdminStatus');
    try{var fd=new FormData(form),id=form.getAttribute('data-score-form');if(status)status.textContent='Saving goals...';var response=await fetch('/admin/api/football-matches/'+encodeURIComponent(id)+'/action',{method:'POST',credentials:'same-origin',headers:{'content-type':'application/json'},body:JSON.stringify({action:'score',teamAGoals:fd.get('teamAGoals'),teamBGoals:fd.get('teamBGoals')})});var json=await response.json();if(!response.ok)throw new Error(json.error||'Save goals failed');if(status)status.textContent='Goals saved';loadFootballAdmin()}catch(error){if(status)status.textContent=error.message||'Save goals failed'}
  }
  async function createLiveQuestion(event,form){
    event.preventDefault();var status=document.getElementById('footballAdminStatus');
    try{var fd=new FormData(form),id=form.getAttribute('data-live-form');if(status)status.textContent='Creating live question...';var response=await fetch('/admin/api/football-matches/'+encodeURIComponent(id)+'/live-questions',{method:'POST',credentials:'same-origin',headers:{'content-type':'application/json'},body:JSON.stringify({question:fd.get('question'),timerMinutes:fd.get('minutes')})});var json=await response.json();if(!response.ok)throw new Error(json.error||'Create live question failed');if(status)status.textContent='Live question created';loadFootballAdmin()}catch(error){if(status)status.textContent=error.message||'Create live question failed'}
  }
  async function liveQuestionAction(id,action,result){
    var status=document.getElementById('footballAdminStatus');
    if(action==='delete'&&!confirm('Delete this live question? Active answers will be refunded.'))return;
    try{if(status)status.textContent='Updating live question...';var response=await fetch('/admin/api/football-live-questions/'+encodeURIComponent(id)+'/action',{method:'POST',credentials:'same-origin',headers:{'content-type':'application/json'},body:JSON.stringify({action:action,result:result})});var json=await response.json();if(!response.ok)throw new Error(json.error||'Update live question failed');if(status)status.textContent='Live question updated';loadFootballAdmin()}catch(error){if(status)status.textContent=error.message||'Update live question failed'}
  }
  async function createMatch(event){
    event.preventDefault();var status=document.getElementById('footballAdminStatus');
    try{
      var date=document.getElementById('footballMatchDate').value,start=document.getElementById('footballMatchStart').value,end=document.getElementById('footballMatchEnd').value;
      var payload={teamAId:document.getElementById('footballTeamA').value,teamBId:document.getElementById('footballTeamB').value,startsAt:localDateTimeToIso(date,start,'Start time is required'),endsAt:end?localDateTimeToIso(date,end,'Invalid end time'):'',status:document.getElementById('footballMatchStatus').value,featured:document.getElementById('footballMatchFeatured').checked,teamAGoals:document.getElementById('footballMatchTeamAGoals').value,teamBGoals:document.getElementById('footballMatchTeamBGoals').value};
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
  async function deleteMatch(id){
    var status=document.getElementById('footballAdminStatus');if(!confirm('Permanently delete this match, its predictions and live questions? Active stakes will be refunded.'))return;
    try{if(status)status.textContent='Deleting match...';var response=await fetch('/admin/api/football-matches/'+encodeURIComponent(id),{method:'DELETE',credentials:'same-origin'});var json=await response.json();if(!response.ok)throw new Error(json.error||'Delete failed');if(status)status.textContent='Match deleted';loadFootballAdmin()}catch(error){if(status)status.textContent=error.message||'Delete failed'}
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