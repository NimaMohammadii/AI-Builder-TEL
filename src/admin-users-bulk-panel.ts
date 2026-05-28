export const ADMIN_USERS_BULK_PANEL_SCRIPT = `<script>
(function(){
  function init(){
    var section=document.getElementById('sectionUsers');
    if(!section||document.getElementById('bulkUsersBtn'))return;
    var row=section.querySelector('.row-title');
    var refresh=document.getElementById('refreshUsers');
    if(!row)return;
    var btn=document.createElement('button');
    btn.id='bulkUsersBtn';
    btn.className='bulk-users-btn';
    btn.type='button';
    btn.textContent='Delete all '+'users';
    btn.onclick=async function(){
      if(!confirm('Confirm user reset?'))return;
      var status=document.getElementById('usersStatus');
      if(status)status.textContent='Working...';
      try{
        var res=await fetch('/admin/api/users',{method:'DELETE',credentials:'same-origin'});
        var data=await res.json().catch(function(){return{error:'Invalid response'}});
        if(!res.ok)throw new Error(data.error||'Request failed');
        if(status)status.textContent='Users reset.';
        if(typeof loadUsers==='function')loadUsers();
      }catch(e){
        if(status)status.textContent=e.message||'Request failed';
      }
    };
    if(refresh&&refresh.parentNode)refresh.parentNode.insertBefore(btn,refresh);else row.appendChild(btn);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
  setTimeout(init,500);
})();
</script>`;