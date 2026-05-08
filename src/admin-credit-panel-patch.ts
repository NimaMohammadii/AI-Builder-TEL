export const ADMIN_CREDIT_PANEL_PATCH = `<script>
(function(){
  function esc(v){return String(v??'').replace(/[&<>]/g,s=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[s]||s))}
  function labels(){return {home:'Home',connect:'Connect',flow:'TTS',plinko:'Plinko'}}
  function userFromList(userId){return (window.adminUsers||[]).find(u=>String(u.id)===String(userId))||{};}
  function patchStyles(){
    if(document.getElementById('adminCreditPatchCss'))return;
    var style=document.createElement('style');style.id='adminCreditPatchCss';
    style.textContent='.credit-tools{grid-template-columns:46px 1fr 46px!important}.credit-tools button{font-size:18px!important}.credit-tools input{text-align:center}.credit-current{display:flex;justify-content:space-between;gap:8px;color:rgba(255,255,255,.55);font-size:11px}.save-credit{display:none!important}';
    document.head.appendChild(style);
  }
  function replaceRenderer(){
    if(typeof window.renderUserControls!=='function')return false;
    window.renderUserControls=async function(userId){
      const panel=document.querySelector('[data-manage-panel="'+userId+'"]');if(!panel)return;
      panel.hidden=false;panel.innerHTML='<div class="mini-status">Loading controls...</div>';
      try{
        const r=await fetch('/admin/api/user-controls?userId='+encodeURIComponent(userId),{credentials:'same-origin'}),c=await r.json();
        if(!r.ok)throw new Error(c.error||'Could not load controls');
        const user=userFromList(userId);
        const credit=c.credit==null?Number(user.credit||0):Number(c.credit||0);
        const blocked=new Set(c.blockedSections||[]);
        const sectionLabels=labels();
        panel.innerHTML='<div class="credit-current"><span>Current credit</span><b data-credit-current>'+credit.toLocaleString('en-US')+'</b></div><div class="credit-tools"><button data-credit-minus type="button">−</button><input data-credit-value type="number" min="1" value="100" placeholder="Amount"/><button data-credit-plus type="button">+</button></div><div class="section-user-blocks">'+Object.keys(sectionLabels).map(id=>'<button class="section-block '+(blocked.has(id)?'blocked':'')+'" data-user-section="'+id+'">'+sectionLabels[id]+' '+(blocked.has(id)?'Blocked':'Open')+'</button>').join('')+'</div><p class="mini-status" data-user-status></p>';
        const amount=function(){return Math.max(1,Math.floor(Number(panel.querySelector('[data-credit-value]').value||0)||0))};
        panel.querySelector('[data-credit-plus]').onclick=()=>window.adjustCredit(userId,amount());
        panel.querySelector('[data-credit-minus]').onclick=()=>window.adjustCredit(userId,-amount());
        panel.querySelectorAll('[data-user-section]').forEach(btn=>btn.onclick=()=>window.blockSection(userId,btn.getAttribute('data-user-section'),!btn.classList.contains('blocked')));
      }catch(e){panel.innerHTML='<div class="mini-status">'+esc(e.message||'Could not load controls')+'</div>'}
    };
    return true;
  }
  patchStyles();
  var tries=0;
  var timer=setInterval(function(){tries++; if(replaceRenderer()||tries>40)clearInterval(timer);},100);
})();
</script>`;
