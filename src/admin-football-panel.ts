export const ADMIN_FOOTBALL_PANEL_SCRIPT = `
<style>
.football-admin{margin-top:24px;padding-top:16px;border-top:1px solid rgba(255,255,255,.09)}
.football-admin-list{display:grid;gap:11px;margin-top:12px}
.football-admin-row{display:grid;grid-template-columns:58px 1fr;gap:10px;padding:11px 0;border-top:1px solid rgba(255,255,255,.08)}
.football-admin-logo{width:58px;height:58px;border-radius:18px;background:rgba(255,255,255,.045);background-position:center;background-size:contain;background-repeat:no-repeat;box-shadow:inset 0 1px 0 rgba(255,255,255,.09)}
.football-admin-fields{display:grid;gap:7px}.football-admin-fields b{font-size:13px;color:#fff}.football-admin-fields input{height:auto!important;border-radius:14px!important;padding:8px!important;font-size:11px!important;background:#050505;color:#fff;border:1px solid rgba(255,255,255,.16)}
.football-admin-fields button{height:32px;border-radius:999px;border:1px solid rgba(255,255,255,.16);background:#070707;color:#fff;font-weight:900;font-size:11px}
.football-admin-status{min-height:15px;color:rgba(255,255,255,.55);font-size:11px;margin-top:8px}
</style>
<script>
(function(){
  var teams=[];
  function esc(value){return String(value==null?'':value).replace(/[&<>]/g,function(char){return {'&':'&amp;','<':'&lt;','>':'&gt;'}[char]||char})}
  function withVersion(url){return url ? url + (url.indexOf('?')>=0 ? '&' : '?') + 't=' + Date.now() : ''}
  function activate(button){
    document.querySelectorAll('.menu-item').forEach(function(item){item.classList.toggle('active',item===button)});
    document.querySelectorAll('.admin-section').forEach(function(section){section.classList.toggle('active',section.id==='sectionFootballAdmin')});
    var title=document.getElementById('adminTitle'),sub=document.getElementById('adminSubtitle'),menu=document.getElementById('adminMenu');
    if(title)title.textContent='Football';
    if(sub)sub.textContent='Upload team logos for Football Predict.';
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
      button.innerHTML='<strong>Football</strong><span>Team logos</span>';
      menu.appendChild(button);
      button.onclick=function(){activate(button)};
    }
    if(main&&!document.getElementById('sectionFootballAdmin')){
      var section=document.createElement('section');
      section.className='section admin-section';
      section.id='sectionFootballAdmin';
      section.innerHTML='<div class="football-admin"><div class="row-title"><div><h2>Football Team Logos</h2><p class="muted small-text">Upload logos/flags used in the Football Predict UI.</p></div><button class="ghost" id="refreshFootballAdmin">Refresh</button></div><div id="footballAdminList" class="football-admin-list"><div class="empty">Loading...</div></div><p id="footballAdminStatus" class="football-admin-status"></p></div>';
      main.appendChild(section);
      document.getElementById('refreshFootballAdmin').onclick=loadFootballAdmin;
    }
  }
  function render(){
    var list=document.getElementById('footballAdminList');if(!list)return;
    list.innerHTML=teams.map(function(team){
      var bg=team.logoUrl?' style="background-image:url('+esc(withVersion(team.logoUrl))+')"':'';
      return '<article class="football-admin-row"><div class="football-admin-logo"'+bg+'></div><div class="football-admin-fields"><b>'+esc(team.name)+'</b><input data-football-file="'+esc(team.id)+'" type="file" accept="image/png,image/jpeg,image/webp,.png,.jpg,.jpeg,.webp"/><button data-football-upload="'+esc(team.id)+'">Upload logo</button></div></article>';
    }).join('');
    list.querySelectorAll('[data-football-upload]').forEach(function(button){button.onclick=function(){uploadFootballLogo(button.dataset.footballUpload)}});
  }
  async function loadFootballAdmin(){
    var status=document.getElementById('footballAdminStatus');if(status)status.textContent='Loading...';
    try{
      var response=await fetch('/admin/api/football-teams',{credentials:'same-origin',cache:'no-store'});
      var json=await response.json();
      if(!response.ok)throw new Error(json.error||'Load failed');
      teams=json.teams||[];render();if(status)status.textContent='Loaded';
    }catch(error){if(status)status.textContent=error.message||'Load failed'}
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
      teams=json.teams||[];render();if(status)status.textContent='Uploaded';
    }catch(error){if(status)status.textContent=error.message||'Upload failed'}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
  document.addEventListener('click',function(){setTimeout(mount,80)},true);
})();
</script>
`;