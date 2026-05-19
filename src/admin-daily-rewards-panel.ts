export const ADMIN_DAILY_REWARDS_PANEL_SCRIPT = `<script>
(function(){
  var dayNames=['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
  var state={definitions:[],settings:null,day:0};
  function q(id){return document.getElementById(id)}
  function el(tag,cls){var node=document.createElement(tag);if(cls)node.className=cls;return node}
  function ensurePanel(){
    var menu=document.querySelector('.menu-panel');
    var sections=document.querySelector('.admin-section')&&document.querySelector('.admin-section').parentNode;
    if(!menu||!sections||q('sectionDailyRewards'))return;
    var btn=document.createElement('button');
    btn.className='menu-item';
    btn.type='button';
    btn.dataset.section='DailyRewards';
    btn.innerHTML='<strong>Daily Rewards</strong><span>Missions</span>';
    menu.appendChild(btn);
    var section=document.createElement('section');
    section.id='sectionDailyRewards';
    section.className='admin-section';
    section.hidden=true;
    section.innerHTML='<div class="row-title"><div><h2>Daily Rewards</h2><p class="muted small-text">Choose 6 missions for each day and set custom XP.</p></div><button id="dailyRewardsSave" class="primary" type="button">Save</button></div><div id="dailyRewardsDayTabs" class="daily-rewards-admin-tabs"></div><div id="dailyRewardsEditor" class="daily-rewards-admin-editor"></div><p id="dailyRewardsAdminStatus" class="status"></p>';
    sections.appendChild(section);
    btn.addEventListener('click',function(ev){ev.preventDefault();ev.stopPropagation();showPanel(btn);load();},true);
    q('dailyRewardsSave').addEventListener('click',save);
    injectStyle();
  }
  function showPanel(btn){
    document.querySelectorAll('.admin-section').forEach(function(section){section.hidden=true;section.classList.remove('active')});
    var panel=q('sectionDailyRewards');
    if(panel){panel.hidden=false;panel.classList.add('active')}
    document.querySelectorAll('.menu-item').forEach(function(item){item.classList.remove('active')});
    if(btn)btn.classList.add('active');
  }
  function injectStyle(){
    if(q('dailyRewardsAdminStyle'))return;
    var style=document.createElement('style');
    style.id='dailyRewardsAdminStyle';
    style.textContent='.daily-rewards-admin-tabs{display:flex;gap:6px;overflow-x:auto;margin:8px 0 14px;padding-bottom:8px;scrollbar-width:none}.daily-rewards-admin-tabs::-webkit-scrollbar{display:none}.daily-rewards-admin-tabs button{flex:0 0 auto;height:34px;border:1px solid rgba(255,255,255,.13);border-radius:999px;background:#080808;color:#fff;padding:0 11px;font-size:11px;font-weight:800}.daily-rewards-admin-tabs button.active{background:#fff;color:#050505;border-color:#fff}.daily-rewards-admin-editor{display:grid;gap:9px}.daily-rewards-admin-slot{display:grid;grid-template-columns:minmax(0,1fr) 82px;gap:8px;align-items:end;padding:10px;border-radius:18px;background:rgba(255,255,255,.045);box-shadow:inset 0 1px 0 rgba(255,255,255,.08)}.daily-rewards-admin-slot label{display:block;font-size:9px;font-weight:850;color:rgba(255,255,255,.5);text-transform:uppercase;letter-spacing:.08em;margin-bottom:6px}.daily-rewards-admin-slot select,.daily-rewards-admin-slot input{width:100%;height:36px;border:1px solid rgba(255,255,255,.12);border-radius:13px;background:#050505;color:#fff;padding:0 10px;font-size:12px;font-weight:700}.daily-rewards-admin-help{grid-column:1/-1;margin:-1px 0 0;color:rgba(255,255,255,.48);font-size:10px;line-height:1.25}.daily-rewards-admin-help b{color:rgba(255,255,255,.75)}';
    document.head.appendChild(style);
  }
  async function load(){
    var status=q('dailyRewardsAdminStatus');
    if(status)status.textContent='Loading Daily Rewards...';
    try{
      var res=await fetch('/admin/api/daily-rewards/missions',{credentials:'same-origin'});
      var json=await res.json();
      if(!res.ok)throw new Error(json.error||'Could not load Daily Rewards');
      state.definitions=json.definitions||[];
      state.settings=json.settings||{days:[]};
      renderTabs();
      renderEditor();
      if(status)status.textContent='';
    }catch(error){if(status)status.textContent=error.message||'Could not load Daily Rewards'}
  }
  function renderTabs(){
    var wrap=q('dailyRewardsDayTabs');if(!wrap)return;
    wrap.innerHTML='';
    dayNames.forEach(function(name,index){
      var b=document.createElement('button');
      b.type='button';
      b.className=index===state.day?'active':'';
      b.textContent=name.slice(0,3);
      b.onclick=function(){state.day=index;renderTabs();renderEditor()};
      wrap.appendChild(b);
    });
  }
  function dayConfig(){
    if(!state.settings)state.settings={days:[]};
    if(!Array.isArray(state.settings.days))state.settings.days=[];
    var day=state.settings.days.find(function(item){return Number(item.day)===state.day});
    if(!day){day={day:state.day,missions:[]};state.settings.days.push(day)}
    if(!Array.isArray(day.missions))day.missions=[];
    while(day.missions.length<6){var def=state.definitions[day.missions.length%Math.max(1,state.definitions.length)];day.missions.push({missionId:def?def.id:'open_app',xp:def?def.defaultXp:50})}
    return day;
  }
  function renderEditor(){
    var box=q('dailyRewardsEditor');if(!box||!state.definitions.length)return;
    var day=dayConfig();
    box.innerHTML='';
    for(var i=0;i<6;i++){
      var slot=day.missions[i];
      var def=definition(slot.missionId)||state.definitions[0];
      var row=el('div','daily-rewards-admin-slot');
      var left=el('div');
      var right=el('div');
      left.innerHTML='<label>Mission '+(i+1)+'</label>';
      var select=document.createElement('select');
      select.dataset.index=String(i);
      state.definitions.forEach(function(item){
        var opt=document.createElement('option');
        opt.value=item.id;
        opt.textContent=item.title+' · '+item.type;
        if(item.id===slot.missionId)opt.selected=true;
        select.appendChild(opt);
      });
      select.onchange=function(){var index=Number(this.dataset.index);var selected=definition(this.value);day.missions[index].missionId=this.value;if(selected)day.missions[index].xp=selected.defaultXp;renderEditor()};
      left.appendChild(select);
      right.innerHTML='<label>XP</label>';
      var input=document.createElement('input');
      input.type='number';input.min='1';input.max='5000';input.step='1';input.value=String(slot.xp||def.defaultXp||50);input.dataset.index=String(i);
      input.oninput=function(){var index=Number(this.dataset.index);day.missions[index].xp=Math.max(1,Math.min(5000,Math.floor(Number(this.value)||1)))};
      right.appendChild(input);
      var help=el('p','daily-rewards-admin-help');
      help.innerHTML='<b>'+escapeHtml(def.title)+'</b> — '+escapeHtml(def.description)+' <span>Default XP: '+def.defaultXp+'</span>';
      row.appendChild(left);row.appendChild(right);row.appendChild(help);box.appendChild(row);
    }
  }
  function definition(id){return state.definitions.find(function(item){return item.id===id})}
  async function save(){
    var status=q('dailyRewardsAdminStatus');
    if(status)status.textContent='Saving Daily Rewards...';
    try{
      normalizeBeforeSave();
      var res=await fetch('/admin/api/daily-rewards/settings',{method:'POST',credentials:'same-origin',headers:{'content-type':'application/json'},body:JSON.stringify(state.settings)});
      var json=await res.json();
      if(!res.ok)throw new Error(json.error||'Could not save Daily Rewards');
      state.settings=json.settings;
      renderEditor();
      if(status)status.textContent='Daily Rewards saved.';
    }catch(error){if(status)status.textContent=error.message||'Could not save Daily Rewards'}
  }
  function normalizeBeforeSave(){
    var currentDay=state.day;
    for(var day=0;day<7;day++){
      state.day=day;
      var cfg=dayConfig();
      cfg.missions=cfg.missions.slice(0,6).map(function(slot){var def=definition(slot.missionId)||state.definitions[0];return{missionId:def.id,xp:Math.max(1,Math.min(5000,Math.floor(Number(slot.xp)||def.defaultXp||50)))}});
    }
    state.day=currentDay;
  }
  function escapeHtml(value){return String(value||'').replace(/[&<>]/g,function(ch){return {'&':'&amp;','<':'&lt;','>':'&gt;'}[ch]||ch})}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ensurePanel);else ensurePanel();
})();
</script>`;