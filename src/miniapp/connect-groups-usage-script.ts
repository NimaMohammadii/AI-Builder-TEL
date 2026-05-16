export const CONNECT_GROUPS_USAGE_SCRIPT = `
(function(){
  var loaded=false;
  var inFlight=null;
  function q(id){return document.getElementById(id)}
  function tgUser(){return window.Telegram&&window.Telegram.WebApp&&window.Telegram.WebApp.initDataUnsafe&&window.Telegram.WebApp.initDataUnsafe.user||{}}
  function ownerId(){return localStorage.getItem('ownerId')||String(tgUser().id||'')}
  function esc(v){return String(v||'').replace(/[&<>']/g,function(s){return {'&':'&amp;','<':'&lt;','>':'&gt;'}[s]||s})}
  function plusIcon(){return '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" style="pointer-events:none"><path d="M12 5v14M5 12h14"/></svg>'}
  function trashIcon(){return '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="pointer-events:none"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 14h10l1-14M9 7l1-3h4l1 3"/></svg>'}
  function initial(g){var t=String((g&&g.title)||(g&&g.username)||(g&&g.chatId)||'').trim();return t?t.charAt(0).toUpperCase():'#'}
  function ton(g){var n=Number(g&&g.tonSpentNano);var v=Number.isFinite(n)&&n>0?n/1000000000:Number(g&&g.tonSpent||0);if(!Number.isFinite(v)||v<0)v=0;return v.toFixed(4).replace(/0+$/,'').replace(/\\.$/,'')+' TON'}
  function empty(){return '<button type="button" data-action="add-main-group" class="notice connect-inner-glass" style="width:100%;min-height:92px;display:flex;align-items:center;gap:14px;text-align:left;color:rgba(255,255,255,.72)"><span class="connect-icon-glass" style="width:48px;height:48px;border-radius:999px;display:grid;place-items:center;color:#fff;flex:0 0 auto">'+plusIcon()+'</span><span><b style="display:block;color:#fff;margin-bottom:5px">Add Vexa to group</b><span>Add the main bot to a Telegram group from here.</span></span></button>'}
  function photoUrl(g){var u=ownerId();return g&&g.photoUrl?g.photoUrl:'/app/api/groups/'+encodeURIComponent(g.chatId)+'/photo?userId='+encodeURIComponent(u)+'&v='+encodeURIComponent(g.lastSeenAt||'')}
  function avatar(g){return '<div class="avatar-fallback" data-group-photo="'+esc(photoUrl(g))+'" style="overflow:hidden;position:relative"><span>'+esc(initial(g))+'</span></div>'}
  function attachPhotos(){document.querySelectorAll('[data-group-photo]').forEach(function(box){var url=box.getAttribute('data-group-photo');if(!url||box.getAttribute('data-photo-bound')==='1')return;box.setAttribute('data-photo-bound','1');var img=new Image();img.alt='';img.loading='lazy';img.style.cssText='width:100%;height:100%;object-fit:cover;border-radius:inherit;position:absolute;inset:0';img.onload=function(){var s=box.querySelector('span');if(s)s.style.display='none';box.appendChild(img)};img.onerror=function(){img.onload=null;img.onerror=null};img.src=url})}
  function row(g){return '<div class="bot-row connect-inner-glass">'+avatar(g)+'<div><strong>'+esc(g.title||g.chatId)+'</strong><small>Vexa • '+esc(g.type||'group')+'</small></div><div style="display:flex;align-items:center;gap:8px;margin-left:auto"><span class="connect-action-glass" style="height:36px;min-width:78px;border-radius:999px;color:rgba(255,255,255,.82);display:flex;align-items:center;justify-content:center;padding:0 10px;font-size:11px;font-weight:720;white-space:nowrap">'+esc(ton(g))+'</span><button class="connect-action-glass" type="button" data-action="leave-main-group" data-chat-id="'+esc(g.chatId)+'" aria-label="Leave group" style="width:36px;height:36px;border-radius:999px;color:rgba(255,255,255,.8);display:grid;place-items:center;padding:0">'+trashIcon()+'</button></div></div>'}
  async function api(path,opt){var r=await fetch(path,Object.assign({headers:{'content-type':'application/json'},cache:'no-store'},opt||{}));var j=await r.json().catch(function(){return{error:'Invalid response'}});if(!r.ok)throw new Error(j.error||'Request failed');return j}
  function markClaimPending(){sessionStorage.setItem('vexaGroupClaimPendingUntil',String(Date.now()+90000))}
  function shouldClaim(){return Number(sessionStorage.getItem('vexaGroupClaimPendingUntil')||0)>Date.now()}
  function clearClaimPending(){sessionStorage.removeItem('vexaGroupClaimPendingUntil')}
  async function claimGroups(groups){if(!shouldClaim())return;var uid=ownerId();if(!uid)return;var user=tgUser();var claimed=0;await Promise.all((groups||[]).map(function(g){if(!g||!g.chatId)return Promise.resolve();return api('/app/api/groups/'+encodeURIComponent(g.chatId)+'/payer',{method:'POST',body:JSON.stringify({userId:uid,username:user.username||'',firstName:user.first_name||''})}).then(function(r){if(r&&r.claimed)claimed++}).catch(function(){return null})}));if(claimed>0)clearClaimPending()}
  async function loadGroups(force){
    var box=q('homeGroups');
    if(!box)return;
    if(inFlight)return inFlight;
    if(loaded&&!force){attachPhotos();return}
    var uid=ownerId();
    if(!uid){box.innerHTML=empty();var no=q('groupsStatus');if(no)no.textContent='Login required';return}
    inFlight=(async function(){
      try{
        var data=await api('/app/api/bots/main/groups?userId='+encodeURIComponent(uid)+(shouldClaim()?'&claim=1':''));
        var groups=data.groups||[];
        await claimGroups(groups);
        if(shouldClaim()){
          data=await api('/app/api/bots/main/groups?userId='+encodeURIComponent(uid));
          groups=data.groups||[];
        }
        box.innerHTML=groups.length?groups.map(row).join(''):empty();
        attachPhotos();
        var st=q('groupsStatus');if(st)st.textContent=groups.length?String(groups.length)+' groups':'Auto-detected';
        loaded=true;
      }catch(e){
        box.innerHTML=empty();
        var er=q('groupsStatus');if(er)er.textContent='Could not load';
      }finally{
        inFlight=null;
      }
    })();
    return inFlight;
  }
  window.VexaLoadGroups=function(force){return loadGroups(Boolean(force))};
  document.addEventListener('click',function(e){
    var openConnect=e.target&&e.target.closest&&e.target.closest('[data-view="connect"]');
    if(openConnect){setTimeout(function(){loadGroups(false)},120);return}
    var refresh=e.target&&e.target.closest&&e.target.closest('[data-action="refresh"]');
    if(refresh){loaded=false;setTimeout(function(){loadGroups(true)},120);return}
    var add=e.target&&e.target.closest&&e.target.closest('[data-action="add-main-group"]');
    if(add){markClaimPending();return}
    var leave=e.target&&e.target.closest&&e.target.closest('[data-action="leave-main-group"]');
    if(leave){var chatId=leave.getAttribute('data-chat-id'),uid=ownerId();if(!chatId||!uid)return;api('/app/api/groups/'+encodeURIComponent(chatId)+'/leave',{method:'DELETE',body:JSON.stringify({userId:uid})}).then(function(){loaded=false;return loadGroups(true)}).catch(function(){loaded=false;return loadGroups(true)})}
  },true);
})();
`;