export const ADMIN_TON_PANEL_SCRIPT = `<script>
(function(){
  const NANO=1000000000;
  let totalTonBalanceNano=0;
  const asNano=(v)=>Math.max(0,Math.floor(Number(v)||0));
  const inputNano=(v)=>Math.floor(Math.max(0,Number(String(v||'').replace(',','.'))||0)*NANO);
  const ton=(v)=>{const n=asNano(v)/NANO;return n.toFixed(3).replace(/\\.0+$/,'').replace(/(\\.\\d*?)0+$/,'$1')+' TON'};
  const balanceOf=(u)=>asNano((u&&u.tonBalanceNano)!=null?u.tonBalanceNano:(u&&u.credit));
  const levelLine=(u)=>'Level '+esc((u&&u.level)||1)+' · '+esc((u&&u.rankName)||'Starter');
  const formatLeft=(ms)=>{ms=Math.max(0,Math.floor(Number(ms)||0));const d=Math.floor(ms/86400000),h=Math.floor(ms/3600000)%24,m=Math.floor(ms/60000)%60,sec=Math.floor(ms/1000)%60;return d+'d '+String(h).padStart(2,'0')+':'+String(m).padStart(2,'0')+':'+String(sec).padStart(2,'0')};
  const tickCountdowns=()=>document.querySelectorAll('[data-expires-at]').forEach(el=>{el.textContent=formatLeft(Date.parse(el.getAttribute('data-expires-at')||'')-Date.now())});
  const expiresFromDays=(panel)=>{const n=Number(panel.querySelector('[data-block-days]')?.value||0);return n>0?new Date(Date.now()+n*86400000).toISOString():null};
  Object.assign(sectionLabels,{home:'Home',playzone:'Play Zone',plinko:'Plinko',mines:'Mines',crash:'Crash',wheel:'Wheel',dice:'Dice',limbo:'Limbo',slot:'Slot',tower:'Tower',coinflip:'Coin Flip',hilo:'Hi-Lo',ghostrun:'Ghost Run'});
  setInterval(tickCountdowns,1000);

  function patchLabels(){
    const title=document.querySelector('#sectionUsers .small-text');
    if(title) title.textContent='Manage TON balance and section access for each user.';
    const stat=document.getElementById('statCredit');
    if(stat&&stat.previousElementSibling) stat.previousElementSibling.textContent='TON';
  }
  function userRowId(userId){return 'user-'+String(userId).replace(/[^a-zA-Z0-9_-]/g,'')}
  function setTotalTon(value){totalTonBalanceNano=asNano(value);const stat=document.getElementById('statCredit');if(stat)stat.textContent=ton(totalTonBalanceNano)}
  function updateUserBalanceUi(userId,valueNano){
    const value=asNano(valueNano),shown=ton(value);
    const user=adminUsers.find(u=>String(u.id)===String(userId));
    const before=user?balanceOf(user):0;
    if(user){user.tonBalanceNano=value;user.tonBalance=shown;user.credit=value}
    const row=document.getElementById(userRowId(userId)),node=row&&row.querySelector('.user-top>strong');
    if(node)node.textContent=shown;
    const current=row&&row.querySelector('[data-current-ton]');
    if(current)current.textContent=shown;
    setTotalTon(Math.max(0,totalTonBalanceNano+(value-before)));
    return shown;
  }

  renderUsers=function(){
    patchLabels();
    const q=userQuery.trim().toLowerCase();
    const rows=adminUsers.filter(u=>!q||String(u.id).toLowerCase().includes(q)||String(u.username).toLowerCase().includes(q)||String(u.firstName).toLowerCase().includes(q)||String(u.currentSection).toLowerCase().includes(q));
    if(!rows.length){usersList.innerHTML='<div class="empty">No users found.</div>';return}
    usersList.innerHTML=rows.map(u=>'<article class="user" id="'+userRowId(u.id)+'"><div class="user-top"><div class="user-name"><b>'+esc(u.username||'—')+'</b><span class="badge '+(u.isActive?'on':'off')+'">'+esc(u.status)+'</span></div><strong>'+esc(u.tonBalance||ton(balanceOf(u)))+'</strong></div><div class="user-info"><span>ID '+esc(u.id)+'</span><span>'+esc(u.firstName||'—')+'</span><span>'+esc(u.currentSection||'unknown')+'</span><span>'+ago(u.lastSeenAt)+'</span><span>'+levelLine(u)+'</span></div><button class="manage-btn" data-manage-user="'+esc(u.id)+'" type="button">Manage user</button><div class="user-manage" data-manage-panel="'+esc(u.id)+'" hidden></div></article>').join('');
    document.querySelectorAll('[data-manage-user]').forEach(btn=>btn.onclick=()=>toggleUserManage(btn.getAttribute('data-manage-user')))
  };

  loadUsers=async function(){
    usersStatus.textContent='Loading users...';
    try{
      const r=await fetch('/admin/api/users',{credentials:'same-origin',cache:'no-store'}),j=await r.json().catch(()=>({error:'Invalid response'}));
      if(!r.ok)throw new Error(j.error||'Could not load users');
      adminUsers=j.users||[];
      document.getElementById('statTotal').textContent=String(j.stats?.total??adminUsers.length);
      document.getElementById('statOnline').textContent=String(j.stats?.online??0);
      document.getElementById('statInactive').textContent=String(j.stats?.inactive??0);
      setTotalTon(j.stats?.totalTonBalanceNano??j.stats?.totalCredit??adminUsers.reduce((sum,u)=>sum+balanceOf(u),0));
      usersStatus.textContent='Updated '+new Date().toLocaleTimeString();
      renderUsers();
      if(openUser)renderUserControls(openUser);
    }catch(e){usersStatus.textContent=e.message||'Could not load users';usersList.innerHTML='<div class="empty">'+esc(e.message||'Error')+'</div>'}
  };

  renderUserControls=async function(userId){
    const panel=document.querySelector('[data-manage-panel="'+userId+'"]');
    if(!panel)return;
    panel.hidden=false;
    panel.innerHTML='<div class="mini-status">Loading controls...</div>';
    try{
      const [controlsRes,groupsRes]=await Promise.all([
        fetch('/admin/api/user-controls?userId='+encodeURIComponent(userId),{credentials:'same-origin',cache:'no-store'}),
        fetch('/admin/api/user-groups?userId='+encodeURIComponent(userId),{credentials:'same-origin',cache:'no-store'})
      ]);
      const c=await controlsRes.json();
      const g=await groupsRes.json().catch(()=>({groups:[],groupAiDisabled:false}));
      if(!controlsRes.ok)throw new Error(c.error||'Could not load controls');
      const user=adminUsers.find(u=>String(u.id)===String(userId))||{};
      const current=asNano(c.tonBalanceNano??balanceOf(user));
      if(user&&current!==balanceOf(user))updateUserBalanceUi(userId,current);
      const blockMap={};(c.sectionBlocks||[]).forEach(item=>{blockMap[item.sectionId]=item});
      const groups=Array.isArray(g.groups)?g.groups:[];
      const groupsHtml='<div class="user-groups"><div class="mini-status"><b>Groups:</b> '+groups.length+' · AI '+(g.groupAiDisabled?'disabled':'active')+'</div><button class="section-block '+(g.groupAiDisabled?'blocked':'')+'" data-user-groups-ai type="button">'+(g.groupAiDisabled?'Enable all user groups AI':'Disable all user groups AI')+'</button>'+(!groups.length?'<div class="mini-status">No groups found.</div>':groups.map(gr=>'<div class="mini-status" style="border-top:1px solid rgba(255,255,255,.08);padding-top:8px"><b>'+esc(gr.title||gr.username||gr.chatId)+'</b><br/><small>'+esc(gr.chatId)+' · '+ton(gr.tonSpentNano||0)+' · AI '+(gr.aiDisabled?'disabled':'active')+'</small><div class="section-user-blocks"><button class="section-block '+(gr.aiDisabled?'blocked':'')+'" data-group-ai="'+esc(gr.chatId)+'" type="button">'+(gr.aiDisabled?'Enable this group':'Disable this group')+'</button><button class="section-block blocked" data-group-leave="'+esc(gr.chatId)+'" type="button">Remove bot from group</button></div></div>').join(''))+'</div>';
      const winChance=Math.max(0,Math.min(100,Math.round(Number(c.winChancePercent??50))));
      panel.innerHTML='<div class="mini-status">'+levelLine(user)+'</div><div class="mini-status">Current TON: <b data-current-ton>'+ton(current)+'</b></div><div class="credit-tools"><button data-ton-minus>-</button><input data-ton-value type="number" min="0" step="0.001" placeholder="TON amount" value=""/><button data-ton-plus>+</button></div><div class="mini-status"><b>Game win chance:</b> '+winChance+'%</div><div class="credit-tools"><button data-win-chance-preset="0">0%</button><input data-win-chance-value type="number" min="0" max="100" step="1" value="'+winChance+'"/><button data-win-chance-preset="100">100%</button></div><button class="save-credit" data-win-chance-save type="button">Set win chance</button><input data-block-days type="number" min="0" step="0.01" placeholder="Block days, 0 forever"/><div class="section-user-blocks">'+Object.keys(sectionLabels).map(id=>{const b=blockMap[id];return '<div><button class="section-block '+(b?'blocked':'')+'" data-user-section="'+id+'">'+sectionLabels[id]+' '+(b?'Blocked':'Open')+'</button>'+(b?'<small class="mini-status">'+(b.expiresAt?'<span data-expires-at="'+esc(b.expiresAt)+'">'+formatLeft(b.remainingMs)+'</span>':'forever')+'</small>':'')+'</div>'}).join('')+'</div>'+groupsHtml+'<p class="mini-status" data-user-status></p>';
      tickCountdowns();
      panel.querySelector('[data-ton-minus]').onclick=()=>adjustCredit(userId,-inputNano(panel.querySelector('[data-ton-value]').value));
      panel.querySelector('[data-ton-plus]').onclick=()=>adjustCredit(userId,inputNano(panel.querySelector('[data-ton-value]').value));
      panel.querySelectorAll('[data-user-section]').forEach(btn=>btn.onclick=()=>blockSection(userId,btn.getAttribute('data-user-section'),!btn.classList.contains('blocked')));
      panel.querySelectorAll('[data-win-chance-preset]').forEach(btn=>btn.onclick=()=>setWinChance(userId,Number(btn.getAttribute('data-win-chance-preset'))));
      const winSave=panel.querySelector('[data-win-chance-save]');if(winSave)winSave.onclick=()=>setWinChance(userId,Number((panel.querySelector('[data-win-chance-value]')||{}).value));
      const allBtn=panel.querySelector('[data-user-groups-ai]');if(allBtn)allBtn.onclick=()=>setUserGroupsAi(userId,!g.groupAiDisabled);
      panel.querySelectorAll('[data-group-ai]').forEach(btn=>{const gr=groups.find(x=>String(x.chatId)===String(btn.getAttribute('data-group-ai')))||{};btn.onclick=()=>setGroupAi(userId,btn.getAttribute('data-group-ai'),!gr.aiDisabled)});
      panel.querySelectorAll('[data-group-leave]').forEach(btn=>btn.onclick=()=>leaveGroup(userId,btn.getAttribute('data-group-leave')));
    }catch(e){panel.innerHTML='<div class="mini-status">'+esc(e.message||'Could not load controls')+'</div>'}
  };

  adjustCredit=async function(userId,deltaNano){
    const panel=document.querySelector('[data-manage-panel="'+userId+'"]'),status=panel&&panel.querySelector('[data-user-status]');
    if(!deltaNano){if(status)status.textContent='Enter a TON amount first';return}
    if(status)status.textContent='Updating TON balance...';
    try{
      const r=await fetch('/admin/api/users/ton-balance-adjust',{method:'POST',credentials:'same-origin',cache:'no-store',headers:{'content-type':'application/json'},body:JSON.stringify({userId,deltaNano})});
      const j=await r.json().catch(()=>({error:'Invalid response'}));
      if(!r.ok)throw new Error(j.error||'Could not update TON balance');
      const shown=updateUserBalanceUi(userId,j.tonBalanceNano);
      const input=panel&&panel.querySelector('[data-ton-value]');
      if(input)input.value='';
      if(status)status.textContent='TON balance updated: '+shown;
    }catch(e){if(status)status.textContent=e.message||'Could not update TON balance'}
  };

  async function setWinChance(userId,value){
    const panel=document.querySelector('[data-manage-panel="'+userId+'"]'),status=panel&&panel.querySelector('[data-user-status]');
    const winChancePercent=Math.max(0,Math.min(100,Math.round(Number(value)||0)));
    if(status)status.textContent='Saving win chance...';
    try{
      const r=await fetch('/admin/api/users/win-chance',{method:'POST',credentials:'same-origin',cache:'no-store',headers:{'content-type':'application/json'},body:JSON.stringify({userId,winChancePercent})});
      const j=await r.json().catch(()=>({error:'Invalid response'}));
      if(!r.ok)throw new Error(j.error||'Could not update win chance');
      if(status)status.textContent='Win chance saved: '+j.winChancePercent+'%';
      renderUserControls(userId);
    }catch(e){if(status)status.textContent=e.message||'Could not update win chance'}
  }

  blockSection=async function(userId,sectionId,blocked){
    const panel=document.querySelector('[data-manage-panel="'+userId+'"]'),status=panel&&panel.querySelector('[data-user-status]');
    if(status)status.textContent='Saving access...';
    try{
      const expiresAt=blocked?expiresFromDays(panel):null;
      const r=await fetch('/admin/api/users/section-block-timed',{method:'POST',credentials:'same-origin',cache:'no-store',headers:{'content-type':'application/json'},body:JSON.stringify({userId,sectionId,blocked,expiresAt})});
      const j=await r.json().catch(()=>({error:'Invalid response'}));
      if(!r.ok)throw new Error(j.error||'Could not update access');
      if(status)status.textContent='Access updated';
      renderUserControls(userId);
    }catch(e){if(status)status.textContent=e.message||'Could not update access'}
  };
  async function setUserGroupsAi(userId,disabled){const panel=document.querySelector('[data-manage-panel="'+userId+'"]'),status=panel&&panel.querySelector('[data-user-status]');if(status)status.textContent='Saving group AI access...';try{const r=await fetch('/admin/api/users/group-ai-disabled',{method:'POST',credentials:'same-origin',cache:'no-store',headers:{'content-type':'application/json'},body:JSON.stringify({userId,disabled})});const j=await r.json().catch(()=>({error:'Invalid response'}));if(!r.ok)throw new Error(j.error||'Could not update group AI access');renderUserControls(userId)}catch(e){if(status)status.textContent=e.message||'Could not update group AI access'}}
  async function setGroupAi(userId,chatId,disabled){const panel=document.querySelector('[data-manage-panel="'+userId+'"]'),status=panel&&panel.querySelector('[data-user-status]');if(status)status.textContent='Saving group AI access...';try{const r=await fetch('/admin/api/groups/'+encodeURIComponent(chatId)+'/ai-disabled',{method:'POST',credentials:'same-origin',cache:'no-store',headers:{'content-type':'application/json'},body:JSON.stringify({userId,disabled})});const j=await r.json().catch(()=>({error:'Invalid response'}));if(!r.ok)throw new Error(j.error||'Could not update group AI access');renderUserControls(userId)}catch(e){if(status)status.textContent=e.message||'Could not update group AI access'}}
  async function leaveGroup(userId,chatId){const panel=document.querySelector('[data-manage-panel="'+userId+'"]'),status=panel&&panel.querySelector('[data-user-status]');if(status)status.textContent='Removing bot from group...';try{const r=await fetch('/app/api/groups/'+encodeURIComponent(chatId)+'/leave',{method:'DELETE',credentials:'same-origin',cache:'no-store',headers:{'content-type':'application/json'},body:JSON.stringify({userId})});const j=await r.json().catch(()=>({error:'Invalid response'}));if(!r.ok)throw new Error(j.error||(r.status===403?'Forbidden':'Could not remove bot from group'));renderUserControls(userId)}catch(e){if(status)status.textContent=e.message||'Could not remove bot from group'}}
  setCredit=function(){};
  patchLabels();
  setTimeout(loadUsers,0);
})();
</script>`;
