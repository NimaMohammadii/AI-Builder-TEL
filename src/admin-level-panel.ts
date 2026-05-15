export const ADMIN_LEVEL_PANEL_SCRIPT = `<script>
(function(){
  function esc(v){return String(v??'').replace(/[&<>]/g,s=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[s]||s))}
  function userById(userId){try{return (adminUsers||[]).find(u=>String(u.id)===String(userId))||{}}catch(e){return {}}}
  function panelFor(userId){return document.querySelector('[data-manage-panel="'+String(userId).replace(/[^0-9A-Za-z_-]/g,'')+'"]')}
  function appendLevelControls(userId){
    const panel=panelFor(userId);if(!panel||panel.querySelector('[data-level-box]'))return;
    const user=userById(userId);
    const level=Math.max(1,Math.floor(Number(user.level)||1));
    const rank=String(user.rankName||'Rookie');
    const box=document.createElement('div');
    box.setAttribute('data-level-box','1');
    box.innerHTML='<div class="level-admin-box"><div class="mini-status">Level: <b>'+level+'</b> · Rank: <b>'+esc(rank)+'</b></div><div class="credit-tools"><button type="button" data-level-adjust="-1">-1</button><input data-level-value type="number" min="1" max="999" value="'+level+'"/><button type="button" data-level-adjust="1">+1</button></div><button class="save-credit" type="button" data-level-save>Set level</button><p class="mini-status" data-level-status></p></div>';
    const creditTools=panel.querySelector('.credit-tools');
    if(creditTools&&creditTools.parentNode)creditTools.parentNode.insertBefore(box,creditTools);else panel.prepend(box);
    box.querySelectorAll('[data-level-adjust]').forEach(btn=>btn.onclick=()=>adjustLevel(userId,Number(btn.getAttribute('data-level-adjust')||0)));
    box.querySelector('[data-level-save]').onclick=()=>setLevel(userId,Number(box.querySelector('[data-level-value]').value||1));
  }
  async function setLevel(userId,level){
    const panel=panelFor(userId),status=panel&&panel.querySelector('[data-level-status]');if(status)status.textContent='Saving level...';
    try{
      const r=await fetch('/admin/api/users/level-set',{method:'POST',credentials:'same-origin',headers:{'content-type':'application/json'},body:JSON.stringify({userId:userId,level:level})});
      const j=await r.json().catch(()=>({error:'Invalid response'}));if(!r.ok)throw new Error(j.error||'Could not save level');
      if(status)status.textContent='Level saved';await loadUsers();
    }catch(e){if(status)status.textContent=e.message||'Could not save level'}
  }
  async function adjustLevel(userId,deltaLevel){
    const panel=panelFor(userId),status=panel&&panel.querySelector('[data-level-status]');if(status)status.textContent='Adjusting level...';
    try{
      const r=await fetch('/admin/api/users/level-adjust',{method:'POST',credentials:'same-origin',headers:{'content-type':'application/json'},body:JSON.stringify({userId:userId,deltaLevel:deltaLevel})});
      const j=await r.json().catch(()=>({error:'Invalid response'}));if(!r.ok)throw new Error(j.error||'Could not adjust level');
      if(status)status.textContent='Level adjusted';await loadUsers();
    }catch(e){if(status)status.textContent=e.message||'Could not adjust level'}
  }
  function patch(){
    if(typeof renderUserControls!=='function'||renderUserControls.__levelPatched)return;
    const original=renderUserControls;
    renderUserControls=async function(userId){await original(userId);appendLevelControls(userId)};
    renderUserControls.__levelPatched=true;
    if(typeof openUser!=='undefined'&&openUser)appendLevelControls(openUser);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',patch);else patch();
})();
</script>`;
