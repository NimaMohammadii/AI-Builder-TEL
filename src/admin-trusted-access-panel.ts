export const ADMIN_TRUSTED_ACCESS_PANEL_SCRIPT = `<script>
(function(){
  var guard=window.VexaAdminRequestGuard=window.VexaAdminRequestGuard||{inFlight:{},request:function(key,input,init){if(this.inFlight[key])return this.inFlight[key];var p=fetch(input,init).finally(function(){delete guard.inFlight[key]});this.inFlight[key]=p;return p}};
  var accessCache={};
  function requestJson(key,input,init){return guard.request(key,input,init).then(function(r){return r.json().then(function(j){return {ok:r.ok,json:j}})})}
  function userIdFromBox(box){
    if(!box)return '';
    var panelId=box.getAttribute('data-manage-panel');
    if(panelId)return panelId;
    var input=box.querySelector('[data-user-id],input[name="userId"]');
    if(input&&input.value)return input.value;
    var btn=box.querySelector('[data-user-section-block]');
    if(btn)return btn.getAttribute('data-user-section-block')||'';
    var root=box.closest('[data-user-id]');
    return root?root.getAttribute('data-user-id')||'':'';
  }
  function apply(on,off,enabled){on.classList.toggle('active',!!enabled);off.classList.toggle('active',!enabled)}
  function addControls(root){
    (root||document).querySelectorAll('.user-manage').forEach(function(box){
      if(box.hidden||box.querySelector('[data-trusted-access]'))return;
      var uid=userIdFromBox(box);if(!uid)return;
      var row=document.createElement('div');row.className='trusted-access-row';row.style.display='grid';row.style.gridTemplateColumns='1fr 1fr';row.style.gap='8px';row.style.marginTop='8px';
      var on=document.createElement('button');on.type='button';on.textContent='Trusted access';on.className='section-block';on.setAttribute('data-trusted-access',uid);
      var off=document.createElement('button');off.type='button';off.textContent='Normal access';off.className='section-block';off.setAttribute('data-normal-access',uid);
      row.appendChild(on);row.appendChild(off);box.appendChild(row);
      function save(enabled){
        var status=box.querySelector('.mini-status')||document.getElementById('usersStatus');if(status)status.textContent=enabled?'Saving trusted access...':'Saving normal access...';
        requestJson('POST:/admin/api/users/access-override:'+uid,'/admin/api/users/access-override',{method:'POST',credentials:'same-origin',headers:{'content-type':'application/json'},body:JSON.stringify({userId:uid,enabled:enabled})}).then(function(res){if(!res.ok)throw new Error(res.json&&res.json.error||'Could not save access');accessCache[uid]=!!res.json.trustedAccess;if(status)status.textContent=accessCache[uid]?'Trusted access enabled':'Trusted access disabled';apply(on,off,accessCache[uid])}).catch(function(e){if(status)status.textContent=e.message||'Could not save access'});
      }
      on.onclick=function(){save(true)};off.onclick=function(){save(false)};
      if(Object.prototype.hasOwnProperty.call(accessCache,uid)){apply(on,off,accessCache[uid]);return;}
      requestJson('GET:/admin/api/users/access-override:'+uid,'/admin/api/users/access-override?userId='+encodeURIComponent(uid),{credentials:'same-origin',cache:'no-store'}).then(function(res){if(!res.ok)throw new Error();accessCache[uid]=!!res.json.trustedAccess;apply(on,off,accessCache[uid])}).catch(function(){});
    });
  }
  document.addEventListener('click',function(ev){var t=ev.target&&ev.target.closest?ev.target.closest('[data-manage-user]'):null;if(t)requestAnimationFrame(function(){addControls(document)});},true);
  document.addEventListener('DOMContentLoaded',function(){addControls(document)});
  if(window.MutationObserver){new MutationObserver(function(muts){muts.forEach(function(m){Array.prototype.forEach.call(m.addedNodes||[],function(n){if(n.nodeType===1&&(n.matches&&n.matches('.user-manage')||n.querySelector&&n.querySelector('.user-manage')))addControls(n)})})}).observe(document.body,{childList:true,subtree:true})}
})();
</script>`;
