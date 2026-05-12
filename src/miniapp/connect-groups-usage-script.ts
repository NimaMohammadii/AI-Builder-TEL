export const CONNECT_GROUPS_USAGE_SCRIPT = `
(function(){
  function q(id){return document.getElementById(id)}
  function esc(v){return String(v||'').replace(/[&<>']/g,function(s){return {'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;'}[s]||s})}
  function icon(name){
    if(name==='plus')return '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" style="pointer-events:none"><path d="M12 5v14M5 12h14"/></svg>';
    return '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="pointer-events:none"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 14h10l1-14M9 7l1-3h4l1 3"/></svg>';
  }
  function ton(g){
    var nano=Number(g&&g.tonSpentNano);
    var value=Number.isFinite(nano)&&nano>0?nano/1000000000:Number(g&&g.tonSpent||0);
    if(!Number.isFinite(value)||value<0)value=0;
    return value.toFixed(4).replace(/0+$/,'').replace(/\\.$/,'')+' TON';
  }
  function empty(){
    return '<button type="button" data-action="add-main-group" class="notice connect-inner-glass" style="width:100%;min-height:92px;display:flex;align-items:center;gap:14px;text-align:left;color:rgba(255,255,255,.72)"><span class="connect-icon-glass" style="width:48px;height:48px;border-radius:999px;display:grid;place-items:center;color:#fff;flex:0 0 auto">'+icon('plus')+'</span><span><b style="display:block;color:#fff;margin-bottom:5px">Add Vexa to group</b><span>Add the main bot to a Telegram group from here.</span></span></button>';
  }
  function row(g){
    return '<div class="bot-row connect-inner-glass"><div class="avatar-fallback"><span>#</span></div><div><strong>'+esc(g.title||g.chatId)+'</strong><small>Vexa • '+esc(g.type||'group')+'</small></div><div style="display:flex;align-items:center;gap:8px;margin-left:auto"><span class="connect-action-glass" style="height:36px;min-width:78px;border-radius:999px;color:rgba(255,255,255,.82);display:flex;align-items:center;justify-content:center;padding:0 10px;font-size:11px;font-weight:720;white-space:nowrap">'+esc(ton(g))+'</span><button class="connect-action-glass" type="button" data-action="leave-main-group" data-chat-id="'+esc(g.chatId)+'" aria-label="Leave group" style="width:36px;height:36px;border-radius:999px;color:rgba(255,255,255,.8);display:grid;place-items:center;padding:0">'+icon('trash')+'</button></div></div>';
  }
  async function api(path,opt){
    var response=await fetch(path,Object.assign({headers:{'content-type':'application/json'},cache:'no-store'},opt||{}));
    var json=await response.json().catch(function(){return{error:'Invalid response'}});
    if(!response.ok)throw new Error(json.error||'Request failed');
    return json;
  }
  async function loadGroups(){
    var box=q('homeGroups');
    if(!box)return;
    try{
      var data=await api('/app/api/bots/main/groups');
      var groups=data.groups||[];
      box.innerHTML=groups.length?groups.map(row).join(''):empty();
      var status=q('groupsStatus');
      if(status)status.textContent=groups.length?String(groups.length)+' groups':'Auto-detected';
    }catch(error){
      box.innerHTML=empty();
      var status=q('groupsStatus');
      if(status)status.textContent='Could not load';
    }
  }
  function refreshSoon(){
    [250,1000,2500,5000,8000].forEach(function(delay){setTimeout(loadGroups,delay)});
  }
  window.VexaLoadGroups=loadGroups;
  document.addEventListener('DOMContentLoaded',function(){setTimeout(loadGroups,50)});
  document.addEventListener('visibilitychange',function(){if(!document.hidden)refreshSoon()});
  window.addEventListener('focus',refreshSoon);
  window.addEventListener('pageshow',refreshSoon);
  document.addEventListener('click',function(event){
    var refresh=event.target&&event.target.closest&&event.target.closest('[data-action="refresh"]');
    if(refresh){refreshSoon();return}
    var addGroup=event.target&&event.target.closest&&event.target.closest('[data-action="add-main-group"]');
    if(addGroup)refreshSoon();
  },true);
  setTimeout(loadGroups,1000);
})();
`;