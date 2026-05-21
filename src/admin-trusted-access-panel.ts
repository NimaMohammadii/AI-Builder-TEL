export const ADMIN_TRUSTED_ACCESS_PANEL_SCRIPT = `<script>
(function(){
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
  function addControls(){
    document.querySelectorAll('.user-manage').forEach(function(box){
      if(box.querySelector('[data-trusted-access]'))return;
      var uid=userIdFromBox(box);if(!uid)return;
      var row=document.createElement('div');row.className='trusted-access-row';row.style.display='grid';row.style.gridTemplateColumns='1fr 1fr';row.style.gap='8px';row.style.marginTop='8px';
      var on=document.createElement('button');on.type='button';on.textContent='Trusted access';on.className='section-block';on.setAttribute('data-trusted-access',uid);
      var off=document.createElement('button');off.type='button';off.textContent='Normal access';off.className='section-block';off.setAttribute('data-normal-access',uid);
      row.appendChild(on);row.appendChild(off);box.appendChild(row);
      function save(enabled){
        var status=box.querySelector('.mini-status')||document.getElementById('usersStatus');if(status)status.textContent=enabled?'Saving trusted access...':'Saving normal access...';
        fetch('/admin/api/users/access-override',{method:'POST',credentials:'same-origin',headers:{'content-type':'application/json'},body:JSON.stringify({userId:uid,enabled:enabled})}).then(function(r){return r.json().then(function(j){return {ok:r.ok,json:j}})}).then(function(res){if(!res.ok)throw new Error(res.json&&res.json.error||'Could not save access');if(status)status.textContent=enabled?'Trusted access enabled':'Trusted access disabled';on.classList.toggle('active',enabled);off.classList.toggle('active',!enabled)}).catch(function(e){if(status)status.textContent=e.message||'Could not save access'});
      }
      on.onclick=function(){save(true)};off.onclick=function(){save(false)};
      fetch('/admin/api/users/access-override?userId='+encodeURIComponent(uid),{credentials:'same-origin',cache:'no-store'}).then(function(r){return r.json()}).then(function(j){on.classList.toggle('active',!!j.trustedAccess);off.classList.toggle('active',!j.trustedAccess)}).catch(function(){});
    });
  }
  document.addEventListener('click',function(){setTimeout(addControls,120);setTimeout(addControls,500)},true);
  document.addEventListener('DOMContentLoaded',function(){setTimeout(addControls,500);setTimeout(addControls,1400)});
  setInterval(addControls,1500);
})();
</script>`;
