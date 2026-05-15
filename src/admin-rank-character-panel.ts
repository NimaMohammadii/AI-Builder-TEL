export const ADMIN_RANK_CHARACTER_PANEL_SCRIPT = `<script>
(function(){
  const ranks=['Rookie','Explorer','Pro','Elite','Master','Legend','Titan'];
  const allowed=['image/png','image/jpeg','image/webp','image/svg+xml'];
  function byId(id){return document.getElementById(id)}
  function ensurePanel(){
    const section=document.getElementById('sectionImages');
    if(!section||document.getElementById('rankCharacterPanel'))return;
    const wrap=document.createElement('div');
    wrap.id='rankCharacterPanel';
    wrap.className='image-current';
    wrap.style.display='block';
    wrap.innerHTML='<div><strong>Rank characters</strong><p class="muted small-text">Upload one character image for each rank. The current user rank image replaces the Home profile robot without changing its size.</p></div>';
    section.appendChild(wrap);
    ranks.forEach(function(rank){
      const block=document.createElement('div');
      block.className='image-current';
      block.innerHTML='<img id="rankCharacterPreview'+rank+'" src="/app/api/rank-character/'+rank+'.png?t='+Date.now()+'" alt=""/><div><strong>'+rank+'</strong><p class="muted small-text">Character for '+rank+' rank</p></div>';
      const input=document.createElement('input');
      input.id='rankCharacterFile'+rank;
      input.type='file';
      input.accept='image/png,image/jpeg,image/webp,image/svg+xml,.png,.jpg,.jpeg,.webp,.svg';
      const button=document.createElement('button');
      button.className='primary';
      button.type='button';
      button.textContent='Upload '+rank+' character';
      const status=document.createElement('p');
      status.id='rankCharacterStatus'+rank;
      status.className='status';
      button.onclick=function(){upload(rank)};
      section.appendChild(block);
      section.appendChild(input);
      section.appendChild(button);
      section.appendChild(status);
    });
  }
  async function upload(rank){
    const input=byId('rankCharacterFile'+rank);
    const status=byId('rankCharacterStatus'+rank);
    const preview=byId('rankCharacterPreview'+rank);
    if(!input||!input.files||!input.files[0]){status.textContent='Choose an image first.';return}
    if(!allowed.includes(input.files[0].type)){status.textContent='Only PNG, JPG, JPEG, SVG or WebP.';return}
    status.textContent='Uploading '+rank+' character...';
    const form=new FormData();
    form.append('rank',rank);
    form.append('image',input.files[0]);
    try{
      const response=await fetch('/admin/api/upload-rank-character',{method:'POST',body:form,credentials:'same-origin'});
      const json=await response.json().catch(()=>({error:'Upload failed'}));
      if(!response.ok){status.textContent=json.error||'Upload failed';return}
      if(preview)preview.src=(json.url||('/app/api/rank-character/'+rank+'.png'))+'&t='+Date.now();
      status.textContent=rank+' character uploaded.';
    }catch(error){status.textContent='Upload failed.'}
  }
  function esc(v){return String(v==null?'':v).replace(/[&<>]/g,function(s){return {'&':'&amp;','<':'&lt;','>':'&gt;'}[s]||s})}
  function cleanUserId(userId){return String(userId||'').replace(/[^0-9A-Za-z_-]/g,'')}
  function userById(userId){try{return (adminUsers||[]).find(function(u){return String(u.id)===String(userId)})||{}}catch(e){return {}}}
  function panelFor(userId){return document.querySelector('[data-manage-panel="'+cleanUserId(userId)+'"]')}
  function appendLevelControls(userId){
    const panel=panelFor(userId);if(!panel||panel.querySelector('[data-level-box]'))return;
    const user=userById(userId);
    const level=Math.max(1,Math.floor(Number(user.level)||1));
    const rank=String(user.rankName||'Rookie');
    const box=document.createElement('div');
    box.setAttribute('data-level-box','1');
    box.innerHTML='<div class="mini-status">Level: <b>'+level+'</b> · Rank: <b>'+esc(rank)+'</b></div><div class="credit-tools"><button type="button" data-level-adjust="-1">-1</button><input data-level-value type="number" min="1" max="999" value="'+level+'"/><button type="button" data-level-adjust="1">+1</button></div><button class="save-credit" type="button" data-level-save>Set level</button><p class="mini-status" data-level-status></p>';
    const first=panel.firstChild;if(first)panel.insertBefore(box,first);else panel.appendChild(box);
    box.querySelectorAll('[data-level-adjust]').forEach(function(btn){btn.onclick=function(){adjustLevel(userId,Number(btn.getAttribute('data-level-adjust')||0))}});
    box.querySelector('[data-level-save]').onclick=function(){setLevel(userId,Number(box.querySelector('[data-level-value]').value||1))};
  }
  async function setLevel(userId,level){
    const panel=panelFor(userId),status=panel&&panel.querySelector('[data-level-status]');if(status)status.textContent='Saving level...';
    try{
      const r=await fetch('/admin/api/users/level-set',{method:'POST',credentials:'same-origin',headers:{'content-type':'application/json'},body:JSON.stringify({userId:userId,level:level})});
      const j=await r.json().catch(function(){return {error:'Invalid response'}});if(!r.ok)throw new Error(j.error||'Could not save level');
      if(status)status.textContent='Level saved';await loadUsers();
    }catch(e){if(status)status.textContent=e.message||'Could not save level'}
  }
  async function adjustLevel(userId,deltaLevel){
    const panel=panelFor(userId),status=panel&&panel.querySelector('[data-level-status]');if(status)status.textContent='Adjusting level...';
    try{
      const r=await fetch('/admin/api/users/level-adjust',{method:'POST',credentials:'same-origin',headers:{'content-type':'application/json'},body:JSON.stringify({userId:userId,deltaLevel:deltaLevel})});
      const j=await r.json().catch(function(){return {error:'Invalid response'}});if(!r.ok)throw new Error(j.error||'Could not adjust level');
      if(status)status.textContent='Level adjusted';await loadUsers();
    }catch(e){if(status)status.textContent=e.message||'Could not adjust level'}
  }
  function patchLevelControls(){
    if(typeof renderUserControls!=='function'||renderUserControls.__levelPatched)return;
    const original=renderUserControls;
    renderUserControls=async function(userId){await original(userId);appendLevelControls(userId)};
    renderUserControls.__levelPatched=true;
  }
  function init(){ensurePanel();patchLevelControls()}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
</script>`;
