export const ADMIN_TON_PANEL_SCRIPT = `<script>
(function(){
  const NANO=1000000000;
  let totalTonBalanceNano=0;
  const asNano=(v)=>Math.max(0,Math.floor(Number(v)||0));
  const inputNano=(v)=>Math.floor(Math.max(0,Number(String(v||'').replace(',','.'))||0)*NANO);
  const ton=(v)=>{const n=asNano(v)/NANO;return n.toFixed(3).replace(/\\.0+$/,'').replace(/(\\.\\d*?)0+$/,'$1')+' TON'};
  const balanceOf=(u)=>asNano((u&&u.tonBalanceNano)!=null?u.tonBalanceNano:(u&&u.credit));

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
    usersList.innerHTML=rows.map(u=>'<article class="user" id="'+userRowId(u.id)+'"><div class="user-top"><div class="user-name"><b>'+esc(u.username||'—')+'</b><span class="badge '+(u.isActive?'on':'off')+'">'+esc(u.status)+'</span></div><strong>'+esc(u.tonBalance||ton(balanceOf(u)))+'</strong></div><div class="user-info"><span>ID '+esc(u.id)+'</span><span>'+esc(u.firstName||'—')+'</span><span>'+esc(u.currentSection||'unknown')+'</span><span>'+ago(u.lastSeenAt)+'</span></div><button class="manage-btn" data-manage-user="'+esc(u.id)+'" type="button">Manage user</button><div class="user-manage" data-manage-panel="'+esc(u.id)+'" hidden></div></article>').join('');
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
      const r=await fetch('/admin/api/user-controls?userId='+encodeURIComponent(userId),{credentials:'same-origin',cache:'no-store'}),c=await r.json();
      if(!r.ok)throw new Error(c.error||'Could not load controls');
      const user=adminUsers.find(u=>String(u.id)===String(userId))||{};
      const current=asNano(c.tonBalanceNano??balanceOf(user));
      if(user&&current!==balanceOf(user))updateUserBalanceUi(userId,current);
      const blocked=new Set(c.blockedSections||[]);
      panel.innerHTML='<div class="mini-status">Current TON: <b data-current-ton>'+ton(current)+'</b></div><div class="credit-tools"><button data-ton-minus>-</button><input data-ton-value type="number" min="0" step="0.001" placeholder="TON amount" value=""/><button data-ton-plus>+</button></div><div class="section-user-blocks">'+Object.keys(sectionLabels).map(id=>'<button class="section-block '+(blocked.has(id)?'blocked':'')+'" data-user-section="'+id+'">'+sectionLabels[id]+' '+(blocked.has(id)?'Blocked':'Open')+'</button>').join('')+'</div><p class="mini-status" data-user-status></p>';
      panel.querySelector('[data-ton-minus]').onclick=()=>adjustCredit(userId,-inputNano(panel.querySelector('[data-ton-value]').value));
      panel.querySelector('[data-ton-plus]').onclick=()=>adjustCredit(userId,inputNano(panel.querySelector('[data-ton-value]').value));
      panel.querySelectorAll('[data-user-section]').forEach(btn=>btn.onclick=()=>blockSection(userId,btn.getAttribute('data-user-section'),!btn.classList.contains('blocked')));
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
  setCredit=function(){};
  patchLabels();
  setTimeout(loadUsers,0);
})();
</script>`;
