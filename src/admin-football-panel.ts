export const ADMIN_FOOTBALL_PANEL_SCRIPT = `
<style>
.football-admin{margin-top:24px;padding-top:16px;border-top:1px solid rgba(255,255,255,.09);display:grid;gap:16px}
.football-admin *{box-sizing:border-box}
.football-admin-hero{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;padding:16px;border:1px solid rgba(255,255,255,.12);border-radius:24px;background:linear-gradient(135deg,rgba(34,197,94,.14),rgba(59,130,246,.08)),rgba(255,255,255,.035);box-shadow:0 18px 55px rgba(0,0,0,.22),inset 0 1px 0 rgba(255,255,255,.08)}
.football-admin-hero h2{margin:0 0 5px;font-size:22px;letter-spacing:-.02em}.football-admin-hero p{margin:0;line-height:1.5}
.football-admin-card{padding:14px;border:1px solid rgba(255,255,255,.11);border-radius:22px;background:rgba(255,255,255,.035);box-shadow:inset 0 1px 0 rgba(255,255,255,.06)}
.football-admin-card-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:12px}.football-admin-card-head h3{margin:0;font-size:16px}.football-admin-card-head p{margin:3px 0 0;color:rgba(255,255,255,.55);font-size:11px;line-height:1.4}
.football-admin-list{display:grid;gap:11px;margin-top:12px}
.football-admin-row{display:grid;grid-template-columns:64px 1fr;gap:12px;padding:12px;border:1px solid rgba(255,255,255,.08);border-radius:18px;background:rgba(0,0,0,.18)}
.football-admin-logo{width:64px;height:64px;border-radius:20px;background:rgba(255,255,255,.055);background-position:center;background-size:contain;background-repeat:no-repeat;box-shadow:inset 0 1px 0 rgba(255,255,255,.11),0 8px 20px rgba(0,0,0,.16)}
.football-admin-fields{display:grid;gap:8px}.football-admin-fields b{font-size:13px;color:#fff}.football-admin-fields input,.football-admin-fields select,.football-admin-match-form input,.football-admin-match-form select,.football-admin-live-form input,.football-admin-score-form input{width:100%;height:38px!important;border-radius:14px!important;padding:9px 10px!important;font-size:12px!important;background:#050505;color:#fff;border:1px solid rgba(255,255,255,.16);outline:none}.football-admin-fields input:focus,.football-admin-fields select:focus,.football-admin-match-form input:focus,.football-admin-match-form select:focus,.football-admin-live-form input:focus,.football-admin-score-form input:focus{border-color:rgba(34,197,94,.55);box-shadow:0 0 0 3px rgba(34,197,94,.12)}
.football-admin button{min-height:36px;border-radius:999px;border:1px solid rgba(255,255,255,.16);background:#070707;color:#fff;font-weight:900;font-size:11px;padding:0 13px;cursor:pointer}.football-admin button:hover{border-color:rgba(34,197,94,.48);background:rgba(34,197,94,.12)}.football-admin .primary{border-color:rgba(34,197,94,.55);background:linear-gradient(135deg,#16a34a,#22c55e);color:#04130a}.football-admin .secondary{background:rgba(255,255,255,.07)}.football-admin .danger{border-color:rgba(255,77,109,.5);background:rgba(255,77,109,.12);color:#ffd6df}.football-admin .danger:hover{background:rgba(255,77,109,.18);border-color:rgba(255,77,109,.75)}
.football-admin-status{min-height:15px;color:rgba(255,255,255,.58);font-size:11px;margin:0}
.football-admin-match-form{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.football-admin-match-form label{display:grid;gap:6px;font-size:10px;color:rgba(255,255,255,.58);font-weight:900;text-transform:uppercase;letter-spacing:.04em}.football-admin-match-form button,.football-admin-match-form .wide{grid-column:1/-1}.football-admin-check{display:flex!important;align-items:center;gap:8px;text-transform:none!important;letter-spacing:0!important;font-size:12px!important;color:rgba(255,255,255,.8)!important}.football-admin-check input{width:16px!important;height:16px!important;padding:0!important}
.football-admin-match-row{display:grid;gap:11px;padding:13px;border:1px solid rgba(255,255,255,.09);border-radius:20px;background:linear-gradient(180deg,rgba(255,255,255,.045),rgba(255,255,255,.02));font-size:12px}.football-admin-match-title{display:flex;align-items:flex-start;justify-content:space-between;gap:10px}.football-admin-match-title b{font-size:14px}.football-admin-pill{display:inline-flex;align-items:center;border-radius:999px;padding:4px 9px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.1);color:rgba(255,255,255,.72);font-size:10px;font-weight:900;text-transform:uppercase}.football-admin-match-actions{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px}.football-admin-live-form,.football-admin-score-form{display:grid;grid-template-columns:1fr 1fr auto;gap:7px}.football-admin-live-form{grid-template-columns:1fr 86px auto}.football-admin-live-list{display:grid;gap:6px}.football-admin-live-row{display:grid;gap:7px;padding:9px;border-radius:14px;background:rgba(255,255,255,.045);border:1px solid rgba(255,255,255,.07)}
@media(max-width:560px){.football-admin-hero,.football-admin-card-head,.football-admin-match-title{display:grid}.football-admin-match-form,.football-admin-score-form,.football-admin-live-form,.football-admin-match-actions{grid-template-columns:1fr}.football-admin-row{grid-template-columns:54px 1fr}.football-admin-logo{width:54px;height:54px}}
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
      section.innerHTML='<div class="football-admin"><div class="football-admin-hero"><div><h2>Football / Predict</h2><p class="muted small-text">Match creation is now separate from team logo management, with clearer actions for each match.</p></div><button class="ghost secondary" id="refreshFootballAdmin">Refresh data</button></div><section class="football-admin-card"><div class="football-admin-card-head"><div><h3>Create Match</h3><p>Select teams, schedule kick-off, set initial score and publish the match.</p></div></div><form id="footballMatchForm" class="football-admin-match-form"><label>Team A<select id="footballTeamA"></select></label><label>Team B<select id="footballTeamB"></select></label><label>Date<input id="footballMatchDate" type="date"/></label><label>Start Time<input id="footballMatchStart" type="time"/></label><label>End Time (optional)<input id="footballMatchEnd" type="time"/></label><label>Status<select id="footballMatchStatus"><option value="open">Open</option><option value="locked">Locked / Live</option></select></label><label>Team A goals<input id="footballMatchTeamAGoals" type="number" min="0" value="0"/></label><label>Team B goals<input id="footballMatchTeamBGoals" type="number" min="0" value="0"/></label><label class="wide football-admin-check"><input id="footballMatchFeatured" type="checkbox"/> Featured match</label><button class="primary" type="submit">Create Match</button></form></section><section class="football-admin-card"><div class="football-admin-card-head"><div><h3>Matches</h3><p>Save scores, lock matches, settle winners, refunds, and live questions.</p></div></div><div id="footballMatchList" class="football-admin-list"><div class="empty">Loading matches...</div></div></section><section class="football-admin-card"><div class="football-admin-card-head"><div><h3>Team Logos</h3><p>Create teams and upload logos here, separate from match creation.</p></div></div><form id="footballTeamForm" class="football-admin-match-form"><label class="wide">New team name<input id="footballTeamName" type="text" placeholder="Team name"/></label><button class="primary" type="submit">Create Team</button></form><div id="footballAdminList" class="football-admin-list"><div class="empty">Loading teams...</div></div></section><p id="footballAdminStatus" class="football-admin-status"></p></div>'; 
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
    list.innerHTML=matches.map(function(m){var qs=m.liveQuestions||[];return '<article class="football-admin-match-row"><div class="football-admin-match-title"><div><b>'+esc(teamName(m.teamAId))+' vs '+esc(teamName(m.teamBId))+'</b><div class="muted small-text">'+esc(localMatchTime(m.startsAt))+(m.result?' · result '+esc(m.result):'')+'</div></div><span class="football-admin-pill">'+esc(m.status||'open')+'</span></div><form class="football-admin-score-form" data-score-form="'+esc(m.id)+'"><input name="teamAGoals" type="number" min="0" value="'+esc(m.teamAGoals||0)+'" placeholder="'+esc(teamName(m.teamAId))+' goals"/><input name="teamBGoals" type="number" min="0" value="'+esc(m.teamBGoals||0)+'" placeholder="'+esc(teamName(m.teamBId))+' goals"/><button class="secondary" type="submit">Save goals</button></form><div class="football-admin-match-actions"><button data-football-action="lock" data-id="'+esc(m.id)+'">Lock Now</button><button data-football-result="team_a" data-id="'+esc(m.id)+'">Team A Won</button><button data-football-result="draw" data-id="'+esc(m.id)+'">Draw</button><button data-football-result="team_b" data-id="'+esc(m.id)+'">Team B Won</button><button data-football-action="refund" data-id="'+esc(m.id)+'">Refund All</button><button class="danger" data-football-delete-match="'+esc(m.id)+'">Delete Match</button></div><form class="football-admin-live-form" data-live-form="'+esc(m.id)+'"><input name="question" placeholder="Live question"/><input name="minutes" type="number" min="1" value="10"/><button class="secondary" type="submit">Add</button></form><div class="football-admin-live-list">'+(qs.length?qs.map(function(q){return '<div class="football-admin-live-row"><span>'+esc(q.question)+' · '+esc(q.status||'open')+' · '+Math.ceil((q.remainingMs||0)/60000)+' min</span><div class="football-admin-match-actions"><button data-live-result="yes" data-qid="'+esc(q.id)+'">Yes wins</button><button data-live-result="no" data-qid="'+esc(q.id)+'">No wins</button><button data-live-action="refund" data-qid="'+esc(q.id)+'">Refund</button><button class="danger" data-live-action="delete" data-qid="'+esc(q.id)+'">Delete</button></div></div>'}).join(''):'<span class="muted small-text">No live questions.</span>')+'</div></article>'}).join('');
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