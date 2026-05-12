export const ADMIN_GROUP_AI_PROVIDER_PANEL_SCRIPT = `<script>
(function(){
  function $(id){return document.getElementById(id)}
  async function load(){
    var status=$('groupAiProviderStatus');
    try{
      if(status)status.textContent='Loading...';
      var r=await fetch('/admin/api/group-ai-provider',{credentials:'same-origin'});
      var j=await r.json();
      if(!r.ok)throw new Error(j.error||'Could not load');
      render(j.provider,j.model);
      if(status)status.textContent='Current: '+j.provider;
    }catch(e){if(status)status.textContent=e.message||'Could not load'}
  }
  async function save(provider){
    var status=$('groupAiProviderStatus');
    try{
      if(status)status.textContent='Saving...';
      var r=await fetch('/admin/api/group-ai-provider',{method:'POST',credentials:'same-origin',headers:{'content-type':'application/json'},body:JSON.stringify({provider:provider})});
      var j=await r.json();
      if(!r.ok)throw new Error(j.error||'Could not save');
      render(j.provider,j.provider==='grok'?'grok-4-1-fast-reasoning':'gpt');
      if(status)status.textContent='Saved: '+j.provider;
    }catch(e){if(status)status.textContent=e.message||'Could not save'}
  }
  function render(provider,model){
    var gpt=$('groupAiProviderGpt'),grok=$('groupAiProviderGrok'),badge=$('groupAiProviderBadge');
    if(gpt)gpt.className='ghost '+(provider==='gpt'?'active-provider':'');
    if(grok)grok.className='ghost '+(provider==='grok'?'active-provider':'');
    if(badge)badge.textContent=(provider==='grok'?'Grok':'GPT')+' · '+(model||'');
  }
  function init(){
    var section=$('sectionUsers');
    if(!section||$('groupAiProviderBox'))return;
    var box=document.createElement('div');
    box.id='groupAiProviderBox';
    box.innerHTML='<div class="row-title"><div><h2>Group AI</h2><p class="muted small-text">Choose which AI answers inside Telegram groups.</p></div><span id="groupAiProviderBadge" class="badge off">Loading</span></div><div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:10px 0"><button class="ghost" id="groupAiProviderGpt" type="button">GPT</button><button class="ghost" id="groupAiProviderGrok" type="button">Grok</button></div><p id="groupAiProviderStatus" class="status"></p>';
    box.style.cssText='padding:0 0 13px;margin:0 0 13px;border-bottom:1px solid rgba(255,255,255,.11)';
    section.insertBefore(box,section.firstChild);
    var style=document.createElement('style');style.textContent='.active-provider{background:#fff!important;color:#050505!important;border-color:#fff!important}';document.head.appendChild(style);
    $('groupAiProviderGpt').onclick=function(){save('gpt')};
    $('groupAiProviderGrok').onclick=function(){save('grok')};
    load();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
</script>`;
